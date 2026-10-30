import { describe, expect, it } from 'vitest';
import { channelName, inviteUrl, newInvite, openCaption, parseInvite, sealCaption } from './companion';

const turn = { id: 't1', side: 'reader' as const, original: '올해 재운이 좋습니다.', translation: 'Your financial luck is good this year.' };

describe('companion captions', () => {
  it('[AC-13a] uses a random 96-bit room id and a 256-bit key that only travels in the #fragment', () => {
    const a = newInvite(); const b = newInvite();
    expect(a.roomId).toMatch(/^[A-Za-z0-9_-]{16}$/);
    expect(a.key).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(a.roomId).not.toBe(b.roomId);
    const url = inviteUrl('https://sajuteller.vercel.app', a);
    expect(url.split('#')[0]).not.toContain(a.key);
    expect(url.split('#')[1]).toBe(a.key);
    expect(channelName(a.roomId)).not.toContain(a.key);
    expect(parseInvite(a.roomId, '#' + a.key)).toEqual(a);
    expect(parseInvite('short', '#' + a.key)).toBeNull();
    expect(parseInvite(a.roomId, '#not-a-key')).toBeNull();
  });
  it('[AC-13b] encrypts captions before broadcast and rejects a wrong key or a tampered message', async () => {
    const inv = newInvite();
    const sealed = await sealCaption(inv, turn);
    expect(JSON.stringify(sealed)).not.toContain('재운');
    expect(JSON.stringify(sealed)).not.toContain('financial');
    expect(await openCaption(inv, sealed)).toEqual(turn);
    expect(await openCaption({ ...inv, key: newInvite().key }, sealed)).toBeNull();
    expect(await openCaption({ ...inv, roomId: newInvite().roomId }, sealed)).toBeNull();
    const flipped = sealed.data.slice(0, -2) + (sealed.data.endsWith('A') ? 'BB' : 'AA');
    expect(await openCaption(inv, { ...sealed, data: flipped })).toBeNull();
    expect(await openCaption(inv, { nope: true })).toBeNull();
  });
});
