import { styled } from "styled-components";
import { useEffect, useMemo, useState } from "react";
import { StreamChat } from "stream-chat";
import { Chat, Channel, MessageList, MessageInput, Window, Thread, ChannelList, LoadingIndicator, useChannelStateContext } from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";
import { supabase } from "../supabase";
import { MagnifyingGlassIcon, PhoneIcon, EllipsisHorizontalIcon } from "@heroicons/react/24/outline";

const Page = styled.div`
  width:min(1296px,calc(100% - 48px));
  margin:40px auto 72px;
`;
const PageTitle=styled.h1`font-family:'Cormorant Garamond',serif;font-size:42px;margin:0 0 22px;color:#1f2937;`;
const Wrapper = styled.div`
  height:650px;
  display:grid;
  grid-template-columns:390px 1fr;
  background:#fff;
  border:1px solid #e8e0d5;
  border-radius:22px;
  overflow:hidden;
  box-shadow:0 16px 44px rgba(15,0,38,.08);
  .str-chat{height:100%;font-family:Inter,'Noto Sans KR',sans-serif;}
  .str-chat__channel-list{background:#fffdf8;}
  .str-chat__channel-preview-messenger--active{background:#f1e8fb!important;border-radius:12px;}
  .str-chat__message-input{border-top:1px solid #e8e0d5;background:#fffdf8;}
  .str-chat__message-text-inner{border-radius:16px!important;}
  @media(max-width:850px){grid-template-columns:300px 1fr;}
  @media(max-width:680px){grid-template-columns:1fr;height:720px;}
`;
const Sidebar=styled.aside`border-right:1px solid #e8e0d5;min-width:0;overflow:hidden;background:#fffdf8;@media(max-width:680px){display:none;}`;
const Panel=styled.section`min-width:0;overflow:hidden;background:white;`;
const SidebarInner=styled.div`display:flex;flex-direction:column;height:100%;`;
const SidebarHeader=styled.div`height:72px;padding:0 22px;display:flex;align-items:center;border-bottom:1px solid #e8e0d5;`;
const SidebarTitle=styled.h2`font-family:'Cormorant Garamond',serif;font-size:25px;margin:0;`;
const SidebarScroll=styled.div`flex:1;overflow:auto;padding:8px;`;
const PanelHeader=styled.div`height:72px;border-bottom:1px solid #e8e0d5;display:flex;align-items:center;justify-content:space-between;padding:0 22px;background:#fffdf8;`;
const PanelTitle=styled.div`font-family:'Cormorant Garamond',serif;font-size:21px;font-weight:700;`;
const IconBtn=styled.button`width:38px;height:38px;border-radius:12px;border:1px solid #e8e0d5;background:#fff;color:#1f2937;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;&:hover{background:#f8f6f0;}`;

function CustomChannelHeader(){
 const {channel}=useChannelStateContext();
 const channelData=channel?.data as Record<string,unknown>|undefined;
 const title=(channelData?.name as string|undefined)||channel?.id||'Direct Message';
 const membersCount=channel?Object.keys(channel.state.members).length:0;
 return <PanelHeader><div><PanelTitle>{title}</PanelTitle>{membersCount>0&&<span style={{color:'#8b7355',fontSize:12}}>· {membersCount} members</span>}</div><div style={{display:'flex',gap:8}}><IconBtn aria-label="Search"><MagnifyingGlassIcon width={18}/></IconBtn><IconBtn aria-label="Call"><PhoneIcon width={18}/></IconBtn><IconBtn aria-label="More"><EllipsisHorizontalIcon width={18}/></IconBtn></div></PanelHeader>;
}

export default function Messages(){
 const [client,setClient]=useState<StreamChat|null>(null);
 const [loading,setLoading]=useState(true);
 const filters=useMemo(()=>({type:{$in:['messaging']}}),[]);
 const sort=useMemo(()=>({last_message_at:-1} as const),[]);
 const options=useMemo(()=>({limit:30,state:true,watch:true}),[]);
 useEffect(()=>{
  let mounted=true;
  let connected:StreamChat|null=null;
  (async()=>{
   try{
    const {data}=await supabase.auth.getSession();
    const accessToken=data.session?.access_token;
    if(!accessToken) throw new Error('Not authenticated');
    const apiKey=import.meta.env.VITE_STREAM_API_KEY as string;
    if(!apiKey) throw new Error('Missing VITE_STREAM_API_KEY');
    const {data:fnRes,error:fnErr}=await supabase.functions.invoke('stream-token',{method:'GET',headers:{Authorization:`Bearer ${accessToken}`}});
    if(fnErr) throw fnErr;
    const {token,user}=fnRes as any;
    const c=StreamChat.getInstance(apiKey);connected=c;
    await c.connectUser({id:user.id,name:user.name,image:user.image},token);
    if(mounted)setClient(c);
   }catch(e){console.error('Failed to init Stream chat:',e);}finally{if(mounted)setLoading(false);}
  })();
  return()=>{mounted=false;connected?.disconnectUser();};
 },[]);
 if(loading)return <div style={{minHeight:500,display:'flex',alignItems:'center',justifyContent:'center'}}><LoadingIndicator size={28}/></div>;
 if(!client)return <div style={{minHeight:500,display:'flex',alignItems:'center',justifyContent:'center',color:'#6b7280'}}>Unable to initialize chat.</div>;
 return <Page><PageTitle>Messages</PageTitle><Wrapper><Chat client={client} theme="str-chat__theme-light"><Sidebar><SidebarInner><SidebarHeader><SidebarTitle>Conversations</SidebarTitle></SidebarHeader><SidebarScroll><ChannelList filters={filters} sort={sort} options={options}/></SidebarScroll></SidebarInner></Sidebar><Panel><Channel><Window><CustomChannelHeader/><MessageList/><MessageInput focus/></Window><Thread/></Channel></Panel></Chat></Wrapper></Page>;
}
