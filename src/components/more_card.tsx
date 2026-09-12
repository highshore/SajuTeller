import { styled } from "styled-components";
import { useI18n } from "../i18n/i18n";

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

const Card = styled.div`
  width: 220px;
  flex-shrink: 0;
  background: linear-gradient(145deg, #2a1f3d 0%, #1a1229 100%);
  border: 3px solid #8b5cf6;
  border-radius: 16px;
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(139, 92, 246, 0.3),
    0 0 20px rgba(139, 92, 246, 0.2);
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  cursor: pointer;
  transition: all 0.4s ease;
  position: relative;
  z-index: 2;
  
  &::before {
    content: '';
    position: absolute;
    top: 8px;
    left: 8px;
    right: 8px;
    bottom: 8px;
    border: 2px dashed rgba(139, 92, 246, 0.4);
    border-radius: 12px;
    background: radial-gradient(circle at center, rgba(139, 92, 246, 0.1) 0%, transparent 70%);
  }
  
  &::after {
    content: '⭐';
    position: absolute;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    color: #8b5cf6;
    font-size: 20px;
    animation: twinkle 2s ease-in-out infinite alternate;
  }
  
  @keyframes twinkle {
    0% { opacity: 0.5; transform: translateX(-50%) scale(1); }
    100% { opacity: 1; transform: translateX(-50%) scale(1.1); }
  }
  
  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 
      0 15px 35px rgba(0, 0, 0, 0.5),
      inset 0 1px 0 rgba(139, 92, 246, 0.5),
      0 0 30px rgba(139, 92, 246, 0.4);
      
    &::before {
      border-color: rgba(139, 92, 246, 0.7);
      background: radial-gradient(circle at center, rgba(139, 92, 246, 0.15) 0%, transparent 70%);
    }
  }
  
  @media (max-width: 768px) {
    width: 180px;
    padding: 1.5rem 0.75rem;
    
    &:hover {
      transform: translateY(-4px) scale(1.01);
    }
  }
  
  @media (max-width: 480px) {
    width: 160px;
    padding: 1.25rem 0.5rem;
  }
`;

const Icon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #8b5cf6;
  text-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
  animation: pulse 2s ease-in-out infinite;
  
  @keyframes pulse {
    0%, 100% { opacity: 0.7; }
    50% { opacity: 1; }
  }
`;

const Title = styled.h3<{ $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'heading')};
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #e2e8f0;
  line-height: 1.3;
  text-shadow: 0 2px 4px rgba(139, 92, 246, 0.3);
  letter-spacing: 1px;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const Subtitle = styled.p`
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 400;
  color: #a78bfa;
  line-height: 1.4;
  opacity: 0.9;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.75rem;
  }
`;

interface MoreCardProps {
  icon?: string;
  title?: string;
  subtitle?: string;
  onClick?: () => void;
}

export function MoreCard({ 
  icon = "➕", 
  title, 
  subtitle,
  onClick 
}: MoreCardProps) {
  const { t, language } = useI18n();

  const displayTitle = title || t("viewMore");
  const displaySubtitle = subtitle || t("viewAllServices");

  return (
    <Card onClick={onClick}>
      <Icon>{icon}</Icon>
      <Title $language={language}>{displayTitle}</Title>
      <Subtitle>{displaySubtitle}</Subtitle>
    </Card>
  );
}
