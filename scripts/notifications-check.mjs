// Local transport fixtures. Publishing here never sends a real notification.
import {createServer} from 'vite';import {createRequire} from 'node:module';import {mkdir} from 'node:fs/promises';import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);const{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const server=await createServer({server:{host:'127.0.0.1',port:5184}});await server.listen();
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']});const base='http://127.0.0.1:5184';const out='/tmp/saju-notifications-qa';await mkdir(out,{recursive:true});
const user={id:'33333333-3333-4333-8333-333333333333',aud:'authenticated',role:'authenticated',email:'fixture@example.invalid',app_metadata:{provider:'email'},user_metadata:{}};
const seed=[{id:'notice-one',category:'update',title:'Your Seoul reading guide',body:'A little preparation makes room for a meaningful reading.',translations:{ko:{title:'서울 사주 여행 안내',body:'편안한 상담을 위해 준비해 보세요.'},ja:{title:'ソウルの鑑定ガイド',body:'鑑定の準備をしましょう。'},zh:{title:'首尔命理指南',body:'为你的体验做好准备。'},es:{title:'Tu guía de lecturas en Seúl',body:'Prepara tu visita.'}},action_path:'/learn',published_at:'2026-10-10T01:00:00Z',status:'published'},
{id:'notice-two',category:'offer',title:'A new chapter awaits',body:'Explore the studios in our demo collection. No real payment or reservation.',translations:{},action_path:'/experiences',published_at:'2026-10-09T01:00:00Z',status:'published'}];
let rows=structuredClone(seed),read=new Set(),offers=true,failFeed=false,isAdmin=false,published=0;
try{
 const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route(/https:\/\/(fonts\.|images\.)/,r=>r.abort());
 await page.route('https://jbwuefecydjkieplftia.supabase.co/**',async route=>{const req=route.request();const u=new URL(req.url());const body=req.postData()?req.postDataJSON():{};const send=(data,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});const visible=()=>rows.filter(n=>n.status==='published'&&(offers||n.category!=='offer'));
 if(u.pathname.endsWith('/user'))return send(user);
 if(u.pathname.endsWith('/profiles'))return send(req.headers().accept?.includes('object')?{role:isAdmin?'admin':'user',display_name:'QA',onboarding_completed:true}:[{role:isAdmin?'admin':'user',onboarding_completed:true}]);
 if(u.pathname.endsWith('/sajuteller_notification_feed'))return failFeed?send({message:'offline'},503):send(visible().slice(body.p_offset||0,(body.p_offset||0)+(body.p_limit||30)).map(n=>({...n,read_at:read.has(n.id)?'2026-10-10T02:00:00Z':null})));
 if(u.pathname.endsWith('/sajuteller_notification_unread_count'))return send(visible().filter(n=>!read.has(n.id)).length);
 if(u.pathname.endsWith('/sajuteller_notifications_mark_all_read')){visible().forEach(n=>read.add(n.id));return send(null);}
 if(u.pathname.endsWith('/sajuteller_notification_reads')){read.add(body.notification_id);return send(null);}
 if(u.pathname.endsWith('/sajuteller_notification_preferences')){if(req.method()==='POST')offers=body.offers_enabled;return send(req.method()==='GET'?{offers_enabled:offers}:null);}
 if(u.pathname.endsWith('/sajuteller_notifications')){
  if(!isAdmin)return send({message:'denied'},403);
  if(req.method()==='GET')return send(rows);
  if(req.method()==='POST'){const n={id:'draft-'+Date.now(),...body};rows.unshift(n);if(n.status==='published')published++;return send({id:n.id});}
  if(req.method()==='PATCH'){const id=u.searchParams.get('id').replace('eq.','');Object.assign(rows.find(n=>n.id===id),body);if(body.status==='published')published++;return send(req.headers().accept?.includes('object')?{id}:[{id}]);}
 }
 return send([]);
 });
 const go=path=>page.goto(base+path,{waitUntil:'domcontentloaded'});const geometry=async()=>{assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.ok(await page.locator('[data-app-shell]').evaluate(e=>e.scrollWidth<=e.clientWidth+1));};
 await go('/notifications');await page.waitForURL('**/sign-in?next=*');await page.locator('[data-auth-view]').waitFor();
 await page.evaluate(user=>{const token=btoa('{}')+'.'+btoa(JSON.stringify({sub:user.id,exp:Math.floor(Date.now()/1000)+3600}))+'.fixture';localStorage.setItem('sb-jbwuefecydjkieplftia-auth-token',JSON.stringify({access_token:token,refresh_token:'fixture',expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user}));},user);
 await go('/notifications');await page.getByRole('heading',{name:'Your Seoul reading guide'}).waitFor();assert.equal(await page.locator('[data-global-bottom-nav] a').count(),5);assert.equal(await page.locator('[data-global-bottom-nav] a[href="/messages"]').count(),1);assert.equal(await page.locator('.bell .badge').innerText(),'2');
 for(const width of [320,390,1440]){await page.setViewportSize({width,height:844});await geometry();await page.screenshot({path:out+'/inbox-'+width+'.png',fullPage:true});}
 await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Mark as read',exact:true}).first().click();await page.waitForFunction(()=>document.querySelector('.bell .badge')?.textContent==='1');await page.reload();await page.getByRole('heading',{name:'Your Seoul reading guide'}).waitFor();assert.equal(await page.locator('article.unread').count(),1);
 await page.getByLabel('Offers and inspiration',{exact:true}).uncheck();await page.waitForFunction(()=>!document.querySelector('.bell .badge'));assert.equal(await page.getByRole('heading',{name:'A new chapter awaits'}).count(),0);
 await page.getByLabel('Offers and inspiration',{exact:true}).check();await page.getByRole('heading',{name:'A new chapter awaits'}).waitFor();await page.getByRole('button',{name:'Mark all read'}).click();await page.waitForFunction(()=>!document.querySelector('.bell .badge'));await page.getByRole('button',{name:'Unread',exact:true}).click();await page.getByRole('heading',{name:'You’re all caught up'}).waitFor();
 await page.getByRole('button',{name:'All',exact:true}).click();await page.getByRole('button',{name:'View details',exact:true}).first().click();await page.waitForURL('**/learn');
 for(const [name,title]of[['한국어','알림'],['简体中文','通知'],['日本語','通知'],['Español','Notificaciones'],['English','Notifications']]){await go('/notifications');await page.locator('[data-global-header] button[aria-haspopup="dialog"]').click();await page.getByRole('dialog').getByRole('button',{name,exact:true}).click();await page.getByRole('heading',{name:title,exact:true}).waitFor();await geometry();}
 failFeed=true;await go('/notifications');await page.getByRole('alert').waitFor();failFeed=false;await page.getByRole('button',{name:'Retry',exact:true}).click();await page.getByRole('heading',{name:'Your Seoul reading guide'}).waitFor();
 await go('/admin/notifications');await page.waitForURL(base+'/');isAdmin=true;await go('/admin/notifications');await page.getByRole('heading',{name:'SajuTeller announcements'}).waitFor();
 await page.getByLabel('Title',{exact:true}).fill('Fresh studio news');await page.getByLabel('Message',{exact:true}).fill('An announcement for our demo.');await page.getByRole('button',{name:'Save draft'}).click();await page.getByRole('status').filter({hasText:'Draft saved.'}).waitFor();assert.equal(published,0);
 await page.getByRole('button',{name:'Preview publication',exact:true}).click();assert.equal(published,0);await page.getByRole('button',{name:'Publish to inbox',exact:true}).click();await page.getByRole('status').filter({hasText:'Published to the in-app inbox.'}).waitFor();assert.equal(published,1);
 await page.getByRole('button',{name:'Withdraw',exact:true}).first().click();await page.getByRole('status').filter({hasText:'Announcement withdrawn.'}).waitFor();await geometry();
 assert.deepEqual(errors,[]);console.log(JSON.stringify({result:'PASS',checks:['protected inbox','five bottom tabs','320/390/1440 layout','persistent reads and badge','offer preference','mark-all and unread filter','deep link','five locales','fetch failure/retry','admin gate','draft then explicit publish','withdraw'],out}));
}finally{await browser.close();await server.close();}
