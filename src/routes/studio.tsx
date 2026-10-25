import { useI18n } from '../i18n/i18n';
import { Link } from 'react-router-dom';
import { styled } from 'styled-components';
import { ArrowRightIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Page, Wrap } from '../product/ui';

// Oracle Studio hub: the free AI tools, in the same language as Home "Try Saju in a minute".
const Root = styled.div`
  .kicker{font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--st-brand);}
  h1{font:600 40px/1.05 'Cormorant Garamond',serif;letter-spacing:-.5px;margin:8px 0 10px;}
  .lead{font-size:15px;line-height:1.55;color:var(--st-muted);margin-bottom:24px;}
  .featured{display:block;border-radius:20px;padding:20px;color:#f4eee7;background:linear-gradient(180deg,#130a1b,#3c1e48);}
  .featured .chip{display:inline-block;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:600;background:rgb(255 255 255 / 10%);color:#c9a76a;}
  .featured .glyphs{display:flex;align-items:center;gap:10px;margin:28px 0 22px;font-size:13px;color:#b8acbf;}
  .featured .glyphs span{font:600 30px/1 'Noto Serif KR',serif;color:#fffaf3;}
  .featured h2{font:600 30px/1.1 'Cormorant Garamond',serif;letter-spacing:0;margin:0 0 6px;}
  .featured p{font-size:14px;line-height:1.5;color:#b8acbf;}
  .featured .go{display:flex;align-items:center;gap:6px;margin-top:16px;min-height:24px;font-size:15px;font-weight:600;}.featured .go svg{width:16px;}
  .list{margin-top:24px;border-top:1px solid var(--st-line);}
  .list a{display:grid;grid-template-columns:44px minmax(0,1fr) 18px;gap:14px;align-items:center;padding:16px 0;border-bottom:1px solid var(--st-line);}
  .glyph{width:44px;height:44px;border-radius:12px;background:var(--st-accent);display:grid;place-items:center;font:600 20px/1 'Noto Serif KR',serif;color:var(--st-brand);}
  .list strong{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:16px;font-weight:600;}
  .list small{font-size:12px;font-weight:600;color:var(--st-faint);}
  .list span.sub{display:block;font-size:14px;line-height:1.5;color:var(--st-muted);margin-top:2px;}
  .list>a>svg{width:18px;color:var(--st-faint);}
  .note{font-size:13px;line-height:1.55;color:var(--st-faint);margin-top:16px;}
`;
const tools = [
  ['/face-reading', '相', 'AI face reading', 'Gwansang from one selfie. Never saved.', 'Free'],
  ['/name-creation', '名', 'Korean name', 'By sound, meaning, or both.', 'Free'],
  ['/live-translation', '譯', 'Live interpreter', 'Korean ⇄ your language, both ways.', 'In every session'],
  ['/couple', '緣', 'Couple match', 'Two birth dates, one reading.', 'Free'],
] as const;

export default function Studio() {
  const { t } = useI18n();
  return <Page><Wrap><Root>
    <span className="kicker">{t('Free · powered by AI')}</span>
    <h1>{t('Try Saju in a minute')}</h1>
    <p className="lead">{t('Small readings you can try on your phone before, or after, a visit to a studio.')}</p>
    <Link className="featured" to="/today-fortune">
      <span className="chip">{t('Free · 1 min')}</span>
      <div className="glyphs" aria-hidden="true"><span lang="zh-Hant">水</span>{t('meets')}<span lang="zh-Hant">火</span></div>
      <h2>{t('Today’s fortune')}</h2><p>{t('From your birth date. New daily.')}</p>
      <span className="go">{t('See yours')}<ArrowRightIcon/></span>
    </Link>
    <nav className="list" aria-label={t('AI readings')}>{tools.map(([to, glyph, title, body, tag]) => <Link key={to} to={to}><span className="glyph" lang="zh-Hant" aria-hidden="true">{glyph}</span><div><strong>{t(title)}<small>{t(tag)}</small></strong><span className="sub">{t(body)}</span></div><ChevronRightIcon aria-hidden="true"/></Link>)}</nav>
    <p className="note">{t('AI readings are for reflection and fun. They are not a substitute for a reading with a person.')}</p>
  </Root></Wrap></Page>;
}
