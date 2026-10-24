import { describe, expect, it } from 'vitest';
import { clearTranscript, loadTranscript, MAX_STORED_MESSAGES, saveTranscript, TRANSCRIPT_KEY } from './transcript-store';
import type { ChatMessage } from './group-turns';

const memory = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k), m }; };
const msg = (id: string, content: string, extra: Partial<ChatMessage> = {}): ChatMessage => ({ id, role: 'user', content, timestamp: Number(id.replace(/\D/g, '')) || 1, type: 'audio', ...extra });

describe('transcript retention', () => {
  it('[AC-06e] [QA-03] keeps the text so it survives a refresh or a dropped connection', () => {
    const store = memory();
    saveTranscript([msg('m1', '안녕하세요'), msg('m2', 'Hello', { role: 'assistant' })], store);
    expect(loadTranscript(store).map(m => m.content)).toEqual(['안녕하세요', 'Hello']);
  });
  it('[AC-06e] never stores audio or "speaking…" placeholders', () => {
    const store = memory();
    saveTranscript([msg('m1', '[음성 입력 중...]'), msg('m2', 'Hi', { audioData: new ArrayBuffer(8) })], store);
    const raw = JSON.parse(store.getItem(TRANSCRIPT_KEY)!);
    expect(raw).toHaveLength(1);
    expect(raw[0]).not.toHaveProperty('audioData');
  });
  it('[AC-06e] keeps only the latest messages and deletes everything on clear', () => {
    const store = memory();
    saveTranscript(Array.from({ length: MAX_STORED_MESSAGES + 5 }, (_, i) => msg(`m${i + 1}`, `line ${i}`)), store);
    expect(loadTranscript(store)).toHaveLength(MAX_STORED_MESSAGES);
    clearTranscript(store);
    expect(store.getItem(TRANSCRIPT_KEY)).toBeNull();
    expect(loadTranscript(store)).toEqual([]);
  });
  it('[AC-06e] ignores corrupted or foreign data instead of crashing', () => {
    const store = memory();
    store.setItem(TRANSCRIPT_KEY, '{not json');
    expect(loadTranscript(store)).toEqual([]);
    store.setItem(TRANSCRIPT_KEY, JSON.stringify([{ id: 1 }, msg('m1', 'ok')]));
    expect(loadTranscript(store).map(m => m.content)).toEqual(['ok']);
  });
});
