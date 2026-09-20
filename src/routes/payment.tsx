import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useI18n } from '../i18n/i18n';

const Container = styled.div`
  min-height: 100vh;
  background: #f8fafc;
  padding: 0;
  margin: 0;
  width: 100%;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    height: 100%;
    background: #f8fafc;
    z-index: -1;
  }
`;

const ContentWrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-top: 2rem;
  margin-bottom: 2rem;
  padding: 2rem;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #e5e7eb;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #6b7280;
`;

const TwoColumnLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Section = styled.div`
  background: #f9fafb;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
`;

const SectionTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const BookingSummary = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;
  
  &:last-child {
    border-bottom: none;
    font-weight: 700;
    font-size: 1.1rem;
    color: #1f2937;
    background: #f0f9ff;
    margin: 0 -1.5rem -1.5rem -1.5rem;
    padding: 1rem 1.5rem;
    border-radius: 0 0 12px 12px;
  }
`;

const SummaryLabel = styled.span`
  color: #6b7280;
  font-weight: 500;
`;

const SummaryValue = styled.span`
  color: #1f2937;
  font-weight: 600;
`;

const PaymentMethodSection = styled.div`
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
`;

const PaymentMethods = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
`;

const PaymentMethod = styled.div<{ $selected?: boolean }>`
  padding: 1rem;
  border: 2px solid ${props => props.$selected ? '#3b82f6' : '#e5e7eb'};
  border-radius: 12px;
  background: ${props => props.$selected ? '#f0f9ff' : 'white'};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
  
  &:hover {
    border-color: #3b82f6;
    background: #f8fafc;
  }
`;

const PaymentIcon = styled.div`
  font-size: 2rem;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 8px;
`;

const PaymentInfo = styled.div`
  flex: 1;
`;

const PaymentName = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
`;

const PaymentDescription = styled.p`
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0;
`;

const CardForm = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 1rem;
`;

const Required = styled.span`
  color: #dc2626;
  margin-left: 0.25rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const CardRow = styled.div`
  @media(max-width:420px){grid-template-columns:1fr;}
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const ButtonGroup = styled.div`
  @media(max-width:600px){flex-direction:column;}
  display: flex;
  gap: 1rem;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 2px solid #e5e7eb;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
    color: white;
    
    &:hover {
      background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px -5px rgba(139, 92, 246, 0.4);
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
  ` : `
    background: white;
    color: #374151;
    border: 2px solid #e5e7eb;
    
    &:hover {
      border-color: #d1d5db;
      background: #f9fafb;
    }
  `}
`;

const ErrorMessage = styled.div`
  color: #dc2626;
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #f3f4f6;
  border-radius: 50%;
  border-top-color: #3b82f6;
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const SecurityBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #059669;
  font-size: 0.9rem;
  font-weight: 500;
  margin-top: 1rem;
`;

interface PaymentFormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  selectedMethod: string;
}

// 서비스 옵션 (booking.tsx와 동일하게 유지)
const serviceOptions = [
  {
    id: 1,
    name: "기본 사주 상담",
    price: 29000,
    description: "AI 기반 기본 사주 분석 및 상담"
  },
  {
    id: 2,
    name: "프리미엄 사주 상담",
    price: 49000,
    description: "상세한 AI 분석 + 전통 사주 해석"
  },
  {
    id: 3,
    name: "VIP 종합 상담",
    price: 79000,
    description: "종합 분석 + 개인 맞춤 조언 + 후속 상담"
  }
];

export default function Payment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  
  // URL 파라미터에서 예약 데이터 읽기
  const searchParams = new URLSearchParams(location.search);
  const bookingData = {
    name: searchParams.get('name') || '',
    phone: searchParams.get('phone') || '',
    email: searchParams.get('email') || '',
    selectedDate: searchParams.get('selectedDate') || '',
    selectedTime: searchParams.get('selectedTime') || '',
    selectedService: parseInt(searchParams.get('selectedService') || '1'),
    specialRequests: searchParams.get('specialRequests') || ''
  };
  
  // 선택된 서비스 정보 가져오기
  const selectedService = serviceOptions.find(service => service.id === bookingData.selectedService) || serviceOptions[0];
  
  const [formData, setFormData] = useState<PaymentFormData>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    selectedMethod: 'card'
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<PaymentFormData>>({});
  
  const paymentMethods = [
    {
      id: 'card',
      name: '신용카드',
      description: 'VISA, MasterCard, AMEX 등',
      icon: '💳'
    },
    {
      id: 'kakao',
      name: '카카오페이',
      description: '간편결제',
      icon: '🟡'
    },
    {
      id: 'naver',
      name: '네이버페이',
      description: '간편결제',
      icon: '🟢'
    },
    {
      id: 'bank',
      name: '무통장입금',
      description: '계좌이체',
      icon: '🏦'
    }
  ];
  
  const handleInputChange = (field: keyof PaymentFormData, value: string) => {
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
    const newErrors: Partial<PaymentFormData> = {};
    
    if (formData.selectedMethod === 'card') {
      if (!formData.cardNumber.trim()) newErrors.cardNumber = '카드번호를 입력해주세요.';
      if (!formData.expiryDate.trim()) newErrors.expiryDate = '만료일을 입력해주세요.';
      if (!formData.cvv.trim()) newErrors.cvv = 'CVV를 입력해주세요.';
      if (!formData.cardholderName.trim()) newErrors.cardholderName = '카드 소유자명을 입력해주세요.';
      
      // 카드번호 형식 검증 (16자리 숫자)
      const cardNumberRegex = /^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/;
      if (formData.cardNumber && !cardNumberRegex.test(formData.cardNumber.replace(/\s/g, ''))) {
        newErrors.cardNumber = '올바른 카드번호 형식이 아닙니다.';
      }
      
      // 만료일 형식 검증 (MM/YY)
      const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
      if (formData.expiryDate && !expiryRegex.test(formData.expiryDate)) {
        newErrors.expiryDate = '올바른 만료일 형식이 아닙니다. (MM/YY)';
      }
      
      // CVV 형식 검증 (3-4자리 숫자)
      const cvvRegex = /^\d{3,4}$/;
      if (formData.cvv && !cvvRegex.test(formData.cvv)) {
        newErrors.cvv = '올바른 CVV 형식이 아닙니다.';
      }
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
      // TODO: 실제 결제 API 호출
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3초 대기 (결제 처리 시뮬레이션)
      
      alert('결제가 완료되었습니다! 예약이 확정되었습니다.');
      navigate(`/business/${id}`);
    } catch (error) {
      alert('결제 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    // 예약 페이지로 돌아갈 때 URL 파라미터를 유지
    const searchParams = new URLSearchParams({
      name: bookingData.name,
      phone: bookingData.phone,
      email: bookingData.email,
      selectedDate: bookingData.selectedDate,
      selectedTime: bookingData.selectedTime,
      selectedService: bookingData.selectedService.toString(),
      specialRequests: bookingData.specialRequests
    });
    
    navigate(`/business/${id}/booking?${searchParams.toString()}`);
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
  
  const formatCardNumber = (value: string) => {
    // 카드번호에 공백 추가
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };
  
  const formatExpiryDate = (value: string) => {
    // 만료일 형식 (MM/YY)
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };
  
  return (
    <Container>
      <ContentWrapper>
        <Header>
          <Title>결제하기</Title>
          <Subtitle>안전하고 빠른 결제를 진행해주세요</Subtitle>
        </Header>
        
        <TwoColumnLayout>
          <LeftColumn>
            {/* 예약 요약 */}
            <Section>
              <SectionTitle>📋 예약 요약</SectionTitle>
              <BookingSummary>
                <SummaryItem>
                  <SummaryLabel>업체명</SummaryLabel>
                  <SummaryValue>AI 사주 분석</SummaryValue>
                </SummaryItem>
                <SummaryItem>
                  <SummaryLabel>서비스</SummaryLabel>
                  <SummaryValue>{selectedService.name}</SummaryValue>
                </SummaryItem>
                <SummaryItem>
                  <SummaryLabel>예약일시</SummaryLabel>
                  <SummaryValue>
                    {bookingData.selectedDate && new Date(bookingData.selectedDate).toLocaleDateString('ko-KR')} {bookingData.selectedTime}
                  </SummaryValue>
                </SummaryItem>
                <SummaryItem>
                  <SummaryLabel>예약자</SummaryLabel>
                  <SummaryValue>{bookingData.name}</SummaryValue>
                </SummaryItem>
                {bookingData.specialRequests && (
                  <SummaryItem>
                    <SummaryLabel>특별 요청사항</SummaryLabel>
                    <SummaryValue>{bookingData.specialRequests}</SummaryValue>
                  </SummaryItem>
                )}
                <SummaryItem>
                  <SummaryLabel>총 결제금액</SummaryLabel>
                  <SummaryValue>{formatPrice(selectedService.price, 'KRW')}</SummaryValue>
                </SummaryItem>
              </BookingSummary>
            </Section>
          </LeftColumn>
          
          <RightColumn>
            {/* 결제 방법 선택 */}
            <PaymentMethodSection>
              <SectionTitle>💳 결제 방법</SectionTitle>
              <PaymentMethods>
                {paymentMethods.map((method) => (
                  <PaymentMethod
                    key={method.id}
                    $selected={formData.selectedMethod === method.id}
                    onClick={() => handleInputChange('selectedMethod', method.id)}
                  >
                    <PaymentIcon>{method.icon}</PaymentIcon>
                    <PaymentInfo>
                      <PaymentName>{method.name}</PaymentName>
                      <PaymentDescription>{method.description}</PaymentDescription>
                    </PaymentInfo>
                  </PaymentMethod>
                ))}
              </PaymentMethods>
              
              {/* 신용카드 폼 */}
              {formData.selectedMethod === 'card' && (
                <CardForm>
                  <FormGroup>
                    <Label>
                      카드번호 <Required>*</Required>
                    </Label>
                    <Input
                      type="text"
                      value={formData.cardNumber}
                      onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                    {errors.cardNumber && <ErrorMessage>{errors.cardNumber}</ErrorMessage>}
                  </FormGroup>
                  
                  <CardRow>
                    <FormGroup>
                      <Label>
                        만료일 <Required>*</Required>
                      </Label>
                      <Input
                        type="text"
                        value={formData.expiryDate}
                        onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                      {errors.expiryDate && <ErrorMessage>{errors.expiryDate}</ErrorMessage>}
                    </FormGroup>
                    
                    <FormGroup>
                      <Label>
                        CVV <Required>*</Required>
                      </Label>
                      <Input
                        type="text"
                        value={formData.cvv}
                        onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                        placeholder="123"
                        maxLength={4}
                      />
                      {errors.cvv && <ErrorMessage>{errors.cvv}</ErrorMessage>}
                    </FormGroup>
                  </CardRow>
                  
                  <FormGroup>
                    <Label>
                      카드 소유자명 <Required>*</Required>
                    </Label>
                    <Input
                      type="text"
                      value={formData.cardholderName}
                      onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                      placeholder="홍길동"
                    />
                    {errors.cardholderName && <ErrorMessage>{errors.cardholderName}</ErrorMessage>}
                  </FormGroup>
                  
                  <SecurityBadge>
                    🔒 SSL 보안 연결로 안전하게 처리됩니다
                  </SecurityBadge>
                </CardForm>
              )}
              
              {/* 다른 결제 방법 선택 시 */}
              {formData.selectedMethod !== 'card' && (
                <div style={{ 
                  padding: '2rem', 
                  textAlign: 'center', 
                  color: '#6b7280',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  marginTop: '1.5rem'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                    {paymentMethods.find(m => m.id === formData.selectedMethod)?.icon}
                  </div>
                  <p>{paymentMethods.find(m => m.id === formData.selectedMethod)?.name} 결제는 준비 중입니다.</p>
                  <p>신용카드 결제를 이용해주세요.</p>
                </div>
              )}
            </PaymentMethodSection>
          </RightColumn>
        </TwoColumnLayout>
        
        <ButtonGroup>
          <Button type="button" onClick={handleCancel}>
            이전으로
          </Button>
          <Button type="submit" $variant="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <LoadingSpinner /> : `${formatPrice(selectedService.price, 'KRW')} 결제하기`}
          </Button>
        </ButtonGroup>
      </ContentWrapper>
    </Container>
  );
}
