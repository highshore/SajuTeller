// Browser acceptance checks with deterministic fixture data; never creates users or sends messages.
import { createServer } from 'vite';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);const{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const server=await createServer({server:{host:'127.0.0.1',port:5181}});await server.listen();
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']});
const output='/tmp/saju-global-qa';await mkdir(output,{recursive:true});const base='http://127.0.0.1:5181';
const studio={id:'11111111-1111-4111-8111-111111111111',slug:'sample-reading',name:'Moonlit Saju Studio',name_ko:'달빛 사주',latitude:37.57,longitude:126.98,tagline:'A quiet moment of clarity.',tagline_i18n:{ko:'나를 알아가는 고요한 시간.',zh:'静心认识自己。',ja:'自分を知る、静かなひととき。',es:'Un momento de claridad.'},description:'Explore your four pillars.',description_i18n:{ko:'사주팔자로 나를 알아보세요.',zh:'探索你的四柱。',ja:'四柱推命で自分を知る。',es:'Explora tus cuatro pilares.'},neighborhood:'Jongno',city:'Seoul',district:'Jongno',address_line1:'Seoul',station_walk_minutes:5,base_price:50000,min_duration_minutes:30,max_guests:2,min_age:18,specialties:['love','career'],modalities:['traditional_saju'],ai_interpretation_available:true,wheelchair_accessible:false,average_rating:0,review_count:0,is_mock:true,verified:false,is_featured:true,studio_images:[{image_url:'/figma/reading-atmosphere.svg',alt_text:'First photo',sort_order:0},{image_url:'/figma/galaxy-header.svg',alt_text:'Second photo',sort_order:1}],studio_languages:[{language_code:'en',support_type:'ai_interpreter'},{language_code:'ko',support_type:'native'}]};
const real={...studio,id:'22222222-2222-4222-8222-222222222222',slug:'live-reading',name:'Seoul Saju',is_mock:false};
const user={id:'33333333-3333-4333-8333-333333333333',aud:'authenticated',role:'authenticated',email:'qa@example.invalid',app_metadata:{provider:'email'},user_metadata:{}};
try{
 const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route(/https:\/\/(fonts\.|images\.)/,r=>r.abort());
 let oauth=null,chatCalls=0;
 await page.route('https://jbwuefecydjkieplftia.supabase.co/**',async route=>{const u=new URL(route.request().url());const send=(body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
 if(u.pathname.endsWith('/settings'))return send({external:{email:true,kakao:true,google:false}});
 if(u.pathname.endsWith('/authorize')){oauth=u;return route.fulfill({status:200,contentType:'text/html',body:'OAuth handoff'});}
 if(u.pathname.endsWith('/saju_studios'))return send([studio,real]);
 if(u.pathname.endsWith('/studio_services'))return send([{id:'44444444-4444-4444-8444-444444444444',studio_id:studio.id,name:'Saju session',description:'Private session',duration_minutes:30,price:50000,max_guests:2}]);
 if(u.pathname.endsWith('/studio_practitioners'))return send({id:'reader',display_name:'Reader Kim',display_name_ko:'김 선생님',bio:'Welcome',bio_i18n:{ko:'반갑습니다'},years_experience:12});
 if(u.pathname.endsWith('/user'))return send(user);
 if(u.pathname.endsWith('/profiles'))return send([{onboarding_completed:true,display_name:'QA'}]);
 if(u.pathname.endsWith('/business-chat')){chatCalls++;return send({code:'chat_not_configured'},503);}
 return send([]);
 });
 const go=path=>page.goto(base+path,{waitUntil:'domcontentloaded'});
 const geometry=async()=>{assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.ok(await page.locator('[data-app-shell]').evaluate(e=>e.scrollWidth<=e.clientWidth+1));};
 const change=async(name)=>{await page.locator('[data-global-header] button[aria-haspopup="dialog"]').click();await page.getByRole('dialog').getByRole('button',{name,exact:true}).click();};
 await go('/experiences?topic=all');await page.locator('[data-experience-card]').first().waitFor();
 for(const [locale,name,title]of[['ko','한국어','사주 체험'],['zh-Hans','简体中文','命理体验'],['ja','日本語','四柱推命体験'],['es','Español','Experiencias'],['en','English','Experiences']]){
 await change(name);assert.equal(await page.locator('html').getAttribute('lang'),locale);await page.getByRole('heading',{name:title,exact:true}).waitFor();assert.ok(page.url().includes('topic=all'));await geometry();await page.screenshot({path:`${output}/catalog-${locale}.png`,fullPage:true});
 }
 for(const name of ['한국어','简体中文','日本語','Español']){
 await change(name);await go('/sign-in');await page.locator('[data-auth-view=methods] .providers button').first().waitFor();assert.equal(await page.getByRole('button',{name:'Continue with email',exact:true}).count(),0);
 await go('/learn/first-reading');await page.locator('main h1').waitFor();assert.ok(!(await page.locator('main').innerText()).includes('Saju, without the jargon.'));
 await go('/privacy');await page.locator('main h1').waitFor();assert.ok(!(await page.locator('main').innerText()).includes('Business chat uses Stream to store'));
 await go('/faq');await page.locator('main summary').first().click();assert.ok(!(await page.locator('main').innerText()).includes('What is Saju?'));
 await go('/find-my-reading');await page.locator('main h1').waitFor();assert.ok(!(await page.locator('main').innerText()).includes('What brings you here?'));
 }
 await change('English');await go('/experiences?topic=all');await page.locator('[data-experience-card]').first().waitFor();
 await page.getByRole('button',{name:'Filters',exact:true}).click();await page.getByLabel('Price per person').selectOption('50000');assert.ok(page.url().includes('budget=50000'));
 await page.locator('[data-experience-card] .save').first().click();assert.equal(await page.locator('[data-experience-card] .save').first().getAttribute('aria-pressed'),'true');
 await page.locator('[data-experience-card] a').first().click();await page.locator('[data-booking-action]').waitFor();await geometry();await page.getByRole('button',{name:'Next photo'}).click();await page.getByText('2 / 2',{exact:true}).waitFor();
 await page.getByRole('button',{name:'Chat with the business'}).click();await page.getByRole('status').filter({hasText:'Preview studios cannot receive messages'}).waitFor();assert.equal(chatCalls,0);
 await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`${output}/detail-mobile.png`,fullPage:true});
 await change('日本語');await page.reload();await page.getByRole('heading',{name:'この体験について'}).waitFor();assert.equal(await page.locator('html').getAttribute('lang'),'ja');await geometry();
 await change('English');for(const width of [320,430,1440]){await page.setViewportSize({width,height:844});await geometry();assert.equal(await page.locator('[data-app-shell]').evaluate(e=>e.getBoundingClientRect().width),Math.min(width,430));await page.screenshot({path:`${output}/detail-${width}.png`,fullPage:true});}
 await go('/business/'+real.id);await page.getByRole('link',{name:'Chat with the business'}).click();await page.waitForURL('**/sign-in?next=*');assert.ok(decodeURIComponent(page.url()).includes('/messages?studio='+real.id));
 await page.getByRole('button',{name:'Continue with Kakao'}).click();await page.waitForURL('**/auth/v1/authorize?*');assert.equal(oauth.searchParams.get('provider'),'kakao');assert.equal(oauth.searchParams.get('scope'),'profile_nickname profile_image');assert.ok(!oauth.searchParams.get('scope').includes('account_email'));
 await go('/');await page.evaluate(user=>{const token=btoa('{}')+'.'+btoa(JSON.stringify({sub:user.id,exp:Math.floor(Date.now()/1000)+3600}))+'.qa';localStorage.setItem('sb-jbwuefecydjkieplftia-auth-token',JSON.stringify({access_token:token,refresh_token:'qa',expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user}));},user);
 await go('/messages');await page.getByRole('alert').filter({hasText:'Business chat is being prepared'}).waitFor();const calls=chatCalls;await page.getByRole('button',{name:'Try again',exact:true}).click();await page.waitForFunction(()=>document.querySelector('[role=alert]')?.textContent?.includes('Business chat'));assert.ok(chatCalls>calls);await geometry();assert.deepEqual(errors,[]);
 console.log(JSON.stringify({result:'PASS',checks:['five locales','localized sign-in, guides, policies, FAQ and quiz','native language selector','preference persistence','filter URL preservation','save state','photo carousel','preview chat guard','mobile shell 320/430/1440','login return path','Kakao scope override','chat unavailable/retry'],output}));
}finally{await browser.close();await server.close();}
