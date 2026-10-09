// Run only against a dedicated SajuTeller Stream application. Secrets stay in env.
import { StreamChat } from 'stream-chat';
const key=process.env.STREAM_API_KEY,secret=process.env.STREAM_API_SECRET;
if(!key||!secret)throw new Error('Set STREAM_API_KEY and STREAM_API_SECRET before running this script.');
const client=new StreamChat(key,secret);
const config={name:'saju_business',typing_events:true,read_events:true,connect_events:true,reactions:true,replies:false,quotes:true,uploads:false,url_enrichment:false,max_message_length:4000,grants:{user:[],guest:[],anonymous:[],channel_member:['read-channel','read-channel-members','create-message','add-links','create-reaction','delete-reaction-owner','flag-message'],channel_moderator:['read-channel','read-channel-members','create-message','add-links','create-reaction','delete-reaction-owner','flag-message']}};
let exists=false;try{await client.getChannelType(config.name);exists=true;}catch(error){if(error.code!==16&&error.status!==404)throw error;}
if(exists)await client.updateChannelType(config.name,config);else await client.createChannelType(config);
const verified=await client.getChannelType(config.name);
if(verified.grants?.user?.includes('create-channel'))throw new Error('Unexpected client channel creation permission.');
console.log('SajuTeller business channels configured: members only, server-managed membership.');
