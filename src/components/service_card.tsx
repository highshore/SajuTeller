import { styled } from "styled-components";
import { useI18n } from "../i18n/i18n";

const Card = styled.article<{ $variant?: 'popular' | 'hotdeals' | 'ai' }>`
  width: 100%;
  min-width: 0;
  max-width: 330px;
  @media(max-width:700px){min-height:290px;max-width:none;}
  min-height: 360px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  background: ${p => p.$variant === 'ai' ? '#fffdf8' : '#f8f6f0'};
  border: ${p => p.$variant === 'ai' ? '1px solid #e8e0d5' : '2px solid #8b7355'};
  box-shadow: 0 10px 26px rgba(44,24,16,.08);
  cursor: pointer;
  transition: transform .2s ease, box-shadow .2s ease;

  &::after {
    content: '';
    display: ${p => p.$variant === 'ai' ? 'none' : 'block'};
    position: absolute;
    inset: 8px;
    pointer-events: none;
    border: 1px solid #d4af37;
    border-radius: 12px;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 38px rgba(44,24,16,.14);
  }
`;

const Image = styled.div<{ $image?: string; $variant?: 'popular' | 'hotdeals' | 'ai' }>`
  height: 164px;
  margin: ${p => p.$variant === 'ai' ? 0 : '14px 14px 0'};
  border-radius: ${p => p.$variant === 'ai' ? '0' : '9px'};
  border: ${p => p.$variant === 'ai' ? '0' : '1px solid #8b7355'};
  background: ${p => p.$image ? `url(${p.$image}) center/cover no-repeat` : 'linear-gradient(135deg,#f6e7e5,#eee9f7)'};
  position: relative;
  z-index: 1;
`;

const Body = styled.div`
  @media(max-width:700px){padding:16px 14px;}
  padding: 18px 24px 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
  z-index: 2;
  text-align: center;
`;
const Spark = styled.div`font-family:'Crimson Text',serif;color:#8b7355;font-size:16px;margin-bottom:8px;`;
const Badge = styled.div`
  padding: 5px 10px;
  border-radius: 8px;
  background: #b91c1c;
  color: white;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .4px;
  margin-bottom: 8px;
`;
const Title = styled.h3`
  font-family: 'Cormorant Garamond','Noto Serif KR',serif;
  color: #2c1810;
  font-size: 19px;
  font-weight: 700;
  line-height: 1.25;
  min-height: 48px;
  display:flex;
  align-items:center;
  justify-content:center;
  margin: 0 0 8px;
`;
const Original = styled.div`font-size:12px;color:#9ca3af;text-decoration:line-through;margin-bottom:3px;`;
const Price = styled.div`
  font-family: 'Cinzel','Noto Serif KR',serif;
  color: #8b4513;
  font-size: 17px;
  font-weight: 700;
  margin-bottom: 8px;
`;
const Stars = styled.div`color:#d4af37;font-size:14px;letter-spacing:1px;margin-bottom:7px;`;
const Meta = styled.div`font-size:11px;color:#8b7355;line-height:1.35;`;
const Tagline = styled.div`font-size:12px;color:#6b7280;line-height:1.45;max-width:240px;`;

interface ServiceCardProps {
  service: {
    id: number | string;
    title: string;
    price: string;
    rating?: number;
    image?: string;
    originalPrice?: string;
    discount?: string;
    tagline?: string;
  };
  variant?: 'popular' | 'hotdeals' | 'ai';
  onClick?: (serviceId: number | string) => void;
}

export function ServiceCard({ service, variant = 'popular', onClick }: ServiceCardProps) {
  useI18n();
  const validImage = service.image && (service.image.startsWith('http') || service.image.startsWith('/')) ? service.image : undefined;
  const roundedRating = Math.max(0, Math.min(5, Math.round(service.rating ?? 0)));

  return (
    <Card $variant={variant} onClick={() => onClick?.(service.id)} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(service.id); } }}>
      <Image $image={validImage} $variant={variant} aria-label={service.title} />
      <Body>
        <Spark>✦</Spark>
        {variant === 'hotdeals' && service.discount ? <Badge>{service.discount} OFF</Badge> : null}
        <Title>{service.title}</Title>
        {service.originalPrice ? <Original>{service.originalPrice}</Original> : null}
        <Price>{service.price}</Price>
        {service.rating ? <Stars>{'★'.repeat(roundedRating)}{'☆'.repeat(5-roundedRating)}</Stars> : null}
        {service.rating ? <Meta>{service.rating.toFixed(1)}</Meta> : service.tagline ? <Tagline>{service.tagline}</Tagline> : null}
      </Body>
    </Card>
  );
}
