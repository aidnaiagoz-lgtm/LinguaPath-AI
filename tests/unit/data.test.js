const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const L = require('../../website/logic.js');

function loadData() {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../../website/data.js'), 'utf8'), sandbox);
  return sandbox.window.LINGUA_DATA;
}
const DATA = loadData();

test('content passes integrity checks', () => {
  assert.deepEqual(L.validateData(DATA), []);
});

test('every lesson has kk/zh/en explanations', () => {
  for (const lesson of DATA.lessons) {
    for (const lang of ['kk', 'zh', 'en']) assert.ok(lesson.notes[lang], `${lesson.id} ${lang}`);
  }
});

test('every exam question is linked to an existing lesson (no untaught topics)', () => {
  const ids = DATA.lessons.map(l => l.id);
  for (const q of DATA.exam) assert.ok(ids.includes(q.lessonId), `${q.id} → ${q.lessonId}`);
});

test('past simple (not taught in A0–A1 sample lessons) is not in the exam', () => {
  for (const q of DATA.exam) assert.doesNotMatch(q.q, /yesterday/i, q.id);
});

test('every word has en/kk/zh', () => {
  for (const w of DATA.words) for (const lang of ['en', 'kk', 'zh']) assert.ok(w[lang]);
});

test('library links use https', () => {
  for (const r of DATA.resources) assert.match(r.url, /^https:\/\//, r.name);
});

test('website contains no obvious secrets', () => {
  const dir = path.join(__dirname, '../../website');
  for (const file of fs.readdirSync(dir)) {
    const text = fs.readFileSync(path.join(dir, file), 'utf8');
    assert.doesNotMatch(text, /(sk-[A-Za-z0-9]{20,}|api[_-]?key\s*[:=]\s*['"][^'"]{8,}|SUPABASE_SERVICE_ROLE|BEGIN [A-Z ]*PRIVATE KEY)/i, file);
  }
});
