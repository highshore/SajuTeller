import { type CSSProperties } from 'react';
import { styled, keyframes } from 'styled-components';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useI18n } from '../../i18n/i18n';
import { BRANCHES, ELEMENTS, STEMS } from '../../product/saju';
import { ELEMENT_PILLAR } from './styles';
import { HEADLINE, REVEAL_LINE, SEAL, elementName, fill, type Reading } from './copy';

// Figma 152:416 "19 — Reveal": two Day pillars lean together under a red seal.
const seeded = (seed: number) => () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
const stars = (() => { const r = seeded(11); return Array.from({ length: 60 }, () => ({ x: r() * 390, y: r() * 760, r: r() < .15 ? 1.2 : .6, o: .25 + r() * .6, gold: r() < .2 })); })();

const leanLeft = keyframes`from{opacity:0;transform:translateX(-46px) rotate(0deg);}to{opacity:1;transform:translateX(0) rotate(-9deg);}`;
const leanRight = keyframes`from{opacity:0;transform:translateX(46px) rotate(0deg);}to{opacity:1;transform:translateX(0) rotate(9deg);}`;
const stamp = keyframes`0%{opacity:0;transform:scale(1.6) rotate(-4deg);}60%{opacity:1;transform:scale(.94) rotate(-4deg);}100%{opacity:1;transform:scale(1) rotate(-4deg);}`;
const rise = keyframes`from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:none;}`;

const Stage = styled.section`
  position:relative;isolation:isolate;overflow:hidden;color:#f4eee7;
  min-height:max(600px,calc(100svh - var(--ks-header-height) - 76px - env(safe-area-inset-bottom)));
  background:radial-gradient(ellipse 85% 55% at 50% 34%,#4d2b61,#1a0d24 70%,#0f0818);
  display:flex;flex-direction:column;
  .stars{position:absolute;inset:0;width:100%;height:100%;z-index:-1;}
  .close{position:absolute;top:14px;left:16px;width:44px;height:44px;border-radius:50%;border:0;background:rgb(255 255 255 / 10%);color:#f4eee7;display:grid;place-items:center;cursor:pointer;z-index:2;}
  .close svg{width:20px;height:20px;}
  .art{position:relative;height:360px;flex:none;display:grid;place-items:center;}
  .orbit-ring{position:absolute;left:50%;top:50%;border-radius:50%;border:1px solid rgb(201 167 106 / 12%);translate:-50% -50%;}
  .orbit-ring.r1{width:330px;height:330px;}.orbit-ring.r2{width:250px;height:250px;border-color:rgb(201 167 106 / 7%);}
  .glow{position:absolute;left:50%;top:48%;width:260px;height:260px;border-radius:50%;translate:-50% -50%;background:#7a4890;opacity:.55;filter:blur(70px);}
  .pair{position:relative;display:flex;align-items:center;margin-top:-10px;}
  .pillar{width:92px;height:200px;border-radius:46px;display:grid;place-content:center;justify-items:center;gap:6px;color:#1b1420;
    background:linear-gradient(180deg,var(--top),var(--bottom));box-shadow:0 0 34px var(--halo);}
  .pillar b{font:600 40px/46px 'Noto Serif KR',serif;}
  .pillar i{width:22px;height:1px;background:rgb(27 20 32 / 35%);}
  .pillar small{font-size:12px;font-weight:600;margin-top:4px;}
  .pillar.a{transform:rotate(-9deg);animation:${leanLeft} .9s cubic-bezier(.23,1,.32,1) both;}
  .pillar.b{transform:rotate(9deg);margin-left:-14px;animation:${leanRight} .9s cubic-bezier(.23,1,.32,1) both;}
  .seal{position:absolute;left:50%;bottom:6px;margin-left:-34px;padding:6px;border-radius:9px;background:#b82924;box-shadow:0 8px 20px rgb(179 38 26 / 45%);transform:rotate(-4deg);animation:${stamp} .5s .75s cubic-bezier(.23,1,.32,1) both;}
  .seal span{display:block;padding:3px 7px;border:1.5px solid #ffede0;border-radius:6px;font:600 20px/26px 'Noto Serif KR',serif;color:#fff2e6;}
  .copy{padding:22px 20px 0;text-align:center;animation:${rise} .6s 1s cubic-bezier(.23,1,.32,1) both;}
  .names{font-size:12px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;color:#c9a76a;}
  h1{font:600 46px/48px 'Cormorant Garamond',serif;margin:12px 0 10px;color:#f4eee7;}
  html[lang=ko] & h1,html[lang=ja] & h1,html[lang|=zh] & h1{font:600 32px/42px 'Noto Serif KR',serif;}
  html[lang=ko] & h1{word-break:keep-all;}
  .line{font-size:14px;line-height:20px;color:#b8acbf;}
  .actions{margin-top:auto;padding:24px 20px 28px;display:grid;gap:4px;animation:${rise} .6s 1.15s cubic-bezier(.23,1,.32,1) both;}
  .cta{min-height:52px;border:0;border-radius:12px;background:#c9a76a;color:#1b1420;font-size:16px;font-weight:600;cursor:pointer;box-shadow:0 8px 28px rgb(201 167 106 / 35%);}
  .edit{min-height:44px;border:0;background:none;color:#f4eee7;font-size:14px;font-weight:600;cursor:pointer;}
  @media (prefers-reduced-motion:reduce){.pillar.a,.pillar.b,.seal,.copy,.actions{animation:none;}}
`;

function Pillar({ side, stem, branch, el }: { side: 'a' | 'b'; stem: number; branch: number; el: number }) {
  const { t } = useI18n();
  const [top, bottom, halo] = ELEMENT_PILLAR[el];
  return <div className={`pillar ${side}`} style={{ '--top': top, '--bottom': bottom, '--halo': halo } as CSSProperties}>
    <b lang="zh-Hant">{STEMS[stem]}</b><i/><b lang="zh-Hant">{BRANCHES[branch]}</b><small>{t(ELEMENTS[el])}</small>
  </div>;
}

type Props = { reading: Reading; aName: string; bName: string; onRead: () => void; onEdit: () => void; onClose: () => void };

export default function Reveal({ reading, aName, bName, onRead, onEdit, onClose }: Props) {
  const { t } = useI18n();
  const { a, b, aEl, bEl, family, giver, taker } = reading;
  return <Stage className="st-night" aria-labelledby="couple-reveal-title">
    <svg className="stars" viewBox="0 0 390 760" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {stars.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={s.gold ? '#e0c285' : '#f4eee7'} opacity={s.o}/>)}
    </svg>
    <button type="button" className="close" onClick={onClose} aria-label={t('Close')}><XMarkIcon/></button>
    <div className="art" aria-hidden="true">
      <span className="orbit-ring r1"/><span className="orbit-ring r2"/><span className="glow"/>
      <div className="pair">
        <Pillar side="a" stem={a.day.stem} branch={a.day.branch} el={aEl}/>
        <Pillar side="b" stem={b.day.stem} branch={b.day.branch} el={bEl}/>
      </div>
      <div className="seal"><span lang="zh-Hant">{SEAL[family]}</span></div>
    </div>
    <div className="copy">
      <div className="names">{aName} &amp; {bName}</div>
      <h1 id="couple-reveal-title">{t(HEADLINE[family])}</h1>
      <p className="line">{fill(t(REVEAL_LINE[family]), { x: t(elementName(giver)), y: t(elementName(taker)) })}</p>
    </div>
    <div className="actions">
      <button type="button" className="cta" onClick={onRead}>{t('Read our compatibility')}</button>
      <button type="button" className="edit" onClick={onEdit}>{t('Change details')}</button>
    </div>
  </Stage>;
}
