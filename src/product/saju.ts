// Pure Saju (Four Pillars) helpers for the free couple reading. No I/O, no randomness.
//
// What we compute and how:
// - Day pillar: sexagenary day cycle. index = (JDN + 49) mod 60, 0 = 甲子.
//     dayPillar(2000, 1, 1)  -> 戊午 (index 54)   [JDN 2451545]
//     dayPillar(1992, 11, 2) -> 壬午 (index 18)
//     dayPillar(1949, 10, 1) -> 甲子 (index 0, a common reference date)
// - Year pillar: the Saju year starts at Lichun (立春). We APPROXIMATE Lichun as 4 February
//   every year (the true moment falls on 3–5 Feb). Births on 3–5 Feb may therefore land in the
//   neighbouring year; a master checks this in a full reading. index = (solarYear - 4) mod 60.
//     yearPillar(2000, 1, 1) -> 己卯 (still the 1999 Saju year)
//     yearPillar(2000, 2, 4) -> 庚辰
// - Hour pillar (only when a time is given): 2-hour blocks starting 23:00 = 子.
//   The stem follows 五鼠遁: day stem 甲/己 -> 子 hour is 甲子, 乙/庚 -> 丙子, 丙/辛 -> 戊子,
//   丁/壬 -> 庚子, 戊/癸 -> 壬子. 23:00–23:59 is the 子 hour of the SAME calendar day (we do not
//   advance the day pillar; schools differ here).
//     hourPillar(dayStem 戊, 10:30) -> 丁巳
// - Month pillar is NOT computed: it needs exact solar-term (節氣) moments, which we don't model.
// - Clock time is used as-is (no true-solar-time / birthplace correction).

export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
export const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
export const ELEMENTS = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'] as const;
export const ELEMENT_HANJA = ['木', '火', '土', '金', '水'] as const;
export const BRANCH_ANIMALS = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'] as const;

export type Element = typeof ELEMENTS[number];
/** 0 Wood, 1 Fire, 2 Earth, 3 Metal, 4 Water */
export type ElementIndex = 0 | 1 | 2 | 3 | 4;

// Branch -> element: 寅卯 Wood, 巳午 Fire, 辰戌丑未 Earth, 申酉 Metal, 亥子 Water.
const BRANCH_ELEMENT: readonly ElementIndex[] = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];

export type Pillar = { stem: number; branch: number };

export const stemElement = (stem: number) => Math.floor(stem / 2) as ElementIndex; // 甲乙 Wood … 壬癸 Water
export const branchElement = (branch: number) => BRANCH_ELEMENT[branch];
export const isYang = (stem: number) => stem % 2 === 0;
export const pillarText = (p: Pillar) => `${STEMS[p.stem]}${BRANCHES[p.branch]}`;
const mod = (n: number, m: number) => ((n % m) + m) % m;
const fromIndex = (i: number): Pillar => ({ stem: i % 10, branch: i % 12 });

/** Julian Day Number of a Gregorian date (noon-based integer). 2000-01-01 -> 2451545. */
export function julianDay(y: number, m: number, d: number) {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}

export const dayCycleIndex = (y: number, m: number, d: number) => mod(julianDay(y, m, d) + 49, 60);
export const dayPillar = (y: number, m: number, d: number) => fromIndex(dayCycleIndex(y, m, d));

/** Saju year (Lichun approximated as 4 Feb). */
export const sajuYear = (y: number, m: number, d: number) => (m > 2 || (m === 2 && d >= 4) ? y : y - 1);
export const yearPillar = (y: number, m: number, d: number) => fromIndex(mod(sajuYear(y, m, d) - 4, 60));

/** 23:00–00:59 -> 0 (子), 01:00–02:59 -> 1 (丑) … */
export const hourBranch = (hour: number) => Math.floor(mod(hour + 1, 24) / 2);
export function hourPillar(dayStem: number, hour: number): Pillar {
  const branch = hourBranch(hour);
  return { stem: mod((dayStem % 5) * 2 + branch, 10), branch };
}

export type Chart = { year: Pillar; day: Pillar; hour: Pillar | null };

/** date "YYYY-MM-DD", optional time "HH:MM". Returns null for invalid input. */
export function chartFor(date: string, time?: string): Chart | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return null;
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const day = dayPillar(y, m, d);
  const tm = time ? /^(\d{2}):(\d{2})/.exec(time) : null;
  return { year: yearPillar(y, m, d), day, hour: tm ? hourPillar(day.stem, Number(tm[1])) : null };
}

/** Element counts across the pillars actually computed (stems + branches). */
export function elementCounts(chart: Chart) {
  const counts = [0, 0, 0, 0, 0];
  for (const p of [chart.year, chart.day, chart.hour]) {
    if (!p) continue;
    counts[stemElement(p.stem)] += 1;
    counts[branchElement(p.branch)] += 1;
  }
  return counts;
}

// Generating: Wood→Fire→Earth→Metal→Water→Wood. Controlling: Wood→Earth→Water→Fire→Metal→Wood.
export const generates = (a: number, b: number) => mod(a + 1, 5) === b;
export const controls = (a: number, b: number) => mod(a + 2, 5) === b;

export type ElementRelation = 'same' | 'aFeedsB' | 'bFeedsA' | 'aShapesB' | 'bShapesA';
export function elementRelation(a: number, b: number): ElementRelation {
  if (a === b) return 'same';
  if (generates(a, b)) return 'aFeedsB';
  if (generates(b, a)) return 'bFeedsA';
  return controls(a, b) ? 'aShapesB' : 'bShapesA';
}
// Examples: elementRelation(4 Water, 0 Wood) = 'aFeedsB'; elementRelation(0 Wood, 2 Earth) = 'aShapesB'.

// Spouse palace = the Day branches. 六合 pairs and 六冲 pairs (branch indices).
const SIX_HARMONY = [[0, 1], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7]];
const SIX_CLASH = [[0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11]];
const pairIn = (list: number[][], a: number, b: number) => list.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
export type BranchRelation = 'harmony' | 'clash' | 'neutral';
export function branchRelation(a: number, b: number): BranchRelation {
  if (pairIn(SIX_HARMONY, a, b)) return 'harmony';
  if (pairIn(SIX_CLASH, a, b)) return 'clash';
  return 'neutral';
}
// Examples: branchRelation(卯 3, 戌 10) = 'harmony'; branchRelation(子 0, 午 6) = 'clash'; 卯寅 = 'neutral'.

/** 天干合 stem combinations: 甲己, 乙庚, 丙辛, 丁壬, 戊癸 (stems five apart). */
export const stemsCombine = (a: number, b: number) => Math.abs(a - b) === 5;

export type Spark = { talk: number; trust: number; passion: number; everyday: number | null };
const clamp = (n: number) => Math.max(1, Math.min(5, n));

/**
 * "Your spark" — five-step bars, fully deterministic:
 *   Day-stem element relation sets the base
 *     generating (either way): talk 4, trust 4, passion 3
 *     same element:            talk 5, trust 3, passion 2
 *     controlling (either way): talk 2, trust 3, passion 4
 *   Day-branch spouse palace: 六合 trust +1, passion +1 · 六冲 trust −1, passion +1 · otherwise 0
 *   Day stems combine (天干合): passion +1
 *   Everyday life (needs BOTH hour pillars): hour branches 六合 -> 5, 六冲 -> 2,
 *     otherwise by hour-branch element relation: same or generating -> 4, controlling -> 3.
 *   Everything is clamped to 1..5.
 * Example: 癸卯 (Water) with 甲寅 (Wood): generating, 卯寅 neutral, 癸甲 no combine -> talk 4, trust 4, passion 3.
 */
export function sparkFor(a: Chart, b: Chart): Spark {
  const rel = elementRelation(stemElement(a.day.stem), stemElement(b.day.stem));
  const base = rel === 'same' ? [5, 3, 2] : rel === 'aFeedsB' || rel === 'bFeedsA' ? [4, 4, 3] : [2, 3, 4];
  const talk = base[0];
  let [, trust, passion] = base;
  const palace = branchRelation(a.day.branch, b.day.branch);
  if (palace === 'harmony') { trust += 1; passion += 1; }
  if (palace === 'clash') { trust -= 1; passion += 1; }
  if (stemsCombine(a.day.stem, b.day.stem)) passion += 1;
  let everyday: number | null = null;
  if (a.hour && b.hour) {
    const hb = branchRelation(a.hour.branch, b.hour.branch);
    const he = elementRelation(branchElement(a.hour.branch), branchElement(b.hour.branch));
    everyday = hb === 'harmony' ? 5 : hb === 'clash' ? 2 : he === 'aShapesB' || he === 'bShapesA' ? 3 : 4;
  }
  return { talk: clamp(talk), trust: clamp(trust), passion: clamp(passion), everyday };
}

/**
 * How a day's element meets one person's Day element (used for "You two this week"):
 *   day element generates them +2 · same +1 · they generate the day 0 · they control the day 0 · day controls them −1
 */
export function dayLift(dayEl: number, personEl: number) {
  if (generates(dayEl, personEl)) return 2;
  if (dayEl === personEl) return 1;
  if (controls(dayEl, personEl)) return -1;
  return 0;
}

export type WeekDay = { date: Date; pillar: Pillar; element: ElementIndex; score: number; tone: 'plan' | 'easy' | 'steady' | 'space' };
/**
 * Next `count` days from `start` (local calendar). tone by summed lift of both people:
 *   ≥3 plan · 1–2 easy · 0 steady · <0 space.
 */
export function weekAhead(start: Date, aEl: number, bEl: number, count = 7): WeekDay[] {
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const pillar = dayPillar(date.getFullYear(), date.getMonth() + 1, date.getDate());
    const element = stemElement(pillar.stem);
    const score = dayLift(element, aEl) + dayLift(element, bEl);
    const tone = score >= 3 ? 'plan' : score >= 1 ? 'easy' : score === 0 ? 'steady' : 'space';
    return { date, pillar, element, score, tone };
  });
}
