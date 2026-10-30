import { useCallback, useEffect, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../../supabase';
import { channelName, newInvite, sealCaption, type CaptionTurn, type Invite } from './companion';

const HISTORY = 30;

/**
 * Host side of companion captions. While sharing, every finished turn is encrypted and broadcast to the
 * room; a companion who joins late receives the last 30 turns. Stopping closes the room.
 */
export function useCaptionShare(turns: CaptionTurn[]) {
  const [invite, setInvite] = useState<Invite | null>(null);
  const [viewers, setViewers] = useState(0);
  const [status, setStatus] = useState<'off' | 'connecting' | 'live' | 'error'>('off');
  const channelRef = useRef<RealtimeChannel | null>(null);
  const sentRef = useRef(new Set<string>());
  const turnsRef = useRef(turns);
  turnsRef.current = turns;

  const send = useCallback(async (event: 'caption' | 'history' | 'end', inv: Invite, payload: unknown) => {
    const ch = channelRef.current;
    if (!ch) return;
    await ch.send({ type: 'broadcast', event, payload: { room: inv.roomId, ...(payload as object) } });
  }, []);

  const sendHistory = useCallback(async (inv: Invite) => {
    const recent = turnsRef.current.slice(-HISTORY);
    const sealed = await Promise.all(recent.map(t => sealCaption(inv, t)));
    await send('history', inv, { items: sealed });
  }, [send]);

  const start = useCallback(() => {
    const inv = newInvite();
    sentRef.current = new Set(turnsRef.current.map(t => t.id));
    setInvite(inv);
    setStatus('connecting');
    const ch = supabase.channel(channelName(inv.roomId), { config: { broadcast: { self: false }, presence: { key: 'host' } } });
    channelRef.current = ch;
    ch.on('presence', { event: 'sync' }, () => {
      const state = ch.presenceState() as unknown as Record<string, { role?: string }[]>;
      setViewers(Object.entries(state).filter(([key, metas]) => key !== 'host' && metas.some(m => m.role === 'viewer')).length);
    });
    ch.on('presence', { event: 'join' }, ({ key }) => { if (key !== 'host') void sendHistory(inv); });
    ch.subscribe(async s => {
      if (s === 'SUBSCRIBED') { setStatus('live'); await ch.track({ role: 'host' }); }
      else if (s === 'CHANNEL_ERROR' || s === 'TIMED_OUT') setStatus('error');
    });
  }, [sendHistory]);

  const stop = useCallback(() => {
    const ch = channelRef.current;
    if (ch && invite) void send('end', invite, {});
    if (ch) setTimeout(() => { void supabase.removeChannel(ch); }, 300);
    channelRef.current = null;
    setInvite(null);
    setViewers(0);
    setStatus('off');
  }, [invite, send]);

  // broadcast each newly finished turn once
  useEffect(() => {
    if (!invite || status !== 'live') return;
    for (const t of turns) {
      if (sentRef.current.has(t.id)) continue;
      sentRef.current.add(t.id);
      void sealCaption(invite, t).then(sealed => send('caption', invite, sealed));
    }
  }, [turns, invite, status, send]);

  useEffect(() => () => { const ch = channelRef.current; if (ch) void supabase.removeChannel(ch); }, []);

  return { invite, viewers, status, start, stop };
}
