import { describe, expect, it } from 'vitest';
import { buildGalaxy, cameraFor, GalaxyMotion } from './galaxy';

describe('hero galaxy', () => {
  it('[AC-10a] builds the same galaxy every time, with sane values', () => {
    const a = buildGalaxy(2000), b = buildGalaxy(2000);
    expect(a.count).toBe(2000);
    expect(Array.from(a.positions.slice(0, 30))).toEqual(Array.from(b.positions.slice(0, 30)));
    const all = [...a.positions, ...a.colors, ...a.sizes];
    expect(all.every(Number.isFinite)).toBe(true);
    expect(Math.max(...a.positions.map(Math.abs))).toBeLessThan(2);
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
  it('[AC-10c] opens up and draws closer as the hero scrolls away, and stays within limits', () => {
    const top = cameraFor(0), mid = cameraFor(0.5), end = cameraFor(1);
    expect(mid.tilt).toBeLessThan(top.tilt);
    expect(end.scale).toBeGreaterThan(mid.scale);
    expect(cameraFor(-1)).toEqual(top);
    expect(cameraFor(5)).toEqual(end);
  });
});
