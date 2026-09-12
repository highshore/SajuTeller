-- profiles table mirrors auth.users and stores app-specific fields
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  is_admin boolean not null default false,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- trigger to keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Guard: only service_role can change is_admin
create or replace function public.profiles_guard_admin()
returns trigger as $$
begin
  if TG_OP = 'UPDATE' then
    if new.is_admin is distinct from old.is_admin then
      if current_user <> 'service_role' then
        raise exception 'is_admin can only be changed by service role';
      end if;
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_profiles_guard_admin on public.profiles;
create trigger trg_profiles_guard_admin
before update on public.profiles
for each row execute function public.profiles_guard_admin();

-- RLS for profiles
alter table public.profiles enable row level security;

-- owner can read own profile
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
on public.profiles for select
using (auth.uid() = id);

-- owner can update own profile (is_admin protected by trigger)
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- allow insert own profile on sign up (via trigger or client)
drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self
on public.profiles for insert
with check (auth.uid() = id);

-- function to create profile after signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- location_reviews table to log user reviews
create table if not exists public.location_reviews (
  id bigserial primary key,
  location_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating int2 not null check (rating between 1 and 5),
  title text,
  body text,
  created_at timestamp with time zone not null default now()
);

-- RLS for reviews: anyone can read; only owner can insert/delete own; no update to keep integrity
alter table public.location_reviews enable row level security;
drop policy if exists reviews_select_all on public.location_reviews;
create policy reviews_select_all on public.location_reviews for select using (true);
drop policy if exists reviews_insert_own on public.location_reviews;
create policy reviews_insert_own on public.location_reviews for insert with check (auth.uid() = user_id);
drop policy if exists reviews_delete_own on public.location_reviews;
create policy reviews_delete_own on public.location_reviews for delete using (auth.uid() = user_id);

-- index for queries
create index if not exists idx_reviews_location on public.location_reviews (location_id);
create index if not exists idx_reviews_user on public.location_reviews (user_id);
