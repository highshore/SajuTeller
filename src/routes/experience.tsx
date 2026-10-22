import LoadingScreen from '../components/loading_screen';
import ProgressiveImage from '../components/progressive-image';
import { TextSkeleton } from '../components/skeleton';
import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { styled } from 'styled-components';
import { BanknotesIcon, ChatBubbleLeftRightIcon, ChevronLeftIcon, ChevronRightIcon, ClockIcon, HeartIcon, LanguageIcon, MapPinIcon, ShareIcon, UsersIcon } from '@heroicons/react/24/outline';
import { supabase } from '../supabase';
import { money, supportLabel, useSaved, useStudios, type Review, type Service } from '../product/data';
import { Button, ButtonLink, Empty, Notice, Page, Wrap } from '../product/ui';
import { useI18n } from '../i18n/i18n';
import { Card, Check, CheckList, PreviewBanner, Screen, StickyBar } from '../components/studio/studio-ui';
import { languageLabel } from '../components/studio/request-helpers';

// Figma: "03 Studio — Detail (accepting requests)" (139:461) and "03b Studio — Preview state" (148:1236).
type Reader={id:string;display_name:string;display_name_ko:string;title:string;bio:string;bio_i18n?:Record<string,string>;avatar_url:string|null;years_experience:number|null};

const Detail=styled.div`
  .toolbar{display:flex;justify-content:space-between;align-items:center;margin:4px -10px 4px;}
  .toolbar>div{display:flex;}
  .icon{width:44px;height:44px;display:grid;place-items:center;border:0;background:none;color:var(--st-ink);cursor:pointer;border-radius:50%;}
  .icon svg{width:22px;height:22px;}
  .headline{margin-top:20px;display:grid;gap:8px;}
  .where{display:flex;align-items:flex-start;gap:6px;font-size:14px;line-height:1.45;color:var(--st-muted);}
  .where svg{width:16px;flex:none;margin-top:2px;}
  .chip{justify-self:start;font-size:12px;font-weight:600;padding:4px 8px;border-radius:6px;background:var(--st-elevated);color:var(--st-muted);}
  .tagline{font-size:15px;line-height:1.55;color:var(--st-muted);margin-top:4px;}
  .facts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));border:1px solid var(--st-line);border-radius:16px;margin-top:20px;overflow:hidden;}
  .fact{padding:16px;display:grid;gap:4px;align-content:start;min-width:0;}
  .fact:nth-child(odd){border-right:1px solid var(--st-line);}
  .fact:nth-child(-n+2){border-bottom:1px solid var(--st-line);}
  .fact svg{width:20px;height:20px;color:var(--st-brand);margin-bottom:8px;}
  .fact span{font-size:12px;color:var(--st-muted);}
  .fact strong{font-size:15px;font-weight:600;line-height:1.35;overflow-wrap:anywhere;}
  .sessions{display:grid;gap:8px;margin-top:16px;}
  .session{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border:1px solid var(--st-line);border-radius:12px;background:var(--st-surface);cursor:pointer;min-height:56px;}
  .session input{position:absolute;opacity:0;pointer-events:none;}
  .session:has(input:checked){border-color:var(--st-brand);box-shadow:inset 0 0 0 1px var(--st-brand);}
  .session:has(input:focus-visible){outline:2px solid var(--st-action);outline-offset:2px;}
  .session b{display:block;font-size:15px;font-weight:600;line-height:1.35;}
  .session small{font-size:13px;color:var(--st-muted);}
  .session em{font-style:normal;font-size:14px;font-weight:600;white-space:nowrap;}
  ol.steps{list-style:none;padding:0;display:grid;gap:16px;}
  ol.steps li{display:grid;grid-template-columns:28px 1fr;gap:12px;align-items:start;}
  ol.steps .n{width:28px;height:28px;border-radius:50%;border:1px solid var(--st-line);display:grid;place-items:center;font-size:13px;font-weight:700;}
  ol.steps b{display:block;font-size:15px;font-weight:500;line-height:1.4;padding-top:3px;}
  ol.steps small{font-size:13px;color:var(--st-faint);}
  .reader{display:flex;align-items:center;gap:14px;padding:16px;border-radius:16px;background:var(--st-elevated);}
  .reader .avatar{width:56px;height:56px;flex:none;border-radius:50%;object-fit:cover;display:grid;place-items:center;background:var(--st-ink);color:#c9a76a;font:600 22px 'Noto Serif KR',serif;}
  .reader b{display:block;font-size:16px;font-weight:600;margin-bottom:2px;}
  .reader p{font-size:13px;line-height:1.45;color:var(--st-muted);}
  .bio{margin-top:12px;}
  .pills{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;}
  .pill{font-size:13px;font-weight:600;padding:8px 12px;border-radius:999px;background:var(--st-accent);color:var(--st-brand);}
  .area{position:relative;display:block;height:120px;border-radius:16px;overflow:hidden;background:var(--st-elevated);}
  .area::before{content:'';position:absolute;left:-10%;right:-10%;top:52%;height:7px;background:var(--st-surface);transform:rotate(-9deg);}
  .area::after{content:'';position:absolute;top:0;bottom:0;left:31%;width:7px;background:var(--st-surface);}
  .area .circle{position:absolute;left:50%;top:50%;width:84px;height:84px;margin:-42px 0 0 -42px;border-radius:50%;background:rgb(75 45 90 / 14%);border:1px solid var(--st-brand);z-index:1;}
  .area .go{position:absolute;right:10px;bottom:10px;z-index:2;font-size:12px;font-weight:600;padding:6px 10px;border-radius:999px;background:var(--st-surface);color:var(--st-brand);font-family:Inter,sans-serif;}
  .review{display:grid;gap:6px;}
  .review+.review{margin-top:10px;}
  .review .meta{font-size:12px;color:var(--st-faint);}
`;
const Cover=styled.div`
  position:relative;border-radius:16px;overflow:hidden;background:var(--st-accent);aspect-ratio:5/3;
  .track{display:flex;height:100%;overflow:auto;scroll-snap-type:x mandatory;scrollbar-width:none;}
  .slide{flex:0 0 100%;height:100%;scroll-snap-align:start;}
  .slide img{width:100%;height:100%;object-fit:cover;}
  .status{position:absolute;top:14px;left:14px;font-size:12px;font-weight:600;padding:5px 9px;border-radius:6px;}
  .open{background:var(--st-success-bg);color:var(--st-success);}
  .sample{background:var(--st-preview-bg);color:var(--st-preview);}
  .nav{position:absolute;bottom:10px;right:10px;display:flex;align-items:center;gap:6px;}
  .nav button{width:36px;height:36px;border:0;border-radius:50%;background:rgb(27 20 32 / 70%);color:#fff;display:grid;place-items:center;cursor:pointer;}
  .nav button:disabled{opacity:.35;cursor:default;}
  .nav svg{width:18px;}
  .nav span{font-size:12px;padding:6px 9px;border-radius:999px;background:rgb(27 20 32 / 70%);color:#fff;}
`;

export default function Experience(){
 const{t,language}=useI18n();const{id}=useParams();const{studios,loading,error,reload}=useStudios();const studio=studios.find(s=>s.id===id||s.slug===id);const{saved,toggle}=useSaved();
 const[services,setServices]=useState<Service[]>([]);const[reviews,setReviews]=useState<Review[]>([]);const[reader,setReader]=useState<Reader|null>(null);const[serviceId,setServiceId]=useState('');const[sectionErrors,setSectionErrors]=useState({services:false,reviews:false,reader:false});const[pending,setPending]=useState({services:true,reviews:true,reader:true});const[photo,setPhoto]=useState(0);const[notice,setNotice]=useState('');const[retry,setRetry]=useState(0);const gallery=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(!studio)return;let alive=true;setPending({services:true,reviews:true,reader:true});setSectionErrors({services:false,reviews:false,reader:false});setServices([]);setServiceId('');setReader(null);setReviews([]);setPhoto(0);setNotice('');
 const failed=(section:'services'|'reviews'|'reader')=>{if(alive)setSectionErrors(previous=>({...previous,[section]:true}));};
 const finished=(section:'services'|'reviews'|'reader')=>{if(alive)setPending(previous=>({...previous,[section]:false}));};
 void Promise.resolve(supabase.from('studio_services').select('id,studio_id,name,description,duration_minutes,price,max_guests,requires_birth_date,birth_time_recommended').eq('studio_id',studio.id).eq('active',true).order('sort_order')).then(({data,error})=>{if(error)throw error;if(alive){setServices(data||[]);setServiceId(data?.[0]?.id||'');}}).catch(()=>failed('services')).finally(()=>finished('services'));
 void Promise.resolve(supabase.from('studio_reviews').select('id,reviewer_display_name,rating,body,title,is_mock,verified_booking').eq('studio_id',studio.id).eq('status','published').eq('is_mock',false).limit(6)).then(({data,error})=>{if(error)throw error;if(alive)setReviews(data||[]);}).catch(()=>failed('reviews')).finally(()=>finished('reviews'));
 void Promise.resolve(supabase.from('studio_practitioners').select('id,display_name,display_name_ko,title,bio,bio_i18n,avatar_url,years_experience').eq('studio_id',studio.id).eq('is_active',true).order('is_primary',{ascending:false}).limit(1).maybeSingle()).then(({data,error})=>{if(error)throw error;if(alive)setReader(data);}).catch(()=>failed('reader')).finally(()=>finished('reader'));
 return()=>{alive=false;};},[studio,retry]);
 const sectionError=<Notice role="alert">{t('Some reading details could not be loaded. Please try again.')} <Button $secondary onClick={()=>setRetry(x=>x+1)}>{t('Retry')}</Button></Notice>;
 if(loading)return <Page><Wrap><LoadingScreen label="Loading your experience…"/></Wrap></Page>;
 if(error)return <Page><Wrap><Notice role="alert">{t(error)}<Button onClick={reload}>{t('Retry')}</Button></Notice></Wrap></Page>;
 if(!studio)return <Page><Wrap><Empty title={t('This reading has moved')} body={t('Explore the current collection to find your next reading.')} action={t('Explore experiences')}/></Wrap></Page>;
 const name=language==='ko'&&studio.name_ko?studio.name_ko:studio.name;const service=services.find(s=>s.id===serviceId);const destination=`/business/${studio.id}/booking?service=${serviceId}`;
 const images=[...studio.studio_images].sort((a,b)=>a.sort_order-b.sort_order);if(!images.length)images.push({image_url:'/figma/reading-atmosphere.svg',alt_text:name,sort_order:0});
 const move=(index:number)=>{const g=gallery.current;if(g)g.scrollTo({left:g.clientWidth*index,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});};
 async function share(){try{if(navigator.share)await navigator.share({title:name,url:location.href});else{await navigator.clipboard.writeText(location.href);setNotice('Link copied');}}catch(e){if(!(e instanceof DOMException&&e.name==='AbortError'))setNotice('Could not share. Copy the page address instead.');}}
 const isSaved=saved.includes(studio.id);const tarot=studio.modalities.includes('tarot');
 const duration=service?.duration_minutes||studio.min_duration_minutes;const maxGuests=Math.min(service?.max_guests||studio.max_guests,studio.max_guests)||1;const price=service?.price??studio.base_price;
 const guestsLabel=maxGuests<=1?t('Just you'):maxGuests===2?t('You + 1 friend'):t('Up to {n} people').replace('{n}',String(maxGuests));
 const languages=studio.studio_languages.map(l=>languageLabel(l.language_code)).join(' · ');
 const steps:[string,string][]=tarot?[['Share what’s on your mind','A question or an area of life'],['The reader draws and reads your cards','The main part of the session'],['Your follow-up questions','Career, love, timing']]:[['Share your birth date and time','Time is optional'],['The reader reads your Four Pillars','The main part of the session'],['Your questions','Career, love, timing']];
 const readerName=reader?(language==='ko'&&reader.display_name_ko?reader.display_name_ko:reader.display_name):'';
 return <Screen><div className="body"><Detail>
  <div className="toolbar"><Link className="icon" to="/experiences" aria-label={t('Back to experiences')}><ChevronLeftIcon/></Link><div><button className="icon" aria-label={t('Share')} onClick={()=>void share()}><ShareIcon/></button><button className="icon" aria-label={t(isSaved?'Unsave':'Save')} aria-pressed={isSaved} onClick={()=>toggle(studio.id)}><HeartIcon fill={isSaved?'currentColor':'none'}/></button></div></div>
  {notice&&<Notice role="status">{t(notice)}</Notice>}
  <Cover aria-label={t('Studio photos')}><div className="track" ref={gallery} onScroll={e=>{const g=e.currentTarget;setPhoto(Math.round(g.scrollLeft/g.clientWidth));}}>{images.map((img,i)=><div className="slide" key={i}><ProgressiveImage src={img.image_url} alt={studio.is_mock?t('Illustrative studio photo'):img.alt_text||name} loading={i?'lazy':'eager'} fetchPriority={i===0?'high':'auto'}/></div>)}</div>
   <span className={`status ${studio.is_mock?'sample':'open'}`}>{t(studio.is_mock?'Preview':'Takes requests')}</span>
   {images.length>1&&<div className="nav"><button disabled={!photo} onClick={()=>move(photo-1)} aria-label={t('Previous photo')}><ChevronLeftIcon/></button><span aria-live="polite">{photo+1} / {images.length}</span><button disabled={photo===images.length-1} onClick={()=>move(photo+1)} aria-label={t('Next photo')}><ChevronRightIcon/></button></div>}</Cover>
  <header className="headline"><h1 className="display">{name}</h1>
   <p className="where"><MapPinIcon aria-hidden="true"/><span>{studio.is_mock?`${studio.neighborhood} · ${t('Illustrative location in Seoul')}`:`${studio.neighborhood}${studio.nearest_station?` · ${t('{n} min walk from {station}').replace('{n}',String(studio.station_walk_minutes)).replace('{station}',studio.nearest_station)}`:''}`}</span></p>
   {!studio.is_mock&&!pending.reviews&&!sectionErrors.reviews&&!reviews.length&&<span className="chip">{t('New · no reviews yet')}</span>}
   {(studio.tagline_i18n?.[language]||studio.tagline)&&<p className="tagline">{studio.tagline_i18n?.[language]||studio.tagline}</p>}
  </header>
  {studio.is_mock&&<PreviewBanner style={{marginTop:20}}><div className="title"><span className="tag">{t('Preview')}</span><strong>{t('Sample studio')}</strong></div><p>{t(studio.demo_chat_enabled?'{name} is an example with an automated demo host. It can’t take requests, and its details are illustrative.':'{name} is an example while we sign up real partners. It can’t take requests, and its details are illustrative.').replace('{name}',name)}</p>{studio.demo_chat_enabled&&<Link to={`/messages?studio=${studio.id}`}>{t('Try demo chat')}</Link>}</PreviewBanner>}
  <div className="facts">
   <div className="fact"><ClockIcon aria-hidden="true"/><span>{t('Session')}</span><strong>{t('{n} min, private').replace('{n}',String(duration))}</strong></div>
   <div className="fact"><UsersIcon aria-hidden="true"/><span>{t('Guests')}</span><strong>{guestsLabel}</strong></div>
   <div className="fact"><LanguageIcon aria-hidden="true"/><span>{t('Languages')}</span><strong>{languages||'—'}</strong></div>
   <div className="fact"><BanknotesIcon aria-hidden="true"/><span>{t(studio.is_mock?'Sample price':'Price')}</span><strong>{t('{price} per person').replace('{price}',money(price,language))}</strong></div>
  </div>
  {studio.studio_languages.length>0&&<p className="faint" style={{marginTop:10}}>{studio.studio_languages.map(l=>`${languageLabel(l.language_code)}: ${t(supportLabel(l.support_type))}`).join(' · ')}</p>}
  {sectionErrors.services&&<div style={{marginTop:16}}>{sectionError}</div>}
  {services.length>1&&<fieldset className="sessions" style={{border:0,padding:0}}><legend className="faint" style={{marginBottom:8}}>{t('Choose your session')}</legend>{services.map(v=><label className="session" key={v.id}><input type="radio" name="session" value={v.id} checked={v.id===serviceId} onChange={()=>setServiceId(v.id)}/><span><b>{t(v.name)}</b><small>{v.duration_minutes} {t('min')}</small></span><em>{money(v.price,language)}</em></label>)}</fieldset>}
  <hr className="rule"/>
  <section><h2>{t('What happens in your session')}</h2>
   {(service?.description||studio.description)&&<p className="muted" style={{marginBottom:18}}>{t(service?.description||'')||studio.description_i18n?.[language]||studio.description}</p>}
   <ol className="steps">{steps.map(([title,sub],i)=><li key={title}><span className="n">{i+1}</span><span><b>{t(title)}</b><small>{t(sub)}</small></span></li>)}</ol>
   <p className="faint" style={{marginTop:14}}>{t('Each studio runs its own session. This is the usual shape.')}</p>
  </section>
  <hr className="rule"/>
  <section><h2>{t(studio.demo_chat_enabled?'Meet your demo host':'Your reader')}</h2>
   {studio.demo_chat_enabled?<p className="muted">{t('Ask about pricing, languages, or how to prepare. Replies are automated for this demo.')}</p>:pending.reader?<TextSkeleton/>:sectionErrors.reader?sectionError:reader?<>
    <div className="reader">{reader.avatar_url&&!studio.is_mock?<img className="avatar" src={reader.avatar_url} alt="" onError={e=>{e.currentTarget.style.display='none';}}/>:<span className="avatar" aria-hidden="true">{(reader.display_name_ko||reader.display_name).slice(0,1)}</span>}<div><b>{readerName}</b><p>{[reader.title?t(reader.title):t('Saju practitioner'),reader.years_experience!==null?`${reader.years_experience} ${t('years of practice')}`:''].filter(Boolean).join(' · ')}</p></div></div>
    {(reader.bio_i18n?.[language]||reader.bio)&&<p className="muted bio">{reader.bio_i18n?.[language]||reader.bio}</p>}
    <p className="faint" style={{marginTop:12}}>{t(studio.is_mock?'This reader profile is illustrative.':'Background is provided by the studio.')}</p>
   </>:<p className="muted">{t('Reader details will be shared by the studio.')}</p>}
   {studio.specialties.length>0&&<div className="pills">{studio.specialties.map(topic=><span className="pill" key={topic}>{t(topic.replaceAll('_',' ').replace(/^./,c=>c.toUpperCase()))}</span>)}</div>}
   {!studio.is_mock&&<Link className="text-link" to={`/messages?studio=${studio.id}`} style={{marginTop:8}}><ChatBubbleLeftRightIcon/>{t('Message the studio')}</Link>}
  </section>
  <hr className="rule"/>
  <section><h2>{t('Bring with you')}</h2><CheckList><Check>{t('Your birth date')}</Check><Check>{t('Birth time and city, if you know them — a date alone still works')}</Check><Check>{t('Your phone, for live interpretation')}</Check></CheckList>
   <p className="faint" style={{marginTop:14}}>{t('AI interpretation may make mistakes. Confirm important meanings with your reader.')}</p></section>
  <hr className="rule"/>
  <section><h2>{t('Where and cancellation')}</h2>
   <Link className="area" to={`/map?studio=${studio.id}`} aria-label={t('View on map')}><span className="circle" aria-hidden="true"/><span className="go">{t('View on map')}</span></Link>
   <p className="muted" style={{marginTop:12}}>{studio.is_mock?`${studio.neighborhood}. ${t('Illustrative location in Seoul')}`:`${studio.neighborhood}${studio.district?`, ${studio.district}`:''}. ${t('The exact address appears in your trip once the studio accepts.')}`}</p>
   <Card $tone="var(--st-elevated)" style={{marginTop:16}}><strong>{t('Cancel free while your request is pending')}</strong><p>{t('Once a studio accepts, check its cancellation terms before you travel.')} <Link to="/refund-policy" style={{color:'var(--st-brand)',fontWeight:600}}>{t('Cancellation policy')}</Link></p></Card>
  </section>
  <hr className="rule"/>
  <section><h2>{t('Reviews')}</h2>
   {pending.reviews?<TextSkeleton/>:sectionErrors.reviews?sectionError:reviews.length?reviews.map(r=><Card key={r.id} className="review">{r.title&&<strong>{r.title}</strong>}<p style={{color:'var(--st-ink)',fontSize:14}}>{r.body}</p><span className="meta">{r.reviewer_display_name} · {r.rating}/5{r.verified_booking?` · ${t('Verified booking')}`:''}</span></Card>):<Card><strong>{t('No reviews yet')}</strong><p>{t(studio.is_mock?'Sample studios don’t have reviews. We never show made-up ones.':'Reviews appear here after guests visit. We never show made-up ones.')}</p></Card>}
  </section>
  {studio.is_mock&&<><hr className="rule"/><p className="muted">{t('Want a reading like this? Tell us — we sign up studios in the areas people ask for first.')}</p>{service&&!studio.demo_chat_enabled&&<Link className="text-link" to={destination}>{t('Try the request steps as a preview')}</Link>}</>}
 </Detail></div>
 {studio.is_mock?<StickyBar data-booking-action>
   <div className="row"><div className="summary"><strong>{t('From')} {money(price,language)}</strong></div><span className="faint">{t('Sample price')}</span></div>
   {isSaved?<ButtonLink $secondary className="full" to="/saved">{t('Saved · see your list')}</ButtonLink>:<Button $secondary className="full" onClick={()=>toggle(studio.id)}>{t('Save for when it opens')}</Button>}
   <p className="caption">{t(isSaved?'Saved on this device. We can’t send alerts yet.':'Alerts aren’t available yet. This saves the studio to your list.')}</p>
  </StickyBar>:<StickyBar data-booking-action>
   <div className="row"><div className="summary"><strong>{t('{price} / person').replace('{price}',money(price,language))}</strong><span>{t('No payment in the app')}</span></div>
   {service?<ButtonLink to={destination}>{t('Request a time')}</ButtonLink>:<Button disabled>{t(pending.services?'Loading…':'Session options unavailable')}</Button>}</div>
  </StickyBar>}
 </Screen>;
}
