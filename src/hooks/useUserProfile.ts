import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

interface UserProfile {
  id: string;
  full_name: string | null;
  country: string | null;
  preferred_language: string | null;
  first_name: string | null;
  last_name: string | null;
  gender: string | null;
  birthday: string | null;
  birth_hour: number | null;
  bio: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

// Country 코드를 언어로 매핑하는 함수
const getLanguageFromCountry = (country: string | null): string => {
  if (!country) return 'English';

  const countryLangMap: Record<string, string> = {
    // 영어권 국가들
    'US': 'English',
    'GB': 'English',
    'CA': 'English',
    'AU': 'English',
    'NZ': 'English',
    'IE': 'English',
    'ZA': 'English',

    // 중국어권 국가들
    'CN': 'Chinese',
    'TW': 'Chinese',
    'HK': 'Chinese',
    'SG': 'Chinese',
    'MO': 'Chinese',

    // 일본어
    'JP': 'Japanese',

    // 스페인어권 국가들
    'ES': 'Spanish',
    'MX': 'Spanish',
    'AR': 'Spanish',
    'CO': 'Spanish',
    'PE': 'Spanish',
    'VE': 'Spanish',
    'CL': 'Spanish',
    'EC': 'Spanish',
    'BO': 'Spanish',
    'PY': 'Spanish',
    'UY': 'Spanish',
    'CR': 'Spanish',
    'PA': 'Spanish',
    'CU': 'Spanish',
    'DO': 'Spanish',
    'HN': 'Spanish',
    'NI': 'Spanish',
    'SV': 'Spanish',
    'GT': 'Spanish',

    // 기타 국가들은 영어로 기본 설정
  };

  const upperCountry = country.toUpperCase();
  return countryLangMap[upperCountry] || 'English';
};

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customerLanguage, setCustomerLanguage] = useState<string>('English');

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        setLoading(true);
        setError(null);

        // 현재 로그인된 사용자 정보 가져오기
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setError('User not authenticated');
          setCustomerLanguage('English'); // 기본값
          return;
        }

        // 프로필 정보 가져오기
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          setError(profileError.message);
          setCustomerLanguage('English'); // 기본값
          return;
        }

        setProfile(profileData);

        // 언어 설정 우선순위:
        // 1순위: preferred_language (사용자가 직접 설정한 언어)
        // 2순위: country 기반 매핑 (자동 추론)
        // 3순위: 기본값 (English)
        let language: string;
        if (profileData.preferred_language) {
          language = profileData.preferred_language;
        } else {
          language = getLanguageFromCountry(profileData.country);
        }
        setCustomerLanguage(language);

        console.log('User profile loaded:', {
          country: profileData.country,
          preferredLanguage: profileData.preferred_language,
          finalLanguage: language,
          source: profileData.preferred_language ? 'preferred_language' : 'country_mapping'
        });

      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setCustomerLanguage('English'); // 기본값
      } finally {
        setLoading(false);
      }
    }

    fetchUserProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    customerLanguage,
    getLanguageFromCountry
  };
}

export default useUserProfile;