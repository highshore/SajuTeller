// Read-only responsive regression checks with deterministic studio fixtures.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import { createServer } from 'vite';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const server = await createServer({ server: { host: '127.0.0.1', port: 5184 } });
await server.listen();
const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
  args: ['--no-sandbox'],
});
const base = 'http://127.0.0.1:5184';
const output = process.env.QA_OUTPUT_DIR || '/tmp/saju-responsive-qa';
await mkdir(output, { recursive: true });

const id = '11111111-1111-4111-8111-111111111111';
const studio = {
  id, slug: 'responsive-qa', name: 'Bamboo Moon Saju', name_ko: '대나무달 사주',
  tagline: 'Discover your next chapter.', description: 'A private Saju reading.',
  neighborhood: 'Sinsa', city: 'Seoul', district: 'Gangnam',
  address_line1: 'Seoul', latitude: 37.52, longitude: 127.02,
  min_duration_minutes: 75, base_price: 55000, max_guests: 2, min_age: 18,
  verified: false, is_featured: true, is_mock: true, demo_chat_enabled: false,
  specialties: ['general', 'love'], modalities: ['traditional_saju'],
  studio_images: [
    { image_url: '/figma/reading-atmosphere.svg', alt_text: 'Room', sort_order: 0 },
    { image_url: '/figma/reader-avatar.svg', alt_text: 'Reader', sort_order: 1 },
  ],
  studio_languages: [
    { language_code: 'ko', support_type: 'native' },
    { language_code: 'en', support_type: 'conversational' },
    { language_code: 'ja', support_type: 'ai_interpreter' },
  ],
};
const service = {
  id: '22222222-2222-4222-8222-222222222222',
  studio_id: id, name: 'Traditional Four Pillars Reading',
  description: 'A practical introduction.', duration_minutes: 75,
  price: 55000, max_guests: 2,
  requires_birth_date: false, birth_time_recommended: true,
};

try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route(/https:\/\/(fonts\.(googleapis|gstatic)\.com|images\.unsplash\.com)/, r => r.abort());
  await page.route('https://jbwuefecydjkieplftia.supabase.co/**', async route => {
    const path = new URL(route.request().url()).pathname;
    const json = body => route.fulfill({
      status: 200, contentType: 'application/json', body: JSON.stringify(body),
    });
    if (path.endsWith('/settings')) return json({ external: { email: true, kakao: false } });
    if (path.endsWith('/saju_studios')) return json([studio]);
    if (path.endsWith('/studio_services')) return json([service]);
    if (path.endsWith('/studio_images')) return json(studio.studio_images);
    if (path.endsWith('/studio_practitioners')) return json(null);
    if (path.endsWith('/studio_reviews')) return json([]);
    return json([]);
  });

  const publicRoutes = [
    '/', '/experiences', '/search', '/map', '/trips', '/saved',
    '/studio', '/find-my-reading', '/host', '/support', '/faq', '/learn',
    '/today-fortune', '/name-creation', '/live-translation',
    '/sign-in', '/sign-up', '/privacy', '/terms', '/refund-policy',
    '/business/' + id, '/business/' + id + '/booking',
  ];
  const criticalRoutes = [
    '/', '/experiences', '/search', '/today-fortune', '/name-creation',
    '/live-translation', '/business/' + id, '/business/' + id + '/booking',
  ];
  const reports = [];
  const visit = async route => {
    await page.goto(base + route, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await page.locator('[data-app-shell]').waitFor({ timeout: 20000 });
    await page.waitForTimeout(180);
  };
  const inspect = async (route, width) => {
    const metrics = await page.evaluate(() => {
      const shell = document.querySelector('[data-app-shell]');
      const visibleControls = [...document.querySelectorAll('input,select,textarea')]
        .filter(el => {
          const style = getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0;
        }).map(el => {
          const rect = el.getBoundingClientRect();
          return { left: rect.left, right: rect.right, width: rect.width, height: rect.height };
        });
      return {
        viewport: innerWidth, page: document.documentElement.scrollWidth,
        shellWidth: shell.getBoundingClientRect().width, shellScroll: shell.scrollWidth,
        shellClient: shell.clientWidth, visibleControls,
      };
    });
    assert.ok(metrics.page <= metrics.viewport + 1,
      route + ' @ ' + width + ': page horizontal overflow (' + metrics.page + ')');
    assert.ok(metrics.shellScroll <= metrics.shellClient + 1,
      route + ' @ ' + width + ': app column overflows');
    assert.equal(Math.round(metrics.shellWidth), route === '/map' ? width : Math.min(width, 430),
      route + ' @ ' + width + ': app shell width changed unexpectedly');
    for (const control of metrics.visibleControls) {
      assert.ok(control.left >= -1 && control.right <= width + 1,
        route + ' @ ' + width + ': a form field extends outside the viewport');
    }
    if (route === '/map') {
      const map = page.locator('[data-map-provider="google"]');
      await map.waitFor({ timeout: 10000 });
      const rect = await map.boundingBox();
      assert.ok(rect && rect.height >= 450, 'Reading map should be tall enough for labels');
      if (width >= 900) assert.ok(rect.width >= 850, 'Reading map should expand on desktop');
    }
    if (route.endsWith('/booking')) {
      const checkout = page.locator('[data-booking-checkout]');
      await checkout.waitFor({ timeout: 10000 });
      assert.equal(await checkout.getByRole('button', { name: 'Pay for reading' }).isDisabled(), true,
        'Online payment must remain unavailable until real checkout is connected');
    }
    reports.push({ route, width, controls: metrics.visibleControls.length });
  };

  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    for (const route of publicRoutes) {
      await visit(route);
      await inspect(route, width);
      if (route.endsWith('/booking')) {
        await page.getByLabel('Preferred date').waitFor();
        const columns = await page.locator('.booking-fields').evaluateAll(els =>
          els.map(el => getComputedStyle(el).gridTemplateColumns.split(' ').length));
        assert.deepEqual(columns, [1, 1], 'Booking form fields must stack in narrow app shell');
        const sizes = await page.locator('input[type=date], input[type=time]').evaluateAll(els =>
          els.map(el => el.getBoundingClientRect().height));
        assert.ok(sizes.every(height => height >= 48), 'Date and time inputs need touch-size targets');
        await page.screenshot({ path: output + '/booking-' + width + '.png', fullPage: true });
      }
    }
  }
  for (const width of [375, 430]) {
    await page.setViewportSize({ width, height: 844 });
    for (const route of criticalRoutes) {
      await visit(route);
      await inspect(route, width);
    }
  }

  await page.setViewportSize({ width: 320, height: 844 });
  await visit('/business/' + id + '/booking');
  for (const name of ['한국어', '日本語', '简体中文', 'Español', 'English']) {
    await page.locator('[data-global-header] button[aria-haspopup=dialog]').click();
    await page.getByRole('dialog').getByRole('button', { name, exact: true }).click();
    await inspect('/business/' + id + '/booking (' + name + ')', 320);
  }
  await page.locator('input[type=date]').fill(new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10));
  await page.locator('input[type=time]').fill('14:30');
  await page.getByRole('button', { name: 'Save preview plan' }).click();
  await page.getByText('Your preview plan is saved.').waitFor();
  assert.deepEqual(errors, [], 'No uncaught page errors');
  console.log(JSON.stringify({ result: 'PASS', checks: reports.length, screenshots: output }));
} finally {
  await browser.close();
  await server.close();
}
