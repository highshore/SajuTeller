import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './realtime-session';

const SITE = 'https://sajuteller.vercel.app';
const LONG_KEY = 'sk-test-long-term-key';
const req = (headers: Record<string, string> = {}) => new Request(`${SITE}/api/realtime-session`, { method: 'POST', headers: { Origin: SITE, ...headers } });
type Route = { user?: number; claim?: boolean | 'missing'; openai?: number };
const calls: { url: string; body?: string; auth?: string }[] = [];

function stub(route: Route) {
  vi.stubGlobal('fetch', vi.fn(async (url: string, init: RequestInit = {}) => {
    calls.push({ url, body: init.body as string, auth: new Headers(init.headers).get('Authorization') ?? undefined });
    if (url.endsWith('/auth/v1/user')) return new Response('{}', { status: route.user ?? 200 });
    if (url.includes('/rpc/sajuteller_claim_realtime_key')) return route.claim === 'missing' ? new Response('{}', { status: 404 }) : new Response(JSON.stringify(route.claim ?? true), { status: 200 });
    if (url.includes('/v1/realtime/client_secrets')) return route.openai && route.openai !== 200 ? new Response('{}', { status: route.openai }) : new Response(JSON.stringify({ value: 'ek_abc123', expires_at: 1900000000 }), { status: 200 });
    throw new Error(`unexpected ${url}`);
  }));
}

beforeEach(() => {
  calls.length = 0;
  process.env.OPENAI_API_KEY = LONG_KEY;
  process.env.VITE_SUPABASE_URL = 'https://example.supabase.co';
  process.env.VITE_SUPABASE_ANON_KEY = 'anon';
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('POST /api/realtime-session', () => {
  it('[AC-06b] [QA-06] issues a short-lived key with the model fixed by the server, never the long-term key', async () => {
    stub({});
    const res = await POST(req({ Authorization: 'Bearer user-jwt' }));
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(JSON.parse(text)).toMatchObject({ value: 'ek_abc123', model: 'gpt-realtime' });
    expect(text).not.toContain(LONG_KEY);
    const openai = calls.find(c => c.url.includes('client_secrets'))!;
    expect(JSON.parse(openai.body!).session.model).toBe('gpt-realtime');
    expect(JSON.parse(openai.body!).expires_after.seconds).toBe(120);
  });
  it('[AC-01b] [AC-06b] [QA-06] refuses signed-out and invalid sessions without asking OpenAI', async () => {
    stub({ user: 401 });
    expect((await POST(req())).status).toBe(401);
    expect((await POST(req({ Authorization: 'Bearer expired' }))).status).toBe(401);
    expect(calls.some(c => c.url.includes('client_secrets'))).toBe(false);
  });
  it('[AC-06b] [QA-06] refuses requests from other sites', async () => {
    stub({});
    expect((await POST(req({ Origin: 'https://evil.example', Authorization: 'Bearer user-jwt' }))).status).toBe(403);
    expect(calls).toHaveLength(0);
  });
  it('[AC-06b] limits keys per user per hour (429), checked as the caller', async () => {
    stub({ claim: false });
    const res = await POST(req({ Authorization: 'Bearer user-jwt' }));
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ code: 'rate_limited' });
    expect(calls.find(c => c.url.includes('/rpc/'))!.auth).toBe('Bearer user-jwt');
    expect(calls.some(c => c.url.includes('client_secrets'))).toBe(false);
  });
  it('[AC-06b] still serves signed-in users if the limit check is unavailable', async () => {
    stub({ claim: 'missing' });
    expect((await POST(req({ Authorization: 'Bearer user-jwt' }))).status).toBe(200);
  });
  it('[AC-06b] reports missing setup (503) and provider failures (502) without details', async () => {
    delete process.env.OPENAI_API_KEY;
    stub({});
    expect((await POST(req({ Authorization: 'Bearer user-jwt' }))).status).toBe(503);
    process.env.OPENAI_API_KEY = LONG_KEY;
    stub({ openai: 500 });
    const res = await POST(req({ Authorization: 'Bearer user-jwt' }));
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ code: 'session_failed' });
  });
});
