import { openaiKey, reply, sameOrigin } from '../server/openai.js';
import { parseReading } from '../server/face-reading.js';

// AI face reading (관상). The photo is analysed in memory and never stored or logged.
// The model reads only traditional gwansang symbolism; it must not judge looks, age, ethnicity or health.
type Body = { image?: unknown; language?: unknown };
const LANGUAGES: Record<string, string> = { en: 'English', ko: 'Korean', zh: 'Simplified Chinese', ja: 'Japanese', es: 'Spanish' };
const MAX_IMAGE_CHARS = 1_600_000; // ≈1.2 MB JPEG as a data URL; the app sends ~100–200 KB
const IMAGE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/;

const instructions = (language: string) => `You are a warm, respectful reader of gwansang (관상), the traditional Korean art of face reading, for a cultural entertainment app.
Look at the photo and give a reading in ${language}.

Rules:
- Read only traditional gwansang symbolism: the three zones (upper: forehead, early years; middle: brows to nose tip, mid-life; lower: philtrum to chin, later years) and the five features (forehead, eyebrows, eyes, nose, mouth).
- Keep every reading kind, balanced and constructive. Frame tendencies as strengths and gentle suggestions.
- Never comment on attractiveness, weight, skin, age, ethnicity, race, gender, health, disability, emotions or identity, and never guess who the person is.
- If there is not exactly one clear, real human face, set face_found to false and leave the other fields empty.
- Short sentences. summary: 2 sentences. Each zone and feature: 1 sentence. advice: 1 sentence.

Reply with JSON only:
{"face_found": true, "summary": "...", "zones": [{"zone": "upper", "reading": "..."}, {"zone": "middle", "reading": "..."}, {"zone": "lower", "reading": "..."}],
 "features": [{"feature": "forehead", "reading": "..."}, {"feature": "eyebrows", "reading": "..."}, {"feature": "eyes", "reading": "..."}, {"feature": "nose", "reading": "..."}, {"feature": "mouth", "reading": "..."}], "advice": "..."}`;

export async function POST(req: Request) {
  if (!sameOrigin(req)) return reply(403, { code: 'forbidden' });
  let body: Body;
  try { body = await req.json() as Body; } catch { return reply(400, { code: 'invalid_request' }); }
  const image = typeof body?.image === 'string' ? body.image : '';
  const language = typeof body?.language === 'string' && body.language in LANGUAGES ? body.language : 'en';
  if (!image || image.length > MAX_IMAGE_CHARS || !IMAGE.test(image)) return reply(400, { code: 'invalid_image' });
  const key = openaiKey();
  if (!key) return reply(503, { code: 'not_configured' });
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini', temperature: 0.7, max_tokens: 700, response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: instructions(LANGUAGES[language]) },
          { role: 'user', content: [{ type: 'text', text: 'Please read this face.' }, { type: 'image_url', image_url: { url: image, detail: 'low' } }] },
        ],
      }),
    });
    // Never log the image or the provider's response body.
    if (!res.ok) { console.error('face-reading: OpenAI request failed', { status: res.status }); return reply(502, { code: 'reading_failed' }); }
    const data = await res.json() as { choices?: { message?: { content?: string } }[] };
    let parsed: unknown;
    try { parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}'); } catch { return reply(502, { code: 'reading_failed' }); }
    const reading = parseReading(parsed);
    if (reading === 'no_face') return reply(422, { code: 'no_face' });
    if (!reading) return reply(502, { code: 'reading_failed' });
    return reply(200, reading);
  } catch (error) {
    console.error('face-reading failed', { name: error instanceof Error ? error.name : 'unknown' });
    return reply(502, { code: 'reading_failed' });
  }
}
