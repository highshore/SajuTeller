import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { styled } from 'styled-components';
import { AdjustmentsHorizontalIcon, ChevronRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { CardSkeleton } from '../components/skeleton';
import { filterStudios, languageNames, topics, useStudios } from '../product/data';
import { ExperienceCard, Field, Page, Wrap } from '../product/ui';
import { ChipRow, EmptyState, Lede, PillChip, TitleBlock } from '../components/discovery/ui';
import { useI18n } from '../i18n/i18n';

// Studio catalogue, styled like Home's light "Readings in Seoul" section.
const Catalog = styled.div`
  display:grid;grid-template-columns:minmax(0,1fr);gap:20px;min-width:0;
  .search{display:flex;align-items:center;gap:10px;height:52px;padding:0 6px 0 16px;border:1px solid var(--st-accent-line);border-radius:26px;background:var(--st-surface);}
  .search:focus-within{outline:2px solid var(--st-action);outline-offset:2px;}
  .search svg{width:20px;flex:none;color:var(--st-muted);}
  .search input{flex:1;min-width:0;border:0;background:none;color:var(--st-ink);font-size:16px;padding:0;}
  .search input:focus{outline:none;}
  .search button{flex:none;height:40px;padding:0 16px;border:0;border-radius:20px;background:var(--st-action);color:var(--st-on-action);font-size:14px;font-weight:600;cursor:pointer;}
  ${ChipRow}{margin:0 -16px;padding:2px 16px 4px;min-width:0;}
  .filters{padding:16px;border:1px solid var(--st-line);border-radius:16px;background:var(--st-elevated);display:grid;gap:14px;}
  .bar{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:44px;}
  .count{font-size:14px;font-weight:600;color:var(--st-ink);}
  .clear{border:0;background:none;padding:0;min-height:44px;color:var(--st-brand);font-size:14px;font-weight:600;cursor:pointer;}
  .note{font-size:13px;line-height:19px;color:var(--st-faint);margin:0;}
  .match-note{padding:12px 14px;border-radius:12px;background:var(--st-elevated);font-size:13px;line-height:19px;color:var(--st-muted);}
  .list{display:grid;grid-template-columns:minmax(0,1fr);gap:28px;}
  .list>[data-experience-card]{content-visibility:auto;contain-intrinsic-size:auto 360px;}
  .help{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px;border:1px solid var(--st-line);border-radius:16px;color:var(--st-ink);}
  .help strong{display:block;font-size:15px;font-weight:600;}
  .help span{display:block;font-size:13px;color:var(--st-muted);margin-top:2px;}
  .help svg{width:18px;flex:none;color:var(--st-muted);}
`;

export default function Experiences() {
  const { t, language } = useI18n();
  const { studios, loading, error, reload } = useStudios();
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const found = filterStudios(studios, params);
  const set = (key: string, value: string) => setParams(old => { const next = new URLSearchParams(old); if (value) next.set(key, value); else next.delete(key); return next; });
  const areas = [...new Set(studios.map(s => s.neighborhood))].sort();
  const active = ['area', 'language', 'budget'].filter(k => params.get(k)).length;
  const topic = params.get('topic') || 'all';
  const demo = studios.find(s => s.demo_chat_enabled);

  return <Page><Wrap><Catalog>
    <div>
      <TitleBlock>
        <div><span className="kicker">{t('Experiences')}</span><h1>{t('Readings in Seoul')}</h1></div>
        <Link className="side" to={`/map${params.size ? `?${params}` : ''}`}>{t('Map')}<ChevronRightIcon/></Link>
      </TitleBlock>
      <Lede>{t('Explore life paths, connections, and new perspectives in your language.')}</Lede>
    </div>

    <form className="search" role="search" onSubmit={e => { e.preventDefault(); set('q', String(new FormData(e.currentTarget).get('q') || '').trim()); }}>
      <MagnifyingGlassIcon aria-hidden="true"/>
      <input name="q" key={params.get('q')} defaultValue={params.get('q') || ''} placeholder={t('Reader, neighborhood, or life theme')} aria-label={t('Search experiences')} enterKeyHint="search"/>
      <button>{t('Search')}</button>
    </form>

    <ChipRow role="group" aria-label={t('Reading topics')}>
      {topics.map(item => <PillChip key={item.id} type="button" $active={topic === item.id} aria-pressed={topic === item.id} onClick={() => set('topic', item.id === 'all' ? '' : item.id)}>{t(item.label)}</PillChip>)}
      <PillChip type="button" $active={filtersOpen || active > 0} aria-expanded={filtersOpen} aria-controls="experience-filters" onClick={() => setFiltersOpen(v => !v)}>
        <AdjustmentsHorizontalIcon aria-hidden="true"/>{t('Filters')}{active ? ` (${active})` : ''}
      </PillChip>
    </ChipRow>

    {filtersOpen && <div className="filters" id="experience-filters">
      <Field>{t('Neighborhood')}<select value={params.get('area') || ''} onChange={e => set('area', e.target.value)}><option value="">{t('Anywhere in Seoul')}</option>{areas.map(a => <option key={a}>{a}</option>)}</select></Field>
      <Field>{t('Reading language')}<select value={params.get('language') || ''} onChange={e => set('language', e.target.value)}><option value="">{t('Any language')}</option>{Object.keys(languageNames).map(k => <option value={k} key={k}>{new Intl.DisplayNames([language], { type: 'language' }).of(k)}</option>)}</select></Field>
      <Field>{t('Price per person')}<select value={params.get('budget') || ''} onChange={e => set('budget', e.target.value)}><option value="">{t('Any budget')}</option>{[50000, 80000, 120000].map(n => <option value={n} key={n}>{t('Up to')} ₩{n.toLocaleString(language)}</option>)}</select></Field>
      <Field>{t('Sort by')}<select value={params.get('sort') || ''} onChange={e => set('sort', e.target.value)}><option value="">{t('Featured first')}</option><option value="price">{t('Lowest price')}</option><option value="duration">{t('Shortest session')}</option></select></Field>
    </div>}

    {params.get('matched') && <p className="match-note">{t('Language support varies by studio. Check the details before booking.')}</p>}

    <div className="bar">
      <span className="count" aria-live="polite">{loading ? t('Loading…') : t('{count} studios').replace('{count}', String(found.length))}</span>
      {params.size > 0 && <button type="button" className="clear" onClick={() => setParams({})}>{t('Clear filters')}</button>}
    </div>

    {error ? <EmptyState title="We couldn’t load experiences" body={error} action="Try again" onAction={reload}/>
      : loading ? <div className="list" aria-busy="true" aria-label={t('Loading experiences')}>{[0, 1].map(n => <CardSkeleton key={n}/>)}</div>
      : found.length ? <div className="list">{found.map(s => <ExperienceCard key={s.id} studio={s}/>)}</div>
      : <EmptyState title="No experiences found" body="Try another neighborhood, language, or budget." action="Clear filters" onAction={() => setParams({})}/>}

    {studios.some(s => s.is_mock) && <p className="note">
      {t('Studios marked Preview are samples while we sign up real partners. You can’t send them a request yet.')}
      {demo && <> <Link to={`/business/${demo.id}`} style={{ color: 'var(--st-brand)', fontWeight: 600 }}>{t('Try demo chat')}</Link></>}
    </p>}

    <Link className="help" to="/find-my-reading">
      <div><strong>{t('Help me choose a reading')}</strong><span>{t('Three quick questions. No birth details needed.')}</span></div>
      <ChevronRightIcon aria-hidden="true"/>
    </Link>
  </Catalog></Wrap></Page>;
}
