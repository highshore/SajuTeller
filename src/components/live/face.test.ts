import { describe, expect, it } from 'vitest';
import { faceView } from './face';
import type { MessageGroup } from './group-turns';

const msg = (id: string, role: 'user' | 'assistant', content: string) => ({ id, role, content, timestamp: 0, type: 'audio' as const });

describe('face-to-face view', () => {
  it('[AC-11a] shows the reader every turn in Korean and the visitor every turn in their language', () => {
    const groups: MessageGroup[] = [
      { user: msg('1', 'user', '올해 재운이 좋습니다.'), assistant: msg('1a', 'assistant', 'Your financial luck is good this year.'), isComplete: true },
      { user: msg('2', 'user', 'What about my career?'), assistant: msg('2a', 'assistant', '제 직업운은 어떤가요?'), isComplete: true },
      { user: msg('3', 'user', '내년 봄이 좋아요.'), isComplete: false },
    ];
    const v = faceView(groups);
    expect(v.reader.map(l => l.text)).toEqual(['올해 재운이 좋습니다.', '제 직업운은 어떤가요?', '내년 봄이 좋아요.']);
    expect(v.visitor.map(l => l.text)).toEqual(['Your financial luck is good this year.', 'What about my career?', '…']);
    expect(v.visitor[2].pending).toBe(true);
    expect(v.reader[0].own).toBe(true);
    expect(v.visitor[1].own).toBe(true);
    expect(faceView(groups, 1).reader).toHaveLength(1);
  });
});
