import { afterEach, describe, expect, it, vi } from 'vitest';
import { fitWithin, MAX_SIDE, readFace } from './face-reading';

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

describe('face reading client', () => {
  it('[AC-09d] shrinks the photo on the device to at most 640 px, keeping its shape', () => {
    expect(fitWithin(3024, 4032)).toEqual({ width: 480, height: MAX_SIDE });
    expect(fitWithin(4000, 1000)).toEqual({ width: MAX_SIDE, height: 160 });
    expect(fitWithin(300, 200)).toEqual({ width: 300, height: 200 }); // never enlarged
  });
  it('[AC-09b] turns server answers into clear outcomes', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 422 })));
    await expect(readFace('data:image/jpeg;base64,AA', 'en')).rejects.toThrow('no_face');
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 400 })));
    await expect(readFace('data:image/jpeg;base64,AA', 'en')).rejects.toThrow('invalid_image');
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 502 })));
    await expect(readFace('data:image/jpeg;base64,AA', 'en')).rejects.toThrow('unavailable');
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('offline'); }));
    await expect(readFace('data:image/jpeg;base64,AA', 'en')).rejects.toThrow('unavailable');
  });
});
