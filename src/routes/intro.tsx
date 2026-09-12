import { styled } from "styled-components";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/i18n";
import heroBg from "../assets/hero_bg.jpg";
import homeBg from "../assets/home_bg.jpg";
import yinyangBg from "../assets/yinyang_bg.mp4";

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
  max-width: 600px;
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

const WhySection = styled.section`
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

const WhyContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
`;

const WhyHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
  z-index: 2;
`;

const WhyTitle = styled.h2<{ $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'heading')};
  font-size: 2.2rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  position: relative;
  z-index: 2;
  background: linear-gradient(135deg, #8b5cf6 0%, #c084fc 50%, #a855f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const WhyIcon = styled.span`
  font-size: 2rem;
  color: #8b5cf6;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  position: relative;
  z-index: 2;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const FeatureCard = styled.div`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(139, 92, 246, 0.2);
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 
    0 20px 60px rgba(139, 92, 246, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
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
    border-radius: 24px;
    z-index: -1;
    animation: borderGlow 3s ease-in-out infinite;
  }
  
  @keyframes borderGlow {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 
      0 25px 70px rgba(139, 92, 246, 0.25),
      inset 0 1px 0 rgba(255, 255, 255, 0.9);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%);
  }
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 20px;
    
    &::before {
      border-radius: 20px;
    }
  }
`;

const FeatureHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const FeatureIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  flex-shrink: 0;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
`;

const FeatureTitle = styled.h3<{ $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'heading')};
  font-size: 1.3rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const FeatureDescription = styled.p<{ $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'body')};
  color: #6b7280;
  line-height: 1.6;
  font-size: 1rem;
  margin: 0;
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

const ClosingSubtitle = styled.p<{ $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'body')};
  font-size: 1rem;
  color: #6b7280;
  margin-bottom: 2rem;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
  }
`;

export function Intro() {
  const { t, language } = useI18n();
  const navigate = useNavigate();

  const whyFeatures = [
    {
      id: 1,
      title: t("multilingualSupport"),
      icon: "🌍",
      description: t("multilingualSupportDesc")
    },
    {
      id: 2,
      title: t("traditionalFortuneTelling"),
      icon: "🏮",
      description: t("traditionalFortuneTellingDesc")
    },
    {
      id: 3,
      title: t("verifiedBusinesses"),
      icon: "🤝",
      description: t("verifiedBusinessesDesc")
    },
    {
      id: 4,
      title: t("personalizedMatching"),
      icon: "🎯",
      description: t("personalizedMatchingDesc")
    },
    {
      id: 5,
      title: t("premiumExperience"),
      icon: "💎",
      description: t("premiumExperienceDesc")
    },
    {
      id: 6,
      title: t("convenientBooking"),
      icon: "📱",
      description: t("convenientBookingDesc")
    }
  ];

  const handleGetStarted = () => {
    navigate('/');
  };

  return (
    <Wrapper $language={language}>
      <HeroSection>
        <HeroContent>
          <HeroTitle $language={language}>
            {t("whyChooseKSaju")}
          </HeroTitle>
          <HeroSubtitle>
            {t("introSubtitle")}
          </HeroSubtitle>
        </HeroContent>
      </HeroSection>
      
      <UnifiedSectionsContainer>
        <WhySection>
          <WhyContainer>
            <WhyHeader>
              <WhyTitle $language={language}>
                <WhyIcon>⭐</WhyIcon>
                {t("whyKSaju")}
              </WhyTitle>
            </WhyHeader>
            
            <FeaturesGrid>
              {whyFeatures.map((feature) => (
                <FeatureCard key={feature.id}>
                  <FeatureHeader>
                    <FeatureIcon>{feature.icon}</FeatureIcon>
                    <FeatureTitle $language={language}>{feature.title}</FeatureTitle>
                  </FeatureHeader>
                  <FeatureDescription $language={language}>{feature.description}</FeatureDescription>
                </FeatureCard>
              ))}
            </FeaturesGrid>
          </WhyContainer>
        </WhySection>
      </UnifiedSectionsContainer>
      
      <ClosingSection>
        <ClosingVideoBackground
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={yinyangBg} type="video/mp4" />
        </ClosingVideoBackground>
        <ClosingContainer>
          <ClosingTitle $language={language}>{t("closingTitle")}</ClosingTitle>
          <ClosingSubtitle $language={language}>{t("closingSubtitle")}</ClosingSubtitle>
          <CTAButton onClick={() => navigate('/')}>
            {t("start")}
          </CTAButton>
        </ClosingContainer>
      </ClosingSection>
    </Wrapper>
  );
}
