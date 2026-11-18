const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../../website/logic.js');

const LESSONS = ['a0-01', 'a0-02', 'a0-03', 'a1-01', 'a1-02', 'a1-03'];

function memoryStorage(initial) {
  const map = new Map(initial === undefined ? [] : [[L.STORAGE_KEY, initial]]);
  return {
    getItem: k => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: k => map.delete(k),
    raw: () => map.get(L.STORAGE_KEY)
  };
}

test.describe('state loading (corrupted localStorage must never crash)', () => {
  const corrupted = [
    ['invalid JSON', '{not json'],
    ['JSON null', 'null'],
    ['JSON array', '[]'],
    ['JSON number', '42'],
    ['null fields', '{"done":null,"xp":null,"examHistory":null,"activity":null,"messages":null}'],
    ['wrong types', '{"done":"a0-01","xp":"999","examHistory":{},"activity":5,"language":"fr","morning":"","evening":"25:00","messages":[null,1,{"role":"x"}]}'],
    ['negative / infinite numbers', '{"xp":-50,"examHistory":[{"date":"2026-11-18","score":-1}]}'],
    ['garbage inside arrays', '{"done":[1,null,{},"a0-01","a0-01","zz-99"],"activity":["2026-11-18",null,"yesterday"]}']
  ];
  for (const [name, raw] of corrupted) {
    test(name, () => {
      const s = L.loadState(memoryStorage(raw), LESSONS);
      assert.ok(Array.isArray(s.done));
      assert.ok(Array.isArray(s.examHistory));
      assert.ok(Array.isArray(s.activity));
      assert.ok(Array.isArray(s.messages));
      assert.ok(Number.isInteger(s.xp) && s.xp >= 0);
      assert.ok(L.LANGUAGES.includes(s.language));
      assert.ok(L.isValidMorning(s.morning));
      assert.ok(L.isValidEvening(s.evening));
      assert.ok(s.rewards && typeof s.rewards.examBest === 'object' && Array.isArray(s.rewards.matchDays));
    });
  }

  test('keeps valid data and drops invalid entries', () => {
    const s = L.loadState(memoryStorage('{"done":[1,"a0-01","a0-01","zz-99"],"activity":["2026-11-18",null,"yesterday"],"xp":40.7}'), LESSONS);
    assert.deepEqual(s.done, ['a0-01']);
    assert.deepEqual(s.activity, ['2026-11-18']);
    assert.equal(s.xp, 40);
  });

  test('v0.1 data stays compatible (exam history without total)', () => {
    const v01 = { done: ['a0-01'], xp: 55, examHistory: [{ date: '2026-11-10', score: 4, errors: ['Grammar'] }], activity: ['2026-11-10'], language: 'zh', morning: '07:00', evening: '20:30', messages: [{ role: 'user', text: 'hi' }], mistakes: [], review: [] };
    const s = L.loadState(memoryStorage(JSON.stringify(v01)), LESSONS);
    assert.deepEqual(s.done, ['a0-01']);
    assert.equal(s.xp, 55);
    assert.equal(s.language, 'zh');
    assert.equal(s.morning, '07:00');
    assert.deepEqual(s.examHistory[0], { date: '2026-11-10', score: 4, total: 6, errors: ['Grammar'] });
  });

  test('storage that throws on read/write is handled', () => {
    const broken = { getItem() { throw new Error('SecurityError'); }, setItem() { throw new Error('QuotaExceeded'); } };
    assert.deepEqual(L.loadState(broken, LESSONS), L.defaultState());
    assert.equal(L.saveState(broken, L.defaultState()), false);
    assert.deepEqual(L.loadState(null, LESSONS), L.defaultState());
  });

  test('default state is never shared between instances', () => {
    const a = L.defaultState();
    a.activity.push('2026-11-18');
    a.rewards.matchDays.push('2026-11-18');
    const b = L.defaultState();
    assert.deepEqual(b.activity, []);
    assert.deepEqual(b.rewards.matchDays, []);
  });

  test('save → load round-trip', () => {
    const storage = memoryStorage();
    const s = L.defaultState();
    s.done.push('a0-01');
    s.xp = 25;
    assert.equal(L.saveState(storage, s), true);
    assert.deepEqual(L.loadState(storage, LESSONS), s);
  });
});

test.describe('dates in Kazakhstan time (Asia/Almaty, UTC+5)', () => {
  test('late evening UTC is already the next day in Kazakhstan', () => {
    assert.equal(L.dateKey(new Date('2026-11-17T20:30:00Z')), '2026-11-18');
  });
  test('same calendar day before Kazakhstan midnight', () => {
    assert.equal(L.dateKey(new Date('2026-11-17T17:30:00Z')), '2026-11-17');
  });
  test('addDays crosses months and years', () => {
    assert.equal(L.addDays('2026-03-01', -1), '2026-02-28');
    assert.equal(L.addDays('2026-12-31', 1), '2027-01-01');
  });
  test('lastDays returns 28 consecutive keys ending today', () => {
    const days = L.lastDays('2026-11-18', 28);
    assert.equal(days.length, 28);
    assert.equal(days[0], '2026-10-22');
    assert.equal(days[27], '2026-11-18');
  });
  test('ISO week keys', () => {
    assert.equal(L.weekKey('2026-01-01'), '2026-W01');
    assert.equal(L.weekKey('2024-12-30'), '2025-W01');
    assert.equal(L.weekKey('2027-01-01'), '2026-W53');
    assert.equal(L.weekKey('2026-11-16'), L.weekKey('2026-11-22'));
    assert.notEqual(L.weekKey('2026-11-22'), L.weekKey('2026-11-23'));
  });
});

test.describe('lesson pass threshold = 75% (PRD §6)', () => {
  test('3 questions: 2/3 fails, 3/3 passes', () => {
    assert.equal(L.requiredCorrect(3), 3);
    assert.equal(L.isPassing(2, 3), false);
    assert.equal(L.isPassing(3, 3), true);
  });
  test('4 questions: 3/4 = 75% passes', () => {
    assert.equal(L.requiredCorrect(4), 3);
    assert.equal(L.isPassing(3, 4), true);
    assert.equal(L.isPassing(2, 4), false);
  });
  test('8 questions: 6/8 passes, 5/8 fails', () => {
    assert.equal(L.isPassing(6, 8), true);
    assert.equal(L.isPassing(5, 8), false);
  });
  test('empty quiz never passes', () => {
    assert.equal(L.isPassing(0, 0), false);
  });
});

test.describe('XP cannot be farmed', () => {
  test('exam XP only for improvement over the weekly best', () => {
    assert.equal(L.examXp(4, undefined), 20);
    assert.equal(L.examXp(4, 4), 0);
    assert.equal(L.examXp(3, 4), 0);
    assert.equal(L.examXp(6, 4), 10);
  });
  test('match XP once per day', () => {
    assert.equal(L.matchXp([], '2026-11-18'), L.MATCH_XP);
    assert.equal(L.matchXp(['2026-11-18'], '2026-11-18'), 0);
    assert.equal(L.matchXp(['2026-11-18'], '2026-11-19'), L.MATCH_XP);
  });
});

test.describe('shuffle', () => {
  test('returns a permutation and does not mutate the input', () => {
    const input = [0, 1, 2, 3, 4, 5, 6, 7];
    const out = L.shuffle(input);
    assert.deepEqual(input, [0, 1, 2, 3, 4, 5, 6, 7]);
    assert.deepEqual([...out].sort((a, b) => a - b), input);
  });
  test('shuffleDifferent never returns the original order', () => {
    const input = [0, 1, 2, 3];
    const identity = () => 0.999999; // a random() that would keep the order
    const out = L.shuffleDifferent(input, identity);
    assert.notDeepEqual(out, input);
    assert.deepEqual([...out].sort(), input);
    for (let i = 0; i < 200; i++) assert.notDeepEqual(L.shuffleDifferent(input), input);
  });
  test('produces different orders over many runs', () => {
    const seen = new Set();
    for (let i = 0; i < 50; i++) seen.add(L.shuffleDifferent([0, 1, 2, 3, 4, 5, 6, 7]).join());
    assert.ok(seen.size > 10);
  });
});

test.describe('schedule validation', () => {
  test('empty fields are rejected', () => {
    assert.deepEqual(L.validateSchedule('', '20:00').field, 'morning');
    assert.deepEqual(L.validateSchedule('07:30', '').field, 'evening');
    assert.equal(L.validateSchedule('', '').ok, false);
    assert.equal(L.validateSchedule(undefined, null).ok, false);
  });
  test('busy hours 09:00–19:00 are rejected', () => {
    assert.equal(L.validateSchedule('09:00', '20:00').ok, false);
    assert.equal(L.validateSchedule('07:30', '18:59').ok, false);
  });
  test('malformed times are rejected', () => {
    assert.equal(L.validateSchedule('7:30', '20:00').ok, false);
    assert.equal(L.validateSchedule('07:30', '24:00').ok, false);
  });
  test('valid times are accepted', () => {
    assert.equal(L.validateSchedule('08:59', '19:00').ok, true);
    assert.equal(L.validateSchedule('00:00', '23:59').ok, true);
  });
});

test.describe('exam question selection', () => {
  const exam = [
    { id: 'e1', lessonId: 'a0-01' },
    { id: 'e2', lessonId: 'a0-02' },
    { id: 'e3', lessonId: 'a1-01' }
  ];
  test('no completed lessons → no questions', () => {
    assert.deepEqual(L.examQuestionsFor(exam, []), []);
  });
  test('only questions from completed lessons', () => {
    assert.deepEqual(L.examQuestionsFor(exam, ['a0-01', 'a1-01']).map(q => q.id), ['e1', 'e3']);
  });
});
