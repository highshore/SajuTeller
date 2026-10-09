// Deterministic auth UI checks. Supabase Auth is stubbed: no users or emails are created.
import { createServer } from 'vite';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const server = await createServer({ server: { host: '127.0.0.1', port: 5177 } });
await server.listen();
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}), args: ['--no-sandbox'] });
const output = process.env.QA_OUTPUT_DIR || '/tmp/saju-auth-qa';
await mkdir(output, { recursive: true });
const origin = 'http://127.0.0.1:5177';
const user = { id: '11111111-1111-4111-8111-111111111111', aud: 'authenticated', role: 'authenticated', email: 'qa@example.invalid', email_confirmed_at: '2026-10-01T00:00:00Z', created_at: '2026-10-01T00:00:00Z', app_metadata: { provider: 'email' }, user_metadata: {} };
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.clock.install();
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  const calls = { signup: 0, recover: 0, resend: 0 };
  let loginSucceeds = false;
  let settingsFail = false;
  await page.route(/https:\/\/(fonts\.(googleapis|gstatic)\.com|images\.unsplash\.com)/, route => route.abort());
  await page.route('https://jbwuefecydjkieplftia.supabase.co/**', async route => {
    const url = new URL(route.request().url());
    const json = (body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
    if (url.pathname.endsWith('/settings')) return json({ external: { email: true, google: false, kakao: false, phone: false } }, settingsFail ? 503 : 200);
    if (url.pathname.endsWith('/signup')) { calls.signup++; return json({ ...user, identities: [] }); }
    if (url.pathname.endsWith('/recover')) { calls.recover++; return json({}); }
    if (url.pathname.endsWith('/resend')) { calls.resend++; return json({}); }
    if (url.pathname.endsWith('/token')) {
      if (!loginSucceeds) return json({ error_code: 'invalid_credentials', code: 'invalid_credentials', msg: 'Invalid login credentials' }, 400);
      const token = `${Buffer.from('{}').toString('base64url')}.${Buffer.from(JSON.stringify({ sub: user.id, exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url')}.test`;
      return json({ access_token: token, refresh_token: 'test-refresh', expires_in: 3600, token_type: 'bearer', user });
    }
    if (url.pathname.endsWith('/user')) return json(user);
    if (url.pathname.endsWith('/profiles')) return json([{ onboarding_completed: true }]);
    return json([]);
  });
  const navigate = path => page.goto(origin + path, { waitUntil: 'domcontentloaded' });
  const layout = async () => {
    assert.ok(await page.locator('[data-app-shell]').evaluate(el => el.scrollWidth <= el.clientWidth + 1), 'No app overflow');
    assert.equal(await page.locator('[data-global-header]').count(), 1);
    assert.equal(await page.locator('[data-global-bottom-nav] a').count(), 4);
  };
  await navigate('/sign-in?next=/studio');
  await page.getByRole('button', { name: 'Continue with email' }).waitFor();
  assert.equal(await page.getByRole('button', { name: /Continue with (Kakao|Google|phone)/ }).count(), 0);
  await page.locator('[data-emoji="crystal-ball"] svg').waitFor(); await page.evaluate(() => document.fonts.ready); await layout();
  await page.screenshot({ path: `${output}/methods-mobile.png`, fullPage: true });
  await page.getByRole('button', { name: 'Continue with email' }).click();
  await page.getByRole('heading', { name: 'Welcome back' }).waitFor();
  await page.locator('[data-emoji="waving-hand"] svg').waitFor();
  await page.getByLabel('Email address').fill('qa@example.invalid');
  await page.getByLabel('Password', { exact: true }).fill('good-password-123');
  await page.getByRole('button', { name: 'Show password' }).click();
  assert.equal(await page.getByLabel('Password', { exact: true }).getAttribute('type'), 'text');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.getByRole('alert').filter({ hasText: 'Your email or password is incorrect' }).waitFor();
  await page.screenshot({ path: `${output}/signin-mobile.png`, fullPage: true });
  await page.getByRole('button', { name: 'Sign up', exact: true }).click();
  assert.equal(await page.getByLabel('Password', { exact: true }).inputValue(), '');
  assert.equal(await page.getByLabel('Password', { exact: true }).getAttribute('type'), 'password');
  await page.getByLabel('Password', { exact: true }).fill('good-password-123');
  await page.getByLabel('Confirm password').fill('different-password');
  assert.equal(await page.getByRole('button', { name: 'Create account', exact: true }).isDisabled(), true);
  await page.getByRole('status').filter({ hasText: 'Passwords do not match' }).waitFor();
  await page.getByLabel('Confirm password').fill('good-password-123');
  await page.screenshot({ path: `${output}/signup-mobile.png`, fullPage: true });
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  const dialog = page.getByRole('dialog'); await dialog.waitFor();
  assert.equal(calls.signup, 0, 'Signup waits for policy acceptance');
  assert.equal(await dialog.getByRole('button', { name: 'Agree and continue' }).isDisabled(), true);
  await dialog.getByRole('button', { name: 'Read Terms of Use' }).click();
  await dialog.getByRole('heading', { name: 'Terms of use' }).waitFor();
  await dialog.getByRole('button', { name: 'Done reviewing' }).click();
  await page.screenshot({ path: `${output}/consent-mobile.png` });
  await page.keyboard.press('Escape'); assert.equal(await dialog.count(), 0);
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  for (const checkbox of await dialog.getByRole('checkbox').all()) await checkbox.check();
  await dialog.getByRole('button', { name: 'Agree and continue' }).click();
  await page.getByRole('heading', { name: 'Check your email' }).waitFor();
  assert.equal(calls.signup, 1);
  assert.equal(await page.getByRole('button', { name: /^Resend in/ }).isDisabled(), true);
  await page.locator('[data-emoji="love-letter"] svg').waitFor();
  await page.screenshot({ path: `${output}/confirmation-mobile.png`, fullPage: true });
  await page.clock.fastForward(61_000);
  await page.getByRole('button', { name: 'Resend email', exact: true }).click();
  assert.equal(calls.resend, 1);
  await page.getByRole('status').filter({ hasText: 'a new link will arrive' }).waitFor();
  await page.getByRole('button', { name: 'Change email address' }).click();
  await page.getByRole('heading', { name: 'Create your account' }).waitFor();
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await page.getByRole('button', { name: 'Forgot password?' }).click();
  await page.getByRole('button', { name: 'Send reset link' }).click();
  await page.getByRole('heading', { name: 'Check your email' }).waitFor(); assert.equal(calls.recover, 1);
  await page.getByRole('button', { name: 'Back to sign in' }).click();
  await page.getByRole('button', { name: 'All sign-in options' }).click();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('[data-emoji="crystal-ball"][data-reduced-motion="true"] svg').waitFor();
  for (const width of [320, 430, 1440]) {
    await page.setViewportSize({ width, height: 844 }); await layout();
    assert.equal(await page.locator('[data-app-shell]').evaluate(el => el.getBoundingClientRect().width), Math.min(430, width));
    await page.screenshot({ path: `${output}/methods-${width}.png`, fullPage: true });
    await page.getByRole('button', { name: 'Continue with email' }).click(); await layout();
    await page.getByRole('button', { name: 'All sign-in options' }).click();
  }
  settingsFail = true; await navigate('/sign-in');
  await page.getByRole('button', { name: 'Retry sign-in options' }).waitFor();
  settingsFail = false; await page.getByRole('button', { name: 'Retry sign-in options' }).click();
  await page.getByRole('button', { name: 'Continue with email' }).waitFor();
  await navigate('/sign-in?next=/studio');
  await page.getByRole('button', { name: 'Continue with email' }).click();
  await page.getByLabel('Email address').fill('qa@example.invalid'); await page.getByLabel('Password', { exact: true }).fill('good-password-123');
  loginSucceeds = true; await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.waitForURL('**/studio');
  await navigate('/reset-password');
  await page.getByRole('heading', { name: 'Choose a new password' }).waitFor();
  await page.getByLabel('Password', { exact: true }).fill('a-new-password-456');
  await page.getByLabel('Confirm password').fill('a-new-password-456');
  await page.getByRole('button', { name: 'Update password' }).click();
  await page.getByRole('heading', { name: 'Password updated' }).waitFor();
  await page.getByRole('link', { name: 'Continue to your profile' }).waitFor();
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ result: 'PASS', checks: ['method picker', 'local animated emoji', 'password reveal', 'friendly error', 'inline signup', 'password validation', 'policy review and dismissal', 'consent before signup', 'confirmation and resend cooldown', 'forgot password', 'password update', 'settings retry', 'reduced motion', '320/430/1440 geometry', 'successful sign-in return path'], calls, output }));
} finally { await browser.close(); await server.close(); }
