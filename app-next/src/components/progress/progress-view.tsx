'use client';
import { Award, Flame, TrendingUp, Zap } from 'lucide-react';
import type { ReactNode } from 'react';
import { lessons } from '@/content/lessons';
import { dailyGoalProgress, levelInfo, streakInfo, weakestSkills, weeklyXp } from '@/lib/gamification';
import { SKILL_LABELS } from '@/lib/labels';
import { today, useHydrated, useLearner } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress';
import { ActivityHeatmap, SkillBreakdown, WeeklyXpChart } from './charts';

export function ProgressView() {
  const state = useLearner();
  const hydrated = useHydrated();
  if (!hydrated) return <div className="h-96 animate-pulse rounded-card bg-surface-muted" aria-hidden="true" />;

  const day = today();
  const level = levelInfo(state.xp);
  const streak = streakInfo(state.activity, day);
  const goal = dailyGoalProgress(state, day);
  const weak = weakestSkills(state.skills);
  const history = state.examHistory.slice(-6).reverse();

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric icon={<Zap className="size-4" />} label="Жалпы XP" value={state.xp}>
          <ProgressBar value={level.progress} label={`Деңгей ${level.level} прогресі`} className="mt-3" />
          <p className="mt-1.5 text-xs text-muted">Деңгей {level.level} · келесіге {level.toNext} XP</p>
        </Metric>
        <Metric icon={<Flame className="size-4" />} label="Streak" value={`${streak.current} күн`}>
          <p className="mt-3 text-xs text-muted">Рекорд: {streak.best} күн</p>
        </Metric>
        <Metric icon={<TrendingUp className="size-4" />} label="Бүгін" value={`${goal.earned} XP`}>
          <ProgressBar value={goal.progress} label="Күндік мақсат" className="mt-3" tone="accent" />
          <p className="mt-1.5 text-xs text-muted">Мақсат: {goal.goal} XP</p>
        </Metric>
        <Metric icon={<Award className="size-4" />} label="Сабақтар" value={`${state.done.length}/${lessons.length}`}>
          <p className="mt-3 text-xs text-muted">Үйренген сөздер: {state.knownWords.length}</p>
        </Metric>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="p-6 lg:col-span-3">
          <CardHeader title="Белсенділік" description="Соңғы 12 апта" />
          <div className="mt-5"><ActivityHeatmap activity={state.activity} today={day} /></div>
        </Card>
        <Card className="p-6 lg:col-span-2">
          <CardHeader title="Апталық XP" description="Соңғы 7 күн" />
          <div className="mt-5"><WeeklyXpChart data={weeklyXp(state, day)} goal={state.dailyGoal} /></div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <CardHeader title="Дағдылар" description="Сабақ, емтихан және практикадағы дұрыс жауаптар үлесі" />
          <div className="mt-5"><SkillBreakdown skills={state.skills} /></div>
          {weak.length > 0 && (
            <p className="mt-5 rounded-lg bg-warning-soft px-4 py-3 text-sm text-warning">
              Назар аудар: {weak.map(s => SKILL_LABELS[s]).join(', ')}. Келесі аптада осы дағдыларға көбірек уақыт бөл.
            </p>
          )}
        </Card>
        <Card className="p-6">
          <CardHeader title="Емтихан тарихы" description="Апталық тесттер" action={<ButtonLink href="/exam" size="sm" variant="secondary">Тапсыру</ButtonLink>} />
          {history.length ? (
            <table className="mt-4 w-full text-sm">
              <caption className="sr-only">Соңғы апталық тесттер</caption>
              <thead><tr className="text-left text-xs text-subtle"><th scope="col" className="py-2 font-medium">Күні</th><th scope="col" className="py-2 font-medium">Нәтиже</th><th scope="col" className="py-2 text-right font-medium">Қайталау</th></tr></thead>
              <tbody>
                {history.map((x, i) => (
                  <tr key={`${x.date}-${i}`} className="border-t border-border" data-testid="exam-row">
                    <td className="py-2.5 tabular-nums text-muted">{x.date}</td>
                    <td className="py-2.5 font-medium tabular-nums text-fg">{x.score}/{x.total}</td>
                    <td className="py-2.5 text-right">{x.errors.length ? <span className="text-xs text-muted">{x.errors.map(e => SKILL_LABELS[e as keyof typeof SKILL_LABELS] ?? e).join(', ')}</span> : <Badge tone="success">Қатесіз</Badge>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="mt-6 text-sm text-muted">Әзірге тест тапсырылмаған.</p>
          )}
        </Card>
      </div>
    </div>
  );
}

function Metric({ icon, label, value, children }: { icon: ReactNode; label: string; value: ReactNode; children?: ReactNode }) {
  return (
    <Card className="p-4 sm:p-5">
      <p className="flex items-center gap-2 text-[13px] text-muted"><span className="text-subtle" aria-hidden="true">{icon}</span>{label}</p>
      <p className="mt-2 text-xl font-semibold tabular-nums tracking-tight text-fg">{value}</p>
      {children}
    </Card>
  );
}
