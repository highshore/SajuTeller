begin;
create table public.sajuteller_notifications (
 id uuid primary key default gen_random_uuid(),
 category text not null default 'update' check(category in ('update','offer')),
 title text not null check(length(trim(title)) between 1 and 160),
 body text not null check(length(trim(body)) between 1 and 5000),
 translations jsonb not null default '{}'::jsonb check(jsonb_typeof(translations)='object'),
 action_path text check(action_path is null or (action_path ~ '^/[a-zA-Z0-9]' and action_path !~ '[\\[:cntrl:]]')),
 recipient_id uuid references auth.users(id) on delete cascade,
 status text not null default 'draft' check(status in ('draft','published')),
 published_at timestamptz,
 created_at timestamptz not null default now(),
 check(status<>'published' or published_at is not null)
);
create index sajuteller_notifications_published_idx on public.sajuteller_notifications(published_at desc) where status='published';
create index sajuteller_notifications_recipient_idx on public.sajuteller_notifications(recipient_id);
create table public.sajuteller_notification_reads (
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 notification_id uuid not null references public.sajuteller_notifications(id) on delete cascade,
 read_at timestamptz not null default now(),
 primary key(user_id,notification_id)
);
create index sajuteller_notification_reads_notification_idx on public.sajuteller_notification_reads(notification_id);
create table public.sajuteller_notification_preferences (
 user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
 offers_enabled boolean not null default true
);
alter table public.sajuteller_notifications enable row level security;
alter table public.sajuteller_notification_reads enable row level security;
alter table public.sajuteller_notification_preferences enable row level security;
revoke all on public.sajuteller_notifications,public.sajuteller_notification_reads,public.sajuteller_notification_preferences from public,anon,authenticated;
grant select,insert,update,delete on public.sajuteller_notifications to authenticated;
grant select,insert on public.sajuteller_notification_reads to authenticated;
grant select,insert,update on public.sajuteller_notification_preferences to authenticated;
grant all on public.sajuteller_notifications,public.sajuteller_notification_reads,public.sajuteller_notification_preferences to service_role;
-- profiles.role cannot be changed by authenticated users (existing column grants).
create policy notifications_admin on public.sajuteller_notifications for all to authenticated
 using(exists(select 1 from public.profiles where auth_user_id=(select auth.uid()) and role='admin'))
 with check(exists(select 1 from public.profiles where auth_user_id=(select auth.uid()) and role='admin'));
create policy notifications_recipient on public.sajuteller_notifications for select to authenticated
 using(status='published' and published_at<=now() and (recipient_id is null or recipient_id=(select auth.uid())));
create policy reads_own on public.sajuteller_notification_reads for select to authenticated using(user_id=(select auth.uid()));
create policy reads_insert_own on public.sajuteller_notification_reads for insert to authenticated
 with check(user_id=(select auth.uid()) and exists(select 1 from public.sajuteller_notifications n where n.id=notification_id and n.status='published' and n.published_at<=now() and (n.recipient_id is null or n.recipient_id=(select auth.uid()))));
create policy preferences_select_own on public.sajuteller_notification_preferences for select to authenticated using(user_id=(select auth.uid()));
create policy preferences_insert_own on public.sajuteller_notification_preferences for insert to authenticated with check(user_id=(select auth.uid()));
create policy preferences_update_own on public.sajuteller_notification_preferences for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
-- All RPCs run as the caller and retain RLS. Explicit recipient checks also apply to admin inboxes.
create function public.sajuteller_notification_feed(p_limit integer default 30,p_offset integer default 0)
 returns table(id uuid,category text,title text,body text,translations jsonb,action_path text,published_at timestamptz,read_at timestamptz)
 language sql stable security invoker set search_path='' as $$
 select n.id,n.category,n.title,n.body,n.translations,n.action_path,n.published_at,r.read_at
 from public.sajuteller_notifications n left join public.sajuteller_notification_reads r on r.notification_id=n.id and r.user_id=(select auth.uid())
 where n.status='published' and n.published_at<=now() and (n.recipient_id is null or n.recipient_id=(select auth.uid()))
 and (n.category<>'offer' or coalesce((select offers_enabled from public.sajuteller_notification_preferences where user_id=(select auth.uid())),true))
 order by n.published_at desc,n.id desc limit least(greatest(p_limit,1),100) offset greatest(p_offset,0);
 $$;
create function public.sajuteller_notification_unread_count() returns bigint
 language sql stable security invoker set search_path='' as $$
 select count(*) from public.sajuteller_notifications n where n.status='published' and n.published_at<=now()
 and (n.recipient_id is null or n.recipient_id=(select auth.uid()))
 and (n.category<>'offer' or coalesce((select offers_enabled from public.sajuteller_notification_preferences where user_id=(select auth.uid())),true))
 and not exists(select 1 from public.sajuteller_notification_reads r where r.notification_id=n.id and r.user_id=(select auth.uid()));
 $$;
create function public.sajuteller_notifications_mark_all_read() returns void
 language sql security invoker set search_path='' as $$
 insert into public.sajuteller_notification_reads(user_id,notification_id)
 select (select auth.uid()),n.id from public.sajuteller_notifications n where n.status='published' and n.published_at<=now()
 and (n.recipient_id is null or n.recipient_id=(select auth.uid()))
 and (n.category<>'offer' or coalesce((select offers_enabled from public.sajuteller_notification_preferences where user_id=(select auth.uid())),true))
 on conflict(user_id,notification_id) do nothing;
 $$;
revoke all on function public.sajuteller_notification_feed(integer,integer),public.sajuteller_notification_unread_count(),public.sajuteller_notifications_mark_all_read() from public,anon;
grant execute on function public.sajuteller_notification_feed(integer,integer),public.sajuteller_notification_unread_count(),public.sajuteller_notifications_mark_all_read() to authenticated;
commit;
