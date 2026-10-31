import ProgressiveImage from './progressive-image';
import { Link } from 'react-router-dom';
import { styled } from 'styled-components';
import { ArrowRightIcon, ClockIcon, HeartIcon, MapPinIcon, UsersIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { cover, money, useSaved, type Studio } from '../product/data';
import { useI18n } from '../i18n/i18n';
import { Badge } from './discovery/ui';
import { TypeCover } from './discovery/studio-row';
import { coverGlyphs, languageLine, studioName } from './discovery/studio-meta';

// Figma 137:240 "ST v2 / Studio card", as a contained card: photo on top, details inside, price footer.
const Card = styled.article`
  position:relative;min-width:0;height:100%;color:var(--st-ink);
  > a{height:100%;display:flex;flex-direction:column;color:inherit;border-radius:20px;overflow:hidden;
    background:var(--st-surface);border:1px solid var(--st-line);
    box-shadow:0 1px 2px rgb(27 20 32 / 4%),0 10px 28px -12px rgb(27 20 32 / 18%);
    transition:transform .2s cubic-bezier(.23,1,.32,1),box-shadow .2s;}
  > a:hover{transform:translateY(-2px);box-shadow:0 2px 4px rgb(27 20 32 / 5%),0 16px 36px -14px rgb(27 20 32 / 26%);}
  > a:active{transform:scale(.99);}
  > a:focus-visible{outline:2px solid var(--st-action);outline-offset:3px;}
  .photo{aspect-ratio:1.6;position:relative;overflow:hidden;background:var(--st-accent);flex:none;}
  .photo img{height:100%;width:100%;object-fit:cover;transition:transform .35s cubic-bezier(.23,1,.32,1);}
  a:hover .photo img{transform:scale(1.04);}
  .photo ${TypeCover}{padding:16px 16px 18px;font-size:32px;}
  .photo ${Badge}{position:absolute;left:12px;top:12px;height:26px;padding:0 10px;font-size:13px;z-index:1;}
  .body{flex:1;display:flex;flex-direction:column;gap:8px;padding:14px 16px 0;}
  .title{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;}
  h3{font:600 22px/26px 'Cormorant Garamond',serif;letter-spacing:0;overflow-wrap:anywhere;margin:0;}
  .rating{flex:none;display:inline-flex;align-items:center;gap:3px;margin-top:3px;font-size:13px;font-weight:600;font-variant-numeric:tabular-nums;}
  .rating svg{width:14px;color:var(--st-gold);}
  .rating span{font-weight:500;color:var(--st-faint);}
  .facts{display:flex;flex-wrap:wrap;gap:6px;}
  .fact{display:inline-flex;align-items:center;gap:4px;height:26px;padding:0 9px;border-radius:999px;background:var(--st-elevated);font-size:12px;font-weight:600;color:var(--st-muted);white-space:nowrap;}
  .fact svg{width:13px;}
  .languages{font-size:12px;line-height:17px;color:var(--st-faint);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
  .foot{margin-top:auto;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 0 14px;border-top:1px solid var(--st-line);}
  .foot .price{font-size:15px;font-weight:700;}
  .foot .price small{display:block;font-size:11px;font-weight:500;color:var(--st-faint);}
  .foot .view{display:inline-flex;align-items:center;gap:4px;font-size:14px;font-weight:600;color:var(--st-brand);}
  .foot .view svg{width:16px;transition:transform .2s;}
  a:hover .foot .view svg{transform:translateX(2px);}
  .save{position:absolute;top:10px;right:10px;width:44px;height:44px;border:0;border-radius:50%;background:rgb(27 20 32 / 48%);color:#fff;display:grid;place-items:center;cursor:pointer;backdrop-filter:blur(6px);z-index:2;}
  .save svg{width:20px;}
  .save:focus-visible{outline:2px solid #fff;outline-offset:2px;}
  @media(hover:none){> a:hover{transform:none;}}
  @media(prefers-reduced-motion:reduce){> a,.photo img,.foot .view svg{transition:none;}}
`;

export default function ExperienceCard({ studio: s }: { studio: Studio }) {
  const { t, language } = useI18n();
  const { saved, toggle } = useSaved();
  const photo = cover(s);
  const name = studioName(s, language);
  const isSaved = saved.includes(s.id);
  const languages = languageLine(s, t);
  return <Card data-experience-card>
    <Link to={`/business/${s.id}`}>
      <div className="photo">
        {photo?.image_url
          ? <ProgressiveImage src={photo.image_url} alt={s.is_mock ? t('Illustrative studio photo') : photo.alt_text || name} loading="lazy"/>
          : <TypeCover aria-hidden="true">{coverGlyphs(s)}</TypeCover>}
        {s.is_mock && <Badge>{t('Preview')}</Badge>}
      </div>
      <div className="body">
        <div className="title">
          <h3>{name}</h3>
          {s.review_count > 0 && <span className="rating" aria-label={t('Rated {r} out of 5 from {n} reviews').replace('{r}', s.average_rating.toFixed(1)).replace('{n}', String(s.review_count))}><StarIcon aria-hidden="true"/><b aria-hidden="true">{s.average_rating.toFixed(1)}</b><span aria-hidden="true">({s.review_count})</span></span>}
        </div>
        <div className="facts">
          <span className="fact"><MapPinIcon aria-hidden="true"/>{s.neighborhood}</span>
          <span className="fact"><ClockIcon aria-hidden="true"/>{s.min_duration_minutes} {t('min')}</span>
          {s.max_guests > 1 && <span className="fact"><UsersIcon aria-hidden="true"/>{t('up to {n} guests').replace('{n}', String(s.max_guests))}</span>}
        </div>
        {languages && <p className="languages">{languages}</p>}
        <div className="foot">
          <span className="price">{t('From')} {money(s.base_price, language)}{s.is_mock && <small>{s.review_count > 0 ? `${t('Sample price')} · ${t('Sample reviews')}` : t('Sample price')}</small>}</span>
          <span className="view" aria-hidden="true">{t('View')}<ArrowRightIcon/></span>
        </div>
      </div>
    </Link>
    <button className="save" onClick={() => toggle(s.id)} aria-label={`${t(isSaved ? 'Unsave' : 'Save')} ${name}`} aria-pressed={isSaved}><HeartIcon fill={isSaved ? 'currentColor' : 'none'}/></button>
  </Card>;
}
