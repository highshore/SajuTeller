// Rendering fixtures only. No real accounts, Stream messages, or database writes.
import { createServer } from 'vite';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const conversations=[
 {name:'Moon Gate Saju',text:'The sample session starts at 55,000 KRW and lasts 30 minutes, for up to 1 guest(s). Demo · Automated reply. No real booking or payment.'},
 {name:'Seoul Starlight Tarot — A very long studio name',text:'https://example.invalid/'+ 'averylongunbrokenmessage'.repeat(20)},
 {name:'Two Moons Atelier',text:'欢迎来到我们的工作室。ご質問をお聞かせください。안녕하세요! ¿Cómo podemos ayudarte?'}
];
// Substitute only the network-facing SDK in this test server; render the real route and CSS.
const fakeStream=`class StreamChat {
 async connectUser(){} async disconnectUser(){} on(){return {unsubscribe(){}};}
 async queryChannels(){return ${JSON.stringify(conversations)}.map((v,i)=>({id:'fixture-'+i,cid:'saju_business:fixture-'+i,data:{name:v.name},state:{messages:[{text:v.text,created_at:'2026-10-10T01:20:00Z'}]},countUnread:()=>i===0?1:0}));}
}`;
const server=await createServer({plugins:[{name:'rendering-fixture',enforce:'pre',transform(code,id){if(id.endsWith('/src/routes/messages.tsx'))return code.replace("import { StreamChat, type Channel as StreamChannel } from 'stream-chat';",fakeStream);}}],server:{host:'127.0.0.1',port:5183}});
await server.listen();
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']});
const out='/tmp/saju-rendering-qa';await mkdir(out,{recursive:true});
const base='http://127.0.0.1:5183';
const gate=()=>{let release;const promise=new Promise(r=>release=r);return {promise,release};};
let catalog=gate(),reviews=gate(),chat=gate(),image=gate();let failReviews=true;
const studio={id:'11111111-1111-4111-8111-111111111111',slug:'demo-moon-gate',name:'Moon Gate Saju',name_ko:'달빛 사주',latitude:37.57,longitude:126.98,tagline:'A quiet moment of clarity.',description:'Explore your four pillars.',neighborhood:'Jongno',city:'Seoul',district:'Jongno',address_line1:'Seoul',station_walk_minutes:5,base_price:55000,min_duration_minutes:30,max_guests:1,min_age:18,specialties:['love','career'],modalities:['traditional_saju'],ai_interpretation_available:true,wheelchair_accessible:false,average_rating:0,review_count:0,is_mock:true,demo_chat_enabled:true,verified:false,is_featured:true,studio_images:[{image_url:'/slow-photo.svg',alt_text:'Studio',sort_order:0}],studio_languages:[{language_code:'en',support_type:'ai_interpreter'},{language_code:'ko',support_type:'native'}]};
const user={id:'33333333-3333-4333-8333-333333333333',aud:'authenticated',role:'authenticated',email:'rendering@example.invalid',app_metadata:{provider:'email'},user_metadata:{}};
try {
 const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route(/https:\/\/(fonts\.|images\.)/,r=>r.abort());
 await page.route('**/slow-photo.svg',async r=>{await image.promise;await r.fulfill({status:404,body:''});});
 await page.route('https://jbwuefecydjkieplftia.supabase.co/**',async route=>{
  const u=new URL(route.request().url());const send=(body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  if(u.pathname.endsWith('/saju_studios')){await catalog.promise;return send([studio]);}
  if(u.pathname.endsWith('/studio_services'))return send([{id:'session',studio_id:studio.id,name:'Saju session',description:'Private session',duration_minutes:30,price:55000,max_guests:1}]);
  if(u.pathname.endsWith('/studio_reviews')){await reviews.promise;return failReviews?send({message:'Temporary failure'},400):send([]);}
  if(u.pathname.endsWith('/studio_practitioners'))return send(null);
  if(u.pathname.endsWith('/business-chat')){await chat.promise;return send({apiKey:'fixture',token:'fixture',user:{id:user.id,name:'Rendering QA'},channelType:'saju_business'});}
  if(u.pathname.endsWith('/user'))return send(user);
  if(u.pathname.endsWith('/profiles'))return send([{onboarding_completed:true,display_name:'Rendering QA'}]);
  return send([]);
 });
 const go=path=>page.goto(base+path,{waitUntil:'domcontentloaded'});
 const geometry=async()=>{
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'document overflow');
  assert.ok(await page.locator('[data-app-shell]').evaluate(e=>e.scrollWidth<=e.clientWidth+1),'shell overflow');
 };
 // Simulate a slow initial JS download: visible branded boot screen, not a blank page.
 const boot=gate();await page.route('**/src/main.tsx',async r=>{await boot.promise;await r.continue();});
 const initial=page.goto(base+'/experiences',{waitUntil:'commit'});await initial;
 await page.locator('.boot').waitFor();assert.ok((await page.locator('.boot').innerText()).includes('🔮'));
 boot.release();await page.getByRole('heading',{name:'Experiences',exact:true}).waitFor();
 await page.locator('[aria-label="Loading experiences"]').waitFor();assert.ok(await page.getByRole('textbox',{name:'Search experiences'}).isEnabled());
 await geometry();await page.screenshot({path:out+'/catalog-loading.png'});
 catalog.release();await page.locator('[data-experience-card]').waitFor();
 const photo=page.locator('[data-experience-card] .photo');const before=await photo.boundingBox();
 assert.equal(await photo.locator('img').getAttribute('data-ready'),'false');
 image.release();await photo.locator('img[data-ready=true]').waitFor();const after=await photo.boundingBox();assert.equal(before.height,after.height);assert.ok((await photo.locator('img').getAttribute('src')).endsWith('reading-atmosphere.svg'));
 // Slow reviews do not block the service price, action, or rest of the detail page.
 await page.locator('[data-experience-card] a').click();await page.locator('[data-booking-action]').waitFor();
 const reviewSection=page.locator('section').filter({has:page.getByRole('heading',{name:'Traveler reviews'})});
 await reviewSection.locator('[data-text-skeleton]').waitFor();assert.ok(!(await reviewSection.innerText()).includes('No traveler reviews'));
 assert.ok(await page.getByRole('link',{name:'Try demo chat',exact:true}).isVisible());
 reviews.release();await reviewSection.getByRole('alert').waitFor();failReviews=false;await reviewSection.getByRole('button',{name:'Retry'}).click();await reviewSection.getByText('No traveler reviews to share yet.').waitFor();
 // Pause a route chunk: the crystal ball animates inside the retained navigation shell.
 const chunk=gate();await page.route('**/src/routes/saved.tsx',async r=>{await chunk.promise;await r.continue();});
 await go('/saved');await page.locator('[data-loading-screen] [data-emoji="crystal-ball"] svg').waitFor();
 await page.locator('[data-global-header]').waitFor();await geometry();await page.screenshot({path:out+'/crystal-loading.png'});
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('[data-emoji="crystal-ball"][data-reduced-motion="true"]').waitFor();
 chunk.release();await page.getByRole('heading',{name:'Keep the ones that speak to you.'}).waitFor();
 // Replay the user's long-message overflow, with the real inbox and shell at three widths.
 await page.evaluate(user=>{const token=btoa('{}')+'.'+btoa(JSON.stringify({sub:user.id,exp:Math.floor(Date.now()/1000)+3600}))+'.fixture';localStorage.setItem('sb-jbwuefecydjkieplftia-auth-token',JSON.stringify({access_token:token,refresh_token:'fixture',expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user}));},user);
 await go('/messages');await page.getByRole('heading',{name:'Messages',exact:true}).waitFor();await page.locator('[data-loading-screen]').waitFor();
 chat.release();await page.locator('.conversation').first().waitFor();
 for(const width of [320,390,1440]){
  await page.setViewportSize({width,height:844});await geometry();
  const shell=await page.locator('[data-app-shell]').boundingBox();assert.equal(shell.width,Math.min(width,430));
  for(const row of await page.locator('.conversation').all()){const rect=await row.boundingBox();assert.ok(rect.x>=shell.x&&rect.x+rect.width<=shell.x+shell.width);}
  await page.screenshot({path:out+'/inbox-'+width+'.png',fullPage:true});
 }
 // Reload a room with the network paused: back action works throughout connection.
 chat=gate();await page.setViewportSize({width:390,height:844});await go('/messages?studio='+studio.id);
 await page.locator('.room-header').waitFor();await page.locator('[data-loading-screen]').waitFor();assert.equal(await page.locator('[data-global-header]').count(),0);await geometry();
 await page.getByRole('link',{name:'Back to messages'}).click();await page.waitForURL('**/messages');chat.release();
 await page.locator('.conversation').first().waitFor();assert.deepEqual(errors,[]);
 console.log(JSON.stringify({result:'PASS',checks:['boot feedback before JS','interactive catalog before data','image geometry and failure fallback','independent section loading and retry','animated crystal route loader','reduced motion','inbox overflow at 320/390/1440','room back during connection'],out}));
} finally {catalog.release();reviews.release();chat.release();image.release();await browser.close();await server.close();}
