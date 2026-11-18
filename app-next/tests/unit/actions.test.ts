import { describe, expect, it } from 'vitest';
import { lessons } from '@/content/lessons';
import { exam } from '@/content/practice';
import { addMessages, checkLesson, claimDaily, isLessonUnlocked, markWord, submitExam, updateSettings } from '@/lib/actions';
import { dailyGoalProgress, levelInfo, levelThreshold, streakInfo, weakestSkills, weeklyXp } from '@/lib/gamification';
import { defaultState, MAX_MESSAGES } from '@/lib/logic';

const DAY = '2026-11-18';
const [a0, a1] = lessons;
const correct = (n: number) => Object.fromEntries(lessons[n].quiz.map((q, i) => [i, q.correct]));

describe('lessons', () => {
  it('2/3 does not pass and gives no XP', () => {
    const answers = { ...correct(0), 2: (a0.quiz[2].correct + 1) % 3 };
    const { state, result } = checkLesson(defaultState(), a0, answers, DAY);
    expect(result).toMatchObject({ passed: false, score: 2, total: 3, required: 3, xp: 0 });
    expect(state.done).toEqual([]);
    expect(state.skills[a0.skill]).toEqual({ correct: 2, total: 3 });
    expect(state.activity).toEqual([DAY]);
  });

  it('3/3 passes once; repeating gives no extra XP', () => {
    const first = checkLesson(defaultState(), a0, correct(0), DAY);
    expect(first.result).toMatchObject({ passed: true, firstPass: true, xp: a0.xp });
    expect(first.state.xp).toBe(a0.xp);
    expect(first.state.xpLog).toEqual([{ date: DAY, amount: a0.xp, source: 'lesson' }]);
    const again = checkLesson(first.state, a0, correct(0), DAY);
    expect(again.result).toMatchObject({ passed: true, firstPass: false, xp: 0 });
    expect(again.state.xp).toBe(a0.xp);
  });

  it('does not mutate the input state', () => {
    const s = defaultState();
    checkLesson(s, a0, correct(0), DAY);
    expect(s).toEqual(defaultState());
  });

  it('unlocks in order', () => {
    expect(isLessonUnlocked(lessons, 0, [])).toBe(true);
    expect(isLessonUnlocked(lessons, 1, [])).toBe(false);
    expect(isLessonUnlocked(lessons, 1, [a0.id])).toBe(true);
    expect(isLessonUnlocked(lessons, 2, [a0.id])).toBe(false);
    expect(isLessonUnlocked(lessons, 2, [a0.id, a1.id])).toBe(true);
  });
});

describe('weekly exam', () => {
  const all = { ...defaultState(), done: lessons.map(l => l.id) };
  const answers = Object.fromEntries(exam.map(q => [q.id, q.correct]));

  it('requires a completed lesson', () => {
    expect(submitExam(defaultState(), exam, {}, DAY)).toEqual({ error: 'Алдымен кемі бір сабақты аяқта.' });
  });

  it('requires all answers', () => {
    expect(submitExam(all, exam, { 'ex-01': 0 }, DAY)).toEqual({ error: 'Барлық сұраққа жауап бер.' });
  });

  it('dynamic total, topic breakdown, XP only for weekly improvement', () => {
    const r1 = submitExam(all, exam, answers, DAY);
    if ('error' in r1) throw new Error(r1.error);
    expect(r1.result).toMatchObject({ score: exam.length, total: exam.length, xp: exam.length * 5, errors: [] });
    expect(r1.result.byTopic.Grammar.total).toBeGreaterThan(0);
    const r2 = submitExam(r1.state, exam, answers, DAY);
    if ('error' in r2) throw new Error(r2.error);
    expect(r2.result.xp).toBe(0);
    expect(r2.state.xp).toBe(r1.state.xp);
    expect(r2.state.examHistory).toHaveLength(2);
    // A new ISO week starts a new best score.
    const r3 = submitExam(r2.state, exam, answers, '2026-11-23');
    if ('error' in r3) throw new Error(r3.error);
    expect(r3.result.xp).toBe(exam.length * 5);
  });

  it('only completed lessons are examined', () => {
    const r = submitExam({ ...defaultState(), done: ['a0-01'] }, exam, { 'ex-01': 0 }, DAY);
    if ('error' in r) throw new Error(r.error);
    expect(r.result.total).toBe(1);
  });
});

describe('daily practice rewards', () => {
  it('match/listening/speaking/flashcards give XP once per day', () => {
    for (const activity of ['match', 'listening', 'speaking', 'flashcards'] as const) {
      const a = claimDaily(defaultState(), activity, DAY);
      expect(a.xp).toBeGreaterThan(0);
      const b = claimDaily(a.state, activity, DAY);
      expect(b.xp).toBe(0);
      expect(b.state.xp).toBe(a.state.xp);
      expect(claimDaily(b.state, activity, '2026-11-19').xp).toBe(a.xp);
    }
  });
  it('known words toggle without duplicates', () => {
    let s = markWord(defaultState(), 'apple', true);
    s = markWord(s, 'apple', true);
    expect(s.knownWords).toEqual(['apple']);
    expect(markWord(s, 'apple', false).knownWords).toEqual([]);
  });
  it('chat history is capped', () => {
    let s = defaultState();
    for (let i = 0; i < MAX_MESSAGES + 10; i++) s = addMessages(s, { role: 'user', text: String(i) });
    expect(s.messages).toHaveLength(MAX_MESSAGES);
  });
});

describe('settings', () => {
  it('rejects empty time without changing state', () => {
    const s = defaultState();
    const r = updateSettings(s, { morning: '', evening: '20:00', language: 'zh', dailyGoal: 50 });
    expect(r.check.ok).toBe(false);
    expect(r.state).toBe(s);
  });
  it('saves valid settings', () => {
    const r = updateSettings(defaultState(), { morning: '07:15', evening: '20:45', language: 'zh', dailyGoal: 50 });
    expect(r.state).toMatchObject({ morning: '07:15', evening: '20:45', language: 'zh', dailyGoal: 50 });
  });
});

describe('gamification', () => {
  it('levels', () => {
    expect([1, 2, 3, 4, 5].map(levelThreshold)).toEqual([0, 100, 250, 450, 700]);
    expect(levelInfo(0)).toMatchObject({ level: 1, toNext: 100 });
    expect(levelInfo(100)).toMatchObject({ level: 2, current: 0, needed: 150 });
    expect(levelInfo(260)).toMatchObject({ level: 3, current: 10 });
  });
  it('streaks survive until the end of the next day', () => {
    expect(streakInfo([], DAY)).toEqual({ current: 0, best: 0, activeToday: false });
    expect(streakInfo(['2026-11-16', '2026-11-17', DAY], DAY)).toMatchObject({ current: 3, activeToday: true });
    expect(streakInfo(['2026-11-16', '2026-11-17'], DAY)).toMatchObject({ current: 2, activeToday: false });
    expect(streakInfo(['2026-11-10', '2026-11-11', '2026-11-12', '2026-11-16'], DAY)).toMatchObject({ current: 0, best: 3 });
  });
  it('daily goal and weekly XP', () => {
    const s = { ...defaultState(), dailyGoal: 20, xpLog: [{ date: DAY, amount: 25, source: 'lesson' as const }, { date: '2026-11-15', amount: 5, source: 'exam' as const }] };
    expect(dailyGoalProgress(s, DAY)).toMatchObject({ earned: 25, reached: true, progress: 1 });
    const week = weeklyXp(s, DAY);
    expect(week).toHaveLength(7);
    expect(week.at(-1)).toEqual({ day: DAY, xp: 25 });
    expect(week.find(d => d.day === '2026-11-15')?.xp).toBe(5);
  });
  it('weakest skills need enough data', () => {
    const s = defaultState();
    s.skills.Grammar = { correct: 2, total: 6 };
    s.skills.Vocabulary = { correct: 1, total: 2 };
    s.skills.Reading = { correct: 5, total: 5 };
    expect(weakestSkills(s.skills)).toEqual(['Grammar']);
  });
});
