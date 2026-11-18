import { describe, expect, it } from 'vitest';
import { LESSON_IDS } from '@/content/lessons';
import {
  STORAGE_KEY, addDays, dateKey, defaultState, examQuestionsFor, examXp, formatKazakhDate, hourIn, isPassing, isoWeekday,
  lastDays, loadState, requiredCorrect, sanitizeState, saveState, shuffle, shuffleDifferent, validateSchedule, weekKey
} from '@/lib/logic';

function memoryStorage(initial?: string) {
  const map = new Map<string, string>(initial === undefined ? [] : [[STORAGE_KEY, initial]]);
  return { getItem: (k: string) => map.get(k) ?? null, setItem: (k: string, v: string) => void map.set(k, v), removeItem: (k: string) => void map.delete(k) };
}

describe('state loading never crashes on corrupted data', () => {
  const corrupted: Record<string, string> = {
    'invalid JSON': '{not json',
    'JSON null': 'null',
    'JSON array': '[]',
    'null fields': '{"done":null,"xp":null,"examHistory":null,"activity":null,"messages":null,"skills":null,"xpLog":null}',
    'wrong types': '{"done":"a0-01","xp":"999","examHistory":{},"activity":5,"language":"fr","morning":"","evening":"25:00","dailyGoal":7,"messages":[null,1,{"role":"x"}],"skills":{"Grammar":{"correct":9,"total":2}},"xpLog":[{"date":"bad","amount":5}]}',
    'XSS strings': '{"xp":"<img src=x onerror=alert(1)>","messages":[{"role":"user","text":"<script>alert(1)</script>"}]}'
  };
  for (const [name, raw] of Object.entries(corrupted)) {
    it(name, () => {
      const s = loadState(memoryStorage(raw), LESSON_IDS);
      expect(Array.isArray(s.done)).toBe(true);
      expect(Number.isInteger(s.xp) && s.xp >= 0).toBe(true);
      expect(['kk', 'zh', 'en']).toContain(s.language);
      expect([10, 20, 30, 50]).toContain(s.dailyGoal);
      for (const stat of Object.values(s.skills)) expect(stat.correct).toBeLessThanOrEqual(stat.total);
      expect(s.xpLog.every(e => /^\d{4}-\d{2}-\d{2}$/.test(e.date))).toBe(true);
    });
  }

  it('keeps valid data and drops invalid entries', () => {
    const s = loadState(memoryStorage('{"done":[1,"a0-01","a0-01","zz-99"],"activity":["2026-11-18",null,"x"],"xp":40.7}'), LESSON_IDS);
    expect(s.done).toEqual(['a0-01']);
    expect(s.activity).toEqual(['2026-11-18']);
    expect(s.xp).toBe(40);
  });

  it('migrates v0.1/v0.2 prototype data', () => {
    const v02 = { done: ['a0-01'], xp: 55, examHistory: [{ date: '2026-11-10', score: 4, errors: ['Grammar'] }], activity: ['2026-11-10'], language: 'zh', morning: '07:00', evening: '20:30', messages: [{ role: 'bot', text: 'hi' }], rewards: { examBest: { '2026-W46': 4 }, matchDays: ['2026-11-10'] } };
    const s = loadState(memoryStorage(JSON.stringify(v02)), LESSON_IDS);
    expect(s).toMatchObject({ done: ['a0-01'], xp: 55, language: 'zh', morning: '07:00', evening: '20:30' });
    expect(s.examHistory[0]).toEqual({ date: '2026-11-10', score: 4, total: 6, errors: ['Grammar'] });
    expect(s.messages[0]).toEqual({ role: 'mira', text: 'hi' });
    expect(s.rewards.daily.match).toEqual(['2026-11-10']);
    expect(s.rewards.examBest).toEqual({ '2026-W46': 4 });
  });

  it('storage that throws is handled', () => {
    const broken = { getItem: () => { throw new Error('SecurityError'); }, setItem: () => { throw new Error('Quota'); } };
    expect(loadState(broken, LESSON_IDS)).toEqual(defaultState());
    expect(saveState(broken, defaultState())).toBe(false);
    expect(loadState(null)).toEqual(defaultState());
  });

  it('save → load round-trip and fresh defaults', () => {
    const storage = memoryStorage();
    const s = { ...defaultState(), done: ['a0-01'], xp: 25 };
    expect(saveState(storage, s)).toBe(true);
    expect(loadState(storage, LESSON_IDS)).toEqual(s);
    const a = defaultState(); a.activity.push('2026-11-18');
    expect(defaultState().activity).toEqual([]);
  });

  it('sanitizeState is idempotent', () => {
    const s = sanitizeState({ done: ['a0-01'], xp: 10, activity: ['2026-11-18'] }, LESSON_IDS);
    expect(sanitizeState(JSON.parse(JSON.stringify(s)), LESSON_IDS)).toEqual(s);
  });
});

describe('Kazakhstan time (Asia/Almaty, UTC+5)', () => {
  it('late evening UTC is already the next day', () => expect(dateKey(new Date('2026-11-17T20:30:00Z'))).toBe('2026-11-18'));
  it('same day before Kazakhstan midnight', () => expect(dateKey(new Date('2026-11-17T17:30:00Z'))).toBe('2026-11-17'));
  it('hour in Kazakhstan', () => expect(hourIn(new Date('2026-11-17T02:00:00Z'))).toBe(7));
  it('calendar maths', () => {
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(lastDays('2026-11-18', 28)).toHaveLength(28);
    expect(lastDays('2026-11-18', 28)[0]).toBe('2026-10-22');
  });
  it('ISO weeks and weekdays', () => {
    expect(weekKey('2026-01-01')).toBe('2026-W01');
    expect(weekKey('2024-12-30')).toBe('2025-W01');
    expect(weekKey('2027-01-01')).toBe('2026-W53');
    expect(isoWeekday('2026-11-18')).toBe(3);
    expect(isoWeekday('2026-11-22')).toBe(7);
  });
  it('Kazakh date label without browser locale data', () => expect(formatKazakhDate('2026-11-18')).toBe('Сәрсенбі, 18 қараша'));
});

describe('75% pass mark (PRD §6)', () => {
  it.each([[2, 3, false], [3, 3, true], [3, 4, true], [2, 4, false], [6, 8, true], [5, 8, false], [0, 0, false]])('%i/%i → %s', (score, total, pass) => {
    expect(isPassing(score, total)).toBe(pass);
  });
  it('required correct answers', () => {
    expect(requiredCorrect(3)).toBe(3);
    expect(requiredCorrect(4)).toBe(3);
  });
});

describe('anti-farming and exam selection', () => {
  it('exam XP only for improvement', () => {
    expect(examXp(4, undefined)).toBe(20);
    expect(examXp(4, 4)).toBe(0);
    expect(examXp(6, 4)).toBe(10);
  });
  it('exam questions only from completed lessons', () => {
    const qs = [{ id: 'e1', lessonId: 'a0-01' }, { id: 'e2', lessonId: 'a0-02' }];
    expect(examQuestionsFor(qs, [])).toEqual([]);
    expect(examQuestionsFor(qs, ['a0-02']).map(q => q.id)).toEqual(['e2']);
  });
});

describe('shuffle', () => {
  it('is a permutation and does not mutate', () => {
    const input = [0, 1, 2, 3, 4, 5, 6, 7];
    const out = shuffle(input);
    expect(input).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect([...out].sort()).toEqual(input);
  });
  it('shuffleDifferent never returns the original order', () => {
    expect(shuffleDifferent([0, 1, 2, 3], () => 0.999999)).not.toEqual([0, 1, 2, 3]);
    for (let i = 0; i < 200; i++) expect(shuffleDifferent([0, 1, 2, 3])).not.toEqual([0, 1, 2, 3]);
  });
});

describe('schedule validation', () => {
  it('rejects empty, malformed and busy-hour times', () => {
    expect(validateSchedule('', '20:00')).toMatchObject({ ok: false, field: 'morning' });
    expect(validateSchedule('07:30', '')).toMatchObject({ ok: false, field: 'evening' });
    expect(validateSchedule('09:00', '20:00').ok).toBe(false);
    expect(validateSchedule('07:30', '18:59').ok).toBe(false);
    expect(validateSchedule('7:30', '20:00').ok).toBe(false);
  });
  it('accepts valid times', () => {
    expect(validateSchedule('08:59', '19:00').ok).toBe(true);
    expect(validateSchedule('00:00', '23:59').ok).toBe(true);
  });
});
