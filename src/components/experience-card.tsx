import ProgressiveImage from './progressive-image';
import { Link } from 'react-router-dom';
import { styled } from 'styled-components';
import { HeartIcon } from '@heroicons/react/24/outline';
import { cover, money, useSaved, type Studio } from '../product/data';
import { useI18n } from '../i18n/i18n';
import { Badge } from './discovery/ui';
import { TypeCover } from './discovery/studio-row';
import { coverGlyphs, languageLine, studioName } from './discovery/studio-meta';

// Figma 137:240 "ST v2 / Studio card": photo, Preview badge, Cormorant name, plain facts, price.
const Card = styled.article`
  position:relative;min-width:0;color:var(--st-ink);
  > a{display:block;color:inherit;border-radius:16px;}
  > a:focus-visible{outline:2px solid var(--st-action);outline-offset:3px;}
  .photo{aspect-ratio:1.57;position:relative;border-radius:16px;overflow:hidden;background:var(--st-accent);}
  .photo img{height:100%;width:100%;object-fit:cover;transition:transform .25s;}
  a:hover .photo img{transform:scale(1.03);}
  .photo ${TypeCover}{padding:16px 16px 18px;font-size:32px;}
  .photo ${Badge}{position:absolute;left:12px;top:12px;height:26px;padding:0 10px;font-size:13px;z-index:1;}
  .copy{padding:12px 2px 0;display:grid;gap:3px;}
  h3{font:600 22px/28px 'Cormorant Garamond',serif;letter-spacing:0;overflow-wrap:anywhere;margin:0;}
  .meta{font-size:13px;line-height:19px;color:var(--st-muted);overflow-wrap:anywhere;}
  .price{font-size:14px;line-height:20px;font-weight:600;margin-top:2px;}
  .save{position:absolute;top:8px;right:8px;width:44px;height:44px;border:0;border-radius:50%;background:rgb(27 20 32 / 48%);color:#fff;display:grid;place-items:center;cursor:pointer;backdrop-filter:blur(6px);}
  .save svg{width:20px;}
  .save:focus-visible{outline:2px solid #fff;outline-offset:2px;}
  @media(prefers-reduced-motion:reduce){.photo img{transition:none;}}
`;

export default function ExperienceCard({ studio: s }: { studio: Studio }) {
  const { t, language } = useI18n();
  const { saved, toggle } = useSaved();
  const photo = cover(s);
  const name = studioName(s, language);
  const isSaved = saved.includes(s.id);
  const languages = languageLine(s, t);
  const guests = s.max_guests > 1 ? ` · ${t('up to {n} guests').replace('{n}', String(s.max_guests))}` : '';
  return <Card data-experience-card>
    <Link to={`/business/${s.id}`}>
      <div className="photo">
        {photo?.image_url
          ? <ProgressiveImage src={photo.image_url} alt={s.is_mock ? t('Illustrative studio photo') : photo.alt_text || name} loading="lazy"/>
          : <TypeCover aria-hidden="true">{coverGlyphs(s)}</TypeCover>}
        {s.is_mock && <Badge>{t('Preview')}</Badge>}
      </div>
      <div className="copy">
        <h3>{name}</h3>
        <span className="meta">{s.neighborhood} · {s.min_duration_minutes} {t('min')}{guests}</span>
        {languages && <span className="meta">{languages}</span>}
        <span className="price">{t('From')} {money(s.base_price, language)}</span>
      </div>
    </Link>
    <button className="save" onClick={() => toggle(s.id)} aria-label={`${t(isSaved ? 'Unsave' : 'Save')} ${name}`} aria-pressed={isSaved}><HeartIcon fill={isSaved ? 'currentColor' : 'none'}/></button>
  </Card>;
}
