-- Saju Journey: private onboarding and immutable policy acceptance.
-- Existing studio data and booking-request behavior are preserved.
create table public.sajuteller_user_consents (
  user_id uuid not null references auth.users(id) on delete cascade,
  policy_version text not null default '2026-10-09' check (policy_version = '2026-10-09'),
  accepted_at timestamptz not null default now(),
  primary key (user_id, policy_version)
);
alter table public.sajuteller_user_consents enable row level security;
create policy consents_read_own on public.sajuteller_user_consents for select to authenticated using (user_id = (select auth.uid()));
create policy consents_accept_own on public.sajuteller_user_consents for insert to authenticated with check (user_id = (select auth.uid()));

