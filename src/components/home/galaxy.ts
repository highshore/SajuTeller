// Hero galaxy as point data with three shapes per star, blended by scroll (REQ-10):
//   a — a compact, clumpy galaxy (where it gathers on load)
//   b — a clean, face-on two-arm spiral (what scrolling unwinds it into)
//   c — a scattered cloud (where it starts, and where it dissolves to)
// Pure (no DOM) so it can be tested. Disk coordinates span roughly -1..1.

export type GalaxyData = { a: Float32Array; b: Float32Array; c: Float32Array; colors: Float32Array; sizes: Float32Array; phases: Float32Array; count: number };

const mulberry = (seed: number) => () => {
  seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

type RGB = [number, number, number];
// Star colours by temperature: mostly white and blue-white, some orange, a few brand-gold.
const WHITE: RGB = [1, 0.97, 0.94];
const BLUE: RGB = [0.72, 0.83, 1];
const ORANGE: RGB = [1, 0.7, 0.48];
const GOLD: RGB = [0.95, 0.8, 0.52];
const DUST: RGB = [0.55, 0.62, 0.85];

export function buildGalaxy(count: number, seed = 20261025): GalaxyData {
  const rand = mulberry(seed);
  const gauss = () => { let u = 0; while (u === 0) u = rand(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand()); };
  const a = new Float32Array(count * 3), b = new Float32Array(count * 3), c = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3), sizes = new Float32Array(count), phases = new Float32Array(count);
  // Clumps for the flocculent shape: star-forming knots scattered through a compact disk.
  const clumps = Array.from({ length: 60 }, () => { const r = 0.1 + Math.pow(rand(), 0.8) * 0.75, t = rand() * Math.PI * 2; return [Math.cos(t) * r, Math.sin(t) * r]; });
  const TWIST = 2.9;

  for (let i = 0; i < count; i++) {
    const bright = rand() < 0.1;
    const inBulge = rand() < 0.12;
    // b: clean spiral.
    let bx: number, by: number, bz: number, r: number;
    if (inBulge) {
      r = Math.abs(gauss()) * 0.07;
      const t = rand() * Math.PI * 2;
      bx = Math.cos(t) * r; by = Math.sin(t) * r; bz = gauss() * 0.03;
    } else {
      r = 0.07 + Math.pow(rand(), 0.9) * 0.95;
      const arm = rand() < 0.5 ? 0 : Math.PI;
      const theta = arm + Math.log(r) * TWIST + gauss() * 0.07;
      const spread = 0.012 + r * 0.025;
      bx = Math.cos(theta) * r + gauss() * spread; by = Math.sin(theta) * r + gauss() * spread; bz = gauss() * 0.015;
    }
    // a: compact and clumpy, smeared arms pulled toward knots.
    const k = clumps[Math.floor(rand() * clumps.length)];
    const pull = inBulge ? 0 : 0.55 + rand() * 0.3;
    const ar = 0.95;
    const ax = bx * ar * (1 - pull) + k[0] * pull + gauss() * 0.028;
    const ay = by * ar * (1 - pull) + k[1] * pull + gauss() * 0.028;
    // c: wide scattered cloud.
    const cr = 0.5 + Math.pow(rand(), 0.6) * 1.3, ct = rand() * Math.PI * 2;
    b.set([bx, by, bz], i * 3);
    a.set([ax, ay, bz * 1.5], i * 3);
    c.set([Math.cos(ct) * cr, Math.sin(ct) * cr, gauss() * 0.4], i * 3);

    const pick = rand();
    const color: RGB = !bright ? DUST : pick < 0.42 ? WHITE : pick < 0.78 ? BLUE : pick < 0.95 ? ORANGE : GOLD;
    colors.set(inBulge && bright ? WHITE : color, i * 3);
    sizes[i] = bright ? 2.8 + rand() * 3.4 : 0.8 + rand() * 0.9;
    phases[i] = rand() * Math.PI * 2;
  }
  return { a, b, c, colors, sizes, phases, count };
}

/**
 * Scroll-driven spin: scrolling down turns it forward, up turns it back, with momentum that eases
 * out to a slow idle spin.
 */
export class GalaxyMotion {
  angle = 0;
  velocity = 0;
  static readonly IDLE = 0.04;        // rad/s, always turning slowly
  static readonly PER_PIXEL = 0.0016; // rad/s added per scrolled pixel
  static readonly MAX = 2.4;          // rad/s cap
  static readonly DAMPING = 2.2;      // per second

  scrolled(deltaPixels: number) {
    this.velocity = Math.max(-GalaxyMotion.MAX, Math.min(GalaxyMotion.MAX, this.velocity + deltaPixels * GalaxyMotion.PER_PIXEL));
  }

  step(dt: number) {
    const d = Math.min(dt, 0.1);
    this.angle += (GalaxyMotion.IDLE + this.velocity) * d;
    this.velocity *= Math.exp(-GalaxyMotion.DAMPING * d);
    return this.angle;
  }
}

const smooth = (edge0: number, edge1: number, x: number) => { const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0))); return t * t * (3 - 2 * t); };

/**
 * Scene from scroll progress (0 at the top, 1 when the hero has scrolled away) and the load intro (0→1):
 * gather (scatter → clumpy) on load, unwind (clumpy → spiral) by 35%, tilt from 30–70%, dissolve from 65%.
 * lift = -progress keeps the galaxy pinned on screen while the hero scrolls past (like a sticky scene).
 */
export function sceneFor(progress: number, intro = 1) {
  const p = Math.max(0, Math.min(1, progress));
  return {
    gather: Math.max(0, Math.min(1, intro)),
    unwind: smooth(0, 0.35, p),
    tilt: 0.12 + smooth(0.3, 0.7, p) * 0.85,
    dissolve: smooth(0.65, 1, p),
    scale: 1 + p * 0.22,
    lift: -p,
    fade: 1 - smooth(0.75, 1, p) * 0.55,
  };
}
