import { useNavigate } from "react-router-dom";
import { styled } from "styled-components";
import starBg from "../assets/star_bg.png";

const Page=styled.div`background:#fffdf8;color:#1f2937;`;
const Container=styled.div`width:min(1296px,calc(100% - 48px));margin:0 auto;`;
const Hero=styled.section`min-height:400px;background:#0f0026 url(${starBg}) center/cover;color:white;position:relative;overflow:hidden;`;
const HeroInner=styled(Container)`min-height:400px;display:grid;grid-template-columns:1fr 360px;align-items:center;gap:64px;@media(max-width:850px){grid-template-columns:1fr;}`;
const Title=styled.h1`font-family:'Cinzel',serif;font-size:clamp(42px,5vw,62px);margin:0 0 16px;letter-spacing:1px;`;
const Lead=styled.p`font-size:18px;line-height:1.65;color:#e2d8ef;max-width:720px;margin:0 0 28px;`;
const CTA=styled.button`height:50px;padding:0 24px;border:0;border-radius:16px;background:#6210cc;color:white;font-weight:750;cursor:pointer;`;
const Orbit=styled.div`width:290px;height:290px;border-radius:50%;background:#2a0f52;position:relative;justify-self:end;&::after{content:'';position:absolute;inset:70px;border-radius:50%;background:#14021f;box-shadow:0 0 0 40px #4a1a82;}@media(max-width:850px){display:none;}`;
const Section=styled.section`padding:72px 0 90px;`;
const Eyebrow=styled.div`font-size:12px;font-weight:800;letter-spacing:1.6px;color:#6210cc;margin-bottom:12px;`;
const SectionTitle=styled.h2`font-family:'Cormorant Garamond','Noto Serif KR',serif;font-size:40px;margin:0 0 34px;`;
const Grid=styled.div`display:grid;grid-template-columns:repeat(3,1fr);gap:24px;@media(max-width:800px){grid-template-columns:1fr;}`;
const Card=styled.div`min-height:190px;border:1px solid #e8e0d5;border-radius:18px;background:#fffdf8;padding:24px 22px;`;
const Icon=styled.div`font-size:28px;color:#6210cc;margin-bottom:16px;`;
const CardTitle=styled.h3`font-family:'Cormorant Garamond',serif;font-size:25px;margin:0 0 8px;`;
const Text=styled.p`margin:0;color:#6b7280;font-size:14px;line-height:1.6;`;
const Bottom=styled.div`margin-top:52px;border:1px solid #e8e0d5;border-radius:24px;background:#f8f6f0;padding:32px;display:flex;align-items:center;justify-content:space-between;gap:20px;@media(max-width:700px){flex-direction:column;align-items:flex-start;}`;

export function Intro(){
 const navigate=useNavigate();
 const cards=[
 ['◎','Multilingual support','Real-time interpretation in English, Chinese, Japanese and Spanish.'],
 ['✦','Verified businesses','Curated Saju studios and practitioners with clear booking information.'],
 ['◇','Personalized matching','Find a reader by location, topic, language and budget.'],
 ['四','Traditional fortune-telling','Learn the cultural context before you sit down for a reading.'],
 ['✓','Convenient booking','See availability, duration and cancellation terms before you commit.'],
 ['★','Premium experience','Make Saju feel like a meaningful part of your Korea itinerary, not a gimmick.'],
 ];
 return <Page><Hero><HeroInner><div><Title>WHAT IS SAJU?</Title><Lead>Korea’s traditional “four pillars” practice turns your birth year, month, day and hour into a conversation about personality, relationships, career and timing.</Lead><CTA onClick={()=>navigate('/locations')}>Find a Saju reading</CTA></div><Orbit/></HeroInner></Hero><Section><Container><Eyebrow>WHY K-SAJU?</Eyebrow><SectionTitle>Traditional experience, modern convenience</SectionTitle><Grid>{cards.map(([icon,title,text])=><Card key={title}><Icon>{icon}</Icon><CardTitle>{title}</CardTitle><Text>{text}</Text></Card>)}</Grid><Bottom><div><CardTitle>Ready to experience Saju in Seoul?</CardTitle><Text>Compare local readers and book a time that fits your trip.</Text></div><CTA onClick={()=>navigate('/locations')}>Browse readers</CTA></Bottom></Container></Section></Page>;
}
