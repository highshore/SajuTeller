import { afterEach, describe, expect, it, vi } from 'vitest';
import { validDate } from './store';

afterEach(() => { vi.useRealTimers(); });

describe('validDate (couple birth dates)', () => {
  it('[AC-14d] accepts 1900-01-01 up to today, and only real calendar dates', () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 10, 4, 12)); // 4 Nov 2026, local time
    expect(['1900-01-01', '2000-02-29', '2026-11-04'].map(validDate)).toEqual([true, true, true]);
    // boundaries just outside, and dates that are not on the calendar (DEF-019)
    expect(['1899-12-31', '2026-11-05', '2026-02-29', '2026-02-30', '2026-04-31', '2026-4-1'].map(validDate)).toEqual([false, false, false, false, false, false]);
  });
});
