import { describe, expect, it, vi } from 'vitest';
vi.mock('../../supabase', () => ({ supabase: {} }));
import { composeNotes, nextDays } from './request-helpers';

// The request's notes column is limited to 2,000 characters in the database
// (check (length(notes) <= 2000)), so the client must never send more.
describe('composeNotes', () => {
  it.each([[1999, 1999], [2000, 2000], [2001, 2000], [5000, 2000]] as const)('[AC-05c] a %i-character message is sent as %i characters', (length, sent) => {
    expect(composeNotes('m'.repeat(length), '', '')).toHaveLength(sent);
  });
  it('[AC-05c] keeps birth details first and still stops at 2,000 characters', () => {
    const notes = composeNotes('m'.repeat(3000), '1995-04-12', '07:30');
    expect(notes.startsWith('Birth date: 1995-04-12 · Birth time: 07:30\n\n')).toBe(true);
    expect(notes).toHaveLength(2000);
  });
  it('[AC-05c] says the birth time is unknown when only the date is given, and trims the message', () => {
    expect(composeNotes('  hello  ', '1995-04-12', '')).toBe('Birth date: 1995-04-12 · Birth time: unknown\n\nhello');
    expect(composeNotes('   ', '', '')).toBe('');
    expect(composeNotes('', '1995-04-12', '07:30')).toBe('Birth date: 1995-04-12 · Birth time: 07:30');
  });
});

describe('nextDays', () => {
  it('[AC-05c] lists consecutive calendar days across month, year and leap-day boundaries', () => {
    expect(nextDays('2028-02-28', 3)).toEqual(['2028-02-28', '2028-02-29', '2028-03-01']);
    expect(nextDays('2026-02-28', 2)).toEqual(['2026-02-28', '2026-03-01']);
    expect(nextDays('2026-12-31', 2)).toEqual(['2026-12-31', '2027-01-01']);
    expect(nextDays('2026-11-04', 0)).toEqual([]);
  });
});
