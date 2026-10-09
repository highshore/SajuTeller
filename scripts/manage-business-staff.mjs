// Trusted administrator only: never ship SUPABASE_SERVICE_ROLE_KEY to a browser.
import { createClient } from '@supabase/supabase-js';
import { StreamChat } from 'stream-chat';
const [action,studioId,userId]=process.argv.slice(2);
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
if(!['add','remove'].includes(action)||!uuid.test(studioId||'')||!uuid.test(userId||''))throw new Error('Usage: node scripts/manage-business-staff.mjs add|remove STUDIO_UUID USER_UUID');
for(const name of ['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','STREAM_API_KEY','STREAM_API_SECRET'])if(!process.env[name])throw new Error(`Set ${name} in your environment.`);
const db=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const chat=new StreamChat(process.env.STREAM_API_KEY,process.env.STREAM_API_SECRET);
const {data:studio,error:studioError}=await db.from('saju_studios').select('id,name,is_mock,status').eq('id',studioId).single();if(studioError)throw studioError;
if(action==='add'&&(studio.is_mock||studio.status!=='active'))throw new Error('Only active, real studios can receive messages.');
const {data:{user},error:userError}=await db.auth.admin.getUserById(userId);if(userError||!user)throw new Error('Select an existing Supabase user.');
if(action==='add'){
 const {data:profile,error}=await db.from('profiles').select('display_name').eq('auth_user_id',userId).maybeSingle();if(error)throw error;
 await chat.upsertUser({id:userId,name:profile?.display_name||studio.name});
 // Grant the trusted database mapping before adding Stream membership.
 const {error:grantError}=await db.from('sajuteller_studio_members').upsert({studio_id:studioId,user_id:userId});if(grantError)throw grantError;
}else{
 // Remove the source grant first to prevent new conversations adding this user.
 const {error}=await db.from('sajuteller_studio_members').delete().eq('studio_id',studioId).eq('user_id',userId);if(error)throw error;
}
let offset=0,changed=0;
for(;;){
 const {data:rows,error}=await db.from('sajuteller_conversations').select('channel_id,customer_id').eq('studio_id',studioId).order('channel_id').range(offset,offset+99);if(error)throw error;
 for(const row of rows){if(row.customer_id===userId)continue;const channel=chat.channel('saju_business',row.channel_id);if(action==='add')await channel.addMembers([userId]);else await channel.removeMembers([userId]);changed++;}
 if(rows.length<100)break;offset+=100;
}
console.log(`Staff ${action} complete; ${changed} existing conversations updated. If interrupted, rerun the same command.`);
