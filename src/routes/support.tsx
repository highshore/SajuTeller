import { useNavigate } from "react-router-dom";
import { styled } from "styled-components";
import starBg from "../assets/star_bg.png";

const Page=styled.div`background:#fffdf8;color:#1f2937;min-height:760px;`;
const Hero=styled.section`background:#0f0026 url(${starBg}) center/cover;color:white;padding:48px 0;`;
const Container=styled.div`width:min(1296px,calc(100% - 48px));margin:0 auto;`;
const Title=styled.h1`font-family:'Cinzel',serif;font-size:clamp(30px,5vw,50px);margin:0 0 10px;letter-spacing:.7px;`;
const Lead=styled.p`margin:0;color:#d8cde7;font-size:16px;line-height:1.6;max-width:760px;`;
const Content=styled.section`@media(max-width:700px){padding:36px 0 48px;}padding:64px 0 90px;`;
const Grid=styled.div`display:grid;grid-template-columns:1fr 374px;gap:56px;align-items:start;@media(max-width:900px){grid-template-columns:1fr;}`;
const Heading=styled.h2`font-family:'Cormorant Garamond',serif;font-size:36px;margin:0 0 24px;`;
const Cards=styled.div`display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;@media(max-width:620px){grid-template-columns:1fr;}`;
const Card=styled.div`border:1px solid #e8e0d5;border-radius:18px;background:#fff;padding:24px;min-height:190px;`;
const Icon=styled.div`width:46px;height:46px;border-radius:14px;background:#f1e8fb;color:#6210cc;display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:18px;`;
const CardTitle=styled.h3`font-family:'Cormorant Garamond',serif;font-size:25px;margin:0 0 8px;`;
const Text=styled.p`margin:0 0 18px;color:#6b7280;font-size:14px;line-height:1.6;`;
const Button=styled.button`height:44px;padding:0 18px;border:0;border-radius:14px;background:#6210cc;color:white;font-weight:700;cursor:pointer;`;
const Side=styled.div`border:1px solid #e8e0d5;border-radius:22px;background:#f8f6f0;padding:30px;`;
const Lang=styled.div`margin-top:30px;padding-top:22px;border-top:1px solid #e0d7cb;color:#6b7280;font-size:13px;line-height:1.7;`;

export default function Support(){
 const navigate=useNavigate();
 return <Page><Hero><Container><Title>HELP & SUPPORT</Title><Lead>Answers for first-time Saju visitors, bookings, payments and translation.</Lead></Container></Hero><Content><Container><Grid><div><Heading>How can we help?</Heading><Cards><Card><Icon>?</Icon><CardTitle>Frequently asked questions</CardTitle><Text>Start with practical answers about Saju, bookings, cancellations and supported languages.</Text><Button onClick={()=>navigate('/faq')}>Browse FAQ</Button></Card><Card><Icon>✉</Icon><CardTitle>Message support</CardTitle><Text>Contact K-Saju when you need help with a booking, payment or translation issue.</Text><Button onClick={()=>navigate('/messages')}>Open messages</Button></Card></Cards></div><Side><CardTitle>Need more help?</CardTitle><Text>We’ll help you sort out booking, payment or interpreter issues before your session.</Text><Button onClick={()=>navigate('/messages')}>Contact support</Button><Lang><strong style={{color:'#1f2937'}}>Response languages</strong><br/>English · 한국어 · 中文 · 日本語 · Español</Lang></Side></Grid></Container></Content></Page>;
}
