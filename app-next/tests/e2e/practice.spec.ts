import { expect, test } from '@playwright/test';
import { choose, open, readState, seed } from './helpers';

const WORDS = ['apple', 'water', 'study', 'teacher', 'book', 'university', 'morning', 'friend'];

test('word match: translations are shuffled and XP is given once per day', async ({ page }) => {
  await open(page, '/vocabulary');
  const translations = page.getByTestId('translations').locator('button');
  await expect(translations).toHaveCount(8);
  const order = await translations.evaluateAll(els => els.map(e => Number((e as HTMLElement).dataset.index)));
  expect([...order].sort()).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  expect(order).not.toEqual([0, 1, 2, 3, 4, 5, 6, 7]);

  const play = async () => {
    for (let i = 0; i < WORDS.length; i++) {
      await page.locator(`button[data-side="en"][data-index="${i}"]`).click();
      await expect(page.locator(`button[data-side="en"][data-index="${i}"]`)).toHaveAttribute('aria-pressed', 'true');
      await page.locator(`button[data-side="target"][data-index="${i}"]`).click();
    }
  };
  await play();
  await expect(page.getByTestId('match-result')).toContainText('+20 XP');
  expect((await readState(page)).xp).toBe(20);

  await page.getByRole('button', { name: 'Жаңа раунд' }).click();
  await play();
  await expect(page.getByTestId('match-result')).toContainText('Бүгінгі XP бұрын алынған');
  expect((await readState(page)).xp).toBe(20);
});

test('word match works with Chinese translations', async ({ page }) => {
  await open(page, '/vocabulary');
  await page.getByText('中文', { exact: true }).first().click();
  await expect(page.getByTestId('translations').getByText('苹果')).toBeVisible();
});

test('flashcards: reveal, mark known, XP once per day', async ({ page }) => {
  await open(page, '/vocabulary');
  for (let i = 0; i < WORDS.length; i++) {
    await page.getByRole('button', { name: 'Аудармасын көрсету' }).click();
    await page.getByRole('button', { name: i % 2 ? 'Қайталау керек' : 'Білемін' }).click();
  }
  await expect(page.getByText('Сессия аяқталды')).toBeVisible();
  const state = await readState(page);
  expect(state.knownWords).toHaveLength(4);
  expect(state.xp).toBe(15);
});

test('listening: answer all items, transcript after checking, XP once', async ({ page }) => {
  await open(page, '/listening');
  await expect(page.getByRole('button', { name: 'Тыңдау' })).toBeVisible();
  const answers = ['Студент', 'They are my friends.', '08:00', 'Банкте', 'Қашан ағылшын оқисың?', 'Таңертең'];
  for (const [i, a] of answers.entries()) {
    await choose(page, 'listening-question', a);
    await page.getByRole('button', { name: 'Тексеру' }).click();
    await expect(page.getByText('Дұрыс', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: i < answers.length - 1 ? 'Келесі' : 'Аяқтау' }).click();
  }
  await expect(page.getByText('6/6 дұрыс')).toBeVisible();
  const state = await readState(page);
  expect(state.xp).toBe(20);
  expect(state.skills.Listening).toEqual({ correct: 6, total: 6 });
});

test('speaking: microphone denial is handled; self-assessment records progress', async ({ page, context }) => {
  await context.clearPermissions();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'mediaDevices', { value: { getUserMedia: () => Promise.reject(new DOMException('denied', 'NotAllowedError')) }, configurable: true });
  });
  await open(page, '/speaking');
  await page.getByRole('button', { name: 'Жазуды бастау' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Микрофонға рұқсат берілмеді' })).toBeVisible();
  for (let i = 0; i < 5; i++) await page.getByRole('button', { name: 'Еркін айттым' }).click();
  await expect(page.getByText('Жарайсың!')).toBeVisible();
  const state = await readState(page);
  expect(state.xp).toBe(20);
  expect(state.skills.Speaking).toEqual({ correct: 5, total: 5 });
});

test('Mira: demo is labelled, replies in the chosen language, history persists', async ({ page }) => {
  await open(page, '/teacher');
  await expect(page.getByText('Демо · нақты AI жоқ')).toBeVisible();
  await page.getByLabel('Mira-ға хабарлама').fill('grammar');
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-role="mira"]').last()).toContainText('I am a student');
  await page.getByText('中文', { exact: true }).click();
  await page.getByLabel('Mira-ға хабарлама').fill('hello');
  await page.getByRole('button', { name: 'Жіберу' }).click();
  await expect(page.locator('[data-role="mira"]').last()).toContainText('自我介绍');
  await page.reload();
  await expect(page.locator('[data-role="user"]')).toHaveText(['grammar', 'hello']);
  await expect(page.getByRole('button', { name: 'Дауыспен сөйлесу (жақында)' })).toBeDisabled();
});

test('dashboard reflects progress: XP, level, daily goal and practice checkmarks', async ({ page }) => {
  await seed(page, { done: ['a0-01'], xp: 120 });
  await open(page, '/vocabulary');
  for (let i = 0; i < WORDS.length; i++) {
    await page.locator(`button[data-side="en"][data-index="${i}"]`).click();
    await page.locator(`button[data-side="target"][data-index="${i}"]`).click();
  }
  await page.goto('/dashboard');
  const stats = page.getByRole('region', { name: 'Қысқаша статистика' });
  await expect(stats.getByText('140 XP', { exact: true })).toBeVisible();
  await expect(stats.getByText('Деңгей 2', { exact: true })).toBeVisible();
  await expect(page.getByRole('progressbar', { name: 'Күндік мақсат прогресі' })).toHaveAttribute('aria-valuenow', '67');
  await expect(page.getByRole('link', { name: /Сөздік.*Бүгін/ })).toBeVisible();
});
