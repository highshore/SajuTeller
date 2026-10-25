import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './face-reading';

const SITE = 'https://sajuteller.vercel.app';
const IMAGE = 'data:image/jpeg;base64,' + 'A'.repeat(4000);
const req = (body: unknown, origin = SITE) => new Request(`${SITE}/api/face-reading`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const full = {
  face_found: true, summary: 'Calm and steady.',
  zones: [{ zone: 'upper', reading: 'a' }, { zone: 'middle', reading: 'b' }, { zone: 'lower', reading: 'c' }],
  features: ['forehead', 'eyebrows', 'eyes', 'nose', 'mouth'].map(feature => ({ feature, reading: `${feature} reading` })),
  advice: 'Be patient.',
};
let sent: { body: string }[] = [];
const ai = (content: unknown, status = 200) => vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => {
  sent.push({ body: init.body as string });
  return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(content) } }] }), { status });
}));

beforeEach(() => { sent = []; process.env.OPENAI_API_KEY = 'sk-test'; });
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('POST /api/face-reading', () => {
  it('[AC-09a] rejects anything that is not a small JPEG/PNG/WebP photo, and other sites', async () => {
    const fetchSpy = vi.fn(); vi.stubGlobal('fetch', fetchSpy);
    for (const image of ['', 'not-an-image', 'data:image/gif;base64,AAAA', 'data:image/jpeg;base64,' + 'A'.repeat(1_700_000), 'data:image/jpeg;base64,AA"><script>']) {
      expect((await POST(req({ image }))).status).toBe(400);
    }
    expect((await POST(req({ image: IMAGE }, 'https://evil.example'))).status).toBe(403);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
  it('[AC-09b] returns a complete reading: summary, three zones, five features, advice', async () => {
    ai(full);
    const res = await POST(req({ image: IMAGE, language: 'ko' }));
    expect(res.status).toBe(200);
    const body = await res.json() as { zones: { zone: string }[]; features: { feature: string }[] };
    expect(body.zones.map((z: { zone: string }) => z.zone)).toEqual(['upper', 'middle', 'lower']);
    expect(body.features.map((f: { feature: string }) => f.feature)).toEqual(['forehead', 'eyebrows', 'eyes', 'nose', 'mouth']);
    expect(body).not.toHaveProperty('face_found');
  });
  it('[AC-09b] says so when there is no single clear face (422), and rejects incomplete readings (502)', async () => {
    ai({ face_found: false });
    expect((await POST(req({ image: IMAGE }))).status).toBe(422);
    ai({ ...full, features: full.features.slice(0, 4) });
    expect((await POST(req({ image: IMAGE }))).status).toBe(502);
  });
  it('[AC-09c] limits the reading to gwansang symbolism and asks for a low-detail image', async () => {
    ai(full);
    await POST(req({ image: IMAGE, language: 'ja' }));
    const request = JSON.parse(sent[0].body);
    const system = request.messages[0].content as string;
    for (const rule of ['attractiveness', 'age', 'ethnicity', 'health', 'never guess who the person is']) expect(system).toContain(rule);
    expect(system).toContain('Japanese');
    expect(request.messages[1].content[1].image_url.detail).toBe('low');
  });
  it('[AC-09d] never logs or returns the photo, even when the provider fails', async () => {
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{"error":"provider detail"}', { status: 500 })));
    const res = await POST(req({ image: IMAGE }));
    expect(res.status).toBe(502);
    const text = await res.text();
    expect(text).not.toContain('AAAA');
    expect(text).not.toContain('provider detail');
    expect(JSON.stringify(errors.mock.calls)).not.toContain('AAAA');
  });
  it('[AC-09a] reports missing setup as 503', async () => {
    delete process.env.OPENAI_API_KEY;
    expect((await POST(req({ image: IMAGE }))).status).toBe(503);
  });
});
