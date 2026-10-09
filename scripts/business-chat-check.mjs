// Exercise the real handler with mocked external boundaries; never sends messages or contacts providers.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import ts from 'typescript';
const code=ts.transpile(fs.readFileSync('supabase/functions/business-chat/index.ts','utf8').replace(/^import .*;$/gm,''),{target:ts.ScriptTarget.ES2022});
const customer='11111111-1111-4111-8111-111111111111',staff='22222222-2222-4222-8222-222222222222',studioId='33333333-3333-4333-8333-333333333333';
let config,studio,staffRows,env,changes,handler;
function reset(){config={grants:{user:[],channel_member:['read-channel']}};studio={id:studioId,name:'Test studio',is_mock:false,status:'active'};staffRows=[{user_id:staff}];env={SUPABASE_URL:'https://example.invalid',SUPABASE_SERVICE_ROLE_KEY:'server-test',STREAM_API_KEY:'public-test',STREAM_API_SECRET:'secret-test'};changes={creates:[],tokens:[],upserts:[],added:[],removed:[]};}
const db={auth:{getUser:async jwt=>({data:{user:jwt==='valid'?{id:customer}:null},error:jwt==='valid'?null:new Error('invalid')})},from(table){let result=table==='profiles'?{display_name:'Customer'}:table==='saju_studios'?studio:table==='sajuteller_studio_members'?staffRows:[];const builder={select(){return this;},eq(){return this;},in(){result=[{auth_user_id:staff,display_name:'Reader'}];return this;},maybeSingle(){return Promise.resolve({data:result,error:null});},upsert(row){changes.upserts.push(row);return Promise.resolve({error:null});},then(resolve,reject){return Promise.resolve({data:result,error:null}).then(resolve,reject);}};return builder;}};
class MockStream{async getChannelType(){return config;}async upsertUser(){}async upsertUsers(){}channel(type,id,data){return{create:async()=>changes.creates.push({type,id,data}),queryMembers:async()=>({members:[{user_id:customer},{user_id:'revoked-staff'}]}),removeMembers:async ids=>changes.removed.push(...ids),addMembers:async ids=>changes.added.push(...ids)};}createToken(id,expires){changes.tokens.push({id,expires});return 'test-token';}}
vm.runInNewContext(code,{Deno:{env:{get:key=>env[key]},serve:fn=>{handler=fn;}},Request,Response,crypto,TextEncoder,console,createClient:()=>db,StreamChat:MockStream});
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
