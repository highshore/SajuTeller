import { useEffect, useRef, useState, type ComponentPropsWithoutRef } from 'react';
import { styled } from 'styled-components';
import { makeStars, projectStar } from './starfield_geometry';
import starBg from '../assets/star_bg.png';

const Surface = styled.section`
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background: #0b0419 url(${starBg}) center / cover;
  > canvas { position:absolute; inset:0; width:100%; height:100%; pointer-events:none; z-index:0; }
  > :not(canvas) { position:relative; z-index:1; }
  > button[data-star-toggle] {
    position:absolute; right:20px; bottom:12px; z-index:3;
    min-height:44px; padding:8px 12px; border:1px solid #ffffff30;
    border-radius:30px; background:#130b25b3; color:#e4daf5;
    font-size:11px; cursor:pointer;
  }
  @media(prefers-reduced-motion:reduce) { > button[data-star-toggle] { display:none; } }
`;
const stars = makeStars();

export default function StarfieldSection({ children, hero = false, ...props }: ComponentPropsWithoutRef<'section'> & { hero?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const motionRef = useRef({ position: 0, phase: 0 });
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const canvas = canvasRef.current;
    const surface = canvas?.parentElement;
    const context = canvas?.getContext('2d');
    if (!canvas || !surface || !context) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let width = 0, height = 0, visible = false, frame = 0, previousTime = 0;
    let { position, phase } = motionRef.current;
    let target = position;
    const motionEnabled = () => !paused && !reducedMotion.matches;
    function updateTarget() {
      if (!surface) return;
      const rect = surface.getBoundingClientRect();
      target = motionEnabled() ? Math.max(-0.5, Math.min(1, (window.innerHeight * 0.5 - rect.top) / (window.innerHeight + rect.height))) : position;
    }
    function draw() {
      if (!context || !width || !height) return;
      context.fillStyle = '#0b0419';
      context.fillRect(0, 0, width, height);
      const origin = projectStar(stars[0], width, height, position, phase, hero);
      const glow = context.createRadialGradient(origin.cx, origin.cy, 0, origin.cx, origin.cy, origin.scale * 1.3);
      glow.addColorStop(0, 'rgba(193, 159, 255, 0.24)');
      glow.addColorStop(0.18, 'rgba(111, 62, 179, 0.18)');
      glow.addColorStop(1, 'rgba(11, 4, 25, 0)');
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);
      const count = width <= 700 ? 1200 : stars.length;
      for (let i = 0; i < count; i++) {
        const star = stars[i];
        const p = projectStar(star, width, height, position, phase, hero);
        if (p.x < -12 || p.x > width + 12 || p.y < -12 || p.y > height + 12) continue;
        const color = star.warm ? '255, 224, 188' : '227, 232, 255';
        if (p.size > 1.15) {
          const halo = context.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 5);
          halo.addColorStop(0, `rgba(${color}, ${p.alpha * 0.55})`);
          halo.addColorStop(1, `rgba(${color}, 0)`);
          context.fillStyle = halo;
          context.fillRect(p.x - p.size * 5, p.y - p.size * 5, p.size * 10, p.size * 10);
        }
        context.fillStyle = `rgba(${color}, ${p.alpha})`;
        context.beginPath();
        context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        context.fill();
      }
    }
    function animate(time: number) {
      frame = 0;
      const delta = previousTime ? Math.min(time - previousTime, 50) : 16;
      previousTime = time;
      position += (target - position) * (1 - Math.exp(-delta / 100));
      if (motionEnabled()) phase += delta * 0.000035;
      draw();
      if (visible && !document.hidden && motionEnabled()) frame = requestAnimationFrame(animate);
      else previousTime = 0;
    }
    function requestDraw() { if (visible && !document.hidden && !frame) frame = requestAnimationFrame(animate); }
    function cancelFrame() { cancelAnimationFrame(frame); frame = 0; previousTime = 0; }
    function onScroll() { if (visible && motionEnabled()) { updateTarget(); requestDraw(); } }
    function resize() {
      if (!canvas || !surface || !context) return;
      width = surface.clientWidth; height = surface.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      updateTarget(); position = target; draw();
    }
    function onPreferenceChange() { cancelFrame(); updateTarget(); position = target; draw(); requestDraw(); }
    function onVisibilityChange() { if (document.hidden) cancelFrame(); else { updateTarget(); requestDraw(); } }
    const resizeObserver = new ResizeObserver(resize);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) { updateTarget(); position = target; requestDraw(); } else cancelFrame();
    });
    resize(); resizeObserver.observe(surface); intersectionObserver.observe(surface);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
    reducedMotion.addEventListener('change', onPreferenceChange);
    return () => {
      motionRef.current = { position, phase };
      cancelFrame(); resizeObserver.disconnect(); intersectionObserver.disconnect();
      window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      reducedMotion.removeEventListener('change', onPreferenceChange);
    };
  }, [hero, paused]);
  return <Surface {...props} data-starfield={hero ? 'hero' : 'section'}><canvas ref={canvasRef} aria-hidden="true" />{children}<button data-star-toggle type="button" aria-pressed={paused} onClick={() => setPaused(v => !v)}>{paused ? 'Play stars' : 'Pause stars'}</button></Surface>;
}
