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

const Container = styled.div`
  width: 100%;
  max-width: 960px;
  margin: 0 auto 2rem auto;
  padding: 0 1.5rem;
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    margin: 0 auto 2rem auto;
    padding: 0 1rem;
    gap: 1rem;
  }
`;

const Title = styled.h2<{ $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'heading')};
  font-size: 1.8rem;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
  margin: 0;
  white-space: nowrap;
  line-height: 1.3;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    white-space: normal;
    text-align: center;
  }
  
  @media (max-width: 480px) {
    font-size: 1.3rem;
  }
`;

const Divider = styled.div`
  flex: 1;
  height: 1px;
  background: linear-gradient(
    to right,
    transparent 0%,
    rgba(255, 255, 255, 0.1) 30%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.1) 70%,
    transparent 100%
  );
`;

interface SectionTitleProps {
  children: string;
}

export function SectionTitle({ children }: SectionTitleProps) {
  const { language } = useI18n();

  return (
    <Container>
      <Divider />
      <Title $language={language}>{children}</Title>
      <Divider />
    </Container>
  );
}
