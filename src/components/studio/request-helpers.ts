import { languageNames } from '../../product/data';

// A language shown in its own script (English · 中文 · 日本語 · Español), as in the Figma facts table.
export function languageLabel(code: string) {
  try {
    const own = new Intl.DisplayNames([code], { type: 'language' }).of(code);
    if (own && own !== code) return own.charAt(0).toLocaleUpperCase(code) + own.slice(1);
  } catch { /* fall through */ }
  return languageNames[code] || code;
}

const intlLocale = (language: string) => language === 'zh' ? 'zh-CN' : language;
const utc = (iso: string) => new Date(`${iso}T00:00:00Z`);

export function nextDays(fromIso: string, count: number) {
  const start = utc(fromIso).getTime();
  return Array.from({ length: count }, (_, i) => new Date(start + i * 86400000).toISOString().slice(0, 10));
}
export function dayParts(iso: string, language: string) {
  const d = utc(iso);
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(intlLocale(language), { timeZone: 'UTC', ...o }).format(d);
  return { weekday: f({ weekday: 'short' }), day: f({ day: 'numeric' }), month: f({ month: 'long', year: 'numeric' }) };
}
export function shortDate(iso: string, language: string) {
  return new Intl.DateTimeFormat(intlLocale(language), { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short' }).format(utc(iso));
}
export function seoulNowTime() {
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date());
}

// Suggested request times. There is no availability data yet, so no slot is marked "full";
// only times that have already passed today (Seoul) are unavailable.
export const timeSlots = ['10:00', '11:30', '13:00', '14:30', '16:00', '17:30'] as const;

export type Draft = { serviceId: string; date: string; time: string; language: string; guests: number; birthDate: string; birthTime: string; message: string };
const draftKey = (studioId: string) => `sajuteller-request-draft:${studioId}`;
export function readDraft(studioId: string): Draft | null {
  try {
    const v = JSON.parse(sessionStorage.getItem(draftKey(studioId)) || 'null');
    return v && typeof v === 'object' && typeof v.date === 'string' && typeof v.time === 'string' ? v as Draft : null;
  } catch { return null; }
}
export function writeDraft(studioId: string, draft: Draft) {
  try { sessionStorage.setItem(draftKey(studioId), JSON.stringify(draft)); } catch { /* private mode: the sheet still works, the draft just isn't kept */ }
}
export function clearDraft(studioId: string) {
  try { sessionStorage.removeItem(draftKey(studioId)); } catch { /* ignore */ }
}

// Birth details have no column on booking requests, so they travel in the existing notes field.
export function composeNotes(message: string, birthDate: string, birthTime: string) {
  const birth = birthDate ? `Birth date: ${birthDate}${birthTime ? ` · Birth time: ${birthTime}` : ' · Birth time: unknown'}` : '';
  const body = message.trim();
  if (!birth) return body.slice(0, 2000);
  return `${birth}${body ? `\n\n${body}` : ''}`.slice(0, 2000);
}
