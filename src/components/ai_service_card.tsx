import { styled } from "styled-components";
import { type ComponentType } from "react";

const Card = styled.div<{ $color: string }>`
  width: 160px;
  height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  transition: all 0.4s ease;
  position: relative;
  
  &:hover {
    transform: translateY(-6px) scale(1.03);
  }
  
  @media (max-width: 768px) {
    width: 140px;
    height: 160px;
  }
  
  @media (max-width: 480px) {
    width: 150px;
    height: 170px;
  }
`;

const Shield = styled.div<{ $color: string }>`
  width: 140px;
  height: 160px;
  background: ${props => props.$color};
  position: relative;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  transition: all 0.4s ease;
  padding-top: 15px;
  padding-bottom: 25px;
  
  &::before {
    content: '';
    position: absolute;
    top: 6px;
    left: 6px;
    right: 6px;
    bottom: 6px;
    background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%);
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  }
  
  ${Card}:hover & {
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
    filter: brightness(1.08);
  }
  
  @media (max-width: 768px) {
    width: 120px;
    height: 140px;
    padding-top: 12px;
    padding-bottom: 20px;
  }
  
  @media (max-width: 480px) {
    width: 130px;
    height: 150px;
    padding-top: 15px;
    padding-bottom: 22px;
  }
`;

const Icon = styled.div`
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  position: relative;
  
  svg {
    width: 32px;
    height: 32px;
    color: white;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
  }
`;

const Title = styled.h3`
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.3;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
  text-align: center;
  max-width: 100px;
  word-wrap: break-word;
  z-index: 3;
  position: relative;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

interface AIServiceCardProps {
  service: {
    id: number;
    title: string;
    icon: ComponentType;
    color: string;
  };
  onClick?: (serviceId: number) => void;
}

export function AIServiceCard({ service, onClick }: AIServiceCardProps) {
  const IconComponent = service.icon;

  const handleClick = () => {
    if (onClick) {
      onClick(service.id);
    }
  };

  return (
    <Card $color={service.color} onClick={handleClick}>
      <Shield $color={service.color}>
        <Icon>
          <IconComponent />
        </Icon>
        <Title>{service.title}</Title>
      </Shield>
    </Card>
  );
}
