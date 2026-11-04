-- [AC-06b] Boundary values for the live-interpretation key limit (20 keys per user per hour).
-- Run against a project with `supabase db query --linked -f supabase/tests/key_limit.sql`.
-- Everything happens in one transaction that always rolls back (the final RAISE), so no data is kept.
-- Expected output: an error line starting with "PASS". Anything else is a failure.
begin;
select set_config('request.jwt.claims', json_build_object('sub', (select id from auth.users order by created_at limit 1)::text, 'role', 'authenticated')::text, true);
-- Start from an empty hour for this user (undone by the rollback).
delete from public.sajuteller_realtime_key_log where user_id = (select id from auth.users order by created_at limit 1);
set local role authenticated;
do $$
declare got boolean; fail text := '';
begin
  -- p_limit below 1 is raised to 1: the first key is allowed, the second refused
  if not public.sajuteller_claim_realtime_key(0) then fail := fail || 'key 1 with limit 0 refused; '; end if;
  if public.sajuteller_claim_realtime_key(0) then fail := fail || 'key 2 with limit 0 allowed; '; end if;
  -- with the real limit: keys 2..20 are allowed (key 1 is already logged), the 21st is refused
  for i in 2..20 loop
    if not public.sajuteller_claim_realtime_key(20) then fail := fail || 'key ' || i || ' refused; '; end if;
  end loop;
  if public.sajuteller_claim_realtime_key(20) then fail := fail || 'key 21 allowed; '; end if;
  if public.sajuteller_claim_realtime_key(19) then fail := fail || 'key 21 allowed under limit 19; '; end if;
  -- p_limit above 100 is capped at 100, so 21 < 100 is still allowed
  if not public.sajuteller_claim_realtime_key(101) then fail := fail || 'limit 101 refused at 21 keys; '; end if;
  if fail = '' then raise exception 'PASS key limit: keys 1–20 allowed, 21st refused, limit clamped to 1..100'; end if;
  raise exception 'FAIL %', fail;
end $$;
rollback;
