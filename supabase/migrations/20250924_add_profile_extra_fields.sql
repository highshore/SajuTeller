-- Add extra profile fields used by UI, avoid duplicating auth-managed phone/email
alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists gender char(1) check (gender in ('M','F','O') or gender is null),
  add column if not exists birthday date,
  add column if not exists birth_hour int2 check (birth_hour between 0 and 23),
  add column if not exists country text,
  add column if not exists preferred_language text check (preferred_language in ('en','ko','zh','ja','es') or preferred_language is null),
  add column if not exists bio text;

-- Update signup trigger to include preferred_language
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, preferred_language)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'preferred_language'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;
