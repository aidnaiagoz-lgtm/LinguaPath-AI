/* LinguaPath AI — pure, testable logic (no DOM access).
 * Loaded in the browser as window.LinguaLogic and in Node tests via require(). */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.LinguaLogic = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STORAGE_KEY = 'linguapath-demo-v1';
  /** Kazakhstan uses a single zone (UTC+5) since 2024-03-01; Asia/Almaty reflects it. */
  const TIME_ZONE = 'Asia/Almaty';
  /** PRD §6: a topic unlocks at 75% mastery. */
  const PASS_RATIO = 0.75;
  const EXAM_XP_PER_POINT = 5;
  const MATCH_XP = 20;
  const MAX_MESSAGES = 20;
  const MAX_HISTORY = 100;
  const LANGUAGES = ['kk', 'zh', 'en'];
  const DEFAULT_MORNING = '07:30';
  const DEFAULT_EVENING = '20:00';
  const BUSY_START = '09:00';
  const BUSY_END = '19:00';

  const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  const WEEK_RE = /^\d{4}-W\d{2}$/;

  /** A fresh default state. Always returns new arrays/objects (never shared). */
  function defaultState() {
    return {
      done: [],
      xp: 0,
      examHistory: [],
      activity: [],
      language: 'kk',
      morning: DEFAULT_MORNING,
      evening: DEFAULT_EVENING,
      messages: [],
      rewards: { examBest: {}, matchDays: [] }
    };
  }

  const isPlainObject = v => v !== null && typeof v === 'object' && !Array.isArray(v);
  const uniqueStrings = (v, test) =>
    Array.isArray(v) ? [...new Set(v.filter(x => typeof x === 'string' && (!test || test(x))))] : [];
  const nonNegativeInt = (v, fallback = 0) =>
    Number.isFinite(v) && v >= 0 ? Math.floor(v) : fallback;

  /**
   * Turn anything read from storage into a valid state object.
   * Unknown fields are dropped, invalid fields fall back to defaults, so a
   * corrupted or tampered localStorage value can never crash the UI.
   */
  function sanitizeState(raw, lessonIds) {
    const s = defaultState();
    if (!isPlainObject(raw)) return s;
    const knownLesson = Array.isArray(lessonIds) ? id => lessonIds.includes(id) : null;

    s.done = uniqueStrings(raw.done, knownLesson);
    s.xp = nonNegativeInt(raw.xp);
    s.activity = uniqueStrings(raw.activity, x => DATE_RE.test(x)).slice(-366);
    s.language = LANGUAGES.includes(raw.language) ? raw.language : 'kk';
    s.morning = isValidMorning(raw.morning) ? raw.morning : DEFAULT_MORNING;
    s.evening = isValidEvening(raw.evening) ? raw.evening : DEFAULT_EVENING;

    if (Array.isArray(raw.examHistory)) {
      s.examHistory = raw.examHistory
        .filter(x => isPlainObject(x) && typeof x.date === 'string' && DATE_RE.test(x.date) && Number.isFinite(x.score))
        .map(x => {
          const score = nonNegativeInt(x.score);
          const total = nonNegativeInt(x.total, 0);
          return {
            date: x.date,
            score,
            // Old records (v0.1) had no total; the exam then had 6 questions.
            total: total >= score && total > 0 ? total : Math.max(score, 6),
            errors: uniqueStrings(x.errors)
          };
        })
        .slice(-MAX_HISTORY);
    }

    if (Array.isArray(raw.messages)) {
      s.messages = raw.messages
        .filter(m => isPlainObject(m) && (m.role === 'user' || m.role === 'bot') && typeof m.text === 'string')
        .map(m => ({ role: m.role, text: m.text.slice(0, 2000) }))
        .slice(-MAX_MESSAGES);
    }

    if (isPlainObject(raw.rewards)) {
      const best = raw.rewards.examBest;
      if (isPlainObject(best)) {
        for (const [week, score] of Object.entries(best)) {
          if (WEEK_RE.test(week) && Number.isFinite(score) && score >= 0) s.rewards.examBest[week] = Math.floor(score);
        }
      }
      s.rewards.matchDays = uniqueStrings(raw.rewards.matchDays, x => DATE_RE.test(x)).slice(-366);
    }
    return s;
  }

  /** Read + parse + sanitize. Never throws (storage may be blocked or corrupted). */
  function loadState(storage, lessonIds) {
    let raw = null;
    try {
      const text = storage && storage.getItem(STORAGE_KEY);
      raw = text ? JSON.parse(text) : null;
    } catch (_) {
      raw = null;
    }
    return sanitizeState(raw, lessonIds);
  }

  /** Persist state. Returns false instead of throwing (quota, private mode…). */
  function saveState(storage, state) {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (_) {
      return false;
    }
  }

  /** YYYY-MM-DD for the given instant in Kazakhstan time. */
  function dateKey(date = new Date(), timeZone = TIME_ZONE) {
    try {
      const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone, year: 'numeric', month: '2-digit', day: '2-digit'
      }).formatToParts(date);
      const get = type => parts.find(p => p.type === type).value;
      return `${get('year')}-${get('month')}-${get('day')}`;
    } catch (_) {
      // Fallback: the device's local calendar date (never UTC).
      const pad = n => String(n).padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    }
  }

  /** Shift a YYYY-MM-DD key by whole days (pure calendar maths, DST-safe). */
  function addDays(key, days) {
    const [y, m, d] = key.split('-').map(Number);
    const t = new Date(Date.UTC(y, m - 1, d + days));
    return t.toISOString().slice(0, 10);
  }

  /** The last `count` date keys ending with `todayKey` (oldest first). */
  function lastDays(todayKey, count) {
    return Array.from({ length: count }, (_, i) => addDays(todayKey, i - (count - 1)));
  }

  /** ISO-8601 week id ("2026-W47") of a YYYY-MM-DD key. */
  function weekKey(key) {
    const [y, m, d] = key.split('-').map(Number);
    const t = new Date(Date.UTC(y, m - 1, d));
    const day = t.getUTCDay() || 7;
    t.setUTCDate(t.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    const week = Math.ceil(((t - yearStart) / 86400000 + 1) / 7);
    return `${t.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
  }

  /** Minimum correct answers needed to pass (75%, rounded up). */
  function requiredCorrect(total, ratio = PASS_RATIO) {
    return Math.ceil(total * ratio - 1e-9);
  }

  function isPassing(score, total, ratio = PASS_RATIO) {
    return total > 0 && score >= requiredCorrect(total, ratio);
  }

  /** Fisher–Yates shuffle returning a new array. `random` is injectable for tests. */
  function shuffle(items, random = Math.random) {
    const a = items.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /** Shuffle, but avoid returning the original order when that is possible. */
  function shuffleDifferent(items, random = Math.random) {
    if (items.length < 2) return items.slice();
    for (let attempt = 0; attempt < 10; attempt++) {
      const a = shuffle(items, random);
      if (a.some((x, i) => x !== items[i])) return a;
    }
    return items.slice(1).concat(items[0]);
  }

  const isValidTime = v => typeof v === 'string' && TIME_RE.test(v);
  const isValidMorning = v => isValidTime(v) && v < BUSY_START;
  const isValidEvening = v => isValidTime(v) && v >= BUSY_END;

  /** Validate schedule input. Returns { ok, field?, error? } with a Kazakh message. */
  function validateSchedule(morning, evening) {
    if (!isValidTime(morning)) return { ok: false, field: 'morning', error: 'Таңғы уақытты толтыр (СС:ММ).' };
    if (!isValidTime(evening)) return { ok: false, field: 'evening', error: 'Кешкі уақытты толтыр (СС:ММ).' };
    if (!isValidMorning(morning)) return { ok: false, field: 'morning', error: 'Таңғы уақыт 09:00-ге дейін болуы керек.' };
    if (!isValidEvening(evening)) return { ok: false, field: 'evening', error: 'Кешкі уақыт 19:00-ден кейін болуы керек.' };
    return { ok: true };
  }

  /** Exam questions limited to lessons the learner has already completed. */
  function examQuestionsFor(exam, doneIds) {
    return exam.filter(q => doneIds.includes(q.lessonId));
  }

  /**
   * XP for an exam attempt: only the improvement over this week's best score
   * earns XP, so re-submitting the same exam cannot farm XP.
   */
  function examXp(score, previousBest) {
    const best = Number.isFinite(previousBest) ? previousBest : 0;
    return Math.max(0, score - best) * EXAM_XP_PER_POINT;
  }

  /** Match-game XP is granted at most once per Kazakhstan calendar day. */
  function matchXp(matchDays, todayKey) {
    return matchDays.includes(todayKey) ? 0 : MATCH_XP;
  }

  /** Static content integrity checks; returns a list of problems (empty = OK). */
  function validateData(data) {
    const problems = [];
    const ids = data.lessons.map(l => l.id);
    if (new Set(ids).size !== ids.length) problems.push('duplicate lesson id');
    const checkQuestion = (q, where) => {
      if (!Array.isArray(q.answers) || q.answers.length < 2) problems.push(`${where}: needs 2+ answers`);
      else if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct >= q.answers.length) problems.push(`${where}: bad correct index`);
    };
    data.lessons.forEach(l => {
      LANGUAGES.forEach(lang => {
        if (!l.notes || typeof l.notes[lang] !== 'string' || !l.notes[lang]) problems.push(`${l.id}: missing ${lang} note`);
      });
      (l.quiz || []).forEach((q, i) => checkQuestion(q, `${l.id} q${i + 1}`));
    });
    const examIds = data.exam.map(q => q.id);
    if (new Set(examIds).size !== examIds.length) problems.push('duplicate exam id');
    data.exam.forEach(q => {
      if (!ids.includes(q.lessonId)) problems.push(`exam ${q.id}: unknown lessonId ${q.lessonId}`);
      checkQuestion(q, `exam ${q.id}`);
    });
    data.words.forEach((w, i) => {
      LANGUAGES.forEach(lang => { if (!w[lang]) problems.push(`word ${i}: missing ${lang}`); });
    });
    return problems;
  }

  return {
    STORAGE_KEY, TIME_ZONE, PASS_RATIO, EXAM_XP_PER_POINT, MATCH_XP, MAX_MESSAGES, LANGUAGES,
    defaultState, sanitizeState, loadState, saveState,
    dateKey, addDays, lastDays, weekKey,
    requiredCorrect, isPassing, shuffle, shuffleDifferent,
    isValidTime, isValidMorning, isValidEvening, validateSchedule,
    examQuestionsFor, examXp, matchXp, validateData
  };
});
