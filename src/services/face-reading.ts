// AI face reading client (REQ-09). The photo is shrunk on the device, sent once to /api/face-reading,
// and never stored: not in the browser, not on our server.
export type FaceReading = {
  summary: string;
  zones: { zone: 'upper' | 'middle' | 'lower'; reading: string }[];
  features: { feature: 'forehead' | 'eyebrows' | 'eyes' | 'nose' | 'mouth'; reading: string }[];
  advice: string;
};
export type FaceReadingError = 'no_face' | 'invalid_image' | 'unavailable';

export const MAX_SIDE = 640;
export const READING_TIMEOUT_MS = 30_000;

/** Fits width × height inside a square of `max` px, keeping the aspect ratio and never enlarging. */
export function fitWithin(width: number, height: number, max = MAX_SIDE) {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

/** Resizes a chosen photo to a small JPEG data URL (≈60–150 KB), honouring the camera's rotation. */
export async function preparePhoto(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('invalid_image');
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const size = fitWithin(bitmap.width, bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, size.width, size.height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', 0.82);
}

export async function readFace(image: string, language: string): Promise<FaceReading> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), READING_TIMEOUT_MS);
  try {
    const res = await fetch('/api/face-reading', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
      body: JSON.stringify({ image, language }),
    });
    if (res.ok) return await res.json() as FaceReading;
    const code: FaceReadingError = res.status === 422 ? 'no_face' : res.status === 400 ? 'invalid_image' : 'unavailable';
    throw new Error(code);
  } catch (err) {
    if (err instanceof Error && ['no_face', 'invalid_image', 'unavailable'].includes(err.message)) throw err;
    throw new Error('unavailable');
  } finally {
    clearTimeout(timer);
  }
}
