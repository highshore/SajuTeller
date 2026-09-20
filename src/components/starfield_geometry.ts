/** Shared, deterministic geometry for the canvas and editable design snapshots. */
export function makeStars(count = 2400) {
  let seed = 87231;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  return Array.from({ length: count }, (_, i) => {
    const radius = Math.pow(random(), 0.7);
    const angle = radius * 7.5 + (i % 3) * Math.PI * 2 / 3 + (random() - 0.5) * 0.45;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      z: (random() - 0.5) * 0.3 * (1 - radius * 0.6),
      size: 0.35 + random() ** 5 * 2.5,
      alpha: 0.35 + random() * 0.65,
      warm: random() > 0.84,
      field: i % 6 === 0,
      fieldX: random(),
      fieldY: random(),
    };
  });
}

export function projectStar(star: ReturnType<typeof makeStars>[number], width: number, height: number, progress: number, phase: number, hero: boolean) {
  const mobile = width <= 700;
  const cx = width * (mobile ? 0.5 : 0.77);
  const cy = mobile && hero ? 125 : height * 0.5;
  const scale = mobile ? Math.min(width * 0.46, 245) : Math.min(width * 0.3, height * 0.64);
  const angle = phase + progress * 1.8;
  const x = star.x * Math.cos(angle) - star.y * Math.sin(angle);
  const y = star.x * Math.sin(angle) + star.y * Math.cos(angle);
  const tilt = 0.55 + progress * 0.55;
  const z = y * Math.sin(tilt) + star.z;
  const perspective = 2.6 / (2.8 + z - progress * 0.3);
  const px = star.field ? star.fieldX * width : cx + x * scale * perspective;
  const py = star.field ? ((star.fieldY * height - progress * (30 + star.size * 25)) % height + height) % height : cy + y * Math.cos(tilt) * scale * perspective;
  return { x: px, y: py, size: star.size * (star.field ? 0.65 : perspective), alpha: star.alpha * (star.field ? 0.5 : 1), cx, cy, scale };
}
