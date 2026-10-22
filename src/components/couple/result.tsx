import { useMemo, useState } from 'react';
import { styled } from 'styled-components';
import { ArrowUpOnSquareIcon, ChevronLeftIcon, LinkIcon, LockClosedIcon, UsersIcon } from '@heroicons/react/24/outline';
import { useI18n } from '../../i18n/i18n';
import { ButtonLink } from '../../product/ui';
import { BRANCHES, ELEMENTS, ELEMENT_HANJA, STEMS, branchElement, stemElement, weekAhead, type Chart, type Pillar } from '../../product/saju';
import { A_COLOR, B_COLOR, ELEMENT_INK, ELEMENT_TINT, Screen } from './styles';
import { BADGE, HEADLINE, PALACE_COPY, PALACE_TITLE, SEAL, SUMMARY, WEEK_TONE, animalName, elementName, fill, type Reading } from './copy';

// Figma 152:800 "20 — Result".
const Head = styled.header`
  background:linear-gradient(180deg,#130a1b,#3c1e48);color:#f4eee7;padding:4px 20px 0;
  .bar{display:grid;grid-template-columns:44px 1fr 44px;align-items:center;height:56px;margin:0 -12px;}
  .bar button{width:44px;height:44px;border:0;background:none;color:inherit;display:grid;place-items:center;border-radius:50%;cursor:pointer;}
  .bar svg{width:22px;height:22px;}
  .faces{display:flex;justify-content:center;}
  .faces span{width:32px;height:32px;border-radius:50%;display:grid;place-items:center;font:600 15px 'Noto Serif KR',serif;border:2px solid #1b1420;}
  .faces span + span{margin-left:-6px;}
  .badge{display:inline-flex;gap:6px;margin-top:8px;padding:4px 10px;border-radius:8px;background:rgb(255 255 255 / 8%);font-size:13px;font-weight:600;color:#c9a76a;}
  h1{color:#f4eee7;margin:12px 0 8px;overflow-wrap:anywhere;}
  .summary{font-size:15px;line-height:22px;color:#b8acbf;}
  nav{display:flex;gap:24px;margin-top:18px;overflow-x:auto;scrollbar-width:none;}
  nav button{flex:none;min-height:44px;padding:0 0 4px;border:0;border-bottom:2px solid transparent;background:none;color:#b8acbf;font-size:15px;font-weight:600;cursor:pointer;}
  nav button[aria-current=true]{color:#f4eee7;border-color:#c9a76a;}
`;

const Body = styled.div`
  padding:0 20px;
  section{padding-top:32px;scroll-margin-top:calc(var(--ks-header-height) + 8px);}
  .card{margin-top:16px;padding:18px 16px;border-radius:16px;background:var(--st-elevated);}
  .spark{display:grid;gap:16px;}
  .spark .row-top{display:flex;justify-content:space-between;gap:8px;align-items:baseline;font-size:15px;font-weight:600;margin-bottom:8px;}
  .spark .locked{color:var(--st-faint);}
  .spark .need{display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:500;color:var(--st-faint);text-align:right;}.spark .need svg{width:14px;height:14px;flex:none;}
  .steps{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;}
  .steps i{height:8px;border-radius:4px;background:#d9d1de;}
  .steps i.on{background:linear-gradient(90deg,#6b4fb3,#8f72d1);}
  .locked .steps i{background:#e6e0e8;}
  .legend{display:flex;gap:16px;margin-top:14px;font-size:13px;color:var(--st-muted);}
  .legend span{display:inline-flex;align-items:center;gap:6px;}.legend i{width:10px;height:10px;border-radius:50%;}
  .mix{display:grid;gap:12px;margin-top:14px;}
  .mix li{display:grid;grid-template-columns:72px 1fr 20px;gap:10px;align-items:center;font-size:14px;}
  .mix .el{display:flex;align-items:center;gap:6px;}.mix .el .hanja{font-size:18px;color:var(--st-action);}
  .track{height:12px;border-radius:6px;background:var(--st-elevated);display:flex;overflow:hidden;}
  .track i{height:100%;}
  .mix b{text-align:right;font-weight:700;font-variant-numeric:tabular-nums;}
  .mix b.zero{color:var(--st-gold);}
  .explained{margin-top:18px;padding:16px;border-radius:14px;background:var(--st-accent);}
  .explained h3{font-size:15px;font-weight:600;color:var(--st-action);}
  .explained p{margin-top:6px;font-size:14px;line-height:21px;color:var(--st-muted);}
  .between{margin-top:14px;border:1px solid var(--st-line);border-radius:14px;overflow:hidden;}
  .between h3{padding:10px 16px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;}
  .between ul{padding:12px 16px;display:grid;gap:8px;font-size:15px;line-height:21px;}
  .between.harmony h3{background:var(--st-success-bg);color:var(--st-success);}
  .between.flux h3{background:var(--st-accent);color:var(--st-action);}
  .between.challenges h3{background:var(--st-preview-bg);color:var(--st-preview);}
  .palace{margin-top:32px;display:grid;grid-template-columns:auto 1fr;gap:16px;align-items:center;padding:18px 16px;border:1px solid var(--st-line);border-radius:16px;}
  .tiles{display:flex;gap:6px;}
  .tiles span{width:44px;height:48px;border-radius:10px;display:grid;place-items:center;font:600 21px 'Noto Serif KR',serif;}
  .palace .kicker{font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--st-action);}
  .palace .ptitle{display:block;margin-top:2px;font-size:14px;font-weight:600;}
  .palace p{margin-top:4px;font-size:14px;line-height:20px;color:var(--st-muted);}
  .lockcard{margin-top:24px;padding:18px 16px;border-radius:16px;background:#160c1f;color:#f4eee7;}
  .lockcard .t{display:flex;align-items:center;gap:8px;font-size:16px;font-weight:600;}.lockcard svg{width:20px;height:20px;color:#c9a76a;flex:none;}
  .lockcard p{margin-top:6px;font-size:14px;line-height:20px;color:#b8acbf;}
  .lockcard button{margin-top:14px;width:100%;min-height:48px;border:0;border-radius:12px;background:#c9a76a;color:#1b1420;font-size:15px;font-weight:600;cursor:pointer;}
  .days{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;margin-top:14px;}
  .days button{min-height:60px;padding:6px 0;border-radius:12px;border:1px solid transparent;background:none;color:var(--st-ink);display:grid;place-content:center;gap:2px;cursor:pointer;font-variant-numeric:tabular-nums;}
  .days small{font-size:12px;color:var(--st-muted);}.days b{font-size:17px;font-weight:700;}
  .days .dot{width:5px;height:5px;border-radius:50%;margin:2px auto 0;background:transparent;}
  .days .dot.plan{background:var(--st-success);}.days .dot.space{background:var(--st-preview);}
  .days button.today{border-color:var(--st-line);}
  .days button[aria-pressed=true]{background:#1b1420;color:#fff;border-color:#1b1420;}.days button[aria-pressed=true] small{color:#d3cbd8;}
  .day-card{margin-top:12px;padding:16px;border-radius:14px;background:var(--st-elevated);}
  .day-card h3{font-size:15px;font-weight:600;}
  .day-card p{margin-top:6px;font-size:14px;line-height:20px;color:var(--st-muted);}
  .day-card .meta{margin-top:8px;font-size:12px;color:var(--st-faint);}
  .charts{display:grid;gap:12px;margin-top:14px;}
  .chart{border:1px solid var(--st-line);border-radius:14px;padding:14px 16px;}
  .chart h3{font-size:15px;font-weight:600;display:flex;align-items:center;gap:8px;}.chart h3 i{width:10px;height:10px;border-radius:50%;}
  .cols{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:12px;text-align:center;}
  .cols small{display:block;font-size:12px;color:var(--st-muted);margin-bottom:6px;}
  .cols .p{display:grid;gap:4px;justify-items:center;padding:10px 0;border-radius:12px;background:var(--st-elevated);}
  .cols .p.day{background:var(--st-accent);}
  .cols .p span{font:600 22px/26px 'Noto Serif KR',serif;}
  .cols .p em{font-style:normal;font-size:12px;color:var(--st-muted);}
  .cols .missing{display:grid;place-items:center;min-height:100%;padding:10px 4px;border-radius:12px;border:1px dashed var(--st-line);font-size:12px;line-height:16px;color:var(--st-faint);}
  .share{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px;}
  .share button{min-height:48px;border:1px solid var(--st-line);border-radius:12px;background:var(--st-paper);color:var(--st-ink);display:flex;align-items:center;justify-content:center;gap:8px;font-size:15px;font-weight:600;cursor:pointer;}
  .share svg{width:18px;height:18px;}
  .status{min-height:18px;margin-top:8px;font-size:13px;color:var(--st-success);}
  .disclaimer{padding:28px 0 20px;font-size:12px;color:var(--st-faint);}
`;

const Upsell = styled.section`
  padding:28px 20px 32px;background:linear-gradient(180deg,#130a1b,#2b1638);color:#f4eee7;
  .k{font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#c9a76a;}
  h2{color:#f4eee7;margin-top:12px;}
  p{display:flex;gap:10px;margin-top:12px;font-size:14px;line-height:20px;color:#b8acbf;}
  p svg{width:20px;height:20px;flex:none;color:#c9a76a;}
  a{margin-top:20px;width:100%;min-height:52px;border-radius:12px;font-size:16px;}
`;

type Who = 'you' | 'them';
type Props = { reading: Reading; aName: string; bName: string; language: string; onBack: () => void; onAddTime: (who: Who) => void };

const localeOf = (language: string) => ({ ko: 'ko-KR', zh: 'zh-CN', ja: 'ja-JP', es: 'es-ES' } as Record<string, string>)[language] ?? 'en-GB';

function PillarCell({ label, pillar }: { label: string; pillar: Pillar | null }) {
  const { t } = useI18n();
  if (!pillar) return <div><small>{t(label)}</small><div className="missing">{t('Add a birth time')}</div></div>;
  return <div><small>{t(label)}</small><div className={label === 'Day' ? 'p day' : 'p'}>
    <span lang="zh-Hant">{STEMS[pillar.stem]}</span><em>{t(ELEMENTS[stemElement(pillar.stem)])}</em>
    <span lang="zh-Hant">{BRANCHES[pillar.branch]}</span><em>{t(ELEMENTS[branchElement(pillar.branch)])}</em>
  </div></div>;
}

function ChartCard({ name, color, chart }: { name: string; color: string; chart: Chart }) {
  return <div className="chart">
    <h3><i style={{ background: color }} aria-hidden="true"/>{name}</h3>
    <div className="cols"><PillarCell label="Hour" pillar={chart.hour}/><PillarCell label="Day" pillar={chart.day}/><PillarCell label="Year" pillar={chart.year}/></div>
  </div>;
}

export default function CoupleResult({ reading, aName, bName, language, onBack, onAddTime }: Props) {
  const { t } = useI18n();
  const { a, b, aEl, bEl, family, relation, giver, taker, palace, spark, countsA, countsB } = reading;
  const [tab, setTab] = useState<'overview' | 'week' | 'charts'>('overview');
  const [status, setStatus] = useState('');
  const week = useMemo(() => weekAhead(new Date(), aEl, bEl), [aEl, bEl]);
  const [dayIndex, setDayIndex] = useState(() => Math.max(0, week.findIndex(d => d.tone === 'plan')));
  const locale = localeOf(language);
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  const missingA = !a.hour, missingB = !b.hour;
  const vars = { a: aName, b: bName, x: t(elementName(giver)), y: t(elementName(taker)) };
  const totals = countsA.map((n, i) => n + countsB[i]);
  const scale = Math.max(6, ...totals);
  const pillarsUsed = a.hour && b.hour ? t('Counted from both charts’ year, day and hour pillars.') : t('Counted from the year and day pillars (and hour, where a time was given).');
  const selected = week[dayIndex];

  const jump = (id: 'overview' | 'week' | 'charts') => {
    setTab(id);
    document.getElementById(`couple-${id}`)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  };

  const shareText = `${aName} & ${bName}: ${t(HEADLINE[family])} (${SEAL[family]} · ${t(elementName(aEl))} + ${t(elementName(bEl))}). ${t('Try a free Saju compatibility reading:')}`;
  const url = `${window.location.origin}/couple`;
  async function share() {
    try {
      if (navigator.share) { await navigator.share({ text: shareText, url }); return; }
      await navigator.clipboard.writeText(`${shareText} ${url}`);
      setStatus(t('Copied — paste it anywhere.'));
    } catch (error) {
      if ((error as DOMException)?.name !== 'AbortError') setStatus(t('Couldn’t share from this browser.'));
    }
  }
  async function copyLink() {
    try { await navigator.clipboard.writeText(url); setStatus(t('Link copied.')); } catch { setStatus(t('Couldn’t copy from this browser.')); }
  }

  const lockText = missingA && missingB ? t('Neither of you added a birth time. It opens “Everyday life” and both Hour pillars.')
    : missingB ? fill(t('{name} hasn’t added a birth time. It opens “Everyday life” and both Hour pillars.'), { name: bName })
    : t('You haven’t added a birth time. It opens “Everyday life” and both Hour pillars.');
  const needLabel = missingA && missingB ? t('Needs both birth times') : missingB ? fill(t('Needs {name}’s birth time'), { name: bName }) : t('Needs your birth time');

  const sparkRows: [string, number | null][] = [['Talk', spark.talk], ['Trust', spark.trust], ['Passion', spark.passion], ['Everyday life', spark.everyday]];

  return <Screen>
    <Head>
      <div className="bar">
        <button type="button" onClick={onBack} aria-label={t('Back')}><ChevronLeftIcon/></button>
        <div className="faces" aria-hidden="true">
          <span lang="zh-Hant" style={{ background: ELEMENT_TINT[aEl], color: ELEMENT_INK[aEl] }}>{STEMS[a.day.stem]}</span>
          <span lang="zh-Hant" style={{ background: ELEMENT_TINT[bEl], color: ELEMENT_INK[bEl] }}>{STEMS[b.day.stem]}</span>
        </div>
        <button type="button" onClick={share} aria-label={t('Share')}><ArrowUpOnSquareIcon/></button>
      </div>
      <span className="badge"><span lang="zh-Hant">{SEAL[family]}</span>· {t(BADGE[family])}</span>
      <h1>{aName} &amp; {bName}</h1>
      <p className="summary">{fill(t(SUMMARY[relation]), vars)}</p>
      <nav aria-label={t('Sections')}>
        {([['overview', 'Overview'], ['week', 'This week'], ['charts', 'Both charts']] as const).map(([id, label]) =>
          <button key={id} type="button" aria-current={tab === id} onClick={() => jump(id)}>{t(label)}</button>)}
      </nav>
    </Head>

    <Body>
      <section id="couple-overview" aria-labelledby="couple-spark">
        <h2 id="couple-spark">{t('Your spark')}</h2>
        <p className="sub">{t('Five steps each. No scores out of 100 — Saju doesn’t work that way.')}</p>
        <div className="card spark">
          {sparkRows.map(([label, value]) => <div key={label} className={value === null ? 'locked' : undefined}>
            <div className="row-top"><span>{t(label)}</span>{value === null
              ? <span className="need"><LockClosedIcon aria-hidden="true"/>{needLabel}</span>
              : <span className="sr">{fill(t('{n} of 5'), { n: String(value) })}</span>}</div>
            <div className="steps" aria-hidden="true">{[1, 2, 3, 4, 5].map(n => <i key={n} className={value !== null && n <= value ? 'on' : undefined}/>)}</div>
          </div>)}
        </div>
        <p className="note" style={{ marginTop: 10 }}>{t('Steps come from your Day elements and the spouse palace — the same dates always give the same reading.')}</p>

        <h2 style={{ marginTop: 36 }}>{t('Your element mix')}</h2>
        <p className="sub">{pillarsUsed}</p>
        <div className="legend"><span><i style={{ background: A_COLOR }}/>{aName}</span><span><i style={{ background: B_COLOR }}/>{bName}</span></div>
        <ul className="mix">{ELEMENTS.map((name, i) => <li key={name}>
          <span className="el"><span className="hanja" lang="zh-Hant" aria-hidden="true">{ELEMENT_HANJA[i]}</span>{t(name)}</span>
          <span className="track" role="img" aria-label={`${aName} ${countsA[i]}, ${bName} ${countsB[i]}`}>
            <i style={{ width: `${countsA[i] / scale * 100}%`, background: A_COLOR }}/><i style={{ width: `${countsB[i] / scale * 100}%`, background: B_COLOR }}/>
          </span>
          <b className={totals[i] ? undefined : 'zero'}>{totals[i]}</b>
        </li>)}</ul>
        <div className="explained">
          <h3>{t('Your elements, explained')}</h3>
          <p>{reading.explained.map(line => t(line)).join(' ')}</p>
        </div>

        <h2 style={{ marginTop: 36 }}>{t('Between the two of you')}</h2>
        {(['harmony', 'flux', 'challenges'] as const).map(kind => <div key={kind} className={`between ${kind}`}>
          <h3>{t(kind === 'harmony' ? 'Harmony' : kind === 'flux' ? 'In flux' : 'Challenges')}</h3>
          <ul>{reading.between[kind].map(line => <li key={line}>{t(line)}</li>)}</ul>
        </div>)}

        <div className="palace">
          <div className="tiles" aria-hidden="true">{[a.day.branch, b.day.branch].map((br, i) => <span key={i} lang="zh-Hant" style={{ background: ELEMENT_TINT[branchElement(br)], color: ELEMENT_INK[branchElement(br)] }}>{BRANCHES[br]}</span>)}</div>
          <div>
            <span className="kicker">{t('Spouse palace')}</span>
            <span className="ptitle">{t(PALACE_TITLE[palace])}</span>
            <p>{fill(t(PALACE_COPY[palace]), { p: `${t(animalName(a.day.branch))} ${BRANCHES[a.day.branch]}`, q: `${t(animalName(b.day.branch))} ${BRANCHES[b.day.branch]}` })}</p>
          </div>
        </div>

        {(missingA || missingB) && <div className="lockcard">
          <div className="t"><LockClosedIcon aria-hidden="true"/>{t('Everyday life is still locked')}</div>
          <p>{lockText}</p>
          <button type="button" onClick={() => onAddTime(missingB ? 'them' : 'you')}>{missingB ? fill(t('Add {name}’s birth time'), { name: bName }) : t('Add your birth time')}</button>
        </div>}
      </section>

      <section id="couple-week" aria-labelledby="couple-week-title">
        <h2 id="couple-week-title">{t('You two this week')}</h2>
        <p className="sub">{t('Each day has its own pillar. We compare its element with both of your Day elements.')}</p>
        <div className="days" role="group" aria-label={t('Pick a day')}>{week.map((d, i) => <button key={i} type="button" className={i === 0 ? 'today' : undefined} aria-pressed={i === dayIndex} onClick={() => setDayIndex(i)}>
          <small>{weekday.format(d.date)}</small><b>{d.date.getDate()}</b><span className={`dot ${d.tone}`} aria-hidden="true"/>
        </button>)}</div>
        <div className="day-card" aria-live="polite">
          <h3>{weekday.format(selected.date)} {selected.date.getDate()} · {t(WEEK_TONE[selected.tone][0])}</h3>
          <p>{fill(t(WEEK_TONE[selected.tone][1]), { e: t(elementName(selected.element)) })}</p>
          <p className="meta">{t('Day pillar')} <span lang="zh-Hant">{STEMS[selected.pillar.stem]}{BRANCHES[selected.pillar.branch]}</span> · {t(elementName(selected.element))}</p>
        </div>
      </section>

      <section id="couple-charts" aria-labelledby="couple-charts-title">
        <h2 id="couple-charts-title">{t('Both charts')}</h2>
        <p className="sub">{t('Year, day and hour pillars. The month pillar needs exact solar terms, so a master reads it in a full session.')}</p>
        <div className="charts"><ChartCard name={aName} color={A_COLOR} chart={a}/><ChartCard name={bName} color={B_COLOR} chart={b}/></div>
        <p className="note" style={{ marginTop: 10 }}>{t('The Saju year starts at Lichun, about 4 February. Births on 3–5 February may belong to the year before or after.')}</p>
      </section>

      <section aria-labelledby="couple-share">
        <h2 id="couple-share">{t('Share it')}</h2>
        <div className="share">
          <button type="button" onClick={share}><ArrowUpOnSquareIcon aria-hidden="true"/>{t('Share')}</button>
          <button type="button" onClick={copyLink}><LinkIcon aria-hidden="true"/>{t('Copy link')}</button>
        </div>
        <p className="note" style={{ marginTop: 10 }}>{t('Shared text shows your names, headline and element pair — never birth dates.')}</p>
        <p className="status" role="status">{status}</p>
      </section>
      <p className="disclaimer">{t('For reflection and fun — not advice.')}</p>
    </Body>

    <Upsell className="st-night" aria-labelledby="couple-upsell">
      <div className="k">{t('Go deeper together')}</div>
      <h2 id="couple-upsell">{t('Sit with a master, the two of you')}</h2>
      <p><UsersIcon aria-hidden="true"/>{t('Bring this reading to a couple session in Seoul — all four pillars, read live for both of you.')}</p>
      <ButtonLink to="/experiences?topic=compatibility">{t('Find a couple reading')}</ButtonLink>
    </Upsell>
  </Screen>;
}
