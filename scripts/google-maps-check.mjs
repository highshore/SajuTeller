// Fixture-only acceptance check: no real Google key, users, or network mutations.
import { createServer } from 'vite';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const studio = { id:'11111111-1111-4111-8111-111111111111', name:'Moonlit Studio', name_ko:'달빛', latitude:37.57, longitude:126.98, neighborhood:'Jongno', base_price:50000, min_duration_minutes:30, is_mock:true, studio_images:[], studio_languages:[] };
const second = { ...studio, id:'22222222-2222-4222-8222-222222222222', name:'Second Studio', neighborhood:'Gangnam', latitude:0, longitude:0 };
const browser = await chromium.launch({ headless:true, executablePath:process.env.CHROMIUM_PATH, args:['--no-sandbox'] });
try {
  for (const key of ['', 'fixture-key']) {
    const server = await createServer({ define:{'import.meta.env.VITE_GOOGLE_MAPS_API_KEY':JSON.stringify(key)}, server:{host:'127.0.0.1',port:5187} });
    await server.listen();
    const page = await browser.newPage({ viewport:{width:390,height:844} });
    const errors=[]; page.on('pageerror',error=>errors.push(error.message));
    let embedCalls=0;
    await page.route('https://www.google.com/maps/embed/**',route=>{embedCalls++;return route.fulfill({contentType:'text/html',body:'<p>Google Maps fixture</p>'});});
    await page.route(/https:\/\/fonts\./,route=>route.abort());
    await page.route('https://jbwuefecydjkieplftia.supabase.co/**',route=>route.fulfill({contentType:'application/json',body:JSON.stringify(route.request().url().includes('/saju_studios')?[studio,second,{...studio,id:'invalid',latitude:91}]:[])}));
    try {
      await page.goto('http://127.0.0.1:5187/map?keep=1',{waitUntil:'domcontentloaded'});
      await page.locator('.sheet h2').waitFor();
      assert.equal(await page.locator('.chooser button').count(),2);
      assert.equal(await page.locator('iframe').count(),key?1:0);
      const mapUrl=async()=>new URL(await page.locator('iframe').getAttribute('src'));
      if(key){
        assert.equal((await mapUrl()).pathname,'/maps/embed/v1/place');
        assert.equal((await mapUrl()).searchParams.get('key'),key);
        assert.equal((await mapUrl()).searchParams.get('q'),'37.57,126.98');
        assert.equal(await page.locator('iframe').getAttribute('referrerpolicy'),'strict-origin-when-cross-origin');
        await page.getByRole('button',{name:'Language: English'}).click();
        await page.getByRole('dialog').getByRole('button',{name:'简体中文',exact:true}).click();
        await page.waitForFunction(()=>document.querySelector('iframe')?.src.includes('language=zh-CN'));
        assert.equal((await mapUrl()).searchParams.get('language'),'zh-CN');
      }else assert.equal(embedCalls,0);
      await page.locator('.chooser button').nth(1).click();
      await page.waitForFunction(()=>document.querySelector('.sheet h2')?.textContent==='Second Studio');
      assert.ok(page.url().includes('studio='+second.id));assert.ok(page.url().includes('keep=1'));
      if(key)assert.equal((await mapUrl()).searchParams.get('q'),'0,0');
      assert.equal(new URL(await page.locator('a[href*="maps/search"]').getAttribute('href')).searchParams.get('query'),'0,0');
      await page.goBack();await page.waitForFunction(()=>document.querySelector('.chooser button')?.getAttribute('aria-pressed')==='true');assert.equal(await page.locator('.chooser button').first().getAttribute('aria-pressed'),'true');
      for(const width of [320,390,1440]){
        await page.setViewportSize({width,height:844});
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
        const map=await page.locator('.map').boundingBox(),sheet=await page.locator('.sheet').boundingBox();
        assert.ok(map.width>=200&&map.height>=200);assert.ok(sheet.y>=map.y+map.height);
      }
      assert.deepEqual(errors,[]);
    } finally { await page.close();await server.close(); }
  }
  console.log('PASS: configured/missing key, provider URL, locale, zero coordinates, selection/history, invalid coordinates, no overlay on Google controls, mobile widths.');
} finally { await browser.close(); }
