import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { styled } from 'styled-components';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useI18n } from '../../i18n/i18n';

// Figma: Home "AI features" (160:341) — four product previews in a scroll-snap rail.
const Section = styled.section`
  padding:40px 0 36px;background:#f7f4f1;color:#1b1420;
  .head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;padding:0 20px;}
  .kicker{font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#4b2d5a;}
  h2{font:600 32px/36px 'Cormorant Garamond',serif;margin-top:8px;}
  .count{font-size:13px;font-weight:600;color:#857c8d;padding-bottom:6px;font-variant-numeric:tabular-nums;}
  .rail{display:grid;grid-auto-flow:column;grid-auto-columns:256px;gap:12px;overflow-x:auto;padding:20px 20px 4px;scroll-padding:0 20px;scroll-snap-type:x mandatory;scrollbar-width:none;overscroll-behavior-x:contain;}
  .rail::-webkit-scrollbar{display:none;}
  .dots{display:flex;justify-content:center;gap:6px;margin-top:16px;}.dots i{width:6px;height:6px;border-radius:3px;background:#d3cbd8;transition:width .3s cubic-bezier(.23,1,.32,1),background .3s;}.dots i.on{width:18px;background:#4b2d5a;}
  @media (prefers-reduced-motion:reduce){.dots i{transition:none;}}
`;

const Card = styled(Link)<{ $tone: 'night' | 'plum' | 'light' }>`
  scroll-snap-align:start;height:320px;border-radius:22px;padding:18px;display:flex;flex-direction:column;overflow:hidden;position:relative;
  background:${p => p.$tone === 'night' ? 'linear-gradient(180deg,#130a1b,#3c1e48)' : p.$tone === 'plum' ? 'linear-gradient(180deg,#3d2150,#6b3861)' : '#fff'};
  color:${p => p.$tone === 'light' ? '#1b1420' : '#f4eee7'};border:${p => p.$tone === 'light' ? '1px solid #e8e2ea' : '0'};
  .chip{align-self:flex-start;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:600;background:${p => p.$tone === 'light' ? 'rgb(75 45 90 / 8%)' : 'rgb(255 255 255 / 10%)'};color:${p => p.$tone === 'light' ? '#4b2d5a' : '#c9a76a'};}
  .visual{flex:1;display:grid;place-items:center;align-content:center;gap:8px;min-height:0;}
  h3{font:600 24px/28px 'Cormorant Garamond',serif;}
  p{font-size:13px;line-height:18px;margin-top:4px;color:${p => p.$tone === 'light' ? '#5e5566' : '#b8acbf'};}
  .go{display:flex;align-items:center;gap:6px;margin-top:10px;font-size:14px;font-weight:600;color:${p => p.$tone === 'light' ? '#4b2d5a' : '#f4eee7'};}.go svg{width:16px;}
  .orbs{display:flex;align-items:center;gap:10px;font-size:12px;color:#b8acbf;}
  .orb{width:56px;height:56px;border-radius:50%;display:grid;place-items:center;font:600 23px 'Noto Serif KR',serif;color:#fffaf3;}
  .orb.water{background:radial-gradient(#8ca8f2,rgb(140 168 242 / 25%));box-shadow:0 0 18px rgb(140 168 242 / 55%);}
  .orb.fire{background:radial-gradient(#f29a4d,rgb(242 154 77 / 25%));box-shadow:0 0 18px rgb(242 154 77 / 55%);}
  .quote{font:600 17px/21px 'Cormorant Garamond',serif;text-align:center;max-width:200px;}
  .pair{display:flex;}
  .pair span{width:44px;height:98px;border-radius:24px;display:grid;place-content:center;gap:2px;font:600 19px/24px 'Noto Serif KR',serif;color:#1b1420;text-align:center;}
  .pair span:first-child{background:linear-gradient(#b8bdf2,#6b54b3);rotate:7deg;box-shadow:0 0 20px rgb(184 189 242 / 50%);}
  .pair span:last-child{background:linear-gradient(#eed99e,#9eb873);rotate:-7deg;margin-left:-8px;box-shadow:0 0 20px rgb(238 217 158 / 50%);}
  .seal{padding:6px;border-radius:8px;background:#b82924;rotate:-4deg;box-shadow:0 6px 16px rgb(179 38 26 / 35%);}
  .seal span{display:block;padding:3px 6px;border:1.5px solid #ffede0;border-radius:5px;color:#fff2e6;font:600 18px/22px 'Noto Serif KR',serif;}
  .seal.small span{font-size:12px;line-height:16px;padding:1px 4px;}
  .korean{font:600 30px/38px 'Noto Serif KR',serif;}.roman{font-size:12px;color:#5e5566;}
  .chat{width:100%;display:grid;gap:8px;}
  .bubble{padding:8px 10px;border-radius:12px;font-size:14px;font-weight:500;line-height:19px;}
  .bubble small{display:block;font-family:'Noto Sans KR',sans-serif;font-size:12px;line-height:16px;font-weight:400;}
  .bubble.them{background:#f7f4f1;border-top-left-radius:4px;}.bubble.them small{color:#857c8d;}
  .bubble.you{background:#4b2d5a;color:#fff;justify-self:end;border-top-right-radius:4px;}.bubble.you small{color:#b8acbf;}
`;

export default function AiFeatures() {
  const { t } = useI18n();
  const rail = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const node = rail.current;
    if (!node) return;
    const sync = () => setActive(Math.min(3, Math.round(node.scrollLeft / 268)));
    node.addEventListener('scroll', sync, { passive: true });
    return () => node.removeEventListener('scroll', sync);
  }, []);

  return <Section aria-labelledby="ai-features-title">
    <div className="head">
      <div><div className="kicker">{t('Free · powered by AI')}</div><h2 id="ai-features-title">{t('Try Saju in a minute')}</h2></div>
      <span className="count" aria-hidden="true">{active + 1} / 4</span>
    </div>
    <div className="rail" ref={rail} role="region" aria-label={t('AI readings')} tabIndex={0}>
      <Card to="/today-fortune" $tone="night">
        <span className="chip">{t('Free · 1 min')}</span>
        <div className="visual" aria-hidden="true">
          <div className="orbs"><span className="orb water" lang="zh-Hant">水</span>{t('meets')}<span className="orb fire" lang="zh-Hant">火</span></div>
          <div className="quote">“{t('Today leans toward patience.')}”</div>
        </div>
        <h3>{t('Today’s fortune')}</h3><p>{t('From your birth date. New daily.')}</p>
        <span className="go">{t('See yours')}<ArrowRightIcon/></span>
      </Card>
      <Card to="/experiences?topic=compatibility" $tone="plum">
        <span className="chip">{t('Coming soon')}</span>
        <div className="visual" aria-hidden="true">
          <div className="pair"><span lang="zh-Hant">癸<br/>卯</span><span lang="zh-Hant">甲<br/>寅</span></div>
          <div className="seal small"><span lang="zh-Hant">相生</span></div>
        </div>
        <h3>{t('Couple match')}</h3><p>{t('Two birth dates, one reading.')}</p>
        <span className="go">{t('See couple readings')}<ArrowRightIcon/></span>
      </Card>
      <Card to="/name-creation" $tone="light">
        <span className="chip">{t('Free')}</span>
        <div className="visual" aria-hidden="true">
          <div className="seal"><span lang="zh-Hant">大仁</span></div>
          <div className="korean" lang="ko">류대인</div><div className="roman">Ryu Dae-in · {t('great, kind')}</div>
        </div>
        <h3>{t('Korean name')}</h3><p>{t('By sound, meaning, or both.')}</p>
        <span className="go">{t('Create')}<ArrowRightIcon/></span>
      </Card>
      <Card to="/live-translation" $tone="light">
        <span className="chip">{t('In every session')}</span>
        <div className="visual" aria-hidden="true">
          <div className="chat">
            <div className="bubble them"><small lang="ko">일간이 갑목이에요.</small>{t('Your day master is Yang Wood.')}</div>
            <div className="bubble you">{t('Should I change jobs?')}<small lang="ko">이직해야 할까요?</small></div>
          </div>
        </div>
        <h3>{t('Live interpreter')}</h3><p>{t('Korean ⇄ your language, both ways.')}</p>
        <span className="go">{t('How it works')}<ArrowRightIcon/></span>
      </Card>
    </div>
    <div className="dots" aria-hidden="true">{[0, 1, 2, 3].map(i => <i key={i} className={i === active ? 'on' : undefined}/>)}</div>
  </Section>;
}
