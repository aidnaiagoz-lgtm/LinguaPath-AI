/* Pure, framework-free learning logic. Ported from website/logic.js (v0.2) and
 * extended for the Next.js app. Everything here is deterministic and unit-tested. */
import type { ExamQuestion, ExplanationLanguage, Skill } from '@/content/types';

export const STORAGE_KEY = 'linguapath-demo-v1';
/** Kazakhstan uses a single zone (UTC+5) since 2024-03-01; Asia/Almaty reflects it. */
export const TIME_ZONE = 'Asia/Almaty';
/** PRD §6: a topic unlocks at 75% mastery. */
export const PASS_RATIO = 0.75;
export const EXAM_XP_PER_POINT = 5;
export const MAX_MESSAGES = 40;
export const MAX_HISTORY = 100;
export const MAX_XP_LOG = 500;
export const LANGUAGES: readonly ExplanationLanguage[] = ['kk', 'zh', 'en'];
export const SKILLS: readonly Skill[] = ['Grammar', 'Vocabulary', 'Reading', 'Listening', 'Speaking'];
export const DAILY_GOALS = [10, 20, 30, 50] as const;
export const DEFAULT_MORNING = '07:30';
export const DEFAULT_EVENING = '20:00';
const BUSY_START = '09:00';
const BUSY_END = '19:00';

/** Activities that award XP at most once per Kazakhstan calendar day. */
export const DAILY_REWARDS = { match: 20, flashcards: 15, listening: 20, speaking: 20 } as const;
export type DailyActivity = keyof typeof DAILY_REWARDS;
export type XpSource = 'lesson' | 'exam' | DailyActivity;

export interface ExamRecord { date: string; score: number; total: number; errors: string[] }
export interface ChatMessage { role: 'user' | 'mira'; text: string }
export interface XpEntry { date: string; amount: number; source: XpSource }
export interface SkillStat { correct: number; total: number }

export interface LearnerState {
  done: string[];
  xp: number;
  examHistory: ExamRecord[];
  activity: string[];
  language: ExplanationLanguage;
  morning: string;
  evening: string;
  dailyGoal: number;
  messages: ChatMessage[];
  rewards: { examBest: Record<string, number>; daily: Record<DailyActivity, string[]> };
  xpLog: XpEntry[];
  skills: Record<Skill, SkillStat>;
  knownWords: string[];
}

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const WEEK_RE = /^\d{4}-W\d{2}$/;

export function defaultState(): LearnerState {
  return {
    done: [],
    xp: 0,
    examHistory: [],
    activity: [],
    language: 'kk',
    morning: DEFAULT_MORNING,
    evening: DEFAULT_EVENING,
    dailyGoal: 30,
    messages: [],
    rewards: { examBest: {}, daily: { match: [], flashcards: [], listening: [], speaking: [] } },
    xpLog: [],
    skills: { Grammar: { correct: 0, total: 0 }, Vocabulary: { correct: 0, total: 0 }, Reading: { correct: 0, total: 0 }, Listening: { correct: 0, total: 0 }, Speaking: { correct: 0, total: 0 } },
    knownWords: []
  };
}

type Unknown = Record<string, unknown>;
const isObject = (v: unknown): v is Unknown => v !== null && typeof v === 'object' && !Array.isArray(v);
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const nonNegInt = (v: unknown, fallback = 0) => (isNum(v) && v >= 0 ? Math.floor(v) : fallback);
const strings = (v: unknown, test?: (s: string) => boolean): string[] =>
  Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === 'string' && (!test || test(x))))] : [];
const isDate = (s: string) => DATE_RE.test(s);

export const isValidTime = (v: unknown): v is string => typeof v === 'string' && TIME_RE.test(v);
export const isValidMorning = (v: unknown): v is string => isValidTime(v) && v < BUSY_START;
export const isValidEvening = (v: unknown): v is string => isValidTime(v) && v >= BUSY_END;

/**
 * Turn anything read from storage into a valid state. Unknown fields are dropped and
 * invalid ones fall back to defaults, so corrupted or tampered data can never crash
 * the UI. Compatible with v0.1/v0.2 prototype data.
 */
export function sanitizeState(raw: unknown, lessonIds?: readonly string[]): LearnerState {
  const s = defaultState();
  if (!isObject(raw)) return s;
  const known = lessonIds ? (id: string) => lessonIds.includes(id) : undefined;

  s.done = strings(raw.done, known);
  s.xp = nonNegInt(raw.xp);
  s.activity = strings(raw.activity, isDate).sort().slice(-400);
  s.language = LANGUAGES.includes(raw.language as ExplanationLanguage) ? (raw.language as ExplanationLanguage) : 'kk';
  s.morning = isValidMorning(raw.morning) ? raw.morning : DEFAULT_MORNING;
  s.evening = isValidEvening(raw.evening) ? raw.evening : DEFAULT_EVENING;
  s.dailyGoal = (DAILY_GOALS as readonly number[]).includes(raw.dailyGoal as number) ? (raw.dailyGoal as number) : 30;

  if (Array.isArray(raw.examHistory)) {
    s.examHistory = raw.examHistory
      .filter((x): x is Unknown => isObject(x) && typeof x.date === 'string' && isDate(x.date) && isNum(x.score))
      .map(x => {
        const score = nonNegInt(x.score);
        const total = nonNegInt(x.total);
        // v0.1 records had no total; the exam then had 6 questions.
        return { date: x.date as string, score, total: total >= score && total > 0 ? total : Math.max(score, 6), errors: strings(x.errors) };
      })
      .slice(-MAX_HISTORY);
  }

  if (Array.isArray(raw.messages)) {
    s.messages = raw.messages
      .filter((m): m is Unknown => isObject(m) && typeof m.text === 'string' && (m.role === 'user' || m.role === 'mira' || m.role === 'bot'))
      .map(m => ({ role: m.role === 'user' ? ('user' as const) : ('mira' as const), text: (m.text as string).slice(0, 2000) }))
      .slice(-MAX_MESSAGES);
  }

  if (isObject(raw.rewards)) {
    if (isObject(raw.rewards.examBest)) {
      for (const [week, score] of Object.entries(raw.rewards.examBest)) {
        if (WEEK_RE.test(week) && isNum(score) && score >= 0) s.rewards.examBest[week] = Math.floor(score);
      }
    }
    const daily = isObject(raw.rewards.daily) ? raw.rewards.daily : {};
    for (const key of Object.keys(DAILY_REWARDS) as DailyActivity[]) {
      s.rewards.daily[key] = strings(daily[key], isDate).slice(-400);
    }
    // v0.2 stored the match-game days as rewards.matchDays.
    if (!s.rewards.daily.match.length) s.rewards.daily.match = strings(raw.rewards.matchDays, isDate).slice(-400);
  }

  if (Array.isArray(raw.xpLog)) {
    const sources: readonly string[] = ['lesson', 'exam', ...Object.keys(DAILY_REWARDS)];
    s.xpLog = raw.xpLog
      .filter((e): e is Unknown => isObject(e) && typeof e.date === 'string' && isDate(e.date) && isNum(e.amount) && e.amount > 0 && sources.includes(e.source as string))
      .map(e => ({ date: e.date as string, amount: Math.floor(e.amount as number), source: e.source as XpSource }))
      .slice(-MAX_XP_LOG);
  }

  if (isObject(raw.skills)) {
    for (const skill of SKILLS) {
      const v = raw.skills[skill];
      if (isObject(v)) {
        const total = nonNegInt(v.total);
        s.skills[skill] = { total, correct: Math.min(nonNegInt(v.correct), total) };
      }
    }
  }

  s.knownWords = strings(raw.knownWords).slice(0, 5000);
  return s;
}

interface StorageLike { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem?(key: string): void }

/** Read + parse + sanitize. Never throws (storage may be blocked or corrupted). */
export function loadState(storage: StorageLike | null | undefined, lessonIds?: readonly string[]): LearnerState {
  let raw: unknown = null;
  try {
    const text = storage?.getItem(STORAGE_KEY);
    raw = text ? JSON.parse(text) : null;
  } catch {
    raw = null;
  }
  return sanitizeState(raw, lessonIds);
}

/** Persist state. Returns false instead of throwing (quota, private mode…). */
export function saveState(storage: StorageLike | null | undefined, state: LearnerState): boolean {
  try {
    if (!storage) return false;
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

/* ---------- Dates (Kazakhstan time) ---------- */

/** YYYY-MM-DD for the given instant in Kazakhstan time. */
export function dateKey(date: Date = new Date(), timeZone: string = TIME_ZONE): string {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
    const get = (type: string) => parts.find(p => p.type === type)!.value;
    return `${get('year')}-${get('month')}-${get('day')}`;
  } catch {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }
}

/** Hour (0–23) in Kazakhstan time. */
export function hourIn(date: Date = new Date(), timeZone: string = TIME_ZONE): number {
  try {
    return Number(new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', hourCycle: 'h23' }).format(date));
  } catch {
    return date.getHours();
  }
}

/** Shift a YYYY-MM-DD key by whole days (pure calendar maths, DST-safe). */
export function addDays(key: string, days: number): string {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** The last `count` date keys ending with `todayKey` (oldest first). */
export function lastDays(todayKey: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => addDays(todayKey, i - (count - 1)));
}

/** ISO-8601 day of week, 1 = Monday … 7 = Sunday. */
export function isoWeekday(key: string): number {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay() || 7;
}

/** ISO-8601 week id ("2026-W47") of a YYYY-MM-DD key. */
export function weekKey(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d));
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

/* ---------- Scoring ---------- */

/** Minimum correct answers needed to pass (75%, rounded up). */
export function requiredCorrect(total: number, ratio = PASS_RATIO): number {
  return Math.ceil(total * ratio - 1e-9);
}

export function isPassing(score: number, total: number, ratio = PASS_RATIO): boolean {
  return total > 0 && score >= requiredCorrect(total, ratio);
}

/** XP for an exam attempt: only the improvement over this week's best score. */
export function examXp(score: number, previousBest: number | undefined): number {
  return Math.max(0, score - (previousBest ?? 0)) * EXAM_XP_PER_POINT;
}

/** Exam questions limited to lessons the learner has already completed. */
export function examQuestionsFor<T extends Pick<ExamQuestion, 'lessonId'>>(questions: readonly T[], doneIds: readonly string[]): T[] {
  return questions.filter(q => doneIds.includes(q.lessonId));
}

/* ---------- Randomness ---------- */

/** Fisher–Yates shuffle returning a new array. `random` is injectable for tests. */
export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Shuffle, but avoid returning the original order when that is possible. */
export function shuffleDifferent<T>(items: readonly T[], random: () => number = Math.random): T[] {
  if (items.length < 2) return items.slice();
  for (let attempt = 0; attempt < 10; attempt++) {
    const a = shuffle(items, random);
    if (a.some((x, i) => x !== items[i])) return a;
  }
  return items.slice(1).concat(items[0]);
}

/* ---------- Validation ---------- */

export type ScheduleCheck = { ok: true } | { ok: false; field: 'morning' | 'evening'; error: string };

export function validateSchedule(morning: unknown, evening: unknown): ScheduleCheck {
  if (!isValidTime(morning)) return { ok: false, field: 'morning', error: 'Таңғы уақытты толтыр (СС:ММ).' };
  if (!isValidTime(evening)) return { ok: false, field: 'evening', error: 'Кешкі уақытты толтыр (СС:ММ).' };
  if (!isValidMorning(morning)) return { ok: false, field: 'morning', error: 'Таңғы уақыт 09:00-ге дейін болуы керек.' };
  if (!isValidEvening(evening)) return { ok: false, field: 'evening', error: 'Кешкі уақыт 19:00-ден кейін болуы керек.' };
  return { ok: true };
}

/* ---------- Formatting ---------- */

const KK_WEEKDAYS = ['Дүйсенбі', 'Сейсенбі', 'Сәрсенбі', 'Бейсенбі', 'Жұма', 'Сенбі', 'Жексенбі'];
const KK_MONTHS = ['қаңтар', 'ақпан', 'наурыз', 'сәуір', 'мамыр', 'маусым', 'шілде', 'тамыз', 'қыркүйек', 'қазан', 'қараша', 'желтоқсан'];

/** "Сәрсенбі, 18 қараша" — formatted without relying on the browser having kk locale data. */
export function formatKazakhDate(key: string): string {
  const [, m, d] = key.split('-').map(Number);
  return `${KK_WEEKDAYS[isoWeekday(key) - 1]}, ${d} ${KK_MONTHS[m - 1]}`;
}
