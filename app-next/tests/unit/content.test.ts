import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { lessons } from '@/content/lessons';
import { exam, listening, resources, speaking, words } from '@/content/practice';
import { demoReply, greetings, suggestions } from '@/components/mira/demo-replies';

const ids = lessons.map(l => l.id);
const validQuestion = (q: { answers: string[]; correct: number }) => q.answers.length >= 2 && Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.answers.length;

describe('content integrity', () => {
  it('lesson ids are unique and complete in kk/zh/en', () => {
    expect(new Set(ids).size).toBe(ids.length);
    for (const l of lessons) {
      for (const lang of ['kk', 'zh', 'en'] as const) expect(l.notes[lang], `${l.id} ${lang}`).toBeTruthy();
      expect(l.quiz.every(validQuestion), l.id).toBe(true);
    }
  });

  it('every exam / listening / speaking item belongs to an existing lesson', () => {
    for (const item of [...exam, ...listening, ...speaking]) expect(ids, item.id).toContain(item.lessonId);
    expect(new Set(exam.map(q => q.id)).size).toBe(exam.length);
    expect(exam.every(validQuestion)).toBe(true);
    expect(listening.every(validQuestion)).toBe(true);
  });

  it('untaught topics (past simple) are not in the exam', () => {
    for (const q of exam) expect(q.q).not.toMatch(/yesterday/i);
  });

  it('trilingual practice content', () => {
    for (const w of words) for (const lang of ['en', 'kk', 'zh'] as const) expect(w[lang]).toBeTruthy();
    for (const l of listening) for (const lang of ['kk', 'zh', 'en'] as const) expect(l.translation[lang]).toBeTruthy();
    for (const s of speaking) for (const lang of ['kk', 'zh', 'en'] as const) expect(s.tip[lang]).toBeTruthy();
  });

  it('library links are https', () => {
    for (const r of resources) expect(r.url).toMatch(/^https:\/\//);
  });
});

describe('Mira demo', () => {
  it('replies in the chosen language and admits it is a demo', () => {
    expect(demoReply('grammar please', 'zh')).toContain('to be');
    expect(demoReply('сәлем', 'kk')).toContain('My name is');
    expect(demoReply('something else', 'en')).toMatch(/demo/i);
    for (const lang of ['kk', 'zh', 'en'] as const) {
      expect(greetings[lang]).toBeTruthy();
      expect(suggestions[lang]).toHaveLength(3);
    }
    expect(greetings.kk).toMatch(/демо/i);
  });
});

describe('no secrets in the source tree', () => {
  const root = path.resolve(__dirname, '../../src');
  const files: string[] = [];
  const walk = (dir: string) => fs.readdirSync(dir, { withFileTypes: true }).forEach(e => (e.isDirectory() ? walk(path.join(dir, e.name)) : files.push(path.join(dir, e.name))));
  walk(root);
  it.each(files.map(f => [path.relative(root, f)]))('%s', rel => {
    const text = fs.readFileSync(path.join(root, rel), 'utf8');
    expect(text).not.toMatch(/(sk-[A-Za-z0-9]{20,}|api[_-]?key\s*[:=]\s*['"][^'"]{8,}|SUPABASE_SERVICE_ROLE|BEGIN [A-Z ]*PRIVATE KEY)/i);
  });
});
