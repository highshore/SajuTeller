import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './session-notes';

const SITE = 'https://sajuteller.vercel.app';
const turns = [{ side: 'reader', original: '올해 재운이 좋습니다.', translation: 'Your financial luck is good this year.' }];
const req = (body: unknown, { origin = SITE, auth = 'Bearer user-jwt' } = {}) => new Request(`${SITE}/api/session-notes`, {
  method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', ...(auth ? { Authorization: auth } : {}) }, body: JSON.stringify(body),
});
const good = { language: 'English', turns };
const summary = { title: 'Your reading', summary: 'A steady year with good money luck.', keyPoints: ['Money luck is strong', 'Spring is a good time', 'Stay patient at work'], terms: [{ term: 'Four Pillars', meaning: 'your birth chart' }] };
// first call = Supabase user check, second = OpenAI
const backend = (ai: unknown, userOk = true, aiStatus = 200) => {
  const f = vi.fn(async (url: string) => String(url).includes('/auth/v1/user')
    ? new Response('{}', { status: userOk ? 200 : 401 })
    : new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(ai) } }] }), { status: aiStatus }));
  vi.stubGlobal('fetch', f);
  return f;
};

beforeEach(() => {
  process.env.OPENAI_API_KEY = 'sk-test';
  process.env.VITE_SUPABASE_URL = 'https://example.supabase.co';
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY = 'pk';
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('POST /api/session-notes', () => {
  it('[AC-12b] accepts only signed-in, same-origin requests within the turn and size limits, before calling the AI', async () => {
    const f = backend(summary);
    expect((await POST(req(good, { origin: 'https://evil.example' }))).status).toBe(403);
    expect((await POST(req(good, { auth: '' }))).status).toBe(401);
    for (const body of [{ ...good, language: 'Korean' }, { ...good, turns: [] }, { ...good, turns: Array(81).fill(turns[0]) },
      { ...good, turns: Array(10).fill({ side: 'reader', original: 'x'.repeat(1999) }) }, { ...good, turns: [{ side: 'host', original: 'hi' }] }]) {
      expect((await POST(req(body))).status).toBe(400);
    }
    expect(f).not.toHaveBeenCalled();
    backend(summary, false);
    expect((await POST(req(good))).status).toBe(401);
  });
  it('[AC-12c] returns a title, summary and 3–6 key points, and stores nothing', async () => {
    const f = backend({ ...summary, extra: 'dropped' });
    const res = await POST(req(good));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(summary);
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    // only the user check and the model call: no database write
    expect(f.mock.calls.map(c => String(c[0]))).toEqual(['https://example.supabase.co/auth/v1/user', 'https://api.openai.com/v1/chat/completions']);
  });
  it('[AC-12c] reports incomplete AI output and provider errors as 502 without leaking details', async () => {
    backend({ title: 'x', summary: 'y', keyPoints: ['only one'] });
    expect((await POST(req(good))).status).toBe(502);
    backend(summary, true, 500);
    const res = await POST(req(good));
    expect(res.status).toBe(502);
    expect(await res.text()).not.toContain('choices');
  });
});
