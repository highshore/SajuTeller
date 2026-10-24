-- [AC-05b] Demo requests: run against a project with `supabase db query --linked -f supabase/tests/demo_requests.sql`.
-- Everything happens in one transaction that always rolls back (the final RAISE), so no data is kept.
-- Expected output: an error line starting with "PASS". Anything else is a failure.
begin;
select set_config('request.jwt.claims', json_build_object('sub', (select id from auth.users order by created_at limit 1)::text, 'role', 'authenticated')::text, true);
set local role authenticated;
insert into public.sajuteller_booking_requests (studio_id, service_id, requested_date, requested_time, language, guests, notes)
select s.id, v.id, (now() at time zone 'Asia/Seoul')::date + 3, '13:00', l.language_code, 1, 'ac-05b-test'
from public.saju_studios s join public.studio_services v on v.studio_id = s.id join public.studio_languages l on l.studio_id = s.id
where s.is_mock and s.status = 'active' and v.active order by s.slug, v.sort_order limit 1;
reset role;
-- Pretend the reply is due.
update public.sajuteller_booking_requests set demo_reply_at = now() - interval '1 second' where notes = 'ac-05b-test';
update public.sajuteller_notifications set published_at = now() - interval '1 second'
  where id in (select demo_notification_id from public.sajuteller_booking_requests where notes = 'ac-05b-test');
set local role authenticated;
do $$
declare advanced int; r record; visible int; real_touched int;
begin
  advanced := public.sajuteller_advance_demo_requests();
  select is_demo, status, demo_outcome into r from public.sajuteller_booking_requests where notes = 'ac-05b-test';
  select count(*) into visible from public.sajuteller_notification_feed(20, 0) where title like 'Demo · %';
  select count(*) into real_touched from public.sajuteller_booking_requests where not is_demo and demo_outcome is not null;
  if advanced = 1 and r.is_demo and r.status in ('confirmed', 'declined') and r.status = r.demo_outcome and visible >= 1 and real_touched = 0 then
    raise exception 'PASS demo request marked, reply applied (%), notification visible, real requests untouched', r.status;
  end if;
  raise exception 'FAIL advanced=% is_demo=% status=% outcome=% visible=% real_touched=%', advanced, r.is_demo, r.status, r.demo_outcome, visible, real_touched;
end $$;
