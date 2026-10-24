import type { Studio } from '../../product/data';

// Short language labels as drawn in Figma ("EN · 中文 · 日本語 · ES").
const shortLanguage: Record<string, string> = { en: 'EN', ko: '한국어', zh: '中文', ja: '日本語', es: 'ES', fr: 'FR' };
export const languageShort = (code: string) => shortLanguage[code] || code.toUpperCase();

export const studioName = (s: Studio, language: string) => (language === 'ko' && s.name_ko ? s.name_ko : s.name);

/**
 * One honest line about language support, from studio_languages, grouped by who does the talking:
 * "Reader speaks: 한국어 · EN / Interpreter: 日本語 / AI interpretation: 中文".
 */
export function languageLine(s: Studio, t: (key: string) => string) {
  const langs = s.studio_languages || [];
  const group = (types: string[]) => langs.filter(l => types.includes(l.support_type)).map(l => languageShort(l.language_code)).join(' · ');
  return ([['Reader speaks', group(['native', 'conversational'])], ['Interpreter', group(['interpreter'])], ['AI interpretation', group(['ai_interpreter'])]] as const)
    .filter(([, list]) => list).map(([label, list]) => `${t(label)}: ${list}`).join(' / ');
}

/** "Bukchon · 4 min from Anguk" when station data exists, otherwise just the area. */
export function placeLine(s: Studio, t: (key: string) => string) {
  if (s.nearest_station && s.station_walk_minutes) {
    return `${s.neighborhood} · ${t('{minutes} min from {station}').replace('{minutes}', String(s.station_walk_minutes)).replace('{station}', s.nearest_station)}`;
  }
  return `${s.neighborhood}, ${t('Seoul')}`;
}

/** Compact price for map pins, e.g. ₩45K / ₩4.5만. */
export const compactMoney = (n: number, language: string) =>
  new Intl.NumberFormat(language === 'zh' ? 'zh-CN' : language, { style: 'currency', currency: 'KRW', notation: 'compact', maximumFractionDigits: 1 }).format(n);

/** First two Hangul characters for the typographic cover used only when a studio has no photo. */
export const coverGlyphs = (s: Studio) => (s.name_ko || s.name).replace(/\s+/g, '').slice(0, 2);

/** Studios with usable coordinates, with lat/lng aliases for the map helpers. */
export const locatedStudios = (studios: Studio[]) => studios
  .filter(s => Number.isFinite(s.latitude) && Math.abs(s.latitude) <= 90 && Number.isFinite(s.longitude) && Math.abs(s.longitude) <= 180)
  .map(s => ({ ...s, lat: s.latitude, lng: s.longitude }));
