import { describe, expect, it } from 'vitest';
import { resolveTargetLanguage } from './language';

describe('resolveTargetLanguage (ALG-01)', () => {
  it('[AC-06a] uses the language the user chose in their profile first', () => {
    expect(resolveTargetLanguage({ preferredLanguage: 'ja', countryCode: 'US', appLocale: 'es' })).toEqual({ language: 'Japanese', source: 'profile' });
  });
  it('[AC-06a] falls back to the country, then the app language, then English', () => {
    expect(resolveTargetLanguage({ countryCode: 'mx' })).toEqual({ language: 'Spanish', source: 'country' });
    expect(resolveTargetLanguage({ countryCode: 'FR', appLocale: 'zh' })).toEqual({ language: 'Chinese', source: 'app' });
    expect(resolveTargetLanguage({})).toEqual({ language: 'English', source: 'default' });
  });
  it('[AC-06a] never targets Korean, even for a Korean profile', () => {
    expect(resolveTargetLanguage({ preferredLanguage: 'ko', countryCode: 'KR', appLocale: 'ko' }).language).toBe('English');
  });
});
