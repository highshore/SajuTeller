import { createServer } from 'vite';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);const{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const server=await createServer({server:{host:'127.0.0.1',port:5182}});await server.listen();
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']});
const output='/tmp/saju-onboarding-qa';await mkdir(output,{recursive:true});
const user={id:'33333333-3333-4333-8333-333333333333',aud:'authenticated',role:'authenticated',email:'qa@example.invalid',app_metadata:{provider:'email'},user_metadata:{}};
let saved=[],existingBirth=null,accepted=false,failSave=false;
try{
 const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://jbwuefecydjkieplftia.supabase.co/**',async route=>{const u=new URL(route.request().url());const send=(body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
 if(u.pathname.endsWith('/user'))return send(user);
 if(u.pathname.endsWith('/profiles'))return send(route.request().headers().accept?.includes('object')?{id:'profile-id',display_name:'',preferred_language:'en'}:[{onboarding_completed:false,display_name:''}]);
 if(u.pathname.endsWith('/user_birth_profiles'))return send(existingBirth);
 if(u.pathname.endsWith('/sajuteller_user_consents'))return send(accepted?{policy_version:'2026-10-09'}:null);
 if(u.pathname.endsWith('/sajuteller_save_profile')){saved.push(route.request().postDataJSON());return failSave?send({message:'Temporary error'},500):send(null);}
 return send([]);
 });
 await page.goto('http://127.0.0.1:5182/');await page.evaluate(user=>{const token=btoa('{}')+'.'+btoa(JSON.stringify({sub:user.id,exp:Math.floor(Date.now()/1000)+3600}))+'.qa';localStorage.setItem('sb-jbwuefecydjkieplftia-auth-token',JSON.stringify({access_token:token,refresh_token:'qa',expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user}));},user);
 const go=()=>page.goto('http://127.0.0.1:5182/onboarding?next=%2Fmessages');
 const geometry=async()=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await go();await page.getByRole('heading',{name:'What should we call you?'}).waitFor();assert.equal(await page.locator('[data-global-header]').count(),0);assert.equal(await page.locator('input').count(),1);
 await page.getByLabel('Display name').fill('   ');assert.ok(await page.getByRole('button',{name:'Continue',exact:true}).isDisabled());await page.getByLabel('Display name').fill('Luna');
 await page.screenshot({path:output+'/01-name.png',fullPage:true});await page.getByRole('button',{name:'Continue',exact:true}).click();
 await page.getByRole('radio',{name:'한국어'}).check();await page.screenshot({path:output+'/02-language.png',fullPage:true});
 await page.getByRole('button',{name:'Back',exact:true}).click();assert.equal(await page.getByLabel('Display name').inputValue(),'Luna');await page.getByRole('button',{name:'Continue',exact:true}).click();assert.ok(await page.getByRole('radio',{name:'한국어'}).isChecked());await page.getByRole('button',{name:'Continue',exact:true}).click();
 assert.equal(saved.length,0);assert.equal(await page.locator('details').getAttribute('open'),null);await page.screenshot({path:output+'/03-ready.png',fullPage:true});
 for(const width of [320,430,1440]){await page.setViewportSize({width,height:844});await geometry();}
 await page.getByRole('button',{name:'Start exploring'}).click();await page.getByRole('dialog').waitFor();assert.equal(saved.length,0);assert.ok(await page.getByRole('button',{name:'Agree and continue'}).isDisabled());
 for(const box of await page.getByRole('dialog').getByRole('checkbox').all())await box.check();failSave=true;await page.getByRole('button',{name:'Agree and continue'}).click();await page.getByRole('alert').filter({hasText:'Could not save your profile.'}).waitFor();assert.equal(saved[0].p_birth_date,null);assert.equal(saved[0].p_display_name,'Luna');assert.equal(saved[0].p_language,'ko');assert.equal(saved[0].p_accept_policies,true);
 failSave=false;await page.getByRole('button',{name:'Start exploring'}).click();for(const box of await page.getByRole('dialog').getByRole('checkbox').all())await box.check();await page.getByRole('button',{name:'Agree and continue'}).click();await page.waitForURL('**/messages');
 existingBirth={birth_date:'1995-03-12',birth_time:'09:30:00',birth_time_unknown:false,birth_city:'Seoul',birth_timezone:'Asia/Seoul'};accepted=true;await go();await page.getByLabel('Display name').fill('Luna');await page.getByRole('button',{name:'Continue',exact:true}).click();await page.getByRole('button',{name:'Continue',exact:true}).click();await page.getByRole('button',{name:'Start exploring'}).click();await page.waitForURL('**/messages');assert.equal(saved.at(-1).p_birth_date,'1995-03-12');assert.equal(saved.at(-1).p_birth_time,'09:30');assert.equal(saved.at(-1).p_accept_policies,false);
 assert.deepEqual(errors,[]);console.log(JSON.stringify({result:'PASS',checks:['three steps','nickname only','back preserves state','optional birth details','consent gate','failed-save retry','existing birth preserved','return destination','320/430/1440 mobile geometry'],output}));
}finally{await browser.close();await server.close();}
