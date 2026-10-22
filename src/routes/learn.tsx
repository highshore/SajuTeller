import { useI18n } from '../i18n/i18n';
import { Link, useParams } from 'react-router-dom';
import { styled } from 'styled-components';
import { ArrowLeftIcon, ArrowRightIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { guides } from '../product/guides';
import { ButtonLink, Empty, Page, Wrap } from '../product/ui';

const Root = styled.div`
  .kicker{font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--st-brand);}
  h1{font:600 40px/1.05 'Cormorant Garamond',serif;letter-spacing:-.5px;margin:8px 0 10px;}
  .lead{font-size:15px;line-height:1.55;color:var(--st-muted);margin-bottom:24px;}
  .guides{list-style:none;margin:0;padding:0;display:grid;gap:12px;}
  .guide{display:grid;grid-template-columns:6px minmax(0,1fr) 18px;gap:16px;align-items:center;padding:18px 16px 18px 0;border:1px solid var(--st-line);border-radius:16px;background:var(--st-surface);overflow:hidden;}
  .tone{align-self:stretch;margin:-18px 0;}
  .guide .eyebrow{font-size:12px;font-weight:600;letter-spacing:.8px;text-transform:uppercase;color:var(--st-faint);}
  .guide h2{font:600 24px/1.15 'Cormorant Garamond',serif;letter-spacing:0;margin:4px 0 6px;}
  .guide p{font-size:14px;line-height:1.5;color:var(--st-muted);}
  .guide>svg{width:18px;color:var(--st-faint);}
  .tools{margin-top:40px;}
  .tools h2{font:600 30px/36px 'Cormorant Garamond',serif;letter-spacing:0;margin:8px 0 12px;}
  .tools a{display:grid;grid-template-columns:minmax(0,1fr) 18px;gap:12px;align-items:center;padding:16px 0;border-bottom:1px solid var(--st-line);}
  .tools a:first-of-type{border-top:1px solid var(--st-line);}
  .tools strong{display:block;font-size:16px;font-weight:600;}.tools span{display:block;font-size:14px;color:var(--st-muted);margin-top:2px;}
  .tools svg{width:18px;color:var(--st-faint);}
  .back{display:inline-flex;align-items:center;gap:6px;min-height:44px;font-size:14px;font-weight:600;color:var(--st-muted);}.back svg{width:16px;}
  .hero{margin:8px -16px 8px;padding:28px 20px 24px;}
  .hero h1{color:#1b1420;}.hero .lead{color:#5e5566;margin:0;}.hero .kicker{color:#4b2d5a;}
  .sections{list-style:none;margin:0;padding:0;}
  .sections li{display:grid;grid-template-columns:28px minmax(0,1fr);column-gap:14px;position:relative;padding:24px 0 0;}
  .n{width:28px;height:28px;border-radius:50%;border:1px solid var(--st-accent-line);display:grid;place-items:center;font-size:13px;font-weight:700;font-variant-numeric:tabular-nums;}
  .sections h2{font-size:18px;font-weight:600;letter-spacing:0;line-height:1.35;margin:2px 0 8px;}
  .sections p{font-size:16px;line-height:1.65;color:var(--st-muted);}
  .next{margin-top:36px;padding:20px;border-radius:16px;background:var(--st-elevated);}
  .next h2{font:600 26px/1.15 'Cormorant Garamond',serif;letter-spacing:0;margin:0 0 6px;}
  .next p{font-size:14px;line-height:1.55;color:var(--st-muted);margin-bottom:16px;}
  .next a{width:100%;}
  .others{margin-top:28px;}
  .others h3{font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--st-faint);margin-bottom:4px;}
`;

export default function Learn() {
  const { t } = useI18n();
  const { slug } = useParams();
  if (slug) {
    const guide = guides.find(g => g.slug === slug);
    if (!guide) return <Page><Wrap><Empty title={t('Let’s find another story.')} body="This guide isn’t in the collection." to="/learn" action="See the guides"/></Wrap></Page>;
    const others = guides.filter(g => g.slug !== slug).slice(0, 3);
    return <Page><Wrap><Root>
      <Link className="back" to="/learn"><ArrowLeftIcon/>{t('The field guide')}</Link>
      {/* Guide tones are fixed pastel colours, so the hero keeps fixed dark text. */}
      <header className="hero" style={{ background: guide.tone }}><span className="kicker">{t(guide.eyebrow)}</span><h1>{t(guide.title)}</h1><p className="lead">{t(guide.summary)}</p></header>
      <ol className="sections">{guide.sections.map(([title, text], i) => <li key={title}><span className="n" aria-hidden="true">{i + 1}</span><div><h2>{t(title)}</h2><p>{t(text)}</p></div></li>)}</ol>
      <section className="next"><h2>{t('Turn curiosity into a Seoul story.')}</h2><p>{t('Find a reader for the question on your mind.')}</p><ButtonLink to={`/experiences?topic=${guide.topic}`}>{t('Explore experiences')}<ArrowRightIcon/></ButtonLink></section>
      <nav className="tools others" aria-label={t('See the guides')}><h3>{t('See the guides')}</h3>{others.map(g => <Link key={g.slug} to={`/learn/${g.slug}`}><div><strong>{t(g.title)}</strong><span>{t(g.summary)}</span></div><ChevronRightIcon aria-hidden="true"/></Link>)}</nav>
    </Root></Wrap></Page>;
  }
  return <Page><Wrap><Root>
    <span className="kicker">{t('The SajuTeller field guide')}</span>
    <h1>{t('Come curious. Feel a little more at home.')}</h1>
    <p className="lead">{t('Meet the tradition, find your questions, and get ready for your first reading. No Korean vocabulary required.')}</p>
    <ul className="guides">{guides.map(g => <li key={g.slug}><Link className="guide" to={`/learn/${g.slug}`}><span className="tone" style={{ background: g.tone }} aria-hidden="true"/><div><span className="eyebrow">{t(g.eyebrow)}</span><h2>{t(g.title)}</h2><p>{t(g.summary)}</p></div><ChevronRightIcon aria-hidden="true"/></Link></li>)}</ul>
    <section className="tools">
      <span className="kicker">{t('A little more to explore')}</span><h2>{t('Your digital Saju corner')}</h2>
      {[['/today-fortune', 'Today’s fortune', 'Explore the existing AI fortune experience.'], ['/name-creation', 'Find your Korean name', 'A playful way to explore a Korean name.'], ['/live-translation', 'Your conversation companion', 'AI interpretation for a reading in another language.']].map(([to, title, text]) => <Link key={to} to={to}><div><strong>{t(title)}</strong><span>{t(text)}</span></div><ChevronRightIcon aria-hidden="true"/></Link>)}
    </section>
  </Root></Wrap></Page>;
}
