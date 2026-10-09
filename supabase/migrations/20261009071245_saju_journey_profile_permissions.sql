revoke all on public.sajuteller_user_consents from anon, authenticated;
grant select on public.sajuteller_user_consents to authenticated;
grant insert (user_id, policy_version) on public.sajuteller_user_consents to authenticated;
-- A traveler must never be able to promote their own role or reassign identity.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name, first_name, last_name, avatar_url, country_code, preferred_language, onboarding_completed) on public.profiles to authenticated;
revoke all on public.user_birth_profiles from anon, authenticated;
grant select, insert, update, delete on public.user_birth_profiles to authenticated;
revoke all on public.user_preferences from anon, authenticated;
grant select, insert, update on public.user_preferences to authenticated;

