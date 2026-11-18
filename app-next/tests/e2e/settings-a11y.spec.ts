import { expect, test } from '@playwright/test';
import { navigate, open, readState, seed } from './helpers';

test('settings: empty time is rejected, valid settings are saved', async ({ page }) => {
  await open(page, '/settings');
  await page.getByLabel('Таңғы қайталау').fill('');
  await page.getByRole('button', { name: 'Сақтау' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Таңғы уақытты толтыр' })).toBeVisible();
  await expect(page.getByLabel('Таңғы қайталау')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByLabel('Таңғы қайталау')).toBeFocused();
  expect((await readState(page)).morning).toBeUndefined(); // invalid input is never written

  await page.getByLabel('Таңғы қайталау').fill('09:30');
  await page.getByRole('button', { name: 'Сақтау' }).click();
  await expect(page.getByRole('alert').filter({ hasText: '09:00-ге дейін' })).toBeVisible();

  await page.getByLabel('Таңғы қайталау').fill('07:15');
  await page.getByLabel('Кешкі сабақ').fill('20:45');
  await page.getByText('中文', { exact: true }).click();
  await page.getByText('50 XP', { exact: true }).click();
  await page.getByRole('button', { name: 'Сақтау' }).click();
  await expect(page.getByTestId('toast').filter({ hasText: 'Баптаулар сақталды' })).toBeVisible();
  expect(await readState(page)).toMatchObject({ morning: '07:15', evening: '20:45', language: 'zh', dailyGoal: 50 });

  await page.goto('/dashboard');
  await expect(page.getByText('07:15')).toBeVisible();
});

test('theme: dark mode persists across reloads without a light flash', async ({ page }) => {
  await open(page, '/dashboard');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: 'Қараңғы режимге ауысу' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload({ waitUntil: 'commit' });
  await page.waitForSelector('body');
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe('dark');
  await expect(page.getByRole('button', { name: 'Жарық режимге ауысу' })).toBeVisible();
});

test('settings: export downloads JSON, reset needs confirmation', async ({ page }) => {
  await seed(page, { done: ['a0-01'], xp: 99 });
  await open(page, '/settings');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Экспорт' }).click();
  expect((await download).suggestedFilename()).toBe('linguapath-progress.json');

  await page.getByRole('button', { name: 'Өшіру' }).click();
  const dialog = page.getByRole('dialog', { name: 'Барлық прогресс өшірілсін бе?' });
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  expect((await readState(page)).xp).toBe(99);

  await page.getByRole('button', { name: 'Өшіру' }).click();
  await dialog.getByRole('button', { name: 'Иә, өшіру' }).click();
  await expect.poll(async () => (await readState(page)).xp).toBeUndefined();
});

test('keyboard: skip link comes first and moves focus to main content', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop keyboard flow');
  await open(page, '/dashboard');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Негізгі мазмұнға өту' });
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
  await page.keyboard.press('Tab');
  const outline = await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle);
  expect(outline).toBe('solid');
});

test('keyboard: answers are a native radio group (arrow keys)', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop keyboard flow');
  await open(page, '/learn/a0-01');
  const group = page.getByRole('group', { name: /Мен студентпін/ });
  await group.getByRole('radio').first().focus();
  await page.keyboard.press('ArrowDown');
  await expect(group.getByRole('radio').nth(1)).toBeChecked();
});

test('sidebar marks the current page', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop sidebar');
  await open(page, '/dashboard');
  await navigate(page, 'Прогресс');
  await expect(page.getByRole('navigation', { name: 'Негізгі мәзір' }).getByRole('link', { name: 'Прогресс' })).toHaveAttribute('aria-current', 'page');
});

test('mobile: bottom tabs, menu sheet with Escape, no hidden focus traps', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile only');
  await open(page, '/dashboard');
  const tabs = page.getByRole('navigation', { name: 'Жылдам навигация' });
  await tabs.getByRole('link', { name: 'Оқу' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Оқу жолы');
  await expect(tabs.getByRole('link', { name: 'Оқу' })).toHaveAttribute('aria-current', 'page');

  const menuButton = page.getByRole('button', { name: 'Мәзірді ашу' });
  await menuButton.click();
  const menu = page.getByRole('dialog', { name: 'Негізгі мәзір' });
  await expect(menu).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(menuButton).toBeFocused();

  await navigate(page, 'Кітапхана');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Кітапхана');
  await expect(menu).toBeHidden();
});

test('reduced motion disables transitions and animations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page, '/dashboard');
  const duration = await page.getByRole('progressbar').first().evaluate(el => parseFloat(getComputedStyle(el.querySelector('div,circle:last-child') ?? el).transitionDuration));
  expect(duration).toBeLessThan(0.01);
});
