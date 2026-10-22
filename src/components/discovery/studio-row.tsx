import { Link } from 'react-router-dom';
import { styled } from 'styled-components';
import ProgressiveImage from '../progressive-image';
import { cover, money, type Studio } from '../../product/data';
import { useI18n } from '../../i18n/i18n';
import { Badge } from './ui';
import { coverGlyphs, placeLine, studioName } from './studio-meta';

// Figma 137:253 "ST v2 / Studio row".
const Row = styled(Link)<{ $selected?: boolean }>`
  display:grid;grid-template-columns:72px minmax(0,1fr);gap:14px;align-items:center;
  padding:12px;margin:0 -12px;border-radius:14px;color:var(--st-ink);
  background:${p => p.$selected ? 'var(--st-accent)' : 'transparent'};
  &:hover{background:${p => p.$selected ? 'var(--st-accent)' : 'var(--st-elevated)'};}
  &:focus-visible{outline:2px solid var(--st-action);outline-offset:-2px;}
  .thumb{width:72px;height:72px;border-radius:12px;overflow:hidden;background:var(--st-accent);position:relative;}
  .thumb img{width:100%;height:100%;object-fit:cover;}
  .copy{min-width:0;display:grid;gap:3px;}
  .name{display:flex;align-items:center;gap:8px;min-width:0;}
  .name strong{font-size:16px;font-weight:600;line-height:22px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;}
  .meta{font-size:13px;line-height:18px;color:var(--st-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .price{font-size:14px;line-height:20px;font-weight:600;}
`;

/** Dark typographic cover — only used when the studio has no photo. */
export const TypeCover = styled.div`
  position:absolute;inset:0;background:#1b1420;color:#f4eee7;overflow:hidden;
  display:flex;align-items:flex-end;padding:10px;
  font:500 20px/1 'Noto Serif KR',serif;
  &::after{content:'';position:absolute;width:140%;aspect-ratio:1;right:-90%;top:-30%;border:1px solid rgb(201 167 106 / 55%);border-radius:50%;}
`;

export function StudioThumb({ studio: s }: { studio: Studio }) {
  const { t, language } = useI18n();
  const photo = cover(s);
  return <div className="thumb">{photo?.image_url
    ? <ProgressiveImage src={photo.image_url} alt={s.is_mock ? t('Illustrative studio photo') : photo.alt_text || studioName(s, language)} loading="lazy"/>
    : <TypeCover aria-hidden="true">{coverGlyphs(s)}</TypeCover>}</div>;
}

export default function StudioRow({ studio: s, selected, onFocusStudio }: { studio: Studio; selected?: boolean; onFocusStudio?: () => void }) {
  const { t, language } = useI18n();
  return <Row to={`/business/${s.id}`} $selected={selected} aria-current={selected ? 'true' : undefined} onFocus={onFocusStudio} data-studio-row={s.id}>
    <StudioThumb studio={s}/>
    <div className="copy">
      <div className="name"><strong>{studioName(s, language)}</strong>{s.is_mock ? <Badge>{t('Preview')}</Badge> : <Badge $tone="success">{t('Takes requests')}</Badge>}</div>
      <span className="meta">{placeLine(s, t)}</span>
      <span className="price">{t('From')} {money(s.base_price, language)} · {s.min_duration_minutes} {t('min')}</span>
    </div>
  </Row>;
}
