// Fixture-only acceptance check: no real Google key, users, or network mutations.
import { createServer } from 'vite';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const studio = { id:'11111111-1111-4111-8111-111111111111', name:'Moonlit Studio', name_ko:'달빛', latitude:37.57, longitude:126.98, neighborhood:'Jongno', base_price:50000, min_duration_minutes:30, is_mock:true, studio_images:[], studio_languages:[], specialties:[], modalities:[], max_guests:1 };
// ~300 m east of Moonlit: its own pin (not a cluster) at the zoom-15 focus view.
const near = { ...studio, id:'33333333-3333-4333-8333-333333333333', name:'Bukchon Studio', neighborhood:'Bukchon', latitude:37.5715, longitude:126.9835, base_price:70000 };
const second = { ...studio, id:'22222222-2222-4222-8222-222222222222', name:'Second Studio', neighborhood:'Gangnam', latitude:0, longitude:0 };
const output = process.env.QA_OUTPUT_DIR || '/tmp/saju-qa'; await mkdir(output,{recursive:true});
const failures = [];
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
    let fixture=[studio,near,{...studio,id:'invalid',latitude:91}];
    await page.route('https://jbwuefecydjkieplftia.supabase.co/**',route=>route.fulfill({contentType:'application/json',body:JSON.stringify(route.request().url().includes('/saju_studios')?fixture:[])}));
    const base=`http://127.0.0.1:${server.httpServer.address().port}`,origin=`${base}/map?keep=1`;
    const mapUrl=async()=>new URL(await page.locator('iframe').getAttribute('src'));
    const pin=s=>page.locator(`.pin[aria-label^="${s.name},"]`);
    const pressed=async(s,keep=true)=>{await page.waitForFunction(id=>new URLSearchParams(location.search).get('studio')===id,s.id);await pin(s).and(page.locator('[aria-pressed="true"]')).waitFor();
      assert.equal(await page.locator('.pin[aria-pressed="true"]').count(),1);assert.equal(await page.locator('[data-studio-row]').first().getAttribute('data-studio-row'),s.id);assert.equal(await page.locator('[data-studio-row]').first().getAttribute('aria-current'),'true');
      assert.equal(new URL(await page.locator('a[href*="maps/search"]').getAttribute('href')).searchParams.get('query'),`${s.latitude},${s.longitude}`);assert.equal(page.url().includes('keep=1'),keep);};
    const onMap=async s=>{const box=await page.locator('[data-map-provider]').boundingBox(),at=await pin(s).boundingBox();assert.ok(at.x>=box.x&&at.x+at.width<=box.x+box.width&&at.y>=box.y&&at.y+at.height<=box.y+box.height,`${s.name} pin must be on the map`);return {box,at};};
    // Arriving with ?studio= centres that studio (zoom 15 street map / centred pin).
    const focused=async s=>{const {box,at}=await onMap(s);assert.ok(Math.abs(at.x+at.width/2-(box.x+box.width/2))<2,`${s.name} must be centred on arrival`);if(key){assert.equal((await mapUrl()).searchParams.get('zoom'),'15');assert.equal((await mapUrl()).searchParams.get('center').split(',')[1],s.longitude.toFixed(6));}};
    try {
      await page.goto(origin,{waitUntil:'domcontentloaded'});
      await page.locator('[data-studio-row]').first().waitFor();
      assert.equal(await page.locator('[data-studio-row]').count(),2);assert.equal(await page.locator('.sheet h2').textContent(),'2 studios on the map');
      assert.equal(await page.locator('[data-map-provider]').getAttribute('data-map-provider'),key?'google':'none');
      assert.equal(await page.locator('iframe').count(),key?1:0);
      assert.equal(await page.getByText('Street map isn’t available here',{exact:false}).count(),key?0:1);
      if(key){
        assert.equal((await mapUrl()).pathname,'/maps/embed/v1/view');
        assert.equal((await mapUrl()).searchParams.get('key'),key);
        assert.equal((await mapUrl()).searchParams.get('language'),'en');
        assert.equal(await page.locator('iframe').getAttribute('referrerpolicy'),'strict-origin-when-cross-origin');
        await page.getByRole('button',{name:'Language: English'}).click();
        await page.getByRole('dialog').getByRole('button',{name:'简体中文',exact:true}).click();
        await page.waitForFunction(()=>document.querySelector('iframe')?.src.includes('language=zh-CN'));
        assert.equal((await mapUrl()).searchParams.get('language'),'zh-CN');
      }else assert.equal(embedCalls,0);
      // Every valid studio gets a pin; picking one updates URL (other params kept), list order and Google link; Back restores it.
      await onMap(studio);await onMap(near);
      await pin(near).click();await pressed(near);
      await pin(studio).click();await pressed(studio);
      await page.goBack({waitUntil:'domcontentloaded'});await pressed(near);
      // Studio page -> "View on map" (in-app, studios already loaded).
      await page.locator(`[data-studio-row="${near.id}"]`).click();await page.locator(`a[href="/map?studio=${near.id}"]`).click();await pressed(near,false);await focused(near);
      // Zero coordinates are a real place, not "missing".
      fixture=[second];await page.goto(origin,{waitUntil:'domcontentloaded'});await onMap(second);await pin(second).click();await pressed(second);
      if(key)assert.ok((await mapUrl()).searchParams.get('center').split(',').every(n=>Math.abs(Number(n))<0.01));
      for(const width of [320,390,1440]){
        await page.setViewportSize({width,height:844});
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
        const shell=await page.locator('[data-app-shell]').boundingBox(),map=await page.locator('.map').boundingBox(),sheet=await page.locator('.sheet').boundingBox();
        assert.equal(Math.round(shell.width),Math.min(width,430));assert.ok(map.x>=shell.x-1&&map.x+map.width<=shell.x+shell.width+1,'map must stay in the app column');
        assert.ok(map.width>=200&&map.height>=200);assert.ok(sheet.y>=map.y+map.height);
      }
      if(!key)assert.equal(embedCalls,0);
      assert.deepEqual(errors,[]);
      // Shared link / reload: a fresh load of /map?studio= must centre that studio too.
      fixture=[studio,near];await page.setViewportSize({width:390,height:844});await page.goto(`${origin}&studio=${studio.id}`,{waitUntil:'domcontentloaded'});await pressed(studio);
      await focused(studio).catch(async e=>{failures.push(`${key?'key':'no key'}: ${e.message}${key?` (embed ${(await mapUrl()).search})`:''}`);await page.screenshot({path:`${output}/map-deeplink-${key?'key':'nokey'}.png`});});
    } finally { await page.close();await server.close(); }
  }
  assert.deepEqual(failures,[],'Checks that failed in one key mode (screenshots in '+output+')');
  console.log('PASS: configured/missing key, provider URL, locale, zero coordinates, pin selection/history, studio focus from link, invalid coordinates, 430px column, mobile widths.');
} finally { await browser.close(); }
