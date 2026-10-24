// Retention policy for live interpretation transcripts (REQ-06):
// - Audio is never stored.
// - Text stays in this browser tab only (sessionStorage), so it survives a refresh or a dropped
//   connection, and is gone when the tab closes or the user clears it. Nothing goes to a server.
import type { ChatMessage } from './group-turns';

export const TRANSCRIPT_KEY = 'sajuteller-live-transcript-v1';
export const MAX_STORED_MESSAGES = 200;

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
const defaultStore = (): Store | null => { try { return typeof sessionStorage === 'undefined' ? null : sessionStorage; } catch { return null; } };

const isMessage = (m: unknown): m is ChatMessage => {
  const v = m as ChatMessage;
  return !!v && typeof v.id === 'string' && (v.role === 'user' || v.role === 'assistant') && typeof v.content === 'string' && typeof v.timestamp === 'number';
};

export function loadTranscript(store: Store | null = defaultStore()): ChatMessage[] {
  try {
    const parsed = JSON.parse(store?.getItem(TRANSCRIPT_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter(isMessage) : [];
  } catch {
    return [];
  }
}

export function saveTranscript(messages: readonly ChatMessage[], store: Store | null = defaultStore()) {
  if (!store) return;
  // Only finished text. Placeholders and any audio fields are dropped.
  const text = messages
    .filter(m => m.content && !m.content.startsWith('[음성'))
    .slice(-MAX_STORED_MESSAGES)
    .map(({ id, role, content, timestamp, type, isTranscription }) => ({ id, role, content, timestamp, type, isTranscription }));
  try {
    if (text.length) store.setItem(TRANSCRIPT_KEY, JSON.stringify(text));
    else store.removeItem(TRANSCRIPT_KEY);
  } catch {
    // Storage full or blocked: the transcript still shows, it just won't survive a refresh.
  }
}

export function clearTranscript(store: Store | null = defaultStore()) {
  try { store?.removeItem(TRANSCRIPT_KEY); } catch { /* nothing stored */ }
}
