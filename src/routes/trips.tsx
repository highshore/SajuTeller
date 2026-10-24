import { TextSkeleton } from '../components/skeleton';
import { useI18n } from '../i18n/i18n';
import { useEffect, useState } from 'react';
import { ArrowRightIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { styled } from 'styled-components';
import { supabase } from '../supabase';
import { getPlans, removePlan, seoulToday, type PreviewPlan } from '../product/plans';
import { cover, useAccount, useSaved, useStudios, type Studio } from '../product/data';
import { ButtonLink, Notice, Page, Wrap } from '../product/ui';

// Figma: "07 Trips — Request status" (142:508). A request is never a booking: statuses map 1:1 to the database.
// Demo requests (to Preview studios) get an automated reply; sajuteller_advance_demo_requests applies replies that are due.
type Request = { id: string; studio_id: string; requested_date: string; requested_time: string; status: string; guests: number; language: string; created_at?: string; is_demo?: boolean; demo_reply_at?: string | null };
type Tab = 'requests' | 'saved' | 'past';

const Root = styled.div`
  .title{font:600 40px/1.05 'Cormorant Garamond',serif;letter-spacing:-.5px;margin:4px 0 18px;}
  .tabs{display:flex;gap:24px;border-bottom:1px solid var(--st-line);margin-bottom:20px;}
  .tabs button{position:relative;border:0;background:none;padding:0 0 12px;min-height:44px;font-size:15px;font-weight:600;color:var(--st-faint);cursor:pointer;display:flex;align-items:flex-end;white-space:nowrap;}
  .tabs button[aria-selected=true]{color:var(--st-ink);}
  .tabs button[aria-selected=true]::after{content:'';position:absolute;left:0;right:0;bottom:-1px;height:2px;background:var(--st-ink);}
  .list{display:grid;gap:16px;}
  .card{border:1px solid var(--st-line);border-radius:18px;background:var(--st-surface);padding:16px;min-width:0;}
  .studio{display:flex;align-items:center;gap:14px;min-width:0;}
  .thumb{width:48px;height:48px;flex:none;border-radius:10px;overflow:hidden;background:var(--st-ink);color:#fff;display:grid;place-items:center;font:500 15px/1 'Noto Serif KR',serif;}
  .thumb img{width:100%;height:100%;object-fit:cover;}
  .studio h2{font-size:17px;font-weight:600;letter-spacing:0;line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin:0;}
  .studio p{font-size:13px;line-height:1.5;color:var(--st-muted);margin-top:2px;}
  .studio>div{min-width:0;flex:1;}
  .badge{display:inline-flex;align-items:center;margin-top:14px;padding:4px 8px;border-radius:6px;font-size:12px;font-weight:600;line-height:1.4;background:var(--st-elevated);color:var(--st-muted);}
  .badge.waiting,.badge.preview{background:var(--st-preview-bg);color:var(--st-preview);}
  .badge.demo{margin-left:6px;}
  .badge.accepted{background:var(--st-success-bg);color:var(--st-success);}
  ol{list-style:none;margin:14px 0 0;padding:14px 0 0;border-top:1px solid var(--st-line);}
  li{display:grid;grid-template-columns:24px minmax(0,1fr);column-gap:14px;position:relative;padding-bottom:16px;}
  li:last-child{padding-bottom:0;}
  li:not(:last-child)::before{content:'';position:absolute;left:11.5px;top:27px;bottom:3px;width:1px;background:var(--st-accent-line);}
  li.done:not(:last-child)::before{background:var(--st-success);}
  .n{width:24px;height:24px;border-radius:50%;border:1px solid var(--st-accent-line);background:var(--st-surface);display:grid;place-items:center;font-size:12px;font-weight:700;color:var(--st-faint);font-variant-numeric:tabular-nums;}
  li.done .n{background:var(--st-success);border-color:var(--st-success);color:#fff;}
  li.current .n{background:var(--st-brand);border-color:var(--st-brand);color:#fff;}
  li h3{font-size:15px;font-weight:600;line-height:22px;margin:0;color:var(--st-faint);}
  li.done h3,li.current h3{color:var(--st-ink);}
  li p{font-size:13px;line-height:1.5;color:var(--st-faint);}
  li.done p,li.current p{color:var(--st-muted);}
  .actions{display:flex;align-items:center;gap:12px;margin-top:18px;}
  .actions .message{flex:1;}
  .text-action{border:0;background:none;color:var(--st-muted);font-size:14px;font-weight:600;min-height:44px;padding:0 4px;cursor:pointer;white-space:nowrap;}
  .text-action:disabled{opacity:.45;cursor:not-allowed;}
  .fine{font-size:12px;line-height:1.55;color:var(--st-faint);margin-top:12px;}
  .view{display:inline-flex;align-items:center;gap:4px;min-height:44px;font-size:13px;font-weight:600;color:var(--st-brand);}
  .view svg{width:15px;}
  .row-actions{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:6px;flex-wrap:wrap;}
  .guide{margin-top:20px;border-radius:16px;background:var(--st-accent);padding:16px;}
  .guide h2{font-size:16px;font-weight:600;letter-spacing:0;color:var(--st-brand);margin:0 0 6px;}
  .guide p{font-size:14px;line-height:1.55;color:var(--st-muted);}
  .guide a{display:inline-flex;align-items:center;min-height:44px;font-size:14px;font-weight:600;color:var(--st-brand);}
  .empty{padding:28px 4px 8px;}
  .empty h2{font:600 26px/1.15 'Cormorant Garamond',serif;letter-spacing:0;margin:0 0 8px;}
  .empty p{font-size:14px;line-height:1.6;color:var(--st-muted);margin-bottom:18px;}
  .more{margin-top:28px;border-top:1px solid var(--st-line);}
  .more a{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:56px;border-bottom:1px solid var(--st-line);font-size:15px;font-weight:500;}
  .more a svg{width:18px;color:var(--st-faint);}
  .more .sign-out{color:var(--st-muted);font-size:14px;}
`;

function dateLabel(date: string, language: string) {
  const value = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(value.getTime())) return date;
  return new Intl.DateTimeFormat(language, { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }).format(value);
}
function stampLabel(stamp: string | undefined, language: string) {
  const value = stamp ? new Date(stamp) : null;
  if (!value || Number.isNaN(value.getTime())) return '';
  return new Intl.DateTimeFormat(language, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Seoul' }).format(value);
}
function Thumb({ studio }: { studio?: Studio }) {
  const image = studio ? cover(studio) : undefined;
  const [failed, setFailed] = useState('');
  const src = image && failed !== image.image_url ? image.image_url : '';
  return <span className="thumb" aria-hidden="true">{src ? <img src={src} alt="" loading="lazy" onError={() => setFailed(src)}/> : <span lang="ko">{(studio?.name_ko || studio?.name || '사주').slice(0, 2)}</span>}</span>;
}

export default function Trips() {
  const { t, language } = useI18n();
  const { account, loading } = useAccount();
  const { studios } = useStudios();
  const { saved } = useSaved();
  const [plans, setPlans] = useState<PreviewPlan[]>(getPlans);
  const [requests, setRequests] = useState<Request[]>([]);
  const [owner, setOwner] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [tab, setTab] = useState<Tab>('requests');
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let live = true;
    if (account) void (async () => {
      await supabase.rpc('sajuteller_advance_demo_requests');
      const { data, error } = await supabase.from('sajuteller_booking_requests').select('id,studio_id,requested_date,requested_time,status,guests,language,created_at,is_demo,demo_reply_at').eq('user_id', account.id).order('created_at', { ascending: false });
      if (live) { setRequests(data || []); setOwner(account.id); setError(error ? 'Your requests could not be loaded. Please refresh to try again.' : ''); }
    })();
    return () => { live = false; };
  }, [account, refresh]);
  // While a demo reply is pending, check again shortly after it is due.
  const nextReply = requests.filter(r => r.is_demo && r.status === 'requested' && r.demo_reply_at).map(r => new Date(r.demo_reply_at!).getTime()).sort()[0];
  useEffect(() => {
    if (!nextReply) return;
    const timer = setTimeout(() => setRefresh(x => x + 1), Math.max(3000, nextReply - Date.now() + 1500));
    return () => clearTimeout(timer);
  }, [nextReply]);
  async function cancel(id: string) {
    setBusy(id);
    const { data, error } = await supabase.from('sajuteller_booking_requests').update({ status: 'cancelled' }).eq('id', id).eq('status', 'requested').select('id');
    if (error || !data?.length) setError('We couldn’t cancel this request. Please refresh and check its status.');
    else setRequests(v => v.map(r => r.id === id ? { ...r, status: 'cancelled' } : r));
    setBusy('');
  }

  const ready = !!account && owner === account.id;
  const pending = loading || (!!account && owner !== account.id);
  const today = seoulToday();
  const isActive = (r: Request) => (r.status === 'requested' || r.status === 'confirmed') && r.requested_date >= today;
  const active = ready ? requests.filter(isActive) : [];
  const past = ready ? requests.filter(r => !isActive(r)) : [];
  const studioOf = (id: string) => studios.find(s => s.id === id);
  const when = (date: string, time: string, guests: number) => `${dateLabel(date, language)} · ${time.slice(0, 5)} KST · ${guests} ${t(guests === 1 ? 'guest' : 'guests')}`;
  const badge = (r: Request) => r.status === 'confirmed'
    ? (r.requested_date < today ? ['done', 'Accepted · date passed'] : ['accepted', 'Accepted by the studio'])
    : r.status === 'requested'
      ? (r.requested_date < today ? ['', 'No reply before the date'] : ['waiting', 'Waiting for the studio'])
      : r.status === 'declined' ? ['', 'Declined by the studio'] : r.status === 'cancelled' ? ['', 'Cancelled'] : ['', r.status];

  function requestCard(r: Request) {
    const studio = studioOf(r.studio_id);
    const accepted = r.status === 'confirmed';
    const [tone, label] = badge(r);
    const sent = stampLabel(r.created_at, language);
    const steps: [string, string, 'done' | 'current' | ''][] = [
      ['Request sent', sent, 'done'],
      ['Studio is reviewing', r.is_demo ? 'The sample studio replies automatically in about two minutes' : 'You’ll get a reply in Messages', accepted ? 'done' : 'current'],
      ['Accepted', r.is_demo ? 'You’ll also get a notification' : 'The studio confirms your time in Messages', accepted ? 'done' : ''],
      ['Your reading', `${dateLabel(r.requested_date, language)} · ${r.requested_time.slice(0, 5)} KST`, ''],
    ];
    return <article className="card" key={r.id} aria-label={studio?.name || t('Saju experience')}>
      <Link className="studio" to={`/business/${r.studio_id}`}><Thumb studio={studio}/><div><h2>{studio?.name || t('Saju experience')}</h2><p>{when(r.requested_date, r.requested_time, r.guests)}</p></div></Link>
      <span className={`badge ${tone}`}>{t(label)}</span>{r.is_demo && <span className="badge preview demo">{t('Demo request')}</span>}
      <ol aria-label={t('Request status')}>{steps.map(([title, body, state], i) => <li key={title} className={state} aria-current={state === 'current' ? 'step' : undefined}><span className="n" aria-hidden="true">{i + 1}</span><div><h3>{t(title)}</h3>{body && <p>{i === 0 || i === 3 ? body : t(body)}</p>}</div></li>)}</ol>
      <div className="actions">
        <ButtonLink className="message" $secondary to={`/messages?studio=${r.studio_id}`}>{t(r.is_demo ? 'Chat with the demo host' : 'Message studio')}</ButtonLink>
        {r.status === 'requested' && <button className="text-action" onClick={() => void cancel(r.id)} disabled={busy === r.id}>{t('Cancel request')}</button>}
      </div>
      <p className="fine">{t(r.is_demo ? 'Demo request to a sample studio. The reply is automated, nothing is booked and no studio expects you.' : accepted ? 'Online payment is not yet available. Contact the studio after confirmation to arrange payment.' : 'Nothing is booked until the studio accepts. You won’t be charged.')}</p>
    </article>;
  }
  function pastCard(r: Request) {
    const studio = studioOf(r.studio_id);
    const [tone, label] = badge(r);
    return <article className="card" key={r.id}>
      <Link className="studio" to={`/business/${r.studio_id}`}><Thumb studio={studio}/><div><h2>{studio?.name || t('Saju experience')}</h2><p>{when(r.requested_date, r.requested_time, r.guests)}</p></div></Link>
      <span className={`badge ${tone}`}>{t(label)}</span>{r.is_demo && <span className="badge preview demo">{t('Demo request')}</span>}
      <div className="row-actions"><Link className="view" to={`/business/${r.studio_id}`}>{t('View experience')}<ArrowRightIcon/></Link></div>
    </article>;
  }
  const empty = (title: string, body: string) => <div className="empty"><h2>{t(title)}</h2><p>{t(body)}</p><ButtonLink to="/experiences">{t('Explore experiences')}<ArrowRightIcon/></ButtonLink></div>;
  const tabs: [Tab, string, number | null][] = [['requests', 'Requests', ready ? active.length : null], ['saved', 'Saved', plans.length + saved.length], ['past', 'Past', null]];

  return <Page><Wrap><Root>
    <h1 className="title">{t('Trips')}</h1>
    <div className="tabs" role="tablist" aria-label={t('Trips')}>{tabs.map(([id, label, count]) => <button key={id} role="tab" id={`trips-tab-${id}`} aria-controls="trips-panel" aria-selected={tab === id} onClick={() => setTab(id)}>{t(label)}{count ? ` · ${count}` : ''}</button>)}</div>
    {error && <Notice role="alert">{t(error)}</Notice>}
    <section id="trips-panel" role="tabpanel" aria-labelledby={`trips-tab-${tab}`}>
      {tab !== 'saved' && !loading && !account && <div className="empty"><h2>{t('Keep your real requests together.')}</h2><p>{t('Sign in to view your booking requests. Preview plans are available on this device without an account.')}</p><ButtonLink to="/sign-in?next=/trips">{t('Sign in')}<ArrowRightIcon/></ButtonLink></div>}
      {tab !== 'saved' && pending && <TextSkeleton/>}
      {tab === 'requests' && ready && (active.length ? <div className="list">{active.map(requestCard)}</div> : empty('No open requests', 'When you send a request to a studio, its status appears here.'))}
      {tab === 'past' && ready && (past.length ? <div className="list">{past.map(pastCard)}</div> : empty('Nothing here yet', 'Cancelled, declined and earlier requests will appear here.'))}
      {tab === 'saved' && <>
        {plans.length > 0 && <div className="list">{plans.map(p => { const studio = studioOf(p.studioId); return <article className="card" key={p.id}>
          <Link className="studio" to={`/business/${p.studioId}`}><Thumb studio={studio}/><div><h2>{studio?.name || t('Sample Saju experience')}</h2><p>{when(p.date, p.time, p.guests)}</p></div></Link>
          <span className="badge preview">{t('Preview plan / not a reservation')}</span>
          <div className="row-actions"><Link className="view" to={`/business/${p.studioId}`}>{t('See experience')}<ArrowRightIcon/></Link><button className="text-action" onClick={() => { removePlan(p.id); setPlans(getPlans()); }}>{t('Remove preview')}</button></div>
        </article>; })}</div>}
        {saved.length > 0 && <div className="more" style={{ marginTop: plans.length ? 20 : 0 }}><Link to="/saved">{t('Saved readings')} · {saved.length}<ChevronRightIcon/></Link></div>}
        {!plans.length && !saved.length && empty('Your Seoul story is still unwritten.', 'Explore a reading, save an experience you love, or take the quiz to find a place to start.')}
      </>}
    </section>
    {tab === 'requests' && <aside className="guide"><h2>{t('While you wait')}</h2><p>{t('Read “Your first Saju reading”: what the reader may ask, and what the Four Pillars are.')}</p><Link to="/learn/first-reading">{t('Read the beginner’s guide')}</Link></aside>}
    <nav className="more" aria-label={t('More')}>
      <Link to="/messages">{t('Messages')}<ChevronRightIcon/></Link>
      <Link to="/learn/before-you-go">{t('Before you go')}<ChevronRightIcon/></Link>
      <Link to="/profile">{t('Profile')}<ChevronRightIcon/></Link>
      {account && <Link className="sign-out" to="/" onClick={() => supabase.auth.signOut()}>{t('Sign out')}</Link>}
    </nav>
  </Root></Wrap></Page>;
}
