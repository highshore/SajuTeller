import { useEffect, useRef, type ComponentPropsWithoutRef } from 'react';
import { styled } from 'styled-components';
import starBg from '../assets/star_bg.png';

const Surface = styled.section`
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background: #0f0026 url(${starBg}) center / cover;

  > canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: -1;
  }
`;

// A fixed seed keeps the sky stable across renders, resizes, and route visits.
function makeStars() {
  let seed = 87231;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  return Array.from({ length: 1100 }, (_, i) => {
    const radius = Math.sqrt(random());
    const angle = radius * 8 + (i % 3) * Math.PI * 2 / 3 + (random() - 0.5) * 0.6;
    const clustered = i % 4 !== 0;
    return {
      x: clustered ? Math.cos(angle) * radius : (random() - 0.5) * 3.8,
      y: clustered ? Math.sin(angle) * radius * 0.7 : (random() - 0.5) * 2.5,
      z: (random() - 0.5) * (clustered ? 0.5 : 1.8),
      size: 0.35 + random() ** 5 * 1.7,
      alpha: 0.25 + random() * 0.65,
      warm: random() > 0.85,
    };
  });
}

const stars = makeStars();

/** Decorative, scroll-driven galaxy. No React renders or timers while scrolling. */
export default function StarfieldSection({ children, ...props }: ComponentPropsWithoutRef<'section'>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const surface = canvas?.parentElement;
    const context = canvas?.getContext('2d');
    if (!canvas || !surface || !context) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let width = 0;
    let height = 0;
    let visible = false;
    let frame = 0;
    let previousTime = 0;
    let position = 0;
    let target = 0;

    function updateTarget() {
      if (!surface) return;
      // Section-relative progress also works when arriving midway down a page.
      const rect = surface.getBoundingClientRect();
      target = reducedMotion.matches ? 0 : (window.innerHeight * 0.5 - rect.top) / (window.innerHeight + rect.height);
    }

    function draw() {
      if (!context) return;
      context.clearRect(0, 0, width, height);
      context.fillStyle = '#0f0026';
      context.fillRect(0, 0, width, height);
      const centerX = width * 0.76;
      const centerY = height * 0.48;
      const scale = Math.max(width * 0.43, height * 0.7);
      const glow = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, scale);
      glow.addColorStop(0, 'rgba(96, 45, 148, 0.32)');
      glow.addColorStop(0.4, 'rgba(59, 25, 103, 0.18)');
      glow.addColorStop(1, 'rgba(15, 0, 38, 0)');
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);

      const angle = position * 0.65;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const count = width < 700 ? 550 : stars.length;
      for (let i = 0; i < count; i++) {
        const star = stars[i];
        const x = star.x * cos - star.z * sin;
        const z = star.x * sin + star.z * cos;
        const perspective = 2.4 / (2.8 + z - position * 0.2);
        const px = centerX + x * scale * perspective;
        const py = centerY + (star.y - position * 0.22) * scale * perspective;
        const size = star.size * perspective;
        if (px < -12 || px > width + 12 || py < -12 || py > height + 12) continue;
        // Quiet behind the copy; brighter in the open space to the right.
        const alpha = star.alpha * (0.45 + 0.55 * Math.min(1, Math.max(0, px / width)));
        const color = star.warm ? '244, 216, 170' : '218, 224, 255';
        if (size > 1.1) {
          const halo = context.createRadialGradient(px, py, 0, px, py, size * 5);
          halo.addColorStop(0, `rgba(${color}, ${alpha * 0.3})`);
          halo.addColorStop(1, `rgba(${color}, 0)`);
          context.fillStyle = halo;
          context.fillRect(px - size * 5, py - size * 5, size * 10, size * 10);
        }
        context.fillStyle = `rgba(${color}, ${alpha})`;
        context.beginPath();
        context.arc(px, py, size, 0, Math.PI * 2);
        context.fill();
      }
    }

    function animate(time: number) {
      frame = 0;
      const delta = previousTime ? Math.min(time - previousTime, 64) : 16;
      previousTime = time;
      position += (target - position) * (1 - Math.exp(-delta / 100));
      if (Math.abs(target - position) < 0.0001) position = target;
      draw();
      if (visible && !document.hidden && position !== target && !reducedMotion.matches) {
        frame = requestAnimationFrame(animate);
      } else {
        previousTime = 0;
      }
    }

    function requestDraw() {
      if (visible && !document.hidden && !frame) frame = requestAnimationFrame(animate);
    }

    function onScroll() {
      if (!visible || reducedMotion.matches) return;
      updateTarget();
      requestDraw();
    }

    function resize() {
      if (!canvas || !surface || !context) return;
      width = surface.clientWidth;
      height = surface.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      updateTarget();
      position = target;
      draw();
    }

    function cancelFrame() {
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
    }

    function onPreferenceChange() {
      cancelFrame();
      updateTarget();
      position = target;
      draw();
    }

    function onVisibilityChange() {
      if (document.hidden) cancelFrame();
      else {
        updateTarget();
        requestDraw();
      }
    }

    const resizeObserver = new ResizeObserver(resize);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) {
        updateTarget();
        position = target;
        requestDraw();
      } else cancelFrame();
    });
    resize();
    resizeObserver.observe(surface);
    intersectionObserver.observe(surface);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
    reducedMotion.addEventListener('change', onPreferenceChange);

    return () => {
      cancelFrame();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      reducedMotion.removeEventListener('change', onPreferenceChange);
    };
  }, []);

  return <Surface {...props}><canvas ref={canvasRef} aria-hidden="true" />{children}</Surface>;
}
