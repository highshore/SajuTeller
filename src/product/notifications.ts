import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../supabase';
import { useAccount } from './data';
export type Notification={id:string;category:'update'|'offer';title:string;body:string;translations:Record<string,{title?:string;body?:string}>;action_path:string|null;published_at:string;read_at:string|null};
const PAGE_SIZE=30;
export function useNotificationState(){
 const {account}=useAccount();const userId=account?.id;const currentUser=useRef(userId);currentUser.current=userId;
 const [owner,setOwner]=useState<string>();
 const [items,setItems]=useState<Notification[]>([]);const [unread,setUnread]=useState(0);const [offers,setOffers]=useState(true);
 const [loading,setLoading]=useState(true);const [more,setMore]=useState(false);const [error,setError]=useState('');const [busy,setBusy]=useState(false);
 const generation=useRef(0);
 const refresh=useCallback(async()=>{
  const request=++generation.current;if(!userId){setItems([]);setUnread(0);setLoading(false);setError('');return;}
  try{
   const [feed,count,pref]=await Promise.all([supabase.rpc('sajuteller_notification_feed',{p_limit:PAGE_SIZE,p_offset:0}),supabase.rpc('sajuteller_notification_unread_count'),supabase.from('sajuteller_notification_preferences').select('offers_enabled').eq('user_id',userId).maybeSingle()]);
   if(feed.error||count.error||pref.error)throw new Error('unavailable');
   if(request!==generation.current||currentUser.current!==userId)return;
   setOwner(userId);setItems(feed.data||[]);setMore(feed.data?.length===PAGE_SIZE);setUnread(Number(count.data||0));setOffers(pref.data?.offers_enabled??true);setError('');
  }catch{if(request===generation.current)setError('Notifications could not be loaded. Please try again.');}
  finally{if(request===generation.current)setLoading(false);}
 },[userId]);
 useEffect(()=>{
  setItems([]);setUnread(0);setLoading(!!userId);void refresh();
  const update=()=>{if(document.visibilityState==='visible')void refresh();};
  window.addEventListener('focus',update);const timer=window.setInterval(update,60000);
  const invalidate=()=>{generation.current++;};
  return()=>{invalidate();window.removeEventListener('focus',update);clearInterval(timer);};
 },[refresh,userId]);
 async function run(action:()=>PromiseLike<{error:unknown}>){
  if(!userId||busy)return false;setBusy(true);setError('');
  try{const result=await action();if(result.error)throw result.error;if(currentUser.current===userId)await refresh();return true;}
  catch{if(currentUser.current===userId)setError('Your changes could not be saved. Please try again.');return false;}
  finally{setBusy(false);}
 }
 async function loadMore(){
  if(busy||!more||!userId)return;setBusy(true);const request=generation.current;
  try{const {data,error}=await supabase.rpc('sajuteller_notification_feed',{p_limit:PAGE_SIZE,p_offset:items.length});if(error)throw error;if(request===generation.current){setItems(old=>[...old,...(data||[]).filter((n:Notification)=>!old.some(x=>x.id===n.id))]);setMore(data?.length===PAGE_SIZE);}}
  catch{setError('Notifications could not be loaded. Please try again.');}finally{setBusy(false);}
 }
 return {items:owner===userId?items:[],unread:owner===userId?unread:0,offers,loading,more,error,busy,refresh,loadMore,
  markRead:(id:string)=>run(()=>supabase.from('sajuteller_notification_reads').upsert({user_id:userId,notification_id:id},{onConflict:'user_id,notification_id',ignoreDuplicates:true})),
  markAll:()=>run(()=>supabase.rpc('sajuteller_notifications_mark_all_read')),
  setOffers:async(enabled:boolean)=>{const previous=offers;setOffers(enabled);const success=await run(()=>supabase.from('sajuteller_notification_preferences').upsert({user_id:userId,offers_enabled:enabled},{onConflict:'user_id'}));if(!success&&currentUser.current===userId)setOffers(previous);return success;}};
}
export const NotificationContext=createContext<ReturnType<typeof useNotificationState>|null>(null);
export function useNotifications(){const value=useContext(NotificationContext);if(!value)throw new Error('NotificationProvider is required');return value;}
export function notificationText(item:Notification,language:string){return {title:item.translations?.[language]?.title||item.title,body:item.translations?.[language]?.body||item.body};}
export function safeNotificationPath(path:string|null){return path&&/^\/[a-zA-Z0-9]/.test(path)&&!path.includes('\\')&&!Array.from(path).some(c=>c.charCodeAt(0)<32||c.charCodeAt(0)===127)?path:null;}
