'use client';
import { ArrowLeft, ArrowRight, CircleCheck, Clock, Lightbulb, RotateCcw, Target, Volume2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { lessons } from '@/content/lessons';
import type { ExplanationLanguage, Lesson } from '@/content/types';
import { checkLesson, isLessonUnlocked, type LessonResult } from '@/lib/actions';
import { LANGUAGE_LABELS, SKILL_LABELS } from '@/lib/labels';
import { requiredCorrect } from '@/lib/logic';
import { today, updateLearner, useHydrated, useLearner } from '@/lib/store';
import { useSpeak } from '@/lib/use-speech';
import { Badge } from '@/components/ui/badge';
import { Button, ButtonLink } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChoiceGroup } from '@/components/ui/choice-group';
import { EmptyState } from '@/components/ui/empty-state';
import { SegmentedControl } from '@/components/ui/segmented';
import { useToast } from '@/components/ui/toast';

const LANG_OPTIONS = (['kk', 'zh', 'en'] as const).map(v => ({ value: v, label: LANGUAGE_LABELS[v].name, lang: v }));

export function LessonView({ lesson }: { lesson: Lesson }) {
  const state = useLearner();
  const hydrated = useHydrated();
  const toast = useToast();
  const { supported, speaking, speak } = useSpeak();
  const [language, setLanguage] = useState<ExplanationLanguage | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<LessonResult | null>(null);

  const index = lessons.findIndex(l => l.id === lesson.id);
  const next = lessons[index + 1];
  const unlocked = isLessonUnlocked(lessons, index, state.done);
  const lang = language ?? state.language;
  const total = lesson.quiz.length;
  const required = requiredCorrect(total);
  const answered = Object.keys(answers).length;

  if (hydrated && !unlocked) {
    return (
      <EmptyState
        icon={<Target className="size-5" />}
        title="Бұл сабақ әлі жабық"
        description="Сабақтар ретімен ашылады. Алдымен алдыңғы сабақты кемі 75% нәтижемен аяқта."
        action={<ButtonLink href="/learn" variant="secondary" icon={<ArrowLeft className="size-4" aria-hidden="true" />}>Оқу жолына оралу</ButtonLink>}
      />
    );
  }

  function onCheck() {
    if (answered !== total) { toast('Алдымен барлық сұраққа жауап бер.', 'info'); return; }
    let outcome: LessonResult | null = null;
    updateLearner(s => { const r = checkLesson(s, lesson, answers, today()); outcome = r.result; return r.state; });
    const r = outcome as LessonResult | null;
    if (!r) return;
    setResult(r);
    if (r.xp) toast(`Сабақ аяқталды · +${r.xp} XP`);
  }

  function retry() { setAnswers({}); setResult(null); }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10">
      <div className="grid min-w-0 gap-8">
        <section aria-labelledby="explain-title" className="grid gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="explain-title" className="text-lg font-semibold tracking-tight text-fg">Түсіндірме</h2>
            <SegmentedControl label="Түсіндірме тілі" options={LANG_OPTIONS} value={lang} onChange={setLanguage} size="sm" />
          </div>
          <p lang={lang} className="max-w-[68ch] text-[17px] leading-[1.75] text-fg" data-testid="lesson-note">{lesson.notes[lang]}</p>
          <Card className="flex flex-wrap items-center justify-between gap-4 border-l-[3px] border-l-accent px-5 py-4 shadow-none">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-subtle">Мысал</p>
              <p lang="en" className="mt-1 text-lg font-medium text-fg">{lesson.example}</p>
            </div>
            {supported && (
              <Button variant="secondary" size="sm" onClick={() => speak(lesson.example)} icon={<Volume2 className="size-4" aria-hidden="true" />} aria-label="Мысалды тыңдау">
                {speaking ? 'Ойнап жатыр…' : 'Тыңдау'}
              </Button>
            )}
          </Card>
        </section>

        <section aria-labelledby="quiz-title" className="grid gap-4">
          <div>
            <h2 id="quiz-title" className="text-lg font-semibold tracking-tight text-fg">Тексеру</h2>
            <p className="mt-1 text-sm text-muted">Өту үшін кемі {required}/{total} дұрыс жауап керек (75%).</p>
          </div>
          {lesson.quiz.map((q, i) => (
            <ChoiceGroup
              key={`${lesson.id}-${i}-${result ? 'r' : 'q'}`}
              index={i}
              question={q.q}
              answers={q.answers}
              value={answers[i]}
              onChange={a => setAnswers(prev => ({ ...prev, [i]: a }))}
              disabled={!!result}
              reveal={!!result && result.passed}
              correct={q.correct}
              testId={`question-${i}`}
            />
          ))}

          <div aria-live="polite">
            {result && (
              <Card className={result.passed ? 'border-success/40 p-5' : 'border-warning/40 p-5'} data-testid="lesson-result">
                <div className="flex items-start gap-3">
                  <CircleCheck className={result.passed ? 'mt-0.5 size-5 text-success' : 'mt-0.5 size-5 text-warning'} aria-hidden="true" />
                  <div className="flex-1">
                    <p className="font-semibold text-fg">{result.passed ? 'Сабақ өтті' : 'Тағы бір рет байқап көр'}</p>
                    <p className="mt-1 text-sm text-muted">
                      {result.score}/{result.total} дұрыс жауап.{' '}
                      {result.passed
                        ? result.firstPass ? `+${result.xp} XP. Келесі сабақ ашылды.` : 'Сабақ бұрын өтілген, XP қайта берілмейді.'
                        : `Өту үшін кемі ${result.required}/${result.total} керек. Түсіндірмені қайта оқып, жауаптарды тексер.`}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {!result.passed && <Button onClick={retry} icon={<RotateCcw className="size-4" aria-hidden="true" />}>Қайта тапсыру</Button>}
                      {result.passed && next && <ButtonLink href={`/learn/${next.id}`} iconRight={<ArrowRight className="size-4" aria-hidden="true" />}>Келесі сабақ</ButtonLink>}
                      {result.passed && <ButtonLink href="/learn" variant="secondary">Оқу жолы</ButtonLink>}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {!result && (
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={onCheck} disabled={answered === 0}>Жауаптарды тексеру</Button>
              <span className="text-sm text-muted tabular-nums">{answered}/{total} жауап берілді</span>
            </div>
          )}
        </section>
      </div>

      <aside className="grid content-start gap-4 lg:sticky lg:top-24" aria-label="Сабақ туралы">
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-subtle">Мақсат</p>
          <p className="mt-2 text-sm leading-relaxed text-fg">{lesson.objective}</p>
          <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
            <div><dt className="text-subtle">Дағды</dt><dd className="mt-0.5 font-medium text-fg">{SKILL_LABELS[lesson.skill]}</dd></div>
            <div><dt className="text-subtle">Деңгей</dt><dd className="mt-0.5 font-medium text-fg">{lesson.level}</dd></div>
            <div><dt className="text-subtle">Уақыт</dt><dd className="mt-0.5 inline-flex items-center gap-1 font-medium text-fg"><Clock className="size-3.5" aria-hidden="true" />{lesson.minutes} мин</dd></div>
            <div><dt className="text-subtle">Сыйақы</dt><dd className="mt-0.5 font-medium tabular-nums text-fg">{lesson.xp} XP</dd></div>
          </dl>
          {state.done.includes(lesson.id) && <Badge tone="success" className="mt-4">Аяқталған</Badge>}
        </Card>
        <Card className="bg-surface-muted/60 p-5 shadow-none">
          <div className="flex items-start gap-3">
            <Lightbulb className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-muted">Түсінбеген жерің болса, түсіндірме тілін ауыстырып көр немесе <Link href="/teacher" className="font-medium text-primary underline-offset-2 hover:underline">Mira-дан сұра</Link>.</p>
          </div>
        </Card>
      </aside>
    </div>
  );
}
