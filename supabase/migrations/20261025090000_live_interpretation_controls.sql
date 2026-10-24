-- Live interpretation controls (REQ-06, QA-01, QA-03, QA-06):
-- 1. An audit log of session keys and a per-user hourly limit, checked by /api/realtime-session.
-- 2. Per-session quality metrics (latency percentiles, turns, reconnects). No audio or text is stored.
begin;

create table public.sajuteller_realtime_key_log (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index sajuteller_realtime_key_log_user_created on public.sajuteller_realtime_key_log(user_id, created_at desc);
alter table public.sajuteller_realtime_key_log enable row level security;
revoke all on public.sajuteller_realtime_key_log from public, anon, authenticated;
grant select on public.sajuteller_realtime_key_log to authenticated;
grant all on public.sajuteller_realtime_key_log to service_role;
create policy key_log_read_own on public.sajuteller_realtime_key_log for select to authenticated using (user_id = (select auth.uid()));
comment on table public.sajuteller_realtime_key_log is 'One row per issued Realtime session key. Rows older than 30 days are removed on the next claim.';

-- Records a key for the caller if they are under the hourly limit. Returns false when over it.
create function public.sajuteller_claim_realtime_key(p_limit integer default 20) returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  recent integer;
begin
  if uid is null then return false; end if;
  perform pg_advisory_xact_lock(hashtext('realtime_key:' || uid::text));
  delete from public.sajuteller_realtime_key_log where user_id = uid and created_at < now() - interval '30 days';
  select count(*) into recent from public.sajuteller_realtime_key_log where user_id = uid and created_at > now() - interval '1 hour';
  if recent >= greatest(1, least(p_limit, 100)) then return false; end if;
  insert into public.sajuteller_realtime_key_log (user_id) values (uid);
  return true;
end $$;
revoke all on function public.sajuteller_claim_realtime_key(integer) from public, anon;
grant execute on function public.sajuteller_claim_realtime_key(integer) to authenticated;

create table public.sajuteller_live_session_metrics (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz not null default now(),
  turns integer not null check (turns between 0 and 10000),
  p50_ms integer check (p50_ms between 0 and 60000),
  p95_ms integer check (p95_ms between 0 and 60000),
  reconnects integer not null default 0 check (reconnects between 0 and 1000),
  target_language text check (target_language in ('English','Chinese','Japanese','Spanish')),
  created_at timestamptz not null default now(),
  check (ended_at >= started_at)
);
create index sajuteller_live_session_metrics_created on public.sajuteller_live_session_metrics(created_at desc);
alter table public.sajuteller_live_session_metrics enable row level security;
revoke all on public.sajuteller_live_session_metrics from public, anon, authenticated;
grant select on public.sajuteller_live_session_metrics to authenticated;
grant insert (started_at, ended_at, turns, p50_ms, p95_ms, reconnects, target_language) on public.sajuteller_live_session_metrics to authenticated;
grant all on public.sajuteller_live_session_metrics to service_role;
create policy live_metrics_insert_own on public.sajuteller_live_session_metrics for insert to authenticated with check (user_id = (select auth.uid()));
create policy live_metrics_read_own on public.sajuteller_live_session_metrics for select to authenticated using (user_id = (select auth.uid()));
comment on table public.sajuteller_live_session_metrics is 'Quality measurements per interpretation session (QA-01, QA-03). Contains no audio or transcript text.';

commit;
