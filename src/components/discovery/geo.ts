// Web Mercator helpers shared by the studio map overlay.
// Google Maps (and OSM) render 256px tiles in this projection, so with a known
// centre + integer zoom we can place our own pins over the embedded map.

export type LatLng = { lat: number; lng: number };
export type Point = { x: number; y: number };
export type Bounds = { north: number; south: number; east: number; west: number };

const TILE = 256;
export const MIN_ZOOM = 10;
export const MAX_ZOOM = 18;

export function project({ lat, lng }: LatLng, zoom: number): Point {
  const scale = TILE * 2 ** zoom;
  const sin = Math.min(Math.max(Math.sin((lat * Math.PI) / 180), -0.9999), 0.9999);
  return { x: ((lng + 180) / 360) * scale, y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale };
}

export function unproject({ x, y }: Point, zoom: number): LatLng {
  const scale = TILE * 2 ** zoom;
  const lng = (x / scale) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * y) / scale;
  return { lat: (180 / Math.PI) * Math.atan(Math.sinh(n)), lng };
}

/** Screen position of a coordinate inside a viewport of `size`, centred on `center`. */
export function toScreen(point: LatLng, center: LatLng, zoom: number, size: { w: number; h: number }): Point {
  const p = project(point, zoom);
  const c = project(center, zoom);
  return { x: p.x - c.x + size.w / 2, y: p.y - c.y + size.h / 2 };
}

export function boundsOf(points: LatLng[]): Bounds | null {
  if (!points.length) return null;
  return points.reduce<Bounds>((b, p) => ({
    north: Math.max(b.north, p.lat), south: Math.min(b.south, p.lat),
    east: Math.max(b.east, p.lng), west: Math.min(b.west, p.lng),
  }), { north: -90, south: 90, east: -180, west: 180 });
}

/** Visible bounds of a viewport. */
export function viewBounds(center: LatLng, zoom: number, size: { w: number; h: number }): Bounds {
  const c = project(center, zoom);
  const nw = unproject({ x: c.x - size.w / 2, y: c.y - size.h / 2 }, zoom);
  const se = unproject({ x: c.x + size.w / 2, y: c.y + size.h / 2 }, zoom);
  return { north: nw.lat, south: se.lat, east: se.lng, west: nw.lng };
}

export const inBounds = (p: LatLng, b: Bounds) => p.lat <= b.north && p.lat >= b.south && p.lng <= b.east && p.lng >= b.west;

/**
 * Centre + zoom that fit `bounds` inside the free area of a viewport.
 * `inset` is the part of the viewport covered by floating UI (search bar, sheet).
 */
export function fitBounds(bounds: Bounds, size: { w: number; h: number }, inset: { top: number; right: number; bottom: number; left: number }, pad = 36): { center: LatLng; zoom: number } {
  const freeW = Math.max(80, size.w - inset.left - inset.right - pad * 2);
  const freeH = Math.max(80, size.h - inset.top - inset.bottom - pad * 2);
  let zoom = MIN_ZOOM;
  for (let z = MAX_ZOOM - 2; z >= MIN_ZOOM; z--) {
    const nw = project({ lat: bounds.north, lng: bounds.west }, z);
    const se = project({ lat: bounds.south, lng: bounds.east }, z);
    if (se.x - nw.x <= freeW && se.y - nw.y <= freeH) { zoom = z; break; }
  }
  // Put the bounds' middle at the middle of the free area, then convert back to a map centre.
  const nw = project({ lat: bounds.north, lng: bounds.west }, zoom);
  const se = project({ lat: bounds.south, lng: bounds.east }, zoom);
  const mid = { x: (nw.x + se.x) / 2, y: (nw.y + se.y) / 2 };
  const freeMid = { x: inset.left + (size.w - inset.left - inset.right) / 2, y: inset.top + (size.h - inset.top - inset.bottom) / 2 };
  const center = unproject({ x: mid.x - (freeMid.x - size.w / 2), y: mid.y - (freeMid.y - size.h / 2) }, zoom);
  return { center, zoom };
}

/** Greedy pixel clustering: pins closer than `radius` px at this zoom share one marker. */
export function cluster<T extends LatLng>(items: T[], zoom: number, radius: number): { items: T[]; at: LatLng }[] {
  const groups: { items: T[]; px: Point }[] = [];
  for (const item of items) {
    const p = project(item, zoom);
    const near = groups.find(g => Math.abs(g.px.x - p.x) < radius * 1.6 && Math.abs(g.px.y - p.y) < radius);
    if (near) near.items.push(item);
    else groups.push({ items: [item], px: p });
  }
  return groups.map(g => {
    const lat = g.items.reduce((s, i) => s + i.lat, 0) / g.items.length;
    const lng = g.items.reduce((s, i) => s + i.lng, 0) / g.items.length;
    return { items: g.items, at: { lat, lng } };
  });
}
