-- [AC-05d] Booking request state transitions, as a signed-in traveller.
-- Run against a project with `supabase db query --linked -f supabase/tests/request_states.sql`.
-- Everything happens in one transaction that always rolls back (the final RAISE), so no data is kept.
-- Expected output: an error line starting with "PASS". Anything else is a failure.
--
-- States: requested → confirmed | declined (studio side / automated demo reply) · requested → cancelled (traveller)
-- Valid:   T4 create as requested · T6 requested→cancelled · T8 requested→confirmed/declined by the demo reply
-- Invalid: T1 create as confirmed · T5 traveller sets confirmed · T7 cancelled→requested
--          T9 finished→cancelled · T10 reply applied twice · T11 edit other columns
-- Boundaries: T2 requested_date today (ok) / yesterday (refused) · T3 guests = limit (ok) / limit + 1 (refused)
begin;
select set_config('request.jwt.claims', json_build_object('sub', (select id from auth.users order by created_at limit 1)::text, 'role', 'authenticated')::text, true);
select set_config('t.fail', '', true);
set local role authenticated;
do $$
declare
  sid uuid; vid uuid; lang text; lim int; r1 uuid; r2 uuid; st text; n int; refused boolean;
  today date := (now() at time zone 'Asia/Seoul')::date;
  fail text := '';
begin
  select s.id, v.id, l.language_code, least(s.max_guests, v.max_guests) into sid, vid, lang, lim
  from public.saju_studios s join public.studio_services v on v.studio_id = s.id join public.studio_languages l on l.studio_id = s.id
  where s.is_mock and s.status = 'active' and v.active and least(s.max_guests, v.max_guests) < 20
  order by s.slug, v.sort_order limit 1;
  if sid is null then raise exception 'FAIL no active sample studio to test with'; end if;

  -- T1 a traveller cannot create a request in any state but "requested"
  begin
    insert into public.sajuteller_booking_requests (studio_id, service_id, requested_date, requested_time, language, guests, notes, status)
    values (sid, vid, today + 3, '13:00', lang, 1, 'ac-05d', 'confirmed');
    fail := fail || 'T1 created as confirmed; ';
  exception when others then null; end;

  -- T2 boundary on the date: today is allowed, yesterday is refused
  begin
    insert into public.sajuteller_booking_requests (studio_id, service_id, requested_date, requested_time, language, guests, notes)
    values (sid, vid, today - 1, '13:00', lang, 1, 'ac-05d');
    fail := fail || 'T2 yesterday accepted; ';
  exception when others then null; end;
  begin
    insert into public.sajuteller_booking_requests (studio_id, service_id, requested_date, requested_time, language, guests, notes)
    values (sid, vid, today, '23:30', lang, 1, 'ac-05d');
  exception when others then fail := fail || 'T2 today refused (' || sqlerrm || '); '; end;

  -- T3 boundary on guests: the studio/service limit is allowed, one more is refused
  begin
    insert into public.sajuteller_booking_requests (studio_id, service_id, requested_date, requested_time, language, guests, notes)
    values (sid, vid, today + 3, '13:00', lang, lim, 'ac-05d');
  exception when others then fail := fail || 'T3 guests=' || lim || ' refused (' || sqlerrm || '); '; end;
  begin
    insert into public.sajuteller_booking_requests (studio_id, service_id, requested_date, requested_time, language, guests, notes)
    values (sid, vid, today + 3, '13:00', lang, lim + 1, 'ac-05d');
    fail := fail || 'T3 guests=' || (lim + 1) || ' accepted; ';
  exception when others then null; end;

  -- T4 a valid request starts as "requested"
  insert into public.sajuteller_booking_requests (studio_id, service_id, requested_date, requested_time, language, guests, notes)
  values (sid, vid, today + 3, '13:00', lang, 1, 'ac-05d-r1') returning id, status into r1, st;
  if st <> 'requested' then fail := fail || 'T4 started as ' || st || '; '; end if;

  -- T5 the traveller cannot confirm their own request
  refused := false;
  begin
    update public.sajuteller_booking_requests set status = 'confirmed' where id = r1;
    get diagnostics n = row_count; refused := n = 0;
  exception when others then refused := true; end;
  if not refused then fail := fail || 'T5 traveller confirmed; '; end if;

  -- T6 requested → cancelled is allowed
  update public.sajuteller_booking_requests set status = 'cancelled' where id = r1;
  get diagnostics n = row_count;
  if n <> 1 then fail := fail || 'T6 cancel refused; '; end if;

  -- T7 cancelled → requested never happens
  refused := false;
  begin
    update public.sajuteller_booking_requests set status = 'requested' where id = r1;
    get diagnostics n = row_count; refused := n = 0;
  exception when others then refused := true; end;
  select status into st from public.sajuteller_booking_requests where id = r1;
  if not refused or st <> 'cancelled' then fail := fail || 'T7 reopened to ' || st || '; '; end if;

  -- T11 a traveller can change only the status column
  begin
    update public.sajuteller_booking_requests set notes = 'edited' where id = r1;
    fail := fail || 'T11 notes edited; ';
  exception when others then null; end;

  -- second request for the automated reply (T8–T10)
  insert into public.sajuteller_booking_requests (studio_id, service_id, requested_date, requested_time, language, guests, notes)
  values (sid, vid, today + 4, '13:00', lang, 1, 'ac-05d-r2') returning id into r2;
  perform set_config('t.r2', r2::text, true);
  perform set_config('t.fail', fail, true);
end $$;
reset role;
-- Pretend the automated reply is due.
update public.sajuteller_booking_requests set demo_reply_at = now() - interval '1 second' where id = current_setting('t.r2')::uuid;
set local role authenticated;
do $$
declare r2 uuid := current_setting('t.r2')::uuid; st text; outcome text; n int; advanced int; refused boolean;
  fail text := current_setting('t.fail');
begin
  -- T8 requested → confirmed / declined by the demo reply
  advanced := public.sajuteller_advance_demo_requests();
  select status, demo_outcome into st, outcome from public.sajuteller_booking_requests where id = r2;
  if st not in ('confirmed', 'declined') or st <> outcome then fail := fail || 'T8 status ' || st || ' outcome ' || coalesce(outcome, 'null') || '; '; end if;

  -- T9 a finished request cannot be cancelled
  refused := false;
  begin
    update public.sajuteller_booking_requests set status = 'cancelled' where id = r2;
    get diagnostics n = row_count; refused := n = 0;
  exception when others then refused := true; end;
  if not refused then fail := fail || 'T9 finished request cancelled; '; end if;

  -- T10 the reply is applied once; finished requests are never touched again
  if public.sajuteller_advance_demo_requests() <> 0 then fail := fail || 'T10 advanced twice; '; end if;
  select status into outcome from public.sajuteller_booking_requests where id = r2;
  if outcome <> st then fail := fail || 'T10 status changed to ' || outcome || '; '; end if;

  if fail = '' then
    raise exception 'PASS request states: 11 checks (final demo status %)', st;
  end if;
  raise exception 'FAIL %', fail;
end $$;
rollback;
