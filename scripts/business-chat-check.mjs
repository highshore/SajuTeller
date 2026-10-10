// Exercise the real handler with mocked external boundaries; never sends messages or contacts providers.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import ts from 'typescript';
const demo=ts.transpile(fs.readFileSync('server/demo.ts','utf8').replace('export function','function'),{target:ts.ScriptTarget.ES2022});
const code=ts.transpile(fs.readFileSync('api/business-chat.ts','utf8').replace(/^import .*;$/gm,'').replace('export async function','async function'),{target:ts.ScriptTarget.ES2022});
const customer='11111111-1111-4111-8111-111111111111',staff='22222222-2222-4222-8222-222222222222',studioId='33333333-3333-4333-8333-333333333333';
let config,studio,staffRows,env,changes,handler,sourceMessage,missingType,racingType,configReads;
function reset(){missingType=false;racingType=false;configReads=0;config={grants:{user:[],channel_member:['read-channel']}};studio={id:studioId,name:'Test studio',is_mock:false,status:'active'};staffRows=[{user_id:staff}];env={VITE_SUPABASE_URL:'https://example.invalid',SUPABASE_URL:'https://example.invalid',SUPABASE_SERVICE_ROLE_KEY:'server-test',STREAM_API_KEY:'public-test',STREAM_API_SECRET:'secret-test'};sourceMessage=null;changes={messages:[],creates:[],tokens:[],upserts:[],added:[],removed:[]};}
const db={auth:{getUser:async jwt=>({data:{user:jwt==='valid'?{id:customer}:null},error:jwt==='valid'?null:new Error('invalid')})},from(table){let result=table==='profiles'?{display_name:'Customer'}:table==='saju_studios'?studio:table==='sajuteller_studio_members'?staffRows:[];const builder={select(){return this;},eq(){return this;},in(){result=[{auth_user_id:staff,display_name:'Reader'}];return this;},maybeSingle(){return Promise.resolve({data:result,error:null});},upsert(row){changes.upserts.push(row);return Promise.resolve({error:null});},then(resolve,reject){return Promise.resolve({data:result,error:null}).then(resolve,reject);}};return builder;}};
class MockStream{async getChannelType(){if(missingType&&configReads++===0)throw Object.assign(new Error('missing'),{code:16});return config;}async createChannelType(){if(racingType)throw Object.assign(new Error('already exists'),{code:4});}async getMessage(id){if(sourceMessage?.id===id)return {message:sourceMessage};const message=changes.messages.find(m=>m.id===id);if(message)return {message};throw Object.assign(new Error("not found"),{code:4});}async upsertUser(){}async upsertUsers(){}channel(type,id,data){return{sendMessage:async message=>{changes.messages.push(message);return{message};},create:async()=>changes.creates.push({type,id,data}),queryMembers:async()=>({members:[{user_id:customer},{user_id:'revoked-staff'}]}),removeMembers:async ids=>changes.removed.push(...ids),addMembers:async ids=>changes.added.push(...ids)};}createToken(id,expires){changes.tokens.push({id,expires});return 'test-token';}}
const contextCode=ts.transpile(fs.readFileSync('supabase/functions/business-chat-context/index.ts','utf8').replace(/^import .*;$/gm,''),{target:ts.ScriptTarget.ES2022});
let contextHandler;
vm.runInNewContext(contextCode,{Deno:{env:{get:key=>env[key]},serve:fn=>{contextHandler=fn;}},Request,Response,crypto,TextEncoder,console,createClient:()=>db});
const sandbox={process:{get env(){return env;}},Request,Response,crypto,TextEncoder,console,StreamChat:MockStream,fetch:async(url,options)=>contextHandler(new Request(url,options))};
vm.runInNewContext(demo+code+';globalThis.handler=POST;',sandbox);handler=sandbox.handler;

const request=(body={},token='valid',method='POST')=>handler(new Request('https://example.invalid',{method,headers:token?{Authorization:`Bearer ${token}`}:{},...(method==='POST'?{body:JSON.stringify(body)}:{})}));
reset();assert.equal((await request({},'', 'POST')).status,401);assert.equal((await request({},'forged')).status,401);assert.equal(changes.tokens.length,0);
assert.equal((await request({},'valid','GET')).status,405);assert.equal((await request({},'','OPTIONS')).status,200);
assert.equal((await request(null)).status,400);assert.equal((await request({studioId:'------------------------------------'})).status,400);
env.STREAM_API_SECRET='';assert.equal((await request()).status,503);assert.equal(changes.tokens.length,0);
reset();config.grants.user=['create-channel'];assert.equal((await request()).status,503);assert.equal(changes.tokens.length,0);
reset();studio.is_mock=true;assert.equal((await request({studioId})).status,409);assert.equal(changes.creates.length,0);assert.equal(changes.tokens.length,0);
reset();studio.status='draft';assert.equal((await request({studioId})).status,404);
reset();staffRows=[];assert.equal((await request({studioId})).status,409);
reset();const result=await request({studioId,userId:'attacker',members:['attacker']});assert.equal(result.status,200);const payload=await result.json();assert.equal(payload.user.id,customer);assert.equal(payload.apiKey,'public-test');assert.ok(!JSON.stringify(payload).includes('secret-test'));assert.deepEqual(Array.from(changes.creates[0].data.members),[customer,staff]);assert.equal(changes.creates[0].type,'saju_business');assert.equal(changes.creates[0].id.length,53);assert.equal(changes.tokens[0].id,customer);assert.ok(Math.abs(changes.tokens[0].expires-Date.now()/1000-900)<2);assert.deepEqual(changes.added,[staff]);assert.deepEqual(changes.removed,['revoked-staff']);const id=payload.channelId;
reset();assert.equal((await (await request({studioId})).json()).channelId,id);
reset();assert.equal((await request()).status,200);assert.equal(changes.creates.length,0);
console.log('PASS: verified identity, no secret leakage, fail-closed config, preview/inactive/staff guards, server-only membership, deterministic private channels, 15-minute tokens.');

reset();studio={...studio,is_mock:true,demo_chat_enabled:true,base_price:55000,min_duration_minutes:30,max_guests:1,neighborhood:'Insadong'};
const demoResult=await request({studioId});assert.equal(demoResult.status,200);const demoChannel=(await demoResult.json()).channelId;
assert.deepEqual(Array.from(changes.creates[0].data.members),[customer,`saju_demo_${studioId}`]);assert.equal(changes.creates[0].data.is_demo,true);assert.equal(changes.messages.length,1);assert.ok(changes.messages[0].text.includes('automated demo host'));
await request({studioId});assert.equal(changes.messages.length,1,'welcome must not duplicate');
sourceMessage={id:'source-message',cid:`saju_business:${demoChannel}`,user:{id:customer},text:'How much is a session?'};
assert.equal((await request({studioId,action:'demo_reply',messageId:sourceMessage.id})).status,200);assert.ok(changes.messages[1].text.includes('55,000'));assert.equal(changes.messages[1].user_id,`saju_demo_${studioId}`);
await request({studioId,action:'demo_reply',messageId:sourceMessage.id});assert.equal(changes.messages.length,2,'reply must not duplicate');
sourceMessage.cid='saju_business:someone-else';assert.equal((await request({studioId,action:'demo_reply',messageId:sourceMessage.id})).status,403);
sourceMessage.cid=`saju_business:${demoChannel}`;sourceMessage.user.id=staff;assert.equal((await request({studioId,action:'demo_reply',messageId:sourceMessage.id})).status,403);
assert.equal((await request({studioId,action:'demo_reply'})).status,400);
reset();assert.equal((await request({studioId,action:'demo_reply',messageId:'source-message'})).status,403);
console.log('PASS: demo-only bot, idempotent welcome/replies, actual message ownership and channel validation, no live-studio bot replies.');

reset();missingType=true;racingType=true;assert.equal((await request()).status,200);assert.equal(changes.tokens.length,1);console.log('PASS: simultaneous first-use channel configuration remains safe.');
