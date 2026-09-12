import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useI18n } from '../i18n/i18n';
import { generateFortune, type FortuneResult, type UserInput } from '../services/fortune';

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
      heading: "'Cinzel', 'Crimson Text', serif",
      body: "'Cormorant Garamond', 'Crimson Text', serif",
      accent: "'Cinzel', 'Crimson Text', serif",
      price: "'Crimson Text', serif"
    },
    ja: {
      heading: "'Sawarabi Mincho', 'Noto Serif JP', serif",
      body: "'Noto Sans JP', 'Sawarabi Mincho', sans-serif",
      accent: "'Sawarabi Mincho', 'Noto Serif JP', serif",
      price: "'Noto Serif JP', 'Sawarabi Mincho', serif"
    },
    zh: {
      heading: "'Ma Shan Zheng', 'Noto Serif SC', serif",
      body: "'Noto Sans SC', 'Ma Shan Zheng', sans-serif",
      accent: "'Ma Shan Zheng', 'Noto Serif SC', serif",
      price: "'Noto Serif SC', 'Ma Shan Zheng', serif"
    },
    es: {
      heading: "'Cinzel', 'Crimson Text', serif",
      body: "'Cormorant Garamond', 'Crimson Text', serif",
      accent: "'Cinzel', 'Crimson Text', serif",
      price: "'Crimson Text', serif"
    }
  };
  
  return fontConfigs[language as keyof typeof fontConfigs]?.[type] || fontConfigs.en[type];
};

const Container = styled.div<{ $language: string }>`
  min-height: 100vh;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #533483 75%, #7209b7 100%);
  position: relative;
  padding: 2rem 0;
  font-family: ${props => getFontFamily(props.$language, 'body')};
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%);
    z-index: 0;
  }
  
  @media (max-width: 768px) {
    padding: 1rem 0;
  }
`;

const ContentWrapper = styled.div`
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  overflow-y: auto;
  position: relative;
  z-index: 1;
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
    margin: 1rem;
    max-width: calc(100% - 2rem);
    border-radius: 20px;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #4a5568;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 2rem;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
    color: #2d3748;
    transform: translateY(-1px);
  }
`;

const FortuneIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
`;

const Title = styled.h1<{ $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'heading')};
  font-size: 3rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 1rem;
  line-height: 1.2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.8rem;
  }
`;

const Subtitle = styled.p<{ $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'body')};
  font-size: 1.2rem;
  color: #4a5568;
  margin-bottom: 0;
  line-height: 1.6;
  font-weight: 400;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const FortuneCard = styled.div`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  margin: 2rem 0;
  border: 2px solid rgba(139, 92, 246, 0.2);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  position: relative;
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
    border-radius: 20px;
    z-index: -1;
    animation: borderGlow 3s ease-in-out infinite;
  }
  
  @keyframes borderGlow {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
`;

const FortuneTitle = styled.h2<{ $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'heading')};
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c1810;
  margin-bottom: 1rem;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const FortuneContent = styled.div<{ $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'body')};
  font-size: 1.2rem;
  line-height: 1.8;
  color: #4a5568;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const FortuneDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
`;

const FortuneDetailCard = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-left: 4px solid rgba(139, 92, 246, 0.6);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 12px 40px rgba(0, 0, 0, 0.15),
      0 4px 12px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.6);
  }
`;

const DetailTitle = styled.h3<{ $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'heading')};
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c1810;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const DetailContent = styled.p<{ $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'body')};
  color: #4a5568;
  font-size: 1rem;
  line-height: 1.6;
`;

const LuckyElements = styled.div`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  margin: 2rem 0;
  border: 2px solid rgba(212, 175, 55, 0.3);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
`;

const LuckyTitle = styled.h3<{ $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'heading')};
  font-size: 1.3rem;
  font-weight: 700;
  color: #2c1810;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const LuckyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
`;

const LuckyItem = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 8px 20px rgba(0, 0, 0, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.6);
  }
`;

const LuckyEmoji = styled.div`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const LuckyLabel = styled.div<{ $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'body')};
  font-size: 0.9rem;
  color: #8b4513;
  font-weight: 500;
`;

const LuckyValue = styled.div<{ $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'body')};
  font-size: 1rem;
  color: #2c1810;
  font-weight: 600;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 3rem;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary'; $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'body')};
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 160px;
  
  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
    
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
    }
  ` : `
    background: rgba(255, 255, 255, 0.8);
    color: #4a5568;
    border: 2px solid rgba(226, 232, 240, 0.8);
    backdrop-filter: blur(10px);
    
    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.95);
      border-color: rgba(139, 92, 246, 0.3);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 200px;
  
  &::before {
    content: '';
    display: inline-block;
    width: 40px;
    height: 40px;
    border: 4px solid #f3f4f6;
    border-radius: 50%;
    border-top-color: #8b5cf6;
    animation: spin 1s ease-in-out infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// 사용자 입력 폼 컴포넌트
const InputForm = styled.div`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 2px solid rgba(139, 92, 246, 0.2);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
`;

const FormTitle = styled.h3<{ $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'heading')};
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c1810;
  margin-bottom: 1.5rem;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  
  /* 출생시간 모름 토글을 위한 세로 가운데 정렬 */
  &:has([id="birthTimeUnknown"]) {
    justify-content: center;
  }
`;

const Label = styled.label<{ $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'body')};
  font-size: 0.9rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
`;

const Input = styled.input<{ $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'body')};
  padding: 1rem 1.25rem;
  border: 2px solid rgba(226, 232, 240, 0.8);
  border-radius: 12px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #8b5cf6;
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }
  
  &::placeholder {
    color: #a0aec0;
  }
  
  /* Date and time input specific styles for better language support */
  &[type="date"], &[type="time"] {
    color-scheme: light;
    
    /* Force English locale for date/time inputs */
    &::-webkit-datetime-edit {
      font-family: 'Arial', sans-serif;
      direction: ltr;
    }
    
    &::-webkit-datetime-edit-fields-wrapper {
      font-family: 'Arial', sans-serif;
      direction: ltr;
    }
    
    &::-webkit-datetime-edit-text {
      font-family: 'Arial', sans-serif;
      direction: ltr;
    }
    
    &::-webkit-datetime-edit-month-field,
    &::-webkit-datetime-edit-day-field,
    &::-webkit-datetime-edit-year-field {
      font-family: 'Arial', sans-serif;
      direction: ltr;
    }
    
    &::-webkit-datetime-edit-hour-field,
    &::-webkit-datetime-edit-minute-field,
    &::-webkit-datetime-edit-second-field {
      font-family: 'Arial', sans-serif;
      direction: ltr;
    }
    
    /* Show browser's default datetime values when they have content */
    &:not(:invalid):not(:placeholder-shown) {
      &::-webkit-datetime-edit,
      &::-webkit-datetime-edit-fields-wrapper,
      &::-webkit-datetime-edit-text,
      &::-webkit-datetime-edit-month-field,
      &::-webkit-datetime-edit-day-field,
      &::-webkit-datetime-edit-year-field,
      &::-webkit-datetime-edit-hour-field,
      &::-webkit-datetime-edit-minute-field,
      &::-webkit-datetime-edit-second-field {
        color: #1a202c !important;
        opacity: 1 !important;
      }
    }
    
    /* Hide placeholders when empty */
    &:invalid {
      &::-webkit-datetime-edit,
      &::-webkit-datetime-edit-fields-wrapper,
      &::-webkit-datetime-edit-text,
      &::-webkit-datetime-edit-month-field,
      &::-webkit-datetime-edit-day-field,
      &::-webkit-datetime-edit-year-field,
      &::-webkit-datetime-edit-hour-field,
      &::-webkit-datetime-edit-minute-field,
      &::-webkit-datetime-edit-second-field {
        color: transparent !important;
        opacity: 0 !important;
      }
    }
    
    /* Show custom placeholder when no value is set */
    &[type="date"]:invalid::before,
    &[type="time"]:invalid::before {
      content: attr(data-placeholder);
      color: #a0aec0;
      font-style: italic;
      position: absolute;
      top: 50%;
      left: 1rem;
      transform: translateY(-50%);
      pointer-events: none;
      z-index: 1;
    }
  }
`;

const Select = styled.select<{ $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'body')};
  padding: 1rem 1.25rem;
  border: 2px solid rgba(226, 232, 240, 0.8);
  border-radius: 12px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #8b5cf6;
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }
`;

const GenerateButton = styled.button<{ $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'body')};
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
  }
  
  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const ToggleLabel = styled.label<{ $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'body')};
  font-size: 1rem;
  font-weight: 500;
  color: #2d3748;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ToggleSwitch = styled.div<{ $active: boolean }>`
  position: relative;
  width: 50px;
  height: 24px;
  background: ${props => props.$active ? '#8b5cf6' : '#cbd5e0'};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.$active ? '26px' : '2px'};
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

const ToggleInput = styled.input`
  display: none;
`;

export default function TodayFortune() {
  const navigate = useNavigate();
  const { t, language } = useI18n();
  const [fortune, setFortune] = useState<FortuneResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [userInput, setUserInput] = useState<UserInput>({
    name: '',
    birthDate: '',
    birthTime: '',
    nationality: '' // 더 이상 사용하지 않지만 호환성을 위해 유지
  });
  const [birthTimeUnknown, setBirthTimeUnknown] = useState(false);

  // Helper function to get proper locale for date/time inputs
  const getInputLocale = () => {
    // Force English locale for date/time inputs to prevent browser localization
    return 'en-US';
  };
  
  useEffect(() => {
    // 페이지 진입 시 상단으로 스크롤
    window.scrollTo(0, 0);
    
    // Set document language for better browser compatibility
    document.documentElement.lang = getInputLocale();
    
    // Set custom placeholder for date/time inputs
    const setCustomPlaceholders = () => {
      const dateInput = document.getElementById('birthDate') as HTMLInputElement;
      const timeInput = document.getElementById('birthTime') as HTMLInputElement;
      
      if (dateInput) {
        // Force English locale and prevent browser localization
        dateInput.setAttribute('lang', 'en-US');
        dateInput.setAttribute('data-locale', 'en-US');
        dateInput.setAttribute('data-placeholder', t('datePlaceholder'));
        dateInput.setAttribute('title', t('datePlaceholder'));
        
        // Remove any existing placeholder to prevent conflicts
        dateInput.removeAttribute('placeholder');
        
        // Force English format by setting a temporary value and clearing it
        const originalValue = dateInput.value;
        dateInput.value = '';
        if (originalValue) {
          dateInput.value = originalValue;
        }
      }
      
      if (timeInput) {
        // Force English locale and prevent browser localization
        timeInput.setAttribute('lang', 'en-US');
        timeInput.setAttribute('data-locale', 'en-US');
        timeInput.setAttribute('data-placeholder', t('timePlaceholder'));
        timeInput.setAttribute('title', t('timePlaceholder'));
        
        // Remove any existing placeholder to prevent conflicts
        timeInput.removeAttribute('placeholder');
        
        // Force English format by setting a temporary value and clearing it
        const originalValue = timeInput.value;
        timeInput.value = '';
        if (originalValue) {
          timeInput.value = originalValue;
        }
      }
    };
    
    // Set placeholders after a short delay to ensure DOM is ready
    setTimeout(setCustomPlaceholders, 100);
  }, [language, t]);
  
  const handleInputChange = (field: keyof UserInput, value: string) => {
    setUserInput(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerateFortune = async () => {
    // 입력 검증
    if (!userInput.name || !userInput.birthDate || (!userInput.birthTime && !birthTimeUnknown)) {
      alert(t('pleaseEnterAllInformation'));
      return;
    }

    setLoading(true);
    setShowForm(false);
    
    // 운세 생성 시뮬레이션 (2초 대기)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 실제 운세 생성
    const fortuneResult = generateFortune(userInput);
    setFortune(fortuneResult);
    setLoading(false);
  };

  const handleBack = () => {
    navigate('/');
  };
  
  const handleShareFortune = () => {
    if (!fortune) return;
    
    const shareText = `🍀 ${t('todayFortune')}\n\n${fortune.overall}\n\n💕 ${t('loveFortune')}: ${fortune.love}\n💼 ${t('businessFortune')}: ${fortune.business}\n🏥 ${t('healthFortune')}: ${fortune.health}\n💰 ${t('wealthFortune')}: ${fortune.wealth}\n\n🍀 ${t('luckyColor')}: ${fortune.luckyColor}\n🔢 ${t('luckyNumber')}: ${fortune.luckyNumber}\n🧭 ${t('luckyDirection')}: ${fortune.luckyDirection}\n🎯 ${t('todayAction')}: ${fortune.luckyAction}\n🍽️ ${t('todayFood')}: ${fortune.food}\n🔑 ${t('todayKeyword')}: ${fortune.keyword}\n💡 ${t('todayAdvice')}: ${fortune.advice}\n\n#${t('todayFortune')} #K-Saju #${t('fortune')}`;
    
    if (navigator.share) {
      // 네이티브 공유 기능 사용 (모바일)
      navigator.share({
        title: t('todayFortune'),
        text: shareText,
        url: window.location.href
      }).catch(console.error);
    } else if (navigator.clipboard) {
      // 클립보드에 복사 (데스크톱)
      navigator.clipboard.writeText(shareText).then(() => {
        alert(t('fortuneCopiedToClipboard'));
      }).catch(() => {
        // 클립보드 실패 시 대체 방법
        handleFallbackShare(shareText);
      });
    } else {
      // 대체 방법
      handleFallbackShare(shareText);
    }
  };
  
  const handleFallbackShare = (text: string) => {
    // 텍스트 영역을 생성하여 사용자가 수동으로 복사할 수 있게 함
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      alert(t('fortuneCopiedToClipboard'));
    } catch (err) {
      alert(t('cannotCopyFortune'));
    }
    
    document.body.removeChild(textArea);
  };
  
  const handleBookConsultation = () => {
    navigate('/locations');
  };

  
  if (loading) {
    return (
      <Container $language={language} lang={language}>
        <ContentWrapper>
          <Header>
            <BackButton onClick={handleBack}>‹ {t('backToHome')}</BackButton>
            <FortuneIcon>🔮</FortuneIcon>
            <Title $language={language}>{t('fortuneAnalyzing')}</Title>
            <Subtitle $language={language}>{t('creatingYourSpecialFortune')}</Subtitle>
          </Header>
          <LoadingSpinner />
        </ContentWrapper>
      </Container>
    );
  }

  if (showForm) {
    return (
      <Container $language={language} lang={language}>
        <ContentWrapper>
          <Header>
            <BackButton onClick={handleBack}>‹ {t('backToHome')}</BackButton>
            <FortuneIcon>🔮</FortuneIcon>
            <Title $language={language}>{t('todayFortune')}</Title>
            <Subtitle $language={language}>{t('enterYourInfoForPersonalizedFortune')}</Subtitle>
          </Header>
          
          <InputForm lang={language}>
            <FormTitle $language={language}>📝 {t('personalInfoInput')}</FormTitle>
            <FormGrid>
              {/* 첫 번째 행: 이름 */}
              <FormGroup>
                <Label $language={language} htmlFor="name">{t('name')} *</Label>
                <Input
                  $language={language}
                  id="name"
                  type="text"
                  value={userInput.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder={t('enterYourName')}
                />
              </FormGroup>
              
              {/* 첫 번째 행: 생년월일 */}
              <FormGroup>
                <Label $language={language} htmlFor="birthDate">{t('birthDate')} *</Label>
                <Input
                  $language={language}
                  id="birthDate"
                  type="date"
                  value={userInput.birthDate}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  lang="en-US"
                  data-locale="en-US"
                  data-placeholder={t('datePlaceholder')}
                  required
                />
              </FormGroup>
              
              {/* 두 번째 행: 출생시간 */}
              <FormGroup>
                <Label $language={language} htmlFor="birthTime">{t('birthTime')} *</Label>
                <Input
                  $language={language}
                  id="birthTime"
                  type="time"
                  value={userInput.birthTime}
                  onChange={(e) => handleInputChange('birthTime', e.target.value)}
                  lang="en-US"
                  data-locale="en-US"
                  data-placeholder={t('timePlaceholder')}
                  disabled={birthTimeUnknown}
                  required={!birthTimeUnknown}
                />
              </FormGroup>
              
              {/* 두 번째 행: 출생시간 모름 토글 */}
              <FormGroup>
                <ToggleContainer>
                  <ToggleLabel $language={language} htmlFor="birthTimeUnknown">
                    <ToggleInput
                      type="checkbox"
                      id="birthTimeUnknown"
                      checked={birthTimeUnknown}
                      onChange={(e) => {
                        setBirthTimeUnknown(e.target.checked);
                        if (e.target.checked) {
                          handleInputChange('birthTime', '');
                        }
                      }}
                    />
                    <ToggleSwitch $active={birthTimeUnknown} />
                    {t('birthTimeUnknown')}
                  </ToggleLabel>
                </ToggleContainer>
              </FormGroup>
            </FormGrid>
            
            <GenerateButton $language={language} onClick={handleGenerateFortune}>
              🔮 {t('generateFortune')}
            </GenerateButton>
          </InputForm>
        </ContentWrapper>
      </Container>
    );
  }
  
  if (!fortune) {
    return (
      <Container $language={language} lang={language}>
        <ContentWrapper>
          <Header>
            <BackButton onClick={handleBack}>‹ {t('backToHome')}</BackButton>
            <Title $language={language}>{t('cannotLoadFortune')}</Title>
            <Subtitle $language={language}>{t('pleaseTryAgainLater')}</Subtitle>
          </Header>
          <ActionButtons>
            <Button $language={language} onClick={handleBack}>{t('goHome')}</Button>
            <Button $language={language} $variant="primary" onClick={() => window.location.reload()}>
              {t('tryAgain')}
            </Button>
          </ActionButtons>
        </ContentWrapper>
      </Container>
    );
  }
  
  return (
    <Container $language={language} lang={language}>
      <ContentWrapper>
        <Header>
          <BackButton onClick={handleBack}>‹ {t('backToHome')}</BackButton>
          <FortuneIcon>🍀</FortuneIcon>
          <Title $language={language}>{t('todayFortune')}</Title>
          <Subtitle $language={language}>{t('aiAnalyzedYourSpecialFortune')}</Subtitle>
        </Header>
        
        <FortuneCard>
          <FortuneTitle $language={language}>✨ {t('overallFortune')}</FortuneTitle>
          <FortuneContent $language={language}>{fortune.overall}</FortuneContent>
        </FortuneCard>
        
        <FortuneDetails>
          <FortuneDetailCard>
            <DetailTitle $language={language}>💕 {t('loveFortune')}</DetailTitle>
            <DetailContent $language={language}>{fortune.love}</DetailContent>
          </FortuneDetailCard>
          
          <FortuneDetailCard>
            <DetailTitle $language={language}>💼 {t('businessFortune')}</DetailTitle>
            <DetailContent $language={language}>{fortune.business}</DetailContent>
          </FortuneDetailCard>
          
          <FortuneDetailCard>
            <DetailTitle $language={language}>🏥 {t('healthFortune')}</DetailTitle>
            <DetailContent $language={language}>{fortune.health}</DetailContent>
          </FortuneDetailCard>
          
          <FortuneDetailCard>
            <DetailTitle $language={language}>💰 {t('wealthFortune')}</DetailTitle>
            <DetailContent $language={language}>{fortune.wealth}</DetailContent>
          </FortuneDetailCard>
        </FortuneDetails>
        
        <LuckyElements>
          <LuckyTitle $language={language}>🍀 {t('todayLuckyElements')}</LuckyTitle>
          <LuckyGrid>
            <LuckyItem>
              <LuckyEmoji>🎨</LuckyEmoji>
              <LuckyLabel $language={language}>{t('luckyColor')}</LuckyLabel>
              <LuckyValue $language={language}>{fortune.luckyColor}</LuckyValue>
            </LuckyItem>
            
            <LuckyItem>
              <LuckyEmoji>🔢</LuckyEmoji>
              <LuckyLabel $language={language}>{t('luckyNumber')}</LuckyLabel>
              <LuckyValue $language={language}>{fortune.luckyNumber}</LuckyValue>
            </LuckyItem>
            
            <LuckyItem>
              <LuckyEmoji>🧭</LuckyEmoji>
              <LuckyLabel $language={language}>{t('luckyDirection')}</LuckyLabel>
              <LuckyValue $language={language}>{fortune.luckyDirection}</LuckyValue>
            </LuckyItem>
            
            <LuckyItem>
              <LuckyEmoji>🍽️</LuckyEmoji>
              <LuckyLabel $language={language}>{t('todayFood')}</LuckyLabel>
              <LuckyValue $language={language}>{fortune.food}</LuckyValue>
            </LuckyItem>
            
            <LuckyItem>
              <LuckyEmoji>🔑</LuckyEmoji>
              <LuckyLabel $language={language}>{t('todayKeyword')}</LuckyLabel>
              <LuckyValue $language={language}>{fortune.keyword}</LuckyValue>
            </LuckyItem>
            
            <LuckyItem>
              <LuckyEmoji>🎯</LuckyEmoji>
              <LuckyLabel $language={language}>{t('todayAction')}</LuckyLabel>
              <LuckyValue $language={language}>{fortune.luckyAction}</LuckyValue>
            </LuckyItem>
          </LuckyGrid>
        </LuckyElements>
        
        <FortuneCard>
          <FortuneTitle $language={language}>💡 {t('todayAdvice')}</FortuneTitle>
          <FortuneContent $language={language}>{fortune.advice}</FortuneContent>
        </FortuneCard>
        
        <ActionButtons>
          <Button $language={language} onClick={handleShareFortune}>
            📤 {t('shareResult')}
          </Button>
          <Button $language={language} $variant="primary" onClick={handleBookConsultation}>
            {t('getDetailedConsultation')}
          </Button>
        </ActionButtons>
      </ContentWrapper>
    </Container>
  );
}
