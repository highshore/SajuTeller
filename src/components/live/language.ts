// ALG-01 Zero-Config target language for live interpretation (REQ-06).
// Korean is the reader's side, so it is never the customer's target language.
export type CustomerLanguage = 'English' | 'Chinese' | 'Japanese' | 'Spanish';

const BY_CODE: Record<string, CustomerLanguage> = { en: 'English', zh: 'Chinese', ja: 'Japanese', es: 'Spanish' };

const BY_COUNTRY: Record<string, CustomerLanguage> = {
  US: 'English', GB: 'English', CA: 'English', AU: 'English', NZ: 'English', IE: 'English', ZA: 'English',
  CN: 'Chinese', TW: 'Chinese', HK: 'Chinese', SG: 'Chinese', MO: 'Chinese',
  JP: 'Japanese',
  ES: 'Spanish', MX: 'Spanish', AR: 'Spanish', CO: 'Spanish', PE: 'Spanish', VE: 'Spanish', CL: 'Spanish', EC: 'Spanish',
  BO: 'Spanish', PY: 'Spanish', UY: 'Spanish', CR: 'Spanish', PA: 'Spanish', CU: 'Spanish', DO: 'Spanish', HN: 'Spanish',
  NI: 'Spanish', SV: 'Spanish', GT: 'Spanish',
};

export type LanguageSource = 'profile' | 'country' | 'app' | 'default';

/**
 * Priority: 1) language the user chose in their profile, 2) their country,
 * 3) the language the app is shown in, 4) English.
 */
export function resolveTargetLanguage(input: { preferredLanguage?: string | null; countryCode?: string | null; appLocale?: string | null }): { language: CustomerLanguage; source: LanguageSource } {
  const preferred = input.preferredLanguage ? BY_CODE[input.preferredLanguage.toLowerCase()] : undefined;
  if (preferred) return { language: preferred, source: 'profile' };
  const country = input.countryCode ? BY_COUNTRY[input.countryCode.toUpperCase()] : undefined;
  if (country) return { language: country, source: 'country' };
  const app = input.appLocale ? BY_CODE[input.appLocale.toLowerCase()] : undefined;
  if (app) return { language: app, source: 'app' };
  return { language: 'English', source: 'default' };
}
