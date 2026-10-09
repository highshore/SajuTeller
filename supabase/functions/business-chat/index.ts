import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import { StreamChat } from 'npm:stream-chat@9.20.0';
const headers = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json','Cache-Control':'no-store'};
const reply=(status:number,body:unknown)=>new Response(JSON.stringify(body),{status,headers});
const channelType='saju_business';
Deno.serve(async(req:Request)=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers});
 if(req.method!=='POST')return reply(405,{code:'method_not_allowed'});
 try{
  const jwt=req.headers.get('Authorization')?.replace(/^Bearer /i,'');if(!jwt)return reply(401,{code:'unauthorized'});
  const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}});
  // Verify with Auth, including expiry; never trust a decoded JWT or user-supplied member IDs.
  const {data:{user},error:authError}=await db.auth.getUser(jwt);if(authError||!user)return reply(401,{code:'unauthorized'});
  let body:{studioId?:string};try{body=await req.json();}catch{return reply(400,{code:'invalid_request'});}
  if(!body||typeof body!=='object'||Array.isArray(body))return reply(400,{code:'invalid_request'});
  if(body.studioId!==undefined&&(typeof body.studioId!=='string'||! /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.studioId)))return reply(400,{code:'invalid_studio'});
  const apiKey=Deno.env.get('STREAM_API_KEY');const secret=Deno.env.get('STREAM_API_SECRET');if(!apiKey||!secret)return reply(503,{code:'chat_not_configured'});
  const client=new StreamChat(apiKey,secret);
  // A dedicated type prevents browser-created channels or membership changes.
  // Configure this once with scripts/configure-stream.mjs before enabling credentials.
  const config=await client.getChannelType(channelType);
  if(!Array.isArray(config.grants?.user)||config.grants.user.length!==0||!config.grants?.channel_member?.includes('read-channel'))return reply(503,{code:'chat_not_configured'});
  const {data:profile,error:profileError}=await db.from('profiles').select('display_name').eq('auth_user_id',user.id).maybeSingle();if(profileError)throw profileError;
  const viewer={id:user.id,name:profile?.display_name||'SajuTeller member'};
  await client.upsertUser(viewer);
  let channelId:string|undefined;
  if(body.studioId){
   const {data:studio,error}=await db.from('saju_studios').select('id,name,status,is_mock').eq('id',body.studioId).maybeSingle();if(error)throw error;
   if(!studio||studio.status!=='active')return reply(404,{code:'studio_unavailable'});
   if(studio.is_mock)return reply(409,{code:'preview_studio'});
   const {data:staff,error:staffError}=await db.from('sajuteller_studio_members').select('user_id').eq('studio_id',studio.id);if(staffError)throw staffError;
   if(!staff?.length)return reply(409,{code:'business_unavailable'});
   if(staff.some(s=>s.user_id===user.id))return reply(409,{code:'use_inbox'});
   const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`${studio.id}:${user.id}`));channelId='saju_'+Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('').slice(0,48);
   const {data:staffProfiles,error:profilesError}=await db.from('profiles').select('auth_user_id,display_name').in('auth_user_id',staff.map(s=>s.user_id));if(profilesError)throw profilesError;
   await client.upsertUsers(staff.map(s=>({id:s.user_id,name:staffProfiles?.find(p=>p.auth_user_id===s.user_id)?.display_name||studio.name})));
   const members=[user.id,...staff.map(s=>s.user_id)];
   const channel=client.channel(channelType,channelId,{name:studio.name,created_by_id:user.id,members,studio_id:studio.id,customer_id:user.id});
   await channel.create();
   const existing=await channel.queryMembers({}, {}, {limit:100});
   const oldIds=existing.members.map(m=>m.user_id).filter((id):id is string=>!!id&&!members.includes(id));if(oldIds.length)await channel.removeMembers(oldIds);
   const missing=members.filter(id=>!existing.members.some(m=>m.user_id===id));if(missing.length)await channel.addMembers(missing);
   const {error:recordError}=await db.from('sajuteller_conversations').upsert({studio_id:studio.id,customer_id:user.id,channel_id:channelId},{onConflict:'studio_id,customer_id'});if(recordError)throw recordError;
  }
  const expires=Math.floor(Date.now()/1000)+15*60;
  return reply(200,{apiKey,token:client.createToken(user.id,expires),user:viewer,channelType,channelId,expiresAt:expires});
 }catch(error){console.error('business-chat request failed',error instanceof Error?error.name:'unknown');return reply(503,{code:'chat_unavailable'});}
});
