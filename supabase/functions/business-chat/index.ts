// Compatibility endpoint. Stream credentials live in Vercel's server environment.
const headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json','Cache-Control':'no-store'};
Deno.serve(async(req:Request)=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers});
 if(req.method!=='POST')return new Response(JSON.stringify({code:'method_not_allowed'}),{status:405,headers});
 if(!req.headers.get('Authorization'))return new Response(JSON.stringify({code:'unauthorized'}),{status:401,headers});
 try {
  // Destination is fixed; the Vercel handler verifies identity through business-chat-context.
  const result=await fetch('https://sajuteller.vercel.app/api/business-chat',{method:'POST',headers:{Authorization:req.headers.get('Authorization')!,'Content-Type':'application/json'},body:await req.text()});
  return new Response(await result.text(),{status:result.status,headers});
 }catch{return new Response(JSON.stringify({code:'chat_unavailable'}),{status:503,headers});}
});
