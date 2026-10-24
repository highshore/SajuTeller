import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useI18n } from '../i18n/i18n';
import { resolveTargetLanguage, type CustomerLanguage, type LanguageSource } from '../components/live/language';

interface UserProfile {
  id: string;
  display_name: string | null;
  country_code: string | null;
  preferred_language: string | null;
}

// Target language for live interpretation (ALG-01). profiles links to auth users through
// auth_user_id and stores ISO codes (country_code 'US', preferred_language 'en').
export function useUserProfile() {
  const { language: appLocale } = useI18n();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('id,display_name,country_code,preferred_language')
          .eq('auth_user_id', user.id)
          .maybeSingle();
        if (profileError) throw profileError;
        if (alive) setProfile(data);
      } catch (err) {
        if (alive) setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const resolved = resolveTargetLanguage({ preferredLanguage: profile?.preferred_language, countryCode: profile?.country_code, appLocale });
  const customerLanguage: CustomerLanguage = resolved.language;
  const languageSource: LanguageSource = resolved.source;
  return { profile, loading, error, customerLanguage, languageSource };
}

export default useUserProfile;
