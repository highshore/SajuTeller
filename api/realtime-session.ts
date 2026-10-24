import { openaiKey, reply, sameOrigin } from '../server/openai.js';

// Mints a short-lived OpenAI Realtime client key (ek_…) for a signed-in user.
// The browser connects with it; the real key never leaves the server.
const REALTIME_MODEL='gpt-realtime';
// Keys per user per hour (QA-06). Each key is logged in sajuteller_realtime_key_log.
const HOURLY_KEY_LIMIT=20;

export async function POST(req:Request){
 if(!sameOrigin(req))return reply(403,{code:'forbidden'});
 const jwt=req.headers.get('Authorization')?.replace(/^Bearer /i,'');if(!jwt)return reply(401,{code:'unauthorized'});
 const supabaseUrl=process.env.VITE_SUPABASE_URL;const anonKey=process.env.VITE_SUPABASE_PUBLISHABLE_KEY||process.env.VITE_SUPABASE_ANON_KEY;
 const key=openaiKey();if(!supabaseUrl||!anonKey||!key)return reply(503,{code:'not_configured'});
 try{
  // Supabase verifies the session token; realtime audio is costly, so anonymous visitors can't mint keys.
  const user=await fetch(`${supabaseUrl}/auth/v1/user`,{headers:{Authorization:`Bearer ${jwt}`,apikey:anonKey}});
  if(!user.ok)return reply(401,{code:'unauthorized'});
  // Per-user limit and audit log, checked as the caller (RLS). If the check itself is unavailable
  // the request still goes through: sign-in is the access control, the limit only curbs abuse.
  const claim=await fetch(`${supabaseUrl}/rest/v1/rpc/sajuteller_claim_realtime_key`,{method:'POST',headers:{Authorization:`Bearer ${jwt}`,apikey:anonKey,'Content-Type':'application/json'},body:JSON.stringify({p_limit:HOURLY_KEY_LIMIT})});
  if(claim.ok){if(await claim.json()===false)return reply(429,{code:'rate_limited'});}
  else console.warn('realtime-session: key limit check unavailable',{status:claim.status});
  const res=await fetch('https://api.openai.com/v1/realtime/client_secrets',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({
   expires_after:{anchor:'created_at',seconds:120},
   session:{type:'realtime',model:REALTIME_MODEL},
  })});
  if(!res.ok){console.error('realtime-session: OpenAI request failed',{status:res.status});return reply(502,{code:'session_failed'});}
  const data=await res.json() as {value?:string;expires_at?:number};
  if(!data.value?.startsWith('ek_'))return reply(502,{code:'session_failed'});
  return reply(200,{value:data.value,expiresAt:data.expires_at,model:REALTIME_MODEL});
 }catch(error){console.error('realtime-session failed',{name:error instanceof Error?error.name:'unknown'});return reply(502,{code:'session_failed'});}
}
