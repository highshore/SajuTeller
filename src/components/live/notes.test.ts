import { describe, expect, it } from 'vitest';
import { NOTES_MAX_CHARS, notesMarkdown, trimForSummary, turnsFromGroups } from './notes';
import type { MessageGroup } from './group-turns';

const msg = (id: string, role: 'user' | 'assistant', content: string) => ({ id, role, content, timestamp: 0, type: 'audio' as const });
const groups: MessageGroup[] = [
  { user: msg('1', 'user', '올해 재운이 좋습니다.'), assistant: msg('1a', 'assistant', 'Your financial luck is good this year.'), isComplete: true },
  { user: msg('2', 'user', 'What about love?'), assistant: msg('2a', 'assistant', '연애운은요?'), isComplete: true },
  { user: msg('3', 'user', '잠시만요'), isComplete: false },
];
const labels = { reader: 'Reader', visitor: 'You', title: 'Reading notes', transcript: 'Conversation', keyPoints: 'Key points', terms: 'Saju terms' };

describe('reading notes', () => {
  it('[AC-12a] builds notes from finished turns; "translation only" leaves out the original lines', () => {
    const turns = turnsFromGroups(groups);
    expect(turns).toEqual([
      { side: 'reader', original: '올해 재운이 좋습니다.', translation: 'Your financial luck is good this year.' },
      { side: 'visitor', original: 'What about love?', translation: '연애운은요?' },
    ]);
    const both = notesMarkdown(turns, { language: 'English', date: new Date('2026-11-02T00:00:00Z'), record: 'both', labels });
    expect(both).toContain('**Reader**: Your financial luck is good this year.');
    expect(both).toContain('> 올해 재운이 좋습니다.');
    const only = notesMarkdown(turns, { language: 'English', date: new Date('2026-11-02T00:00:00Z'), record: 'translation', labels });
    expect(only).not.toContain('올해 재운이');
    const withSummary = notesMarkdown(turns, { language: 'English', date: new Date(), record: 'both', labels, summary: { title: 'Your reading', summary: 'A good year.', keyPoints: ['a', 'b', 'c'], terms: [{ term: 'Four Pillars', meaning: 'birth chart' }] } });
    expect(withSummary.startsWith('# Your reading')).toBe(true);
    expect(withSummary).toContain('- **Four Pillars**: birth chart');
  });
  it('[AC-12a] keeps only the most recent turns that fit the server limit', () => {
    const big = Array.from({ length: 200 }, (_, i) => ({ side: 'reader' as const, original: 'x'.repeat(300), translation: String(i) }));
    const trimmed = trimForSummary(big);
    expect(trimmed.length).toBeLessThanOrEqual(80);
    expect(trimmed.reduce((n, t) => n + t.original.length + (t.translation?.length ?? 0), 0)).toBeLessThanOrEqual(NOTES_MAX_CHARS);
    expect(trimmed[trimmed.length - 1].translation).toBe('199');
  });
});
