// Server-only OpenAI helpers for the /api functions. OPENAI_API_KEY must never be a VITE_* variable.
export const jsonHeaders = {'Content-Type':'application/json','Cache-Control':'no-store'};
export const reply=(status:number,body:unknown)=>new Response(JSON.stringify(body),{status,headers:jsonHeaders});
export const openaiKey=()=>process.env['OPENAI_API_KEY']||undefined;

// Only accept calls made by this app's pages (same origin); stops other sites from spending the key.
export function sameOrigin(req:Request){
 const origin=req.headers.get('Origin');if(!origin)return false;
 try{return new URL(origin).host===new URL(req.url).host||new URL(origin).host===req.headers.get('x-forwarded-host');}catch{return false;}
}
