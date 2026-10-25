// Validation for AI face readings (REQ-09). Shared by api/face-reading.ts and its tests.
export const ZONES = ['upper', 'middle', 'lower'] as const;
export const FEATURES = ['forehead', 'eyebrows', 'eyes', 'nose', 'mouth'] as const;

export type FaceReading = {
  summary: string;
  zones: { zone: typeof ZONES[number]; reading: string }[];
  features: { feature: typeof FEATURES[number]; reading: string }[];
  advice: string;
};

/** Accepts only a complete reading with every zone and feature once; anything else is rejected. */
export function parseReading(raw: unknown): FaceReading | 'no_face' | null {
  const r = raw as { face_found?: unknown; summary?: unknown; zones?: unknown; features?: unknown; advice?: unknown };
  if (!r || typeof r !== 'object') return null;
  if (r.face_found === false) return 'no_face';
  const text = (v: unknown) => typeof v === 'string' && v.trim().length > 0 && v.length <= 600;
  if (r.face_found !== true || !text(r.summary) || !text(r.advice) || !Array.isArray(r.zones) || !Array.isArray(r.features)) return null;
  const zones = ZONES.map(zone => (r.zones as { zone?: unknown; reading?: unknown }[]).find(z => z?.zone === zone));
  const features = FEATURES.map(feature => (r.features as { feature?: unknown; reading?: unknown }[]).find(f => f?.feature === feature));
  if (zones.some(z => !z || !text(z.reading)) || features.some(f => !f || !text(f.reading))) return null;
  return {
    summary: (r.summary as string).trim(),
    zones: ZONES.map((zone, i) => ({ zone, reading: (zones[i]!.reading as string).trim() })),
    features: FEATURES.map((feature, i) => ({ feature, reading: (features[i]!.reading as string).trim() })),
    advice: (r.advice as string).trim(),
  };
}

