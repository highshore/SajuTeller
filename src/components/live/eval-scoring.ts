// Automatic scoring for the interpretation evaluation (QA-02). Human meaning scores are added on top.
import { isKorean } from './group-turns';

/** Each expected term is a list of acceptable renderings; a term counts if any rendering appears. */
export function termHits(output: string, expect: readonly (readonly string[])[]): { hit: number; total: number; missed: string[] } {
  const text = output.toLowerCase();
  const missed = expect.filter(options => !options.some(o => text.includes(o.toLowerCase()))).map(options => options[0]);
  return { hit: expect.length - missed.length, total: expect.length, missed };
}

/** Korean in must come out in the visitor's language; anything else must come out in Korean. */
export function rightDirection(input: string, output: string): boolean {
  if (!output.trim()) return false;
  return isKorean(input) ? !isKorean(output) : isKorean(output);
}

export type RaterRow = { id: string; rater1: number; rater2: number };

/** QA-02: mean of both raters ≥ 4.0 and no line averaged at 2 or below. Lines raters disagree on by 2+ are flagged. */
export function scoreRatings(rows: readonly RaterRow[]) {
  const valid = rows.filter(r => [r.rater1, r.rater2].every(v => Number.isFinite(v) && v >= 1 && v <= 5));
  const means = valid.map(r => (r.rater1 + r.rater2) / 2);
  const mean = means.length ? means.reduce((a, b) => a + b, 0) / means.length : null;
  return {
    rated: valid.length,
    mean,
    lowLines: valid.filter((_, i) => means[i] <= 2).map(r => r.id),
    disagreements: valid.filter(r => Math.abs(r.rater1 - r.rater2) >= 2).map(r => r.id),
    pass: mean !== null && mean >= 4 && means.every(m => m > 2),
  };
}
