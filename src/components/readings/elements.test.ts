import { describe, expect, it } from 'vitest';
import { dayStem, relationOf } from './elements';

describe("today's element", () => {
  it('[AC-08a] comes from the 60-day calendar cycle and is stable for a date', () => {
    expect(dayStem(2000, 1, 1)).toMatchObject({ stem: '戊', element: 'Earth' }); // 2000-01-01 was 戊午
    expect(dayStem(2000, 1, 11)).toEqual(dayStem(2000, 1, 1)); // stems repeat every 10 days
    expect(dayStem(2026, 10, 25)).toEqual(dayStem(2026, 10, 25));
  });
  it('[AC-08b] relates two elements by the generating and controlling cycles', () => {
    expect(relationOf('Wood', 'Wood')).toBe('same');
    expect(relationOf('Wood', 'Fire')).toBe('feedsToday');
    expect(relationOf('Fire', 'Wood')).toBe('todayFeeds');
    expect(relationOf('Wood', 'Earth')).toBe('youShape');
    expect(relationOf('Earth', 'Wood')).toBe('todayPresses');
  });
});
