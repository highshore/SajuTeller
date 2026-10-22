import LoadingScreen from '../components/loading_screen';
import ProgressiveImage from '../components/progressive-image';
import { useI18n } from '../i18n/i18n';
import { useCallback, useEffect, useRef, useState } from 'react';
import { styled } from 'styled-components';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRightIcon, CheckCircleIcon, ChevronLeftIcon, InformationCircleIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { supabase } from '../supabase';
import { money, supportLabel, useAccount, useStudios, type Service } from '../product/data';
import { savePlan, seoulToday } from '../product/plans';
import { Button, ButtonLink, Empty, Field, Notice, Page, Wrap } from '../product/ui';
import { Card, PreviewBanner, Screen, SignInSheet, StickyBar } from '../components/studio/studio-ui';
import { clearDraft, composeNotes, dayParts, languageLabel, nextDays, readDraft, seoulNowTime, shortDate, timeSlots, writeDraft, type Draft } from '../components/studio/request-helpers';

// Figma: "04 Request — Choose a time" (141:165), "05 Request — Review & send" (141:507),
// "06 Sign in — only when sending" (142:179). Same insert as before; nothing is charged or booked.
const Flow = styled.div`
  .top{display:grid;grid-template-columns:44px 1fr 44px;align-items:center;margin:4px -10px 0;}
  .top a,.top button{width:44px;height:44px;display:grid;place-items:center;border:0;background:none;color:var(--st-ink);cursor:pointer;}
  .top svg{width:22px;}
  .top h1{font:600 17px/1.3 Inter,sans-serif;text-align:center;}
  .top .count{font-size:13px;color:var(--st-faint);text-align:right;white-space:nowrap;padding-right:10px;}
  .progress{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:6px 0 18px;}
  .progress span{height:4px;border-radius:2px;background:var(--st-line);}
  .progress .on{background:var(--st-brand);}
  .studio{font-size:14px;color:var(--st-muted);line-height:1.45;}
  .studio b{color:var(--st-ink);font-weight:700;}
  .block{margin-top:26px;scroll-margin-top:80px;}
  .dates{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;margin:0 -20px;padding:0 20px 2px;scroll-padding-inline:20px;scroll-snap-type:x proximity;}
  .date{flex:0 0 64px;height:80px;border-radius:12px;border:1px solid var(--st-line);background:var(--st-surface);color:var(--st-ink);display:grid;align-content:center;justify-items:center;gap:2px;cursor:pointer;scroll-snap-align:start;}
  .date small{font-size:12px;color:var(--st-muted);}
  .date b{font-size:20px;font-weight:700;line-height:1.2;}
  .date em{font-style:normal;font-size:11px;color:var(--st-faint);min-height:14px;}
  .date[aria-pressed='true']{background:var(--st-brand);border-color:var(--st-brand);color:#fff;}
  .date[aria-pressed='true'] small,.date[aria-pressed='true'] em{color:rgb(255 255 255 / 80%);}
  .date:disabled{background:var(--st-elevated);border-color:transparent;color:var(--st-faint);cursor:not-allowed;}
  .times{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;}
  .time{min-height:44px;border-radius:12px;border:1px solid var(--st-line);background:var(--st-surface);color:var(--st-ink);font-size:16px;font-weight:600;cursor:pointer;font-variant-numeric:tabular-nums;}
  .time[aria-pressed='true']{background:var(--st-brand);border-color:var(--st-brand);color:#fff;}
  .time:disabled{background:var(--st-elevated);border-color:transparent;color:var(--st-faint);text-decoration:line-through;cursor:not-allowed;}
  .hint{display:grid;grid-template-columns:18px 1fr;gap:8px;margin-top:12px;font-size:13px;line-height:1.5;color:var(--st-muted);}
  .hint svg{width:18px;}
  .chips{display:flex;flex-wrap:wrap;gap:8px;}
  .chip{min-height:44px;padding:0 14px;border-radius:12px;border:1px solid var(--st-line);background:var(--st-surface);color:var(--st-ink);font-size:15px;font-weight:600;cursor:pointer;flex:1 0 auto;}
  .chip[aria-pressed='true']{background:var(--st-brand);border-color:var(--st-brand);color:#fff;}
  .chip.session{text-align:left;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-basis:100%;min-height:52px;font-size:14px;}
  .chip.session span{font-weight:500;opacity:.85;white-space:nowrap;}
  .stepper{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border:1px solid var(--st-line);border-radius:16px;}
  .stepper b{display:block;font-size:16px;font-weight:600;}
  .stepper small{font-size:13px;color:var(--st-muted);}
  .stepper .ctl{display:flex;align-items:center;gap:12px;}
  .stepper button{width:44px;height:44px;border-radius:50%;border:1px solid var(--st-ink);background:var(--st-surface);color:var(--st-ink);display:grid;place-items:center;cursor:pointer;}
  .stepper button:disabled{border-color:transparent;background:var(--st-elevated);color:var(--st-faint);cursor:not-allowed;}
  .stepper button svg{width:18px;}
  .stepper output{min-width:20px;text-align:center;font-size:18px;font-weight:700;}
  .fields{display:grid;gap:10px;}
  .request-note{background:var(--st-accent);border-radius:16px;padding:16px;}
  .request-note strong{display:block;font-size:16px;font-weight:700;color:var(--st-brand);margin-bottom:4px;}
  .request-note p{font-size:14px;line-height:1.5;color:var(--st-muted);}
  .head{display:flex;align-items:center;gap:12px;padding-bottom:14px;border-bottom:1px solid var(--st-line);}
  .tile{width:44px;height:44px;flex:none;border-radius:10px;overflow:hidden;display:grid;place-items:center;background:var(--st-ink);color:#f4eee7;font:600 15px 'Noto Serif KR',serif;}
  .tile img{width:100%;height:100%;object-fit:cover;}
  .head b{display:block;font-size:16px;font-weight:700;line-height:1.3;overflow-wrap:anywhere;}
  .head small{font-size:13px;color:var(--st-muted);}
  .rows{display:grid;}
  .rows>div{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:10px;min-height:46px;border-bottom:1px solid var(--st-line);font-size:14px;}
  .rows>div:last-child{border-bottom:0;}
  .rows dt{color:var(--st-muted);}
  .rows dd{margin:0;text-align:right;font-weight:600;overflow-wrap:anywhere;}
  .rows button{border:0;background:none;color:var(--st-brand);font-size:13px;font-weight:600;min-height:44px;padding:0 0 0 4px;cursor:pointer;}
  .lines{display:grid;gap:12px;font-size:14px;}
  .lines>div{display:flex;justify-content:space-between;gap:12px;}
  .lines span{color:var(--st-muted);}
  .lines .total{border-top:1px solid var(--st-line);padding-top:14px;font-size:16px;}
  .lines .total span{color:var(--st-ink);font-weight:700;}
  .lines .total b{font-weight:700;}
  .info{display:grid;grid-template-columns:18px 1fr;gap:10px;margin-top:14px;padding:12px;border-radius:12px;background:var(--st-elevated);font-size:13px;line-height:1.5;color:var(--st-muted);}
  .info svg{width:18px;}
  .small-h{font-size:15px;font-weight:700;margin-bottom:6px;}
`;
const Done=styled.div`
  padding-top:24px;display:grid;gap:14px;justify-items:start;
  >svg{width:44px;height:44px;color:var(--st-success);}
  p{font-size:15px;line-height:1.6;color:var(--st-muted);}
`;

export default function RequestVisit(){
 const{t,language}=useI18n();const{id}=useParams();const[params,setParams]=useSearchParams();const{studios,loading}=useStudios();const{account,loading:accountLoading}=useAccount();const s=studios.find(s=>s.id===id);
 const[services,setServices]=useState<Service[]>([]);const[serviceId,setServiceId]=useState(params.get('service')||'');const[busy,setBusy]=useState(false);const[error,setError]=useState('');const[done,setDone]=useState(false);const[sheet,setSheet]=useState(false);
 const[date,setDate]=useState('');const[time,setTime]=useState('');const[lang,setLang]=useState('');const[guests,setGuests]=useState(1);const[birthDate,setBirthDate]=useState('');const[birthTime,setBirthTime]=useState('');const[message,setMessage]=useState('');
 const restored=useRef(false);
 useEffect(()=>{if(!s)return;let alive=true;supabase.from('studio_services').select('id,studio_id,name,description,duration_minutes,price,max_guests,requires_birth_date,birth_time_recommended').eq('studio_id',s.id).eq('active',true).order('sort_order').then(({data,error})=>{if(!alive)return;if(error)setError('Session options could not be loaded. Please try again.');else{setServices(data||[]);setServiceId(v=>data?.some(x=>x.id===v)?v:data?.[0]?.id||'');}});return()=>{alive=false;};},[s]);
 // Bring back a request kept before sign-in (sessionStorage, this tab only).
 useEffect(()=>{if(!s||restored.current)return;restored.current=true;const d=readDraft(s.id);if(!d)return;if(d.serviceId)setServiceId(d.serviceId);if(d.date>=seoulToday()){setDate(d.date);setTime(d.time);}setLang(d.language);setGuests(d.guests||1);setBirthDate(d.birthDate||'');setBirthTime(d.birthTime||'');setMessage(d.message||'');},[s]);
 const closeSheet=useCallback(()=>setSheet(false),[]);
 if(loading)return <Page><Wrap><LoadingScreen label="Loading your experience…"/></Wrap></Page>;
 if(!s)return <Page><Wrap><Empty title={t("Choose an experience first.")} body="Find a reader before planning your visit."/></Wrap></Page>;
 const service=services.find(v=>v.id===serviceId);const name=language==='ko'&&s.name_ko?s.name_ko:s.name;
 const maxGuests=Math.max(1,Math.min(service?.max_guests||1,s.max_guests||1));const guestCount=Math.min(guests,maxGuests);
 const language_=s.studio_languages.some(l=>l.language_code===lang)?lang:(s.studio_languages.find(l=>l.language_code===language)||s.studio_languages.find(l=>l.language_code!=='ko')||s.studio_languages[0])?.language_code||'';
 const selectedSupport=s.studio_languages.find(l=>l.language_code===language_)?.support_type;
 const today=seoulToday();const now=seoulNowTime();const days=nextDays(today,14);
 const slotOpen=(d:string,slot:string)=>d>today||slot>now;const dayOpen=(d:string)=>timeSlots.some(slot=>slotOpen(d,slot));
 const ready=Boolean(service&&date&&time&&slotOpen(date,time)&&language_);
 const review=ready&&params.get('step')==='review';
 const total=service?service.price*guestCount:0;
 const draft=():Draft=>({serviceId,date,time,language:language_,guests:guestCount,birthDate,birthTime,message});
 const reviewPath=`/business/${s.id}/booking?service=${serviceId}&step=review`;
 const goStep=(step:1|2,anchor?:string)=>{const next=new URLSearchParams(params);if(step===2)next.set('step','review');else next.delete('step');if(serviceId)next.set('service',serviceId);setParams(next,{replace:step===1});window.scrollTo({top:0});if(anchor)setTimeout(()=>document.getElementById(anchor)?.scrollIntoView({block:'start'}),60);};
 const guestText=(n:number)=>n===1?t('Just you'):n===2?t('You + 1 friend, same session'):t('You + {n} friends, same session').replace('{n}',String(n-1));
 const peopleText=(n:number)=>n===1?t('1 person'):t('{n} people').replace('{n}',String(n));
 async function send(){
  if(!s||!service||busy||!ready)return;
  if(date<seoulToday()){setError('Please choose today or a later date in Seoul.');return;}
  if(!s.is_mock&&!account){if(accountLoading)return;writeDraft(s.id,draft());setSheet(true);return;}
  setBusy(true);setError('');
  try{
   if(s.is_mock){savePlan({id:crypto.randomUUID(),studioId:s.id,serviceId,date,time,language:language_,guests:guestCount,createdAt:new Date().toISOString()});}
   else{const{error}=await supabase.from('sajuteller_booking_requests').insert({studio_id:s.id,service_id:serviceId,requested_date:date,requested_time:time,language:language_,guests:guestCount,notes:composeNotes(message,birthDate,birthTime)});if(error)throw error;}
   clearDraft(s.id);setDone(true);window.scrollTo({top:0});
  }catch{setError(s.is_mock?'Your browser could not save the preview. Please allow local storage and try again.':'Your request could not be sent. Nothing has been reserved or charged. Please try again.');}
  finally{setBusy(false);}
 }
 if(done)return <Screen><div className="body"><Done>
  <CheckCircleIcon aria-hidden="true"/>
  <h1 className="display">{s.is_mock?t("Your preview plan is saved."):t("Your request is in.")}</h1>
  <p>{s.is_mock?t("This plan is saved on this device. It is not a reservation, and no request or payment has been sent."):t("Your preferred time is awaiting review. This is not a confirmed reservation. No payment has been taken.")}</p>
  <ButtonLink to="/trips">{t("See my trips")}<ArrowRightIcon/></ButtonLink>
 </Done></div></Screen>;
 const header=<><div className="top">{review?<button type="button" onClick={()=>goStep(1)} aria-label={t('Back')}><ChevronLeftIcon/></button>:<Link to={`/business/${s.id}`} aria-label={t('Back to the experience')}><ChevronLeftIcon/></Link>}<h1>{t(review?'Review request':'Request a time')}</h1><span className="count">{t(review?'2 of 2':'1 of 2')}</span></div>
  <div className="progress" aria-hidden="true"><span className="on"/><span className={review?'on':''}/></div></>;
 const cover=[...s.studio_images].sort((a,b)=>a.sort_order-b.sort_order)[0];
 if(review&&service)return <Screen $tone="var(--st-elevated)"><div className="body"><Flow>{header}
  {s.is_mock?<PreviewBanner><div className="title"><span className="tag">{t('Preview')}</span><strong>{t('Sample studio')}</strong></div><p>{t('This saves a preview plan on this device only. Nothing is sent to a studio, and nothing is booked.')}</p></PreviewBanner>
   :<div className="request-note"><strong>{t('This is a request, not a booking')}</strong><p>{t('{name} will accept or decline. Your time is only held once they accept.').replace('{name}',name)}</p></div>}
  <Card style={{marginTop:16}}>
   <div className="head"><span className="tile">{cover&&!s.is_mock?<ProgressiveImage src={cover.image_url} alt=""/>:(s.name_ko||s.name).slice(0,2)}</span><div><b>{name}</b><small>{t(service.name)} · {service.duration_minutes} {t('min')}</small></div></div>
   <dl className="rows">
    <div><dt>{t('Requested time')}</dt><dd>{shortDate(date,language)}, {time}</dd><button type="button" onClick={()=>goStep(1,'when')}>{t('Edit')}</button></div>
    <div><dt>{t('Guests')}</dt><dd>{peopleText(guestCount)}</dd><button type="button" onClick={()=>goStep(1,'guests')}>{t('Edit')}</button></div>
    <div><dt>{t('Interpretation')}</dt><dd>{languageLabel(language_)}</dd><button type="button" onClick={()=>goStep(1,'language')}>{t('Edit')}</button></div>
    {!s.is_mock&&<div><dt>{t('Birth details')}</dt><dd>{birthDate?t(birthTime?'Date and time added':'Date added · time unknown'):t('Not added')}</dd><button type="button" onClick={()=>goStep(1,'birth')}>{t('Edit')}</button></div>}
   </dl>
  </Card>
  <Card style={{marginTop:12}}>
   <div className="lines">
    <div><span>{money(service.price,language)} × {peopleText(guestCount)}</span><b>{money(total,language)}</b></div>
    <div className="total"><span>{t(s.is_mock?'Sample total':'Estimated total')}</span><b>{money(total,language)}</b></div>
   </div>
   <div className="info"><InformationCircleIcon aria-hidden="true"/><span>{t(s.is_mock?'Preview readings never collect payment.':'You won’t be charged. Payment isn’t available in the app yet — the studio confirms the price when they accept.')}</span></div>
  </Card>
  {!s.is_mock&&<div className="block"><Field>{t('Message to the studio (optional)')}<textarea value={message} onChange={e=>setMessage(e.target.value)} maxLength={1900} placeholder={t("Accessibility needs, the topic on your mind, or a question about language support.")}/></Field></div>}
  <div className="block"><p className="small-h">{t('Cancellation')}</p><p className="faint">{t(s.is_mock?'Preview plans can be removed at any time.':'You can cancel free while your request is pending. Once a studio accepts, check its cancellation terms.')} <Link to="/refund-policy" style={{color:'var(--st-brand)',fontWeight:600}}>{t('Cancellation policy')}</Link></p></div>
  {error&&<Notice role="alert" style={{marginTop:16}}>{t(error)}</Notice>}
 </Flow></div>
 <StickyBar data-booking-checkout>
  <Button className="full" type="button" onClick={()=>void send()} disabled={busy||(!s.is_mock&&accountLoading)}>{busy?t(s.is_mock?'Saving…':'Sending…'):t(s.is_mock?'Save preview plan':'Send request')}</Button>
  <p className="caption">{t(s.is_mock?'Saved on this device only. Nothing is sent or booked.':'Free to send. Nothing is booked yet.')}</p>
 </StickyBar>
 <SignInSheet open={sheet} next={reviewPath} onClose={closeSheet}/>
 </Screen>;
 const month=dayParts(date||today,language).month;
 return <Screen><div className="body"><Flow>{header}
  <p className="studio"><b>{name}</b>{service&&` · ${service.duration_minutes} ${t('min')}`} · {s.neighborhood}</p>
  {s.is_mock&&<PreviewBanner style={{marginTop:14}}><div className="title"><span className="tag">{t('Preview')}</span><strong>{t('Sample studio')}</strong></div><p>{t('Try the steps. This saves a preview on your device, not a real request.')}</p></PreviewBanner>}
  {services.length>1&&<div className="block"><div className="label-row"><h2>{t('Session')}</h2></div><div className="chips" role="group" aria-label={t('Session')}>{services.map(v=><button type="button" key={v.id} className="chip session" aria-pressed={v.id===serviceId} onClick={()=>setServiceId(v.id)}>{t(v.name)}<span>{v.duration_minutes} {t('min')} · {money(v.price,language)}</span></button>)}</div></div>}
  <div className="block" id="when"><div className="label-row"><h2>{t('Date')}</h2><span>{month}</span></div>
   <div className="dates" role="group" aria-label={t('Date')}>{days.map(d=>{const p=dayParts(d,language);const open=dayOpen(d);return <button type="button" key={d} className="date" aria-pressed={d===date} disabled={!open} onClick={()=>{setDate(d);if(time&&!slotOpen(d,time))setTime('');}} aria-label={shortDate(d,language)}><small>{p.weekday}</small><b>{p.day}</b><em>{d===today?t('Today'):''}</em></button>;})}</div>
  </div>
  <div className="block"><div className="label-row"><h2>{t('Time')}</h2><span>{t('Seoul time (KST)')}</span></div>
   <div className="times" role="group" aria-label={t('Time')}>{timeSlots.map(slot=><button type="button" key={slot} className="time" aria-pressed={slot===time} disabled={Boolean(date)&&!slotOpen(date,slot)} onClick={()=>setTime(slot)}>{slot}</button>)}</div>
   <p className="hint"><InformationCircleIcon aria-hidden="true"/><span>{t('You’re asking for this time. The studio confirms it when they accept.')}</span></p>
  </div>
  <div className="block" id="language"><div className="label-row"><h2>{t('Interpretation')}</h2>{selectedSupport&&<span>{t(supportLabel(selectedSupport))}</span>}</div>
   <div className="chips" role="group" aria-label={t('Interpretation')}>{s.studio_languages.map(l=><button type="button" key={l.language_code} className="chip" aria-pressed={l.language_code===language_} onClick={()=>setLang(l.language_code)}>{languageLabel(l.language_code)}</button>)}</div>
  </div>
  <div className="block" id="guests"><div className="label-row"><h2>{t('Guests')}</h2><span>{t('Up to {n} at this studio').replace('{n}',String(maxGuests))}</span></div>
   <div className="stepper"><div><b>{peopleText(guestCount)}</b><small>{guestText(guestCount)}</small></div><div className="ctl"><button type="button" onClick={()=>setGuests(Math.max(1,guestCount-1))} disabled={guestCount<=1} aria-label={t('Fewer guests')}><MinusIcon/></button><output aria-live="polite">{guestCount}</output><button type="button" onClick={()=>setGuests(Math.min(maxGuests,guestCount+1))} disabled={guestCount>=maxGuests} aria-label={t('More guests')}><PlusIcon/></button></div></div>
  </div>
  {!s.is_mock&&<div className="block" id="birth"><div className="label-row"><h2>{t('Birth details')}</h2><span>{t('Optional')}</span></div>
   <div className="fields"><Field>{t('Birth date')}<input type="date" value={birthDate} max={today} onChange={e=>setBirthDate(e.target.value)}/></Field><Field>{t('Birth time')}<input type="time" value={birthTime} onChange={e=>setBirthTime(e.target.value)}/><small>{t('Not sure? Leave it empty.')}</small></Field></div>
   <p className="faint" style={{marginTop:10}}>{t('Shared with the studio in your request message. You can also share them at the studio.')}</p>
  </div>}
  {error&&<Notice role="alert" style={{marginTop:16}}>{t(error)}</Notice>}
 </Flow></div>
 <StickyBar data-booking-checkout><div className="row">
  <div className="summary"><strong>{date&&time?`${shortDate(date,language)} · ${time}`:t('Choose a date and time')}</strong><span>{service?`${peopleText(guestCount)} · ${t('{price} total').replace('{price}',money(total,language))}`:t('Loading session options…')}</span></div>
  <Button type="button" disabled={!ready} onClick={()=>goStep(2)}>{t('Continue')}</Button>
 </div></StickyBar>
 </Screen>;
}
