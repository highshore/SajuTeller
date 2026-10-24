import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateKoreanName } from './openai';

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('generateKoreanName', () => {
  it('[AC-07c] still gives the user a complete name when the server is unavailable', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 503 })));
    const name = await generateKoreanName({ originalName: 'Emily', gender: 'female', personality: ['kind'] });
    for (const field of ['name_hangul', 'name_hanja', 'romanization', 'meaning'] as const) expect(name[field]).toBeTruthy();
  });
});
