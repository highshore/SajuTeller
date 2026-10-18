import LoadingScreen from '../components/loading_screen';
import HorizontalScroller from '../components/horizontal-scroller';
import { useI18n } from '../i18n/i18n';
import { Link, useSearchParams } from 'react-router-dom';
import { styled } from 'styled-components';
import { useStudios, money } from '../product/data';
import { ButtonLink, Empty, Notice, Page, Wrap } from '../product/ui';

const MapView = styled.div`
  h1{font-size:clamp(28px,7cqi,34px);line-height:1.15;letter-spacing:-.4px;}
  .heading{display:flex;align-items:center;justify-content:space-between;gap:16px;}
  .heading a{font-size:12px;color:var(--st-gold);}
  .map{height:clamp(480px,70dvh,740px);background:var(--st-elevated);border:1px solid var(--st-line);border-radius:20px;overflow:hidden;margin-top:14px;}
  iframe{display:block;width:100%;height:100%;border:0;}
  .unavailable{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:28px;box-sizing:border-box;gap:12px;}
  .unavailable svg{width:40px;height:40px;color:var(--st-gold);}
  .unavailable p{max-width:300px;margin:0;color:var(--st-muted);font-size:15px;line-height:1.6;}
  .unavailable a{color:var(--st-gold);text-underline-offset:4px;min-height:44px;display:flex;align-items:center;}
  .sheet{margin-top:14px;padding:20px;background:var(--st-elevated);border:1px solid var(--st-accent-line);border-radius:20px;display:grid;gap:9px;}
  .sheet h2{font:600 30px/34px 'Cormorant Garamond',serif;margin:0;overflow-wrap:anywhere;}
  .sheet p,.intro{font-size:14px;line-height:1.65;color:var(--st-muted);}
  .sheet a{width:100%;margin-top:14px;}
  .chooser{display:flex;gap:10px;overflow:auto;margin:8px 0 12px;padding:2px 0 8px;}
  .chooser button{flex-shrink:0;min-width:160px;max-width:235px;text-align:left;border:1px solid var(--st-line);border-radius:14px;min-height:58px;padding:10px 14px;background:var(--st-surface);color:var(--st-ink);font-size:14px;line-height:1.4;cursor:pointer;display:grid;gap:4px;}.chooser .studio-name{font-size:14px;font-weight:650;white-space:normal;overflow-wrap:anywhere;}.chooser .studio-meta{font-size:12px;color:var(--st-muted);}
  .chooser button[aria-pressed=true]{background:var(--st-gold);color:var(--st-paper);}.chooser button[aria-pressed=true] .studio-meta{color:var(--st-paper);}
  .map-note{font-size:11px;line-height:1.6;color:var(--st-muted);margin-top:12px;}
  .map-note a{text-decoration:underline;text-underline-offset:3px;}
  @container saju (max-width:600px){.map{margin-left:-16px;margin-right:-16px;width:calc(100% + 32px);height:clamp(460px,73dvh,740px);border-radius:0;}.heading{align-items:flex-start;}.heading a{font-size:13px;min-height:44px;display:flex;align-items:center;}.sheet{padding:20px;}}
`;

export default function ReadingMap() {
  const { t, language } = useI18n();
  const { studios, loading, error, reload } = useStudios();
  const [params, setParams] = useSearchParams();
  const located = studios.filter(s => Number.isFinite(s.latitude) && Math.abs(s.latitude) <= 90 && Number.isFinite(s.longitude) && Math.abs(s.longitude) <= 180);
  const studio = located.find(s => s.id === params.get('studio')) || located[0];
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();
  const coordinates = studio ? `${studio.latitude},${studio.longitude}` : '';
  const externalMap = `https://www.google.com/maps/search/?${new URLSearchParams({ api: '1', query: coordinates })}`;
  const mapParams = new URLSearchParams({
    key: apiKey || '', q: coordinates, center: coordinates, zoom: '16',
    language: language === 'zh' ? 'zh-CN' : language,
  });

  return <Page><Wrap><MapView>
    <div className="heading"><h1>{t('Seoul Reading Map')}</h1><Link to="/experiences">{t('List view')}</Link></div>
    {error ? <Notice role="alert">{t(error)}<button onClick={reload}>{t('Retry')}</button></Notice>
      : loading ? <LoadingScreen label="Loading readings…" />
      : !studio ? <Empty title={t('No locations yet')} body={t('Explore the reading collection while we prepare our map.')} />
      : <>
        <p className="intro">{located.length} · {t('Choose a reader to reveal their location')}</p>
        <HorizontalScroller label={t("Choose a reader")} viewportClassName="chooser">
          {located.map(item => <button key={item.id} aria-pressed={item.id === studio.id} onClick={() => setParams(previous => {
            const next = new URLSearchParams(previous);
            next.set('studio', item.id);
            return next;
          }, { preventScrollReset: true })}><span className="studio-name">{language === 'ko' && item.name_ko ? item.name_ko : item.name}</span><span className="studio-meta">{item.neighborhood} · {money(item.base_price, language)}</span></button>)}
        </HorizontalScroller>
        <div className="map" data-map-provider="google">
          {apiKey ? <iframe
            key={`${coordinates}:${language}`}
            title={`${t('Map')} · ${studio.neighborhood}`}
            src={`https://www.google.com/maps/embed/v1/place?${mapParams}`}
            loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen
          /> : <div className="unavailable">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
            <p>{t('Explore this location on Google Maps.')}</p>
            <a href={externalMap} target="_blank" rel="noopener noreferrer">{t('Open in Google Maps')}</a>
          </div>}
        </div>
        <div className="sheet">
          <p>{studio.is_mock ? t('PREVIEW LOCATION') : t('LOCAL READING')} · {studio.neighborhood}</p>
          <h2>{language === 'ko' && studio.name_ko ? studio.name_ko : studio.name}</h2>
          <p>{studio.neighborhood}, {t('Seoul')} · {studio.min_duration_minutes} {t('min')} · {t('From')} {money(studio.base_price, language)}</p>
          {!studio.is_mock && studio.address_line1 && <p>{studio.address_line1}</p>}
          <ButtonLink to={`/business/${studio.id}`}>{t('Explore this reading')}</ButtonLink>
        </div>
        <p className="map-note">{studio.is_mock ? `${t('Sample studio coordinates are illustrative.')} ` : ''}
          {apiKey ? <a href={externalMap} target="_blank" rel="noopener noreferrer">{t('Open in Google Maps')}</a> : null}
        </p>
      </>}
  </MapView></Wrap></Page>;
}
