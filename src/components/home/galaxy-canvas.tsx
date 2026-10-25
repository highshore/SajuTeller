import { useEffect, useRef, useState } from 'react';
import { buildGalaxy, cameraFor, GalaxyMotion } from './galaxy';

// Hero galaxy (WebGL points, additive glow). Spins with scrolling, tilts and zooms as the hero leaves.
// Falls back to the original illustration without WebGL, and holds still for reduced motion.

const VERTEX = `
attribute vec3 aPos; attribute vec3 aColor; attribute float aSize; attribute float aPhase;
uniform float uAngle, uTilt, uScale, uRadius, uTime, uDpr, uLift, uFade;
uniform vec2 uView, uCenter;
varying vec3 vColor; varying float vAlpha;
void main() {
  float c = cos(uAngle), s = sin(uAngle);
  vec3 p = vec3(aPos.x * c - aPos.y * s, aPos.x * s + aPos.y * c, aPos.z);
  float ct = cos(uTilt), st = sin(uTilt);
  float y = p.y * ct - p.z * st;
  float z = p.y * st + p.z * ct;
  float persp = 3.2 / (3.2 - z * 1.4);
  vec2 px = uCenter + vec2(p.x, -y) * persp * uRadius * uScale - vec2(0.0, uLift);
  gl_Position = vec4(px / uView * 2.0 - 1.0, 0.0, 1.0);
  gl_Position.y = -gl_Position.y;
  gl_PointSize = aSize * uDpr * persp * uScale * (uRadius / 260.0);
  vColor = aColor;
  vAlpha = (0.7 + 0.3 * sin(uTime * 1.6 + aPhase)) * (0.45 + 0.4 * persp) * uFade;
}`;

const FRAGMENT = `
precision mediump float;
varying vec3 vColor; varying float vAlpha;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float a = exp(-dot(c, c) * 26.0) * vAlpha;
  gl_FragColor = vec4(vColor * a, a);
}`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) || 'shader');
  return shader;
}

export default function GalaxyCanvas({ active, reserveBottom }: { active: boolean; reserveBottom: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const core = useRef<HTMLSpanElement>(null);
  const [fallback, setFallback] = useState(false);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const gl = el.getContext('webgl', { premultipliedAlpha: true, antialias: false, alpha: true });
    if (!gl) { setFallback(true); return; }

    let program: WebGLProgram;
    try {
      program = gl.createProgram()!;
      gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
      gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('link');
    } catch { setFallback(true); return; }
    gl.useProgram(program);

    const galaxy = buildGalaxy(window.innerWidth < 600 ? 11000 : 18000);
    const attr = (name: string, data: Float32Array, size: number) => {
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(program, name);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    };
    attr('aPos', galaxy.positions, 3); attr('aColor', galaxy.colors, 3); attr('aSize', galaxy.sizes, 1); attr('aPhase', galaxy.phases, 1);
    const u = (name: string) => gl.getUniformLocation(program, name);
    const U = { angle: u('uAngle'), tilt: u('uTilt'), scale: u('uScale'), radius: u('uRadius'), time: u('uTime'), dpr: u('uDpr'), lift: u('uLift'), fade: u('uFade'), view: u('uView'), center: u('uCenter') };
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE); // additive light

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const motion = new GalaxyMotion();
    let width = 0, height = 0, dpr = 1, visible = true, frame = 0, last = performance.now(), lastScroll = window.scrollY;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = el.clientWidth; height = el.clientHeight;
      el.width = Math.round(width * dpr); el.height = Math.round(height * dpr);
      gl.viewport(0, 0, el.width, el.height);
    };
    const progress = () => {
      const hero = el.closest('section');
      const h = hero?.getBoundingClientRect();
      return h ? Math.max(0, Math.min(1, -h.top / Math.max(1, h.height))) : 0;
    };
    const draw = (now: number) => {
      const dt = (now - last) / 1000; last = now;
      const angle = reduced.matches ? motion.angle : motion.step(dt);
      const p = progress();
      const cam = cameraFor(p);
      const radius = Math.min(width * 0.6, (height - reserveBottom) * 0.9, 340);
      const centerY = Math.max(radius * 0.55, (height - reserveBottom) * 0.54);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(U.angle, angle); gl.uniform1f(U.tilt, cam.tilt); gl.uniform1f(U.scale, cam.scale);
      gl.uniform1f(U.radius, radius * dpr); gl.uniform1f(U.time, reduced.matches ? 0 : now / 1000); gl.uniform1f(U.dpr, dpr);
      gl.uniform1f(U.lift, cam.lift * height * dpr); gl.uniform1f(U.fade, 1 - p * 0.55); gl.uniform2f(U.view, el.width, el.height); gl.uniform2f(U.center, el.width / 2, centerY * dpr);
      gl.drawArrays(gl.POINTS, 0, galaxy.count);
      if (core.current) {
        core.current.style.transform = `translate(-50%, -50%) translateY(${centerY - cam.lift * height}px) scale(${cam.scale})`;
        core.current.style.opacity = String(activeRef.current ? 1 - p * 0.55 : 0);
      }
    };
    const loop = (now: number) => {
      frame = 0;
      draw(now);
      if (visible && activeRef.current && !reduced.matches && !document.hidden) frame = requestAnimationFrame(loop);
    };
    const kick = () => { if (!frame) { last = performance.now(); frame = requestAnimationFrame(loop); } };
    const onScroll = () => {
      const y = window.scrollY;
      motion.scrolled(y - lastScroll);
      lastScroll = y;
      kick(); // reduced motion still redraws once so the tilt follows the page
    };

    resize();
    const sizer = new ResizeObserver(() => { resize(); kick(); });
    sizer.observe(el);
    const seen = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) kick(); });
    seen.observe(el);
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', kick);
    kick();
    const restart = window.setInterval(() => { if (activeRef.current && visible) kick(); }, 500);

    return () => {
      cancelAnimationFrame(frame);
      window.clearInterval(restart);
      sizer.disconnect(); seen.disconnect();
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', kick);
      // Not losing the context on purpose: React may re-run this effect on the same canvas.
    };
  }, [reserveBottom]);

  if (fallback) return <img className="galaxy-art" src="/figma/galaxy-header.svg" width="358" height="230" alt=""/>;
  // WebKit doesn't always apply a parent's opacity to a WebGL layer, so the canvas fades itself with its slide.
  const fade = { opacity: active ? 1 : 0, transition: 'opacity .7s cubic-bezier(.23,1,.32,1)' };
  return <>
    <span ref={core} className="galaxy-core" aria-hidden="true" style={{ transition: fade.transition }}/>
    <canvas ref={canvas} className="galaxy-canvas" aria-hidden="true" style={fade}/>
  </>;
}
