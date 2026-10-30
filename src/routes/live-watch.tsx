import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";
import { styled } from "styled-components";
import { supabase } from "../supabase";
import { useI18n } from "../i18n/i18n";
import { channelName, openCaption, parseInvite, type CaptionTurn } from "../components/live/companion";

// Companion captions (REQ-13): read-only, no account. The key comes from the #fragment and never
// leaves this browser; captions live in memory only and disappear when the page closes.

const Page = styled.div`
  min-height: 100dvh; display: grid; grid-template-rows: auto minmax(0, 1fr) auto;
  background: var(--st-paper); color: var(--st-ink); font-family: Inter, 'Noto Sans KR', system-ui, sans-serif;
  .ko { font-family: 'Noto Sans KR', sans-serif; word-break: keep-all; }
`;
const Bar = styled.header`
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: calc(14px + env(safe-area-inset-top)) 20px 14px; border-bottom: 1px solid var(--st-line);
  .brand { font: 600 18px/24px 'Cormorant Garamond', serif; letter-spacing: 1.5px; }
  .sub { font-size: 12px; line-height: 16px; color: var(--st-muted); margin-top: 2px; }
  .state { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--st-muted); }
  .state::before { content: ''; width: 7px; height: 7px; border-radius: 50%; background: var(--dot, var(--st-line)); }
`;
const List = styled.main`
  overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 18px;
  .turn { display: grid; gap: 6px; }
  .who { font-size: 12px; line-height: 16px; font-weight: 600; letter-spacing: 0.6px; color: var(--st-gold); text-transform: uppercase; }
  .main { font-size: 20px; line-height: 29px; font-weight: 600; overflow-wrap: anywhere; }
  .orig { font-size: 14px; line-height: 21px; color: var(--st-muted); overflow-wrap: anywhere; }
  .turn:last-child .main { font-size: 24px; line-height: 33px; }
  .empty { margin: auto 0; text-align: center; color: var(--st-muted); font-size: 15px; line-height: 22px; }
  .empty h1 { font: 600 28px/32px 'Cormorant Garamond', serif; color: var(--st-ink); margin-bottom: 10px; }
`;
const Foot = styled.footer`
  padding: 14px 20px calc(16px + env(safe-area-inset-bottom)); border-top: 1px solid var(--st-line);
  font-size: 12px; line-height: 17px; color: var(--st-muted); text-align: center;
  a { color: var(--st-ink); }
`;

export default function LiveWatch() {
  const { t } = useI18n();
  const { room } = useParams();
  const invite = useMemo(() => parseInvite(room, window.location.hash), [room]);
  const [turns, setTurns] = useState<CaptionTurn[]>([]);
  const [state, setState] = useState<"connecting" | "live" | "ended" | "error">(invite ? "connecting" : "error");
  const listRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!invite) return;
    const add = (items: CaptionTurn[]) => setTurns(prev => {
      const map = new Map(prev.map(x => [x.id, x]));
      for (const it of items) map.set(it.id, it);
      return [...map.values()].slice(-60);
    });
    const ch = supabase.channel(channelName(invite.roomId), { config: { broadcast: { self: false }, presence: { key: crypto.randomUUID() } } });
    ch.on("broadcast", { event: "caption" }, async ({ payload }) => { const c = await openCaption(invite, payload); if (c) add([c]); });
    ch.on("broadcast", { event: "history" }, async ({ payload }) => {
      const items = Array.isArray((payload as { items?: unknown[] })?.items) ? (payload as { items: unknown[] }).items.slice(0, 30) : [];
      const opened = (await Promise.all(items.map(i => openCaption(invite, i)))).filter((x): x is CaptionTurn => !!x);
      add(opened);
    });
    ch.on("broadcast", { event: "end" }, () => setState("ended"));
    ch.subscribe(async s => {
      if (s === "SUBSCRIBED") { setState("live"); await ch.track({ role: "viewer" }); }
      else if (s === "CHANNEL_ERROR" || s === "TIMED_OUT") setState("error");
    });
    return () => { void supabase.removeChannel(ch); };
  }, [invite]);

  useEffect(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; }, [turns]);

  const label = state === "live" ? t("Connected") : state === "ended" ? t("Sharing has ended") : state === "error" ? (invite ? t("Couldn’t connect. Check the link and try again.") : t("This caption link is not valid.")) : t("Connecting…");

  return (
    <Page>
      <Bar>
        <div>
          <div className="brand">SAJUTELLER</div>
          <div className="sub">{t("Live captions")}</div>
        </div>
        <span className="state" style={{ "--dot": state === "live" ? "#5fb987" : undefined } as CSSProperties} role="status">{label}</span>
      </Bar>
      <List ref={listRef} aria-live="polite">
        {turns.length === 0 ? (
          <div className="empty">
            <h1>{t("Follow along")}</h1>
            <p>{t("Captions appear here as the reader and the visitor speak.")}</p>
          </div>
        ) : turns.map(c => {
          // the companion reads the visitor's language first; Korean sits underneath
          const main = c.side === "reader" ? (c.translation || c.original) : c.original;
          const orig = c.side === "reader" ? c.original : c.translation;
          return (
            <article className="turn" key={c.id}>
              <span className="who">{c.side === "reader" ? t("Reader") : t("Visitor")}</span>
              <div className="main">{main}</div>
              {orig && orig !== main && <div className="orig ko" lang="ko">{orig}</div>}
            </article>
          );
        })}
      </List>
      <Foot>{t("End-to-end encrypted. Captions are not saved and disappear when you close this page.")} <Link to="/">SajuTeller</Link></Foot>
    </Page>
  );
}
