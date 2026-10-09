-- Integration check against the project's real RLS and onboarding RPC.
-- All synthetic rows are rolled back; this creates no persistent test accounts.
begin;
insert into auth.users (id,email,raw_user_meta_data) values
('00000000-0000-4000-9000-000000000001','saju-qa-one@example.invalid','{}'),
('00000000-0000-4000-9000-000000000002','saju-qa-two@example.invalid','{}');
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-9000-000000000001","role":"authenticated"}',true);
set local role authenticated;
select public.sajuteller_save_profile('QA traveler','en','1996-05-15','09:30',false,'Seoul','Asia/Seoul',true);
do $$
begin
 if (select count(*) from public.profiles) <> 1 then raise exception 'Profile isolation failed'; end if;
 if (select count(*) from public.user_birth_profiles) <> 1 then raise exception 'Birth profile not saved'; end if;
 if (select count(*) from public.sajuteller_user_consents) <> 1 then raise exception 'Consent not saved'; end if;
 begin
  update public.profiles set role='admin';
  raise exception 'Role escalation was allowed';
 exception when insufficient_privilege then null;
 end;
 begin
  perform public.sajuteller_save_profile('Bad timezone','en','1996-05-15',null,true,null,'not/a-zone',false);
  raise exception 'Invalid timezone was allowed';
 exception when raise_exception then
  if sqlerrm <> 'Choose a valid time zone' then raise; end if;
 end;
 if not exists(select 1 from public.profiles where display_name='QA traveler') then raise exception 'Atomic save failed'; end if;
end $$;
select public.sajuteller_save_profile('QA traveler updated','ja',null,null,true,null,'Asia/Tokyo',false);
do $$ begin
 if exists(select 1 from public.user_birth_profiles) then raise exception 'Birth removal failed'; end if;
 if (select count(*) from public.sajuteller_user_consents) <> 1 then raise exception 'Consent idempotency failed'; end if;
end $$;
reset role;
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-9000-000000000002","role":"authenticated"}',true);
set local role authenticated;
do $$ begin
 if exists(select 1 from public.sajuteller_user_consents) then raise exception 'Cross-user consent leak'; end if;
 if exists(select 1 from public.profiles where display_name='QA traveler updated') then raise exception 'Cross-user profile leak'; end if;
end $$;
reset role;
rollback;
select 'PASS: onboarding, ownership, immutable role, consent, atomic validation, birth removal' as verification;
