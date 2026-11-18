'use client';
import { CalendarClock, ClipboardCheck, RotateCcw, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { exam } from '@/content/practice';
import type { Skill } from '@/content/types';
import { submitExam, type ExamResult } from '@/lib/actions';
import { cn } from '@/lib/cn';
import { SKILL_LABELS } from '@/lib/labels';
import { examQuestionsFor, isoWeekday } from '@/lib/logic';
import { today, updateLearner, useHydrated, useLearner } from '@/lib/store';
import { Badge, DemoBadge } from '@/components/ui/badge';
import { Button, ButtonLink } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChoiceGroup } from '@/components/ui/choice-group';
import { EmptyState } from '@/components/ui/empty-state';
import { ProgressBar } from '@/components/ui/progress';
import { useToast } from '@/components/ui/toast';

export function ExamRunner() {
  const state = useLearner();
  const hydrated = useHydrated();
  const toast = useToast();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<ExamResult | null>(null);
  const questions = examQuestionsFor(exam, state.done);
  const answered = questions.filter(q => answers[q.id] !== undefined).length;

  if (!hydrated) return <div className="h-64 animate-pulse rounded-card bg-surface-muted" aria-hidden="true" />;

  if (!questions.length) {
    return (
      <EmptyState
        icon={<ClipboardCheck className="size-5" />}
        title="Әзірге сұрақ жоқ"
        description="Апталық емтихан тек өзің өткен тақырыптарды тексереді. Алдымен кемі бір сабақты аяқта."
        action={<ButtonLink href="/learn">Сабақтарға өту</ButtonLink>}
      />
    );
  }

  function onSubmit() {
    let outcome: ExamResult | null = null;
    let error: string | null = null;
    updateLearner(s => {
      const r = submitExam(s, exam, answers, today());
      if ('error' in r) { error = r.error; return s; }
      outcome = r.result;
      return r.state;
    });
    if (error) { toast(error, 'info'); return; }
    const r = outcome as ExamResult | null;
    if (!r) return;
    setResult(r);
    toast(r.xp ? `Нәтиже сақталды · +${r.xp} XP` : 'Нәтиже сақталды', 'success');
    requestAnimationFrame(() => document.getElementById('exam-result')?.focus());
  }

  function retake() { setAnswers({}); setResult(null); window.scrollTo({ top: 0 }); }

  const isSunday = isoWeekday(today()) === 7;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10">
      <div className="grid min-w-0 gap-4">
        {result && <ExamSummary result={result} onRetake={retake} />}
        {questions.map((q, i) => (
          <ChoiceGroup
            key={`${q.id}-${result ? 'r' : 'q'}`}
            index={i}
            question={q.q}
            answers={q.answers}
            value={answers[q.id]}
            onChange={a => setAnswers(prev => ({ ...prev, [q.id]: a }))}
            disabled={!!result}
            reveal={!!result}
            correct={q.correct}
            testId={`exam-${q.id}`}
          />
        ))}
        {!result && (
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={onSubmit} disabled={answered === 0}>Нәтижені шығару</Button>
            <span className="text-sm text-muted tabular-nums">{answered}/{questions.length} жауап берілді</span>
          </div>
        )}
      </div>

      <aside className="grid content-start gap-4 lg:sticky lg:top-24" aria-label="Емтихан туралы">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-fg">Осы аптаның тесті</p>
            <DemoBadge />
          </div>
          <dl className="mt-4 grid gap-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Сұрақтар</dt><dd className="font-medium tabular-nums text-fg">{questions.length}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Өтілген сабақтар</dt><dd className="font-medium tabular-nums text-fg">{state.done.length}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Тапсырылған тест</dt><dd className="font-medium tabular-nums text-fg">{state.examHistory.length}</dd></div>
          </dl>
          <p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted">XP тек осы аптадағы ең жақсы нәтижеңді жақсартқанда қосылады. Бұл ресми CEFR немесе IELTS бағасы емес.</p>
        </Card>
        <Card className="flex items-start gap-3 bg-surface-muted/60 p-5 shadow-none">
          <CalendarClock className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-muted">{isSunday ? 'Бүгін — емтихан күні. Ұсынылған уақыт: 20:00–21:00.' : 'Ұсынылған уақыт: жексенбі, 20:00–21:00. Ыңғайлы кезде ертерек тапсыруға болады.'}</p>
        </Card>
      </aside>
    </div>
  );
}

function ExamSummary({ result, onRetake }: { result: ExamResult; onRetake: () => void }) {
  const pct = result.score / result.total;
  const topics = Object.entries(result.byTopic) as [Skill, { correct: number; total: number }][];
  return (
    <Card id="exam-result" tabIndex={-1} className="p-5 sm:p-6" data-testid="exam-result" aria-labelledby="exam-result-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-subtle">Нәтиже</p>
          <h2 id="exam-result-title" className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-fg">{result.score}/{result.total} дұрыс</h2>
          <p className="mt-1 text-sm text-muted">{pct >= 0.8 ? 'Өте жақсы нәтиже.' : 'Қате тақырыптарды қайталап, қайта тапсырып көр.'}</p>
        </div>
        <Badge tone={result.xp ? 'success' : 'neutral'} icon={<TrendingUp className="size-3.5" aria-hidden="true" />}>
          {result.xp ? `+${result.xp} XP` : 'XP бұрын берілген'}
        </Badge>
      </div>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {topics.map(([topic, s]) => (
          <li key={topic} className="rounded-lg border border-border p-3">
            <div className="flex justify-between text-sm"><span className="text-fg">{SKILL_LABELS[topic]}</span><span className={cn('tabular-nums', s.correct === s.total ? 'text-success' : 'text-warning')}>{s.correct}/{s.total}</span></div>
            <ProgressBar value={s.correct / s.total} label={`${SKILL_LABELS[topic]}: ${s.correct}/${s.total}`} className="mt-2" tone={s.correct === s.total ? 'success' : 'primary'} />
          </li>
        ))}
      </ul>
      {!result.xp && <p className="mt-4 text-sm text-muted">Бұл аптада осы нәтиже үшін XP бұрын берілген. XP тек нәтижеңді жақсартқанда қосылады.</p>}
      <Button variant="secondary" className="mt-5" onClick={onRetake} icon={<RotateCcw className="size-4" aria-hidden="true" />}>Қайта тапсыру</Button>
    </Card>
  );
}
