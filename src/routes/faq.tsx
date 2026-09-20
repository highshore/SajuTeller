import { useMemo, useState } from "react";
import { styled } from "styled-components";
import starBg from "../assets/star_bg.png";

const Page=styled.div`background:#fffdf8;color:#1f2937;min-height:860px;`;
const Hero=styled.section`background:#0f0026 url(${starBg}) center/cover;color:white;padding:46px 0 34px;`;
const Container=styled.div`width:min(1296px,calc(100% - 48px));margin:0 auto;`;
const Title=styled.h1`font-family:'Cinzel',serif;font-size:clamp(30px,5vw,50px);margin:0 0 10px;`;
const Lead=styled.p`margin:0;color:#d8cde7;font-size:16px;`;
const Search=styled.input`margin-top:28px;width:min(650px,100%);height:50px;border:1px solid rgba(255,255,255,.28);border-radius:14px;background:#fffdf8;color:#1f2937;padding:0 18px;outline:none;&:focus{box-shadow:0 0 0 3px rgba(139,92,246,.35);}`;
const Content=styled.section`@media(max-width:700px){padding:36px 0 48px;}padding:56px 0 88px;`;
const Grid=styled.div`display:grid;grid-template-columns:minmax(0,866px) 374px;gap:56px;align-items:start;@media(max-width:900px){grid-template-columns:1fr;}`;
const Heading=styled.h2`font-family:'Cormorant Garamond',serif;font-size:38px;margin:0 0 22px;`;
const List=styled.div`display:grid;gap:14px;`;
const Item=styled.div`border:1px solid #e8e0d5;border-radius:15px;background:white;overflow:hidden;`;
const Q=styled.button`width:100%;min-height:64px;border:0;background:transparent;padding:0 22px;display:flex;align-items:center;justify-content:space-between;gap:18px;text-align:left;font-size:15px;font-weight:750;cursor:pointer;`;
const A=styled.div`padding:0 22px 20px;color:#6b7280;font-size:14px;line-height:1.65;`;
const Side=styled.aside`border:1px solid #e8e0d5;border-radius:22px;background:#f8f6f0;padding:30px;`;
const SideTitle=styled.h3`font-family:'Cormorant Garamond',serif;font-size:28px;margin:0 0 10px;`;
const SideText=styled.p`margin:0;color:#6b7280;font-size:14px;line-height:1.65;`;

export default function FAQ(){
 const [open,setOpen]=useState<number|null>(0);
 const [term,setTerm]=useState('');
 const items=[
 ['What is Saju?','Saju uses the four pillars of your birth information as the basis for a traditional Korean reading about personality, relationships, career and timing.'],
 ['How does a consultation work?','Choose a reader, reserve a time, share your birth details, then meet the practitioner. Listings show whether live AI interpretation is included.'],
 ['What languages do you support?','Korean, English, Chinese, Japanese and Spanish are supported across the current product direction.'],
 ['How do cancellations work?','Each listing shows its cancellation window before payment. Always check the exact terms on the booking screen.'],
 ['Is live translation included?','Listings clearly indicate whether AI interpretation is included with the session.'],
 ['What if I do not know my birth time?','You can still book. An exact birth time is recommended for a traditional four-pillars calculation, but the product allows you to mark it as unknown.'],
 ['Is Saju scientifically accurate?','Saju is a traditional cultural practice, not a scientific prediction method. Treat the reading as interpretation and conversation rather than certainty.'],
 ];
 const filtered=useMemo(()=>items.filter(([q,a])=>(q+' '+a).toLowerCase().includes(term.toLowerCase())),[term]);
 return <Page><Hero><Container><Title>HELP & FAQ</Title><Lead>Answers for first-time Saju visitors, bookings and translation.</Lead><Search value={term} onChange={e=>setTerm(e.target.value)} placeholder="Search help articles…"/></Container></Hero><Content><Container><Grid><div><Heading>Frequently asked questions</Heading><List>{filtered.map(([q,a],i)=><Item key={q}><Q onClick={()=>setOpen(open===i?null:i)}><span>{q}</span><span>{open===i?'⌃':'⌄'}</span></Q>{open===i?<A>{a}</A>:null}</Item>)}</List></div><Side><SideTitle>Before your first reading</SideTitle><SideText>Bring your birth date and, if you know it, your exact birth time. Use the listing’s language badge to check whether the reader speaks your language or includes AI interpretation.</SideText></Side></Grid></Container></Content></Page>;
}
