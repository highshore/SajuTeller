import { StreamChat } from 'stream-chat';
import { demoText } from '../server/demo.js';
const headers = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json','Cache-Control':'no-store'};
const reply=(status:number,body:unknown)=>new Response(JSON.stringify(body),{status,headers});
type ChatBody={studioId?:string;action?:string;messageId?:string;language?:string};
type ChatContext={code?:string;viewer:{id:string;name:string};channelId?:string;isDemo?:boolean;staff?:{id:string;name:string}[];studio?:{id:string;name:string;base_price:number;min_duration_minutes:number;max_guests:number;neighborhood:string}};
const channelType='saju_business';
export async function POST(req:Request){
 if(req.method==='OPTIONS')return new Response('ok',{headers});
 if(req.method!=='POST')return reply(405,{code:'method_not_allowed'});
 try{
  const jwt=req.headers.get('Authorization')?.replace(/^Bearer /i,'');if(!jwt)return reply(401,{code:'unauthorized'});
  let body:ChatBody;try{body=await req.json() as ChatBody;}catch{return reply(400,{code:'invalid_request'});}
  if(!body||typeof body!=='object'||Array.isArray(body))return reply(400,{code:'invalid_request'});
  if(body.studioId!==undefined&&(typeof body.studioId!=='string'||! /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.studioId)))return reply(400,{code:'invalid_studio'});
  if(body.action!==undefined&&body.action!=='demo_reply')return reply(400,{code:'invalid_request'});
  if(body.action==='demo_reply'&&(!body.studioId||typeof body.messageId!=='string'||body.messageId.length>128||!body.messageId))return reply(400,{code:'invalid_request'});
  // Supabase verifies the bearer token and derives all privileged IDs from its database.
  const supabaseUrl=process.env.VITE_SUPABASE_URL;
  if(!supabaseUrl)return reply(503,{code:'chat_not_configured'});
  const authorized=await fetch(`${supabaseUrl}/functions/v1/business-chat-context`,{method:'POST',headers:{Authorization:`Bearer ${jwt}`,'Content-Type':'application/json'},body:JSON.stringify({studioId:body.studioId})});
  const context=await authorized.json() as ChatContext;if(!authorized.ok)return reply(authorized.status,{code:context.code||'chat_unavailable'});
  const apiKey=process.env['STREAM_API_KEY'];const secret=process.env['STREAM_API_SECRET'];if(!apiKey||!secret)return reply(503,{code:'chat_not_configured'});
  const client=new StreamChat(apiKey,secret);
  // A dedicated type prevents browser-created channels or membership changes.
  // Initialize only this app's dedicated type; never alter other apps' channel permissions.
  let config;
  try { config=await client.getChannelType(channelType); }
  catch(error) {
   const e=error as {code?:number;status?:number};if(e.code!==16&&e.status!==404)throw error;
   const member=['read-channel','read-channel-members','create-message','add-links','create-reaction','delete-reaction-owner','flag-message'];
   await client.createChannelType({name:channelType,typing_events:true,read_events:true,connect_events:true,reactions:true,replies:false,quotes:true,uploads:false,url_enrichment:false,max_message_length:4000,grants:{user:[],guest:[],anonymous:[],channel_member:member,channel_moderator:member}});
   config=await client.getChannelType(channelType);
  }
  if(!Array.isArray(config.grants?.user)||config.grants.user.length!==0||!config.grants?.channel_member?.includes('read-channel')||['guest','anonymous'].some(role=>(config.grants?.[role]||[]).length>0)||config.grants?.channel_member?.some(grant=>['create-channel','update-channel','update-channel-members'].includes(grant)))return reply(503,{code:'chat_not_configured'});
  const viewer=context.viewer as {id:string;name:string};
  await client.upsertUser(viewer);
  const channelId=context.channelId as string|undefined;
  if(body.studioId){
   const {isDemo}=context;const studio=context.studio;
   if(!studio||!channelId||!context.staff)return reply(503,{code:'chat_unavailable'});
   const staff=context.staff as {id:string;name:string}[];
   if(body.action==='demo_reply'&&!isDemo)return reply(403,{code:'not_demo'});
   const botId=`saju_demo_${studio.id}`;
   // Reply only to a real, authenticated customer's message in their own designated demo channel.
   if(body.action==='demo_reply'){
    const {message}=await client.getMessage(body.messageId!);
    if(message.cid!==`${channelType}:${channelId}`||message.user?.id!==viewer.id||!message.text||message.deleted_at)return reply(403,{code:'invalid_message'});
    const channel=client.channel(channelType,channelId!);
    await sendOnce(client,channel,`demo_${body.messageId}`,botId,demoText(body.language,studio,message.text));
    return reply(200,{replied:true});
   }
   await client.upsertUsers(staff);
   const members=[viewer.id,...staff.map(s=>s.id)];
   const channelData={name:studio.name,created_by_id:viewer.id,members,studio_id:studio.id,customer_id:viewer.id,is_demo:isDemo};
   const channel=client.channel(channelType,channelId!,channelData);
   await channel.create();
   const existing=await channel.queryMembers({}, {}, {limit:100});
   const oldIds=existing.members.map(m=>m.user_id).filter((id):id is string=>!!id&&!members.includes(id));if(oldIds.length)await channel.removeMembers(oldIds);
   const missing=members.filter(id=>!existing.members.some(m=>m.user_id===id));if(missing.length)await channel.addMembers(missing);
   if(isDemo)await sendOnce(client,channel,`welcome_${channelId}`,botId,demoText(body.language,studio));
  }
  const expires=Math.floor(Date.now()/1000)+15*60;
  return reply(200,{apiKey,token:client.createToken(viewer.id,expires),user:viewer,channelType,channelId,expiresAt:expires});
 }catch(error){console.error('business-chat request failed',error instanceof Error?error.name:'unknown');return reply(503,{code:'chat_unavailable'});}
}

// Stable message IDs make reconnects/retries safe, including simultaneous browser tabs.
async function sendOnce(client:StreamChat,channel:ReturnType<StreamChat['channel']>,id:string,userId:string,text:string){
 try {await client.getMessage(id);return;} catch(error){const e=error as {code?:number;status?:number};if(e.code!==4&&e.code!==16&&e.status!==404)throw error;}
 try {await channel.sendMessage({id,user_id:userId,text});} catch(error){try{await client.getMessage(id);}catch{throw error;}}
}
