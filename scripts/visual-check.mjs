// Local visual/interaction QA. Install Playwright or point PLAYWRIGHT_MODULE to it.
import { createServer } from 'vite';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const server=await createServer({server:{host:'127.0.0.1',port:5175}});await server.listen();
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox']});
const output=process.env.QA_OUTPUT_DIR||'/tmp/saju-qa';await mkdir(output,{recursive:true});const failures=[];
try{
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 // This runtime requires Node's configured HTTP proxy for outgoing browser requests.
 // It forwards real responses; it does not mock live Supabase data.
 if(process.env.QA_PROXY==='1')await page.route('https://jbwuefecydjkieplftia.supabase.co/**',async route=>{try{const request=route.request();const response=await fetch(request.url(),{method:request.method(),headers:request.headers(),body:request.postData()||undefined});await route.fulfill({status:response.status,headers:Object.fromEntries(response.headers),body:Buffer.from(await response.arrayBuffer())});}catch{await route.abort();}});
 // Default: deterministic fixtures (no real Supabase). Settings expose email sign-up only.
 const id='11111111-1111-4111-8111-111111111111',images=[{image_url:'/figma/reading-atmosphere.svg',alt_text:'Room',sort_order:0}];
 const studio={id,slug:'visual-qa',name:'Moon Gate Saju',name_ko:'문게이트 사주',tagline:'A gentle first reading.',description:'A private Saju reading.',neighborhood:'Jongno',city:'Seoul',district:'Jongno-gu',address_line1:'Seoul',latitude:37.575,longitude:126.983,min_duration_minutes:45,base_price:45000,max_guests:2,min_age:0,verified:false,is_featured:true,is_mock:true,demo_chat_enabled:false,review_count:0,average_rating:0,specialties:['general'],modalities:['saju'],studio_images:images,studio_languages:[{language_code:'ko',support_type:'native'},{language_code:'en',support_type:'interpreter'}]};
 const other={...studio,id:'33333333-3333-4333-8333-333333333333',slug:'visual-qa-2',name:'Starlight Tarot',name_ko:'스타라이트 타로',neighborhood:'Hongdae',latitude:37.557,longitude:126.921,base_price:25000,specialties:['love'],modalities:['tarot']};
 const service={id:'22222222-2222-4222-8222-222222222222',studio_id:id,name:'Traditional Four Pillars Reading',description:'A practical introduction.',duration_minutes:45,price:45000,max_guests:2,requires_birth_date:false,birth_time_recommended:true};
 if(process.env.QA_PROXY!=='1')await page.route('https://jbwuefecydjkieplftia.supabase.co/**',route=>{const path=new URL(route.request().url()).pathname;const json=body=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
  if(path.endsWith('/settings'))return json({external:{email:true,google:false,kakao:false}});if(path.endsWith('/saju_studios'))return json([studio,other]);if(path.endsWith('/studio_services'))return json([service]);if(path.endsWith('/studio_images'))return json(images);if(path.endsWith('/studio_practitioners'))return json(null);return json([]);});
 // Bundled fonts are authoritative; force external photo fallbacks for deterministic layout QA.
 await page.route(/https:\/\/(fonts\.(googleapis|gstatic)\.com|images\.unsplash\.com)/,route=>route.abort());
 const origin=`http://127.0.0.1:${server.httpServer.address().port}`;// Vite moves on if 5175 is taken.
 const noOverflow=async()=>{assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Page must not overflow horizontally');assert.ok(await page.locator('[data-app-shell]').evaluate(el=>el.scrollWidth<=el.clientWidth+1),'Content must not overflow the app column');};
 await page.goto(origin,{waitUntil:'domcontentloaded'});await page.locator('article h3').first().waitFor({timeout:30000});await page.evaluate(()=>document.fonts.ready);await noOverflow();
 assert.equal(await page.locator('[data-global-header]').count(),1);assert.equal(await page.locator('[data-global-bottom-nav] a').count(),5);
 const hero=page.locator('[aria-roledescription="carousel"]');const heroFits=async()=>{const box=await hero.boundingBox(),shell=await page.locator('[data-app-shell]').boundingBox();assert.ok(box&&Math.abs(box.x-shell.x)<1&&Math.abs(box.width-shell.width)<1&&box.height>=440,'Hero carousel must fill the app column');};await heroFits();assert.equal(await page.locator('[data-experience-card]').count(),2);
 await page.screenshot({path:`${output}/home-mobile.png`,fullPage:true});
 await page.getByRole('link',{name:'Find a reading in Seoul',exact:true}).click();await page.getByLabel('Studio or neighborhood').fill('Jongno');await page.getByRole('button',{name:'Show readings'}).click();await page.locator('article h3').first().waitFor();assert.ok(page.url().includes('q=Jongno'));await noOverflow();await page.screenshot({path:`${output}/search-mobile.png`,fullPage:true});
 const save=page.locator('article button').first();await save.click();assert.equal(await save.getAttribute('aria-pressed'),'true');
 await page.locator('article a').first().click();await page.getByRole('link',{name:'Send a demo request',exact:true}).waitFor({timeout:20000});await noOverflow();await page.screenshot({path:`${output}/detail-mobile.png`,fullPage:true});const detailUrl=page.url();
 await page.getByRole('link',{name:'Send a demo request',exact:true}).click();await page.locator('[role=group][aria-label=Date] button:not([disabled])').nth(1).click();await page.locator('[role=group][aria-label=Time] button:not([disabled])').first().click();await page.getByRole('button',{name:'Continue',exact:true}).click();await page.getByText('This is a demo request.',{exact:false}).waitFor();await noOverflow();await page.getByRole('button',{name:'Send demo request'}).click();await page.getByRole('dialog',{name:'Sign in to send your request'}).waitFor();assert.ok((await page.getByRole('link',{name:'Sign in or create an account'}).getAttribute('href')).startsWith('/sign-in?next='));
 // Preview plans saved on this device (legacy) still list on Trips and can be removed.
 await page.evaluate(id=>localStorage.setItem('sajuteller-preview-plans-v1',JSON.stringify([{id:'qa-plan',studioId:id,serviceId:'',date:'2026-12-15',time:'14:00',language:'en',guests:1,createdAt:'2026-11-01T00:00:00Z'}])),id);await page.goto(`${origin}/trips`);await page.getByRole('tab',{name:/^Saved/}).click();await page.getByText('Preview plan / not a reservation').waitFor();await page.getByRole('button',{name:'Remove preview'}).click();assert.equal(await page.getByText('Preview plan / not a reservation').count(),0);
 await page.goto(`${origin}/sign-up`);await page.getByRole('button',{name:'Continue with email'}).waitFor({timeout:20000});assert.equal(await page.getByRole('button',{name:'Continue with Google'}).count(),0);await page.getByRole('button',{name:'Continue with email'}).click();await page.getByLabel('Email address').fill('qa@example.invalid');await page.getByLabel('Password',{exact:true}).fill('a-good-password');await page.getByLabel('Confirm password').fill('a-different-password');await page.getByRole('status').filter({hasText:'Passwords do not match'}).waitFor();assert.equal(await page.getByRole('button',{name:'Create account',exact:true}).isDisabled(),true);await page.getByRole('button',{name:'Show password'}).click();assert.equal(await page.getByLabel('Password',{exact:true}).getAttribute('type'),'text');await noOverflow();await page.screenshot({path:`${output}/signup-mobile.png`,fullPage:true});
 await page.goto(`${origin}/profile`);await page.waitForURL('**/sign-in?next=*');
 await page.goto(`${origin}/map`);await page.locator('[data-studio-row]').first().waitFor({timeout:20000});assert.equal(await page.locator('[data-studio-row]').count(),2);await noOverflow();
 for(const route of ['/studio','/terms','/privacy','/refund-policy']){await page.goto(origin+route,{waitUntil:'domcontentloaded'});await page.locator('h1').waitFor();await noOverflow();}
 await page.setViewportSize({width:1440,height:1000});await page.goto(origin,{waitUntil:'domcontentloaded'});await page.locator('article h3').first().waitFor({timeout:30000});await page.evaluate(()=>document.fonts.ready);await noOverflow();await heroFits();await page.screenshot({path:`${output}/home-desktop.png`,fullPage:true});assert.equal(await page.locator('[data-global-bottom-nav]').isVisible(),true);
 assert.equal(await page.locator('[data-app-shell]').evaluate(el=>el.getBoundingClientRect().width),430);
 assert.equal(await page.locator('[data-global-header] nav').isVisible(),false);

 const aligned=async selector=>{
  const box=await page.locator(selector).boundingBox();const shell=await page.locator('[data-app-shell]').boundingBox();
  assert.ok(box&&shell&&Math.abs(box.x-shell.x)<1&&Math.abs(box.width-shell.width)<1,`${selector} must stay inside the app column`);
 };
 for(const width of [320,390,430,768,1440]){
  await page.setViewportSize({width,height:844});await page.goto(origin,{waitUntil:'domcontentloaded'});await page.locator('article h3').first().waitFor();await noOverflow();
  assert.equal(await page.locator('[data-app-shell]').evaluate(el=>el.getBoundingClientRect().width),Math.min(width,430));
  await aligned('[data-global-header]');await aligned('[data-global-bottom-nav]');
  assert.equal(await page.locator('[data-global-header] nav').isVisible(),false);
  await heroFits();
  await page.screenshot({path:`${output}/home-${width}.png`,fullPage:true});
  await page.goto(detailUrl,{waitUntil:'domcontentloaded'});await page.locator('[data-booking-action]').waitFor();await noOverflow();await aligned('[data-booking-action]');
  assert.equal(await page.locator('[data-global-bottom-nav]').count(),0);
  const action=await page.locator('[data-booking-action]').boundingBox();assert.ok(Math.abs(action.y+action.height-844)<1);
 }
 for(const route of ['/experiences','/search','/map','/sign-up','/trips','/saved','/studio','/find-my-reading','/today-fortune','/name-creation','/support','/terms']){
  await page.goto(origin+route,{waitUntil:'domcontentloaded'});if(route==='/map')await page.locator('[data-studio-row]').first().waitFor();await page.locator('h1').first().waitFor({timeout:10000}).catch(async()=>{failures.push(`${route} has no h1`);await page.screenshot({path:`${output}/no-h1${route.replaceAll('/','-')}.png`,fullPage:true});});await noOverflow();await aligned('[data-global-bottom-nav]');console.log('Layout checked',route);
  if(route==='/experiences'){await page.getByRole('button',{name:/^Filters/}).click();await noOverflow();assert.equal(await page.locator('#experience-filters').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length),1);}
 }
 await page.goto(origin+'/sign-up',{waitUntil:'domcontentloaded'});await page.getByRole('button',{name:'Continue with email'}).click();await noOverflow();await page.screenshot({path:`${output}/signup-desktop.png`,fullPage:true});
 assert.deepEqual(errors,[]);assert.deepEqual(failures,[],'Checks that failed (screenshots in '+output+')');console.log(JSON.stringify({result:'PASS',checks:[process.env.QA_PROXY==='1'?'live studio data':'studio fixtures','hero carousel fills column','mobile and desktop geometry','shared shell','search filters','saved readings','detail','demo request reaches sign-in','preview plan removal','signup validation','password visibility','protected route','map','policy routes'],output}));
}finally{await browser.close();await server.close();}
