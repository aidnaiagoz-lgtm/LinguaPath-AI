// @ts-check
const { test, expect } = require('@playwright/test');

const KEY = 'linguapath-demo-v1';
const ALL_LESSONS = ['a0-01', 'a0-02', 'a0-03', 'a1-01', 'a1-02', 'a1-03'];
const LESSON_A0_01 = [0, 1, 2]; // correct answer indexes in data.js
const EXAM_CORRECT = { 'ex-01': 0, 'ex-02': 0, 'ex-03': 0, 'ex-04': 1, 'ex-05': 0, 'ex-06': 1, 'ex-07': 0 };

/** Seed localStorage once (before the first page load only) and open the app. */
async function openApp(page, stored) {
  if (stored !== undefined) {
    await page.addInitScript(([key, value]) => {
      if (!sessionStorage.getItem('__seeded')) {
        localStorage.setItem(key, value);
        sessionStorage.setItem('__seeded', '1');
      }
    }, [KEY, typeof stored === 'string' ? stored : JSON.stringify(stored)]);
  }
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
}

const readState = page => page.evaluate(key => JSON.parse(localStorage.getItem(key) || '{}'), KEY);

async function go(page, view) {
  const mobile = await page.locator('#menuToggle').isVisible();
  if (mobile) await page.click('#menuToggle');
  await page.click(`.nav-item[data-view="${view}"]`);
}

let errors;
test.beforeEach(async ({ page }) => {
  errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
});
test.afterEach(() => {
  expect(errors, 'no console errors').toEqual([]);
});

test('every section opens without errors', async ({ page }) => {
  await openApp(page);
  const titles = {
    learn: 'Сабақтар ретімен ашылады', teacher: 'Mira — AI мұғалім', games: 'Сөздерді ойынмен жатта',
    exam: 'Апталық емтихан', library: 'Оқу кітапханасы', progress: 'Менің жетістіктерім', settings: 'Баптаулар',
    dashboard: 'Ағылшынға жолың осы жерден басталады'
  };
  for (const [view, title] of Object.entries(titles)) {
    await go(page, view);
    await expect(page.locator('h1')).toHaveText(title);
    await expect(page.locator(`.nav-item[data-view="${view}"]`)).toHaveAttribute('aria-current', 'page');
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test.describe('corrupted localStorage does not crash the site', () => {
  const cases = {
    'invalid JSON': '{not json',
    'null fields': '{"done":null,"xp":null,"examHistory":null,"activity":null,"messages":null}',
    'wrong types': '{"done":"a0-01","xp":"<img src=x onerror=alert(1)>","examHistory":[{"date":"2026-11-18","score":"<b>"}],"activity":5,"language":"fr","morning":"","messages":[null]}',
    'JSON array': '[]'
  };
  for (const [name, raw] of Object.entries(cases)) {
    test(name, async ({ page }) => {
      await openApp(page, raw);
      await expect(page.locator('h1')).toHaveText('Ағылшынға жолың осы жерден басталады');
      await expect(page.locator('.stat .s-num').nth(1)).toHaveText('0');
      await go(page, 'progress');
      await expect(page.locator('h1')).toHaveText('Менің жетістіктерім');
      await go(page, 'teacher');
      await expect(page.locator('.bubble').first()).toBeVisible();
    });
  }
});

test('lesson needs 75%: 2/3 fails, 3/3 passes, XP is given once', async ({ page }) => {
  await openApp(page);
  await go(page, 'learn');
  await page.click('[data-action="openLesson"][data-id="a0-01"]');
  await expect(page.getByText('Өту үшін кемі 3/3 дұрыс жауап керек (75%).')).toBeVisible();

  await page.click('[data-action="lessonAnswer"][data-q="0"][data-a="0"]');
  await page.click('[data-action="lessonAnswer"][data-q="1"][data-a="1"]');
  await page.click('[data-action="lessonAnswer"][data-q="2"][data-a="0"]'); // wrong
  await expect(page.locator('[data-action="lessonAnswer"][data-q="2"][data-a="0"]')).toHaveAttribute('aria-pressed', 'true');
  await page.click('[data-action="checkLesson"]');
  await expect(page.locator('#lessonResult')).toContainText('Тағы бір рет байқап көр');
  expect((await readState(page)).done ?? []).toEqual([]);

  await page.click('[data-action="lessonAnswer"][data-q="2"][data-a="2"]');
  await page.click('[data-action="checkLesson"]');
  await expect(page.locator('#lessonResult')).toContainText('Сабақ өтті');
  await page.click('[data-action="checkLesson"]');
  await page.click('[data-action="checkLesson"]');
  const s = await readState(page);
  expect(s.done).toEqual(['a0-01']);
  expect(s.xp).toBe(25);

  await page.click('[data-action="backLearn"]');
  await expect(page.locator('[data-action="openLesson"][data-id="a0-02"]')).toBeEnabled();
  await expect(page.locator('[data-action="openLesson"][data-id="a0-03"]')).toBeDisabled();
});

test('exam is empty until a lesson is completed', async ({ page }) => {
  await openApp(page);
  await go(page, 'exam');
  await expect(page.getByText('Әзірге сұрақ жоқ')).toBeVisible();
  await expect(page.locator('[data-action="submitExam"]')).toHaveCount(0);
});

test('exam only contains topics from completed lessons', async ({ page }) => {
  await openApp(page, { done: ['a0-01', 'a0-02'] });
  await go(page, 'exam');
  await expect(page.locator('.question')).toHaveCount(2);
  await expect(page.locator('.pill', { hasText: 'сұрақ' })).toHaveText('2 сұрақ');
  await expect(page.locator('[data-q="ex-04"]')).toHaveCount(0);
});

test('exam: dynamic totals and no XP farming by re-submitting', async ({ page }) => {
  await openApp(page, { done: ALL_LESSONS, xp: 100 });
  await go(page, 'exam');
  await expect(page.locator('.question')).toHaveCount(7);
  for (const [id, a] of Object.entries(EXAM_CORRECT)) await page.click(`[data-action="examAnswer"][data-q="${id}"][data-a="${a}"]`);
  await page.click('[data-action="submitExam"]');
  await expect(page.locator('#examResult h2')).toHaveText('7/7 дұрыс жауап');
  await expect(page.locator('#examResult')).toContainText('+35 XP');
  await expect(page.locator('[data-action="submitExam"]')).toBeDisabled();
  await expect(page.locator('[data-action="examAnswer"]').first()).toBeDisabled();
  expect((await readState(page)).xp).toBe(135);

  // Retake with the same score: recorded, but no extra XP.
  await page.click('[data-action="retakeExam"]');
  for (const [id, a] of Object.entries(EXAM_CORRECT)) await page.click(`[data-action="examAnswer"][data-q="${id}"][data-a="${a}"]`);
  await page.click('[data-action="submitExam"]');
  await expect(page.locator('#examResult')).toContainText('XP бұрын берілген');
  const s = await readState(page);
  expect(s.xp).toBe(135);
  expect(s.examHistory).toHaveLength(2);
  expect(s.examHistory[1]).toMatchObject({ score: 7, total: 7 });

  await go(page, 'progress');
  await expect(page.locator('.score-row b').first()).toHaveText('7/7');
});

test('word match: Kazakh column is shuffled and XP is given once per day', async ({ page }) => {
  await openApp(page);
  await go(page, 'games');
  const enOrder = await page.locator('[data-side="en"]').evaluateAll(els => els.map(e => e.dataset.index));
  const kkOrder = await page.locator('[data-side="kk"]').evaluateAll(els => els.map(e => e.dataset.index));
  expect([...kkOrder].sort()).toEqual([...enOrder].sort());
  expect(kkOrder).not.toEqual(enOrder);

  const playAll = async () => {
    for (const i of enOrder) {
      await page.click(`[data-side="en"][data-index="${i}"]`);
      await expect(page.locator(`[data-side="en"][data-index="${i}"]`)).toHaveAttribute('aria-pressed', 'true');
      await page.click(`[data-side="kk"][data-index="${i}"]`);
    }
  };
  await playAll();
  await expect(page.locator('#matchCount')).toHaveText('8/8 matched');
  await expect(page.locator('#gameResult')).toContainText('+20 XP');
  await expect(page.locator('[data-side="en"]').first()).toBeDisabled();
  expect((await readState(page)).xp).toBe(20);

  await page.click('[data-action="resetMatch"]');
  await playAll();
  await expect(page.locator('#gameResult')).toContainText('XP-і алынған');
  expect((await readState(page)).xp).toBe(20);
});

test('settings: empty time is not saved, valid time is saved', async ({ page }) => {
  await openApp(page);
  await go(page, 'settings');
  await expect(page.getByLabel('Таңғы қайталау уақыты')).toBeVisible();
  await page.fill('#morningTime', '');
  await page.click('[data-action="saveSettings"]');
  await expect(page.locator('#toast')).toContainText('Таңғы уақытты толтыр');
  await expect(page.locator('#morningTime')).toHaveAttribute('aria-invalid', 'true');
  expect((await readState(page)).morning).toBeUndefined();

  await page.fill('#morningTime', '09:30');
  await page.click('[data-action="saveSettings"]');
  await expect(page.locator('#toast')).toContainText('09:00-ге дейін');

  await page.fill('#morningTime', '07:15');
  await page.fill('#eveningTime', '20:45');
  await page.selectOption('#langSelect', 'zh');
  await page.click('[data-action="saveSettings"]');
  await expect(page.locator('#toast')).toContainText('Баптаулар сақталды');
  const s = await readState(page);
  expect(s).toMatchObject({ morning: '07:15', evening: '20:45', language: 'zh' });

  await page.reload();
  await go(page, 'learn');
  await page.click('[data-action="openLesson"][data-id="a0-01"]');
  await expect(page.locator('p[lang="zh"]')).toContainText('你好');
});

test('activity date uses Kazakhstan time even when the browser is in UTC', async ({ page }) => {
  // 2026-11-17 20:30 UTC = 2026-11-18 01:30 in Kazakhstan (UTC+5).
  await page.clock.setFixedTime(new Date('2026-11-17T20:30:00Z'));
  await openApp(page);
  await go(page, 'learn');
  await page.click('[data-action="openLesson"][data-id="a0-01"]');
  for (const [q, a] of LESSON_A0_01.entries()) await page.click(`[data-action="lessonAnswer"][data-q="${q}"][data-a="${a}"]`);
  await page.click('[data-action="checkLesson"]');
  expect((await readState(page)).activity).toEqual(['2026-11-18']);
  await go(page, 'progress');
  await expect(page.locator('.calendar-cell').last()).toHaveAttribute('title', '2026-11-18');
  await expect(page.locator('.calendar-cell').last()).toHaveClass(/marked/);
});

test('keyboard: skip link, nav with Enter, visible focus', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop keyboard flow');
  await openApp(page);
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('.nav-item').first()).toBeFocused();
  const outline = await page.locator('.nav-item').first().evaluate(el => getComputedStyle(el).outlineStyle);
  expect(outline).toBe('solid');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.locator('h1')).toHaveText('Сабақтар ретімен ашылады');
  await expect(page.locator('#breadcrumbs')).toHaveText('MY LEARNING SPACE / LEARNING PATH');
});

test('mobile menu: aria-expanded, Escape closes, hidden menu is not focusable', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile only');
  await openApp(page);
  const toggle = page.locator('#menuToggle');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('.nav-item').first()).toBeHidden();

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.nav-item.active')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();
  await expect(page.locator('.nav-item').first()).toBeHidden();

  await toggle.click();
  await page.click('.nav-item[data-view="games"]');
  await expect(page.locator('h1')).toHaveText('Сөздерді ойынмен жатта');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('reduced motion disables transitions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openApp(page);
  const duration = await page.locator('.progress-fill').first().evaluate(el => parseFloat(getComputedStyle(el).transitionDuration));
  expect(duration).toBeLessThan(0.01);
});

test('teacher demo chat still works and stays labelled as demo', async ({ page }) => {
  await openApp(page);
  await go(page, 'teacher');
  await expect(page.getByText('Демо жауаптар · Real AI жоқ')).toBeVisible();
  await page.fill('#teacherInput', 'grammar');
  await page.keyboard.press('Enter');
  await expect(page.locator('.bubble.bot').last()).toContainText('I am / You are / She is');
  await page.reload();
  await go(page, 'teacher');
  await expect(page.locator('.bubble.user')).toHaveText('grammar');
});

test('reset progress clears everything', async ({ page }) => {
  await openApp(page, { done: ['a0-01'], xp: 99 });
  await go(page, 'settings');
  page.once('dialog', d => d.accept());
  await page.click('[data-action="resetProgress"]');
  await expect(page.locator('.stat .s-num').nth(1)).toHaveText('0');
  await go(page, 'learn');
  await expect(page.locator('[data-action="openLesson"][data-id="a0-02"]')).toBeDisabled();
});
