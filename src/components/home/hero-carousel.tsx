import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { styled } from 'styled-components';
import { ArrowRightIcon, PauseIcon, PlayIcon } from '@heroicons/react/24/solid';
import { useI18n } from '../../i18n/i18n';

// Figma: "ST v2 / Hero carousel" (162:3084). Five slides share one CTA; only art and copy rotate.
const ADVANCE_MS = 4500;

type Slide = { id: string; head: string; gold: string; sub: string; bg: string; art: ReactNode };

const seeded = (seed: number) => () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
const stars = (() => { const r = seeded(7); return Array.from({ length: 70 }, (_, i) => ({ x: r() * 390, y: r() * 640, r: r() < .12 ? 1.3 : r() < .5 ? .8 : .5, o: .25 + r() * .7, gold: r() < .2, twinkle: i % 6 === 0 })); })();

function Starfield() {
  return <svg className="stars" viewBox="0 0 390 640" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    {stars.map((s, i) => <circle key={i} className={s.twinkle ? 'twinkle' : undefined} cx={s.x} cy={s.y} r={s.r} fill={s.gold ? '#e0c285' : '#f4eee7'} opacity={s.o} style={{ animationDelay: `${(i % 7) * .6}s` } as CSSProperties}/>)}
  </svg>;
}

const pillars = [['Hour', '戊', '子', 'Earth'], ['Day', '丙', '午', 'Fire'], ['Month', '癸', '酉', 'Water'], ['Year', '甲', '戌', 'Wood']] as const;

function PillarsArt() {
  const { t } = useI18n();
  return <div className="pillars-art">
    <span className="glow violet"/><span className="glow gold"/>
    <span className="orbit o1"/><span className="orbit o2"/>
    <div className="pillars">{pillars.map(([label, top, bottom, element]) => {
      const you = label === 'Day';
      return <div key={label} className={you ? 'col you' : 'col'}>
        <small>{t(you ? 'You' : label)}</small>
        <div className="pillar"><span lang="zh-Hant">{top}</span><i/><span lang="zh-Hant">{bottom}</span></div>
        <small>{t(element)}</small>
      </div>;
    })}</div>
  </div>;
}

const cards = [['Year', '年', '甲戌', 'Wood · your roots', -10, -138, 30], ['Month', '月', '癸酉', 'Water · your work', -3.5, -48, 10], ['Hour', '時', '戊子', 'Earth · your inner self', 10, 140, 28], ['Day', '日', '丙午', 'Fire · you', 3.5, 46, 0]] as const;

function CardsArt() {
  const { t } = useI18n();
  return <div className="cards-art"><span className="glow gold"/>{cards.map(([label, hanja, pillar, sub, rot, dx, dy]) =>
    <div key={label} className={label === 'Day' ? 'card you' : 'card'} style={{ transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)` }}>
      <small><span lang="zh-Hant">{hanja}</span> {t(label)}</small>
      <b lang="zh-Hant">{pillar[0]}<br/>{pillar[1]}</b>
      <em>{t(sub)}</em>
    </div>)}</div>;
}

const elements = [['火', 'Fire', -90, '#f5845a'], ['土', 'Earth', -18, '#e0b86b'], ['金', 'Metal', 54, '#dcdce9'], ['水', 'Water', 126, '#7a9efa'], ['木', 'Wood', 198, '#7acc8c']] as const;

function ElementsArt() {
  const { t } = useI18n();
  const cx = 195, cy = 190, R = 112;
  const pts = elements.map(([, , a]) => [cx + R * Math.cos(a * Math.PI / 180), cy + R * Math.sin(a * Math.PI / 180)]);
  const star = [0, 2, 4, 1, 3, 0].map(i => pts[i].map(n => n.toFixed(1)).join(' ')).join(' L');
  return <svg className="elements-art" viewBox="0 0 390 380" aria-hidden="true">
    <defs>{elements.map(([, name, , color]) => <radialGradient key={name} id={`el-${name}`}><stop offset="0" stopColor={color}/><stop offset="1" stopColor={color} stopOpacity=".2"/></radialGradient>)}</defs>
    <circle cx={cx} cy={cy} r={R + 34} fill="none" stroke="#c9a76a" strokeOpacity=".14" strokeDasharray="2 6"/>
    <circle cx={cx} cy={cy} r={R} fill="none" stroke="#c9a76a" strokeOpacity=".55"/>
    <path d={`M${star}`} fill="none" stroke="#c9a76a" strokeOpacity=".22"/>
    {elements.map(([hanja, name, , color], i) => {
      const you = name === 'Water'; const size = you ? 40 : 30; const [x, y] = pts[i];
      return <g key={name} className={you ? 'node you' : 'node'} style={{ '--glow': color } as CSSProperties}>
        <circle cx={x} cy={y} r={size} fill={`url(#el-${name})`}/>
        <text x={x} y={y} dy=".35em" textAnchor="middle" className="hanja" fontSize={you ? 32 : 23}>{hanja}</text>
        <text x={x} y={y + size + 18} textAnchor="middle" className={you ? 'label gold' : 'label'}>{you ? t('Water · you') : t(name)}</text>
      </g>;
    })}
  </svg>;
}

function roof(x: number, y: number, w: number) {
  return `M${x} ${y} C${x + w * .12} ${y - 4} ${x + w * .2} ${y - 16} ${x + w * .26} ${y - 26} L${x + w * .74} ${y - 26} C${x + w * .8} ${y - 16} ${x + w * .88} ${y - 4} ${x + w} ${y} L${x + w} ${y + 8} L${x} ${y + 8} Z M${x + w * .08} ${y + 8} L${x + w * .92} ${y + 8} L${x + w * .92} ${y + 70} L${x + w * .08} ${y + 70} Z`;
}

function SeoulArt() {
  return <svg className="seoul-art" viewBox="0 0 390 390" aria-hidden="true">
    <g transform="translate(0 -72)">
    <circle className="moon" cx="300" cy="150" r="52" fill="#fbe9c6"/>
    <path d="M0 270 C40 230 80 220 120 242 C160 262 190 230 230 215 C262 202 300 190 330 205 C360 220 375 230 390 228 L390 390 L0 390 Z" fill="#3a1e45"/>
    <rect x="309" y="135" width="4" height="62" fill="#3a1e45"/><rect x="302" y="160" width="18" height="10" rx="3" fill="#3a1e45"/><rect x="305" y="150" width="12" height="8" rx="2" fill="#3a1e45"/><circle cx="311" cy="133" r="2.5" fill="#f2c27a"/>
    <path d={`${roof(-30, 300, 190)} ${roof(140, 320, 170)} ${roof(290, 290, 150)}`} fill="#1b0f24"/>
    <rect y="370" width="390" height="92" fill="#140a1b"/>
    {[[40, 330], [86, 330], [200, 348], [245, 348], [330, 318], [360, 318]].map(([x, y]) => <rect key={`${x}-${y}`} className="window" x={x} y={y} width="16" height="22" rx="2" fill="#ffc773"/>)}
    </g>
    <rect y="298" width="390" height="92" fill="#140a1b"/>
  </svg>;
}

const slides: Slide[] = [
  { id: 'galaxy', head: 'Discover your\nKorean fortune', gold: 'Korean fortune', sub: 'Saju reads your life from your birth.', bg: '#0b0610', art: <img className="galaxy-art" src="/figma/galaxy-header.svg" width="358" height="230" alt=""/> },
  { id: 'pillars', head: 'Four pillars,\nread in Seoul', gold: 'read in Seoul', sub: 'Private readings with a Korean Saju master.', bg: 'linear-gradient(180deg,#130a1b,#281638 45%,#160c20)', art: <PillarsArt/> },
  { id: 'cards', head: 'Eight characters\nthat are you', gold: 'that are you', sub: 'Year, month, day and hour — the heart of Saju.', bg: 'radial-gradient(ellipse 90% 60% at 50% 32%,#4d2b61,#0d0814 72%)', art: <CardsArt/> },
  { id: 'elements', head: 'Five elements.\nOne you.', gold: 'One you.', sub: 'Find your element free, in ten seconds.', bg: 'linear-gradient(180deg,#100918,#22122f)', art: <ElementsArt/> },
  { id: 'seoul', head: 'A night in Seoul,\nread by a master', gold: 'read by a master', sub: 'Live interpretation, both ways.', bg: 'linear-gradient(180deg,#0e0816 0%,#281438 12%,#6c3456 22%,#aa6060 30%,#c88c6e 36%,#140a1b 41%)', art: <SeoulArt/> },
];

function Headline({ head, gold }: { head: string; gold: string }) {
  const at = head.indexOf(gold);
  const parts = at < 0 ? [head] : [head.slice(0, at), head.slice(at + gold.length)];
  const lines = (text: string) => text.split('\n').flatMap((line, i) => i ? [<br key={i}/>, line] : [line]);
  return <>{lines(parts[0])}{at >= 0 && <span className="gold">{gold}</span>}{at >= 0 && lines(parts[1])}</>;
}

const Hero = styled.section`
  position:relative;isolation:isolate;overflow:hidden;color:#f4eee7;background:#0b0610;min-height:730px;display:flex;flex-direction:column;touch-action:pan-y;
  .layer{position:absolute;inset:0;z-index:-1;opacity:0;transition:opacity .7s cubic-bezier(.23,1,.32,1);}
  .layer[data-state=current]{opacity:1;}
  .art{position:absolute;inset:0 0 auto;height:390px;transform:translateY(28px);transition:transform .7s cubic-bezier(.23,1,.32,1);}
  .layer[data-state=current] .art{transform:none;}.layer[data-state=previous] .art{transform:translateY(-28px);}
  .stars{position:absolute;inset:0;width:100%;height:100%;}
  .twinkle{animation:twinkle 3.2s ease-in-out infinite alternate;}
  @keyframes twinkle{to{opacity:.15;}}
  .galaxy-art{position:absolute;max-width:none;width:820px;height:auto;left:calc(50% - 600px);top:-40px;}
  .layer:first-child::after{content:'';position:absolute;inset:300px 0 0;background:linear-gradient(transparent,#0b0610 60%);}
  .glow{position:absolute;border-radius:50%;filter:blur(70px);pointer-events:none;}
  .glow.violet{width:380px;height:380px;left:calc(50% - 190px);top:10px;background:#7a4890;opacity:.55;}
  .glow.gold{width:170px;height:170px;left:calc(50% - 85px);top:110px;background:#c9a76a;opacity:.38;}
  .orbit{position:absolute;border:1px solid rgb(201 167 106 / 20%);border-radius:50%;left:50%;top:190px;translate:-50% -50%;}
  .o1{width:520px;height:520px;}.o2{width:400px;height:400px;border-color:rgb(201 167 106 / 10%);}
  .pillars{position:absolute;inset:44px 0 auto;display:flex;justify-content:center;align-items:flex-end;gap:10px;}
  .col{display:grid;justify-items:center;gap:8px;}.col small{font-size:12px;font-weight:600;color:#b8acbf;letter-spacing:.4px;}.col.you small{color:#c9a76a;}
  .pillar{width:70px;height:184px;border-radius:40px;display:grid;place-content:center;justify-items:center;gap:10px;font:600 30px/38px 'Noto Serif KR',serif;background:rgb(41 26 56 / 70%);border:1px solid rgb(201 167 106 / 35%);backdrop-filter:blur(12px);}
  .pillar i{width:20px;height:1px;background:rgb(201 167 106 / 50%);}
  .you .pillar{height:208px;color:#1b1420;border:0;background:linear-gradient(180deg,#eed199,#b88f4d);box-shadow:0 0 36px rgb(217 173 102 / 55%);}.you .pillar i{background:rgb(27 20 32 / 30%);}
  .cards-art .glow.gold{top:90px;width:300px;height:300px;left:calc(50% - 150px);opacity:.25;filter:blur(80px);}
  .card{position:absolute;left:calc(50% - 42px);top:96px;width:84px;height:176px;padding:16px 8px;border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:space-between;text-align:center;background:#211428;border:1px solid rgb(201 167 106 / 60%);box-shadow:0 14px 28px rgb(0 0 0 / 50%);}
  .card small{font:600 11px/14px 'Noto Serif KR',serif;letter-spacing:.8px;text-transform:uppercase;color:#c9a76a;}.card b{font:600 32px/38px 'Noto Serif KR',serif;}.card em{font-style:normal;font-size:11px;line-height:14px;color:#b8acbf;}
  .card.you{background:linear-gradient(180deg,#f2dba3,#bd9452);border:0;color:#1b1420;box-shadow:0 0 44px rgb(230 179 102 / 60%);}.card.you small,.card.you em{color:#1b1420;}
  .elements-art,.seoul-art{position:absolute;inset:0;width:100%;height:100%;}
  .elements-art .hanja{font-family:'Noto Serif KR',serif;font-weight:600;fill:#fffaf3;}.elements-art .label{font:600 12px Inter,sans-serif;fill:#b8acbf;}.elements-art .label.gold{fill:#c9a76a;}
  .node circle{filter:drop-shadow(0 0 14px var(--glow));}.node.you circle{filter:drop-shadow(0 0 24px var(--glow));}
  .moon{filter:drop-shadow(0 0 30px rgb(255 217 153 / 80%));}.window{filter:drop-shadow(0 0 8px rgb(255 179 89 / 90%));}
  .content{position:relative;margin-top:auto;padding:0 20px 32px;display:grid;gap:14px;}
  .eyebrow{font-size:12px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;color:#c9a76a;}.eyebrow span{font-family:'Noto Sans KR',sans-serif;letter-spacing:0;}
  .copies{display:grid;}
  .copy{grid-area:1/1;opacity:0;transform:translateY(16px);transition:opacity .7s cubic-bezier(.23,1,.32,1),transform .7s cubic-bezier(.23,1,.32,1);}
  .copy[data-state=current]{opacity:1;transform:none;}.copy[data-state=previous]{transform:translateY(-16px);}
  .copy h2{font:600 46px/48px 'Cormorant Garamond',serif;letter-spacing:-.4px;}.copy .gold{color:#c9a76a;}
  html[lang=ko] & .copy h2,html[lang=ja] & .copy h2,html[lang|=zh] & .copy h2{font:600 34px/44px 'Noto Serif KR',serif;letter-spacing:-.5px;}
  .copy p{margin-top:10px;font-size:15px;line-height:22px;color:#b8acbf;}
  .controls{display:flex;align-items:center;gap:6px;margin-top:6px;}
  .dot{width:24px;height:24px;padding:0;border:0;background:none;display:grid;place-items:center;cursor:pointer;}
  .dot::before{content:'';width:6px;height:6px;border-radius:3px;background:rgb(255 255 255 / 30%);transition:width .7s cubic-bezier(.23,1,.32,1),background .3s;}
  .dot[aria-current=true]{width:34px;}.dot[aria-current=true]::before{width:24px;background:#c9a76a;}
  .pause{margin-left:auto;width:36px;height:36px;border-radius:50%;border:1px solid rgb(255 255 255 / 18%);background:none;color:#f4eee7;display:grid;place-items:center;cursor:pointer;}.pause svg{width:14px;}
  .cta{display:flex;align-items:center;justify-content:center;min-height:52px;border-radius:12px;background:#c9a76a;color:#1b1420;font-size:16px;font-weight:600;box-shadow:0 8px 28px rgb(201 167 106 / 35%);}
  .free{display:flex;align-items:center;justify-content:center;gap:6px;min-height:44px;font-size:15px;font-weight:600;}.free svg{width:16px;}
  @media (prefers-reduced-motion:reduce){.art,.copy,.layer,.dot::before{transition-duration:.01s;}.art,.copy{transform:none!important;}.twinkle{animation:none;}}
`;

export default function HeroCarousel() {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [holding, setHolding] = useState(false);
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const drag = useRef<number | null>(null);
  const go = useCallback((next: number) => setIndex((next + slides.length) % slides.length), []);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (paused || holding || reduced) return;
    const timer = window.setTimeout(() => { if (!document.hidden) go(index + 1); }, ADVANCE_MS);
    return () => window.clearTimeout(timer);
  }, [index, paused, holding, reduced, go]);

  const state = (i: number) => i === index ? 'current' : i === (index - 1 + slides.length) % slides.length ? 'previous' : 'next';

  return <Hero aria-roledescription="carousel" aria-label={t('Korean fortune-telling')}
    onPointerEnter={() => setHolding(true)} onPointerLeave={() => setHolding(false)}
    onFocus={() => setHolding(true)} onBlur={() => setHolding(false)}
    onPointerDown={e => { drag.current = e.clientX; }}
    onPointerUp={e => { if (drag.current === null) return; const dx = e.clientX - drag.current; drag.current = null; if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1)); }}>
    {slides.map((s, i) => <div key={s.id} className="layer" data-state={state(i)} style={{ background: s.bg }} aria-hidden="true"><Starfield/><div className="art">{s.art}</div></div>)}
    <div className="content">
      <h1 className="eyebrow">{t('Korean fortune-telling')} · <span lang="ko">사주</span></h1>
      <div className="copies" aria-live={paused || reduced ? 'polite' : 'off'}>
        {slides.map((s, i) => <div key={s.id} className="copy" data-state={state(i)} aria-hidden={i !== index} role="group" aria-roledescription="slide" aria-label={`${i + 1} / ${slides.length}`}>
          <h2><Headline head={t(s.head)} gold={t(s.gold)}/></h2><p>{t(s.sub)}</p>
        </div>)}
      </div>
      <div className="controls">
        {slides.map((s, i) => <button key={s.id} type="button" className="dot" aria-current={i === index} aria-label={`${t('Show slide')} ${i + 1}`} onClick={() => go(i)}/>)}
        {!reduced && <button type="button" className="pause" onClick={() => setPaused(p => !p)} aria-label={t(paused ? 'Play slides' : 'Pause slides')}>{paused ? <PlayIcon/> : <PauseIcon/>}</button>}
      </div>
      <Link className="cta" to="/search">{t('Find a reading in Seoul')}</Link>
      <Link className="free" to="/today-fortune">{t('Today’s fortune — free')}<ArrowRightIcon/></Link>
    </div>
  </Hero>;
}
