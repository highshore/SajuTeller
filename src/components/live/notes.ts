// Reading notes (REQ-12): turns a finished session into a keepsake — paired original/translation lines,
// optionally with an AI summary — that the visitor copies or downloads. Nothing is stored on a server.
import { isKorean, type MessageGroup } from './group-turns';

export type NoteTurn = { side: 'reader' | 'visitor'; original: string; translation?: string };
export type ReadingSummary = { title: string; summary: string; keyPoints: string[]; terms: { term: string; meaning: string }[] };

export const NOTES_MAX_TURNS = 80;
export const NOTES_MAX_CHARS = 16000;

/** Completed groups only; the Korean speaker is the reader, the other language the visitor. */
export function turnsFromGroups(groups: MessageGroup[]): NoteTurn[] {
  return groups
    .filter(g => g.isComplete && g.assistant && g.user.content.trim())
    .map(g => ({
      side: isKorean(g.user.content) ? 'reader' as const : 'visitor' as const,
      original: g.user.content.trim(),
      translation: g.assistant!.content.trim() || undefined,
    }));
}

/** Keeps the most recent turns that fit the server limits. */
export function trimForSummary(turns: NoteTurn[]): NoteTurn[] {
  const out: NoteTurn[] = [];
  let chars = 0;
  for (let i = turns.length - 1; i >= 0 && out.length < NOTES_MAX_TURNS; i--) {
    const t = turns[i];
    const size = t.original.length + (t.translation?.length ?? 0);
    if (chars + size > NOTES_MAX_CHARS) break;
    chars += size;
    out.unshift(t);
  }
  return out;
}

export function notesMarkdown(turns: NoteTurn[], opts: { language: string; date: Date; record: 'both' | 'translation'; summary?: ReadingSummary | null; labels: { reader: string; visitor: string; title: string; transcript: string; keyPoints: string; terms: string } }): string {
  const lines: string[] = [];
  lines.push(`# ${opts.summary?.title || opts.labels.title}`);
  lines.push(`${opts.date.toISOString().slice(0, 10)} · 한국어 ⇄ ${opts.language}`);
  if (opts.summary) {
    lines.push('', opts.summary.summary, '', `## ${opts.labels.keyPoints}`);
    for (const p of opts.summary.keyPoints) lines.push(`- ${p}`);
    if (opts.summary.terms.length) {
      lines.push('', `## ${opts.labels.terms}`);
      for (const t of opts.summary.terms) lines.push(`- **${t.term}**: ${t.meaning}`);
    }
  }
  lines.push('', `## ${opts.labels.transcript}`);
  for (const t of turns) {
    const who = t.side === 'reader' ? opts.labels.reader : opts.labels.visitor;
    // the visitor reads their own language first: the reader's Korean is shown as its translation
    const main = t.side === 'reader' ? (t.translation ?? t.original) : t.original;
    const other = t.side === 'reader' ? t.original : t.translation;
    lines.push('', `**${who}**: ${main}`);
    if (opts.record === 'both' && other && other !== main) lines.push(`> ${other}`);
  }
  return lines.join('\n') + '\n';
}

/** Asks the server for a summary. The server keeps nothing; errors come back as user-facing messages. */
export async function requestSummary(turns: NoteTurn[], language: string, accessToken: string): Promise<ReadingSummary> {
  const res = await fetch('/api/session-notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ language, turns: trimForSummary(turns) }),
  });
  if (res.ok) return await res.json() as ReadingSummary;
  throw new Error(res.status === 401 ? 'Sign in to create reading notes.'
    : res.status === 429 ? 'You’ve made many summaries in a short time. Please try again later.'
    : 'We couldn’t summarise this session. You can still copy or save the transcript.');
}
