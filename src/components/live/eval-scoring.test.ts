import { describe, expect, it } from 'vitest';
import { rightDirection, scoreRatings, termHits } from './eval-scoring';

describe('interpretation scoring', () => {
  it('[QA-02] counts a glossary term when any accepted rendering appears', () => {
    expect(termHits('Your Saju shows strong Wealth Luck this year', [['four pillars', 'saju'], ['financial luck', 'wealth luck']])).toEqual({ hit: 2, total: 2, missed: [] });
    expect(termHits('Your fortune is good', [['five elements']])).toEqual({ hit: 0, total: 1, missed: ['five elements'] });
  });
  it('[QA-02] checks the translation went the right way', () => {
    expect(rightDirection('재운이 좋습니다', 'Your financial luck is good')).toBe(true);
    expect(rightDirection('Thank you', '감사합니다')).toBe(true);
    expect(rightDirection('재운이 좋습니다', '재운이 좋습니다')).toBe(false);
    expect(rightDirection('Thank you', '')).toBe(false);
  });
  it('[QA-02] passes human ratings only when the mean is ≥ 4 and no line is ≤ 2', () => {
    expect(scoreRatings([{ id: 'a', rater1: 5, rater2: 4 }, { id: 'b', rater1: 4, rater2: 4 }]).pass).toBe(true);
    const bad = scoreRatings([{ id: 'a', rater1: 5, rater2: 5 }, { id: 'b', rater1: 2, rater2: 2 }, { id: 'c', rater1: 5, rater2: 2 }]);
    expect(bad.pass).toBe(false);
    expect(bad.lowLines).toEqual(['b']);
    expect(bad.disagreements).toEqual(['c']);
  });
});
