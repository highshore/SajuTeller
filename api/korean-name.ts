import { openaiKey, reply, sameOrigin } from '../server/openai.js';

// Generates one Korean name with OpenAI. The browser only sends the form; the key stays here.
type Body={originalName?:unknown;gender?:unknown;personality?:unknown};
type Name={name_hangul:string;name_hanja:string;romanization:string;meaning:string};
const traits:Record<string,string>={active:'active and energetic',calm:'calm and stable',creative:'creative and original',kind:'warm and friendly',strong:'strong and determined',wise:'wise and intelligent'};

export async function POST(req:Request){
 if(!sameOrigin(req))return reply(403,{code:'forbidden'});
 let body:Body;try{body=await req.json() as Body;}catch{return reply(400,{code:'invalid_request'});}
 const name=typeof body?.originalName==='string'?body.originalName.trim():'';
 const gender=body?.gender==='male'||body?.gender==='female'?body.gender:null;
 const personality=Array.isArray(body?.personality)?body.personality.filter((p):p is string=>typeof p==='string'&&p in traits):[];
 if(!name||name.length>80||!gender||personality.length>6)return reply(400,{code:'invalid_request'});
 const key=openaiKey();if(!key)return reply(503,{code:'not_configured'});
 try{
  const res=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({
   model:'gpt-4o-mini',temperature:0.8,max_tokens:500,response_format:{type:'json_object'},
   messages:[{role:'system',content:'You are a Korean name generator. Always respond in strict JSON format only.'},{role:'user',content:prompt(name,gender,personality.map(p=>traits[p]).join(', ')||'special')}],
  })});
  if(!res.ok){console.error('korean-name: OpenAI request failed',{status:res.status});return reply(502,{code:'generation_failed'});}
  const data=await res.json() as {choices?:{message?:{content?:string}}[]};
  const result=JSON.parse(data.choices?.[0]?.message?.content||'{}') as Partial<Name>;
  const fields=['name_hangul','name_hanja','romanization','meaning'] as const;
  if(fields.some(f=>typeof result[f]!=='string'||!result[f]))return reply(502,{code:'generation_failed'});
  return reply(200,Object.fromEntries(fields.map(f=>[f,result[f]])));
 }catch(error){console.error('korean-name failed',{name:error instanceof Error?error.name:'unknown'});return reply(502,{code:'generation_failed'});}
}

const prompt=(originalName:string,gender:string,personalityText:string)=>`You are a Korean name generator for foreigners.

Input fields:

Original name: ${originalName} (full name, e.g., John Smith, 李小龍, 山田太郎, María González)

Gender: ${gender==='male'?'Male':'Female'}

Personality traits: ${personalityText} (multiple choices possible)

Task:
Generate one Korean name primarily inspired by the sound of the original name, but also provide a meaningful Hanja interpretation reflecting the person’s personality traits.

Rules:

The name must be 3 Korean characters: 1-syllable surname + 2-syllable given name (natural Korean male/female name pattern).

Do not directly transliterate the original name.

Use the sound of the original name to inspire both surname and given name, adapting to sensible, natural Korean names.

Provide a Hanja interpretation for meaning, reflecting personality traits.

Return output in strict JSON format:

{
  "name_hangul": "...",
  "name_hanja": "...",
  "romanization": "...",
  "meaning": "Explain briefly the meaning of each character and why this name fits the person."
}


Examples:

English name: Kevin De Bruyne → 김덕배 (Kim Deok-bae)

Explanation: The sound of "De Bruyne" inspires “Deok-bae” (덕배) and “Kevin” inspires the surname “Kim” (김) for a natural Korean male name. Hanja 德培 represents 德 (Deok, virtue) and 培 (Bae, cultivate), meaning “one who cultivates virtue,” reflecting creativity and a warm, friendly personality.

Chinese name: 李小龍 → 이소룡 (Lee So-ryong)

Explanation: The sound “Li Xiao-long” inspires the Korean pronunciation “So-ryong” (소룡) with surname Lee (이). Hanja 小龍 represents 小 (So, small) and 龍 (Ryong, dragon), interpreted as “small but powerful dragon,” reflecting strong and determined traits.

Japanese name: 山田太郎 → 이태로 (Lee Tae-ro)

Explanation: The sound “Yamada Taro” inspires the Korean given name “Tae-ro” (태로) with surname Lee (이), following the 1+2 글자 패턴. Hanja 泰魯 represents 泰 (Tae, peaceful) and 魯 (Ro, bright/clear), interpreted as “one who is bright and peaceful,” reflecting wisdom and stability.

Spanish name: María González → 마리안 (Ma-ri-an)

Explanation: The sound “María” inspires “Ma-ri” (마리) and “González” inspires the surname “An” (안). Hanja 安理 represents 安 (An, peace) and 理 (Ri, reason), interpreted as “one who brings peace and clarity,” reflecting kindness and intelligence.

`;
