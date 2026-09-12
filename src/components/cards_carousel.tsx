import { styled } from "styled-components";
import { useState, useEffect, type ReactNode } from "react";

// Hook for responsive card calculations
const useResponsiveCardLayout = () => {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const isMobile = windowWidth <= 768;
  const isSmallMobile = windowWidth <= 480;
  
  const cardWidth = isSmallMobile ? 160 : isMobile ? 180 : 220;
  const cardGap = isSmallMobile ? 12 : isMobile ? 16 : 32;
  const totalCardWidth = cardWidth + cardGap;
  
  // Calculate available container width (accounting for padding)
  const containerPadding = isMobile ? 32 : 0; // 1rem on each side for mobile
  const containerWidth = Math.min(windowWidth - containerPadding, 960);
  
  const cardsPerView = Math.floor(containerWidth / totalCardWidth);
  
  return {
    cardWidth,
    cardGap,
    totalCardWidth,
    containerWidth,
    cardsPerView,
    isMobile,
    isSmallMobile
  };
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  position: relative;
  max-width: 100%;
  width: 100%;
  z-index: 2;
`;

const Viewport = styled.div`
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  position: relative;
  overflow: visible;
  padding: 0;
  
  @media (max-width: 768px) {
    padding: 0 1rem;
    overflow: hidden;
  }
`;

const Inner = styled.div`
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  overflow: hidden;
  position: relative;
  padding: 0.75rem 0;
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 0.5rem 0;
  }
`;

const Wrapper = styled.div<{ $translateX: number }>`
  display: flex;
  gap: 2rem;
  transform: translateX(${props => props.$translateX}px);
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  width: fit-content;
  padding: 0;
  
  @media (max-width: 768px) {
    gap: 1rem;
  }
  
  @media (max-width: 480px) {
    gap: 0.75rem;
  }
`;

const NavButton = styled.button<{ $position: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${props => props.$position === 'left' ? 'left: -20px;' : 'right: -20px;'}
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(139, 92, 246, 0.3);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.2rem;
  color: #8b5cf6;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  
  &:hover {
    background: rgba(255, 255, 255, 1);
    border-color: rgba(139, 92, 246, 0.5);
    color: #7c3aed;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    transform: translateY(-50%) scale(1.05);
  }
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: translateY(-50%);
    background: rgba(255, 255, 255, 0.7);
    border-color: rgba(156, 163, 175, 0.3);
    color: #9ca3af;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    font-size: 1rem;
    ${props => props.$position === 'left' ? 'left: 8px;' : 'right: 8px;'}
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(8px);
  }
  
  @media (max-width: 480px) {
    width: 32px;
    height: 32px;
    font-size: 0.9rem;
    ${props => props.$position === 'left' ? 'left: 4px;' : 'right: 4px;'}
  }
`;

interface CardsCarouselProps {
  children: ReactNode;
  totalItems: number;
  showNavigation?: boolean;
}

export function CardsCarousel({ 
  children, 
  totalItems, 
  showNavigation = true 
}: CardsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { totalCardWidth, cardsPerView } = useResponsiveCardLayout();
  
  // Calculate max scroll positions to ensure last card is fully visible
  const maxIndex = Math.max(0, totalItems - cardsPerView);
  
  // Slide by individual cards to ensure precise positioning
  const translateX = -currentIndex * totalCardWidth;

  const handlePrev = () => {
    setCurrentIndex(Math.max(0, currentIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex(Math.min(maxIndex, currentIndex + 1));
  };

  return (
    <Container>
      <Viewport>
        {showNavigation && (
          <NavButton 
            $position="left" 
            onClick={handlePrev} 
            disabled={currentIndex === 0}
          >
            ‹
          </NavButton>
        )}
        
        <Inner>
          <Wrapper $translateX={translateX}>
            {children}
          </Wrapper>
        </Inner>
        
        {showNavigation && (
          <NavButton 
            $position="right" 
            onClick={handleNext} 
            disabled={currentIndex >= maxIndex}
          >
            ›
          </NavButton>
        )}
      </Viewport>
    </Container>
  );
}
