create or replace function public.sajuteller_save_profile(
  p_display_name text,
  p_language text,
  p_birth_date date default null,
  p_birth_time time default null,
  p_birth_time_unknown boolean default true,
  p_birth_city text default null,
  p_birth_timezone text default 'Asia/Seoul',
  p_accept_policies boolean default false
) returns uuid
language plpgsql security invoker set search_path = '' as $$
declare profile_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if length(trim(p_display_name)) not between 1 and 80 then raise exception 'Enter a name between 1 and 80 characters'; end if;
  if p_language not in ('en','ko','ja','zh','es') then raise exception 'Unsupported reading language'; end if;
  if p_birth_date is not null and (p_birth_date > current_date or p_birth_date < date '1900-01-01') then raise exception 'Enter a valid birth date'; end if;
  if length(coalesce(p_birth_city,'')) > 160 then raise exception 'Birthplace is too long'; end if;
  if not exists (select 1 from pg_catalog.pg_timezone_names where name=p_birth_timezone) then raise exception 'Choose a valid time zone'; end if;
  select id into profile_id from public.profiles where auth_user_id=auth.uid() for update;
  if profile_id is null then raise exception 'Profile missing. Please contact support.'; end if;
  if p_accept_policies then
    insert into public.sajuteller_user_consents(user_id,policy_version) values(auth.uid(),'2026-10-09') on conflict do nothing;
  end if;
  if not exists(select 1 from public.sajuteller_user_consents where user_id=auth.uid() and policy_version='2026-10-09') then
    raise exception 'Accept the required policies to continue';
  end if;
  update public.profiles set display_name=trim(p_display_name), preferred_language=p_language, onboarding_completed=true where id=profile_id;
  -- Only the current user's primary birth profile is replaced, in the same transaction.
  delete from public.user_birth_profiles where user_id=profile_id and is_primary;
  if p_birth_date is not null then
    insert into public.user_birth_profiles(user_id,label,relationship,birth_date,birth_time,birth_time_unknown,birth_city,birth_timezone,is_primary)
    values(profile_id,'Me','self',p_birth_date,case when p_birth_time_unknown then null else p_birth_time end,p_birth_time_unknown,nullif(trim(p_birth_city),''),p_birth_timezone,true);
  end if;
  return profile_id;
end;
$$;
revoke all on function public.sajuteller_save_profile(text,text,date,time,boolean,text,text,boolean) from public, anon;
grant execute on function public.sajuteller_save_profile(text,text,date,time,boolean,text,text,boolean) to authenticated;
-- Trigger function is not a client-callable endpoint.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
