import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { styled } from 'styled-components';
import { AdjustmentsHorizontalIcon, ListBulletIcon, MagnifyingGlassIcon, MapIcon } from '@heroicons/react/24/outline';
import { useI18n } from '../i18n/i18n';
import { filterStudios, languageNames, topics, useStudios } from '../product/data';
import { Field } from '../product/ui';
import StudioMap from '../components/discovery/studio-map';
import StudioRow from '../components/discovery/studio-row';
import { ChipRow, EmptyState, PillChip } from '../components/discovery/ui';
import { inBounds, type Bounds, type LatLng } from '../components/discovery/geo';
import { locatedStudios } from '../components/discovery/studio-meta';
import { Skeleton } from '../components/skeleton';

// Figma 139:106 "02 Map — All studios": every studio on one map, price pins,
// floating search + chips, bottom sheet listing what's on the map.
const Stage = styled.div`
  position:relative;width:100%;overflow:hidden;background:#efeae4;
  height:calc(100dvh - var(--ks-header-height,60px) - 76px - env(safe-area-inset-bottom));min-height:520px;
  --sheet:clamp(208px,40%,300px);
  .map{position:absolute;left:0;right:0;top:0;bottom:var(--sheet);}
  .sheet{position:absolute;left:0;right:0;bottom:0;height:var(--sheet);z-index:6;background:var(--st-surface);border-radius:20px 20px 0 0;
    box-shadow:0 -6px 20px rgb(27 20 32 / 10%);display:flex;flex-direction:column;transition:height .25s ease;}
  &[data-list='true'] .sheet{height:100%;border-radius:0;}
  .grip{width:36px;height:4px;border-radius:2px;background:var(--st-accent-line);margin:8px auto 0;flex:none;}
  .sheet-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 20px 8px;flex:none;}
  .sheet-head h2{font-size:18px;font-weight:700;line-height:24px;letter-spacing:-.2px;}
  .sub{display:flex;align-items:center;gap:6px;font-size:12px;line-height:16px;color:var(--st-muted);margin-top:2px;}
  .sub .dot{width:6px;height:6px;border-radius:50%;background:#b07a12;flex:none;}
  .sub button{border:0;background:none;padding:0;color:var(--st-brand);font-weight:600;font-size:12px;cursor:pointer;min-height:24px;text-decoration:underline;text-underline-offset:3px;}
  .toggle{flex:none;display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:0 14px;border-radius:999px;border:1px solid var(--st-accent-line);background:var(--st-surface);color:var(--st-ink);font-size:14px;font-weight:600;cursor:pointer;}
  .toggle svg{width:18px;}
  .rows{flex:1;overflow-y:auto;overscroll-behavior:contain;padding:4px 20px 16px;}
  .rows>a+a{position:relative;}
  .rows>a+a::before{content:'';position:absolute;left:12px;right:12px;top:0;height:1px;background:var(--st-line);}
  .note{font-size:12px;line-height:18px;color:var(--st-faint);padding:12px 0 4px;}
  .note a{color:var(--st-brand);text-decoration:underline;text-underline-offset:3px;}
  .loading{display:grid;gap:14px;padding:8px 0;}
  .loading>div{height:72px;border-radius:12px;}
`;

const Floating = styled.div`
  padding:12px 16px 0;display:grid;gap:10px;
  .bar{display:flex;gap:8px;}
  form{flex:1;min-width:0;display:flex;align-items:center;gap:10px;height:56px;padding:0 16px;border-radius:28px;background:var(--st-surface);box-shadow:0 2px 12px rgb(27 20 32 / 14%);}
  form svg{width:22px;flex:none;color:var(--st-ink);}
  form label{flex:1;min-width:0;display:grid;}
  input{border:0;background:none;padding:0;min-width:0;width:100%;font-size:16px;font-weight:600;color:var(--st-ink);line-height:20px;}
  input::placeholder{color:var(--st-ink);opacity:1;}
  input:focus{outline:none;}
  form:focus-within{outline:2px solid var(--st-action);outline-offset:2px;}
  .summary{font-size:12px;line-height:16px;color:var(--st-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .filter{flex:none;width:56px;height:56px;border-radius:50%;border:0;background:var(--st-surface);color:var(--st-ink);display:grid;place-items:center;cursor:pointer;box-shadow:0 2px 12px rgb(27 20 32 / 14%);position:relative;}
  .filter svg{width:24px;}
  .filter .count{position:absolute;top:6px;right:6px;min-width:18px;height:18px;border-radius:9px;background:var(--st-action);color:var(--st-on-action);font-size:11px;font-weight:700;display:grid;place-items:center;}
  ${ChipRow}{margin:0 -16px;padding:2px 16px 4px;}
  ${PillChip}{box-shadow:0 1px 4px rgb(27 20 32 / 10%);}
  ${PillChip}[aria-pressed='false']{border-color:transparent;}
  .area{justify-self:center;display:inline-flex;align-items:center;min-height:40px;padding:0 16px;border-radius:999px;border:0;background:var(--st-surface);color:var(--st-ink);font-size:14px;font-weight:600;cursor:pointer;box-shadow:0 2px 10px rgb(27 20 32 / 16%);}
  .panel{background:var(--st-surface);border-radius:16px;padding:16px;display:grid;gap:12px;box-shadow:0 8px 24px rgb(27 20 32 / 16%);}
  .panel .done{min-height:44px;border:0;border-radius:12px;background:var(--st-action);color:var(--st-on-action);font-size:14px;font-weight:600;cursor:pointer;}
`;

const Crosshair = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>;

export default function ReadingMap() {
  const { t, language } = useI18n();
  const { studios, loading, error, reload } = useStudios();
  const [params, setParams] = useSearchParams();
  const [listOpen, setListOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [moved, setMoved] = useState<Bounds | null>(null);
  const [area, setArea] = useState<Bounds | null>(null);
  const [me, setMe] = useState<LatLng | null>(null);
  const [locating, setLocating] = useState('');
  const [refit, setRefit] = useState(0);
  const rows = useRef<HTMLDivElement>(null);

  const found = useMemo(() => locatedStudios(filterStudios(studios, params)), [studios, params]);
  const listed = area ? found.filter(s => inBounds(s, area)) : found;
  const selectedId = params.get('studio') || undefined;
  const ordered = selectedId ? [...listed.filter(s => s.id === selectedId), ...listed.filter(s => s.id !== selectedId)] : listed;
  const previews = listed.filter(s => s.is_mock).length;
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();
  const fitKey = `${found.map(s => s.id).join()}#${refit}`;
  const [initialFocus] = useState(() => params.get('studio') || undefined);

  const set = (key: string, value: string) => setParams(old => {
    const next = new URLSearchParams(old);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('studio');
    return next;
  }, { preventScrollReset: true });
  const select = (id: string) => {
    setParams(old => { const next = new URLSearchParams(old); next.set('studio', id); return next; }, { preventScrollReset: true });
    rows.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const onMoved = useCallback((b: Bounds) => setMoved(b), []);
  const showAll = () => { setArea(null); setMoved(null); setMe(null); setRefit(n => n + 1); };
  // A filter change re-fits the map, so any "this area" restriction no longer applies.
  const filterKey = [...params].filter(([k]) => k !== 'studio').map(([k, v]) => `${k}=${v}`).join('&');
  useEffect(() => { setArea(null); setMoved(null); }, [filterKey]);

  const topic = params.get('topic') || 'all';
  const budget = params.get('budget');
  const activeFilters = ['area', 'language', 'budget'].filter(k => params.get(k)).length;
  const areas = [...new Set(studios.map(s => s.neighborhood))].sort();
  const displayLanguage = (code: string) => new Intl.DisplayNames([language], { type: 'language' }).of(code) || code;
  const summary = [params.get('area') || t('Anywhere in Seoul'), params.get('language') ? displayLanguage(params.get('language')!) : t('Any language')].join(' · ');

  const search = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    set('q', String(new FormData(e.currentTarget).get('q') || '').trim());
    (document.activeElement as HTMLElement | null)?.blur();
  };
  const locate = () => {
    if (!navigator.geolocation) { setLocating(t('Location isn’t available in this browser.')); return; }
    setLocating(t('Finding you…'));
    navigator.geolocation.getCurrentPosition(
      pos => { setLocating(''); setMe({ lat: pos.coords.latitude, lng: pos.coords.longitude }); },
      () => setLocating(t('We couldn’t get your location.')),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  };

  const selected = found.find(s => s.id === selectedId);
  const external = `https://www.google.com/maps/search/?${new URLSearchParams({ api: '1', query: selected ? `${selected.latitude},${selected.longitude}` : 'Seoul' })}`;

  const top = <Floating>
    <div className="bar">
      <form role="search" onSubmit={search}>
        <MagnifyingGlassIcon aria-hidden="true"/>
        <label>
          <input name="q" key={params.get('q') || ''} defaultValue={params.get('q') || ''} placeholder={t('Search studios or areas')} aria-label={t('Search studios or areas')} enterKeyHint="search"/>
          <span className="summary">{summary}</span>
        </label>
      </form>
      <button type="button" className="filter" onClick={() => setFiltersOpen(v => !v)} aria-expanded={filtersOpen} aria-controls="map-filters" aria-label={t('Filters')}>
        <AdjustmentsHorizontalIcon/>{activeFilters > 0 && <span className="count">{activeFilters}</span>}
      </button>
    </div>
    {filtersOpen ? <div className="panel" id="map-filters">
      <Field>{t('Neighborhood')}<select value={params.get('area') || ''} onChange={e => set('area', e.target.value)}><option value="">{t('Anywhere in Seoul')}</option>{areas.map(a => <option key={a}>{a}</option>)}</select></Field>
      <Field>{t('Reading language')}<select value={params.get('language') || ''} onChange={e => set('language', e.target.value)}><option value="">{t('Any language')}</option>{Object.keys(languageNames).map(k => <option value={k} key={k}>{displayLanguage(k)}</option>)}</select></Field>
      <Field>{t('Price per person')}<select value={budget || ''} onChange={e => set('budget', e.target.value)}><option value="">{t('Any budget')}</option>{[50000, 80000, 120000].map(n => <option value={n} key={n}>{t('Up to')} ₩{n.toLocaleString(language)}</option>)}</select></Field>
      <button type="button" className="done" onClick={() => setFiltersOpen(false)}>{t('Show {count} studios').replace('{count}', String(found.length))}</button>
    </div> : <>
      <ChipRow role="group" aria-label={t('Reading topics')}>
        {topics.map(item => <PillChip key={item.id} type="button" $active={topic === item.id} aria-pressed={topic === item.id} onClick={() => set('topic', item.id === 'all' ? '' : item.id)}>{t(item.label)}</PillChip>)}
        <PillChip type="button" $active={budget === '50000'} aria-pressed={budget === '50000'} onClick={() => set('budget', budget === '50000' ? '' : '50000')}>{t('Under ₩50k')}</PillChip>
      </ChipRow>
      {moved && !area && <button type="button" className="area" onClick={() => setArea(moved)}>{t('Search this area')}</button>}
    </>}
  </Floating>;

  return <Stage data-list={listOpen}>
    <div className="map">
      {error ? null : <StudioMap studios={loading ? [] : found} selectedId={selectedId} onSelect={select} fitKey={fitKey} focusId={initialFocus} apiKey={apiKey} me={me} onMoved={onMoved} top={top}
        controls={<button type="button" onClick={locate} aria-label={t('Show my location')}><Crosshair/></button>}/>}
    </div>
    <section className="sheet" aria-labelledby="map-sheet-title">
      <div className="grip" aria-hidden="true"/>
      <div className="sheet-head">
        <div>
          <h2 id="map-sheet-title" aria-live="polite">{loading ? t('Loading studios…') : (area ? t('{count} studios in this area') : t('{count} studios on the map')).replace('{count}', String(listed.length))}</h2>
          {!loading && (area || previews > 0 || locating) && <p className="sub">
            {locating ? <span role="status">{locating}</span> : area ? <button type="button" onClick={showAll}>{t('Show all studios')}</button>
              : <><span className="dot" aria-hidden="true"/>{(previews === listed.length ? t('All are Preview samples') : t('{count} are Preview samples').replace('{count}', String(previews)))}</>}
          </p>}
        </div>
        <button type="button" className="toggle" onClick={() => setListOpen(v => !v)} aria-pressed={listOpen}>
          {listOpen ? <><MapIcon aria-hidden="true"/>{t('Map')}</> : <><ListBulletIcon aria-hidden="true"/>{t('List')}</>}
        </button>
      </div>
      <div className="rows" ref={rows}>
        {error ? <EmptyState title="We couldn’t load the map" body={error} action="Retry" onAction={reload}/>
          : loading ? <div className="loading" aria-hidden="true">{[0, 1, 2].map(n => <Skeleton key={n}/>)}</div>
          : !listed.length ? <EmptyState title={found.length ? 'No studios in this area' : 'No studios match these filters'} body={found.length ? 'Move the map or show every studio again.' : 'Try another topic, area, language or budget.'}
              action={found.length ? 'Show all studios' : 'Clear filters'} onAction={found.length ? showAll : () => setParams({}, { preventScrollReset: true })}/>
          : ordered.map(s => <StudioRow key={s.id} studio={s} selected={s.id === selectedId}/>)}
        {!loading && !error && <p className="note">
          {previews > 0 && <>{t('Preview studios are samples while we sign up real partners — their locations are illustrative and they can’t take requests yet.')} </>}
          {!apiKey && <>{t('Street map isn’t available here; pins show each studio’s position relative to the others.')} </>}
          <a href={external} target="_blank" rel="noopener noreferrer">{t('Open in Google Maps')}</a>
        </p>}
      </div>
    </section>
  </Stage>;
}
