import { expect, test } from '@playwright/test';
import { choose, navigate, open, readState, seed } from './helpers';

const EXAM_CORRECT: Record<string, string> = {
  'ex-01': 'Мен студентпін', 'ex-02': 'am', 'ex-03': 'seven', 'ex-04': 'speaks', 'ex-05': 'do', 'ex-06': 'Қай жақтансың?', 'ex-07': 'Университет'
};

test('lesson: 75% pass mark, XP once, next lesson unlocks', async ({ page }) => {
  await open(page, '/learn');
  await expect(page.getByRole('link', { name: /I am · You are · She is/ })).toHaveCount(0); // locked = not a link
  await page.getByRole('link', { name: /Hello! Өзімді таныстырамын/ }).click();
  await expect(page.getByText('Өту үшін кемі 3/3 дұрыс жауап керек (75%).')).toBeVisible();

  await choose(page, 'question-0', 'I am a student.');
  await choose(page, 'question-1', 'is');
  await choose(page, 'question-2', 'Сау бол'); // wrong
  await page.getByRole('button', { name: 'Жауаптарды тексеру' }).click();
  await expect(page.getByTestId('lesson-result')).toContainText('Тағы бір рет байқап көр');
  await expect(page.getByTestId('lesson-result')).not.toContainText('Дұрыс жауап'); // answers are not revealed on failure
  expect((await readState(page)).done).toEqual([]);

  await page.getByRole('button', { name: 'Қайта тапсыру' }).click();
  await choose(page, 'question-0', 'I am a student.');
  await choose(page, 'question-1', 'is');
  await choose(page, 'question-2', 'Сәлем');
  await page.getByRole('button', { name: 'Жауаптарды тексеру' }).click();
  await expect(page.getByTestId('lesson-result')).toContainText('+25 XP');
  let state = await readState(page);
  expect(state.done).toEqual(['a0-01']);
  expect(state.xp).toBe(25);

  await page.getByRole('link', { name: 'Келесі сабақ' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('I am · You are · She is');

  // Repeating a passed lesson gives no XP.
  await page.goto('/learn/a0-01');
  await choose(page, 'question-0', 'I am a student.');
  await choose(page, 'question-1', 'is');
  await choose(page, 'question-2', 'Сәлем');
  await page.getByRole('button', { name: 'Жауаптарды тексеру' }).click();
  await expect(page.getByTestId('lesson-result')).toContainText('XP қайта берілмейді');
  state = await readState(page);
  expect(state.xp).toBe(25);
});

test('explanations switch between kk / 中文 / English', async ({ page }) => {
  await open(page, '/learn/a0-01');
  await expect(page.getByTestId('lesson-note')).toHaveAttribute('lang', 'kk');
  await page.getByText('中文', { exact: true }).click();
  await expect(page.getByTestId('lesson-note')).toHaveAttribute('lang', 'zh');
  await expect(page.getByTestId('lesson-note')).toContainText('你好');
  await page.getByText('English', { exact: true }).click();
  await expect(page.getByTestId('lesson-note')).toContainText('introduce yourself');
});

test('locked lesson URL shows an explanation instead of the quiz', async ({ page }) => {
  await open(page, '/learn/a1-03');
  await expect(page.getByRole('heading', { name: 'Бұл сабақ әлі жабық' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Жауаптарды тексеру' })).toHaveCount(0);
});

test('exam is empty until a lesson is completed', async ({ page }) => {
  await open(page, '/exam');
  await expect(page.getByRole('heading', { name: 'Әзірге сұрақ жоқ' })).toBeVisible();
});

test('exam only covers completed lessons', async ({ page }) => {
  await seed(page, { done: ['a0-01', 'a0-02'] });
  await open(page, '/exam');
  await expect(page.locator('fieldset[data-testid^="exam-"]')).toHaveCount(2);
});

test('exam: dynamic total, topic summary, no XP farming', async ({ page }) => {
  await seed(page, { done: ['a0-01', 'a0-02', 'a0-03', 'a1-01', 'a1-02', 'a1-03'], xp: 100 });
  await open(page, '/exam');
  const answerAll = async () => { for (const [id, a] of Object.entries(EXAM_CORRECT)) await choose(page, `exam-${id}`, a); };
  await answerAll();
  await page.getByRole('button', { name: 'Нәтижені шығару' }).click();
  await expect(page.getByTestId('exam-result')).toContainText('7/7 дұрыс');
  await expect(page.getByTestId('exam-result')).toContainText('+35 XP');
  expect((await readState(page)).xp).toBe(135);

  await page.getByRole('button', { name: 'Қайта тапсыру' }).click();
  await answerAll();
  await page.getByRole('button', { name: 'Нәтижені шығару' }).click();
  await expect(page.getByTestId('exam-result')).toContainText('XP бұрын берілген');
  const state = await readState(page);
  expect(state.xp).toBe(135);
  expect(state.examHistory).toHaveLength(2);

  await navigate(page, 'Прогресс');
  await expect(page.getByTestId('exam-row').first()).toContainText('7/7');
});

test('activity is recorded in Kazakhstan time even when the browser is in UTC', async ({ page }) => {
  // 2026-11-17 20:30 UTC = 2026-11-18 01:30 in Kazakhstan.
  await page.clock.setFixedTime(new Date('2026-11-17T20:30:00Z'));
  await open(page, '/learn/a0-01');
  await choose(page, 'question-0', 'I am a student.');
  await choose(page, 'question-1', 'is');
  await choose(page, 'question-2', 'Сәлем');
  await page.getByRole('button', { name: 'Жауаптарды тексеру' }).click();
  await expect(page.getByTestId('lesson-result')).toBeVisible();
  expect((await readState(page)).activity).toEqual(['2026-11-18']);
  await page.goto('/dashboard');
  await expect(page.getByText('Сәрсенбі, 18 қараша')).toBeVisible();
  await expect(page.getByTestId('streak-chip')).toContainText('1');
});
