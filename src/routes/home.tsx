import { CardSkeleton } from '../components/skeleton';
import HorizontalScroller from '../components/horizontal-scroller';
import HeroCarousel from '../components/home/hero-carousel';
import AiFeatures from '../components/home/ai-features';
import { useI18n } from '../i18n/i18n';
import { Link } from 'react-router-dom';
import { styled } from 'styled-components';
import { ChevronRightIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { topics, useStudios } from '../product/data';
import { Empty, ExperienceCard, Notice } from '../product/ui';

// Figma: "01 Home — Discover" (138:49). Night hero, then light sections for decisions.
const Root = styled.div`
  background:#fff;color:#1b1420;
  .light{--st-paper:#fff;--st-surface:#fff;--st-elevated:#f7f4f1;--st-accent:#f3eee6;--st-accent-line:#d3cbd8;--st-line:#e8e2ea;--st-ink:#1b1420;--st-muted:#5e5566;--st-gold:#86672c;color:#1b1420;}
  .light [data-experience-card] .save{color:#f4eee7;}
  .light [data-experience-card] .arrow{color:#4b2d5a;box-shadow:0 2px 8px rgb(27 20 32 / 12%);}
  .section{padding:44px 20px;}
  .kicker{font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#4b2d5a;}
  h2{font:600 30px/36px 'Cormorant Garamond',serif;margin-top:8px;}
`;
const Readings = styled.section`
  .top{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;}
  .map{display:flex;align-items:center;gap:2px;min-height:44px;font-size:14px;font-weight:600;color:#4b2d5a;}.map svg{width:16px;}
  .chips{display:flex;gap:8px;overflow-x:auto;margin:18px -20px 4px;padding:0 20px 4px;scrollbar-width:none;}
  .chips a{flex:none;display:flex;align-items:center;min-height:38px;padding:0 14px;border-radius:999px;border:1px solid #d3cbd8;font-size:14px;font-weight:600;white-space:nowrap;}
  .chips a:first-child{background:#1b1420;border-color:#1b1420;color:#fff;}
  .rail{display:grid;grid-auto-flow:column;grid-auto-columns:min(286px,calc(100% - 24px));gap:12px;margin-right:-20px;padding-right:20px;scroll-snap-type:x mandatory;}.rail>article{scroll-snap-align:start;}
  .preview-note{font-size:13px;line-height:19px;color:#857c8d;margin-top:14px;}
`;
const Steps = styled.section`
  background:#f7f4f1;
  ol{list-style:none;margin-top:24px;}
  li{display:grid;grid-template-columns:28px 1fr;column-gap:14px;position:relative;padding-bottom:20px;}
  li:not(:last-child)::before{content:'';position:absolute;left:13.5px;top:30px;bottom:0;width:1px;background:#d3cbd8;}
  li:last-child{padding-bottom:0;}
  .n{width:28px;height:28px;border-radius:50%;border:1px solid #d3cbd8;background:#fff;display:grid;place-items:center;font-size:13px;font-weight:700;}
  li:first-child .n{background:#4b2d5a;border-color:#4b2d5a;color:#fff;}
  h3{font-size:16px;font-weight:600;line-height:22px;padding-top:3px;}
  p{font-size:14px;line-height:21px;color:#5e5566;}
`;
const Faq = styled.section`
  .list{margin-top:12px;}
  details{border-bottom:1px solid #e8e2ea;padding:18px 0;}
  summary{display:flex;justify-content:space-between;align-items:center;gap:12px;font-size:16px;font-weight:600;line-height:22px;cursor:pointer;list-style:none;min-height:24px;}
  summary::-webkit-details-marker{display:none;}
  summary svg{width:20px;flex:none;color:#5e5566;}
  details .minus,details[open] .plus{display:none;}details[open] .minus{display:block;}
  .answer{margin-top:10px;padding:16px;border-radius:12px;background:#f7f4f1;font-size:14px;line-height:21px;color:#5e5566;}
`;

const steps = [
  ['Choose a studio and a time', 'Filter by topic, neighbourhood, language and price.'],
  ['Send a request', 'Free. Add your guests and birth details if you have them.'],
  ['The studio replies', 'You’ll get an answer in Messages. Nothing is booked until they accept.'],
  ['Visit with your interpreter', 'Open live interpretation on your phone when the session starts.'],
] as const;

const faqs = [
  ['Can I bring a friend?', 'Yes. Each studio lists how many guests it takes. Add them when you send your request, and they sit in on the same session.'],
  ['Is my request a booking?', 'No. A request asks the studio for a time. Nothing is booked until the studio accepts.'],
  ['When do I pay?', 'Payment isn’t available in the app yet. You won’t be charged when you send a request.'],
  ['What if I don’t know my birth time?', 'That’s fine. A master can read three of your four pillars from your birth date alone.'],
] as const;

export function Home() {
  const { t } = useI18n();
  const { studios, loading, error, reload } = useStudios();
  return <Root>
    <HeroCarousel/>
    <AiFeatures/>
    <Readings className="section light" aria-labelledby="readings-title">
      <div className="top">
        <div><span className="kicker">{t('Experiences')}</span><h2 id="readings-title">{t('Readings in Seoul')}</h2></div>
        <Link className="map" to="/map">{t('Map')}<ChevronRightIcon/></Link>
      </div>
      <nav className="chips" aria-label={t('Reading topics')}>{topics.slice(0, 5).map(topic => <Link key={topic.id} to={topic.id === 'all' ? '/experiences' : `/experiences?topic=${topic.id}`}>{t(topic.label)}</Link>)}</nav>
      {error ? <Notice role="alert">{error} <button onClick={reload}>{t('Retry')}</button></Notice>
        : loading ? <HorizontalScroller label={t('Curated readings')} viewportClassName="rail">{[0, 1, 2].map(n => <CardSkeleton key={n}/>)}</HorizontalScroller>
        : studios.length ? <HorizontalScroller label={t('Curated readings')} viewportClassName="rail">{studios.slice(0, 6).map(s => <ExperienceCard key={s.id} studio={s}/>)}</HorizontalScroller>
        : <Empty title={t('Readings are on their way')} body="We’re preparing our collection of local readers." to="/learn" action="Learn about Saju"/>}
      {studios.some(s => s.is_mock) && <p className="preview-note">{t('Studios marked Preview are samples while we sign up real partners. You can’t send them a request yet.')}</p>}
    </Readings>
    <Steps className="section" aria-labelledby="steps-title">
      <span className="kicker">{t('How it works')}</span><h2 id="steps-title">{t('From request to reading')}</h2>
      <ol>{steps.map(([title, body], i) => <li key={title}><span className="n" aria-hidden="true">{i + 1}</span><div><h3>{t(title)}</h3><p>{t(body)}</p></div></li>)}</ol>
    </Steps>
    <Faq className="section" aria-labelledby="faq-title">
      <span className="kicker">{t('Before you go')}</span><h2 id="faq-title">{t('Questions travellers ask')}</h2>
      <div className="list">{faqs.map(([q, a], i) => <details key={q} open={i === 0}><summary>{t(q)}<PlusIcon className="plus" aria-hidden="true"/><MinusIcon className="minus" aria-hidden="true"/></summary><div className="answer">{t(a)}</div></details>)}</div>
    </Faq>
  </Root>;
}
