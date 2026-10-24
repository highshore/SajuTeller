import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './korean-name';

const SITE = 'https://sajuteller.vercel.app';
const good = { originalName: 'Emily Rhodes', gender: 'female', personality: ['kind', 'creative'] };
const req = (body: unknown, origin = SITE) => new Request(`${SITE}/api/korean-name`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const ai = (content: unknown) => vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(content) } }] }), { status: 200 })));

beforeEach(() => { process.env.OPENAI_API_KEY = 'sk-test'; vi.spyOn(console, 'error').mockImplementation(() => {}); });
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('POST /api/korean-name', () => {
  it('[AC-07a] rejects invalid input before calling the AI', async () => {
    const fetchSpy = vi.fn(); vi.stubGlobal('fetch', fetchSpy);
    for (const body of [{ ...good, originalName: '' }, { ...good, originalName: 'x'.repeat(81) }, { ...good, gender: 'other' }]) {
      expect((await POST(req(body))).status).toBe(400);
    }
    expect((await POST(req(good, 'https://evil.example'))).status).toBe(403);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
  it('[AC-07b] returns exactly the four name fields', async () => {
    ai({ name_hangul: '이민아', name_hanja: '李敏雅', romanization: 'Lee Min-a', meaning: 'clever and elegant', extra: 'dropped' });
    const res = await POST(req(good));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ name_hangul: '이민아', name_hanja: '李敏雅', romanization: 'Lee Min-a', meaning: 'clever and elegant' });
  });
  it('[AC-07b] rejects incomplete AI output and hides provider errors', async () => {
    ai({ name_hangul: '이민아' });
    expect((await POST(req(good))).status).toBe(502);
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{"error":"secret detail"}', { status: 500 })));
    const res = await POST(req(good));
    expect(res.status).toBe(502);
    expect(await res.text()).not.toContain('secret detail');
  });
  it('[AC-07a] reports missing setup as 503', async () => {
    delete process.env.OPENAI_API_KEY;
    expect((await POST(req(good))).status).toBe(503);
  });
});
