import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { open, seed, trackErrors } from './helpers';

const PAGES: [string, string][] = [
  ['/dashboard', 'Бүгінгі мақсатқа кірісейік'],
  ['/learn', 'Оқу жолы'],
  ['/learn/a0-01', 'Hello! Өзімді таныстырамын'],
  ['/teacher', 'Mira'],
  ['/vocabulary', 'Сөздік практика'],
  ['/listening', 'Тыңдалым'],
  ['/speaking', 'Айтылым'],
  ['/exam', 'Апталық емтихан'],
  ['/progress', 'Прогресс'],
  ['/library', 'Кітапхана'],
  ['/settings', 'Баптаулар']
];

for (const theme of ['light', 'dark'] as const) {
  test.describe(`${theme} theme`, () => {
    for (const [path, heading] of PAGES) {
      test(`${path}: renders, no console errors, no overflow, no serious a11y issues`, async ({ page }) => {
        const errors = trackErrors(page);
        await seed(page, { done: ['a0-01', 'a0-02'], xp: 120, activity: ['2026-11-01'] }, theme);
        await open(page, path);
        await expect(page.getByRole('heading', { level: 1 })).toContainText(heading);
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        // Compare with the configured viewport: on mobile emulation innerWidth grows with overflowing content.
        const width = page.viewportSize()!.width;
        const layout = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: window.innerWidth }));
        expect(layout, 'horizontal overflow').toEqual({ scroll: width, inner: width });
        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
        const serious = results.violations.filter(v => v.impact === 'serious' || v.impact === 'critical');
        expect(serious.map(v => `${v.id}: ${v.nodes.map(n => n.target.join(' ')).slice(0, 3).join(' | ')}`)).toEqual([]);
        expect(errors).toEqual([]);
      });
    }
  });
}

test('SEO basics: title, description, lang, sitemap, robots', async ({ page, request }) => {
  await open(page, '/learn');
  await expect(page).toHaveTitle('Оқу жолы · LinguaPath AI');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /A0/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'kk');
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.ok()).toBe(true);
  expect(await sitemap.text()).toContain('/learn/a0-01');
  expect((await request.get('/robots.txt')).ok()).toBe(true);
});

test('redirects: / → /dashboard and legacy /games → /vocabulary', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto('/games');
  await expect(page).toHaveURL(/\/vocabulary$/);
});

test('unknown lesson shows the not-found page and is not indexed', async ({ page }) => {
  // With Partial Prerendering the static shell has already streamed (HTTP 200); Next.js then
  // renders the not-found UI and injects robots=noindex (documented framework behaviour).
  await page.goto('/learn/zz-99');
  await expect(page.getByRole('heading', { name: 'Бет табылмады' })).toBeVisible();
  await expect(page.locator('meta[name="robots"][content*="noindex"]').first()).toBeAttached();
  await expect(page.locator('meta[name="robots"][content*="index, follow"]')).toHaveCount(0);
});

test('unknown top-level route returns a real 404', async ({ page }) => {
  const res = await page.goto('/does-not-exist');
  expect(res?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Бет табылмады' })).toBeVisible();
});

test.describe('corrupted localStorage never breaks the app', () => {
  for (const raw of ['{not json', '{"done":null,"xp":"<img src=x onerror=alert(1)>","examHistory":"x","skills":5}', '[]']) {
    test(raw.slice(0, 24), async ({ page }) => {
      const errors = trackErrors(page);
      await seed(page, raw);
      for (const path of ['/dashboard', '/progress', '/teacher', '/exam']) await open(page, path);
      expect(errors).toEqual([]);
    });
  }
});
