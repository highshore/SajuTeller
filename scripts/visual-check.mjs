// Local visual/interaction QA. Install Playwright or point PLAYWRIGHT_MODULE to it.
import { createServer } from 'vite';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const server=await createServer({server:{host:'127.0.0.1',port:5175}});await server.listen();
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox']});
const output=process.env.QA_OUTPUT_DIR||'/tmp/saju-qa';await mkdir(output,{recursive:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 // This runtime requires Node's configured HTTP proxy for outgoing browser requests.
 // It forwards real responses; it does not mock live Supabase data.
 if(process.env.QA_PROXY==='1')await page.route('https://jbwuefecydjkieplftia.supabase.co/**',async route=>{try{const request=route.request();const response=await fetch(request.url(),{method:request.method(),headers:request.headers(),body:request.postData()||undefined});await route.fulfill({status:response.status,headers:Object.fromEntries(response.headers),body:Buffer.from(await response.arrayBuffer())});}catch{await route.abort();}});
 // Bundled fonts are authoritative; force external photo fallbacks for deterministic layout QA.
 await page.route(/https:\/\/(fonts\.(googleapis|gstatic)\.com|images\.unsplash\.com)/,route=>route.abort());
 const origin='http://127.0.0.1:5175';
 const noOverflow=async()=>{assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Page must not overflow horizontally');assert.ok(await page.locator('[data-app-shell]').evaluate(el=>el.scrollWidth<=el.clientWidth+1),'Content must not overflow the app column');};
 await page.goto(origin,{waitUntil:'domcontentloaded'});await page.locator('article h3').first().waitFor({timeout:30000});await page.evaluate(()=>document.fonts.ready);await noOverflow();
 assert.equal(await page.locator('[data-global-header]').count(),1);assert.equal(await page.locator('[data-global-bottom-nav] a').count(),4);
 const geometry=await page.locator('.hero img').evaluate(el=>({loaded:el.complete&&el.naturalWidth>0,width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height}));assert.deepEqual(geometry,{loaded:true,width:358,height:230});
 await page.screenshot({path:`${output}/home-mobile.png`,fullPage:true});
 await page.getByRole('link',{name:'Find a reading',exact:true}).click();await page.getByLabel('Studio or neighborhood').fill('Jongno');await page.getByRole('button',{name:'Show readings'}).click();await page.locator('article h3').first().waitFor();assert.ok(page.url().includes('q=Jongno'));await noOverflow();await page.screenshot({path:`${output}/search-mobile.png`,fullPage:true});
 const save=page.locator('article button').first();await save.click();assert.equal(await save.getAttribute('aria-pressed'),'true');
 await page.locator('article a').first().click();await page.getByRole('link',{name:'Preview your visit',exact:true}).waitFor({timeout:20000});await noOverflow();await page.screenshot({path:`${output}/detail-mobile.png`,fullPage:true});const detailUrl=page.url();
 await page.getByRole('link',{name:'Preview your visit',exact:true}).click();await page.getByLabel('Preferred date').fill('2026-12-15');await page.getByLabel('Preferred time (Seoul)').fill('14:00');await page.getByRole('button',{name:'Save preview plan'}).click();await page.getByText('Your preview plan is saved.').waitFor();await page.getByRole('link',{name:'See my trips'}).click();await page.getByText('Preview plan / not a reservation').waitFor();await page.getByRole('button',{name:'Remove preview'}).click();assert.equal(await page.getByText('Preview plan / not a reservation').count(),0);
 await page.goto(`${origin}/sign-up`);await page.getByRole('button',{name:'Continue with email'}).waitFor({timeout:20000});assert.equal(await page.getByRole('button',{name:'Continue with Google'}).count(),0);await page.getByRole('button',{name:'Continue with email'}).click();await page.getByLabel('Email address').fill('qa@example.invalid');await page.getByLabel('Password',{exact:true}).fill('a-good-password');await page.getByLabel('Confirm password').fill('a-different-password');await page.getByRole('status').filter({hasText:'Passwords do not match'}).waitFor();assert.equal(await page.getByRole('button',{name:'Create account',exact:true}).isDisabled(),true);await page.getByRole('button',{name:'Show password'}).click();assert.equal(await page.getByLabel('Password',{exact:true}).getAttribute('type'),'text');await noOverflow();await page.screenshot({path:`${output}/signup-mobile.png`,fullPage:true});
 await page.goto(`${origin}/profile`);await page.waitForURL('**/sign-in?next=*');
 await page.goto(`${origin}/map`);await page.getByRole('link',{name:'View reading',exact:true}).waitFor({timeout:20000});await noOverflow();
 for(const route of ['/studio','/terms','/privacy','/refund-policy']){await page.goto(origin+route,{waitUntil:'domcontentloaded'});await page.locator('h1').waitFor();await noOverflow();}
 await page.setViewportSize({width:1440,height:1000});await page.goto(origin,{waitUntil:'domcontentloaded'});await page.locator('article h3').first().waitFor({timeout:30000});await page.evaluate(()=>document.fonts.ready);await noOverflow();await page.screenshot({path:`${output}/home-desktop.png`,fullPage:true});assert.equal(await page.locator('[data-global-bottom-nav]').isVisible(),true);
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
  assert.equal(await page.locator('.hero').evaluate(el=>el.getBoundingClientRect().height),230);
  await page.screenshot({path:`${output}/home-${width}.png`,fullPage:true});
  await page.goto(detailUrl,{waitUntil:'domcontentloaded'});await page.locator('[data-booking-action]').waitFor();await noOverflow();await aligned('[data-booking-action]');
  assert.equal(await page.locator('[data-global-bottom-nav]').count(),0);
  const action=await page.locator('[data-booking-action]').boundingBox();assert.ok(Math.abs(action.y+action.height-844)<1);
 }
 for(const route of ['/experiences','/search','/map','/sign-up','/trips','/saved','/studio','/find-my-reading','/today-fortune','/name-creation','/support','/terms']){
  await page.goto(origin+route,{waitUntil:'domcontentloaded'});await page.locator('h1').first().waitFor();await noOverflow();await aligned('[data-global-bottom-nav]');console.log('Layout checked',route);
  if(route==='/experiences'){await page.getByRole('button',{name:/^Filters/}).click();await noOverflow();assert.equal(await page.locator('#experience-filters').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length),1);}
 }
 await page.goto(origin+'/sign-up',{waitUntil:'domcontentloaded'});await page.getByRole('button',{name:'Continue with email'}).click();await noOverflow();await page.screenshot({path:`${output}/signup-desktop.png`,fullPage:true});
 assert.deepEqual(errors,[]);console.log(JSON.stringify({result:'PASS',checks:['live studio data','mobile and desktop geometry','shared shell','search filters','saved readings','detail','preview booking and removal','signup validation','password visibility','protected route','map','policy routes'],output}));
}finally{await browser.close();await server.close();}
