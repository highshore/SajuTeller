// Deterministic copy for the free couple reading. Every string is an English i18n key (see src/i18n/phrases/couple.ts).
import {
  ELEMENTS, BRANCH_ANIMALS, branchRelation, chartFor, elementCounts, elementRelation, sparkFor, stemElement,
  type BranchRelation, type Chart, type ElementRelation, type Spark,
} from '../../product/saju';
import type { CouplePerson } from './store';

export type Family = 'same' | 'feed' | 'shape';
export const familyOf = (rel: ElementRelation): Family => rel === 'same' ? 'same' : rel === 'aFeedsB' || rel === 'bFeedsA' ? 'feed' : 'shape';

export const SEAL: Record<Family, string> = { same: '比和', feed: '相生', shape: '相剋' };
export const BADGE: Record<Family, string> = { same: 'Same element', feed: 'Mutual growth', shape: 'Push and polish' };
export const HEADLINE: Record<Family, string> = { same: 'You speak the same language', feed: 'You feed each other', shape: 'You sharpen each other' };
export const REVEAL_LINE: Record<Family, string> = {
  same: '比和 bi-hwa — two {x} days, side by side.',
  feed: '相生 sang-saeng — {x} grows {y}.',
  shape: '相剋 sang-geuk — {x} shapes {y}.',
};
export const SUMMARY: Record<ElementRelation, string> = {
  same: 'Both {x}: you get each other quickly. Leave room for being different.',
  aFeedsB: '{x} grows {y}: you steady {b}, and {b} gives your care somewhere to go.',
  bFeedsA: '{x} grows {y}: {b} steadies you, and you give their care somewhere to go.',
  aShapesB: '{x} shapes {y}: you bring {b} structure, and {b} keeps you flexible.',
  bShapesA: '{x} shapes {y}: {b} brings you structure, and you keep them flexible.',
};

const BETWEEN: Record<Family, { harmony: string[]; flux: string[]; challenges: string[] }> = {
  feed: { harmony: ['Long talks that go somewhere', 'Shared love of a plan'], flux: ['Who leads, who follows', 'Who gives more, week to week'], challenges: ['Care that feels like control'] },
  same: { harmony: ['Understanding without explaining', 'Same pace, same priorities'], flux: ['Who makes the first move'], challenges: ['Sharing the same blind spot'] },
  shape: { harmony: ['Honest feedback that helps', 'Attraction that keeps things lively'], flux: ['Whose way of doing things wins'], challenges: ['Small corrections that pile up — say thanks out loud'] },
};
const PALACE_BETWEEN: Record<BranchRelation, ['harmony' | 'flux' | 'challenges', string]> = {
  harmony: ['harmony', 'Home feels easy'],
  neutral: ['flux', 'A home life you shape on purpose'],
  clash: ['challenges', 'Different rhythms at home — agree on routines'],
};

export const PALACE_TITLE: Record<BranchRelation, string> = { harmony: '六合 · A natural pair', neutral: 'No strong pull or push', clash: '六冲 · Opposites' };
export const PALACE_COPY: Record<BranchRelation, string> = {
  harmony: '{p} and {q} are a natural pair. Home feels easy, and small fights pass quickly.',
  neutral: '{p} meets {q}. No special pull or push — home feels like what you build together.',
  clash: '{p} and {q} sit opposite each other. Sparks at home: exciting, and worth agreeing on routines.',
};

const PLENTY = [
  'Plenty of Wood between you — ideas and fresh starts come easily.',
  'Plenty of Fire between you — warmth, fun and big feelings.',
  'Plenty of Earth between you — steady, loyal, slow to change.',
  'Plenty of Metal between you — clear standards and firm decisions.',
  'Plenty of Water between you — deep talks and quick adapting.',
];
const MISSING = [
  'Neither of you has Wood, the element of new starts. Try one new thing together each month.',
  'Neither of you has Fire, the element of warmth said out loud. Say the kind things you think.',
  'Neither of you has Earth, the element of routine. A small weekly ritual helps.',
  'Neither of you has Metal, the element that cuts and decides. Pick one person to make the final call on plans.',
  'Neither of you has Water, the element of rest. Leave quiet time in your plans.',
];
export const ALL_PRESENT = 'All five elements show up between you — a well-rounded mix.';

export const WEEK_TONE = {
  plan: ['Plan something', 'A {e} day lifts you both. Good for plans together.'],
  easy: ['Easy day', 'A {e} day sits well with you. Fine for time together.'],
  steady: ['Ordinary day', 'A {e} day is neutral for you two. Keep it simple.'],
  space: ['Give each other space', 'A {e} day asks more of you. Go gently and keep plans light.'],
} as const;

export type Reading = {
  a: Chart; b: Chart;
  aEl: number; bEl: number;
  relation: ElementRelation; family: Family;
  giver: number; taker: number;
  palace: BranchRelation;
  spark: Spark;
  countsA: number[]; countsB: number[];
  explained: string[];
  between: { harmony: string[]; flux: string[]; challenges: string[] };
};

export function readingFor(me: CouplePerson, them: CouplePerson): Reading | null {
  const a = chartFor(me.date, me.time || undefined);
  const b = chartFor(them.date, them.time || undefined);
  if (!a || !b) return null;
  const aEl = stemElement(a.day.stem), bEl = stemElement(b.day.stem);
  const relation = elementRelation(aEl, bEl);
  const family = familyOf(relation);
  // For the "{x} grows/shapes {y}" lines: the acting element first.
  const [giver, taker] = relation === 'bFeedsA' || relation === 'bShapesA' ? [bEl, aEl] : [aEl, bEl];
  const palace = branchRelation(a.day.branch, b.day.branch);
  const countsA = elementCounts(a), countsB = elementCounts(b);
  const totals = countsA.map((n, i) => n + countsB[i]);
  const top = totals.indexOf(Math.max(...totals));
  const missing = totals.indexOf(0);
  const explained = [PLENTY[top], missing >= 0 ? MISSING[missing] : ALL_PRESENT];
  const base = BETWEEN[family];
  const between = { harmony: [...base.harmony], flux: [...base.flux], challenges: [...base.challenges] };
  const [slot, line] = PALACE_BETWEEN[palace];
  between[slot].push(line);
  return { a, b, aEl, bEl, relation, family, giver, taker, palace, spark: sparkFor(a, b), countsA, countsB, explained, between };
}

export const elementName = (i: number) => ELEMENTS[i];
export const animalName = (branch: number) => BRANCH_ANIMALS[branch];
export const fill = (text: string, vars: Record<string, string>) => text.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');
