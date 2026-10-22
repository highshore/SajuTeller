import { useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { styled, css, keyframes } from "styled-components";
import { ArrowsRightLeftIcon, ExclamationTriangleIcon, MicrophoneIcon, StopIcon } from "@heroicons/react/24/solid";
import { useI18n } from "../i18n/i18n";
import { useRealtimeAgent } from "../hooks/useRealtimeAgent";
import { useUserProfile } from "../hooks/useUserProfile";
import { groupTurns, isKorean, type MessageGroup } from "../components/live/group-turns";

// Figma: 06 — Redesign · Oct 2026 / 09 Live interpretation — in session (142:651).
// Immersive night route: session bar, transcript (translation large, original small), control sheet.

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
  font-family: Inter, system-ui, sans-serif;
  overflow: hidden;
`;

const Bar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: calc(14px + env(safe-area-inset-top)) 20px 14px;
  border-bottom: 1px solid var(--st-line);
  .pair { display: flex; align-items: center; gap: 8px; font-size: 17px; line-height: 24px; font-weight: 600; min-width: 0; }
  .pair .ko { font-family: 'Noto Sans KR', sans-serif; font-weight: 500; }
  .pair svg { width: 16px; height: 16px; color: var(--st-gold); flex: none; }
  .sub { font-size: 12px; line-height: 16px; color: var(--st-muted); margin-top: 2px; }
`;

const BarAction = styled.button`
  flex: none;
  min-height: 40px;
  padding: 0 18px;
  border-radius: 999px;
  border: 1px solid var(--st-line);
  background: transparent;
  color: var(--st-ink);
  font: 600 14px/1 Inter, sans-serif;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  text-decoration: none;
  &:hover { background: var(--st-surface); }
  &:focus-visible { outline: 2px solid var(--st-gold); outline-offset: 2px; }
`;

const Transcript = styled.div`
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 20px 20px 12px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  scrollbar-width: thin;
  scrollbar-color: var(--st-line) transparent;
`;

const Turn = styled.article<{ $side: "them" | "you" }>`
  display: grid;
  gap: 8px;
  justify-items: ${p => p.$side === "you" ? "end" : "start"};
  .who { font-size: 12px; line-height: 16px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase; color: var(--st-muted); }
  .bubble {
    max-width: 88%;
    padding: 14px 16px;
    border-radius: 16px;
    background: ${p => p.$side === "you" ? "color-mix(in srgb, var(--st-accent) 45%, var(--st-surface))" : "var(--st-surface)"};
    border: 1px solid ${p => p.$side === "you" ? "transparent" : "var(--st-line)"};
    overflow-wrap: anywhere;
  }
  .main { font-size: 17px; line-height: 25px; font-weight: 500; color: var(--st-ink); }
  .orig { margin-top: 8px; font-size: 13px; line-height: 20px; color: var(--st-muted); }
  .ko { font-family: 'Noto Sans KR', sans-serif; word-break: keep-all; }
  .note { margin-top: 8px; font-size: 12px; line-height: 16px; color: var(--st-gold); }
`;

const Empty = styled.div`
  margin: auto 0;
  padding: 24px 4px;
  text-align: center;
  h1 { font: 600 30px/34px 'Cormorant Garamond', serif; color: var(--st-ink); }
  p { margin-top: 12px; font-size: 15px; line-height: 22px; color: var(--st-muted); }
  p + p { margin-top: 4px; font-size: 13px; line-height: 20px; }
`;

const Status = styled.p<{ $live: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  line-height: 18px;
  color: var(--st-muted);
  &::before {
    content: '';
    width: 7px; height: 7px; border-radius: 50%; flex: none;
    background: ${p => p.$live ? "var(--live-ok)" : "var(--st-line)"};
  }
`;

const ErrorBox = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 12px 14px;
  border-radius: 12px;
  background: color-mix(in srgb, #d9534f 14%, var(--st-surface));
  border: 1px solid color-mix(in srgb, #d9534f 40%, transparent);
  color: var(--st-ink);
  font-size: 14px;
  line-height: 20px;
  svg { width: 18px; height: 18px; flex: none; margin-top: 1px; color: #e58a86; }
`;

const Sheet = styled.footer`
  border-radius: 24px 24px 0 0;
  background: var(--st-surface);
  border-top: 1px solid var(--st-line);
  padding: 22px 20px calc(18px + env(safe-area-inset-bottom));
  display: grid;
  justify-items: center;
  gap: 10px;
  .label { font-size: 14px; line-height: 20px; font-weight: 600; color: var(--st-ink); }
  .privacy { max-width: 320px; margin-top: 4px; text-align: center; font-size: 12px; line-height: 17px; color: var(--st-muted); }
`;

const ring = keyframes`
  0% { box-shadow: 0 0 0 0 rgb(201 167 106 / 45%); }
  100% { box-shadow: 0 0 0 18px rgb(201 167 106 / 0%); }
`;

const Mic = styled.button<{ $live: boolean }>`
  width: 76px;
  height: 76px;
  border-radius: 50%;
  border: 0;
  display: grid;
  place-items: center;
  background: var(--st-action);
  color: var(--st-on-action);
  cursor: pointer;
  transition: transform 160ms cubic-bezier(.23, 1, .32, 1), opacity 160ms;
  svg { width: 28px; height: 28px; }
  ${p => p.$live && css`animation: ${ring} 1.6s cubic-bezier(.23, 1, .32, 1) infinite;`}
  &:active:not(:disabled) { transform: scale(0.96); }
  &:disabled { opacity: 0.55; cursor: progress; }
  &:focus-visible { outline: 2px solid var(--st-ink); outline-offset: 4px; }
  @media (prefers-reduced-motion: reduce) { animation: none; transition: none; }
`;

type TurnView = { side: "them" | "you"; who: string; main: string; mainKo: boolean; orig?: string; note?: string };

export default function LiveTranslation() {
  const { t } = useI18n();
  const conversationRef = useRef<HTMLDivElement | null>(null);

  // 유저 프로필에서 country 기반으로 언어 설정 가져오기
  const { customerLanguage } = useUserProfile();

  const {
    isConnected, isRecording, messages, error, isConnecting,
    isUserSpeaking, isAssistantSpeaking, startRecording, stopRecording,
  } = useRealtimeAgent({
    customerLanguage: customerLanguage
  });

  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [messages]);

  const handleStartRecording = () => {
    if (!isRecording) {
      startRecording(); // 자동으로 연결도 처리됨
    } else {
      stopRecording();
    }
  };

  const groups = useMemo(() => groupTurns(messages), [messages]);
  const langName = t(customerLanguage);
  const custCode = LANG_CODE[customerLanguage] ?? "en";
  const youLabel = t("You · spoken in {language}").replace("{language}", langName);

  // The customer-language line leads (the reader of this screen), Korean sits underneath — as before.
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
    if (spoken.role === "assistant") {
      return { side: "them", who: t("Translation"), main: spoken.content, mainKo: spokenKo };
    }
    return { side: spokenKo ? "them" : "you", who: spokenKo ? t("Spoken in Korean") : youLabel, main: spoken.content, mainKo: spokenKo, note: t("Translating…") };
  };

  const active = isRecording || isConnected;
  const status = isConnecting
    ? t("Connecting…")
    : isRecording
      ? isAssistantSpeaking
        ? t("Speaking the translation…")
        : isUserSpeaking
          ? t("Listening…")
          : t("Listening · speak in Korean or {language}").replace("{language}", langName)
      : messages.length > 0
        ? t("Session ended. The transcript stays until you leave this page.")
        : null;

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
        {active
          ? <BarAction type="button" onClick={() => stopRecording()}>{t("End")}</BarAction>
          : <BarAction as={Link} to="/">{t("Close")}</BarAction>}
      </Bar>

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
          return (
            <Turn key={`${group.user.id}-${group.assistant?.id ?? i}`} $side={v.side}>
              <span className="who">{v.who}</span>
              <div className="bubble">
                <div className={v.mainKo ? "main ko" : "main"} lang={v.mainKo ? "ko" : custCode}>{v.main}</div>
                {v.orig && <div className={isKorean(v.orig) ? "orig ko" : "orig"} lang={isKorean(v.orig) ? "ko" : custCode}>{v.orig}</div>}
                {v.note && <div className="note">{v.note}</div>}
              </div>
            </Turn>
          );
        })}

        {error && (
          <ErrorBox role="alert">
            <ExclamationTriangleIcon aria-hidden="true" />
            <span>{error}</span>
          </ErrorBox>
        )}

        {status && <Status $live={isRecording} role="status">{status}</Status>}
      </Transcript>

      <Sheet>
        <Mic
          type="button"
          $live={isRecording}
          onClick={handleStartRecording}
          disabled={isConnecting}
          aria-pressed={isRecording}
          aria-label={isRecording ? t("Stop translation") : t("Start voice translation")}
        >
          {isRecording ? <StopIcon aria-hidden="true" /> : <MicrophoneIcon aria-hidden="true" />}
        </Mic>
        <span className="label" aria-hidden="true">
          {isConnecting ? t("Connecting…") : isRecording ? t("Tap to stop") : t("Tap to start")}
        </span>
        <p className="privacy">{t("Speech is sent to OpenAI for live translation. The transcript stays on this screen and clears when you leave.")}</p>
      </Sheet>
    </Page>
  );
}
