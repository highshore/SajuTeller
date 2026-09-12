import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useI18n } from '../i18n/i18n';
import homeBg from '../assets/home_bg.jpg';
import { 
  CalendarIcon,
  ClockIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  MapPinIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

// Language-specific font configurations (using sans-serif fonts)
const getFontFamily = (language: string, type: 'heading' | 'body' | 'accent' | 'price') => {
  const fontConfigs = {
    ko: {
      heading: "'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif",
      body: "'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif",
      accent: "'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif",
      price: "'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif"
    },
    en: {
      heading: "system-ui, -apple-system, 'Segoe UI', 'Roboto', sans-serif",
      body: "system-ui, -apple-system, 'Segoe UI', 'Roboto', sans-serif",
      accent: "system-ui, -apple-system, 'Segoe UI', 'Roboto', sans-serif",
      price: "system-ui, -apple-system, 'Segoe UI', 'Roboto', sans-serif"
    },
    ja: {
      heading: "'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif",
      body: "'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif",
      accent: "'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif",
      price: "'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif"
    },
    zh: {
      heading: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif",
      body: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif",
      accent: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif",
      price: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif"
    },
    es: {
      heading: "system-ui, -apple-system, 'Segoe UI', 'Roboto', sans-serif",
      body: "system-ui, -apple-system, 'Segoe UI', 'Roboto', sans-serif",
      accent: "system-ui, -apple-system, 'Segoe UI', 'Roboto', sans-serif",
      price: "system-ui, -apple-system, 'Segoe UI', 'Roboto', sans-serif"
    }
  };
  
  return fontConfigs[language as keyof typeof fontConfigs]?.[type] || fontConfigs.en[type];
};

const Container = styled.div<{ $language: string }>`
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%), 
              url(${homeBg}) center/cover fixed;
  padding: 0;
  margin: 0;
  width: 100%;
  position: relative;
  overflow-x: hidden;
  font-family: ${props => getFontFamily(props.$language, 'body')};
  
  @media (max-width: 768px) {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%), 
                url(${homeBg}) center/cover fixed;
  }
`;

const ContentWrapper = styled.div<{ $language: string }>`
  max-width: 1120px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 0;
  box-shadow: none;
  overflow: visible;
  margin-top: 0;
  margin-bottom: 0;
  padding: 24px;
  min-height: 100vh;
  
  @media (max-width: 768px) {
    padding: 16px;
    padding-bottom: 100px; /* Add space for mobile bottom bar */
  }
`;

// Back Button
const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 0;
  margin-bottom: 24px;
  transition: color 0.2s ease;
  
  &:hover {
    color: #374151;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const Header = styled.div<{ $language: string }>`
  margin-bottom: 48px;
  padding-bottom: 24px;
  border-bottom: 1px solid #ebebeb;
`;

const Title = styled.h1<{ $language: string }>`
  font-size: 32px;
  font-weight: 700;
  color: #222222;
  margin-bottom: 8px;
  font-family: ${props => getFontFamily(props.$language, 'heading')};
  line-height: 1.2;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #717171;
  line-height: 1.4;
`;

// Main Layout Container
const MainLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 48px;
  margin-top: 24px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 32px;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Sidebar = styled.div`
  position: sticky;
  top: 104px; /* Account for header + some padding */
  height: fit-content;
  align-self: flex-start;
  
  @media (max-width: 1024px) {
    position: static;
    order: -1;
    top: auto;
  }
`;

// Info Card (matching business detail style)
const InfoCard = styled.div`
  background: #ffffff;
  border: 1px solid #dddddd;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
`;

const CardTitle = styled.h3`
  font-size: 22px;
  font-weight: 600;
  color: #222222;
  margin-bottom: 16px;
`;

const BusinessInfo = styled.div`
  background: #ffffff;
  border: 1px solid #dddddd;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
`;

const BusinessName = styled.h2<{ $language: string }>`
  font-size: 24px;
  font-weight: 600;
  color: #222222;
  margin-bottom: 12px;
  font-family: ${props => getFontFamily(props.$language, 'heading')};
`;

const BusinessDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
`;

const DetailIcon = styled.div`
  width: 20px;
  height: 20px;
  color: #717171;
  flex-shrink: 0;
`;

const DetailText = styled.div`
  display: flex;
  flex-direction: column;
`;

const DetailLabel = styled.span`
  font-size: 12px;
  color: #717171;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
`;

const DetailValue = styled.span`
  font-size: 14px;
  color: #222222;
  font-weight: 500;
`;

// Section Components
const Section = styled.div`
  padding-bottom: 24px;
  border-bottom: 1px solid #ebebeb;
  margin-bottom: 24px;
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
`;

const SectionHeader = styled.div<{ $language: string }>`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
`;

const SectionIcon = styled.div`
  width: 24px;
  height: 24px;
  color: #6b46c1;
  flex-shrink: 0;
`;

const SectionTitle = styled.h3<{ $language: string }>`
  font-size: 20px;
  font-weight: 600;
  color: #222222;
  margin: 0;
  font-family: ${props => getFontFamily(props.$language, 'heading')};
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: #222222;
  margin-bottom: 8px;
  font-size: 16px;
`;

const Required = styled.span`
  color: #dc2626;
  margin-left: 4px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #dddddd;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s ease;
  box-sizing: border-box;
  background: #ffffff;
  
  &:focus {
    outline: none;
    border-color: #6b46c1;
    box-shadow: 0 0 0 3px rgba(107, 70, 193, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #dddddd;
  border-radius: 8px;
  font-size: 16px;
  background: #ffffff;
  transition: all 0.2s ease;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #6b46c1;
    box-shadow: 0 0 0 3px rgba(107, 70, 193, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #dddddd;
  border-radius: 8px;
  font-size: 16px;
  min-height: 120px;
  resize: vertical;
  transition: all 0.2s ease;
  box-sizing: border-box;
  font-family: inherit;
  background: #ffffff;
  
  &:focus {
    outline: none;
    border-color: #6b46c1;
    box-shadow: 0 0 0 3px rgba(107, 70, 193, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const TimeSlotGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
  margin-top: 16px;
`;

const TimeSlot = styled.button<{ $selected?: boolean; $disabled?: boolean }>`
  padding: 12px 16px;
  border: 1px solid ${props => props.$selected ? '#6b46c1' : '#dddddd'};
  border-radius: 8px;
  background: ${props => props.$selected ? '#6b46c1' : props.$disabled ? '#f9f9f9' : '#ffffff'};
  color: ${props => props.$selected ? '#ffffff' : props.$disabled ? '#9ca3af' : '#222222'};
  font-weight: 500;
  font-size: 14px;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    border-color: #6b46c1;
    background: ${props => props.$selected ? '#6b46c1' : '#f8f7ff'};
  }
`;

const ServiceOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ServiceOption = styled.div<{ $selected?: boolean }>`
  padding: 20px;
  border: 1px solid ${props => props.$selected ? '#6b46c1' : '#dddddd'};
  border-radius: 12px;
  background: ${props => props.$selected ? '#f8f7ff' : '#ffffff'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #6b46c1;
    background: #f8f7ff;
  }
`;

const ServiceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const ServiceName = styled.h4<{ $language: string }>`
  font-size: 18px;
  font-weight: 600;
  color: #222222;
  margin: 0;
  font-family: ${props => getFontFamily(props.$language, 'heading')};
`;

const ServicePrice = styled.span<{ $language: string }>`
  font-size: 20px;
  font-weight: 700;
  color: #6b46c1;
  font-family: ${props => getFontFamily(props.$language, 'price')};
`;

const ServiceDescription = styled.p`
  color: #717171;
  font-size: 14px;
  margin: 0;
  line-height: 1.4;
`;

const ButtonGroup = styled.div`
  display: none; /* Removed - using only bottom bar now */
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary'; $language?: string }>`
  flex: 1;
  padding: 16px 24px;
  border: none;
  border-radius: 50px; /* Round buttons */
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: ${props => props.$language ? getFontFamily(props.$language, 'body') : 'inherit'};
  
  ${props => props.$variant === 'primary' ? `
    background: #000000; /* Black background */
    color: white;
    box-shadow: 0 4px 14px 0 rgba(0, 0, 0, 0.2);
    
    &:hover {
      background: #333333; /* Darker on hover */
      transform: translateY(-1px);
      box-shadow: 0 6px 20px 0 rgba(0, 0, 0, 0.3);
    }
    
    &:disabled {
      opacity: 0.6;
      transform: none;
      cursor: not-allowed;
    }
  ` : `
    background: #ffffff;
    color: #222222;
    border: 1px solid #dddddd;
    
    &:hover {
      border-color: #000000;
      background: #f8f8f8;
    }
  `}
`;

const ErrorMessage = styled.div`
  color: #dc2626;
  font-size: 14px;
  margin-top: 8px;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #ffffff;
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// Mobile Bottom Bar (matching business detail page)
const MobileBottomBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  border-top: 1px solid #ebebeb;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.1);
`;

const MobileBottomContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 24px;
  
  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const PriceSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1; /* Take up available space */
  min-width: 0; /* Allow text to wrap if needed */
`;

const PriceDisplay = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #222222;
  margin-bottom: 2px;
`;

const BottomBarServiceName = styled.div`
  font-size: 14px;
  color: #717171;
`;

const ButtonSection = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: flex-end; /* Right align the buttons */
  flex-shrink: 0; /* Prevent buttons from shrinking */
`;

const MobileButton = styled.button<{ $variant?: 'primary' | 'secondary'; $language?: string }>`
  padding: 12px 20px;
  border: none;
  border-radius: 50px; /* Round buttons */
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: ${props => props.$language ? getFontFamily(props.$language, 'body') : 'inherit'};
  white-space: nowrap;
  min-width: 100px;
  
  ${props => props.$variant === 'primary' ? `
    background: #000000; /* Black background */
    color: white;
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.2);
    
    &:hover {
      background: #333333; /* Darker on hover */
      transform: translateY(-1px);
      box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.3);
    }
    
    &:disabled {
      opacity: 0.6;
      transform: none;
      cursor: not-allowed;
    }
  ` : `
    background: #ffffff;
    color: #222222;
    border: 1px solid #dddddd;
    
    &:hover {
      border-color: #000000;
      background: #f8f8f8;
    }
  `}
`;

// Calendar Components
const CalendarContainer = styled.div`
  border: 1px solid #dddddd;
  border-radius: 12px;
  padding: 24px;
  background: #ffffff;
  margin-top: 16px;
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const CalendarTitle = styled.h3<{ $language: string }>`
  font-size: 18px;
  font-weight: 600;
  color: #222222;
  margin: 0;
  font-family: ${props => getFontFamily(props.$language, 'heading')};
`;

const CalendarNavButton = styled.button`
  background: #f9f9f9;
  border: 1px solid #dddddd;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #222222;
  font-size: 18px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f8f7ff;
    border-color: #6b46c1;
    color: #6b46c1;
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
`;

const CalendarDayHeader = styled.div<{ $isWeekend?: boolean; $isSunday?: boolean; $isSaturday?: boolean }>`
  text-align: center;
  font-weight: 600;
  color: ${props => {
    if (props.$isSunday) return '#dc2626';
    if (props.$isSaturday) return '#2563eb';
    return '#717171';
  }};
  font-size: 14px;
  padding: 12px 0;
`;

const CalendarDay = styled.button<{ $isSelected?: boolean; $isDisabled?: boolean; $isToday?: boolean; $isOtherMonth?: boolean }>`
  aspect-ratio: 1;
  border: 1px solid ${props => {
    if (props.$isSelected) return '#6b46c1';
    if (props.$isToday) return '#6b46c1';
    return 'transparent';
  }};
  border-radius: 8px;
  background: ${props => {
    if (props.$isSelected) return '#6b46c1';
    if (props.$isToday) return '#f8f7ff';
    if (props.$isDisabled) return '#f9f9f9';
    return '#ffffff';
  }};
  color: ${props => {
    if (props.$isSelected) return '#ffffff';
    if (props.$isOtherMonth) return '#d1d5db';
    if (props.$isDisabled) return '#9ca3af';
    if (props.$isToday) return '#6b46c1';
    return '#222222';
  }};
  cursor: ${props => props.$isDisabled || props.$isOtherMonth ? 'not-allowed' : 'pointer'};
  font-weight: ${props => props.$isToday || props.$isSelected ? '600' : '500'};
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: ${props => {
      if (props.$isSelected) return '#6b46c1';
      if (props.$isToday) return '#ede9fe';
      return '#f8f7ff';
    }};
    border-color: ${props => props.$isSelected ? '#6b46c1' : '#a855f7'};
  }
  
  &:disabled {
    opacity: 0.5;
  }
`;

// Mock business data function to get localized data
const getMockBusinessData = (t: (key: string) => string) => ({
  id: 1,
  title: t('aiSajuAnalysis'),
  base_price: 29000,
  currency: "KRW",
  contact: {
    phone: "02-1234-5678",
    address: "서울특별시 강남구 역삼동 123-45",
    business_hours: "09:00 - 21:00"
  }
});

interface BookingFormData {
  name: string;
  phone: string;
  email: string;
  selectedDate: string;
  selectedTime: string;
  selectedService: number;
  specialRequests: string;
}

// 캘린더 컴포넌트
interface CalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateSelect }) => {
  const { language } = useI18n();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const today = new Date();
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  // 달의 첫 번째 날과 마지막 날
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const firstDayWeekday = firstDay.getDay();
  
  // 달의 모든 날짜 생성
  const daysInMonth = lastDay.getDate();
  const days = [];
  
  // 이전 달의 날짜들 (빈 칸 채우기)
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    const prevDate = new Date(year, month, -i);
    days.push({
      date: prevDate,
      isOtherMonth: true,
      isDisabled: true
    });
  }
  
  // 현재 달의 날짜들
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const isToday = date.toDateString() === today.toDateString();
    const isPast = date < today;
    const isDisabled = isPast; // 주말 제한 제거
    
    days.push({
      date,
      isOtherMonth: false,
      isDisabled,
      isToday
    });
  }
  
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };
  
  const handleDateClick = (date: Date) => {
    if (date >= today) {
      onDateSelect(date.toISOString().split('T')[0]);
    }
  };
  
  // Localized month names
  const getMonthNames = (lang: string) => {
    const monthNames = {
      ko: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
      en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      ja: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      zh: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    };
    return monthNames[lang as keyof typeof monthNames] || monthNames.en;
  };

  // Localized weekday names
  const getWeekDays = (lang: string) => {
    const weekDays = {
      ko: ['일', '월', '화', '수', '목', '금', '토'],
      en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      ja: ['日', '月', '火', '水', '木', '金', '土'],
      zh: ['日', '一', '二', '三', '四', '五', '六'],
      es: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    };
    return weekDays[lang as keyof typeof weekDays] || weekDays.en;
  };

  // Localized year format
  const getYearFormat = (year: number, month: number, lang: string) => {
    const monthNames = getMonthNames(lang);
    switch (lang) {
      case 'ko':
        return `${year}년 ${monthNames[month]}`;
      case 'ja':
        return `${year}年${monthNames[month]}`;
      case 'zh':
        return `${year}年${monthNames[month]}`;
      case 'es':
        return `${monthNames[month]} ${year}`;
      case 'en':
      default:
        return `${monthNames[month]} ${year}`;
    }
  };

  const monthNames = getMonthNames(language);
  const weekDays = getWeekDays(language);
  
  return (
    <CalendarContainer>
      <CalendarHeader>
        <CalendarNavButton onClick={handlePrevMonth}>
          ‹
        </CalendarNavButton>
        <CalendarTitle $language={language}>
          {getYearFormat(year, month, language)}
        </CalendarTitle>
        <CalendarNavButton onClick={handleNextMonth}>
          ›
        </CalendarNavButton>
      </CalendarHeader>
      
      <CalendarGrid>
        {weekDays.map((day, index) => (
          <CalendarDayHeader 
            key={day}
            $isSunday={index === 0}
            $isSaturday={index === 6}
          >
            {day}
          </CalendarDayHeader>
        ))}
        
        {days.map((day, index) => {
          const isSelected = selectedDate === day.date.toISOString().split('T')[0];
          
          return (
            <CalendarDay
              key={index}
              $isSelected={isSelected}
              $isDisabled={day.isDisabled}
              $isToday={day.isToday}
              $isOtherMonth={day.isOtherMonth}
              onClick={() => handleDateClick(day.date)}
              disabled={day.isDisabled}
            >
              {day.date.getDate()}
            </CalendarDay>
          );
        })}
      </CalendarGrid>
    </CalendarContainer>
  );
};

// Localization function for booking page
const getBookingText = (key: string, lang: string) => {
  const texts = {
    // Page titles and headers
    'complete_reservation': {
      ko: '예약을 완료하세요',
      en: 'Complete your reservation',
      ja: '予約を完了してください',
      zh: '完成您的预订',
      es: 'Completa tu reserva'
    },
    'choose_date_time': {
      ko: '원하는 날짜와 시간을 선택하세요',
      en: 'Choose your preferred date and time',
      ja: 'ご希望の日時を選択してください',
      zh: '选择您偏好的日期和时间',
      es: 'Elige tu fecha y hora preferidas'
    },
    'back_to_business': {
      ko: '업체로 돌아가기',
      en: 'Back to business',
      ja: 'ビジネスに戻る',
      zh: '返回商家',
      es: 'Volver al negocio'
    },
    
    // Section titles
    'select_service': {
      ko: '서비스 선택',
      en: 'Select Service',
      ja: 'サービス選択',
      zh: '选择服务',
      es: 'Seleccionar Servicio'
    },
    'your_information': {
      ko: '고객 정보',
      en: 'Your Information',
      ja: 'お客様情報',
      zh: '您的信息',
      es: 'Tu Información'
    },
    'choose_date': {
      ko: '날짜 선택',
      en: 'Choose Date',
      ja: '日付選択',
      zh: '选择日期',
      es: 'Elegir Fecha'
    },
    'choose_time': {
      ko: '시간 선택',
      en: 'Choose Time',
      ja: '時間選択',
      zh: '选择时间',
      es: 'Elegir Hora'
    },
    'special_requests': {
      ko: '특별 요청사항',
      en: 'Special Requests',
      ja: '特別なご要望',
      zh: '特殊要求',
      es: 'Solicitudes Especiales'
    },
    'booking_summary': {
      ko: '예약 요약',
      en: 'Booking Summary',
      ja: '予約概要',
      zh: '预订摘要',
      es: 'Resumen de Reserva'
    },
    
    // Form labels
    'name': {
      ko: '이름',
      en: 'Name',
      ja: '名前',
      zh: '姓名',
      es: 'Nombre'
    },
    'phone': {
      ko: '연락처',
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
      es: 'Correo'
    },
    'select_date': {
      ko: '날짜 선택',
      en: 'Select Date',
      ja: '日付を選択',
      zh: '选择日期',
      es: 'Seleccionar Fecha'
    },
    'select_time': {
      ko: '시간 선택',
      en: 'Select Time',
      ja: '時間を選択',
      zh: '选择时间',
      es: 'Seleccionar Hora'
    },
    'additional_notes': {
      ko: '추가 메모 (선택사항)',
      en: 'Additional Notes (Optional)',
      ja: '追加メモ（任意）',
      zh: '附加备注（可选）',
      es: 'Notas Adicionales (Opcional)'
    },
    
    // Placeholders
    'enter_name': {
      ko: '이름을 입력하세요',
      en: 'Enter your name',
      ja: 'お名前を入力してください',
      zh: '请输入您的姓名',
      es: 'Ingresa tu nombre'
    },
    'phone_placeholder': {
      ko: '+82 10-1234-5678 또는 010-1234-5678',
      en: '+82 10-1234-5678 or 010-1234-5678',
      ja: '+82 10-1234-5678 または 010-1234-5678',
      zh: '+82 10-1234-5678 或 010-1234-5678',
      es: '+82 10-1234-5678 o 010-1234-5678'
    },
    'email_placeholder': {
      ko: 'example@email.com',
      en: 'example@email.com',
      ja: 'example@email.com',
      zh: 'example@email.com',
      es: 'example@email.com'
    },
    'special_requests_placeholder': {
      ko: '특별한 요청사항이나 질문이 있으신가요?',
      en: 'Any special requests or questions?',
      ja: '特別なご要望やご質問はありますか？',
      zh: '有什么特殊要求或问题吗？',
      es: '¿Alguna solicitud especial o pregunta?'
    },
    
    // Buttons
    'cancel': {
      ko: '취소',
      en: 'Cancel',
      ja: 'キャンセル',
      zh: '取消',
      es: 'Cancelar'
    },
    'continue_to_payment': {
      ko: '결제하기',
      en: 'Continue to Payment',
      ja: '支払いに進む',
      zh: '继续付款',
      es: 'Continuar al Pago'
    },
    
    // Info labels
    'address': {
      ko: '주소',
      en: 'Address',
      ja: '住所',
      zh: '地址',
      es: 'Dirección'
    },
    'hours': {
      ko: '운영시간',
      en: 'Hours',
      ja: '営業時間',
      zh: '营业时间',
      es: 'Horarios'
    },
    'selected_service': {
      ko: '선택된 서비스',
      en: 'Selected Service',
      ja: '選択されたサービス',
      zh: '选择的服务',
      es: 'Servicio Seleccionado'
    },
    'date_time': {
      ko: '날짜 및 시간',
      en: 'Date & Time',
      ja: '日時',
      zh: '日期和时间',
      es: 'Fecha y Hora'
    },
    'date': {
      ko: '날짜: ',
      en: 'Date: ',
      ja: '日付: ',
      zh: '日期: ',
      es: 'Fecha: '
    },
    'time': {
      ko: '시간: ',
      en: 'Time: ',
      ja: '時間: ',
      zh: '时间: ',
      es: 'Hora: '
    },
    
    // Phone helper text
    'phone_helper': {
      ko: '💡 한국: 010-1234-5678 | 국제: +82 10-1234-5678',
      en: '💡 Korea: 010-1234-5678 | International: +82 10-1234-5678',
      ja: '💡 韓国: 010-1234-5678 | 国際: +82 10-1234-5678',
      zh: '💡 韩国: 010-1234-5678 | 国际: +82 10-1234-5678',
      es: '💡 Corea: 010-1234-5678 | Internacional: +82 10-1234-5678'
    },
    
    // Validation messages
    'error_name_required': {
      ko: '이름을 입력해주세요.',
      en: 'Please enter your name.',
      ja: 'お名前を入力してください。',
      zh: '请输入您的姓名。',
      es: 'Por favor ingresa tu nombre.'
    },
    'error_phone_required': {
      ko: '연락처를 입력해주세요.',
      en: 'Please enter your phone number.',
      ja: '電話番号を入力してください。',
      zh: '请输入您的电话号码。',
      es: 'Por favor ingresa tu número de teléfono.'
    },
    'error_email_required': {
      ko: '이메일을 입력해주세요.',
      en: 'Please enter your email.',
      ja: 'メールアドレスを入力してください。',
      zh: '请输入您的邮箱。',
      es: 'Por favor ingresa tu correo electrónico.'
    },
    'error_date_required': {
      ko: '예약 날짜를 선택해주세요.',
      en: 'Please select a reservation date.',
      ja: '予約日を選択してください。',
      zh: '请选择预订日期。',
      es: 'Por favor selecciona una fecha de reserva.'
    },
    'error_time_required': {
      ko: '예약 시간을 선택해주세요.',
      en: 'Please select a reservation time.',
      ja: '予約時間を選択してください。',
      zh: '请选择预订时间。',
      es: 'Por favor selecciona una hora de reserva.'
    },
    'error_email_invalid': {
      ko: '올바른 이메일 형식이 아닙니다.',
      en: 'Please enter a valid email format.',
      ja: '正しいメール形式を入力してください。',
      zh: '请输入正确的邮箱格式。',
      es: 'Por favor ingresa un formato de correo válido.'
    },
    'error_phone_invalid': {
      ko: '올바른 전화번호 형식이 아닙니다.',
      en: 'Please enter a valid phone number format.',
      ja: '正しい電話番号形式を入力してください。',
      zh: '请输入正确的电话号码格式。',
      es: 'Por favor ingresa un formato de teléfono válido.'
    },
    'error_phone_too_short': {
      ko: '전화번호가 너무 짧습니다. (최소 7자리)',
      en: 'Phone number is too short. (minimum 7 digits)',
      ja: '電話番号が短すぎます。（最低7桁）',
      zh: '电话号码太短。（最少7位数字）',
      es: 'El número de teléfono es muy corto. (mínimo 7 dígitos)'
    }
  };
  
  return texts[key as keyof typeof texts]?.[lang as keyof typeof texts[keyof typeof texts]] || 
         texts[key as keyof typeof texts]?.['en'] || 
         key;
};

export default function Booking() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useI18n();
  
  // URL 파라미터에서 예약 데이터 읽기
  const searchParams = new URLSearchParams(location.search);
  
  const [formData, setFormData] = useState<BookingFormData>({
    name: searchParams.get('name') || '',
    phone: searchParams.get('phone') || '',
    email: searchParams.get('email') || '',
    selectedDate: searchParams.get('selectedDate') || '',
    selectedTime: searchParams.get('selectedTime') || '',
    selectedService: parseInt(searchParams.get('selectedService') || '1'),
    specialRequests: searchParams.get('specialRequests') || ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<BookingFormData>>({});
  const [showBottomBar, setShowBottomBar] = useState(false);
  
  // Get localized business data
  const mockBusinessData = getMockBusinessData(t);
  
  // 스크롤 감지 useEffect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      // Show bottom bar when scrolled past 200px (same as business detail page)
      setShowBottomBar(scrollTop > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // 시간 슬롯 생성
  const timeSlots = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
  ];
  
  // 서비스 옵션 (localized)
  const serviceOptions = [
    {
      id: 1,
      name: t('basicConsultation'),
      price: 29000,
      description: t('basicConsultationDesc')
    },
    {
      id: 2,
      name: t('premiumConsultation'),
      price: 49000,
      description: t('premiumConsultationDesc')
    },
    {
      id: 3,
      name: t('vipConsultation'),
      price: 79000,
      description: t('vipConsultationDesc')
    }
  ];
  
  const handleInputChange = (field: keyof BookingFormData, value: string | number) => {
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
  
  const validateForm = (): boolean => {
    const newErrors: Partial<BookingFormData> = {};
    
    if (!formData.name.trim()) newErrors.name = getBookingText('error_name_required', language);
    if (!formData.phone.trim()) newErrors.phone = getBookingText('error_phone_required', language);
    if (!formData.email.trim()) newErrors.email = getBookingText('error_email_required', language);
    if (!formData.selectedDate) newErrors.selectedDate = getBookingText('error_date_required', language);
    if (!formData.selectedTime) newErrors.selectedTime = getBookingText('error_time_required', language);
    
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = getBookingText('error_email_invalid', language);
    }
    
    // 전화번호 형식 검증 (더 유연하게)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = getBookingText('error_phone_invalid', language);
    }
    
    // 전화번호 최소 길이 검증 (국제번호 고려)
    if (formData.phone && formData.phone.replace(/\D/g, '').length < 7) {
      newErrors.phone = getBookingText('error_phone_too_short', language);
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // 예약 데이터를 URL 파라미터로 전달하여 결제 페이지로 이동
    const searchParams = new URLSearchParams({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      selectedDate: formData.selectedDate,
      selectedTime: formData.selectedTime,
      selectedService: formData.selectedService.toString(),
      specialRequests: formData.specialRequests
    });
    
    navigate(`/business/${id}/payment?${searchParams.toString()}`);
  };
  
  const handleCancel = () => {
    navigate(-1);
  };
  
  const formatPrice = (price: number, currency: string) => {
    switch (currency) {
      case 'KRW':
        return `₩${price.toLocaleString()}`;
      case 'USD':
        return `$${price}`;
      default:
        return `₩${price.toLocaleString()}`;
    }
  };
  
  return (
    <Container $language={language}>
      <ContentWrapper $language={language}>
        <BackButton onClick={handleCancel}>
          <ArrowLeftIcon />
          {getBookingText('back_to_business', language)}
        </BackButton>
        
        <Header $language={language}>
          <Title $language={language}>{getBookingText('complete_reservation', language)}</Title>
          <Subtitle>{getBookingText('choose_date_time', language)}</Subtitle>
        </Header>
        
        <MainLayout>
          <MainContent>
        
            <form onSubmit={handleSubmit}>
              {/* Service Selection */}
              <Section>
                <SectionHeader $language={language}>
                  <SectionIcon>
                    <CheckCircleIcon />
                  </SectionIcon>
                  <SectionTitle $language={language}>{getBookingText('select_service', language)}</SectionTitle>
                </SectionHeader>
                <ServiceOptions>
                  {serviceOptions.map((service) => (
                    <ServiceOption
                      key={service.id}
                      $selected={formData.selectedService === service.id}
                      onClick={() => handleInputChange('selectedService', service.id)}
                    >
                      <ServiceHeader>
                        <ServiceName $language={language}>{service.name}</ServiceName>
                        <ServicePrice $language={language}>{formatPrice(service.price, 'KRW')}</ServicePrice>
                      </ServiceHeader>
                      <ServiceDescription>{service.description}</ServiceDescription>
                    </ServiceOption>
                  ))}
                </ServiceOptions>
              </Section>
          
              {/* User Information */}
              <Section>
                <SectionHeader $language={language}>
                  <SectionIcon>
                    <UserIcon />
                  </SectionIcon>
                  <SectionTitle $language={language}>{getBookingText('your_information', language)}</SectionTitle>
                </SectionHeader>
                
                <FormGroup>
                  <Label>
                    {getBookingText('name', language)} <Required>*</Required>
                  </Label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder={getBookingText('enter_name', language)}
                  />
                  {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
                </FormGroup>
                
                <FormGroup>
                  <Label>
                    {getBookingText('phone', language)} <Required>*</Required>
                  </Label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder={getBookingText('phone_placeholder', language)}
                  />
                  <div style={{ 
                    fontSize: '14px', 
                    color: '#717171', 
                    marginTop: '8px',
                    lineHeight: '1.4'
                  }}>
                    {getBookingText('phone_helper', language)}
                  </div>
                  {errors.phone && <ErrorMessage>{errors.phone}</ErrorMessage>}
                </FormGroup>
                
                <FormGroup>
                  <Label>
                    {getBookingText('email', language)} <Required>*</Required>
                  </Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder={getBookingText('email_placeholder', language)}
                  />
                  {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
                </FormGroup>
              </Section>
          
              {/* Date Selection */}
              <Section>
                <SectionHeader $language={language}>
                  <SectionIcon>
                    <CalendarIcon />
                  </SectionIcon>
                  <SectionTitle $language={language}>{getBookingText('choose_date', language)}</SectionTitle>
                </SectionHeader>
                
                <FormGroup>
                  <Label>
                    {getBookingText('select_date', language)} <Required>*</Required>
                  </Label>
                  <Calendar 
                    selectedDate={formData.selectedDate}
                    onDateSelect={(date) => handleInputChange('selectedDate', date)}
                  />
                  {errors.selectedDate && <ErrorMessage>{errors.selectedDate}</ErrorMessage>}
                </FormGroup>
              </Section>
              
              {/* Time Selection */}
              <Section>
                <SectionHeader $language={language}>
                  <SectionIcon>
                    <ClockIcon />
                  </SectionIcon>
                  <SectionTitle $language={language}>{getBookingText('choose_time', language)}</SectionTitle>
                </SectionHeader>
                
                <FormGroup>
                  <Label>
                    {getBookingText('select_time', language)} <Required>*</Required>
                  </Label>
                  <TimeSlotGrid>
                    {timeSlots.map((time) => (
                      <TimeSlot
                        key={time}
                        type="button"
                        $selected={formData.selectedTime === time}
                        onClick={() => handleInputChange('selectedTime', time)}
                      >
                        {time}
                      </TimeSlot>
                    ))}
                  </TimeSlotGrid>
                  {errors.selectedTime && <ErrorMessage>{errors.selectedTime}</ErrorMessage>}
                </FormGroup>
              </Section>
              
              {/* Special Requests */}
              <Section>
                <SectionHeader $language={language}>
                  <SectionIcon>
                    <ChatBubbleLeftRightIcon />
                  </SectionIcon>
                  <SectionTitle $language={language}>{getBookingText('special_requests', language)}</SectionTitle>
                </SectionHeader>
                
                <FormGroup>
                  <Label>{getBookingText('additional_notes', language)}</Label>
                  <TextArea
                    value={formData.specialRequests}
                    onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                    placeholder={getBookingText('special_requests_placeholder', language)}
                  />
                </FormGroup>
              </Section>
              
            </form>
          </MainContent>
          
          <Sidebar>
            <InfoCard>
              <CardTitle>{getBookingText('booking_summary', language)}</CardTitle>
              <BusinessInfo>
                <BusinessDetails>
                  <DetailItem>
                    <DetailIcon>
                      <MapPinIcon />
                    </DetailIcon>
                    <DetailText>
                      <DetailLabel>{getBookingText('address', language)}</DetailLabel>
                      <DetailValue>{mockBusinessData.contact.address}</DetailValue>
                    </DetailText>
                  </DetailItem>
                  <DetailItem>
                    <DetailIcon>
                      <PhoneIcon />
                    </DetailIcon>
                    <DetailText>
                      <DetailLabel>{getBookingText('phone', language)}</DetailLabel>
                      <DetailValue>{mockBusinessData.contact.phone}</DetailValue>
                    </DetailText>
                  </DetailItem>
                  <DetailItem>
                    <DetailIcon>
                      <ClockIcon />
                    </DetailIcon>
                    <DetailText>
                      <DetailLabel>{getBookingText('hours', language)}</DetailLabel>
                      <DetailValue>{mockBusinessData.contact.business_hours}</DetailValue>
                    </DetailText>
                  </DetailItem>
                </BusinessDetails>
              </BusinessInfo>
              
              {formData.selectedService && (
                <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #ebebeb' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#222222', marginBottom: 16 }}>{getBookingText('selected_service', language)}</h4>
                  {serviceOptions.find(s => s.id === formData.selectedService) && (
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: 600, color: '#222222', marginBottom: 4 }}>
                        {serviceOptions.find(s => s.id === formData.selectedService)?.name}
                      </div>
                      <div style={{ fontSize: '16px', color: '#6b46c1', fontWeight: 700 }}>
                        {formatPrice(serviceOptions.find(s => s.id === formData.selectedService)?.price || 0, 'KRW')}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {(formData.selectedDate || formData.selectedTime) && (
                <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #ebebeb' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#222222', marginBottom: 16 }}>{getBookingText('date_time', language)}</h4>
                  {formData.selectedDate && (
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ fontSize: '14px', color: '#717171' }}>{getBookingText('date', language)}</span>
                      <span style={{ fontSize: '14px', color: '#222222', fontWeight: 500 }}>
                        {new Date(formData.selectedDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {formData.selectedTime && (
                    <div>
                      <span style={{ fontSize: '14px', color: '#717171' }}>{getBookingText('time', language)}</span>
                      <span style={{ fontSize: '14px', color: '#222222', fontWeight: 500 }}>
                        {formData.selectedTime}
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Continue to Payment Button in Summary */}
              <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #ebebeb' }}>
              <Button 
                type="button" 
                $variant="primary" 
                disabled={loading} 
                $language={language}
                style={{ width: '100%' }}
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit(e as any);
                }}
              >
                {loading ? <LoadingSpinner /> : getBookingText('continue_to_payment', language)}
              </Button>
              </div>
            </InfoCard>
          </Sidebar>
        </MainLayout>
        
        {/* Mobile Bottom Bar */}
        <MobileBottomBar style={{ display: showBottomBar ? 'flex' : 'none' }}>
          <MobileBottomContent>
            <PriceSection>
              <PriceDisplay>
                {(() => {
                  const selectedService = serviceOptions.find(s => s.id === formData.selectedService);
                  return formatPrice(selectedService?.price || serviceOptions[0]?.price || 29000, 'KRW');
                })()}
              </PriceDisplay>
              <BottomBarServiceName>
                {(() => {
                  const selectedService = serviceOptions.find(s => s.id === formData.selectedService);
                  return selectedService?.name || serviceOptions[0]?.name || 'Basic Service';
                })()}
              </BottomBarServiceName>
            </PriceSection>
            <ButtonSection>
              <MobileButton type="button" onClick={handleCancel} $language={language}>
                {getBookingText('cancel', language)}
              </MobileButton>
              <MobileButton 
                type="button" 
                $variant="primary" 
                disabled={loading} 
                $language={language}
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit(e as any);
                }}
              >
                {loading ? <LoadingSpinner /> : getBookingText('continue_to_payment', language)}
              </MobileButton>
            </ButtonSection>
          </MobileBottomContent>
        </MobileBottomBar>
      </ContentWrapper>
    </Container>
  );
}
