-- Request-to-book, not payment capture or an inventory hold.
create table public.sajuteller_booking_requests (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 studio_id uuid not null references public.saju_studios(id),
 service_id uuid not null references public.studio_services(id),
 requested_date date not null,
 requested_time time not null,
 language text not null check (language in ('en','ko','ja','zh','es','fr')),
 guests integer not null check (guests between 1 and 20),
 notes text not null default '' check (length(notes)<=2000),
 status text not null default 'requested' check (status in ('requested','confirmed','declined','cancelled')),
 created_at timestamptz not null default now()
);
alter table public.sajuteller_booking_requests enable row level security;
create index sajuteller_requests_user_created on public.sajuteller_booking_requests(user_id,created_at desc);
create policy requests_read_own on public.sajuteller_booking_requests for select to authenticated using (user_id=(select auth.uid()));
create policy requests_insert_own on public.sajuteller_booking_requests for insert to authenticated with check (
 user_id=(select auth.uid()) and status='requested' and requested_date >= (now() at time zone 'Asia/Seoul')::date
 and exists(select 1 from public.saju_studios s join public.studio_services v on v.studio_id=s.id
 where s.id=sajuteller_booking_requests.studio_id and v.id=sajuteller_booking_requests.service_id and s.status='active' and not s.is_mock and v.active and guests<=v.max_guests and guests<=s.max_guests)
 and exists(select 1 from public.studio_languages l where l.studio_id=sajuteller_booking_requests.studio_id and l.language_code=language)
);
create policy requests_cancel_own on public.sajuteller_booking_requests for update to authenticated using(user_id=(select auth.uid()) and status='requested') with check(user_id=(select auth.uid()) and status='cancelled');
revoke all on public.sajuteller_booking_requests from anon,authenticated;
grant select on public.sajuteller_booking_requests to authenticated;
grant insert(studio_id,service_id,requested_date,requested_time,language,guests,notes) on public.sajuteller_booking_requests to authenticated;
grant update(status) on public.sajuteller_booking_requests to authenticated;
grant all on public.sajuteller_booking_requests to service_role;

create table public.sajuteller_host_applications (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 business_name text not null check(length(business_name) between 2 and 160),
 neighborhood text not null check(length(neighborhood) between 2 and 160),
 contact_email text not null check(length(contact_email) between 5 and 254),
 languages text not null check(length(languages) between 2 and 200),
 introduction text not null check(length(introduction) between 20 and 3000),
 status text not null default 'submitted' check(status in ('submitted','in_review','approved','declined')),
 created_at timestamptz not null default now()
);
alter table public.sajuteller_host_applications enable row level security;
create index sajuteller_host_applications_user on public.sajuteller_host_applications(user_id);
create policy applications_read_own on public.sajuteller_host_applications for select to authenticated using(user_id=(select auth.uid()));
create policy applications_insert_own on public.sajuteller_host_applications for insert to authenticated with check(user_id=(select auth.uid()) and status='submitted');
revoke all on public.sajuteller_host_applications from anon,authenticated;
grant select on public.sajuteller_host_applications to authenticated;
grant insert(business_name,neighborhood,contact_email,languages,introduction) on public.sajuteller_host_applications to authenticated;
grant all on public.sajuteller_host_applications to service_role;
