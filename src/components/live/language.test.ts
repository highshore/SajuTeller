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
  // Decision table: C1 profile language supported? C2 country mapped? C3 app language supported?
  // "N" uses a value from the invalid partition (Korean, unknown code, or missing).
  it.each([
    ['R1', 'ja', 'MX', 'zh', 'Japanese', 'profile'],
    ['R2', 'ja', 'MX', 'ko', 'Japanese', 'profile'],
    ['R3', 'ja', 'KR', 'zh', 'Japanese', 'profile'],
    ['R4', 'ja', null, null, 'Japanese', 'profile'],
    ['R5', 'ko', 'MX', 'zh', 'Spanish', 'country'],
    ['R6', 'fr', 'MX', null, 'Spanish', 'country'],
    ['R7', null, 'FR', 'zh', 'Chinese', 'app'],
    ['R8', 'ko', 'KR', 'ko', 'English', 'default'],
  ] as const)('[AC-06a] %s profile=%s country=%s app=%s → %s from %s', (_r, preferredLanguage, countryCode, appLocale, language, source) => {
    expect(resolveTargetLanguage({ preferredLanguage, countryCode, appLocale })).toEqual({ language, source });
  });
  it('[AC-06a] reads codes case-insensitively and treats empty values as missing', () => {
    expect(resolveTargetLanguage({ preferredLanguage: 'ES', countryCode: 'jp' })).toEqual({ language: 'Spanish', source: 'profile' });
    expect(resolveTargetLanguage({ preferredLanguage: '', countryCode: '', appLocale: '' })).toEqual({ language: 'English', source: 'default' });
  });
  it('[AC-06a] never targets Korean, even for a Korean profile', () => {
    expect(resolveTargetLanguage({ preferredLanguage: 'ko', countryCode: 'KR', appLocale: 'ko' }).language).toBe('English');
  });
});
