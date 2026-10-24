import { describe, expect, it } from 'vitest';
import { groupTurns, type ChatMessage } from './group-turns';

const m = (id: string, role: ChatMessage['role'], content: string, timestamp: number): ChatMessage => ({ id, role, content, timestamp, type: 'audio', isTranscription: role === 'user' });

describe('groupTurns (ALG-02)', () => {
  it('[AC-06c] pairs each utterance with its translation in the other language', () => {
    const groups = groupTurns([
      m('u1', 'user', '올해 재운이 좋습니다.', 1000),
      m('a1', 'assistant', 'Your financial luck is good this year.', 2000),
      m('u2', 'user', 'Thank you!', 9000),
      m('a2', 'assistant', '감사합니다!', 9800),
    ]);
    expect(groups.map(g => [g.user.id, g.assistant?.id, g.isComplete])).toEqual([['u1', 'a1', true], ['u2', 'a2', true]]);
  });
  it('[AC-06c] shows an utterance whose translation has not arrived yet as incomplete', () => {
    const groups = groupTurns([m('u1', 'user', '안녕하세요', 1000)]);
    expect(groups).toHaveLength(1);
    expect(groups[0].isComplete).toBe(false);
  });
});
