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

const Card = styled.div<{ $variant?: 'popular' | 'hotdeals' | 'ai' }>`
  width: 240px;
  flex-shrink: 0;
  background: ${props => props.$variant === 'ai' ? '#ffffff' : 'linear-gradient(145deg, #f8f6f0 0%, #f0ede5 100%)'};
  border: ${props => props.$variant === 'ai' ? '1px solid #e5e7eb' : '3px solid #8b7355'};
  border-radius: ${props => props.$variant === 'ai' ? '12px' : '16px'};
  box-shadow: ${props => 
    props.$variant === 'ai' 
      ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      : `0 8px 25px rgba(0, 0, 0, 0.3),
         inset 0 1px 0 rgba(255, 255, 255, 0.8),
         inset 0 -1px 0 rgba(0, 0, 0, 0.1)`
  };
  overflow: hidden;
  transition: all 0.4s ease;
  cursor: pointer;
  position: relative;
  z-index: 2;
  
  ${props => props.$variant !== 'ai' && `
    &::before {
      content: '';
      position: absolute;
      top: 8px;
      left: 8px;
      right: 8px;
      bottom: 8px;
      border: 2px solid #d4af37;
      border-radius: 12px;
      background: linear-gradient(45deg, transparent 30%, rgba(212, 175, 55, 0.1) 50%, transparent 70%);
      pointer-events: none;
      z-index: 1;
    }
    
  `}
  
  &:hover {
    transform: ${props => props.$variant === 'ai' ? 'translateY(-2px)' : 'translateY(-8px) scale(1.02)'};
    box-shadow: ${props => 
      props.$variant === 'ai' 
        ? '0 8px 20px -3px rgba(0, 0, 0, 0.15)'
        : `0 15px 35px rgba(0, 0, 0, 0.4),
           inset 0 1px 0 rgba(255, 255, 255, 0.9),
           0 0 20px rgba(212, 175, 55, 0.3)`
    };
    background: ${props => props.$variant === 'ai' ? '#f9fafb' : undefined};
      
    ${props => props.$variant !== 'ai' && `
      &::before {
        border-color: #f4d03f;
        background: linear-gradient(45deg, transparent 20%, rgba(244, 208, 63, 0.15) 50%, transparent 80%);
      }
      
    `}
  }
  
  @media (max-width: 768px) {
    width: 190px;
    
    &:hover {
      transform: translateY(-4px) scale(1.01);
    }
  }
  
  @media (max-width: 480px) {
    width: 180px;
  }
`;

const CardImage = styled.div<{ $imageUrl?: string; $variant?: 'popular' | 'hotdeals' | 'ai' }>`
  width: ${props => props.$variant === 'ai' ? '100%' : 'calc(100% - 16px)'};
  height: ${props => props.$variant === 'ai' ? '110px' : '140px'};
  margin: ${props => props.$variant === 'ai' ? '0' : '8px'};
  background: ${props => 
    props.$imageUrl 
      ? `url(${props.$imageUrl})`
      : 'linear-gradient(135deg, #2c1810 0%, #8b4513 50%, #d2691e 100%)'
  };
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border: ${props => props.$variant === 'ai' ? 'none' : '2px solid #8b7355'};
  border-radius: ${props => props.$variant === 'ai' ? '12px 12px 0 0' : '8px'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  color: #d4af37;
  font-weight: 600;
  position: relative;
  z-index: 2;
  
  ${props => props.$variant !== 'ai' && `
    &::before {
      content: '';
      position: absolute;
      top: 4px;
      left: 4px;
      right: 4px;
      bottom: 4px;
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 4px;
      background: linear-gradient(45deg, transparent 30%, rgba(212, 175, 55, 0.1) 50%, transparent 70%);
    }
  `}
  
  @media (max-width: 768px) {
    height: 120px;
    font-size: 0.8rem;
  }
  
  @media (max-width: 480px) {
    height: 110px;
    font-size: 0.75rem;
  }
`;

const CardContent = styled.div<{ $variant?: 'popular' | 'hotdeals' | 'ai' }>`
  padding: ${props => props.$variant === 'ai' ? '0.75rem' : '1rem'};
  position: relative;
  z-index: 2;
  background: ${props => 
    props.$variant === 'ai' 
      ? 'transparent' 
      : 'linear-gradient(180deg, transparent 0%, rgba(212, 175, 55, 0.03) 100%)'
  };
  
  
  @media (max-width: 768px) {
    padding: 0.75rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.6rem;
  }
`;

const SymbolMark = styled.div<{ $variant?: 'popular' | 'hotdeals' | 'ai' }>`
  font-size: 0.9rem;
  line-height: 1;
  text-align: center;
  color: ${props => props.$variant === 'ai' ? '#6b7280' : '#8b7355'};
  text-shadow: ${props => props.$variant === 'ai' ? 'none' : '0 1px 2px rgba(0,0,0,0.12)'};
  margin: 0 auto 0.35rem auto;
  user-select: none;
`;

const DiscountBadge = styled.div<{ $language: string }>`
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  padding: 0.3rem 0.6rem;
  border-radius: 8px;
  border: 1px solid #7f1d1d;
  font-family: ${props => getFontFamily(props.$language, 'accent')};
  font-size: 0.7rem;
  font-weight: 600;
  line-height: 1.2;
  display: block;
  margin: 0 auto 0.5rem auto;
  position: relative;
  z-index: 3;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  box-shadow: 0 2px 4px rgba(220, 38, 38, 0.3);
  letter-spacing: 0.3px;
  text-transform: uppercase;
  text-align: center;
  width: fit-content;
`;

const CardTitle = styled.h3<{ $language: string; $variant?: 'popular' | 'hotdeals' | 'ai' }>`
  font-family: ${props => getFontFamily(props.$language, 'accent')};
  font-size: 1.05rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: ${props => props.$variant === 'ai' ? '#1f2937' : '#2c1810'};
  line-height: 1.4;
  text-align: center;
  text-shadow: ${props => props.$variant === 'ai' ? 'none' : '0 1px 2px rgba(212, 175, 55, 0.2)'};
  letter-spacing: 0.5px;
  
  @media (max-width: 768px) {
    font-size: 0.98rem;
    margin-bottom: 0.4rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.92rem;
  }
`;

const OriginalPrice = styled.div`
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 500;
  color: #9ca3af;
  text-decoration: line-through;
  margin-bottom: 0.25rem;
  line-height: 1.2;
  text-align: center;
`;

const CardPrice = styled.div<{ $language: string; $variant?: 'popular' | 'hotdeals' | 'ai' }>`
  font-family: ${props => getFontFamily(props.$language, 'price')};
  font-size: 1.1rem;
  font-weight: 700;
  color: ${props => props.$variant === 'ai' ? '#1f2937' : '#8b4513'};
  margin-bottom: 0.5rem;
  line-height: 1.2;
  text-align: center;
  text-shadow: ${props => props.$variant === 'ai' ? 'none' : '0 1px 2px rgba(139, 69, 19, 0.3)'};
  position: relative;
  
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.95rem;
  }
`;

const CardRating = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
`;

const Stars = styled.div`
  display: flex;
  gap: 2px;
  justify-content: center;
`;

const Star = styled.span`
  color: #d4af37;
  font-size: 1.2rem;
  text-shadow: 0 1px 2px rgba(212, 175, 55, 0.4);
  filter: drop-shadow(0 0 2px rgba(212, 175, 55, 0.6));
`;

const RatingText = styled.span`
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 500;
  color: #8b7355;
  line-height: 1.2;
  opacity: 0.8;
`;

interface ServiceCardProps {
  service: {
    id: number | string; // Accept both number and string (UUID)
    title: string;
    price: string;
    rating?: number;
    image?: string;
    originalPrice?: string;
    discount?: string;
    tagline?: string;
  };
  variant?: 'popular' | 'hotdeals' | 'ai';
  onClick?: (serviceId: number | string) => void; // Accept both number and string
}

const renderStars = (rating: number) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const stars = [];
  
  for (let i = 0; i < fullStars; i++) {
    stars.push(<Star key={i}>★</Star>);
  }
  
  if (hasHalfStar) {
    stars.push(<Star key="half">☆</Star>);
  }
  
  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<Star key={`empty-${i}`}>☆</Star>);
  }
  
  return stars;
};

export function ServiceCard({ service, variant = 'popular', onClick }: ServiceCardProps) {
  const { t, language } = useI18n();

  const handleClick = () => {
    if (onClick) {
      onClick(service.id);
    }
  };

  return (
    <Card $variant={variant} onClick={handleClick}>
      <CardImage 
        $imageUrl={service.image && (service.image.startsWith('http') || service.image.startsWith('/')) ? service.image : undefined}
        $variant={variant}
      >
        {!service.image || (!service.image.startsWith('http') && !service.image.startsWith('/')) ? service.image || t("noImage") : ''}
      </CardImage>
      <CardContent $variant={variant}>
        <SymbolMark $variant={variant}>✦</SymbolMark>
        {variant === 'hotdeals' && service.discount && (
          <DiscountBadge $language={language}>
            {service.discount} {t("discount")}
          </DiscountBadge>
        )}
        <CardTitle $language={language} $variant={variant}>
          {service.title}
        </CardTitle>
        {variant === 'hotdeals' && service.originalPrice && (
          <OriginalPrice>{service.originalPrice}</OriginalPrice>
        )}
        <CardPrice $language={language} $variant={variant}>
          {service.price}
        </CardPrice>
        {service.rating && (
          <CardRating>
            <Stars>
              {renderStars(service.rating)}
            </Stars>
            <RatingText>({service.rating})</RatingText>
          </CardRating>
        )}
      </CardContent>
    </Card>
  );
}
