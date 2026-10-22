import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled } from 'styled-components';
import { BellIcon, CheckIcon, SparklesIcon, ArrowUpRightIcon } from '@heroicons/react/24/outline';
import { useI18n } from '../i18n/i18n';
import { useNotifications, notificationText, safeNotificationPath } from '../product/notifications';
import { Page, Wrap, Notice, Button, ButtonLink, Chips, Chip } from '../product/ui';
import { TextSkeleton } from '../components/skeleton';
const Content=styled.div`
 display:grid;gap:20px;min-width:0;.intro{color:var(--st-muted);font-size:15px;line-height:1.55;}header h1{font-size:40px!important;}
 .toolbar{display:flex;align-items:center;justify-content:space-between;gap:8px;}.toolbar>button{border:0;background:none;color:var(--st-brand);font-weight:600;font-size:13px;white-space:nowrap;min-height:44px;cursor:pointer;}.toolbar>button:disabled{opacity:.4;cursor:default;}
 @container saju (max-width:360px){.toolbar{flex-direction:column;align-items:stretch;gap:0;}.toolbar>button{align-self:flex-end;}}
 [role=alert] button{margin-left:6px;border:0;background:none;color:var(--st-brand);font-weight:600;font-size:13px;min-height:32px;cursor:pointer;text-decoration:underline;}
 .feed{display:grid;gap:12px;}.card{border:1px solid var(--st-line);border-radius:16px;background:var(--st-surface);padding:16px;display:grid;gap:10px;min-width:0;}.card.unread{border-color:var(--st-accent-line);background:var(--st-accent);}
 .sender{display:flex;align-items:center;gap:10px;font-size:12px;font-weight:600;}.sender>.icon{width:32px;height:32px;border-radius:50%;display:grid;place-items:center;background:var(--st-brand);color:#fff;}.icon svg{width:16px;}.sender time{margin-left:auto;font-size:12px;font-weight:400;color:var(--st-muted);}.dot{width:8px;height:8px;border-radius:50%;background:var(--st-brand);}
 .card h2{font-size:17px;font-weight:600;letter-spacing:0;overflow-wrap:anywhere;}.body{font-size:14px;line-height:1.6;color:var(--st-muted);white-space:pre-wrap;overflow-wrap:anywhere;}.card-actions{display:flex;gap:10px;flex-wrap:wrap;}.card-actions button{font-size:13px;min-height:44px;padding:10px 14px;}
 .empty{display:grid;justify-items:center;text-align:center;gap:16px;padding:28px 10px;}.empty h2{font:600 26px/1.15 'Cormorant Garamond',serif;letter-spacing:0;}.empty p{font-size:14px;color:var(--st-muted);max-width:300px;}
 .preferences{border-top:1px solid var(--st-line);padding-top:20px;display:grid;gap:10px;}.preferences label{display:flex;align-items:center;justify-content:space-between;gap:16px;font-size:15px;font-weight:600;min-height:44px;}.preferences input{width:20px;height:20px;accent-color:var(--st-brand);}.preferences p{font-size:12px;color:var(--st-muted);}
`;
export default function Notifications(){
 const {t,language}=useI18n();const state=useNotifications();const navigate=useNavigate();const [filter,setFilter]=useState('all');
 const visible=state.items.filter(n=>filter==='all'||(filter==='unread'?!n.read_at:n.category==='offer'));
 return <Page><Wrap><Content><header><h1>{t('Notifications')}</h1><p className="intro">{t('Updates, helpful tips, and offers from SajuTeller.')}</p></header>
 <div className="toolbar"><Chips aria-label={t('Notification filters')}>{[['all','All'],['unread','Unread'],['offers','Offers']].map(([value,label])=><Chip key={value} $active={filter===value} aria-pressed={filter===value} onClick={()=>setFilter(value)}>{t(label)}</Chip>)}</Chips><button disabled={state.busy||!state.unread} onClick={()=>void state.markAll()}>{t('Mark all read')}</button></div>
 {state.error&&<Notice role="alert">{t(state.error)} <button onClick={()=>void state.refresh()}>{t('Retry')}</button></Notice>}
 {state.loading?<TextSkeleton lines={6}/>:<div className="feed">{visible.map(item=>{const text=notificationText(item,language);const path=safeNotificationPath(item.action_path);return <article key={item.id} className={'card'+(item.read_at?'':' unread')}><div className="sender"><span className="icon">{item.category==='offer'?<SparklesIcon/>:<BellIcon/>}</span><strong>SajuTeller</strong>{!item.read_at&&<span className="dot" aria-label={t('Unread')}/>}<time dateTime={item.published_at}>{new Intl.DateTimeFormat(language,{month:'short',day:'numeric'}).format(new Date(item.published_at))}</time></div><h2>{text.title}</h2><p className="body">{text.body}</p><div className="card-actions">{path&&<Button $secondary onClick={async()=>{if(!item.read_at)await state.markRead(item.id);navigate(path);}}>{t('View details')}<ArrowUpRightIcon/></Button>}{!item.read_at&&<Button $secondary disabled={state.busy} onClick={()=>void state.markRead(item.id)}><CheckIcon/>{t('Mark as read')}</Button>}</div></article>;})}
 {!visible.length&&!state.error&&!state.more&&<div className="empty"><h2>{t(filter==='unread'?'You’re all caught up':'Your SajuTeller inbox')}</h2><p>{t('New announcements and reading inspiration will appear here.')}</p><ButtonLink to="/experiences" $secondary>{t('Explore experiences')}</ButtonLink></div>}
 {state.more&&<Button $secondary disabled={state.busy} onClick={()=>void state.loadMore()}>{t(state.busy?'Loading…':'Load more')}</Button>}</div>}
 <section className="preferences"><label>{t('Offers and inspiration')}<input type="checkbox" checked={state.offers} disabled={state.loading||state.busy} onChange={e=>void state.setOffers(e.target.checked)}/></label><p>{t('Show promotional updates in this inbox. Service updates stay on.')}</p><p>{t('This inbox does not send email or push notifications.')}</p></section>
 </Content></Wrap></Page>;
}
