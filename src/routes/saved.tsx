import { styled } from 'styled-components';
import { useI18n } from '../i18n/i18n';
import { useSaved, useStudios } from '../product/data';
import { ExperienceCard, Page, Wrap } from '../product/ui';
import { CardSkeleton } from '../components/skeleton';
import { EmptyState, Lede, TitleBlock } from '../components/discovery/ui';

const List = styled.div`
  display:grid;grid-template-columns:minmax(0,1fr);gap:28px;margin-top:24px;
  .count{font-size:14px;font-weight:600;}
`;

export default function Saved() {
  const { t } = useI18n();
  const { saved } = useSaved();
  const { studios, loading, error, reload } = useStudios();
  const items = studios.filter(s => saved.includes(s.id));
  return <Page><Wrap>
    <TitleBlock><div><span className="kicker">{t('Saved')}</span><h1>{t('Keep the ones')} {t('that speak to you.')}</h1></div></TitleBlock>
    <Lede>{t('A shortlist for your Seoul trip. Saved on this device, ready when you are.')}</Lede>
    <List>
      {error ? <EmptyState title="We couldn’t load your saved studios" body={error} action="Try again" onAction={reload}/>
        : loading ? <CardSkeleton/>
        : items.length ? <><span className="count">{t('{count} studios').replace('{count}', String(items.length))}</span>{items.map(s => <ExperienceCard key={s.id} studio={s}/>)}</>
        : <EmptyState title="Nothing saved yet" body="Tap the heart on any studio to keep it here. Saved on this device — no account needed." action="Explore experiences" to="/experiences" secondary={{ to: '/map', label: 'Open the map' }}/>}
    </List>
  </Wrap></Page>;
}
