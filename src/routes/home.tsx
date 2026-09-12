import { styled } from "styled-components";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/i18n";
import { supabase } from "../supabase";
import heroBg from "../assets/hero_bg.jpg";
import homeBg from "../assets/home_bg.jpg";
import yinyangBg from "../assets/yinyang_bg.mp4";
import LoadingScreen from "../components/loading_screen";
import { ServiceCard } from "../components/service_card";
import { MoreCard } from "../components/more_card";
import { AIServiceCard } from "../components/ai_service_card";
import { CardsCarousel } from "../components/cards_carousel";
import { SectionTitle } from "../components/section_title";
import { 
  SparklesIcon, 
  PencilSquareIcon, 
  MicrophoneIcon, 
  MapPinIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import starBg from "../assets/star_bg.png";

// Import mysterious fonts for multiple languages from Google Fonts
const fontLinks = [
  // Korean mysterious fonts
  'https://fonts.googleapis.com/css2?family=Song+Myung&family=Jua&family=Gugi&family=Stylish:wght@400&family=Kirang+Haerang&display=swap',
  // Korean clean fonts  
  'https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;600;700&family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap',
  // Latin mysterious fonts
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Text:wght@400;600;700&family=Cormorant+Garamond:wght@400;500;600;700&display=swap',
  // Japanese fonts
  'https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;500;600;700&family=Sawarabi+Mincho&display=swap',
  // Chinese fonts
  'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&family=Ma+Shan+Zheng&display=swap'
];

fontLinks.forEach(href => {
  const link = document.createElement('link');
  link.href = href;
  link.rel = 'stylesheet';
  document.head.appendChild(link);
});

// Language-specific font configurations
const getFontFamily = (language: string, type: 'heading' | 'body' | 'accent' | 'price') => {
  const fontConfigs = {
    ko: {
      heading: "'Song Myung', 'Stylish', 'Kirang Haerang', serif",
      body: "'Noto Sans KR', 'Jua', sans-serif",
      accent: "'Gugi', 'Song Myung', cursive",
      price: "'Noto Serif KR', 'Song Myung', serif"
    },
    en: {
      heading: "'Cinzel', 'Cormorant Garamond', serif",
      body: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      accent: "'Crimson Text', 'Cinzel', serif",
      price: "'Cinzel', 'Cormorant Garamond', serif"
    },
    ja: {
      heading: "'Sawarabi Mincho', 'Noto Serif JP', serif",
      body: "'Noto Sans JP', 'Hiragino Sans', sans-serif",
      accent: "'Noto Serif JP', 'Sawarabi Mincho', serif",
      price: "'Noto Serif JP', serif"
    },
    zh: {
      heading: "'Ma Shan Zheng', 'Noto Serif SC', serif",
      body: "'Noto Sans SC', 'PingFang SC', sans-serif",
      accent: "'Ma Shan Zheng', 'Noto Serif SC', serif",
      price: "'Noto Serif SC', serif"
    },
    es: {
      heading: "'Cinzel', 'Cormorant Garamond', serif",
      body: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      accent: "'Crimson Text', 'Cinzel', serif",
      price: "'Cinzel', 'Cormorant Garamond', serif"
    }
  };
  
  return fontConfigs[language as keyof typeof fontConfigs]?.[type] || fontConfigs.en[type];
};

const Wrapper = styled.div<{ $language: string }>`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: ${props => getFontFamily(props.$language, 'body')};
`;

const HeroSection = styled.section`
  width: 100%;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: #0F0026;
  
  @media (max-width: 960px) {
    height: auto;
    min-height: 350px;
    padding: 2rem 0;
  }
  
  @media (max-width: 768px) {
    height: auto;
    min-height: 320px;
    padding: 1.5rem 0;
  }
`;

const HeroBgImage = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  max-width: 960px;
  height: 400px;
  background-image: url(${heroBg});
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 0;
  
  @media (max-width: 960px) {
    width: 100%;
    max-width: none;
    height: auto;
    min-height: 250px;
    background-size: cover;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    height: 100%;
    min-height: 100%;
    background-size: auto 100%;
    background-position: center center;
    background-repeat: no-repeat;
  }
`;

const HeroContent = styled.div`
  text-align: left;
  color: white;
  z-index: 1;
  width: 100%;
  max-width: 960px;
  padding: 0 1.5rem;
  position: relative;
  
  @media (max-width: 768px) {
    text-align: center;
    padding: 0 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
`;

const HeroTitle = styled.h1<{ $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'heading')};
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  max-width: 450px;
  white-space: nowrap;
  
  @media (max-width: 768px) {
    font-size: 2.2rem;
    max-width: 100%;
    margin-bottom: 1.2rem;
    line-height: 1.3;
    white-space: normal;
  }
  
  @media (max-width: 480px) {
    font-size: 1.8rem;
  }
`;

const HeroSubtitle = styled.p`
  font-family: inherit;
  font-size: 1.1rem;
  font-weight: 400;
  margin-bottom: 1.5rem;
  opacity: 0.9;
  line-height: 1.5;
  max-width: 400px;
  word-wrap: break-word;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    max-width: 100%;
    margin-bottom: 2rem;
    line-height: 1.6;
  }
  
  @media (max-width: 480px) {
    font-size: 0.95rem;
  }
`;

const CTAButton = styled.button`
  background: #6210CC;
  border: 2px solid rgba(139, 92, 246, 0.4);
  color: white;
  padding: 0.75rem 1.5rem;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.2;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -150%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent 20%,
      rgba(255, 255, 255, 0.6) 50%,
      transparent 80%
    );
    transform: rotate(45deg);
    animation: continuousShine 2.5s ease-in-out infinite;
  }
  
  @keyframes continuousShine {
    0% {
      left: -150%;
      opacity: 0;
    }
    30% {
      opacity: 1;
    }
    70% {
      opacity: 1;
    }
    100% {
      left: 150%;
      opacity: 0;
    }
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.1) 0%,
      transparent 50%,
      rgba(255, 255, 255, 0.05) 100%
    );
    border-radius: 50px;
    pointer-events: none;
  }
  
  &:hover {
    background: #4c1d95;
    border-color: rgba(139, 92, 246, 0.7);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
    
    &::before {
      animation-duration: 1.5s;
    }
  }
  
  &:active {
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    padding: 0.875rem 2rem;
    font-size: 0.95rem;
    
    &:hover {
      transform: translateY(-1px);
    }
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem 1.75rem;
    font-size: 0.9rem;
  }
`;

const PopularSection = styled.section`
  min-height: 50vh;
  padding: 2.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  position: relative;
  z-index: 2;
  
  @media (max-width: 768px) {
    padding: 2rem 1rem;
    min-height: 40vh;
  }
`;

const RecommendedSection = styled.section`
  min-height: 50vh;
  padding: 2.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  position: relative;
  z-index: 2;
  
  @media (max-width: 768px) {
    padding: 2rem 1rem;
    min-height: 40vh;
  }
`;

const HotDealsSection = styled.section`
  min-height: 50vh;
  padding: 2.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  position: relative;
  z-index: 2;
  
  @media (max-width: 768px) {
    padding: 2rem 1rem;
    min-height: 40vh;
  }
`;

const ClosingSection = styled.section`
  min-height: 40vh;
  padding: 3rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to bottom,
      rgba(66, 66, 66, 0.7) 0%,
      rgba(33, 33, 33, 0.8) 100%
    );
    z-index: 2;
    pointer-events: none;
  }
  
  @media (max-width: 768px) {
    padding: 2.5rem 1rem;
    min-height: 35vh;
  }
`;

const ClosingVideoBackground = styled.video`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100vh;
  height: 100vw;
  object-fit: cover;
  transform: translate(-50%, -50%) rotate(90deg);
  z-index: 1;
  
  @media (max-width: 768px) {
    width: 100vh;
    height: 100vw;
    transform: translate(-50%, -50%) rotate(90deg) scale(1.2);
  }
  
  @media (max-width: 480px) {
    transform: translate(-50%, -50%) rotate(90deg) scale(1.5);
  }
`;

const ClosingContainer = styled.div`
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(139, 92, 246, 0.2);
  border-radius: 32px;
  padding: 3rem;
  max-width: 600px;
  width: 100%;
  text-align: center;
  box-shadow: 
    0 20px 60px rgba(139, 92, 246, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  position: relative;
  z-index: 3;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(
      45deg,
      rgba(139, 92, 246, 0.3) 0%,
      rgba(212, 175, 55, 0.3) 25%,
      rgba(139, 92, 246, 0.3) 50%,
      rgba(212, 175, 55, 0.3) 75%,
      rgba(139, 92, 246, 0.3) 100%
    );
    border-radius: 32px;
    z-index: -1;
    animation: borderGlow 3s ease-in-out infinite;
  }
  
  @keyframes borderGlow {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
  
  @media (max-width: 768px) {
    padding: 2rem;
    border-radius: 24px;
    
    &::before {
      border-radius: 24px;
    }
  }
`;

const ClosingTitle = styled.h2<{ $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'heading')};
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c1810;
  margin-bottom: 1.5rem;
  line-height: 1.3;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
`;

const ClosingSubtitle = styled.p`
  font-size: 1rem;
  color: #6b7280;
  margin-bottom: 2rem;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
  }
`;

// Unified sections container with gradient background
const UnifiedSectionsContainer = styled.div`
  position: relative;
  background-image: url(${homeBg});
  background-size: cover;
  background-position: center top;
  background-repeat: no-repeat;
  background-attachment: local;
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to bottom,
      rgba(30, 9, 50, 0.6) 0%,
      rgba(0, 0, 0, 0.7) 100%
    );
    z-index: 1;
    pointer-events: none;
  }
`;

const AIServicesSection = styled.section`
  min-height: 50vh;
  padding: 2.5rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  
  @media (max-width: 768px) {
    padding: 2rem 1rem;
    min-height: 40vh;
  }
`;

const AIServicesContainer = styled.div`
  display: flex;
  align-items: stretch;
  gap: 2rem;
  max-width: 960px;
  width: 100%;
  margin: 0 auto;
  position: relative;
  z-index: 2;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 2rem;
    align-items: center;
    padding: 0 1rem;
  }
`;

const AIServicesHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 2rem;
  margin-top: 0;
  
  @media (max-width: 768px) {
    text-align: center;
    align-items: center;
    margin-bottom: 1.5rem;
  }
`;

const MagicTitle = styled.h2<{ $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'heading')};
  font-size: 2.2rem;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  margin: 0;
  padding-top: 0;
  line-height: 1.3;
  background: linear-gradient(135deg, #8b5cf6 0%, #c084fc 50%, #a855f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  max-width: 320px;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
    max-width: 100%;
    text-align: center;
  }
`;

const AIServicesGrid = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  justify-content: flex-start;
  
  @media (max-width: 768px) {
    flex-direction: row;
    gap: 1.5rem;
    justify-content: center; /* center items across the row */
    align-items: center;     /* center items vertically in row */
    flex-wrap: wrap;
    width: 100%;             /* take full width to allow centering */
    align-self: center;      /* override parent's align-items: flex-start */
    margin: 0 auto;          /* ensure centering in parent flex column */
  }
  
  @media (max-width: 480px) {
    flex-direction: column;  /* stack on very small screens */
    gap: 1.5rem;
    align-items: center;     /* center stacked items */
  }
`;

const AIServicesContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-end;
  max-width: 480px;
  
  @media (max-width: 768px) {
    align-items: center;
    max-width: 100%;
  }
`;

const NameInputSection = styled.div`
  background: linear-gradient(135deg, #4A0E4E 0%, #2D1B69 100%);
  border-radius: 24px;
  padding: 2rem;
  margin-top: 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 25px rgba(74, 14, 78, 0.4);
  width: 100%;
  min-width: 400px;
  
  @media (max-width: 768px) {
    min-width: auto;
    padding: 1.5rem;
    margin: 0 1rem;
    width: calc(100% - 2rem);
  }
  
  @media (max-width: 480px) {
    padding: 1.25rem;
    border-radius: 20px;
  }
`;

const NameInputTitle = styled.h3<{ $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'heading')};
  font-size: 1.35rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 1rem 0;
  padding-top: 0;
  line-height: 1.3;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
`;

const NameInputSubtitle = styled.p`
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 1.25rem;
  line-height: 1.5;
`;

const NameInputForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const NameInput = styled.input`
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 1rem;
  font-size: 0.95rem;
  color: #1f2937;
  transition: all 0.3s ease;
  width: 100%;

  &::placeholder {
    color: #6b7280;
  }
  
  &:focus {
    outline: none;
    border-color: #8B5CF6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
    background: #ffffff;
  }
`;

const NameSubmitButton = styled.button`
  background: #000000;
  border: 2px solid #1a1a1a;
  color: white;
  padding: 1rem 1.25rem;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.2;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  
  &:hover {
    background: #2a2a2a;
    border-color: #3a3a3a;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// FAQ Section Styles
const FAQSection = styled.section`
  padding: 3rem 2rem;
  position: relative;
  overflow: hidden;
  background-image: url(${starBg});
  background-size: cover;
  background-position: center;
  background-repeat: repeat;
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      135deg,
      rgba(76, 29, 149, 0.80) 0%,
      rgba(0, 0, 0, 0.80) 100%
    );
    z-index: 1;
    pointer-events: none;
  }
  
  @media (max-width: 768px) {
    padding: 2.5rem 1rem;
  }
`;

const FAQContainer = styled.div`
  max-width: 960px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
`;

const FAQHeader = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
  position: relative;
  z-index: 2;
`;

const FAQTitle = styled.h2<{ $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'heading')};
  font-size: 2.2rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.75rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const FAQSubtitle = styled.p`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
  max-width: 600px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const FAQList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  position: relative;
  z-index: 2;
`;

const FAQItem = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &:hover {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.98);
  }
`;

const FAQQuestion = styled.button`
  width: 100%;
  padding: 1.25rem 1.5rem;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(248, 250, 252, 0.8);
  }
  
  @media (max-width: 768px) {
    padding: 1rem 1.25rem;
  }
`;

const FAQQuestionText = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  line-height: 1.4;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const FAQChevron = styled.div<{ $isOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
  transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  
  svg {
    width: 20px;
    height: 20px;
    color: #6b7280;
  }
`;

const FAQAnswer = styled.div<{ $isOpen: boolean }>`
  overflow: hidden;
  transition: all 0.3s ease;
  max-height: ${props => props.$isOpen ? '400px' : '0'};
  opacity: ${props => props.$isOpen ? '1' : '0'};
`;

const FAQAnswerContent = styled.div`
  padding: 0 1.5rem 1.25rem 1.5rem;
  color: #6b7280;
  line-height: 1.5;
  font-size: 0.95rem;
  
  @media (max-width: 768px) {
    padding: 0 1.25rem 1rem 1.25rem;
    font-size: 0.9rem;
  }
`;

// Final CTA Section Styles
const FinalCTASection = styled.section`
  padding: 5rem 2rem;
  background: linear-gradient(
    135deg,
    #f8fafc 0%,
    #f1f5f9 50%,
    #e2e8f0 100%
  );
  
  @media (max-width: 768px) {
    padding: 4rem 1rem;
  }
`;

const FinalCTAContainer = styled.div`
  max-width: 960px;
  margin: 0 auto;
  text-align: center;
`;

const FinalCTATitle = styled.h2<{ $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'heading')};
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1.5rem;
  line-height: 1.3;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const FinalCTASubtitle = styled.p`
  font-size: 1.2rem;
  color: #6b7280;
  margin-bottom: 3rem;
  line-height: 1.6;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 2.5rem;
  }
`;

// Types for Supabase data
interface LocationService {
  id: string; // UUID string, not number
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
  activity_level?: string;
  skill_level?: string;
  max_guests_total?: number;
  min_age?: number;
  place_id: string; // UUID string, not number
}

export function Home() {
  const { t, language } = useI18n();
  const navigate = useNavigate();

  // State for Supabase data
  const [services, setServices] = useState<LocationService[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for name input
  const [userName, setUserName] = useState('');
  
  // State for FAQ accordions
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  // FAQ data with proper localization
  const faqData = [
    {
      id: 1,
      question: t("faqWhatIsSaju"),
      answer: t("faqWhatIsSajuAnswer")
    },
    {
      id: 2,
      question: t("faqHowKSajuDifferent"),
      answer: t("faqHowKSajuDifferentAnswer")
    },
    {
      id: 3,
      question: t("faqHowConsultationWorks"),
      answer: t("faqHowConsultationWorksAnswer")
    },
    {
      id: 4,
      question: t("faqHowAccurate"),
      answer: t("faqHowAccurateAnswer")
    },
    {
      id: 5,
      question: t("faqWhatLanguages"),
      answer: t("faqWhatLanguagesAnswer")
    },
    {
      id: 6,
      question: t("faqPricingOptions"),
      answer: t("faqPricingOptionsAnswer")
    }
  ];

  // Fetch services from Supabase
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from('locations')
          .select(`
            id, title, image_url, price_krw, activity_level, skill_level, max_guests_total, min_age, place_id,
            title_ko, title_en, title_zh, title_ja, title_es,
            tagline, tagline_ko, tagline_en, tagline_zh, tagline_ja, tagline_es
          `);
        
        if (error) {
          console.error('Error fetching services:', error);
        } else if (data) {
          setServices(data);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const aiServices = [
    {
      id: 1,
      title: t("todayFortune"),
      icon: SparklesIcon,
      color: "linear-gradient(135deg, #4c1d95 0%, #3730a3 100%)" // Dark purple
    },
    {
      id: 3,
      title: t("liveTranslation"),
      icon: MicrophoneIcon,
      color: "linear-gradient(135deg, #4c1d95 0%, #3730a3 100%)" // Dark purple
    }
  ];
  
  const getPrice = (basePrice: number) => {
    const exchangeRates = {
      ko: 1, // 원화 기준
      en: 0.00075, // USD (1원 = 0.00075달러)
      zh: 0.0054, // CNY (1원 = 0.0054위안)
      ja: 0.11, // JPY (1원 = 0.11엔)
      es: 0.00069 // EUR (1원 = 0.00069유로)
    };
    
    const rate = exchangeRates[language] || 1;
    const convertedPrice = Math.round(basePrice * rate);
    
    switch (language) {
      case 'ko': return `₩${convertedPrice.toLocaleString()}`;
      case 'en': return `$${convertedPrice}`;
      case 'zh': return `¥${convertedPrice}`;
      case 'ja': return `¥${convertedPrice}`;
      case 'es': return `€${convertedPrice}`;
      default: return `₩${convertedPrice.toLocaleString()}`;
    }
  };

  // Generate random rating for demo purposes
  const getRandomRating = () => {
    return Math.round((Math.random() * 1.5 + 3.5) * 10) / 10; // Between 3.5 and 5.0
  };

  // Transform Supabase data for display with localization
  const transformServiceData = (service: LocationService, index: number) => {
    // Get localized title based on current language
    const getLocalizedTitle = () => {
      switch (language) {
        case 'ko':
          return service.title_ko || service.title || `사주 서비스 ${index + 1}`;
        case 'en':
          return service.title_en || service.title_ko || service.title || `Fortune Service ${index + 1}`;
        case 'zh':
          return service.title_zh || service.title_ko || service.title || `四柱服务 ${index + 1}`;
        case 'ja':
          return service.title_ja || service.title_ko || service.title || `四柱サービス ${index + 1}`;
        case 'es':
          return service.title_es || service.title_en || service.title_ko || service.title || `Servicio Saju ${index + 1}`;
        default:
          return service.title_en || service.title_ko || service.title || `Fortune Service ${index + 1}`;
      }
    };

    // Get localized tagline based on current language
    const getLocalizedTagline = () => {
      switch (language) {
        case 'ko':
          return service.tagline_ko || service.tagline;
        case 'en':
          return service.tagline_en || service.tagline_ko || service.tagline;
        case 'zh':
          return service.tagline_zh || service.tagline_ko || service.tagline;
        case 'ja':
          return service.tagline_ja || service.tagline_ko || service.tagline;
        case 'es':
          return service.tagline_es || service.tagline_en || service.tagline_ko || service.tagline;
        default:
          return service.tagline_en || service.tagline_ko || service.tagline;
      }
    };

    const localizedTitle = getLocalizedTitle();
    const localizedTagline = getLocalizedTagline();

    return {
      id: service.id, // UUID string
      title: localizedTitle,
      price: getPrice(service.price_krw),
      rating: getRandomRating(),
      image: service.image_url || `사주 서비스 ${index + 1}`,
      tagline: localizedTagline
    };
  };

  // Split services into categories
  const popularServices = services.slice(0, 7).map(transformServiceData);
  const recommendedServices = services.slice(7, 14).map(transformServiceData);
  const hotDealsServices = services.slice(14, 21).map((service, index) => ({
    ...transformServiceData(service, index),
    originalPrice: getPrice(service.price_krw * 1.5), // Simulate original price
    discount: "33%"
  }));


  const handleMoreClick = () => {
    // More button links to our original business page
    const originalBusinessId = '550e8400-e29b-41d4-a716-446655440002';
    navigate(`/business/${originalBusinessId}`);
  };

  const handleBusinessClick = (businessId: number | string) => {
    // Navigate to the specific business detail page using the actual service ID
    navigate(`/business/${businessId}`);
  };

  const handleSearchLocations = () => {
    navigate('/locations');
  };

  const handleAIServiceClick = (serviceId: number) => {
    if (serviceId === 1) { // Today's Fortune (id: 1)
      navigate('/today-fortune');
    } else if (serviceId === 3) { // Live Translation (id: 3)
      navigate('/live-translation');
    }
  };

  const handleNameCreation = () => {
    if (userName.trim()) {
      // Navigate to name-creation page with the entered name as a query parameter
      navigate(`/name-creation?name=${encodeURIComponent(userName.trim())}`);
    } else {
      // If no name entered, just navigate to the page
      navigate('/name-creation');
    }
  };

  const handleNameInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameCreation();
    }
  };

  const toggleFAQ = (id: number) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <Wrapper $language={language}>
      <HeroSection>
        <HeroBgImage />
        <HeroContent>
          <HeroTitle $language={language}>
            {t("heroTitle")}
          </HeroTitle>
          <HeroSubtitle>
            {t("heroSubtitle")}
          </HeroSubtitle>
          <CTAButton onClick={handleSearchLocations}>
            {"✨ "}{t("searchLocations")}
          </CTAButton>
        </HeroContent>
      </HeroSection>
      
      <UnifiedSectionsContainer>
        <AIServicesSection id="ai-services-section">
          <AIServicesContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', paddingTop: 0 }}>
              <AIServicesHeader>
                <MagicTitle $language={language}>{t("aiServicesTitle")}</MagicTitle>
              </AIServicesHeader>
              <AIServicesGrid>
                {aiServices.map((service) => (
                  <AIServiceCard 
                    key={service.id}
                    service={service}
                    onClick={handleAIServiceClick}
                  />
                ))}
              </AIServicesGrid>
            </div>
            
            <AIServicesContent>
              <NameInputSection>
                <NameInputTitle $language={language}>{t("getKoreanName")}</NameInputTitle>
                <NameInputSubtitle>
                  {t("nameInputDescription")}
                </NameInputSubtitle>
                <NameInputForm>
                  <NameInput
                    type="text"
                    placeholder={t("enterFullName")}
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    onKeyPress={handleNameInputKeyPress}
                  />
                  <NameSubmitButton onClick={handleNameCreation}>
                    {t("createKoreanName")}
                  </NameSubmitButton>
                </NameInputForm>
              </NameInputSection>
            </AIServicesContent>
          </AIServicesContainer>
        </AIServicesSection>
        
        <PopularSection>
          <SectionTitle>{t("popularServices")}</SectionTitle>
          <CardsCarousel totalItems={popularServices.length + 1}>
            {popularServices.map((service) => (
              <ServiceCard 
                key={service.id}
                service={service}
                variant="popular"
                onClick={handleBusinessClick}
              />
            ))}
            <MoreCard onClick={handleMoreClick} />
          </CardsCarousel>
        </PopularSection>

        <RecommendedSection>
          <SectionTitle>{t("recommendedBy")}</SectionTitle>
          <CardsCarousel totalItems={recommendedServices.length + 1}>
            {recommendedServices.map((service) => (
              <ServiceCard 
                key={service.id}
                service={service}
                variant="popular"
                onClick={handleBusinessClick}
              />
            ))}
            <MoreCard onClick={handleMoreClick} />
          </CardsCarousel>
        </RecommendedSection>

        <HotDealsSection>
          <SectionTitle>{t("hotDeals")}</SectionTitle>
          <CardsCarousel totalItems={hotDealsServices.length}>
            {hotDealsServices.map((service) => (
              <ServiceCard 
                key={service.id}
                service={service}
                variant="hotdeals"
                onClick={handleBusinessClick}
              />
            ))}
          </CardsCarousel>
        </HotDealsSection>
      </UnifiedSectionsContainer>
      
      {/* FAQ Section */}
      <FAQSection>
        <FAQContainer>
          <FAQHeader>
            <FAQTitle $language={language}>
              {t("faqTitle")}
            </FAQTitle>
            <FAQSubtitle>
              {t("faqSubtitle")}
            </FAQSubtitle>
          </FAQHeader>
          
          <FAQList>
            {faqData.map((faq) => (
              <FAQItem key={faq.id}>
                <FAQQuestion onClick={() => toggleFAQ(faq.id)}>
                  <FAQQuestionText>{faq.question}</FAQQuestionText>
                  <FAQChevron $isOpen={openFAQ === faq.id}>
                    <ChevronDownIcon />
                  </FAQChevron>
                </FAQQuestion>
                <FAQAnswer $isOpen={openFAQ === faq.id}>
                  <FAQAnswerContent>
                    {faq.answer}
                  </FAQAnswerContent>
                </FAQAnswer>
              </FAQItem>
            ))}
          </FAQList>
        </FAQContainer>
      </FAQSection>
      
      {/* Final CTA Section */}
      <FinalCTASection>
        <FinalCTAContainer>
          <FinalCTATitle $language={language}>
            {t("finalCtaTitle")}
          </FinalCTATitle>
          <FinalCTASubtitle>
            {t("finalCtaSubtitle")}
          </FinalCTASubtitle>
          <CTAButton onClick={handleSearchLocations}>
            {"✨ "}{t("searchLocations")}
          </CTAButton>
        </FinalCTAContainer>
      </FinalCTASection>
      
      {loading && <LoadingScreen />}
    </Wrapper>
  );
}
