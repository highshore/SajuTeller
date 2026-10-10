import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
const headers={'Content-Type':'application/json','Cache-Control':'no-store'};
const reply=(status:number,body:unknown)=>new Response(JSON.stringify(body),{status,headers});
Deno.serve(async(req:Request)=>{
 if(req.method!=='POST')return reply(405,{code:'method_not_allowed'});
 try {
  const jwt=req.headers.get('Authorization')?.replace(/^Bearer /i,'');if(!jwt)return reply(401,{code:'unauthorized'});
  const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:{user},error:authError}=await db.auth.getUser(jwt);if(authError||!user)return reply(401,{code:'unauthorized'});
  let body:{studioId?:string};try{body=await req.json();}catch{return reply(400,{code:'invalid_request'});}
  if(!body||typeof body!=='object'||Array.isArray(body))return reply(400,{code:'invalid_request'});
  if(body.studioId!==undefined&&(typeof body.studioId!=='string'||! /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.studioId)))return reply(400,{code:'invalid_studio'});
  const {data:profile,error:profileError}=await db.from('profiles').select('display_name').eq('auth_user_id',user.id).maybeSingle();if(profileError)throw profileError;
  const viewer={id:user.id,name:profile?.display_name||'SajuTeller member'};
  if(!body.studioId)return reply(200,{viewer});
  const {data:studio,error}=await db.from('saju_studios').select('id,name,status,is_mock,demo_chat_enabled,base_price,min_duration_minutes,max_guests,neighborhood').eq('id',body.studioId).maybeSingle();if(error)throw error;
  if(!studio||studio.status!=='active')return reply(404,{code:'studio_unavailable'});
  const isDemo=studio.is_mock&&studio.demo_chat_enabled;
  if(studio.is_mock&&!isDemo)return reply(409,{code:'preview_studio'});
  let staff:{id:string;name:string}[];
  if(isDemo)staff=[{id:`saju_demo_${studio.id}`,name:`${studio.name} · Demo host (automated)`}];
  else {
   const {data:rows,error:staffError}=await db.from('sajuteller_studio_members').select('user_id').eq('studio_id',studio.id);if(staffError)throw staffError;
   if(!rows?.length)return reply(409,{code:'business_unavailable'});
   if(rows.some(s=>s.user_id===user.id))return reply(409,{code:'use_inbox'});
   const {data:profiles,error:pe}=await db.from('profiles').select('auth_user_id,display_name').in('auth_user_id',rows.map(s=>s.user_id));if(pe)throw pe;
   staff=rows.map(s=>({id:s.user_id,name:profiles?.find(p=>p.auth_user_id===s.user_id)?.display_name||studio.name}));
  }
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`${studio.id}:${user.id}`));const channelId='saju_'+Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('').slice(0,48);
  const {error:recordError}=await db.from('sajuteller_conversations').upsert({studio_id:studio.id,customer_id:user.id,channel_id:channelId},{onConflict:'studio_id,customer_id'});if(recordError)throw recordError;
  // Only the verified caller's conversation context is returned. No secrets or birth data.
  return reply(200,{viewer,studio,staff,channelId,isDemo});
 }catch(error){console.error('business-chat-context failed',error instanceof Error?error.name:'unknown');return reply(503,{code:'chat_unavailable'});}
});
