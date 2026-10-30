// Companion captions (REQ-13): a friend at the table scans a QR code and follows the interpretation as
// captions on their own phone, no app or account needed. Captions are relayed as Supabase Realtime
// broadcast messages, which are not stored, and are end-to-end encrypted with AES-GCM: the key lives
// only in the link's #fragment, which browsers never send to any server.

export type CaptionTurn = { id: string; side: 'reader' | 'visitor'; original: string; translation?: string };
export type Invite = { roomId: string; key: string };
export type Sealed = { iv: string; data: string };

export const CAPTION_MAX_CHARS = 2000;
export const channelName = (roomId: string) => `live-caption:${roomId}`;

const toB64url = (bytes: Uint8Array) => {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const fromB64url = (s: string) => {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4));
  return Uint8Array.from(bin, c => c.charCodeAt(0));
};
const random = (n: number) => crypto.getRandomValues(new Uint8Array(n));

/** 96-bit room id (unguessable channel name) and 256-bit key. */
export function newInvite(): Invite {
  return { roomId: toB64url(random(12)), key: toB64url(random(32)) };
}

export const inviteUrl = (origin: string, invite: Invite) => `${origin}/live/watch/${invite.roomId}#${invite.key}`;

export function parseInvite(roomId: string | undefined, hash: string): Invite | null {
  const key = hash.replace(/^#/, '');
  if (!roomId || !/^[A-Za-z0-9_-]{16}$/.test(roomId) || !/^[A-Za-z0-9_-]{43}$/.test(key)) return null;
  return { roomId, key };
}

async function importKey(key: string) {
  return crypto.subtle.importKey('raw', fromB64url(key), 'AES-GCM', false, ['encrypt', 'decrypt']);
}

/** Encrypts one caption; the room id is bound as additional data so a message can't be replayed into another room. */
export async function sealCaption(invite: Invite, turn: CaptionTurn): Promise<Sealed> {
  const iv = random(12);
  const plain = new TextEncoder().encode(JSON.stringify(turn));
  const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: new TextEncoder().encode(invite.roomId) }, await importKey(invite.key), plain);
  return { iv: toB64url(iv), data: toB64url(new Uint8Array(data)) };
}

/** Returns null for a wrong key, a tampered message or anything that isn't a well-formed caption. */
export async function openCaption(invite: Invite, sealed: unknown): Promise<CaptionTurn | null> {
  try {
    const s = sealed as Sealed;
    if (typeof s?.iv !== 'string' || typeof s?.data !== 'string' || s.data.length > CAPTION_MAX_CHARS * 6) return null;
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64url(s.iv), additionalData: new TextEncoder().encode(invite.roomId) }, await importKey(invite.key), fromB64url(s.data));
    const t = JSON.parse(new TextDecoder().decode(plain)) as CaptionTurn;
    const ok = typeof t.id === 'string' && (t.side === 'reader' || t.side === 'visitor') && typeof t.original === 'string'
      && t.original.length <= CAPTION_MAX_CHARS && (t.translation === undefined || (typeof t.translation === 'string' && t.translation.length <= CAPTION_MAX_CHARS));
    return ok ? { id: t.id, side: t.side, original: t.original, translation: t.translation } : null;
  } catch {
    return null;
  }
}
