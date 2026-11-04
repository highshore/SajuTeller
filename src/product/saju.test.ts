import { describe, expect, it } from 'vitest';
import { BRANCHES, chartFor, dayLift, hourPillar, pillarText, sparkFor, STEMS, weekAhead, type Chart, type Pillar } from './saju';

const pillar = (text: string): Pillar => ({ stem: STEMS.indexOf(text[0] as typeof STEMS[number]), branch: BRANCHES.indexOf(text[1] as typeof BRANCHES[number]) });
const chart = (day: string, hourBranch?: string): Chart => ({ year: pillar('甲子'), day: pillar(day), hour: hourBranch ? { stem: 0, branch: BRANCHES.indexOf(hourBranch as typeof BRANCHES[number]) } : null });
const pillars = (date: string, time?: string) => { const c = chartFor(date, time); return c && { year: pillarText(c.year), day: pillarText(c.day), hour: c.hour && pillarText(c.hour) }; };

describe('chartFor — reference dates', () => {
  it('[AC-14a] gives the same, documented pillars for known dates', () => {
    expect(pillars('1949-10-01')?.day).toBe('甲子'); // common reference: 甲子 day
    expect(pillars('2000-01-01')?.day).toBe('戊午');
    expect(pillars('1992-11-02')?.day).toBe('壬午');
    expect(pillars('2024-06-15')).toEqual(pillars('2024-06-15')); // deterministic
  });
});

// Boundary value analysis: the Saju year turns at Lichun (approximated as 4 February), not 1 January.
describe('year pillar — Lichun boundary', () => {
  it.each([
    ['1999-12-31', '己卯'], // last day of the solar year
    ['2000-01-01', '己卯'], // solar new year: Saju year does NOT change
    ['2000-02-03', '己卯'], // day before the boundary
    ['2000-02-04', '庚辰'], // boundary: new Saju year
    ['2000-02-05', '庚辰'], // day after
    ['2024-02-03', '癸卯'],
    ['2024-02-04', '甲辰'],
  ])('[AC-14b] %s is a %s year', (date, year) => {
    expect(pillars(date)?.year).toBe(year);
  });
});

// Boundary value analysis on the 2-hour blocks, which start at odd hours (23:00 = 子).
describe('hour pillar — block boundaries', () => {
  it.each([
    ['21:00', '亥'], ['22:59', '亥'], ['23:00', '子'], ['00:00', '子'], ['00:59', '子'],
    ['01:00', '丑'], ['02:59', '丑'], ['03:00', '寅'], ['11:00', '午'], ['12:59', '午'], ['13:00', '未'],
  ])('[AC-14c] %s falls in the %s hour', (time, branch) => {
    expect(pillars('2000-01-01', time)?.hour?.[1]).toBe(branch);
  });
  it('[AC-14c] the 子-hour stem follows 五鼠遁 for every day stem', () => {
    // 甲己 → 甲子, 乙庚 → 丙子, 丙辛 → 戊子, 丁壬 → 庚子, 戊癸 → 壬子
    expect(STEMS.map((_, dayStem) => STEMS[hourPillar(dayStem, 0).stem]).join('')).toBe('甲丙戊庚壬甲丙戊庚壬');
    expect(pillarText(hourPillar(STEMS.indexOf('戊'), 10))).toBe('丁巳');
  });
  it('[AC-14c] no time means no hour pillar', () => {
    expect(pillars('2000-01-01')?.hour).toBeNull();
  });
});

// Equivalence partitions (valid / invalid format / impossible calendar date) and their boundaries.
describe('chartFor — input validation', () => {
  it.each(['2000-01-01', '2000-12-31', '2024-02-29', '2000-02-29', '2026-04-30', '2026-01-31'])('[AC-14d] accepts the real date %s', date => {
    expect(chartFor(date)).not.toBeNull();
  });
  it.each([
    '', '2000-1-1', '20000101', '2000/01/01', 'abcd-ef-gh', // wrong format
    '2000-00-10', '2000-13-01', '2000-01-00', '2000-01-32', // month / day out of range
    '2026-02-29', '1900-02-29', '2026-02-30', '2026-04-31', // not on the calendar (found DEF-019)
  ])('[AC-14d] rejects %j', date => {
    expect(chartFor(date)).toBeNull();
  });
});

// Decision table for "Your spark" (day pillars only). Conditions:
//   C1 day-stem element relation: same / generating / controlling
//   C2 day-branch spouse palace:  六合 harmony / 六冲 clash / neutral
//   C3 day stems combine (天干合)
// controlling + clash + combine cannot occur: combining stems are 5 apart (opposite parity),
// clashing branches 6 apart (same parity), and a real pillar's stem and branch share parity.
describe('sparkFor — decision table', () => {
  it.each([
    // rule, A, B, C1, C2, C3, talk, trust, passion
    ['R1', '甲子', '甲子', 'same', 'neutral', 'N', 5, 3, 2],
    ['R2', '甲子', '乙丑', 'same', 'harmony', 'N', 5, 4, 3],
    ['R3', '甲子', '甲午', 'same', 'clash', 'N', 5, 2, 3],
    ['R4', '甲子', '丙寅', 'generating', 'neutral', 'N', 4, 4, 3],
    ['R5', '甲子', '丁丑', 'generating', 'harmony', 'N', 4, 5, 4],
    ['R6', '甲子', '壬午', 'generating', 'clash', 'N', 4, 3, 4],
    ['R7', '甲子', '戊辰', 'controlling', 'neutral', 'N', 2, 3, 4],
    ['R8', '甲子', '己巳', 'controlling', 'neutral', 'Y', 2, 3, 5],
    ['R9', '甲子', '辛丑', 'controlling', 'harmony', 'N', 2, 4, 5],
    ['R10', '甲子', '己丑', 'controlling', 'harmony', 'Y', 2, 4, 5], // 4 + 1 + 1 = 6, clamped to 5
    ['R11', '甲子', '庚午', 'controlling', 'clash', 'N', 2, 2, 5],
  ] as const)('[AC-14e] %s %s+%s (%s, %s, combine %s) → talk %i, trust %i, passion %i', (_r, a, b, _c1, _c2, _c3, talk, trust, passion) => {
    expect(sparkFor(chart(a), chart(b))).toEqual({ talk, trust, passion, everyday: null });
    expect(sparkFor(chart(b), chart(a))).toEqual({ talk, trust, passion, everyday: null }); // symmetric
  });
  it.each([
    // hour branches: 六合 → 5, 六冲 → 2, else by element: controlling → 3, same / generating → 4
    ['子', '丑', 'harmony', 5], ['子', '午', 'clash', 2], ['子', '辰', 'controlling', 3], ['子', '寅', 'generating', 4], ['子', '子', 'same', 4],
  ] as const)('[AC-14e] everyday: hours %s+%s (%s) → %i', (a, b, _why, everyday) => {
    expect(sparkFor(chart('甲子', a), chart('甲子', b)).everyday).toBe(everyday);
  });
  it('[AC-14e] everyday needs both birth times', () => {
    expect(sparkFor(chart('甲子', '子'), chart('甲子')).everyday).toBeNull();
    expect(sparkFor(chart('甲子'), chart('甲子', '子')).everyday).toBeNull();
  });
  it('[AC-14e] every score stays within 1–5 for all 3,600 day-pillar pairs', () => {
    const all = Array.from({ length: 60 }, (_, i) => ({ year: { stem: 0, branch: 0 }, day: { stem: i % 10, branch: i % 12 }, hour: null }));
    for (const a of all) for (const b of all) {
      const s = sparkFor(a, b);
      for (const v of [s.talk, s.trust, s.passion]) { expect(v).toBeGreaterThanOrEqual(1); expect(v).toBeLessThanOrEqual(5); }
    }
  });
});

// Boundary value analysis on the week-ahead tone: ≥3 plan · 1–2 easy · 0 steady · <0 space.
describe('weekAhead — tone thresholds', () => {
  it('[AC-14f] each day lift follows the table: feeds +2, same +1, controlled −1, otherwise 0', () => {
    // day element → person element (0 Wood … 4 Water)
    expect(dayLift(0, 1)).toBe(2); // Wood feeds Fire
    expect(dayLift(0, 0)).toBe(1);
    expect(dayLift(0, 2)).toBe(-1); // Wood controls Earth
    expect(dayLift(1, 0)).toBe(0); // the person feeds the day
    expect(dayLift(2, 0)).toBe(0); // the person controls the day
  });
  it('[AC-14f] the tone changes exactly at scores 3, 1, 0 and −1', () => {
    const tones = new Map<number, string>();
    for (let a = 0; a < 5; a++) for (let b = 0; b < 5; b++) {
      for (const day of weekAhead(new Date(2026, 0, 1), a, b, 60)) {
        expect(tones.get(day.score) ?? day.tone).toBe(day.tone); // one tone per score
        tones.set(day.score, day.tone);
      }
    }
    expect(Object.fromEntries([...tones].sort(([x], [y]) => x - y))).toEqual({ '-2': 'space', '-1': 'space', 0: 'steady', 1: 'easy', 2: 'easy', 3: 'plan', 4: 'plan' });
  });
  it('[AC-14f] walks real calendar days across month and leap-day boundaries', () => {
    const days = weekAhead(new Date(2028, 1, 27), 0, 0, 4).map(d => `${d.date.getMonth() + 1}/${d.date.getDate()}`);
    expect(days).toEqual(['2/27', '2/28', '2/29', '3/1']);
  });
});
