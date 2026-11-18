/* Pure state transitions. Each returns a NEW state (never mutates) plus what happened,
 * so the UI can show honest feedback and tests can verify the rules. */
import type { ExamQuestion, ExplanationLanguage, Lesson, Skill } from '@/content/types';
import {
  DAILY_GOALS, DAILY_REWARDS, MAX_MESSAGES, MAX_XP_LOG, examQuestionsFor, examXp, isPassing, requiredCorrect,
  validateSchedule, weekKey, type ChatMessage, type DailyActivity, type LearnerState, type ScheduleCheck, type XpSource
} from './logic';

function withActivity(state: LearnerState, today: string): LearnerState {
  return state.activity.includes(today) ? state : { ...state, activity: [...state.activity, today].sort() };
}

function withXp(state: LearnerState, amount: number, source: XpSource, today: string): LearnerState {
  if (amount <= 0) return state;
  return { ...state, xp: state.xp + amount, xpLog: [...state.xpLog, { date: today, amount, source }].slice(-MAX_XP_LOG) };
}

function withSkill(state: LearnerState, skill: Skill, correct: number, total: number): LearnerState {
  const prev = state.skills[skill];
  return { ...state, skills: { ...state.skills, [skill]: { correct: prev.correct + correct, total: prev.total + total } } };
}

/* ---------- Lessons ---------- */

export interface LessonResult { passed: boolean; firstPass: boolean; score: number; total: number; required: number; xp: number }

export function checkLesson(state: LearnerState, lesson: Lesson, answers: Record<number, number>, today: string): { state: LearnerState; result: LessonResult } {
  const total = lesson.quiz.length;
  const score = lesson.quiz.filter((q, i) => answers[i] === q.correct).length;
  const passed = isPassing(score, total);
  const firstPass = passed && !state.done.includes(lesson.id);
  let next = withSkill(state, lesson.skill, score, total);
  next = withActivity(next, today);
  if (firstPass) {
    next = { ...next, done: [...next.done, lesson.id] };
    next = withXp(next, lesson.xp, 'lesson', today);
  }
  return { state: next, result: { passed, firstPass, score, total, required: requiredCorrect(total), xp: firstPass ? lesson.xp : 0 } };
}

export function isLessonUnlocked(lessons: readonly Lesson[], index: number, done: readonly string[]): boolean {
  return index === 0 || done.includes(lessons[index - 1].id);
}

/* ---------- Weekly exam ---------- */

export interface ExamResult { score: number; total: number; xp: number; errors: string[]; byTopic: Record<string, { correct: number; total: number }> }

export function submitExam(state: LearnerState, allQuestions: readonly ExamQuestion[], answers: Record<string, number>, today: string): { state: LearnerState; result: ExamResult } | { error: string } {
  const questions = examQuestionsFor(allQuestions, state.done);
  if (!questions.length) return { error: 'Алдымен кемі бір сабақты аяқта.' };
  if (questions.some(q => answers[q.id] === undefined)) return { error: 'Барлық сұраққа жауап бер.' };

  const byTopic: ExamResult['byTopic'] = {};
  let score = 0;
  let next = state;
  for (const q of questions) {
    const ok = answers[q.id] === q.correct;
    if (ok) score++;
    byTopic[q.topic] ??= { correct: 0, total: 0 };
    byTopic[q.topic].total++;
    if (ok) byTopic[q.topic].correct++;
  }
  for (const [topic, stat] of Object.entries(byTopic)) next = withSkill(next, topic as Skill, stat.correct, stat.total);

  const total = questions.length;
  const errors = Object.entries(byTopic).filter(([, s]) => s.correct < s.total).map(([t]) => t);
  const week = weekKey(today);
  const previousBest = state.rewards.examBest[week];
  const xp = examXp(score, previousBest);
  next = {
    ...next,
    examHistory: [...next.examHistory, { date: today, score, total, errors }].slice(-100),
    rewards: { ...next.rewards, examBest: { ...next.rewards.examBest, [week]: Math.max(previousBest ?? 0, score) } }
  };
  next = withXp(withActivity(next, today), xp, 'exam', today);
  return { state: next, result: { score, total, xp, errors, byTopic } };
}

/* ---------- Daily practice (vocabulary, listening, speaking) ---------- */

export function claimDaily(state: LearnerState, activity: DailyActivity, today: string): { state: LearnerState; xp: number } {
  const claimed = state.rewards.daily[activity].includes(today);
  let next = withActivity(state, today);
  if (claimed) return { state: next, xp: 0 };
  next = { ...next, rewards: { ...next.rewards, daily: { ...next.rewards.daily, [activity]: [...next.rewards.daily[activity], today] } } };
  const xp = DAILY_REWARDS[activity];
  return { state: withXp(next, xp, activity, today), xp };
}

export function recordSkill(state: LearnerState, skill: Skill, correct: number, total: number): LearnerState {
  return withSkill(state, skill, correct, total);
}

export function markWord(state: LearnerState, word: string, known: boolean): LearnerState {
  const has = state.knownWords.includes(word);
  if (known === has) return state;
  return { ...state, knownWords: known ? [...state.knownWords, word] : state.knownWords.filter(w => w !== word) };
}

/* ---------- Mira (demo) ---------- */

export function addMessages(state: LearnerState, ...messages: ChatMessage[]): LearnerState {
  return { ...state, messages: [...state.messages, ...messages].slice(-MAX_MESSAGES) };
}

/* ---------- Settings ---------- */

export interface SettingsInput { morning: string; evening: string; language: ExplanationLanguage; dailyGoal: number }

export function updateSettings(state: LearnerState, input: SettingsInput): { state: LearnerState; check: ScheduleCheck } {
  const check = validateSchedule(input.morning, input.evening);
  if (!check.ok) return { state, check };
  const dailyGoal = (DAILY_GOALS as readonly number[]).includes(input.dailyGoal) ? input.dailyGoal : state.dailyGoal;
  const language = (['kk', 'zh', 'en'] as const).includes(input.language) ? input.language : state.language;
  return { state: { ...state, morning: input.morning, evening: input.evening, language, dailyGoal }, check };
}
