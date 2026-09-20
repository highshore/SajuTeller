import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { styled } from "styled-components";
import { ChevronDownIcon, MicrophoneIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { supabase } from "../supabase";
import { useI18n } from "../i18n/i18n";
import { ServiceCard } from "../components/service_card";
import { AIServiceCard } from "../components/ai_service_card";
import StarfieldSection from "../components/starfield_section";

interface LocationService {
  id: string;
  title: string;
  title_ko?: string;
  title_en?: string;
  title_zh?: string;
  title_ja?: string;
  title_es?: string;
  tagline?: string;
  tagline_ko?: string;
  tagline_en?: string;
  tagline_zh?: string;
  tagline_ja?: string;
  tagline_es?: string;
  image_url?: string;
  price_krw: number;
}

const Page = styled.div`width:100%;background:#fffdf8;color:#1f2937;`;
const Container = styled.div`width:min(1296px,calc(100% - 48px));margin:0 auto;@media(max-width:700px){width:min(100% - 32px,1296px);}`;

const Hero = styled(StarfieldSection)`
  min-height: 620px;
  position: relative;
  overflow: hidden;
  color: white;
`;
const HeroInner = styled(Container)`
  position:relative;z-index:2;min-height:620px;padding:90px 6px 72px;display:flex;align-items:center;
  @media(max-width:700px){min-height:720px;padding:230px 0 64px;align-items:flex-start;}
`;
const HeroCopy = styled.div`width:100%;max-width:700px;@media(min-width:701px){width:58%;} @media(max-width:700px){text-align:center;}`;
const HeroTitle = styled.h1`
  margin:0 0 6px;font-family:'Cinzel',serif;font-size:clamp(32px,4vw,52px);line-height:1.12;letter-spacing:1.1px;font-weight:700;
`;
const HeroSub = styled.h2`@media(max-width:700px){font-size:23px;line-height:1.3;}
  margin:0 0 14px;font-family:'Cormorant Garamond','Noto Serif KR',serif;font-size:clamp(26px,2.7vw,34px);line-height:1.2;color:#e8ddf4;font-weight:600;
`;
const HeroDesc = styled.p`@media(max-width:700px){font-size:14px;margin-bottom:22px;}margin:0 0 30px;max-width:650px;color:#d8cde7;font-size:17px;line-height:1.65;`;

const SearchBox = styled.div`
  width:min(790px,100%);min-height:106px;padding:14px 14px 14px 22px;border-radius:18px;background:#fffdf8;border:1px solid #e8e0d5;display:grid;grid-template-columns:1fr 1.15fr 1fr 112px;align-items:stretch;box-shadow:0 18px 48px rgba(0,0,0,.15);
  @media(max-width:760px){grid-template-columns:repeat(2,minmax(0,1fr));padding:10px;gap:6px;}
`;
const SearchCell = styled.button`min-width:0;
  border:0;background:transparent;padding:12px 18px;text-align:left;color:#1f2937;cursor:pointer;position:relative;
  &:not(:first-child)::before{content:'';position:absolute;left:0;top:12px;bottom:12px;width:1px;background:#e8e0d5;}
  @media(max-width:760px){border:1px solid #eee6dc;border-radius:12px;padding:12px 10px;&::before{display:none!important;}}
`;
const SearchLabel = styled.span`display:block;color:#6b7280;font-size:11px;font-weight:700;margin-bottom:7px;`;
const SearchValue = styled.span`@media(max-width:700px){font-size:13px;}display:flex;align-items:center;gap:6px;font-size:15px;font-weight:700;`;
const FindButton = styled.button`
  border:0;border-radius:14px;background:#6210cc;color:white;font-size:14px;font-weight:750;cursor:pointer;padding:0 12px;box-shadow:0 8px 22px rgba(98,16,204,.25);transition:.18s ease;
  &:hover{background:#5410ad;transform:translateY(-1px);}
  @media(max-width:760px){min-height:52px;}
`;
const Trust = styled.div`@media(max-width:700px){font-size:10px;line-height:1.8;}margin-top:20px;color:#d9cbe9;font-size:13px;font-weight:550;letter-spacing:.1px;`;


const Section = styled.section`padding:72px 0;@media(max-width:700px){padding:36px 0;}`;
const Eyebrow = styled.div`font-size:12px;font-weight:800;letter-spacing:1.6px;color:#6210cc;margin-bottom:12px;text-transform:uppercase;`;
const SectionTitle = styled.h2`@media(max-width:700px){font-size:29px;}margin:0;font-family:'Cormorant Garamond','Noto Serif KR',serif;font-size:36px;line-height:1.18;font-weight:700;color:#1f2937;`;
const SectionLead = styled.p`margin:10px 0 0;color:#6b7280;font-size:15px;line-height:1.6;max-width:820px;`;
const HeadingRow = styled.div`margin-bottom:28px;@media(max-width:700px){margin-bottom:20px;}`;

const ServicesGrid = styled.div`display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:22px;align-items:stretch;@media(max-width:1050px){grid-template-columns:repeat(2,minmax(0,1fr));}@media(max-width:700px){display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:14px;padding:2px 2px 16px;scrollbar-width:thin;> *{flex:0 0 76%;min-width:0;scroll-snap-align:start;}}`;
const ServiceSlot = styled.div`display:flex;justify-content:center;`;
const EmptyCard = styled.button`
  min-height:360px;border-radius:16px;border:2px solid #8b7355;background:#f8f6f0;position:relative;cursor:pointer;padding:24px;color:#2c1810;text-align:center;
  &::after{content:'';position:absolute;inset:8px;border:1px solid #d4af37;border-radius:12px;}
  strong{display:block;font-family:'Cormorant Garamond',serif;font-size:24px;margin:190px 0 8px;position:relative;z-index:2;}
  span{position:relative;z-index:2;color:#8b7355;font-size:13px;}
`;

const Culture = styled(StarfieldSection)`padding:64px 0;color:white;@media(max-width:700px){padding:36px 0 60px;}`;
const CultureGrid = styled.div`> *{min-width:0;} @media(max-width:700px){gap:28px;}display:grid;grid-template-columns:380px 1fr;gap:64px;align-items:center;@media(max-width:900px){grid-template-columns:1fr;}`;
const CultureTitle = styled.h2`font-family:'Cormorant Garamond',serif;font-size:36px;margin:0 0 12px;`;
const CultureText = styled.p`color:#d8cde7;line-height:1.6;font-size:15px;margin:0 0 24px;`;
const ShieldRow = styled.div`display:flex;gap:12px;@media(max-width:700px){justify-content:center;}`;
const NamePanel = styled.div`@media(max-width:700px){padding:24px 18px;}background:#26103f;border:1px solid #6d4a93;border-radius:22px;padding:32px 36px;`;
const NameTitle = styled.h3`@media(max-width:700px){font-size:21px;}font-family:'Cinzel',serif;font-size:26px;letter-spacing:.3px;margin:0 0 10px;`;
const NameText = styled.p`color:#d7c8e9;font-size:14px;line-height:1.5;margin:0 0 24px;`;
const NameForm = styled.form`display:grid;grid-template-columns:1fr 210px;gap:14px;@media(max-width:650px){grid-template-columns:1fr;}`;
const NameInput = styled.input`min-width:0;width:100%;font-size:16px;height:54px;border:0;border-radius:18px;background:#fffdf8;color:#1f2937;padding:0 20px;outline:none;&:focus{box-shadow:0 0 0 3px rgba(139,92,246,.35);}`;
const NameButton = styled.button`height:54px;border:0;border-radius:18px;background:#050505;color:white;font-weight:700;cursor:pointer;`;

const Neighborhoods = styled.div`display:grid;grid-template-columns:repeat(4,1fr);gap:22px;@media(max-width:850px){grid-template-columns:repeat(2,1fr);}@media(max-width:500px){gap:12px;}`;
const Neighborhood = styled.button<{ $tone: number }>`@media(max-width:700px){min-height:122px;padding:54px 14px 16px;strong{font-size:20px;}}
  min-height:146px;border:0;border-radius:18px;background:${p => ['#f6e7e5','#e7f0ea','#efe7da','#eee9f7'][p.$tone]};padding:82px 18px 18px;text-align:left;cursor:pointer;transition:.18s ease;
  &:hover{transform:translateY(-3px);box-shadow:0 10px 30px rgba(15,0,38,.08);}
  strong{display:block;font-family:'Cormorant Garamond',serif;font-size:22px;margin-bottom:4px;color:#1f2937;}span{font-size:12px;color:#6b7280;}
`;

const Steps = styled.div`display:grid;grid-template-columns:repeat(3,1fr);gap:24px;@media(max-width:800px){grid-template-columns:1fr;}`;
const Step = styled.div`@media(max-width:700px){min-height:0;padding:22px;}min-height:220px;border:1px solid #e8e0d5;border-radius:18px;padding:28px 24px;background:#fffdf8;`;
const StepNo = styled.div`@media(max-width:700px){margin-bottom:14px;}font-size:12px;font-weight:800;color:#6210cc;margin-bottom:28px;`;
const StepTitle = styled.h3`font-family:'Cormorant Garamond',serif;font-size:25px;margin:0 0 10px;`;
const StepText = styled.p`margin:0;color:#6b7280;font-size:14px;line-height:1.6;`;

const FAQ = styled(StarfieldSection)`padding:64px 0;color:white;@media(max-width:700px){padding:36px 0 60px;}`;
const FAQTitle = styled.h2`@media(max-width:700px){font-size:25px;line-height:1.25;}font-family:'Cinzel',serif;font-size:34px;margin:0 0 10px;`;
const FAQLead = styled.p`margin:0 0 30px;color:#d8cde7;font-size:15px;`;
const FAQList = styled.div`display:grid;gap:12px;`;
const FAQItem = styled.div`background:#fffdf8;border-radius:12px;color:#1f2937;overflow:hidden;`;
const FAQButton = styled.button`gap:12px;@media(max-width:700px){padding:14px 16px;font-size:14px;}width:100%;min-height:58px;border:0;background:transparent;padding:0 24px;display:flex;align-items:center;justify-content:space-between;text-align:left;font-weight:700;cursor:pointer;`;
const FAQAnswer = styled.div`padding:0 24px 22px;color:#6b7280;font-size:14px;line-height:1.65;`;

const BottomCTA = styled.section`padding:40px 0;`;
const CTABox = styled.div`@media(max-width:700px){padding:24px;min-height:0;}min-height:170px;border:1px solid #e8e0d5;border-radius:24px;background:#f8f6f0;padding:34px 36px;display:flex;align-items:center;justify-content:space-between;gap:24px;@media(max-width:700px){align-items:flex-start;flex-direction:column;}`;
const CTATitle = styled.h3`font-family:'Cormorant Garamond',serif;font-size:30px;margin:0 0 8px;`;
const CTAText = styled.p`margin:0;color:#6b7280;font-size:14px;`;
const CTAButton = styled.button`min-width:0;width:250px;max-width:100%;height:50px;border:0;border-radius:16px;background:#6210cc;color:white;font-weight:750;cursor:pointer;`;

function localize(service: LocationService, language: string, field: 'title' | 'tagline') {
  const map: Record<string, string | undefined> = field === 'title'
    ? { ko: service.title_ko, en: service.title_en, zh: service.title_zh, ja: service.title_ja, es: service.title_es }
    : { ko: service.tagline_ko, en: service.tagline_en, zh: service.tagline_zh, ja: service.tagline_ja, es: service.tagline_es };
  return map[language] || map.en || map.ko || service[field] || '';
}

function krw(value: number) {
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(value);
}

export function Home() {
  const navigate = useNavigate();
  const { language } = useI18n();
  const [services, setServices] = useState<LocationService[]>([]);
  const [name, setName] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase.from('locations').select('id,title,title_ko,title_en,title_zh,title_ja,title_es,tagline,tagline_ko,tagline_en,tagline_zh,tagline_ja,tagline_es,image_url,price_krw').limit(8)
      .then(({ data, error }) => {
        if (error) console.error('Unable to load featured locations', error);
        if (!cancelled) setServices((data ?? []) as LocationService[]);
      });
    return () => { cancelled = true; };
  }, []);

  const featured = useMemo(() => services.slice(0, 4), [services]);
  const faq = [
    ['What is Saju?', 'Saju is a Korean four-pillars tradition that uses your birth year, month, day and hour as a starting point for discussing personality, relationships, career and timing.'],
    ['How does a consultation work?', 'Choose a reader, reserve a time, share your birth details and meet the practitioner. Listings show when live AI interpretation is available.'],
    ['What languages do you support?', 'The product currently supports Korean, English, Chinese, Japanese and Spanish across key flows.'],
    ['How accurate are the readings?', 'Saju is a traditional cultural practice rather than a scientific prediction method. Treat the reading as interpretation and conversation, not certainty.'],
  ];

  return (
    <Page>
      <Hero hero>
        <HeroInner>
          <HeroCopy>
            <HeroTitle>WRITTEN IN THE STARS?</HeroTitle>
            <HeroSub>Meet Korea’s traditional way of reading your path.</HeroSub>
            <HeroDesc>Book a real Saju reading in Seoul, choose your language, and use live AI interpretation during the session.</HeroDesc>
            <SearchBox>
              <SearchCell onClick={() => navigate('/locations')}><SearchLabel>Where</SearchLabel><SearchValue>Seoul <ChevronDownIcon width={14}/></SearchValue></SearchCell>
              <SearchCell onClick={() => navigate('/locations')}><SearchLabel>When</SearchLabel><SearchValue>Today or tomorrow <ChevronDownIcon width={14}/></SearchValue></SearchCell>
              <SearchCell onClick={() => navigate('/locations')}><SearchLabel>Language</SearchLabel><SearchValue>English <ChevronDownIcon width={14}/></SearchValue></SearchCell>
              <FindButton onClick={() => navigate('/locations')}>Find a reading</FindButton>
            </SearchBox>
            <Trust>Verified readers&nbsp;&nbsp; ✦ &nbsp;&nbsp;Translation included&nbsp;&nbsp; ✦ &nbsp;&nbsp;Multilingual support</Trust>
          </HeroCopy>
        </HeroInner>
      </Hero>

      <Section>
        <Container>
          <HeadingRow><Eyebrow>Popular Saju services</Eyebrow><SectionTitle>Choose a reading that feels right</SectionTitle><SectionLead>Explore trusted local readers for love, career, and the path ahead.</SectionLead></HeadingRow>
          <ServicesGrid>
            {featured.length ? featured.map(s => (
              <ServiceSlot key={s.id}><ServiceCard service={{ id:s.id, title:localize(s, language, 'title'), tagline:localize(s, language, 'tagline'), price:krw(s.price_krw), image:s.image_url }} onClick={(id) => navigate(`/business/${id}`)} /></ServiceSlot>
            )) : ['Traditional Four Pillars','Love & Compatibility','Career & Direction','Tarot + Saju'].map((label, i) => <EmptyCard key={label} onClick={() => navigate('/locations')}><strong>{label}</strong><span>{['Classic Saju reading','Relationships and timing','Work and direction','A lighter mixed reading'][i]}</span></EmptyCard>)}
          </ServicesGrid>
        </Container>
      </Section>

      <Culture>
        <Container><CultureGrid>
          <div>
            <Eyebrow style={{color:'#cbb8e8'}}>Culture Lab</Eyebrow>
            <CultureTitle>Our AI services work like magic</CultureTitle>
            <CultureText>Discover your daily fortune, find your Korean name, and connect across languages.</CultureText>
            <ShieldRow>
              <AIServiceCard service={{id:1,title:"Today's Fortune",icon:SparklesIcon,color:'linear-gradient(135deg,#8b5cf6,#6210cc)'}} onClick={() => navigate('/today-fortune')}/>
              <AIServiceCard service={{id:2,title:'Live Translation',icon:MicrophoneIcon,color:'linear-gradient(135deg,#8b5cf6,#6210cc)'}} onClick={() => navigate('/live-translation')}/>
            </ShieldRow>
          </div>
          <NamePanel>
            <NameTitle>✨ GET YOUR KOREAN NAME</NameTitle>
            <NameText>Enter your full name and discover a Korean name through AI-powered analysis.</NameText>
            <NameForm onSubmit={e => {e.preventDefault(); navigate(`/name-creation${name ? `?name=${encodeURIComponent(name)}` : ''}`);}}>
              <NameInput value={name} onChange={e => setName(e.target.value)} placeholder="Enter your full name…"/>
              <NameButton type="submit">Create my Korean name</NameButton>
            </NameForm>
          </NamePanel>
        </CultureGrid></Container>
      </Culture>

      <Section>
        <Container>
          <HeadingRow><Eyebrow>Explore Seoul</Eyebrow><SectionTitle>Find a Saju studio near your plans</SectionTitle><SectionLead>Pick a neighborhood already on your itinerary, then compare real readers nearby.</SectionLead></HeadingRow>
          <Neighborhoods>
            {[['Hongdae','Young · casual · creative'],['Insadong','Traditional atmosphere'],['Gangnam','Polished · modern'],['Myeongdong','Central · convenient']].map(([title,sub],i) => <Neighborhood key={title} $tone={i} onClick={() => navigate('/locations')}><strong>{title}</strong><span>{sub}</span></Neighborhood>)}
          </Neighborhoods>
        </Container>
      </Section>

      <Section style={{paddingTop:0}}>
        <Container>
          <HeadingRow><Eyebrow>Simple & translated</Eyebrow><SectionTitle>How K-Saju works</SectionTitle></HeadingRow>
          <Steps>
            <Step><StepNo>01</StepNo><StepTitle>Find your reader</StepTitle><StepText>Browse by neighborhood, topic, price and language support.</StepText></Step>
            <Step><StepNo>02</StepNo><StepTitle>Book a time</StepTitle><StepText>See exact duration, real availability and cancellation rules before you commit.</StepText></Step>
            <Step><StepNo>03</StepNo><StepTitle>Read in your language</StepTitle><StepText>Use the live interpreter during the session and save a translated recap.</StepText></Step>
          </Steps>
        </Container>
      </Section>

      <FAQ>
        <Container>
          <FAQTitle>FREQUENTLY ASKED QUESTIONS</FAQTitle><FAQLead>Everything you need to know before your first reading.</FAQLead>
          <FAQList>{faq.map(([q,a],i) => <FAQItem key={q}><FAQButton aria-expanded={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? null : i)}><span>{q}</span><span>{openFaq === i ? '⌃' : '⌄'}</span></FAQButton>{openFaq === i ? <FAQAnswer>{a}</FAQAnswer> : null}</FAQItem>)}</FAQList>
        </Container>
      </FAQ>

      <BottomCTA><Container><CTABox><div><CTATitle>New to Korean fortune-telling?</CTATitle><CTAText>Learn the four pillars before you book — then meet a reader in person.</CTAText></div><CTAButton onClick={() => navigate('/intro')}>Learn what Saju is</CTAButton></CTABox></Container></BottomCTA>
    </Page>
  );
}
