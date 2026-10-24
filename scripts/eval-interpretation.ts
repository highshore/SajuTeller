// Interpretation evaluation (QA-01 latency, QA-02 meaning) on the T-VOICE set.
//
//   OPENAI_API_KEY=… npm run eval:interpretation                 # run all cases, write a results CSV
//   OPENAI_API_KEY=… npm run eval:interpretation -- --only ko-01 # one case
//   npm run eval:interpretation -- --score eval/interpretation/results/<file>.csv  # after two raters fill in scores
//
// Uses the same instructions, model, voice and turn detection as the app, so the numbers describe
// what users get. Speech for each line is generated once with OpenAI TTS and cached locally.
// The key is read from the environment only; never commit it.
// [QA-01] [QA-02]
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { translationInstructions } from '../src/components/live/instructions';
import { LATENCY_TARGET, meetsLatencyTarget, summarize } from '../src/components/live/session-policy';
import { rightDirection, scoreRatings, termHits } from '../src/components/live/eval-scoring';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'eval', 'interpretation');
const MODEL = 'gpt-realtime';
const TERM_TARGET = 0.9;
type Case = { id: string; speaker: 'reader' | 'visitor'; text: string; expect: string[][] };
type Result = { id: string; text: string; transcript: string; output: string; latencyMs: number | null; terms: string; missed: string; direction: boolean; error: string };

const args = process.argv.slice(2);
const flag = (name: string) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };

if (flag('--score')) {
  const lines = readFileSync(flag('--score')!, 'utf8').trim().split('\n');
  const header = parseCsvLine(lines[0]);
  const rows = lines.slice(1).map(parseCsvLine).map(cols => ({ id: cols[header.indexOf('id')], rater1: Number(cols[header.indexOf('rater1')]), rater2: Number(cols[header.indexOf('rater2')]) }));
  const s = scoreRatings(rows);
  console.log(JSON.stringify(s, null, 2));
  process.exit(s.pass ? 0 : 1);
}

const key = process.env.OPENAI_API_KEY;
if (!key) { console.error('Set OPENAI_API_KEY in the environment.'); process.exit(2); }
const suite = JSON.parse(readFileSync(join(root, 'cases.json'), 'utf8')) as { targetLanguage: string; cases: Case[] };
const cases = suite.cases.filter(c => !flag('--only') || c.id === flag('--only'));

async function speech(c: Case): Promise<Buffer> {
  const file = join(root, 'audio', `${c.id}.pcm`);
  if (existsSync(file)) return readFileSync(file);
  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-4o-mini-tts', voice: c.speaker === 'reader' ? 'onyx' : 'alloy', input: c.text, response_format: 'pcm' }),
  });
  if (!res.ok) throw new Error(`TTS failed (${res.status})`);
  const pcm = Buffer.from(await res.arrayBuffer()); // 24 kHz, 16-bit, mono
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, pcm);
  return pcm;
}

function runCase(c: Case, pcm: Buffer): Promise<Result> {
  return new Promise(resolve => {
    const result: Result = { id: c.id, text: c.text, transcript: '', output: '', latencyMs: null, terms: '', missed: '', direction: false, error: '' };
    const ws = new WebSocket(`wss://api.openai.com/v1/realtime?model=${MODEL}`, ['realtime', `openai-insecure-api-key.${key}`]);
    let stoppedAt: number | null = null;
    const finish = (error = '') => {
      clearTimeout(timer);
      result.error ||= error;
      const t = termHits(result.output, c.expect);
      result.terms = `${t.hit}/${t.total}`;
      result.missed = t.missed.join('; ');
      result.direction = rightDirection(c.text, result.output);
      try { ws.close(); } catch { /* already closed */ }
      resolve(result);
    };
    const timer = setTimeout(() => finish('timeout'), 45_000);
    const send = (event: object) => ws.send(JSON.stringify(event));
    ws.onopen = () => {
      // Same session settings as useRealtimeAgent.
      send({ type: 'session.update', session: {
        type: 'realtime', instructions: translationInstructions(suite.targetLanguage), output_modalities: ['audio'],
        audio: {
          input: { format: { type: 'audio/pcm', rate: 24000 }, transcription: { model: 'whisper-1' }, turn_detection: { type: 'server_vad', threshold: 0.1, prefix_padding_ms: 200, silence_duration_ms: 500 } },
          output: { format: { type: 'audio/pcm', rate: 24000 }, voice: 'coral' },
        },
      } });
      // 100 ms chunks, then 1.5 s of silence so the server detects the end of speech.
      const chunk = 4800;
      const audio = Buffer.concat([pcm, Buffer.alloc(24000 * 2 * 1.5)]);
      for (let i = 0; i < audio.length; i += chunk) send({ type: 'input_audio_buffer.append', audio: audio.subarray(i, i + chunk).toString('base64') });
    };
    ws.onmessage = (message) => {
      const event = JSON.parse(String(message.data));
      if (event.type === 'input_audio_buffer.speech_stopped') stoppedAt = performance.now();
      else if (event.type === 'response.output_audio.delta' && stoppedAt !== null && result.latencyMs === null) result.latencyMs = Math.round(performance.now() - stoppedAt);
      else if (event.type === 'conversation.item.input_audio_transcription.completed') result.transcript = event.transcript ?? '';
      else if (event.type === 'response.output_audio_transcript.done') result.output = event.transcript ?? '';
      else if (event.type === 'response.done') finish();
      else if (event.type === 'error') finish(event.error?.message ?? 'error');
    };
    ws.onerror = () => finish('websocket error');
  });
}

function csv(value: unknown) { const s = String(value ?? ''); return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s; }
function parseCsvLine(line: string): string[] {
  const out: string[] = []; let cur = ''; let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) { if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (ch === '"') quoted = false; else cur += ch; }
    else if (ch === '"') quoted = true; else if (ch === ',') { out.push(cur); cur = ''; } else cur += ch;
  }
  out.push(cur);
  return out;
}

const results: Result[] = [];
for (const c of cases) {
  try {
    const r = await runCase(c, await speech(c));
    results.push(r);
    console.log(`${r.id}  ${r.latencyMs ?? '—'} ms  terms ${r.terms}  ${r.direction ? '' : 'WRONG DIRECTION  '}${r.error}`);
  } catch (err) {
    results.push({ id: c.id, text: c.text, transcript: '', output: '', latencyMs: null, terms: '', missed: '', direction: false, error: String(err) });
    console.log(`${c.id}  failed: ${err}`);
  }
}

const latency = summarize(results.flatMap(r => r.latencyMs === null ? [] : [r.latencyMs]));
const hits = results.reduce((n, r) => n + Number(r.terms.split('/')[0] || 0), 0);
const total = results.reduce((n, r) => n + Number(r.terms.split('/')[1] || 0), 0);
const termRate = total ? hits / total : 0;
const outDir = join(root, 'results');
mkdirSync(outDir, { recursive: true });
const file = join(outDir, `${new Date().toISOString().replace(/[:.]/g, '-')}.csv`);
writeFileSync(file, ['id,text,heard,output,latency_ms,terms,missed,direction_ok,error,rater1,rater2',
  ...results.map(r => [r.id, r.text, r.transcript, r.output, r.latencyMs, r.terms, r.missed, r.direction, r.error, '', ''].map(csv).join(','))].join('\n') + '\n');

const summary = {
  model: MODEL, cases: results.length, latency, latencyTarget: LATENCY_TARGET, latencyPass: meetsLatencyTarget(latency),
  termAccuracy: Number(termRate.toFixed(3)), termTarget: TERM_TARGET, termPass: termRate >= TERM_TARGET,
  wrongDirection: results.filter(r => !r.direction).map(r => r.id), failed: results.filter(r => r.error).map(r => r.id),
  results: file, next: 'Two bilingual raters fill rater1/rater2 (1–5) in the CSV, then run with --score <file> for QA-02.',
};
console.log(JSON.stringify(summary, null, 2));
process.exit(summary.latencyPass && summary.termPass && !summary.failed.length ? 0 : 1);
