// [QA-06] Fails if the built client bundle contains anything that looks like a long-term secret.
// Run after `npm run build`.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dist = new URL('../dist', import.meta.url).pathname;
const PATTERNS = [
  [/sk-(?:proj-)?[A-Za-z0-9_-]{20,}/, 'OpenAI secret key'],
  [/OPENAI_API_KEY/, 'OpenAI key variable name'],
  [/dangerouslyAllowBrowser/, 'browser-side OpenAI client'],
  [/STREAM_API_SECRET|SUPABASE_SERVICE_ROLE_KEY/, 'server-only variable name'],
];
const hits = [];
const walk = dir => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) { walk(path); continue; }
    if (!/\.(js|html|map|json|css)$/.test(name)) continue;
    const text = readFileSync(path, 'utf8');
    for (const [re, label] of PATTERNS) if (re.test(text)) hits.push(`${path.replace(dist, 'dist')}: ${label}`);
  }
};
walk(dist);
if (hits.length) { console.error('Possible secrets in the client bundle:\n' + hits.join('\n')); process.exit(1); }
console.log('Bundle secret scan: clean');
