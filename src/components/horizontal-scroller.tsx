import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { styled } from 'styled-components';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useI18n } from '../i18n/i18n';

type Props = { children: ReactNode; label: string; viewportClassName?: string; className?: string };

const Frame = styled.div`
  min-width: 0;
  width: 100%;
  .scroll-controls { display:none; justify-content:flex-end; gap:8px; padding-bottom:10px; }
  .scroll-controls button {
    width:44px;height:44px;padding:0;display:grid;place-items:center;
    border:1px solid var(--st-accent-line);border-radius:50%;
    background:var(--st-elevated);color:var(--st-ink);cursor:pointer;
  }
  .scroll-controls button:hover:not(:disabled) { border-color:var(--st-gold); }
  .scroll-controls button:disabled { opacity:.35;cursor:not-allowed; }
  .scroll-controls svg { width:20px;height:20px; }
  .scroll-viewport {
    min-width:0;max-width:100%;overflow-x:auto;
    scroll-behavior:smooth;overscroll-behavior-x:contain;
    -webkit-overflow-scrolling:touch;scrollbar-width:none;
  }
  .scroll-viewport::-webkit-scrollbar { display:none; }
  @container saju (max-width:850px) { .scroll-controls { display:flex; } }
  @media (prefers-reduced-motion:reduce) { .scroll-viewport { scroll-behavior:auto; } }
`;

export default function HorizontalScroller({ children, label, className, viewportClassName }: Props) {
  const { t } = useI18n();
  const viewport = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left:false, right:false });
  const sync = useCallback(() => {
    const node = viewport.current;
    if (!node) return;
    const left = node.scrollLeft > 2;
    const right = node.scrollLeft + node.clientWidth < node.scrollWidth - 2;
    setEdges(previous => previous.left === left && previous.right === right ? previous : { left, right });
  }, []);

  useEffect(() => {
    const node = viewport.current;
    if (!node) return;
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(sync);
    observer?.observe(node);
    if (node.firstElementChild) observer?.observe(node.firstElementChild);
    node.addEventListener('scroll', sync, { passive:true });
    window.addEventListener('resize', sync);
    sync();
    return () => {
      observer?.disconnect();
      node.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, [children, sync]);

  const move = (direction: -1 | 1) => {
    const node = viewport.current;
    if (!node) return;
    node.scrollBy({
      left: direction * Math.max(node.clientWidth * .8, 160),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  };

  return <Frame className={className}>
    <div className="scroll-controls">
      <button type="button" disabled={!edges.left} onClick={() => move(-1)} aria-label={t('Scroll left')}><ChevronLeftIcon aria-hidden="true"/></button>
      <button type="button" disabled={!edges.right} onClick={() => move(1)} aria-label={t('Scroll right')}><ChevronRightIcon aria-hidden="true"/></button>
    </div>
    <div ref={viewport} tabIndex={0} role="region" aria-label={label} className={'scroll-viewport ' + (viewportClassName ?? '')}>
      {children}
    </div>
  </Frame>;
}
