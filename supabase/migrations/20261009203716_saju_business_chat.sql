create table public.sajuteller_studio_members (
 studio_id uuid not null references public.saju_studios(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(studio_id,user_id)
);
create index sajuteller_studio_members_user on public.sajuteller_studio_members(user_id);
alter table public.sajuteller_studio_members enable row level security;
create policy studio_members_read_own on public.sajuteller_studio_members for select to authenticated using(user_id=(select auth.uid()));
revoke all on public.sajuteller_studio_members from anon,authenticated;
grant select on public.sajuteller_studio_members to authenticated;
grant all on public.sajuteller_studio_members to service_role;

create table public.sajuteller_conversations (
 studio_id uuid not null references public.saju_studios(id) on delete cascade,
 customer_id uuid not null references auth.users(id) on delete cascade,
 channel_id text not null unique check(length(channel_id)<65),
 created_at timestamptz not null default now(),
 primary key(studio_id,customer_id)
);
create index sajuteller_conversations_customer on public.sajuteller_conversations(customer_id);
alter table public.sajuteller_conversations enable row level security;
create policy conversations_read_participant on public.sajuteller_conversations for select to authenticated using(
 customer_id=(select auth.uid()) or exists(select 1 from public.sajuteller_studio_members m where m.studio_id=sajuteller_conversations.studio_id and m.user_id=(select auth.uid()))
);
revoke all on public.sajuteller_conversations from anon,authenticated;
grant select on public.sajuteller_conversations to authenticated;
grant all on public.sajuteller_conversations to service_role;
