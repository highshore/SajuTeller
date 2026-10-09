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
 const origin='http://127.0.0.1:5175';
 const noOverflow=async()=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Page must not overflow horizontally');
 await page.goto(origin);await page.locator('article h3').first().waitFor({timeout:30000});await page.evaluate(()=>document.fonts.ready);await noOverflow();
 assert.equal(await page.locator('[data-global-header]').count(),1);assert.equal(await page.locator('[data-global-bottom-nav] a').count(),4);
 const geometry=await page.locator('.hero img').evaluate(el=>({loaded:el.complete&&el.naturalWidth>0,width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height}));assert.deepEqual(geometry,{loaded:true,width:358,height:230});
 await page.screenshot({path:`${output}/home-mobile.png`,fullPage:true});
 await page.getByRole('link',{name:'Find a reading',exact:true}).click();await page.getByLabel('Studio or neighborhood').fill('Jongno');await page.getByRole('button',{name:'Show readings'}).click();await page.locator('article h3').first().waitFor();assert.ok(page.url().includes('q=Jongno'));await noOverflow();await page.screenshot({path:`${output}/search-mobile.png`,fullPage:true});
 const save=page.locator('article button').first();await save.click();assert.equal(await save.getAttribute('aria-pressed'),'true');
 await page.locator('article a').first().click();await page.getByRole('link',{name:'Preview your visit',exact:true}).waitFor({timeout:20000});await noOverflow();await page.screenshot({path:`${output}/detail-mobile.png`,fullPage:true});
 await page.getByRole('link',{name:'Preview your visit',exact:true}).click();await page.getByLabel('Preferred date').fill('2026-12-15');await page.getByLabel('Preferred time (Seoul)').fill('14:00');await page.getByRole('button',{name:'Save preview plan'}).click();await page.getByText('Your preview plan is saved.').waitFor();await page.getByRole('link',{name:'See my trips'}).click();await page.getByText('Preview plan / not a reservation').waitFor();await page.getByRole('button',{name:'Remove preview'}).click();assert.equal(await page.getByText('Preview plan / not a reservation').count(),0);
 await page.goto(`${origin}/sign-up`);await page.getByRole('button',{name:'Continue with email'}).waitFor({timeout:20000});assert.equal(await page.getByRole('button',{name:'Continue with Google'}).count(),0);await page.getByRole('button',{name:'Continue with email'}).click();await page.getByLabel('Email address').fill('qa@example.invalid');await page.getByLabel('Password',{exact:true}).fill('a-good-password');await page.getByLabel('Confirm password').fill('a-different-password');await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Create account',exact:true}).click();await page.getByRole('alert').filter({hasText:'Passwords do not match'}).waitFor();await page.getByRole('button',{name:'Show password'}).click();assert.equal(await page.getByLabel('Password',{exact:true}).getAttribute('type'),'text');await noOverflow();await page.screenshot({path:`${output}/signup-mobile.png`,fullPage:true});
 await page.goto(`${origin}/profile`);await page.waitForURL('**/sign-in?next=*');
 await page.goto(`${origin}/map`);await page.getByRole('link',{name:'View reading',exact:true}).waitFor({timeout:20000});await noOverflow();
 for(const route of ['/studio','/terms','/privacy','/refund-policy']){await page.goto(origin+route);await page.locator('h1').waitFor();await noOverflow();}
 await page.setViewportSize({width:1440,height:1000});await page.goto(origin);await page.locator('article h3').first().waitFor({timeout:30000});await page.evaluate(()=>document.fonts.ready);await noOverflow();await page.screenshot({path:`${output}/home-desktop.png`,fullPage:true});assert.equal(await page.locator('[data-global-bottom-nav]').isVisible(),false);
 assert.deepEqual(errors,[]);console.log(JSON.stringify({result:'PASS',checks:['live studio data','mobile and desktop geometry','shared shell','search filters','saved readings','detail','preview booking and removal','signup validation','password visibility','protected route','map','policy routes'],output}));
}finally{await browser.close();await server.close();}
