import { describe, expect, it } from 'vitest';
import { buildGalaxy, GalaxyMotion, sceneFor } from './galaxy';

describe('hero galaxy', () => {
  it('[AC-10a] builds the same galaxy every time, with sane values', () => {
    const a = buildGalaxy(2000), b = buildGalaxy(2000);
    expect(a.count).toBe(2000);
    expect(Array.from(a.b.slice(0, 30))).toEqual(Array.from(b.b.slice(0, 30)));
    const all = [...a.a, ...a.b, ...a.c, ...a.colors, ...a.sizes];
    expect(all.every(Number.isFinite)).toBe(true);
    for (const shape of [a.a, a.b, a.c]) expect(Math.max(...shape.map(Math.abs))).toBeLessThan(3);
    // The spiral is tighter than the scattered cloud.
    const spread = (s: Float32Array) => { let sum = 0; for (let i = 0; i < s.length; i += 3) sum += Math.hypot(s[i], s[i + 1]); return sum / (s.length / 3); };
    expect(spread(a.a)).toBeLessThan(spread(a.c));
    expect(Math.min(...a.sizes)).toBeGreaterThan(0);
  });
  it('[AC-10b] spins forward when scrolling down, backward when scrolling up, and settles back to a slow idle spin', () => {
    const idle = new GalaxyMotion(); idle.step(1);
    const down = new GalaxyMotion(); down.scrolled(300); down.step(1);
    const up = new GalaxyMotion(); up.scrolled(-300); up.step(1);
    expect(down.angle).toBeGreaterThan(idle.angle);
    expect(up.angle).toBeLessThan(0);
    for (let i = 0; i < 300; i++) down.step(1 / 60);
    expect(Math.abs(down.velocity)).toBeLessThan(0.01);
    const fast = new GalaxyMotion(); fast.scrolled(1e6);
    expect(fast.velocity).toBe(GalaxyMotion.MAX);
  });
  it('[AC-10c] gathers on load, unwinds into a spiral, tilts, then dissolves as the hero scrolls away', () => {
    expect(sceneFor(0, 0).gather).toBe(0);
    const top = sceneFor(0), spiral = sceneFor(0.35), tilted = sceneFor(0.7), gone = sceneFor(1);
    expect([top.unwind, spiral.unwind]).toEqual([0, 1]);
    expect(tilted.tilt).toBeGreaterThan(spiral.tilt);
    expect([spiral.dissolve, gone.dissolve]).toEqual([0, 1]);
    expect(gone.fade).toBeLessThan(top.fade);
    expect(sceneFor(-1)).toEqual(top);
    expect(sceneFor(5)).toEqual(gone);
  });
});
