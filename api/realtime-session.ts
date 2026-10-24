import { openaiKey, reply, sameOrigin } from '../server/openai.js';

// Mints a short-lived OpenAI Realtime client key (ek_…) for a signed-in user.
// The browser connects with it; the real key never leaves the server.
const REALTIME_MODEL='gpt-realtime';

export async function POST(req:Request){
 if(!sameOrigin(req))return reply(403,{code:'forbidden'});
 const jwt=req.headers.get('Authorization')?.replace(/^Bearer /i,'');if(!jwt)return reply(401,{code:'unauthorized'});
 const supabaseUrl=process.env.VITE_SUPABASE_URL;const anonKey=process.env.VITE_SUPABASE_PUBLISHABLE_KEY||process.env.VITE_SUPABASE_ANON_KEY;
 const key=openaiKey();if(!supabaseUrl||!anonKey||!key)return reply(503,{code:'not_configured'});
 try{
  // Supabase verifies the session token; realtime audio is costly, so anonymous visitors can't mint keys.
  const user=await fetch(`${supabaseUrl}/auth/v1/user`,{headers:{Authorization:`Bearer ${jwt}`,apikey:anonKey}});
  if(!user.ok)return reply(401,{code:'unauthorized'});
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
