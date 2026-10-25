// A spiral galaxy as point data: bulge, logarithmic arms, star-forming knots and a thin halo.
// Pure (no DOM) so it can be tested. Coordinates are in galaxy units: the disk spans roughly -1..1.

export type GalaxyData = { positions: Float32Array; colors: Float32Array; sizes: Float32Array; phases: Float32Array; count: number };

const mulberry = (seed: number) => () => {
  seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

type RGB = [number, number, number];
const CORE: RGB = [1, 0.86, 0.66];     // warm, old stars
const DISK: RGB = [0.93, 0.89, 0.98];  // white-lilac
const ARM: RGB = [0.62, 0.72, 1];      // young blue stars
const VIOLET: RGB = [0.74, 0.56, 1];   // brand violet in the arms
const KNOT: RGB = [1, 0.5, 0.72];      // pink nebula knots
const GOLD: RGB = [0.95, 0.78, 0.45];  // brand gold accents
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

export function buildGalaxy(count: number, seed = 20261025, arms = 2): GalaxyData {
  const rand = mulberry(seed);
  const gauss = () => { let u = 0; while (u === 0) u = rand(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand()); };
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);
  const twist = 3.1; // how tightly the arms wind

  for (let i = 0; i < count; i++) {
    const kind = rand();
    let x: number, y: number, z: number, color: RGB, size: number;
    if (kind < 0.14) {
      // Bulge: dense, warm, slightly flattened sphere.
      const r = Math.abs(gauss()) * 0.085;
      const a = rand() * Math.PI * 2, b = Math.acos(2 * rand() - 1);
      x = r * Math.sin(b) * Math.cos(a); y = r * Math.sin(b) * Math.sin(a) * 0.95; z = r * Math.cos(b) * 0.55;
      color = mix(CORE, [1, 0.95, 0.85], rand() * 0.5); size = 0.8 + rand() * 1.2;
    } else if (kind < 0.94) {
      // Arms: stars spread around logarithmic spirals, more scatter further out.
      const r = 0.08 + Math.pow(rand(), 0.85) * 0.95;
      const arm = Math.floor(rand() * arms);
      const spread = 0.2 * (0.3 + r) * gauss();
      const theta = arm * (Math.PI * 2 / arms) + Math.log(r + 0.05) * twist + spread / Math.max(r, 0.1);
      const jitter = 0.012 + r * 0.03;
      x = Math.cos(theta) * r + gauss() * jitter; y = Math.sin(theta) * r + gauss() * jitter; z = gauss() * 0.02 * (1.2 - r);
      const onArm = Math.exp(-Math.abs(spread) * 9);
      color = rand() < 0.035 && onArm > 0.5 ? KNOT : rand() < 0.04 ? GOLD : mix(mix(CORE, DISK, Math.min(1, r * 2.2)), rand() < 0.45 ? VIOLET : ARM, onArm * Math.min(1, r * 1.5));
      size = (color === KNOT ? 1.8 : 0.5) + rand() * 1.1 * (0.4 + onArm);
    } else {
      // Halo and inter-arm dust: faint, scattered.
      const r = 0.1 + rand() * 1.15, a = rand() * Math.PI * 2;
      x = Math.cos(a) * r; y = Math.sin(a) * r; z = gauss() * 0.06;
      color = mix(DISK, VIOLET, rand() * 0.6); size = 0.4 + rand() * 0.5;
    }
    positions.set([x, y, z], i * 3);
    colors.set(color, i * 3);
    sizes[i] = size;
    phases[i] = rand() * Math.PI * 2;
  }
  return { positions, colors, sizes, phases, count };
}

/**
 * Scroll-driven motion: scrolling down spins forward, up spins back, with momentum that eases out.
 * Progress (0 at the top, 1 when the hero has scrolled away) tilts and zooms the galaxy.
 */
export class GalaxyMotion {
  angle = 0;
  velocity = 0;
  static readonly IDLE = 0.035;      // rad/s, always turning slowly
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

/**
 * Camera from scroll progress: tilted at the top, opening up and drawing closer as you scroll.
 * lift is negative (moves the galaxy down) so it moves at ~15% of the page speed and stays in view longer.
 */
export function cameraFor(progress: number) {
  const p = Math.max(0, Math.min(1, progress));
  const ease = p * p * (3 - 2 * p);
  return { tilt: 1.0 - ease * 0.5, scale: 1 + ease * 0.45, lift: -p * 0.85 };
}
