-- Add preferred_language column to profiles table
alter table public.profiles
  add column if not exists preferred_language text check (preferred_language in ('en','ko','zh','ja','es') or preferred_language is null);

-- Update signup trigger to include preferred_language when creating new profiles
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
