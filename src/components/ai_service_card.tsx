import { styled } from "styled-components";
import { type ComponentType } from "react";

const Card = styled.button`
  width: 156px;
  min-height: 176px;
  padding: 0;
  border: 0;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  color: white;
  transition: transform .18s ease;
  &:hover { transform: translateY(-4px); }
`;

const Shield = styled.div<{ $color: string }>`
  width: 156px;
  height: 140px;
  clip-path: polygon(25% 6%,75% 6%,100% 50%,75% 94%,25% 94%,0 50%);
  background: ${p => p.$color || 'linear-gradient(135deg,#8b5cf6,#6210cc)'};
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 10px 20px rgba(0,0,0,.22));
  position: relative;

  &::after {
    content:'';
    position:absolute;
    inset:14px;
    clip-path: inherit;
    border: 1px solid rgba(255,255,255,.20);
    background: rgba(255,255,255,.04);
  }
`;
const Icon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 999px;
  background: rgba(15,0,38,.42);
  display:flex;
  align-items:center;
  justify-content:center;
  position:relative;
  z-index:2;
  svg { width: 26px; height:26px; color:white; }
`;
const Title = styled.span`
  max-width: 120px;
  font-size: 12px;
  line-height: 1.25;
  font-weight: 800;
  letter-spacing: .45px;
  text-transform: uppercase;
  text-align: center;
`;

interface AIServiceCardProps {
  service: { id: number; title: string; icon: ComponentType; color: string; };
  onClick?: (serviceId: number) => void;
}

export function AIServiceCard({ service, onClick }: AIServiceCardProps) {
  const IconComponent = service.icon;
  return (
    <Card onClick={() => onClick?.(service.id)}>
      <Shield $color={service.color}>
        <Icon><IconComponent /></Icon>
      </Shield>
      <Title>{service.title}</Title>
    </Card>
  );
}
