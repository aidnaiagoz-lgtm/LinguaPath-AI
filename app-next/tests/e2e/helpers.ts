import { expect, type Page } from '@playwright/test';

export const KEY = 'linguapath-demo-v1';

/** Seed localStorage before the first load only (not on later reloads). */
export async function seed(page: Page, stored: unknown, theme?: 'light' | 'dark') {
  await page.addInitScript(([key, value, t]) => {
    if (sessionStorage.getItem('__seeded')) return;
    if (value !== null) localStorage.setItem(key as string, value as string);
    if (t) localStorage.setItem('lp-theme', t as string);
    sessionStorage.setItem('__seeded', '1');
  }, [KEY, stored === undefined ? null : typeof stored === 'string' ? stored : JSON.stringify(stored), theme ?? null]);
}

export async function open(page: Page, path: string) {
  await page.goto(path);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}

export const readState = (page: Page) => page.evaluate(key => JSON.parse(localStorage.getItem(key) || '{}'), KEY);

/** Navigate through the app's own navigation (sidebar on desktop, menu sheet on mobile). */
export async function navigate(page: Page, label: string) {
  const menuButton = page.getByRole('button', { name: 'Мәзірді ашу' });
  if (await menuButton.isVisible()) {
    await menuButton.click();
    await page.getByRole('dialog', { name: 'Негізгі мәзір' }).getByRole('link', { name: label, exact: true }).click();
  } else {
    await page.getByRole('navigation', { name: 'Негізгі мәзір' }).getByRole('link', { name: label, exact: true }).click();
  }
}

/** Click an answer by its visible text inside a question group. */
export async function choose(page: Page, testId: string, answer: string) {
  await page.getByTestId(testId).filter({ visible: true }).getByText(answer, { exact: true }).click();
}

export function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  return errors;
}
