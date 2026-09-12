import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { useI18n } from '../i18n/i18n';
import { generateKoreanName, type NameGenerationResponse } from '../services/openai';

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

const Container = styled.div`
  min-height: 100vh;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #533483 75%, #7209b7 100%);
  position: relative;
  padding: 2rem 0;
  
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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label<{ $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'body')};
  font-weight: 600;
  color: #2d3748;
  font-size: 1rem;
  margin-bottom: 0.5rem;
`;

const Required = styled.span`
  color: #ef4444;
  margin-left: 0.25rem;
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
`;

const Select = styled.select`
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  background: white;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const RadioGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin-top: 0.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  padding: 1.25rem;
  border: 2px solid rgba(226, 232, 240, 0.6);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(139, 92, 246, 0.3);
    background: rgba(255, 255, 255, 0.8);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
`;

const RadioInput = styled.input`
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
  accent-color: #8b5cf6;
`;

const RadioText = styled.span<{ $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'body')};
  font-size: 1rem;
  color: #2d3748;
  font-weight: 500;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  margin-top: 3rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const Button = styled.button<{ $variant?: 'primary'; $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'body')};
  padding: 1rem 2.5rem;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 160px;
  
  ${props => props.$variant === 'primary' 
    ? `
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
      
      &:hover:not(:disabled) {
        background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
      }
    `
    : `
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
    `
  }
  
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

const ResultContainer = styled.div`
  text-align: center;
  padding: 2rem 0;
`;

const ResultTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
`;

const NameCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 15px;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
`;

const KoreanName = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const PronunciationSection = styled.div`
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
`;

const PronunciationTitle = styled.div`
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const PronunciationRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const PronunciationLabel = styled.span`
  font-size: 0.85rem;
  opacity: 0.8;
  min-width: 60px;
`;

const PronunciationText = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
`;

const NameMeaning = styled.div`
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 1rem;
`;

const NameDetails = styled.div`
  font-size: 0.95rem;
  opacity: 0.8;
  line-height: 1.5;
`;

const ShareButton = styled.button<{ $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'body')};
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 160px;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
  }
`;

const NewNameButton = styled.button<{ $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'body')};
  background: rgba(255, 255, 255, 0.8);
  color: #4a5568;
  border: 2px solid rgba(226, 232, 240, 0.8);
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 160px;
  backdrop-filter: blur(10px);
  
  &:hover {
    background: rgba(255, 255, 255, 0.95);
    border-color: rgba(139, 92, 246, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

// 주민등록증 스타일 카드
const IDCard = styled.div`
  background: linear-gradient(135deg, #faf8f3 0%, #f5f2e8 100%);
  border: 2px solid #d4af37;
  border-radius: 12px;
  padding: 1.5rem;
  margin: 0 auto 3rem;
  max-width: 800px;
  width: 100%;
  aspect-ratio: 16/10;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  position: relative;
  overflow: hidden;
  
  @media (max-width: 768px) {
    aspect-ratio: auto;
    min-height: auto;
    padding: 1rem;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 15% 15%, rgba(212, 175, 55, 0.05) 0%, transparent 40%),
      radial-gradient(circle at 85% 85%, rgba(212, 175, 55, 0.05) 0%, transparent 40%),
      radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 60%);
    pointer-events: none;
  }
`;

const IDCardHeader = styled.div`
  text-align: left;
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
`;

const IDCardSubtitle = styled.p<{ $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'body')};
  font-size: 0.8rem;
  color: #8b4513;
  margin: 0.3rem 0 0 0;
  opacity: 0.9;
  font-weight: 500;
`;

const IDCardContent = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  position: relative;
  z-index: 1;
  margin-bottom: 0.5rem;
  min-height: 280px;
  height: calc(100% - 80px);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
    height: auto;
    min-height: auto;
    margin-bottom: 0.5rem;
  }
`;

const IDCardLeft = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  padding: 0.5rem 0;
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 1rem 0;
  }
`;

const IDCardRight = styled.div`
  flex: 0.6;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const IDCardTitle = styled.h2<{ $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'heading')};
  font-size: 2.2rem;
  font-weight: 800;
  color: #2c1810;
  margin: 0 0 1.5rem 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  letter-spacing: 0.5px;
  
  @media (max-width: 768px) {
    font-size: 1.4rem;
    margin: 0 0 0.6rem 0;
  }
`;

const IDCardName = styled.h3<{ $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'heading')};
  font-size: 2.8rem;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0 0 1rem 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  letter-spacing: 0.5px;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
    margin: 0 0 0.6rem 0;
  }
`;

const IDCardNameWithHanja = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    margin-bottom: 0.3rem;
  }
`;

const IDCardHanja = styled.span<{ $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'body')};
  font-size: 2.4rem;
  color: #2c1810;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`;

const IDCardInfo = styled.div`
  margin-bottom: 1rem;
  padding: 0.3rem 0;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  @media (max-width: 768px) {
    margin-bottom: 0.2rem;
  }
`;

const IDCardLabel = styled.span<{ $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'body')};
  font-size: 1.1rem;
  color: #8b4513;
  font-weight: 600;
  display: block;
  margin-bottom: 0.3rem;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    margin-bottom: 0.2rem;
  }
`;

const IDCardValue = styled.span<{ $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'body')};
  font-size: 1.4rem;
  color: #2c1810;
  font-weight: 600;
  display: block;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const IDCardPhoto = styled.div`
  width: 170px;
  height: 220px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 3px solid #d4af37;
  border-radius: 8px;
  margin: 0 auto 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDE0MCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNDAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik03MCA1MEM3MCA0NS41ODE3IDczLjU4MTcgNDIgNzggNDJINjJDNjYuNDE4MyA0MiA3MCA0NS41ODE3IDcwIDUwVjU0SDcwVjUwWiIgZmlsbD0iI0Q5RDlEOSIvPgo8cGF0aCBkPSJNNzAgNThDNzAgNTMuNTgxNyA3My41ODE3IDUwIDc4IDUwSDYyQzY2LjQxODMgNTAgNzAgNTMuNTgxNyA3MCA1OFY2Mkg3MFY1OFoiIGZpbGw9IiM4MDgwODAiLz4KPHA9dGggZD0iTTcwIDY2QzcwIDYxLjU4MTcgNzMuNTgxNyA1OCA3OCA1OEg2MkM2Ni40MTgzIDU4IDcwIDYxLjU4MTcgNzAgNjZWNzBINzBWNjZaIiBmaWxsPSIjODA4MDgwIi8+CjxwYXRoIGQ9Ik03MCA3NEM3MCA2OS41ODE3IDczLjU4MTcgNjYgNzggNjZINjJDNjYuNDE4MyA2NiA3MCA2OS41ODE3IDcwIDc0Vjc4SDcwVjc0WiIgZmlsbD0iI0Q5RDlEOSIvPgo8cGF0aCBkPSJNNzAgODJDNzAgNzcuNTgxNyA3My41ODE3IDc0IDc4IDc0SDYyQzY2LjQxODMgNzQgNzAgNzcuNTgxNyA3MCA4MlY4Nkg3MFY4MloiIGZpbGw9IiM4MDgwODAiLz4KPHA9dGggZD0iTTcwIDkwQzcwIDg1LjU4MTcgNzMuNTgxNyA4MiA3OCA4Mkg2MkM2Ni40MTgzIDgyIDcwIDg1LjU4MTcgNzAgOTBWOTRINzBWOTBaIiBmaWxsPSIjODA4MDgwIi8+CjxwYXRoIGQ9Ik03MCA5OEM3MCA5My41ODE3IDczLjU4MTcgOTAgNzggOTBINjJDNjYuNDE4MyA5MCA3MCA5My41ODE3IDcwIDk4VjEwMkg3MFY5OFoiIGZpbGw9IiNGNUY1RjUiLz4KPHA9dGggZD0iTTcwIDEwNkM3MCAxMDEuNTgxNyA3My41ODE3IDk4IDc4IDk4SDYyQzY2LjQxODMgOTggNzAgMTAxLjU4MTcgNzAgMTA2VjExMEg3MFYxMDZaIiBmaWxsPSIjODA4MDgwIi8+CjxwYXRoIGQ9Ik03MCAxMTRDNzAgMTA5LjU4MTcgNzMuNTgxNyAxMDYgNzggMTA2SDYyQzY2LjQxODMgMTA2IDcwIDEwOS41ODE3IDcwIDExNFYxMThINzBWMTE0WiIgZmlsbD0iIzgwODA4MCIvPgo8cGF0aCBkPSJNNzAgMTIyQzcwIDExNy41ODE3IDczLjU4MTcgMTE0IDc4IDExNEg2MkM2Ni40MTgzIDExNCA3MCAxMTcuNTgxNyA3MCAxMjJWMjI2SDcwVjEyMloiIGZpbGw9IiM4MDgwODAiLz4KPHA9dGggZD0iTTcwIDEzMEM3MCAxMjUuNTgxNyA3My41ODE3IDEyMiA3OCAxMjJINjJDNjYuNDE4MyAxMjIgNzAgMTI1LjU4MTcgNzAgMTMwVjEzNEg3MFYxMzBaIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik03MCAxMzhDNzAgMTMzLjU4MTcgNzMuNTgxNyAxMzAgNzggMTMwSDYyQzY2LjQxODMgMTMwIDcwIDEzMy41ODE3IDcwIDEzOFYxNDJINzBWMTM4WiIgZmlsbD0iIzgwODA4MCIvPgo8cGF0aCBkPSJNNzAgMTQ2QzcwIDE0MS41ODE3IDczLjU4MTcgMTM4IDc4IDEzOEg2MkM2Ni40MTgzIDEzOCA3MCAxNDEuNTgxNyA3MCAxNDZWMTUwSDcwVjE0NloiIGZpbGw9IiM4MDgwODAiLz4KPC9zdmc+');
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
  }
`;

const IDCardFooter = styled.div`
  text-align: center;
  margin-top: 0.3rem;
  padding-top: 0.3rem;
  border-top: 2px solid #d4af37;
  position: absolute;
  bottom: 0.5rem;
  left: 0;
  right: 0;
  
  @media (max-width: 768px) {
    position: static;
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid #d4af37;
  }
`;

const IDCardIssueDate = styled.p<{ $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'body')};
  font-size: 1.3rem;
  color: #2c1810;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const IDCardAuthority = styled.div`
  text-align: center;
  margin-top: 0.5rem;
`;

const IDCardAuthorityText = styled.p<{ $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'body')};
  font-size: 1.1rem;
  color: #8b4513;
  margin: 0;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

// 이름 설명 섹션
const NameExplanation = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const ExplanationTitle = styled.h3<{ $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'heading')};
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 1rem 0;
  text-align: center;
`;

const ExplanationText = styled.p<{ $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'body')};
  font-size: 1.1rem;
  color: #4a5568;
  line-height: 1.7;
  margin: 0;
  text-align: center;
`;

interface FormData {
  originalName: string;
  gender: string;
  personality: string[];
}

const NameCreation: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useI18n();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState<FormData>({
    originalName: '',
    gender: '',
    personality: []
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NameGenerationResponse | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  useEffect(() => {
    // 페이지 진입 시 상단으로 스크롤
    window.scrollTo(0, 0);
    
    // URL에서 name 파라미터를 읽어와서 폼에 미리 채우기
    const nameFromUrl = searchParams.get('name');
    if (nameFromUrl) {
      setFormData(prev => ({
        ...prev,
        originalName: nameFromUrl
      }));
    }
  }, [searchParams]);

  const handleInputChange = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 에러 메시지 제거
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handlePersonalityChange = (personality: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      personality: checked 
        ? [...prev.personality, personality]
        : prev.personality.filter(p => p !== personality)
    }));
    
    // 에러 메시지 제거
    if (errors.personality) {
      setErrors(prev => ({
        ...prev,
        personality: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    if (!formData.originalName.trim()) {
      newErrors.originalName = '이름을 입력해주세요';
    }
    if (!formData.gender) {
      newErrors.gender = '성별을 선택해주세요';
    }
    if (formData.personality.length === 0) {
      newErrors.personality = '성격을 하나 이상 선택해주세요';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Supabase Edge Function을 통해 한국 이름 생성
      const nameResult = await generateKoreanName(formData);
      setResult(nameResult);
    } catch (error) {
      console.error('이름 생성 오류:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      alert(`이름 생성 중 오류가 발생했습니다: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleShare = () => {
    const shareText = `🎭 ${t('koreanNameCreation')} ${t('result')}\n\n📝 ${t('generatedName')}: ${result?.name_hangul} (${result?.romanization})\n${t('hanja')}: ${result?.name_hanja}\n${result?.meaning}\n\n#한국이름 #이름작명 #K-Saju`;
    
    if (navigator.share) {
      navigator.share({
        title: t('koreanNameCreation'),
        text: shareText,
        url: window.location.href
      }).catch(console.error);
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        alert('이름 작명 결과가 클립보드에 복사되었습니다!');
      }).catch(() => {
        alert('공유할 수 없습니다. 직접 복사해주세요.');
      });
    } else {
      alert('공유할 수 없습니다. 직접 복사해주세요.');
    }
  };

  const handleNewName = () => {
    setResult(null);
    setFormData({
      originalName: '',
      gender: '',
      personality: []
    });
  };

  if (loading) {
    return (
      <Container>
        <ContentWrapper>
          <Header>
            <BackButton onClick={handleBack}>‹ {t('backToHome')}</BackButton>
            <Title $language={language}>{t('koreanNameGenerating')}</Title>
            <Subtitle $language={language}>{t('aiIsCreatingKoreanName')}</Subtitle>
          </Header>
          
          <LoadingSpinner />
        </ContentWrapper>
      </Container>
    );
  }

  if (result) {
    return (
      <Container>
        <ContentWrapper>
          <Header>
            <BackButton onClick={handleBack}>‹ {t('backToHome')}</BackButton>
            <Title $language={language}>{t('koreanNameComplete')}</Title>
            <Subtitle $language={language}>{t('yourSpecialKoreanName')}</Subtitle>
          </Header>
          
          <ResultContainer>
            {/* 주민등록증 스타일 카드 */}
            <IDCard>
              <IDCardContent>
                <IDCardLeft>
                  <IDCardTitle $language={language}>주민등록증</IDCardTitle>
                  
                  <IDCardNameWithHanja>
                    <IDCardName $language={language}>{result.name_hangul}</IDCardName>
                    <IDCardHanja $language={language}>({result.name_hanja})</IDCardHanja>
                  </IDCardNameWithHanja>
                  
                  <IDCardInfo>
                    <IDCardLabel $language={language}>로마자</IDCardLabel>
                    <IDCardValue $language={language}>{result.romanization}</IDCardValue>
                  </IDCardInfo>
                </IDCardLeft>
                
                <IDCardRight>
                  <IDCardPhoto />
                </IDCardRight>
              </IDCardContent>
              
              <IDCardFooter>
                <IDCardIssueDate $language={language}>{new Date().toLocaleDateString('ko-KR')}</IDCardIssueDate>
                <IDCardAuthority>
                  <IDCardAuthorityText $language={language}>K-Saju 작명센터</IDCardAuthorityText>
                </IDCardAuthority>
              </IDCardFooter>
            </IDCard>
            
            {/* 이름 설명 섹션 */}
            <NameExplanation>
              <ExplanationTitle $language={language}>이름의 의미</ExplanationTitle>
              <ExplanationText $language={language}>{result.meaning}</ExplanationText>
            </NameExplanation>
            
            <ButtonGroup>
              <ShareButton $language={language} onClick={handleShare}>📤 {t('shareResult')}</ShareButton>
              <NewNameButton $language={language} onClick={handleNewName}>{t('getNewName')}</NewNameButton>
            </ButtonGroup>
          </ResultContainer>
        </ContentWrapper>
      </Container>
    );
  }

  return (
    <Container>
      <ContentWrapper>
        <Header>
          <BackButton onClick={handleBack}>‹ {t('backToHome')}</BackButton>
            <Title $language={language}>{t('koreanNameCreation')}</Title>
            <Subtitle $language={language}>{t('aiWillCreateKoreanName')}</Subtitle>
        </Header>
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label $language={language}>{t('name')} <Required>*</Required></Label>
            <Input
              $language={language}
              type="text"
              value={formData.originalName}
              onChange={(e) => handleInputChange('originalName', e.target.value)}
              placeholder={t('enterYourName')}
            />
            {errors.originalName && <ErrorMessage>{errors.originalName}</ErrorMessage>}
          </FormGroup>
          
          <FormGroup>
            <Label $language={language}>{t('gender')} <Required>*</Required></Label>
            <RadioGroup>
              <RadioLabel>
                <RadioInput
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                />
                <RadioText $language={language}>{t('male')}</RadioText>
              </RadioLabel>
              <RadioLabel>
                <RadioInput
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                />
                <RadioText $language={language}>{t('female')}</RadioText>
              </RadioLabel>
            </RadioGroup>
            {errors.gender && <ErrorMessage>{errors.gender}</ErrorMessage>}
          </FormGroup>
          
          <FormGroup>
            <Label $language={language}>{t('personality')} <Required>*</Required></Label>
            <RadioGroup>
              <RadioLabel>
                <RadioInput
                  type="checkbox"
                  value="active"
                  checked={formData.personality.includes('active')}
                  onChange={(e) => handlePersonalityChange('active', e.target.checked)}
                />
                <RadioText $language={language}>{t('personalityActive')}</RadioText>
              </RadioLabel>
              <RadioLabel>
                <RadioInput
                  type="checkbox"
                  value="calm"
                  checked={formData.personality.includes('calm')}
                  onChange={(e) => handlePersonalityChange('calm', e.target.checked)}
                />
                <RadioText $language={language}>{t('personalityCalm')}</RadioText>
              </RadioLabel>
              <RadioLabel>
                <RadioInput
                  type="checkbox"
                  value="creative"
                  checked={formData.personality.includes('creative')}
                  onChange={(e) => handlePersonalityChange('creative', e.target.checked)}
                />
                <RadioText $language={language}>{t('personalityCreative')}</RadioText>
              </RadioLabel>
              <RadioLabel>
                <RadioInput
                  type="checkbox"
                  value="kind"
                  checked={formData.personality.includes('kind')}
                  onChange={(e) => handlePersonalityChange('kind', e.target.checked)}
                />
                <RadioText $language={language}>{t('personalityKind')}</RadioText>
              </RadioLabel>
              <RadioLabel>
                <RadioInput
                  type="checkbox"
                  value="strong"
                  checked={formData.personality.includes('strong')}
                  onChange={(e) => handlePersonalityChange('strong', e.target.checked)}
                />
                <RadioText $language={language}>{t('personalityStrong')}</RadioText>
              </RadioLabel>
              <RadioLabel>
                <RadioInput
                  type="checkbox"
                  value="wise"
                  checked={formData.personality.includes('wise')}
                  onChange={(e) => handlePersonalityChange('wise', e.target.checked)}
                />
                <RadioText $language={language}>{t('personalityWise')}</RadioText>
              </RadioLabel>
            </RadioGroup>
            {errors.personality && <ErrorMessage>{errors.personality}</ErrorMessage>}
          </FormGroup>
          
          <ButtonGroup>
            <Button type="button" onClick={handleBack} $language={language}>{t('cancel')}</Button>
            <Button type="submit" $variant="primary" $language={language}>{t('createKoreanName')}</Button>
          </ButtonGroup>
        </Form>
      </ContentWrapper>
    </Container>
  );
};

export default NameCreation;
