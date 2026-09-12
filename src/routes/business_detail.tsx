import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useI18n } from '../i18n/i18n';
import { supabase } from '../supabase';
import homeBg from '../assets/home_bg.jpg';
import { 
  StarIcon as StarIconOutline,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  ClockIcon,
  CameraIcon,
  ChevronUpIcon,
  SparklesIcon,
  HeartIcon,
  CurrencyDollarIcon,
  BriefcaseIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  MinusIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

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

const Container = styled.div<{ $language: string }>`
  min-height: 100vh;
  background: #ffffff;
  padding: 0;
  margin: 0;
  width: 100%;
  position: relative;
  overflow-x: hidden;
  font-family: ${props => getFontFamily(props.$language, 'body')};
  
  @media (max-width: 768px) {
    padding: 0;
  }
`;

const ContentWrapper = styled.div<{ $isNavFixed: boolean; $language: string }>`
  max-width: 1120px;
  margin: 0 auto;
  background: #ffffff;
  padding: 0;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    padding: 0;
    display: flex;
    flex-direction: column;
  }
`;

// 이미지 갤러리 - Airbnb 스타일
const ImageGallery = styled.div`
  position: relative;
  height: 480px;
  overflow: hidden;
  border-radius: 12px;
  margin: 24px;
  
  @media (max-width: 768px) {
    height: 320px;
    margin: 16px;
    border-radius: 8px;
  }
  
  @media (max-width: 480px) {
    height: 280px;
    margin: 12px;
    border-radius: 6px;
  }
`;

const GalleryContainer = styled.div<{ translateX: number }>`
  display: flex;
  gap: 8px;
  transition: transform 0.5s ease;
  transform: translateX(${props => props.translateX}%);
`;

const MainImage = styled.div<{ $imageUrl?: string }>`
  background: ${props => props.$imageUrl ? `url(${props.$imageUrl})` : '#f7f7f7'};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 8px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #717171;
  font-size: 1rem;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.2s ease;
  grid-row: 1 / 3;
  
  &:hover {
    filter: brightness(0.96);
  }
  
  @media (max-width: 768px) {
    grid-row: 1;
    font-size: 0.9rem;
  }
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 8px;
  height: 100%;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
  }
`;

const ThumbnailImage = styled.div<{ $imageUrl?: string }>`
  background: ${props => props.$imageUrl ? `url(${props.$imageUrl})` : '#f7f7f7'};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 8px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #717171;
  font-size: 0.9rem;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    filter: brightness(0.96);
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const ShowAllPhotosButton = styled.button`
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #222222;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  @media (max-width: 768px) {
    bottom: 12px;
    right: 12px;
    padding: 6px 12px;
    font-size: 13px;
  }
`;

/* removed legacy MoreOverlayButton variants */


const GalleryNavButton = styled.button<{ position: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${props => props.position === 'left' ? 'left: 16px;' : 'right: 16px;'}
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.7);
    transform: translateY(-50%) scale(1.1);
  }
`;

// 업체 정보 헤더
const BusinessInfoHeader = styled.div`
  padding: 2rem 0;
  border-bottom: 1px solid #e5e7eb;
`;

const BusinessName = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
`;

const BusinessAddress = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 1rem;
  margin-bottom: 1rem;
`;

const BusinessRating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const StarIcon = styled.span`
  color: #fbbf24;
  font-size: 1.2rem;
`;

const BusinessRatingText = styled.span`
  color: #374151;
  font-weight: 500;
`;

const BusinessInfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const BusinessHours = styled.div`
  color: #059669;
  font-weight: 500;
  font-size: 1rem;
`;

// Airbnb 스타일 네비게이션
const ScrollNavigation = styled.div<{ isFixed: boolean }>`
  display: flex;
  align-items: center;
  padding: 16px 24px;
  background: #ffffff;
  border-bottom: 1px solid #ebebeb;
  position: ${props => props.isFixed ? 'fixed' : 'sticky'};
  top: ${props => props.isFixed ? '80px' : '80px'};
  left: 0;
  right: 0;
  z-index: 100;
  box-shadow: ${props => props.isFixed ? '0 1px 2px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05)' : 'none'};
  transition: all 0.2s ease;
  
  @media (max-width: 768px) {
    padding: 12px 16px;
    top: ${props => props.isFixed ? '60px' : '60px'};
  }
`;

const NavButtons = styled.div`
  display: flex;
  gap: 8px;
  
  @media (max-width: 768px) {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    
    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const NavButton = styled.button<{ $active?: boolean }>`
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: ${props => props.$active ? '#222222' : '#717171'};
  font-weight: ${props => props.$active ? '600' : '400'};
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  border-radius: 8px;
  border-bottom: ${props => props.$active ? '2px solid #222222' : '2px solid transparent'};
  
  &:hover {
    color: #222222;
    background: #f7f7f7;
  }
  
  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 14px;
    flex-shrink: 0;
  }
`;

const NavPriceSection = styled.div<{ showBottomPrice: boolean }>`
  display: ${props => props.showBottomPrice ? 'none' : 'flex'};
  align-items: center;
  gap: 16px;
  margin-left: auto;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const PriceDisplay = styled.div`
  font-weight: 700;
  font-size: 18px;
  color: #111827;
  display: flex;
  align-items: baseline;
  gap: 4px;
  
  .currency {
    font-size: 22px;
    font-weight: 800;
  }
  
  .period {
    font-size: 14px;
    font-weight: 500;
    color: #6b7280;
  }
`;

const BookingButton = styled.button`
  background: #6210CC;
  color: white;
  border: 2px solid rgba(139, 92, 246, 0.4);
  border-radius: 999px;
  padding: 12px 20px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
  
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
      rgba(255, 255, 255, 0.4) 50%,
      transparent 80%
    );
    transform: rotate(45deg);
    animation: shine 3s ease-in-out infinite;
  }
  
  @keyframes shine {
    0% {
      left: -150%;
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      left: 150%;
      opacity: 0;
    }
  }
  
  &:hover {
    background: #4c1d95;
    border-color: rgba(139, 92, 246, 0.7);
    transform: translateY(-1px);
  }
`;

// 하단 고정 바 (모바일 + 데스크톱)
const MobileBottomBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  border-top: 1px solid #ebebeb;
  padding: 16px 24px;
  display: none;
  align-items: center;
  justify-content: space-between;
  z-index: 200;
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    display: flex;
  }
  
  /* 데스크톱에서도 스크롤 시 표시 */
  @media (min-width: 769px) {
    display: ${() => 'flex'};
  }
`;

const MobilePriceDisplay = styled.div`
  font-weight: 700;
  font-size: 18px;
  color: #111827;
  display: flex;
  align-items: baseline;
  gap: 4px;
  
  .currency {
    font-size: 22px;
    font-weight: 800;
  }
  
  .period {
    font-size: 14px;
    font-weight: 600;
    color: #6b7280;
  }
`;

const MobileBookingButton = styled.button`
  background: #6210CC;
  color: white;
  border: 2px solid rgba(139, 92, 246, 0.4);
  border-radius: 999px;
  padding: 12px 20px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  max-width: 200px;
  position: relative;
  overflow: hidden;
  
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
      rgba(255, 255, 255, 0.4) 50%,
      transparent 80%
    );
    transform: rotate(45deg);
    animation: shine 3s ease-in-out infinite;
  }
  
  @keyframes shine {
    0% {
      left: -150%;
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      left: 150%;
      opacity: 0;
    }
  }
  
  &:hover {
    background: #4c1d95;
    border-color: rgba(139, 92, 246, 0.7);
  }
`;

// 위로 올라가기 버튼
const ScrollToTopButton = styled.button<{ visible: boolean; showBottomPrice: boolean }>`
  position: fixed;
  bottom: ${props => props.showBottomPrice ? '88px' : '24px'}; /* couple with bottom bar */
  right: ${props => {
    if (!props.showBottomPrice) return '24px';
    // Align to right edge of bottom bar: 50% + (1120px/2) - 24px = 50% + 536px
    return 'calc(50% - 536px)';
  }};
  width: 50px;
  height: 50px;
  background: #6210CC;
  border: 2px solid rgba(139, 92, 246, 0.4);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  display: ${props => props.visible ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  
  &:hover {
    background: #4c1d95;
    border-color: rgba(139, 92, 246, 0.7);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
  }
  
  @media (max-width: 768px) {
    bottom: ${props => props.showBottomPrice ? '88px' : '24px'};
    right: ${props => {
      if (!props.showBottomPrice) return '16px';
      // Mobile: align to right edge of content
      return '16px';
    }};
    width: 45px;
    height: 45px;
    font-size: 1.1rem;
  }
  
`;

// Copy success toast notification
const CopyToast = styled.div<{ visible: boolean }>`
  position: fixed;
  top: 20px;
  right: 20px;
  background: #059669;
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateX(${props => props.visible ? '0' : '100%'});
  opacity: ${props => props.visible ? '1' : '0'};
  transition: all 0.3s ease;
  z-index: 1100;
  display: flex;
  align-items: center;
  gap: 8px;
  
  @media (max-width: 768px) {
    top: 10px;
    right: 10px;
    font-size: 13px;
    padding: 10px 14px;
  }
`;

/* removed legacy PriceBookingSection and duplicate BookingButton */

// Airbnb 스타일 메인 레이아웃
const MainLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 80px;
  padding: 0 24px;
  margin: 48px 0;
  
  @media (max-width: 1128px) {
    gap: 40px;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 32px;
    padding: 0 16px;
    margin: 24px 0;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  
  @media (max-width: 768px) {
    order: 1;
  }
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  
  @media (max-width: 768px) {
    order: 2;
  }
`;

// 깔끔한 정보 카드
const InfoCard = styled.div`
  background: #ffffff;
  border: 1px solid #dddddd;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }
`;

const CardTitle = styled.h3`
  font-size: 22px;
  font-weight: 600;
  color: #222222;
  margin-bottom: 24px;
  line-height: 1.3;
`;

const BusinessInfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
  gap: 1rem;
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const BusinessInfoLabel = styled.span`
  color: #6b7280;
  font-weight: 500;
  min-width: 100px;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    min-width: auto;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }
`;

const BusinessInfoValue = styled.span`
  color: #6b7280;
  font-weight: 400;
  font-size: 14px;
  white-space: pre-line;
  word-break: break-word;
  line-height: 1.5;
  max-width: 200px;
  cursor: pointer;
  transition: color 0.2s ease;
  user-select: text;
  
  &:hover {
    color: #374151;
    background-color: #f9fafb;
    border-radius: 4px;
    padding: 2px 4px;
  }
  
  &:active {
    background-color: #e5e7eb;
  }
  
  @media (max-width: 768px) {
    max-width: 100%;
    font-size: 13px;
    flex: 1;
  }
`;

// 예약 카드 (Airbnb 스타일)
const BookingCard = styled.div`
  background: #ffffff;
  border: 1px solid #dddddd;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  position: sticky;
  top: 24px;
`;

const ReviewSummaryHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const OverallScore = styled.div`
  font-size: 3rem;
  font-weight: 700;
  color: #1f2937;
`;

const ScoreLabel = styled.div`
  color: #6b7280;
  font-size: 0.9rem;
  margin-top: 0.25rem;
  white-space: nowrap;
`;

const ReviewCount = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #3b82f6;
  font-size: 0.9rem;
`;

const ReviewCategories = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const ReviewCategory = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
`;

const CategoryName = styled.span`
  color: #374151;
`;

const CategoryScore = styled.span`
  color: #1f2937;
  font-weight: 600;
`;


// 간단한 섹션
const Section = styled.section`
  padding-bottom: 24px;
  border-bottom: 1px solid #ebebeb;
  
  &:last-child {
    border-bottom: none;
  }
`;

const MapContainer = styled.div`
  width: 100%;
  height: 320px;
  border-radius: 12px;
  overflow: hidden;
  background: #f3f4f6;
  position: relative;
`;

const MapAddressOverlay = styled.div`
  position: absolute;
  bottom: 12px;
  left: 12px;
  right: 12px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.95);
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 12px;
  color: #111827;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
`;

const MapNotice = styled.div`
  background: #fffbeb;
  color: #92400e;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
`;

const MapButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1rem;
  
  &:hover {
    background: #2563eb;
  }
`;

const LocationRating = styled.div`
  text-align: center;
`;

const LocationScore = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #059669;
  margin-bottom: 0.25rem;
`;

const LocationLabel = styled.div`
  color: #6b7280;
  font-size: 0.9rem;
`;

// 섹션 스타일
const ContentSection = styled.section`
  margin-bottom: 4rem;
  scroll-margin-top: 100px;
  position: relative;
  z-index: 2;
`;

const SectionHeader = styled.h2<{ $language?: string }>`
  font-family: ${props => props.$language ? getFontFamily(props.$language, 'heading') : 'inherit'};
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 24px;
  line-height: 1.3;
`;

const BackButton = styled.button`
  position: absolute;
  top: 2rem;
  left: 2rem;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
  }
`;

const BusinessIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const BusinessTitle = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 0.5rem;
`;

const BusinessSubtitle = styled.p`
  font-size: 1.2rem;
  text-align: center;
  opacity: 0.9;
`;

const Content = styled.div`
  padding: 3rem;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

/* removed legacy duplicates: MainInfo/Sidebar/Section/MysticalSectionTitle */

const Description = styled.p`
  font-size: 1.1rem;
  line-height: 1.6;
  color: #4b5563;
  margin-bottom: 1.5rem;
`;

const FeaturesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
  
  &:last-child {
    border-bottom: none;
  }
`;

const FeatureIcon = styled.span`
  font-size: 1.2rem;
`;

const FeatureText = styled.span`
  color: #374151;
`;

const PriceCard = styled.div`
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  margin-bottom: 2rem;
`;

const Price = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #059669;
  margin-bottom: 0.5rem;
`;

const PriceDescription = styled.p`
  color: #6b7280;
  margin-bottom: 1.5rem;
`;

const RatingSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const Stars = styled.div`
  display: flex;
  gap: 2px;
`;

const Star = styled.span<{ filled: boolean }>`
  color: ${props => props.filled ? '#fbbf24' : '#e5e7eb'};
  font-size: 1.5rem;
`;

const RatingText = styled.span`
  color: #6b7280;
  font-size: 1.1rem;
`;

const BookButton = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px -5px rgba(102, 126, 234, 0.4);
  }
`;

const ContactInfo = styled.div`
  background: #f3f4f6;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ContactIcon = styled.span`
  font-size: 1.2rem;
  color: #6b7280;
`;

const ContactText = styled.span`
  color: #374151;
`;

const ReviewsSection = styled.div`
  margin-top: 3rem;
  padding-top: 3rem;
  border-top: 2px solid #e5e7eb;
`;

const ReviewsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ReviewCard = styled.div`
  background: #f9fafb;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ReviewerName = styled.span`
  font-weight: 600;
  color: #1f2937;
`;

const ReviewDate = styled.span`
  color: #6b7280;
  font-size: 0.9rem;
`;

const ReviewRating = styled.div`
  display: flex;
  gap: 2px;
  margin-bottom: 0.5rem;
`;

const ReviewText = styled.p`
  color: #4b5563;
  line-height: 1.5;
`;


// 이미지 모달 스타일
const ImageModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const ImageModalCloseButton = styled.button`
  position: absolute;
  top: 2rem;
  right: 2rem;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 1.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
  }
`;

const ImageModalMainImage = styled.div<{ $imageUrl?: string }>`
  width: 80%;
  max-width: 800px;
  height: 60vh;
  background: ${props => props.$imageUrl ? `url(${props.$imageUrl})` : '#f3f4f6'};
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 1.5rem;
  font-weight: 600;
  position: relative;
  overflow: hidden;
  margin-bottom: 8rem; /* 썸네일 공간 확보 */
`;

const ImageModalThumbnails = styled.div`
  display: flex;
  gap: 1rem;
  max-width: 60%;
  overflow-x: auto;
  padding: 1rem 0;
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1rem;
  z-index: 1001;
  
  &::-webkit-scrollbar {
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
  }
`;

const ImageModalThumbnail = styled.div<{ $active?: boolean; $imageUrl?: string }>`
  width: 120px;
  height: 80px;
  background: ${props => props.$imageUrl ? `url(${props.$imageUrl})` : '#f3f4f6'};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid ${props => props.$active ? '#3b82f6' : 'transparent'};
  flex-shrink: 0;
  
  &:hover {
    transform: scale(1.05);
    border-color: #3b82f6;
  }
`;

// 구글 맵 훅
function useGoogleMaps(apiKey?: string) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!apiKey) return;
    if (window.google && (window as any).google.maps) {
      setLoaded(true);
      return;
    }
    const id = "gmaps-sdk";
    if (document.getElementById(id)) return;
    const s = document.createElement("script");
    s.id = id;
    s.async = true;
    s.defer = true;
    s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async&v=weekly&libraries=geometry,places`;
    s.onload = () => setLoaded(true);
    s.onerror = () => setLoaded(false);
    document.head.appendChild(s);
  }, [apiKey]);
  return loaded;
}

// DB 스키마에 맞춘 타입 정의
interface BusinessFeature {
  id: number;
  icon: string;
  text: string;
}

interface BusinessContact {
  phone: string;
  email: string;
  address: string;
  website?: string;
}

interface BusinessReview {
  id: number;
  name: string;
  date: string;
  rating: number;
  text: string;
}

interface Business {
  id: string; // UUID string
  title: string;
  title_ko?: string;
  title_en?: string;
  subtitle: string;
  subtitle_ko?: string;
  subtitle_en?: string;
  description: string;
  description_ko?: string;
  description_en?: string;
  main_image_url?: string;
  gallery_images?: string[];
  icon?: string;
  features: BusinessFeature[];
  base_price: number;
  price_description: string;
  currency: string;
  rating: number;
  review_count: number;
  contact: BusinessContact;
  business_hours: string;
  business_hours_ko?: string;
  business_hours_en?: string;
  reviews: BusinessReview[];
  created_at: string;
  updated_at: string;
}

// Component for formatting description with proper headings and line breaks
const FormattedDescription = ({ description }: { description: string }) => {
  const formatText = (text: string) => {
    // Split by sections and format with proper headings
    const sections = text.split(/(?=🔮|⭐|💡|🏆)/);
    
    return sections.map((section, index) => {
      if (!section.trim()) return null;
      
      // Handle emoji headings
      const emojiHeadingRegex = /(🔮|⭐|💡|🏆)\s*\*\*([^*]+)\*\*/;
      const match = section.match(emojiHeadingRegex);
      
      if (match) {
        const [fullMatch, emoji, heading] = match;
        const content = section.replace(fullMatch, '').trim();
        
        return (
          <div key={index} style={{ marginBottom: '2rem' }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '700', 
              color: '#1f2937', 
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '1.5rem' }}>{emoji}</span>
              {heading}
            </h3>
            <div style={{ 
              color: '#374151', 
              lineHeight: '1.7',
              fontSize: '16px'
            }}>
              {formatContent(content)}
            </div>
          </div>
        );
      } else {
        // Regular content without emoji heading
        return (
          <div key={index} style={{ 
            marginBottom: '1.5rem',
            color: '#374151', 
            lineHeight: '1.7',
            fontSize: '16px'
          }}>
            {formatContent(section)}
          </div>
        );
      }
    });
  };
  
  const formatContent = (content: string) => {
    // Handle numbered lists
    if (content.includes('1.') || content.includes('2.')) {
      const lines = content.split('\n').filter(line => line.trim());
      return (
        <ol style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
          {lines.map((line, i) => {
            const numberedMatch = line.match(/^\d+\.\s*\*\*([^*]+)\*\*:\s*(.+)/);
            if (numberedMatch) {
              const [, title, description] = numberedMatch;
              return (
                <li key={i} style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#1f2937' }}>{title}</strong>: {description}
                </li>
              );
            }
            return line.trim() ? <li key={i} style={{ marginBottom: '0.5rem' }}>{line.trim()}</li> : null;
          })}
        </ol>
      );
    }
    
    // Handle bullet points
    const lines = content.split('\n').filter(line => line.trim());
    return lines.map((line, i) => {
      if (line.startsWith('-') || line.startsWith('•')) {
        return (
          <div key={i} style={{ 
            marginBottom: '0.5rem',
            paddingLeft: '1rem',
            position: 'relative'
          }}>
            <span style={{ 
              position: 'absolute', 
              left: '0', 
              color: '#6366f1',
              fontWeight: 'bold'
            }}>•</span>
            {line.replace(/^[-•]\s*/, '').trim()}
          </div>
        );
      }
      return line.trim() ? (
        <p key={i} style={{ marginBottom: '0.75rem' }}>
          {line.trim()}
        </p>
      ) : null;
    });
  };
  
  return <div>{formatText(description)}</div>;
};

// Mock data - 실제로는 Supabase DB에서 가져올 데이터
const mockBusinessData: Record<string, Business> = {
  "1": {
    id: "1",
    title: "AI 사주 분석",
    subtitle: "인공지능 기반 정확한 사주 해석",
    description: "최신 AI 기술을 활용하여 정확하고 상세한 사주 분석을 제공합니다. 전통 사주학과 현대 기술이 만나 더욱 정밀한 운세를 알려드립니다.",
    main_image_url: "/images/ai-saju-hero.jpg",
    gallery_images: [
      "/images/saju-reception.jpg",
      "/images/saju-consultation.jpg", 
      "/images/saju-lounge.jpg"
    ],
    icon: "🔮",
    features: [
      { id: 1, icon: "🤖", text: "AI 기반 정확한 분석" },
      { id: 2, icon: "📊", text: "상세한 운세 리포트" },
      { id: 3, icon: "🔮", text: "다양한 관점의 해석" },
      { id: 4, icon: "💡", text: "개인 맞춤 조언" },
      { id: 5, icon: "📱", text: "모바일 최적화" }
    ],
    base_price: 29000,
    price_description: "1회 상담 기준",
    currency: "KRW",
    rating: 4.8,
    review_count: 127,
    business_hours: "Open 09:00 - 21:00",
    contact: {
      phone: "02-1234-5678",
      email: "info@sajuai.com",
      address: "서울특별시 강남구 역삼동 123-45",
      website: "https://www.sajuai.com"
    },
    reviews: [
      {
        id: 1,
        name: "김사주",
        date: "2024.01.15",
        rating: 5,
        text: "정말 정확한 분석이었습니다. AI가 이렇게 정밀할 줄 몰랐어요!"
      },
      {
        id: 2,
        name: "이운세",
        date: "2024.01.10",
        rating: 5,
        text: "친구 추천으로 받았는데 정말 만족스럽습니다. 상세한 설명도 좋고요."
      },
      {
        id: 3,
        name: "박점술",
        date: "2024.01.08",
        rating: 4,
        text: "가격 대비 품질이 좋습니다. 다음에도 이용하고 싶어요."
      },
      {
        id: 4,
        name: "최명리",
        date: "2024.01.05",
        rating: 5,
        text: "전문적이고 상세한 분석이 인상적이었습니다. 추천합니다!"
      },
      {
        id: 5,
        name: "정사주",
        date: "2024.01.03",
        rating: 4,
        text: "AI 분석이 정말 정확해서 놀랐어요. 다음에도 꼭 이용할 예정입니다."
      },
      {
        id: 6,
        name: "한운세",
        date: "2024.01.01",
        rating: 5,
        text: "친절한 상담과 정확한 분석으로 만족스러운 경험이었습니다."
      },
      {
        id: 7,
        name: "오점술",
        date: "2023.12.28",
        rating: 4,
        text: "가격 대비 품질이 우수합니다. 주변 지인들에게도 추천했어요."
      },
      {
        id: 8,
        name: "윤사주",
        date: "2023.12.25",
        rating: 5,
        text: "AI 기술과 전통 사주학의 만남이 정말 인상적이었습니다."
      },
      {
        id: 9,
        name: "강명리",
        date: "2023.12.22",
        rating: 4,
        text: "상세한 리포트와 친절한 설명이 좋았습니다. 만족해요!"
      },
      {
        id: 10,
        name: "임운세",
        date: "2023.12.20",
        rating: 5,
        text: "정확한 분석과 실용적인 조언이 도움이 많이 되었습니다."
      },
      {
        id: 11,
        name: "조사주",
        date: "2023.12.18",
        rating: 4,
        text: "AI 분석이 정말 놀라웠습니다. 전통 사주와의 조화가 인상적이에요."
      },
      {
        id: 12,
        name: "신명리",
        date: "2023.12.15",
        rating: 5,
        text: "친절한 상담과 정확한 분석으로 만족스러운 경험이었습니다."
      },
      {
        id: 13,
        name: "백운세",
        date: "2023.12.12",
        rating: 4,
        text: "가격 대비 품질이 우수합니다. 주변 지인들에게도 추천했어요."
      },
      {
        id: 14,
        name: "송점술",
        date: "2023.12.10",
        rating: 5,
        text: "상세한 리포트와 친절한 설명이 좋았습니다. 만족해요!"
      },
      {
        id: 15,
        name: "허사주",
        date: "2023.12.08",
        rating: 4,
        text: "AI 기술과 전통 사주학의 만남이 정말 인상적이었습니다."
      },
      {
        id: 16,
        name: "노운세",
        date: "2023.12.05",
        rating: 5,
        text: "정말 만족스러운 서비스였습니다. 추천합니다!"
      },
      {
        id: 17,
        name: "서점술",
        date: "2023.12.03",
        rating: 4,
        text: "AI 분석이 정확해서 놀랐어요. 다음에도 이용할 예정입니다."
      },
      {
        id: 18,
        name: "권사주",
        date: "2023.12.01",
        rating: 5,
        text: "친절한 상담과 정확한 분석으로 만족스러운 경험이었습니다."
      },
      {
        id: 19,
        name: "남운세",
        date: "2023.11.28",
        rating: 4,
        text: "AI 분석이 정말 정확해서 놀랐어요. 다음에도 이용할 예정입니다."
      },
      {
        id: 20,
        name: "도점술",
        date: "2023.11.25",
        rating: 5,
        text: "정말 만족스러운 서비스였습니다. 추천합니다!"
      },
      {
        id: 21,
        name: "라사주",
        date: "2023.11.22",
        rating: 4,
        text: "친절한 상담과 정확한 분석으로 만족스러운 경험이었습니다."
      },
      {
        id: 22,
        name: "마명리",
        date: "2023.11.20",
        rating: 5,
        text: "AI 기술과 전통 사주학의 만남이 정말 인상적이었습니다."
      },
      {
        id: 23,
        name: "바운세",
        date: "2023.11.18",
        rating: 4,
        text: "상세한 리포트와 친절한 설명이 좋았습니다. 만족해요!"
      },
      {
        id: 24,
        name: "사점술",
        date: "2023.11.15",
        rating: 5,
        text: "정확한 분석과 실용적인 조언이 도움이 많이 되었습니다."
      }
    ],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z"
  }
};

export default function BusinessDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useI18n();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reviews, setReviews] = useState<BusinessReview[]>([]);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [isNavFixed, setIsNavFixed] = useState(false);
  const [showBottomPrice, setShowBottomPrice] = useState(false);
  const [guestCount, setGuestCount] = useState(1);
  const [showAllReviews, setShowAllReviews] = useState(false);
  
  // pseudo reviews (fallback when DB has no reviews) - localized by language
  const getPseudoReviews = (lang: string): BusinessReview[] => {
    const reviewsByLanguage: Record<string, BusinessReview[]> = {
      ko: [
        { id: 1001, name: '홍길동', date: '2024.12.01', rating: 5, text: '정말 친절하고 정확한 상담이었어요. 다음에도 이용할게요.' },
        { id: 1002, name: '김철수', date: '2024.11.20', rating: 4, text: '전반적으로 만족합니다. 설명이 이해하기 쉬웠어요.' },
        { id: 1003, name: '이영희', date: '2024.11.05', rating: 5, text: '정확도가 높아서 놀랐어요! 추천합니다.' },
        { id: 1004, name: '박민수', date: '2024.10.12', rating: 5, text: '가격 대비 최고의 경험이었습니다. 재방문 의사 있어요.' }
      ],
      en: [
        { id: 1001, name: 'John Smith', date: '2024.12.01', rating: 5, text: 'Really kind and accurate consultation. I will use this service again.' },
        { id: 1002, name: 'Mike Johnson', date: '2024.11.20', rating: 4, text: 'Overall satisfied. The explanation was easy to understand.' },
        { id: 1003, name: 'Sarah Wilson', date: '2024.11.05', rating: 5, text: 'Surprised by the high accuracy! I recommend it.' },
        { id: 1004, name: 'David Brown', date: '2024.10.12', rating: 5, text: 'Best experience for the price. I plan to return.' }
      ],
      zh: [
        { id: 1001, name: '李明', date: '2024.12.01', rating: 5, text: '真的很亲切，咨询也很准确。下次还会使用。' },
        { id: 1002, name: '王刚', date: '2024.11.20', rating: 4, text: '整体很满意。解释很容易理解。' },
        { id: 1003, name: '张丽', date: '2024.11.05', rating: 5, text: '准确度很高，让我很惊讶！推荐给大家。' },
        { id: 1004, name: '陈伟', date: '2024.10.12', rating: 5, text: '性价比最高的体验。有再次光临的意愿。' }
      ],
      ja: [
        { id: 1001, name: '田中太郎', date: '2024.12.01', rating: 5, text: '本当に親切で正確な相談でした。また利用します。' },
        { id: 1002, name: '佐藤花子', date: '2024.11.20', rating: 4, text: '全体的に満足しています。説明が分かりやすかったです。' },
        { id: 1003, name: '鈴木一郎', date: '2024.11.05', rating: 5, text: '正確度が高くて驚きました！おすすめします。' },
        { id: 1004, name: '高橋美穂', date: '2024.10.12', rating: 5, text: 'コスパ最高の体験でした。再訪問したいです。' }
      ],
      es: [
        { id: 1001, name: 'Carlos García', date: '2024.12.01', rating: 5, text: 'Realmente amable y consulta precisa. Volveré a usar este servicio.' },
        { id: 1002, name: 'María López', date: '2024.11.20', rating: 4, text: 'En general satisfecho. La explicación fue fácil de entender.' },
        { id: 1003, name: 'José Martín', date: '2024.11.05', rating: 5, text: '¡Sorprendido por la alta precisión! Lo recomiendo.' },
        { id: 1004, name: 'Ana Rodríguez', date: '2024.10.12', rating: 5, text: 'La mejor experiencia por el precio. Planeo volver.' }
      ]
    };
    
    return reviewsByLanguage[lang] || reviewsByLanguage.ko;
  };
  
  // 구글 맵 관련
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapObj = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const loaded = useGoogleMaps(apiKey);
  
  const getPerSessionShort = (lang: string) => {
    switch (lang) {
      case 'ko': return '/ 회';
      case 'en': return '/ session';
      case 'ja': return '/ 回';
      case 'zh': return '/ 次';
      case 'es': return '/ sesión';
      default: return '/ session';
    }
  };

  const getServiceText = (service: string, lang: string) => {
    const services: Record<string, Record<string, string>> = {
      'accurate_saju': { ko: '정확한 사주 상담', en: 'Accurate Saju Reading', ja: '正確な四柱推命', zh: '准确的四柱推命', es: 'Lectura Precisa de Saju' },
      'fortune_analysis': { ko: '운세 분석', en: 'Fortune Analysis', ja: '運勢分析', zh: '运势分析', es: 'Análisis de Fortuna' },
      'compatibility': { ko: '궁합 상담', en: 'Compatibility Reading', ja: '相性占い', zh: '姻缘咨询', es: 'Consulta de Compatibilidad' },
      'career_fortune': { ko: '직업 운세', en: 'Career Fortune', ja: '仕事運', zh: '事业运势', es: 'Fortuna Profesional' },
      'love_fortune': { ko: '연애 운세', en: 'Love Fortune', ja: '恋愛運', zh: '爱情运势', es: 'Fortuna en el Amor' },
      'wealth_fortune': { ko: '재물 운세', en: 'Wealth Fortune', ja: '金運', zh: '财运', es: 'Fortuna Financiera' }
    };
    return services[service]?.[lang] || services[service]?.['en'] || service;
  };

  const getNoChargeText = (lang: string) => {
    switch (lang) {
      case 'ko': return '아직 결제되지 않습니다';
      case 'en': return "You won't be charged yet";
      case 'ja': return 'まだ請求されません';
      case 'zh': return '暂不收费';
      case 'es': return 'Aún no se te cobrará';
      default: return "You won't be charged yet";
    }
  };

  const getGuestsText = (lang: string) => {
    switch (lang) {
      case 'ko': return '인원';
      case 'en': return 'Guests';
      case 'ja': return 'ゲスト';
      case 'zh': return '客人';
      case 'es': return 'Huéspedes';
      default: return 'Guests';
    }
  };

  const getLocalizedText = (key: string, lang: string) => {
    const translations: Record<string, Record<string, string>> = {
      'basic_information': { 
        ko: '기본 정보', 
        en: 'Basic Information', 
        ja: '基本情報', 
        zh: '基本信息', 
        es: 'Información Básica' 
      },
      'address': { 
        ko: '주소', 
        en: 'Address', 
        ja: '住所', 
        zh: '地址', 
        es: 'Dirección' 
      },
      'rating': { 
        ko: '평점', 
        en: 'Rating', 
        ja: '評価', 
        zh: '评分', 
        es: 'Calificación' 
      },
      'reviews': { 
        ko: '리뷰', 
        en: 'reviews', 
        ja: 'レビュー', 
        zh: '评论', 
        es: 'reseñas' 
      },
      'business_hours': { 
        ko: '영업시간', 
        en: 'Business Hours', 
        ja: '営業時間', 
        zh: '营业时间', 
        es: 'Horario de Atención' 
      },
      'phone': { 
        ko: '전화번호', 
        en: 'Phone', 
        ja: '電話番号', 
        zh: '电话', 
        es: 'Teléfono' 
      },
      'email': { 
        ko: '이메일', 
        en: 'Email', 
        ja: 'メール', 
        zh: '邮箱', 
        es: 'Email' 
      },
      'website': { 
        ko: '웹사이트', 
        en: 'Website', 
        ja: 'ウェブサイト', 
        zh: '网站', 
        es: 'Sitio Web' 
      }
    };
    return translations[key]?.[lang] || translations[key]?.['en'] || key;
  };


  // Helper function to detect language of review text
  const detectReviewLanguage = (text: string): string => {
    // Korean characters
    if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text)) return 'ko';
    // Japanese characters (Hiragana, Katakana, Kanji)
    if (/[ひらがなカタカナ一-龯]/.test(text) || /[ひ-ゞ]/.test(text) || /[ァ-ヾ]/.test(text)) return 'ja';
    // Chinese characters (different from Japanese context)
    if (/[一-龯]/.test(text) && !/[ひらがなカタカナ]/.test(text) && /[，。！？]/.test(text)) return 'zh';
    // Spanish characters
    if (/[ñáéíóúü¡¿]/.test(text) || /\b(el|la|de|en|un|una|es|muy|con|que|se|por|para|como|más|su|año|años|hace|sido|tiene|puede|solo|desde|donde|cuando|porque|entre|sobre|hasta|durante|después|antes|mientras|aunque|sino|pero|cada|todo|todos|todas|esta|este|estos|estas|aquí|ahí|allí|cómo|cuál|cuáles|cuándo|cuánto|cuántos|cuántas|dónde|quién|quiénes|qué)\b/i.test(text)) return 'es';
    // English (default for Latin script)
    if (/[a-zA-Z]/.test(text)) return 'en';
    
    return 'ko'; // fallback
  };

  // Filter reviews by current language
  const getFilteredReviews = (allReviews: BusinessReview[]) => {
    const reviewsByLanguage = allReviews.filter(review => 
      detectReviewLanguage(review.text) === language
    );
    
    // If no reviews in current language, fall back to Korean
    if (reviewsByLanguage.length === 0) {
      return allReviews.filter(review => detectReviewLanguage(review.text) === 'ko');
    }
    
    return reviewsByLanguage;
  };

  // Copy to clipboard function with toast feedback
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showCopyFeedback();
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showCopyFeedback();
    }
  };

  // Show copy success feedback
  const showCopyFeedback = () => {
    setShowCopyToast(true);
    setTimeout(() => {
      setShowCopyToast(false);
    }, 2000); // Hide after 2 seconds
  };
  
  // 총 5개의 이미지 (사진 5개 + 더보기)
  const totalImages = 5;
  const maxIndex = 4; // 사진 4개까지 보이고 5번째에 더보기
  
  // 슬라이드 계산 (개별 사진 단위로)
  const getTranslateX = () => {
    const isMobile = window.innerWidth <= 768;
    return -currentImageIndex * (100 / (isMobile ? 2 : 4)); // 모바일: 2개씩, PC: 4개씩 보이므로
  };

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        setLoading(true);
        
        // Supabase에서 locations 데이터 가져오기 (모든 localized fields 포함)
        const { data: locationData, error: locationError } = await supabase
          .from('locations')
          .select(`
            *, 
            title_ko, title_en, title_zh, title_ja, title_es,
            subtitle_ko, subtitle_en, subtitle_zh, subtitle_ja, subtitle_es,
            description_ko, description_en, description_zh, description_ja, description_es,
            business_hours_ko, business_hours_en, business_hours_zh, business_hours_ja, business_hours_es,
            price_description_ko, price_description_en, price_description_zh, price_description_ja, price_description_es,
            tagline_ko, tagline_en, tagline_zh, tagline_ja, tagline_es
          `)
          .eq('id', id)
          .single();

        if (locationError) {
          console.error('Error fetching location:', locationError);
          setBusiness(null);
          return;
        }

        if (!locationData) {
          setBusiness(null);
          return;
        }

        // location_reviews에서 리뷰 데이터 가져오기
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('location_reviews')
          .select('*')
          .eq('location_id', id)
          .order('created_at', { ascending: false });

        if (reviewsError) {
          console.error('Error fetching reviews:', reviewsError);
        }

        // Helper function to get localized content based on current language
        const getLocalizedContent = (
          koreanField: string | undefined,
          englishField: string | undefined,
          chineseField: string | undefined,
          japaneseField: string | undefined,
          spanishField: string | undefined,
          fallback: string
        ) => {
          switch (language) {
            case 'ko':
              return koreanField || englishField || fallback;
            case 'en':
              return englishField || koreanField || fallback;
            case 'zh':
              return chineseField || koreanField || englishField || fallback;
            case 'ja':
              return japaneseField || koreanField || englishField || fallback;
            case 'es':
              return spanishField || englishField || koreanField || fallback;
            default:
              return englishField || koreanField || fallback;
          }
        };

        // Business 인터페이스에 맞게 데이터 변환
        const businessData: Business = {
          id: locationData.id,
          title: getLocalizedContent(
            locationData.title_ko,
            locationData.title_en,
            locationData.title_zh,
            locationData.title_ja,
            locationData.title_es,
            locationData.title || '사주 서비스'
          ),
          title_ko: locationData.title_ko,
          title_en: locationData.title_en,
          subtitle: getLocalizedContent(
            locationData.subtitle_ko,
            locationData.subtitle_en,
            locationData.subtitle_zh,
            locationData.subtitle_ja,
            locationData.subtitle_es,
            locationData.subtitle || '전통 사주와 현대 기술의 만남'
          ),
          subtitle_ko: locationData.subtitle_ko,
          subtitle_en: locationData.subtitle_en,
          description: getLocalizedContent(
            locationData.description_ko,
            locationData.description_en,
            locationData.description_zh,
            locationData.description_ja,
            locationData.description_es,
            locationData.description || '정확하고 상세한 사주 분석을 제공합니다.'
          ),
          description_ko: locationData.description_ko,
          description_en: locationData.description_en,
          main_image_url: locationData.main_image_url || locationData.image_url,
          gallery_images: locationData.gallery_images || [],
          icon: locationData.icon || '🔮',
          features: locationData.features || [],
          base_price: locationData.base_price || locationData.price || 29000,
          price_description: getLocalizedContent(
            locationData.price_description_ko,
            locationData.price_description_en,
            locationData.price_description_zh,
            locationData.price_description_ja,
            locationData.price_description_es,
            locationData.price_description || '1회 상담 기준'
          ),
          currency: locationData.currency || 'KRW',
          rating: locationData.rating || 4.5,
          review_count: locationData.review_count || 0,
          contact: {
            phone: locationData.phone || '02-1234-5678',
            email: locationData.email || 'info@saju.com',
            address: locationData.address || '서울특별시 강남구 역삼동',
            website: locationData.website
          },
          business_hours: getLocalizedContent(
            locationData.business_hours_ko,
            locationData.business_hours_en,
            locationData.business_hours_zh,
            locationData.business_hours_ja,
            locationData.business_hours_es,
            locationData.business_hours || 'Open 09:00 - 21:00'
          ),
          business_hours_ko: locationData.business_hours_ko,
          business_hours_en: locationData.business_hours_en,
          reviews: (reviewsData || []).map((review: any) => ({
            id: review.id,
            name: review.name,
            date: review.date,
            rating: review.rating,
            text: review.text
          })),
          created_at: locationData.created_at,
          updated_at: locationData.updated_at
        };

        setBusiness(businessData);
        const allReviews = (businessData.reviews && businessData.reviews.length > 0) ? businessData.reviews : getPseudoReviews(language);
        setReviews(allReviews);
        
        // Debug: Log the business data to check images
        console.log('Business Data:', {
          main_image_url: businessData.main_image_url,
          gallery_images: businessData.gallery_images,
          title: businessData.title
        });
      } catch (error) {
        console.error('Error fetching business:', error);
        setBusiness(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBusiness();
    }
  }, [id, language]);

  // 스크롤 감지 useEffect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollToTop(scrollTop > 300); // 300px 이상 스크롤하면 버튼 표시
      
      // nav bar가 화면에서 사라질 정도로 스크롤했을 때 고정
      // K-SAJU main nav bar 높이 + nav bar 자체 높이를 고려하여 200px로 설정
      setIsNavFixed(scrollTop > 200);
      
      // 가격과 예약 버튼을 하단에 고정 (nav bar가 사라질 정도로 스크롤했을 때)
      setShowBottomPrice(scrollTop > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleBook = async () => {
    try {
      // TEMPORARY: Skip login check for development
      // TODO: Re-enable authentication before production
      
      // Original authentication code (commented out):
      // const { data: { session } } = await supabase.auth.getSession();
      // if (!session) {
      //   alert('Please log in to make a reservation.');
      //   navigate('/sign-in');
      //   return;
      // }
      
      // Directly navigate to booking page (no auth required)
      navigate(`/business/${id}/booking`);
    } catch (error) {
      console.error('Error navigating to booking:', error);
      // Still navigate to booking page even if there's an error
      navigate(`/business/${id}/booking`);
    }
  };

  const handlePrevImage = () => {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      // 모바일: 2개씩 이동 (0 → 2 → 4)
      setCurrentImageIndex((prev) => {
        if (prev >= 2) return prev - 2;
        if (prev >= 1) return 0;
        return 0;
      });
    } else {
      // PC: 4개씩 이동 (0 → 4)
      setCurrentImageIndex((prev) => {
        if (prev >= 4) return prev - 4;
        return 0;
      });
    }
  };

  const handleNextImage = () => {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      // 모바일: 2개씩 이동 (0 → 2 → 4)
      setCurrentImageIndex((prev) => {
        if (prev === 0) return 2;
        if (prev === 2) return 4;
        return prev;
      });
    } else {
      // PC: 4개씩 이동 (0 → 4)
      setCurrentImageIndex((prev) => {
        if (prev === 0) return 4;
        return prev;
      });
    }
  };

  const handleMoreImages = () => {
    // 더보기 버튼 클릭 시 첫 번째 사진을 팝업으로 표시
    setSelectedImageIndex(0);
    setIsImageModalOpen(true);
  };

  const handleImageClick = (index: number) => {
    // 더보기 버튼을 클릭한 경우 (index 4) 첫 번째 사진을 선택
    const actualIndex = index === 4 ? 0 : index;
    setSelectedImageIndex(actualIndex);
    setIsImageModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsImageModalOpen(false);
  };

  const handleThumbnailClick = (index: number) => {
    setSelectedImageIndex(index);
  };


  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // 구글 맵 초기화
  useEffect(() => {
    console.log('Map initialization check:', { loaded, business: !!business, apiKey: !!apiKey });
    
    if (!apiKey) {
      setMapError('Google Maps API 키가 설정되지 않았습니다.');
      return;
    }
    
    if (!loaded) {
      console.log('Google Maps API not loaded yet');
      return;
    }
    
    if (!business) {
      console.log('Business data not loaded yet');
      return;
    }
    
    if (!mapRef.current) {
      console.log('Map container not ready');
      return;
    }
    
    if (!window.google || !window.google.maps || !window.google.maps.Geocoder) {
      console.log('Google Maps API not fully available:', {
        google: !!window.google,
        maps: !!(window.google && window.google.maps),
        geocoder: !!(window.google && window.google.maps && window.google.maps.Geocoder)
      });
      setMapError('Google Maps API가 완전히 로드되지 않았습니다.');
      return;
    }

    console.log('Initializing map for address:', business.contact.address);

    try {
      // 주소를 좌표로 변환 (Geocoding)
      const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: business.contact.address }, (results: any, status: any) => {
      console.log('Geocoding result:', { status, results });
      
      let location;
      
      if (status === 'OK' && results[0]) {
        location = results[0].geometry.location;
        console.log('Location found:', location.toString());
      } else {
        console.warn('Geocoding failed, using default location');
        // 기본 위치: 서울 강남구 중심
        location = new (window as any).google.maps.LatLng(37.5665, 126.978);
      }
      
      try {
        // 지도 초기화
        mapObj.current = new (window as any).google.maps.Map(mapRef.current, {
          center: location,
          zoom: 15,
          mapId: "d3fault",
          clickableIcons: false,
          disableDefaultUI: false,
          styles: [
            { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] },
            { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] }
          ]
        });

        // 마커 추가
        markerRef.current = new (window as any).google.maps.Marker({
          position: location,
          map: mapObj.current,
          title: business.title,
          animation: (window as any).google.maps.Animation.DROP
        });

        // 정보창 추가
        const infoWindow = new (window as any).google.maps.InfoWindow({
          content: `
            <div style="padding: 10px;">
              <h3 style="margin: 0 0 5px 0; color: #1f2937;">${business.title}</h3>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">${business.contact.address}</p>
              <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">${business.contact.phone}</p>
            </div>
          `
        });

        markerRef.current.addListener("click", () => {
          infoWindow.open(mapObj.current, markerRef.current);
        });

        setMapLoaded(true);
        setMapError(null);
        console.log('Map initialized successfully');
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError('지도를 초기화하는 중 오류가 발생했습니다.');
      }
    });
    } catch (error) {
      console.error('Error creating geocoder:', error);
      setMapError('Google Maps 초기화 중 오류가 발생했습니다.');
    }
  }, [loaded, business, apiKey]);

  const formatPrice = (price: number, currency: string) => {
    switch (currency) {
      case 'KRW':
        return `₩${price.toLocaleString()}`;
      case 'USD':
        return `$${price}`;
      case 'EUR':
        return `€${price}`;
      case 'JPY':
        return `¥${price}`;
      default:
        return `₩${price.toLocaleString()}`;
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star key={i} filled={i <= rating}>
          ★
        </Star>
      );
    }
    return stars;
  };

  // 리뷰 표시 로직 - 언어별 필터링 적용
  const filteredReviews = getFilteredReviews(reviews);
  const reviewsPerPage = 3;
  const totalReviews = filteredReviews.length;
  const displayedReviews = showAllReviews ? filteredReviews : filteredReviews.slice(0, reviewsPerPage);


  if (loading) {
    return (
      <Container $language={language}>
        <ContentWrapper $isNavFixed={isNavFixed} $language={language}>
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <p>{t('loading')}</p>
          </div>
        </ContentWrapper>
      </Container>
    );
  }

  if (!business) {
    return (
      <Container $language={language}>
        <ContentWrapper $isNavFixed={isNavFixed} $language={language}>
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <p>{t('businessNotFoundError')}</p>
          </div>
        </ContentWrapper>
      </Container>
    );
  }

  return (
    <Container $language={language}>
      <ContentWrapper $isNavFixed={isNavFixed} $language={language}>
        {/* Airbnb-style image gallery */}
        <ImageGallery>
          <ImageGrid>
            <MainImage 
              $imageUrl={business.main_image_url || business.gallery_images?.[0]}
              onClick={() => handleImageClick(0)}
            >
              {!business.main_image_url && !business.gallery_images?.[0] && t('mainPhoto')}
            </MainImage>
            <ThumbnailImage 
              $imageUrl={business.gallery_images?.[1]}
              onClick={() => handleImageClick(1)}
            >
              {!business.gallery_images?.[1] && `${t('photo')} 2`}
            </ThumbnailImage>
            <ThumbnailImage 
              $imageUrl={business.gallery_images?.[2]}
              onClick={() => handleImageClick(2)}
            >
              {!business.gallery_images?.[2] && `${t('photo')} 3`}
            </ThumbnailImage>
          </ImageGrid>
          <ShowAllPhotosButton onClick={handleMoreImages}>
            <CameraIcon style={{ width: 16, height: 16 }} />
            {t('showAllPhotos')}
          </ShowAllPhotosButton>
        </ImageGallery>

        {/* Airbnb-style main layout */}
        <MainLayout>
          <MainContent>
            {/* Business header */}
            <Section>
              <div style={{ marginBottom: '8px' }}>
                <h1 style={{ 
                  fontSize: '32px', 
                  fontWeight: '700', 
                  color: '#222222',
                  margin: 0,
                  lineHeight: '1.2',
                  fontFamily: getFontFamily(language, 'heading')
                }}>{business.title}</h1>
              </div>
            </Section>

            {/* Overview section */}
            <Section id="overview">
              <SectionHeader $language={language}>{t('overview')}</SectionHeader>
              <FormattedDescription description={business.description} />
            </Section>

            {/* Services section */}
            <Section id="amenities">
              <SectionHeader $language={language}>{t('services')}</SectionHeader>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div style={{ 
                  display: 'flex', alignItems: 'center', gap: '12px'
                }}>
                  <SparklesIcon style={{ width: 20, height: 20, color: '#6366f1' }} />
                  <span style={{ color: '#222222', fontSize: '16px' }}>{getServiceText('accurate_saju', language)}</span>
                </div>
                <div style={{ 
                  display: 'flex', alignItems: 'center', gap: '12px'
                }}>
                  <StarIconOutline style={{ width: 20, height: 20, color: '#f59e0b' }} />
                  <span style={{ color: '#222222', fontSize: '16px' }}>{getServiceText('fortune_analysis', language)}</span>
                </div>
                <div style={{ 
                  display: 'flex', alignItems: 'center', gap: '12px'
                }}>
                  <UserGroupIcon style={{ width: 20, height: 20, color: '#ec4899' }} />
                  <span style={{ color: '#222222', fontSize: '16px' }}>{getServiceText('compatibility', language)}</span>
                </div>
                <div style={{ 
                  display: 'flex', alignItems: 'center', gap: '12px'
                }}>
                  <BriefcaseIcon style={{ width: 20, height: 20, color: '#10b981' }} />
                  <span style={{ color: '#222222', fontSize: '16px' }}>{getServiceText('career_fortune', language)}</span>
                </div>
                <div style={{ 
                  display: 'flex', alignItems: 'center', gap: '12px'
                }}>
                  <HeartIcon style={{ width: 20, height: 20, color: '#ef4444' }} />
                  <span style={{ color: '#222222', fontSize: '16px' }}>{getServiceText('love_fortune', language)}</span>
                </div>
                <div style={{ 
                  display: 'flex', alignItems: 'center', gap: '12px'
                }}>
                  <CurrencyDollarIcon style={{ width: 20, height: 20, color: '#059669' }} />
                  <span style={{ color: '#222222', fontSize: '16px' }}>{getServiceText('wealth_fortune', language)}</span>
                </div>
              </div>
            </Section>
          </MainContent>

          <Sidebar>
            {/* Booking card */}
            <BookingCard>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 22, fontWeight: 700 }}>{formatPrice(business.base_price, business.currency)}</span>
                  <span style={{ fontSize: 16, color: '#717171' }}>{getPerSessionShort(language)}</span>
                </div>
                <div style={{ fontSize: 14, color: '#222222', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <StarIconSolid style={{ width: 16, height: 16, color: '#fbbf24' }} />
                  {business.rating} · {business.review_count} reviews
                </div>
              </div>
              
              {/* Guest counter */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ marginBottom: 12, fontSize: 16, fontWeight: 600, color: '#222222' }}>
                  {t('guests')}
                </div>
                <div style={{ border: '1px solid #dddddd', borderRadius: 8, padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <button
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      border: '1px solid #dddddd',
                      background: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: guestCount > 1 ? 'pointer' : 'not-allowed',
                      opacity: guestCount > 1 ? 1 : 0.5
                    }}
                    onClick={() => guestCount > 1 && setGuestCount(guestCount - 1)}
                  >
                    <MinusIcon style={{ width: 16, height: 16, color: '#666' }} />
                  </button>
                  <span style={{ fontSize: 16, fontWeight: 600, minWidth: 20, textAlign: 'center' }}>
                    {guestCount}
                  </span>
                  <button
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      border: '1px solid #dddddd',
                      background: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                    onClick={() => setGuestCount(guestCount + 1)}
                  >
                    <PlusIcon style={{ width: 16, height: 16, color: '#666' }} />
                  </button>
                </div>
              </div>
              
              <BookingButton style={{ width: '100%' }} onClick={handleBook}>{t('reserve')}</BookingButton>
              <div style={{ marginTop: 8, textAlign: 'center', fontSize: 13, color: '#717171' }}>
                {t('noChargeYet')}
              </div>
            </BookingCard>

            {/* Info card (right side, above map) */}
            <InfoCard>
              <CardTitle>{getLocalizedText('basic_information', language)}</CardTitle>
              <BusinessInfoItem>
                <BusinessInfoLabel style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MapPinIcon style={{ width: 16, height: 16, color: '#6b7280' }} />
                  {getLocalizedText('address', language)}
                </BusinessInfoLabel>
                <BusinessInfoValue onClick={() => copyToClipboard(business.contact.address)}>
                  {business.contact.address}
                </BusinessInfoValue>
              </BusinessInfoItem>
              <BusinessInfoItem>
                <BusinessInfoLabel style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <StarIconOutline style={{ width: 16, height: 16, color: '#6b7280' }} />
                  {getLocalizedText('rating', language)}
                </BusinessInfoLabel>
                <BusinessInfoValue onClick={() => copyToClipboard(`${business.rating} (${business.review_count} ${getLocalizedText('reviews', language)})`)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <StarIconSolid style={{ width: 16, height: 16, color: '#fbbf24' }} />
                    {business.rating} ({business.review_count} {getLocalizedText('reviews', language)})
                  </div>
                </BusinessInfoValue>
              </BusinessInfoItem>
              <BusinessInfoItem>
                <BusinessInfoLabel style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ClockIcon style={{ width: 16, height: 16, color: '#6b7280' }} />
                  {getLocalizedText('business_hours', language)}
                </BusinessInfoLabel>
                <BusinessInfoValue onClick={() => copyToClipboard(business.business_hours)}>
                  {business.business_hours}
                </BusinessInfoValue>
              </BusinessInfoItem>
              <BusinessInfoItem>
                <BusinessInfoLabel style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PhoneIcon style={{ width: 16, height: 16, color: '#6b7280' }} />
                  {getLocalizedText('phone', language)}
                </BusinessInfoLabel>
                <BusinessInfoValue onClick={() => copyToClipboard(business.contact.phone)}>
                  {business.contact.phone}
                </BusinessInfoValue>
              </BusinessInfoItem>
            </InfoCard>

            {/* Map card */}
            <InfoCard style={{ padding: 0 }}>
              {!apiKey && (
                <div style={{ padding: '1rem' }}>
                  <MapNotice>
                    {t('mapNotAvailableText')}
                  </MapNotice>
                </div>
              )}
              {apiKey && mapError && (
                <div style={{ padding: '1rem' }}>
                  <MapNotice>
                    {t('mapErrorText')}
                  </MapNotice>
                </div>
              )}
              <MapContainer>
                {apiKey && !mapLoaded && !mapError && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100%', 
                    color: '#6b7280',
                    fontSize: '0.9rem'
                  }}>
                    {t('mapLoadingText')}
                  </div>
                )}
                <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
              </MapContainer>
            </InfoCard>
          </Sidebar>
        </MainLayout>

        {/* Reviews section - comes last on mobile */}
        <div style={{ 
          padding: '48px 24px', 
          borderTop: '1px solid #ebebeb', 
          marginTop: 48,
          order: 3
        }}>
          <Section id="reviews" style={{ paddingBottom: 0, borderBottom: 'none' }}>
            <div style={{ marginBottom: 48 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
                <StarIconSolid style={{ width: 24, height: 24, color: '#fbbf24', marginRight: 4 }} />
                <span style={{ fontSize: 28, fontWeight: 600, color: '#222222' }}>{business.rating}</span>
                <span style={{ fontSize: 18, color: '#717171', marginLeft: 4 }}>·</span>
                <span style={{ fontSize: 18, color: '#717171', marginLeft: 4 }}>{business.review_count} reviews</span>
              </div>
              
              {/* Category ratings grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '16px 24px',
                marginBottom: 32
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#222222', fontSize: 14 }}>{t('accuracy')}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ 
                      width: 80, 
                      height: 4, 
                      backgroundColor: '#EBEBEB', 
                      borderRadius: 2,
                      position: 'relative'
                    }}>
                      <div style={{
                        width: `${(business.rating / 5) * 100}%`,
                        height: '100%',
                        backgroundColor: '#222222',
                        borderRadius: 2
                      }} />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#222222', minWidth: 24 }}>{business.rating}</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#222222', fontSize: 14 }}>{t('communication')}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ 
                      width: 80, 
                      height: 4, 
                      backgroundColor: '#EBEBEB', 
                      borderRadius: 2,
                      position: 'relative'
                    }}>
                      <div style={{
                        width: `${((business.rating + 0.2) / 5) * 100}%`,
                        height: '100%',
                        backgroundColor: '#222222',
                        borderRadius: 2
                      }} />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#222222', minWidth: 24 }}>{(business.rating + 0.2).toFixed(1)}</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#222222', fontSize: 14 }}>{t('value')}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ 
                      width: 80, 
                      height: 4, 
                      backgroundColor: '#EBEBEB', 
                      borderRadius: 2,
                      position: 'relative'
                    }}>
                      <div style={{
                        width: `${((business.rating - 0.1) / 5) * 100}%`,
                        height: '100%',
                        backgroundColor: '#222222',
                        borderRadius: 2
                      }} />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#222222', minWidth: 24 }}>{(business.rating - 0.1).toFixed(1)}</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#222222', fontSize: 14 }}>{t('serviceQuality')}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ 
                      width: 80, 
                      height: 4, 
                      backgroundColor: '#EBEBEB', 
                      borderRadius: 2,
                      position: 'relative'
                    }}>
                      <div style={{
                        width: `${(business.rating / 5) * 100}%`,
                        height: '100%',
                        backgroundColor: '#222222',
                        borderRadius: 2
                      }} />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#222222', minWidth: 24 }}>{business.rating}</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#222222', fontSize: 14 }}>{t('professionalism')}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ 
                      width: 80, 
                      height: 4, 
                      backgroundColor: '#EBEBEB', 
                      borderRadius: 2,
                      position: 'relative'
                    }}>
                      <div style={{
                        width: `${((business.rating + 0.1) / 5) * 100}%`,
                        height: '100%',
                        backgroundColor: '#222222',
                        borderRadius: 2
                      }} />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#222222', minWidth: 24 }}>{(business.rating + 0.1).toFixed(1)}</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#222222', fontSize: 14 }}>{t('timeliness')}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ 
                      width: 80, 
                      height: 4, 
                      backgroundColor: '#EBEBEB', 
                      borderRadius: 2,
                      position: 'relative'
                    }}>
                      <div style={{
                        width: `${((business.rating - 0.05) / 5) * 100}%`,
                        height: '100%',
                        backgroundColor: '#222222',
                        borderRadius: 2
                      }} />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#222222', minWidth: 24 }}>{(business.rating - 0.05).toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px 24px' }}>
              {displayedReviews.map((rv) => (
                <div key={rv.id} style={{ 
                  padding: 0,
                  background: 'transparent',
                  borderBottom: '1px solid #ebebeb',
                  paddingBottom: 24
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
                    <div style={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontWeight: 600, 
                      color: 'white',
                      fontSize: 16,
                      flexShrink: 0
                    }}>
                      {rv.name?.slice(0,1) || 'U'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <strong style={{ color: '#222222', fontSize: 16, fontWeight: 600 }}>{rv.name || 'User'}</strong>
                      </div>
                      <div style={{ color: '#717171', fontSize: 14, marginBottom: 12 }}>{rv.date}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 12 }}>
                        {Array.from({ length: 5 }, (_, i) => (
                          i < rv.rating ? (
                            <StarIconSolid key={i} style={{ width: 12, height: 12, color: '#FF5A5F' }} />
                          ) : (
                            <StarIconOutline key={i} style={{ width: 12, height: 12, color: '#e5e7eb' }} />
                          )
                        ))}
                      </div>
                      <p style={{ 
                        margin: 0, 
                        color: '#222222', 
                        lineHeight: 1.6, 
                        fontSize: 16,
                        fontWeight: 400 
                      }}>
                        {rv.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Show all reviews button */}
            {totalReviews > reviewsPerPage && !showAllReviews && (
              <div style={{ marginTop: 32, marginBottom: 16 }}>
                <button style={{
                  background: 'transparent',
                  border: '1px solid #222222',
                  borderRadius: 8,
                  padding: '14px 24px',
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#222222',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#f7f7f7';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                }}
                onClick={() => setShowAllReviews(true)}
                >
                  {t('showAllReviews')} {totalReviews}
                </button>
              </div>
            )}
          </Section>

          {/* 위치 섹션: 지도 카드에 표시하므로 제거 */}

          {/* 연락처 섹션 제거: 정보 카드에 포함됨 */}
        </div>
      </ContentWrapper>
      
      {/* 이미지 모달 */}
      {isImageModalOpen && business.gallery_images && (
        <ImageModalOverlay onClick={handleCloseModal}>
          <ImageModalCloseButton onClick={handleCloseModal}>
            ×
          </ImageModalCloseButton>
          <ImageModalMainImage 
            $imageUrl={business.gallery_images[selectedImageIndex]}
            onClick={(e) => e.stopPropagation()}
          >
            {!business.gallery_images[selectedImageIndex] && `${t('photo')} ${selectedImageIndex + 1}`}
          </ImageModalMainImage>
          <ImageModalThumbnails onClick={(e) => e.stopPropagation()}>
            {business.gallery_images.map((imageUrl, index) => (
              <ImageModalThumbnail
                key={index}
                $active={selectedImageIndex === index}
                $imageUrl={imageUrl}
                onClick={() => handleThumbnailClick(index)}
              >
                {!imageUrl && `${t('photo')} ${index + 1}`}
              </ImageModalThumbnail>
            ))}
          </ImageModalThumbnails>
        </ImageModalOverlay>
      )}
      
      {/* Mobile bottom bar */}
      <MobileBottomBar style={{ display: showBottomPrice ? 'flex' : 'none' }}>
        <div style={{ width: '100%', maxWidth: 1120, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <MobilePriceDisplay>
            <span className="currency">{formatPrice(business.base_price, business.currency)}</span>
            <span className="period">{getPerSessionShort(language)}</span>
          </MobilePriceDisplay>
          <MobileBookingButton onClick={handleBook}>{t('reserve')}</MobileBookingButton>
        </div>
      </MobileBottomBar>
      
      {/* Scroll to top button */}
      <ScrollToTopButton visible={showScrollToTop} showBottomPrice={showBottomPrice} onClick={handleScrollToTop}>
        <ChevronUpIcon style={{ width: 24, height: 24 }} />
      </ScrollToTopButton>

      {/* Copy success toast */}
      <CopyToast visible={showCopyToast}>
        ✅ {t('copiedToClipboard')}
      </CopyToast>
    </Container>
  );
}
