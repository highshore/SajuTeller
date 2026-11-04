// Runs every end-to-end check one after another (they share ports) and fails if any of them fails.
// Each check starts its own Vite server and mocks Supabase, Stream and Maps, so nothing real is contacted.
import { spawnSync } from 'node:child_process';

const checks = [
  'responsive-layout-check', 'auth-check', 'onboarding-check', 'notifications-check', 'global-experience-check',
  'progressive-rendering-check', 'google-maps-check', 'visual-check', 'business-chat-check',
];
const only = process.argv.slice(2);
const results = [];
for (const name of only.length ? checks.filter(c => only.includes(c)) : checks) {
  const started = Date.now();
  const run = spawnSync(process.execPath, [`scripts/${name}.mjs`], { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8', timeout: 5 * 60_000 });
  const lines = `${run.stdout}${run.stderr}`.trim().split('\n');
  const ok = run.status === 0;
  results.push({ name, ok, seconds: Math.round((Date.now() - started) / 1000) });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name} (${results.at(-1).seconds}s)`);
  if (!ok) console.log(lines.filter(l => !/^\s+at /.test(l)).slice(-12).join('\n'));
}
const failed = results.filter(r => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} end-to-end checks passed`);
process.exit(failed ? 1 : 0);
