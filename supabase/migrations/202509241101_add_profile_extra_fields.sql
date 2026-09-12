-- Add extra profile fields used by UI; do not duplicate auth-managed phone/email
alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists gender char(1) check (gender in ('M','F','O') or gender is null),
  add column if not exists birthday date,
  add column if not exists birth_hour int2 check (birth_hour between 0 and 23),
  add column if not exists country text,
  add column if not exists bio text;

-- Keep signup trigger minimal (no phone/email/preferred_language duplication)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;
