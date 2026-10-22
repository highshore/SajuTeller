import type { ReactNode } from 'react';
import { styled } from 'styled-components';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useI18n } from '../../i18n/i18n';

// Shared building blocks for the free readings (Figma 06 — Redesign: screens 10–14).

const seeded = (seed: number) => () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
const stars = (() => { const r = seeded(11); return Array.from({ length: 46 }, () => ({ x: r() * 390, y: r() * 360, r: r() < .12 ? 1.2 : r() < .5 ? .75 : .5, o: .2 + r() * .6, gold: r() < .2 })); })();

/** Static starfield (no motion) for the night headers. */
export function Starfield() {
  return <svg className="rd-stars" viewBox="0 0 390 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    {stars.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={s.gold ? '#e0c285' : '#f4eee7'} opacity={s.o}/>)}
  </svg>;
}

/** Night block: gradient #130a1b → #3c1e48 with a starfield behind the content. */
export const Night = styled.section`
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background: linear-gradient(180deg, #130a1b 0%, #24122e 55%, #3c1e48 100%);
  color: var(--st-ink);
  padding: 0 20px 28px;
  .rd-stars { position: absolute; inset: 0; width: 100%; height: 100%; z-index: -1; opacity: .9; }
`;

const Bar = styled.div`
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) 44px;
  align-items: center;
  min-height: 56px;
  margin: 0 -8px 4px;
  button { width: 44px; height: 44px; border: 0; background: transparent; color: var(--st-ink); display: grid; place-items: center; border-radius: 12px; cursor: pointer; }
  button svg { width: 22px; }
  h1, strong { margin: 0; text-align: center; font: 600 15px/1.3 Inter, 'Noto Sans KR', sans-serif; letter-spacing: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
`;

/** Back + screen title row at the top of a reading screen. */
export function PageBar({ title, onBack, end }: { title: string; onBack: () => void; end?: ReactNode }) {
  const { t } = useI18n();
  return <Bar><button type="button" onClick={onBack} aria-label={t('Back')}><ChevronLeftIcon/></button><strong>{title}</strong>{end ?? <span/>}</Bar>;
}

export const Kicker = styled.p`
  margin: 8px 0 10px;
  font: 700 11px/1.4 Inter, sans-serif;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: var(--st-gold);
`;

export const Display = styled.h2`
  margin: 0 0 12px;
  font-family: 'Cormorant Garamond', 'Noto Serif KR', serif;
  font-weight: 500;
  font-size: clamp(34px, 10cqi, 42px);
  line-height: 1.08;
  letter-spacing: -.5px;
  color: var(--st-ink);
  white-space: pre-line;
  word-break: keep-all;
  overflow-wrap: anywhere;
`;

export const Lede = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
  color: var(--st-muted);
`;

export const Body = styled.div`
  background: var(--st-paper);
  color: var(--st-ink);
  padding: 24px 20px 32px;
  display: grid;
  gap: 24px;
  min-width: 0;
`;

export const FieldBlock = styled.div`
  display: grid;
  gap: 10px;
  min-width: 0;
  .head { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
  .head > label, .head > span:first-child { font: 600 15px/1.3 Inter, sans-serif; color: var(--st-ink); }
  .head small { font-size: 12px; color: var(--st-faint); }
  .hint { display: flex; gap: 8px; font-size: 12px; line-height: 1.55; color: var(--st-muted); margin: 0; }
  .hint svg { width: 16px; flex: none; margin-top: 1px; }
  .error { font-size: 12px; color: #b3261e; margin: 0; }
`;

/** Outlined input with a small floating label inside, as in the Figma forms. */
export const Boxed = styled.label`
  display: grid;
  gap: 2px;
  padding: 10px 14px 8px;
  border: 1px solid var(--st-accent-line);
  border-radius: 12px;
  background: var(--st-surface);
  min-width: 0;
  span { font-size: 12px; color: var(--st-muted); }
  input { border: 0; padding: 2px 0 4px; background: transparent; color: var(--st-ink); font-size: 16px; min-height: 30px; width: 100%; min-width: 0; color-scheme: var(--st-scheme); }
  input:focus { outline: none; }
  input:disabled { color: var(--st-faint); }
  &:focus-within { border-color: var(--st-action); box-shadow: 0 0 0 1px var(--st-action); }
`;

export const Segmented = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  gap: 4px;
  padding: 4px;
  border-radius: 12px;
  background: var(--st-elevated);
  button {
    min-height: 44px;
    border: 0;
    border-radius: 9px;
    background: transparent;
    color: var(--st-muted);
    font: 500 14px/1.2 Inter, sans-serif;
    cursor: pointer;
  }
  button[aria-pressed='true'] { background: var(--st-surface); color: var(--st-ink); font-weight: 650; box-shadow: 0 1px 3px rgb(27 20 32 / 12%); }
`;

export const SwitchRow = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 14px 14px 16px;
  border-radius: 14px;
  background: var(--st-elevated);
  cursor: pointer;
  b { display: block; font: 600 14px/1.35 Inter, sans-serif; }
  small { display: block; font-size: 12px; line-height: 1.45; color: var(--st-muted); margin-top: 2px; }
  input { position: absolute; opacity: 0; width: 1px; height: 1px; }
  .track { flex: none; width: 50px; height: 30px; border-radius: 99px; background: var(--st-accent-line); position: relative; transition: background .2s; }
  .track::after { content: ''; position: absolute; top: 3px; left: 3px; width: 24px; height: 24px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgb(0 0 0 / 25%); transition: transform .2s; }
  input:checked + .track { background: var(--st-action); }
  input:checked + .track::after { transform: translateX(20px); }
  input:focus-visible + .track { outline: 2px solid var(--st-action); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { .track, .track::after { transition: none; } }
`;

/** Primary action that stays above the 76px dock while the form scrolls. */
export const StickyAction = styled.div`
  position: sticky;
  bottom: calc(76px + env(safe-area-inset-bottom));
  z-index: 5;
  padding: 12px 20px 14px;
  background: linear-gradient(180deg, rgb(255 255 255 / 0) 0, var(--st-paper) 14px);
  button { width: 100%; }
  p { margin: 8px 0 0; text-align: center; font-size: 12px; color: var(--st-faint); }
`;

export const Primary = styled.button`
  min-height: 52px;
  border: 0;
  border-radius: 14px;
  padding: 12px 20px;
  background: var(--st-action);
  color: var(--st-on-action);
  font: 650 16px/1.3 Inter, sans-serif;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
  svg { width: 18px; flex: none; }
  &:disabled { opacity: .5; cursor: not-allowed; }
`;

export const Secondary = styled.button`
  min-height: 52px;
  border: 1px solid var(--st-accent-line);
  border-radius: 14px;
  padding: 12px 20px;
  background: transparent;
  color: var(--st-ink);
  font: 650 15px/1.3 Inter, sans-serif;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  svg { width: 18px; flex: none; }
`;

export const Disclaimer = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 1.55;
  color: var(--st-faint);
`;

/** Night upsell card at the end of a free reading. */
export const Upsell = styled.section`
  padding: 28px 20px 32px;
  background: linear-gradient(180deg, #130a1b 0%, #2a1534 100%);
  display: grid;
  gap: 12px;
  h2 { margin: 0; font: 500 30px/1.12 'Cormorant Garamond', serif; color: var(--st-ink); white-space: pre-line; word-break: keep-all; }
  p { margin: 0; font-size: 14px; line-height: 1.6; color: var(--st-muted); }
  .actions { display: grid; gap: 10px; margin-top: 8px; }
  .actions a { min-height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; text-align: center; padding: 12px 18px; font: 650 15px/1.3 Inter, sans-serif; }
  .actions a.primary { background: var(--st-action); color: var(--st-on-action); }
  .actions a.secondary { border: 1px solid var(--st-accent-line); color: var(--st-ink); background: rgb(11 6 16 / 50%); }
`;
