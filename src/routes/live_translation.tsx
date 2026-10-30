import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { styled, css, keyframes } from "styled-components";
import {
  ArrowsRightLeftIcon, ExclamationTriangleIcon, MicrophoneIcon, StopIcon, Cog6ToothIcon, QrCodeIcon,
  ChatBubbleLeftRightIcon, DevicePhoneMobileIcon, DocumentTextIcon, XMarkIcon,
} from "@heroicons/react/24/solid";
import { useI18n } from "../i18n/i18n";
import { useRealtimeAgent } from "../hooks/useRealtimeAgent";
import { useUserProfile } from "../hooks/useUserProfile";
import { groupTurns, isKorean, type MessageGroup } from "../components/live/group-turns";
import { faceView } from "../components/live/face";
import { glossaryFor, loadSettings, loadTerms, saveSettings, saveTerms, MAX_CUSTOM_TERMS, MAX_TERM_LENGTH, type CustomTerm, type LiveSettings } from "../components/live/glossary";
import { notesMarkdown, requestSummary, turnsFromGroups, type ReadingSummary } from "../components/live/notes";
import { useCaptionShare } from "../components/live/use-caption-share";
import { inviteUrl, type CaptionTurn } from "../components/live/companion";
import { encodeQr, qrSvgPath } from "../components/live/qr";
import { supabase } from "../supabase";

// Live interpretation: conversation list or face-to-face view, output & glossary settings,
// companion captions over an encrypted QR link, and reading notes after the session.

// Language names shown in their own language for the session bar (endonyms, not UI copy).
const ENDONYM: Record<string, string> = { English: "English", Chinese: "中文", Japanese: "日本語", Spanish: "Español" };
const LANG_CODE: Record<string, string> = { English: "en", Chinese: "zh", Japanese: "ja", Spanish: "es" };

const Page = styled.div`
  --live-ok: #5fb987;
  height: 100dvh;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  background: var(--st-paper);
  color: var(--st-ink);
  font-family: Inter, 'Noto Sans KR', system-ui, sans-serif;
  overflow: hidden;
  position: relative;
  .ko { font-family: 'Noto Sans KR', sans-serif; word-break: keep-all; }
`;

const Bar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: calc(12px + env(safe-area-inset-top)) 16px 12px;
  border-bottom: 1px solid var(--st-line);
  .pair { display: flex; align-items: center; gap: 6px; font-size: 16px; line-height: 22px; font-weight: 600; min-width: 0; white-space: nowrap; overflow: hidden; }
  .pair span:last-child { overflow: hidden; text-overflow: ellipsis; }
  .pair svg { width: 14px; height: 14px; color: var(--st-gold); flex: none; }
  .sub { font-size: 12px; line-height: 16px; color: var(--st-muted); margin-top: 2px; }
  .tools { display: flex; align-items: center; gap: 4px; flex: none; }
`;

const IconButton = styled.button<{ $on?: boolean }>`
  width: 38px; height: 38px; border-radius: 50%; flex: none;
  display: grid; place-items: center;
  border: 1px solid ${p => p.$on ? "var(--st-gold)" : "var(--st-line)"};
  background: ${p => p.$on ? "color-mix(in srgb, var(--st-gold) 18%, transparent)" : "transparent"};
  color: var(--st-ink); cursor: pointer; position: relative;
  svg { width: 18px; height: 18px; }
  .dot { position: absolute; top: 4px; right: 4px; width: 8px; height: 8px; border-radius: 50%; background: var(--live-ok); }
  &:focus-visible { outline: 2px solid var(--st-gold); outline-offset: 2px; }
`;

const BarAction = styled.button`
  flex: none; min-height: 38px; padding: 0 12px; border-radius: 999px;
  border: 1px solid var(--st-line); background: transparent; color: var(--st-ink);
  font: 600 14px/1 Inter, sans-serif; display: inline-flex; align-items: center; cursor: pointer; text-decoration: none;
  &:hover { background: var(--st-surface); }
  &:focus-visible { outline: 2px solid var(--st-gold); outline-offset: 2px; }
`;

const Transcript = styled.div`
  overflow-y: auto; overscroll-behavior: contain;
  padding: 20px 20px 12px;
  display: flex; flex-direction: column; gap: 22px;
  scrollbar-width: thin; scrollbar-color: var(--st-line) transparent;
`;

const Turn = styled.article<{ $side: "them" | "you" }>`
  display: grid; gap: 8px;
  justify-items: ${p => p.$side === "you" ? "end" : "start"};
  .who { font-size: 12px; line-height: 16px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase; color: var(--st-muted); }
  .bubble {
    max-width: 88%; padding: 14px 16px; border-radius: 16px; overflow-wrap: anywhere;
    background: ${p => p.$side === "you" ? "color-mix(in srgb, var(--st-accent) 45%, var(--st-surface))" : "var(--st-surface)"};
    border: 1px solid ${p => p.$side === "you" ? "transparent" : "var(--st-line)"};
  }
  .main { font-size: 17px; line-height: 25px; font-weight: 500; color: var(--st-ink); }
  .orig { margin-top: 8px; font-size: 13px; line-height: 20px; color: var(--st-muted); }
  .note { margin-top: 8px; font-size: 12px; line-height: 16px; color: var(--st-gold); }
`;

const Empty = styled.div`
  margin: auto 0; padding: 24px 4px; text-align: center;
  h1 { font: 600 30px/34px 'Cormorant Garamond', serif; color: var(--st-ink); }
  p { margin-top: 12px; font-size: 15px; line-height: 22px; color: var(--st-muted); }
  p + p { margin-top: 4px; font-size: 13px; line-height: 20px; }
`;

const Status = styled.p<{ $live: boolean }>`
  display: flex; align-items: center; gap: 8px; font-size: 13px; line-height: 18px; color: var(--st-muted);
  &::before { content: ''; width: 7px; height: 7px; border-radius: 50%; flex: none; background: ${p => p.$live ? "var(--live-ok)" : "var(--st-line)"}; }
`;

const ErrorBox = styled.div`
  display: flex; gap: 10px; align-items: flex-start; padding: 12px 14px; border-radius: 12px;
  background: color-mix(in srgb, #d9534f 14%, var(--st-surface)); border: 1px solid color-mix(in srgb, #d9534f 40%, transparent);
  color: var(--st-ink); font-size: 14px; line-height: 20px;
  svg { width: 18px; height: 18px; flex: none; margin-top: 1px; color: #e58a86; }
`;

// ---- face-to-face view ----
const Face = styled.div`
  display: grid; grid-template-rows: minmax(0, 1fr) auto minmax(0, 1fr); min-height: 0;
`;
const Pane = styled.section<{ $flip?: boolean }>`
  min-height: 0; overflow: hidden; padding: 18px 22px;
  display: flex; flex-direction: column; justify-content: flex-end; gap: 10px;
  ${p => p.$flip && css`transform: rotate(180deg); background: color-mix(in srgb, var(--st-surface) 70%, transparent);`}
  .label { font-size: 12px; line-height: 16px; font-weight: 600; letter-spacing: 0.6px; color: var(--st-gold); }
  .line { font-size: 15px; line-height: 22px; color: var(--st-muted); overflow-wrap: anywhere; }
  .line.latest { font-size: 24px; line-height: 33px; font-weight: 600; color: var(--st-ink); }
  .line.own { opacity: 0.7; }
  .line.pending { color: var(--st-muted); }
  .hint { font-size: 15px; line-height: 22px; color: var(--st-muted); }
`;
const Divider = styled.div`
  display: flex; align-items: center; justify-content: center; gap: 14px; padding: 10px 16px;
  border-top: 1px solid var(--st-line); border-bottom: 1px solid var(--st-line); background: var(--st-surface);
  .label { font-size: 13px; line-height: 18px; color: var(--st-muted); }
`;

const Sheet = styled.footer`
  border-radius: 24px 24px 0 0; background: var(--st-surface); border-top: 1px solid var(--st-line);
  padding: 20px 20px calc(16px + env(safe-area-inset-bottom));
  display: grid; justify-items: center; gap: 10px;
  .label { font-size: 14px; line-height: 20px; font-weight: 600; color: var(--st-ink); }
  .metric { font-size: 12px; line-height: 17px; color: var(--st-muted); font-variant-numeric: tabular-nums; }
  .row { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
  .privacy { max-width: 340px; margin-top: 2px; text-align: center; font-size: 12px; line-height: 17px; color: var(--st-muted); }
`;

const ring = keyframes`
  0% { box-shadow: 0 0 0 0 rgb(201 167 106 / 45%); }
  100% { box-shadow: 0 0 0 18px rgb(201 167 106 / 0%); }
`;

const Mic = styled.button<{ $live: boolean; $small?: boolean }>`
  width: ${p => p.$small ? 56 : 76}px; height: ${p => p.$small ? 56 : 76}px; border-radius: 50%; border: 0;
  display: grid; place-items: center; flex: none;
  background: var(--st-action); color: var(--st-on-action); cursor: pointer;
  transition: transform 160ms cubic-bezier(.23, 1, .32, 1), opacity 160ms;
  svg { width: ${p => p.$small ? 22 : 28}px; height: ${p => p.$small ? 22 : 28}px; }
  ${p => p.$live && css`animation: ${ring} 1.6s cubic-bezier(.23, 1, .32, 1) infinite;`}
  &:active:not(:disabled) { transform: scale(0.96); }
  &:disabled { opacity: 0.55; cursor: progress; }
  &:focus-visible { outline: 2px solid var(--st-ink); outline-offset: 4px; }
  @media (prefers-reduced-motion: reduce) { animation: none; transition: none; }
`;

const Pill = styled.button<{ $primary?: boolean }>`
  min-height: 40px; padding: 0 16px; border-radius: 999px; cursor: pointer;
  border: 1px solid ${p => p.$primary ? "transparent" : "var(--st-line)"};
  background: ${p => p.$primary ? "var(--st-action)" : "transparent"};
  color: ${p => p.$primary ? "var(--st-on-action)" : "var(--st-ink)"};
  font: 600 14px/1 Inter, 'Noto Sans KR', sans-serif; display: inline-flex; align-items: center; gap: 8px;
  svg { width: 16px; height: 16px; }
  &:disabled { opacity: 0.55; cursor: progress; }
  &:focus-visible { outline: 2px solid var(--st-gold); outline-offset: 2px; }
`;

// ---- bottom sheets ----
const Backdrop = styled.div`
  position: absolute; inset: 0; z-index: 20; background: rgb(0 0 0 / 45%);
  display: flex; align-items: flex-end;
`;
const Dialog = styled.div`
  width: 100%; max-height: 86%; overflow-y: auto; background: var(--st-surface); color: var(--st-ink);
  border-radius: 24px 24px 0 0; padding: 18px 20px calc(20px + env(safe-area-inset-bottom));
  display: grid; gap: 18px;
  header { display: flex; align-items: center; justify-content: space-between; }
  h2 { font-size: 18px; line-height: 24px; font-weight: 700; }
  h3 { font-size: 13px; line-height: 18px; font-weight: 700; color: var(--st-muted); letter-spacing: 0.4px; margin-bottom: 8px; }
  p.help { font-size: 13px; line-height: 19px; color: var(--st-muted); }
  .seg { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; padding: 4px; border-radius: 14px; background: var(--st-paper); }
  .seg button { min-height: 40px; border-radius: 10px; border: 0; background: transparent; color: var(--st-muted); font: 600 14px/1 Inter, 'Noto Sans KR', sans-serif; cursor: pointer; }
  .seg button[aria-pressed="true"] { background: var(--st-surface); color: var(--st-ink); box-shadow: 0 1px 2px rgb(0 0 0 / 18%); }
  .chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .chip { font-size: 13px; line-height: 18px; padding: 6px 10px; border-radius: 999px; background: var(--st-paper); border: 1px solid var(--st-line); display: inline-flex; gap: 6px; align-items: center; }
  .chip button { border: 0; background: none; color: var(--st-muted); cursor: pointer; padding: 0; display: grid; }
  .chip svg { width: 14px; height: 14px; }
  .add { display: grid; grid-template-columns: 1fr 1fr auto; gap: 6px; }
  .add input { min-width: 0; min-height: 44px; padding: 0 12px; border-radius: 12px; border: 1px solid var(--st-line); background: var(--st-paper); color: var(--st-ink); font-size: 16px; }
  .qr { justify-self: center; width: 208px; height: 208px; background: #fff; border-radius: 16px; padding: 6px; }
  .link { font-size: 12px; line-height: 17px; color: var(--st-muted); word-break: break-all; text-align: center; }
  .center { display: grid; justify-items: center; gap: 10px; text-align: center; }
  .summary { display: grid; gap: 10px; padding: 14px 16px; border-radius: 16px; background: var(--st-paper); border: 1px solid var(--st-line); }
  .summary h4 { font-size: 16px; line-height: 22px; font-weight: 700; }
  .summary p, .summary li { font-size: 14px; line-height: 21px; }
  .summary ul { padding-left: 18px; list-style: disc; display: grid; gap: 4px; }
  .actions { display: flex; flex-wrap: wrap; gap: 8px; }
`;

type TurnView = { side: "them" | "you"; who: string; main: string; mainKo: boolean; orig?: string; note?: string };
type Panel = null | "settings" | "share" | "notes";

function Qr({ text, label }: { text: string; label: string }) {
  const { size, d } = useMemo(() => qrSvgPath(encodeQr(text)), [text]);
  return <svg className="qr" viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label} shapeRendering="crispEdges"><path d={d} fill="#111" /></svg>;
}

export default function LiveTranslation() {
  const { t } = useI18n();
  const conversationRef = useRef<HTMLDivElement | null>(null);
  const { customerLanguage } = useUserProfile();
  const [settings, setSettings] = useState<LiveSettings>(() => loadSettings());
  const [terms, setTerms] = useState<CustomTerm[]>(() => loadTerms());
  const [view, setView] = useState<"list" | "face">("list");
  const [panel, setPanel] = useState<Panel>(null);
  const [draft, setDraft] = useState<CustomTerm>({ ko: "", target: "" });
  const [summary, setSummary] = useState<ReadingSummary | null>(null);
  const [summaryState, setSummaryState] = useState<"idle" | "loading" | "error">("idle");
  const [summaryError, setSummaryError] = useState("");
  const [copied, setCopied] = useState<"" | "link" | "notes">("");

  const {
    isConnected, isRecording, messages, error, isConnecting,
    isUserSpeaking, isAssistantSpeaking, startRecording, stopRecording,
    clearConversation, reconnecting, latency,
  } = useRealtimeAgent({ customerLanguage, customTerms: terms, speechOutput: settings.speech });

  useEffect(() => { saveSettings(settings); }, [settings]);
  useEffect(() => { saveTerms(terms); }, [terms]);
  useEffect(() => {
    if (conversationRef.current) conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
  }, [messages, view]);

  const groups = useMemo(() => groupTurns(messages), [messages]);
  const noteTurns = useMemo(() => turnsFromGroups(groups), [groups]);
  const captions: CaptionTurn[] = useMemo(() => groups
    .filter(g => g.isComplete && g.assistant)
    .map(g => ({ id: g.user.id, side: (isKorean(g.user.content) ? "reader" : "visitor") as CaptionTurn["side"], original: g.user.content.trim(), translation: g.assistant!.content.trim() })), [groups]);
  const share = useCaptionShare(captions);
  const face = useMemo(() => faceView(groups), [groups]);

  const langName = t(customerLanguage);
  const custCode = LANG_CODE[customerLanguage] ?? "en";
  const youLabel = t("You · spoken in {language}").replace("{language}", langName);
  const glossary = useMemo(() => glossaryFor(customerLanguage), [customerLanguage]);

  // The customer-language line leads (the reader of this screen), Korean sits underneath.
  const toView = (group: MessageGroup): TurnView => {
    const spoken = group.user;
    const spokenKo = isKorean(spoken.content);
    if (group.isComplete && group.assistant) {
      const translated = group.assistant.content;
      const side = spokenKo ? "them" : "you";
      const who = spokenKo ? t("Spoken in Korean") : youLabel;
      if (spokenKo === isKorean(translated)) {
        return { side, who, main: spoken.content, mainKo: spokenKo, orig: translated, note: t("No translation came back for this turn.") };
      }
      return spokenKo
        ? { side, who, main: translated, mainKo: false, orig: spoken.content }
        : { side, who, main: spoken.content, mainKo: false, orig: translated };
    }
    if (spoken.role === "assistant") return { side: "them", who: t("Translation"), main: spoken.content, mainKo: spokenKo };
    return { side: spokenKo ? "them" : "you", who: spokenKo ? t("Spoken in Korean") : youLabel, main: spoken.content, mainKo: spokenKo, note: t("Translating…") };
  };

  const active = isRecording || isConnected;
  const status = reconnecting
    ? t("Connection dropped. Reconnecting ({n} of 3)…").replace("{n}", String(reconnecting))
    : isConnecting
    ? t("Connecting…")
    : isRecording
      ? isAssistantSpeaking && settings.speech
        ? t("Speaking the translation…")
        : isUserSpeaking
          ? t("Listening…")
          : t("Listening · speak in Korean or {language}").replace("{language}", langName)
      : messages.length > 0
        ? t("Session ended. The transcript stays in this tab until you close it or clear it.")
        : null;

  const toggleMic = () => { if (!isRecording) startRecording(); else stopRecording(); };

  const addTerm = () => {
    const ko = draft.ko.trim(); const target = draft.target.trim();
    if (!ko || !target || terms.length >= MAX_CUSTOM_TERMS) return;
    setTerms(prev => [...prev.filter(x => x.ko !== ko), { ko, target }]);
    setDraft({ ko: "", target: "" });
  };

  const labels = { reader: t("Reader"), visitor: t("You"), title: t("Reading notes"), transcript: t("Conversation"), keyPoints: t("Key points"), terms: t("Saju terms") };
  const markdown = () => notesMarkdown(noteTurns, { language: customerLanguage, date: new Date(), record: settings.record, summary, labels });
  const copy = async (text: string, what: "link" | "notes") => {
    try { await navigator.clipboard.writeText(text); setCopied(what); setTimeout(() => setCopied(""), 1800); } catch { /* clipboard blocked */ }
  };
  const download = () => {
    const blob = new Blob([markdown()], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `sajuteller-reading-${new Date().toISOString().slice(0, 10)}.md`;
    a.click(); URL.revokeObjectURL(url);
  };
  const summarize = async () => {
    setSummaryState("loading"); setSummaryError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sign in to create reading notes.");
      setSummary(await requestSummary(noteTurns, customerLanguage, session.access_token));
      setSummaryState("idle");
    } catch (e) {
      setSummaryState("error"); setSummaryError(e instanceof Error ? e.message : "We couldn’t summarise this session. You can still copy or save the transcript.");
    }
  };

  const shareUrl = share.invite ? inviteUrl(window.location.origin, share.invite) : "";
  const micLabel = isRecording ? t("Stop translation") : t("Start voice translation");

  return (
    <Page>
      <Bar>
        <div style={{ minWidth: 0 }}>
          <div className="pair">
            <span className="ko" lang="ko">한국어</span>
            <ArrowsRightLeftIcon aria-hidden="true" />
            <span lang={custCode}>{ENDONYM[customerLanguage] ?? langName}</span>
          </div>
          <div className="sub">{t("Live interpretation")}</div>
        </div>
        <div className="tools">
          <IconButton type="button" onClick={() => setView(v => v === "list" ? "face" : "list")} aria-label={view === "list" ? t("Face-to-face view") : t("Conversation view")} title={view === "list" ? t("Face-to-face view") : t("Conversation view")}>
            {view === "list" ? <DevicePhoneMobileIcon aria-hidden="true" /> : <ChatBubbleLeftRightIcon aria-hidden="true" />}
          </IconButton>
          <IconButton type="button" $on={!!share.invite} onClick={() => setPanel("share")} aria-label={t("Share captions")} title={t("Share captions")}>
            <QrCodeIcon aria-hidden="true" />{share.invite && <span className="dot" />}
          </IconButton>
          <IconButton type="button" onClick={() => setPanel("settings")} aria-label={t("Interpretation settings")} title={t("Interpretation settings")}>
            <Cog6ToothIcon aria-hidden="true" />
          </IconButton>
          {active
            ? <BarAction type="button" onClick={() => stopRecording()}>{t("End")}</BarAction>
            : <BarAction as={Link} to="/">{t("Close")}</BarAction>}
        </div>
      </Bar>

      {view === "list" ? (
        <Transcript ref={conversationRef} aria-live="polite">
          {groups.length === 0 && (
            <Empty>
              <h1>{t("Live interpretation, both ways.")}</h1>
              <p>{t("Tap the microphone and start speaking.")}</p>
              <p>{t("Speak in Korean or {language} for live translation.").replace("{language}", langName)}</p>
            </Empty>
          )}
          {groups.map((group, i) => {
            const v = toView(group);
            const showOrig = v.orig && (settings.record === "both" || v.note);
            return (
              <Turn key={`${group.user.id}-${group.assistant?.id ?? i}`} $side={v.side}>
                <span className="who">{v.who}</span>
                <div className="bubble">
                  <div className={v.mainKo ? "main ko" : "main"} lang={v.mainKo ? "ko" : custCode}>{v.main}</div>
                  {showOrig && <div className={isKorean(v.orig!) ? "orig ko" : "orig"} lang={isKorean(v.orig!) ? "ko" : custCode}>{v.orig}</div>}
                  {v.note && <div className="note">{v.note}</div>}
                </div>
              </Turn>
            );
          })}
          {error && <ErrorBox role="alert"><ExclamationTriangleIcon aria-hidden="true" /><span>{t(error)}</span></ErrorBox>}
          {status && <Status $live={isRecording} role="status">{status}</Status>}
        </Transcript>
      ) : (
        <Face aria-live="polite">
          <Pane $flip lang="ko" className="ko" aria-label="역술가 화면 (한국어)">
            <span className="label">역술가 · 한국어</span>
            {face.reader.length === 0 && <p className="hint">마이크를 누르고 말씀하세요. 손님의 말이 한국어로 여기에 표시됩니다.</p>}
            {face.reader.map((l, i) => <p key={l.id} className={`line${i === face.reader.length - 1 ? " latest" : ""}${l.own ? " own" : ""}${l.pending ? " pending" : ""}`}>{l.text}</p>)}
          </Pane>
          <Divider>
            <Mic type="button" $small $live={isRecording} onClick={toggleMic} disabled={isConnecting} aria-pressed={isRecording} aria-label={micLabel}>
              {isRecording ? <StopIcon aria-hidden="true" /> : <MicrophoneIcon aria-hidden="true" />}
            </Mic>
            <span className="label" role="status">{error ? t(error) : status ?? t("Tap to start")}</span>
          </Divider>
          <Pane lang={custCode} aria-label={t("Your side ({language})").replace("{language}", langName)}>
            <span className="label">{t("You")} · {ENDONYM[customerLanguage] ?? langName}</span>
            {face.visitor.length === 0 && <p className="hint">{t("Place the phone between you and the reader. Their words appear here in {language}.").replace("{language}", langName)}</p>}
            {face.visitor.map((l, i) => <p key={l.id} className={`line${i === face.visitor.length - 1 ? " latest" : ""}${l.own ? " own" : ""}${l.pending ? " pending" : ""}`}>{l.text}</p>)}
          </Pane>
        </Face>
      )}

      {view === "list" ? (
        <Sheet>
          <Mic type="button" $live={isRecording} onClick={toggleMic} disabled={isConnecting} aria-pressed={isRecording} aria-label={micLabel}>
            {isRecording ? <StopIcon aria-hidden="true" /> : <MicrophoneIcon aria-hidden="true" />}
          </Mic>
          <span className="label" aria-hidden="true">{isConnecting ? t("Connecting…") : isRecording ? t("Tap to stop") : t("Tap to start")}</span>
          {latency.turns > 0 && <p className="metric">{t("Response time: typical {a}s · slowest 5% {b}s ({n} turns)").replace("{a}", ((latency.p50 ?? 0) / 1000).toFixed(1)).replace("{b}", ((latency.p95 ?? 0) / 1000).toFixed(1)).replace("{n}", String(latency.turns))}</p>}
          {noteTurns.length > 0 && !active && (
            <div className="row">
              <Pill type="button" $primary onClick={() => setPanel("notes")}><DocumentTextIcon aria-hidden="true" />{t("Reading notes")}</Pill>
              <Pill type="button" onClick={clearConversation}>{t("Clear conversation")}</Pill>
            </div>
          )}
          <p className="privacy">{t("Audio is never saved. Speech goes to OpenAI only to translate it. The text stays in this browser tab until you close the tab or clear it.")}</p>
        </Sheet>
      ) : (
        noteTurns.length > 0 && !active
          ? <Sheet><div className="row"><Pill type="button" $primary onClick={() => setPanel("notes")}><DocumentTextIcon aria-hidden="true" />{t("Reading notes")}</Pill></div></Sheet>
          : <div />
      )}

      {panel && (
        <Backdrop onClick={() => setPanel(null)}>
          <Dialog role="dialog" aria-modal="true" aria-labelledby="live-panel-title" onClick={e => e.stopPropagation()}>
            <header>
              <h2 id="live-panel-title">{panel === "settings" ? t("Interpretation settings") : panel === "share" ? t("Share captions") : t("Reading notes")}</h2>
              <IconButton type="button" onClick={() => setPanel(null)} aria-label={t("Close")}><XMarkIcon aria-hidden="true" /></IconButton>
            </header>

            {panel === "settings" && <>
              <section>
                <h3>{t("Output")}</h3>
                <div className="seg">
                  <button type="button" aria-pressed={settings.speech} onClick={() => setSettings(s => ({ ...s, speech: true }))}>{t("Voice + captions")}</button>
                  <button type="button" aria-pressed={!settings.speech} onClick={() => setSettings(s => ({ ...s, speech: false }))}>{t("Captions only")}</button>
                </div>
              </section>
              <section>
                <h3>{t("Transcript")}</h3>
                <div className="seg">
                  <button type="button" aria-pressed={settings.record === "both"} onClick={() => setSettings(s => ({ ...s, record: "both" }))}>{t("Original + translation")}</button>
                  <button type="button" aria-pressed={settings.record === "translation"} onClick={() => setSettings(s => ({ ...s, record: "translation" }))}>{t("Translation only")}</button>
                </div>
              </section>
              <section>
                <h3>{t("Saju glossary")}</h3>
                <p className="help">{t("These terms are always translated the same way.")}</p>
                <div className="chips" style={{ marginTop: 8 }}>
                  {glossary.map(g => <span className="chip" key={g.ko}><span className="ko" lang="ko">{g.ko}</span>→<span lang={custCode}>{g.target}</span></span>)}
                </div>
              </section>
              <section>
                <h3>{t("My terms")}</h3>
                <p className="help">{t("Add names or words the reader uses, like the studio name. Saved on this phone and used from the next session.")}</p>
                <div className="add" style={{ marginTop: 8 }}>
                  <input aria-label={t("Korean")} placeholder="한국어" lang="ko" maxLength={MAX_TERM_LENGTH} value={draft.ko} onChange={e => setDraft(d => ({ ...d, ko: e.target.value }))} />
                  <input aria-label={langName} placeholder={langName} lang={custCode} maxLength={MAX_TERM_LENGTH} value={draft.target} onChange={e => setDraft(d => ({ ...d, target: e.target.value }))} onKeyDown={e => { if (e.key === "Enter") addTerm(); }} />
                  <Pill type="button" onClick={addTerm} disabled={!draft.ko.trim() || !draft.target.trim()}>{t("Add")}</Pill>
                </div>
                {terms.length > 0 && <div className="chips" style={{ marginTop: 10 }}>
                  {terms.map(x => <span className="chip" key={x.ko}><span className="ko" lang="ko">{x.ko}</span>→<span>{x.target}</span><button type="button" aria-label={t("Remove {term}").replace("{term}", x.ko)} onClick={() => setTerms(prev => prev.filter(y => y.ko !== x.ko))}><XMarkIcon aria-hidden="true" /></button></span>)}
                </div>}
              </section>
            </>}

            {panel === "share" && (share.invite ? (
              <div className="center">
                <Qr text={shareUrl} label={t("QR code for the caption link")} />
                <p className="help">{share.status === "live" ? t("{n} watching").replace("{n}", String(share.viewers)) : share.status === "error" ? t("Couldn’t open the caption room. Try again.") : t("Connecting…")}</p>
                <p className="link">{shareUrl.split("#")[0]}</p>
                <div className="actions">
                  <Pill type="button" onClick={() => copy(shareUrl, "link")}>{copied === "link" ? t("Copied") : t("Copy link")}</Pill>
                  <Pill type="button" onClick={share.stop}>{t("Stop sharing")}</Pill>
                </div>
                <p className="help">{t("Captions are end-to-end encrypted and never stored. Anyone with this link can read them until you stop sharing.")}</p>
              </div>
            ) : (
              <div className="center">
                <p className="help">{t("A friend can scan a QR code and follow the conversation as captions on their own phone. No app or account needed.")}</p>
                <Pill type="button" $primary onClick={share.start}><QrCodeIcon aria-hidden="true" />{t("Start sharing captions")}</Pill>
              </div>
            ))}

            {panel === "notes" && <>
              {summary ? (
                <div className="summary" lang={custCode}>
                  <h4>{summary.title}</h4>
                  <p>{summary.summary}</p>
                  <ul>{summary.keyPoints.map(p => <li key={p}>{p}</li>)}</ul>
                  {summary.terms.length > 0 && <ul>{summary.terms.map(x => <li key={x.term}><b>{x.term}</b>: {x.meaning}</li>)}</ul>}
                </div>
              ) : (
                <p className="help">{t("Keep what you heard: an AI summary of the reading in {language}, with the full conversation.").replace("{language}", langName)}</p>
              )}
              {summaryState === "error" && <ErrorBox role="alert"><ExclamationTriangleIcon aria-hidden="true" /><span>{t(summaryError)}</span></ErrorBox>}
              <div className="actions">
                {!summary && <Pill type="button" $primary onClick={summarize} disabled={summaryState === "loading"}>{summaryState === "loading" ? t("Summarising…") : t("Create AI summary")}</Pill>}
                <Pill type="button" onClick={() => copy(markdown(), "notes")}>{copied === "notes" ? t("Copied") : t("Copy as text")}</Pill>
                <Pill type="button" onClick={download}>{t("Save file")}</Pill>
              </div>
              <p className="help">{t("The summary is made once and isn’t stored. The file is saved only to your device.")}</p>
            </>}
          </Dialog>
        </Backdrop>
      )}
    </Page>
  );
}
