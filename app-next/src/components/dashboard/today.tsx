'use client';
import { ArrowRight, BookA, CalendarDays, Check, ClipboardCheck, Flame, GraduationCap, Headphones, Mic, Moon, Sunrise, Target, Zap } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { lessons } from '@/content/lessons';
import { cn } from '@/lib/cn';
import { dailyGoalProgress, levelInfo, streakInfo } from '@/lib/gamification';
import { SKILL_LABELS } from '@/lib/labels';
import { DAILY_REWARDS, formatKazakhDate, hourIn, isoWeekday, type DailyActivity } from '@/lib/logic';
import { today, useHydrated, useLearner } from '@/lib/store';
import { MiraAvatar } from '@/components/mira/mira-avatar';
import { DemoBadge } from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { ProgressBar, ProgressRing } from '@/components/ui/progress';

const PRACTICE: { key: DailyActivity; href: string; title: string; desc: string; icon: typeof BookA }[] = [
  { key: 'match', href: '/vocabulary', title: 'Сөздік', desc: 'Сәйкестендіру · карточкалар', icon: BookA },
  { key: 'listening', href: '/listening', title: 'Тыңдалым', desc: 'Қысқа сөйлемдерді түсіну', icon: Headphones },
  { key: 'speaking', href: '/speaking', title: 'Айтылым', desc: 'Shadowing · 5 минут', icon: Mic }
];

function greeting(hour: number) {
  if (hour < 5) return 'Қайырлы түн';
  if (hour < 12) return 'Қайырлы таң';
  if (hour < 18) return 'Қайырлы күн';
  return 'Қайырлы кеш';
}

export function Today() {
  const state = useLearner();
  const hydrated = useHydrated();
  const day = hydrated ? today() : '';
  const level = levelInfo(state.xp);
  const streak = hydrated ? streakInfo(state.activity, day) : { current: 0, best: 0, activeToday: false };
  const goal = hydrated ? dailyGoalProgress(state, day) : { earned: 0, goal: state.dailyGoal, progress: 0, reached: false };
  const nextLesson = lessons.find(l => !state.done.includes(l.id));
  const pathProgress = state.done.length / lessons.length;
  const isSunday = hydrated && isoWeekday(day) === 7;
  const dateLabel = hydrated ? formatKazakhDate(day) : '';

  return (
    <div className="grid grid-cols-1 animate-enter gap-8">
      <header className="flex flex-col gap-1">
        <p className="min-h-5 text-sm text-subtle">{dateLabel}</p>
        <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-fg sm:text-[30px]">
          {hydrated ? greeting(hourIn()) : 'Сәлем'}. Бүгінгі мақсатқа кірісейік.
        </h1>
        <p className="text-[15px] text-muted">A0 → B2 жолы · қазақша, қытайша және ағылшынша түсіндірме.</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="relative overflow-hidden p-6 lg:col-span-2">
          <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-brand-indigo/10 blur-3xl" aria-hidden="true" />
          <div className="relative">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-subtle">{nextLesson ? 'Келесі сабақ' : 'Бағдарлама'}</p>
            {nextLesson ? (
              <>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-fg">{nextLesson.title}</h2>
                <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-muted">{nextLesson.objective}</p>
                <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted">
                  <span>{nextLesson.level} · {SKILL_LABELS[nextLesson.skill]}</span>
                  <span>{nextLesson.minutes} мин</span>
                  <span className="tabular-nums">+{nextLesson.xp} XP</span>
                </p>
              </>
            ) : (
              <>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-fg">A0–A1 үлгі сабақтары аяқталды</h2>
                <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-muted">Апталық емтиханды тапсырып, сөздік пен тыңдалымды қайтала. A2 сабақтары дайындалуда.</p>
              </>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <ButtonLink href={nextLesson ? `/learn/${nextLesson.id}` : '/exam'} size="lg" iconRight={<ArrowRight className="size-4" aria-hidden="true" />}>
                {nextLesson ? (state.done.length ? 'Жалғастыру' : 'Бірінші сабақты бастау') : 'Емтиханға өту'}
              </ButtonLink>
              <div className="min-w-40 flex-1">
                <div className="mb-1.5 flex justify-between text-xs text-muted"><span>A0–A1 жолы</span><span className="tabular-nums">{state.done.length}/{lessons.length}</span></div>
                <ProgressBar value={pathProgress} label="A0–A1 жолының прогресі" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col p-6">
          <CardHeader title="Күндік мақсат" description={goal.reached ? 'Бүгінгі мақсат орындалды.' : `${Math.max(0, goal.goal - goal.earned)} XP қалды`} />
          <div className="mt-5 flex items-center gap-5">
            <ProgressRing value={goal.progress} size={84} stroke={7} label="Күндік мақсат прогресі">
              <span className="text-center">
                <span className="block text-lg font-semibold tabular-nums leading-none text-fg">{goal.earned}</span>
                <span className="text-[11px] text-subtle">/ {goal.goal} XP</span>
              </span>
            </ProgressRing>
            <div className="grid gap-2 text-sm">
              <span className="inline-flex items-center gap-2 text-fg"><Flame className={cn('size-4', streak.activeToday ? 'text-warning' : 'text-subtle')} aria-hidden="true" /><span className="tabular-nums font-medium">{streak.current}</span> күн қатарынан</span>
              <span className="inline-flex items-center gap-2 text-muted"><Target className="size-4 text-subtle" aria-hidden="true" />Рекорд: <span className="tabular-nums">{streak.best}</span> күн</span>
            </div>
          </div>
          {!streak.activeToday && hydrated && <p className="mt-auto pt-5 text-xs text-muted">Бүгін бір тапсырма орында — streak сақталады.</p>}
        </Card>
      </div>

      <section aria-labelledby="stats-title">
        <h2 id="stats-title" className="sr-only">Қысқаша статистика</h2>
        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat icon={<Zap className="size-4" />} label={`Деңгей ${level.level}`} value={`${state.xp} XP`} hint={`Келесіге ${level.toNext} XP`} />
          <Stat icon={<GraduationCap className="size-4" />} label="Сабақтар" value={`${state.done.length}/${lessons.length}`} hint="A0–A1 үлгі" />
          <Stat icon={<BookA className="size-4" />} label="Үйренген сөздер" value={String(state.knownWords.length)} hint="Карточкалар" />
          <Stat icon={<ClipboardCheck className="size-4" />} label="Емтихан" value={String(state.examHistory.length)} hint={state.examHistory.length ? `Соңғысы ${state.examHistory.at(-1)!.score}/${state.examHistory.at(-1)!.total}` : 'Әлі тапсырылмаған'} />
        </dl>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-6">
          <CardHeader title="Бүгінгі кесте" icon={<CalendarDays className="size-4" />} action={<Link href="/settings" className="text-[13px] font-medium text-primary hover:underline">Өзгерту</Link>} />
          <ol className="mt-5 grid gap-1">
            <ScheduleRow icon={<Sunrise className="size-4" />} time={state.morning} title="Сөздік + қысқа қайталау" />
            <ScheduleRow time="09:00–19:00" title="Бос емессің" muted />
            <ScheduleRow icon={<Moon className="size-4" />} time={state.evening} title="Негізгі сабақ + жаттығу" />
            <ScheduleRow icon={<ClipboardCheck className="size-4" />} time="Жексенбі" title={isSunday ? 'Бүгін — апталық емтихан' : 'Апталық емтихан'} highlight={isSunday} />
          </ol>
        </Card>

        <Card className="flex flex-col p-6">
          <div className="flex items-start justify-between gap-3">
            <MiraAvatar size={44} />
            <DemoBadge />
          </div>
          <h2 className="mt-4 text-[15px] font-semibold text-fg">Mira — оқу көмекшің</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">Грамматиканы қазақша, қытайша немесе ағылшынша түсіндіреді. Қазір алдын ала жазылған демо жауаптармен жұмыс істейді.</p>
          <div className="mt-auto pt-5">
            <ButtonLink href="/teacher" variant="secondary" iconRight={<ArrowRight className="size-4" aria-hidden="true" />}>Mira-мен сөйлесу</ButtonLink>
          </div>
        </Card>

        <Card className="p-6">
          <CardHeader title="Жылдам практика" description="Әрқайсысы күніне бір рет XP береді." />
          <ul className="mt-4 grid gap-1">
            {PRACTICE.map(p => {
              const done = hydrated && state.rewards.daily[p.key].includes(day);
              const Icon = p.icon;
              return (
                <li key={p.key}>
                  <Link href={p.href} className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-surface-muted">
                    <span className="grid size-9 place-items-center rounded-lg bg-surface-muted text-muted group-hover:bg-surface" aria-hidden="true"><Icon className="size-4" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-fg">{p.title}</span>
                      <span className="block truncate text-xs text-muted">{p.desc}</span>
                    </span>
                    {done
                      ? <span className="inline-flex items-center gap-1 text-xs font-medium text-success"><Check className="size-3.5" aria-hidden="true" />Бүгін</span>
                      : <span className="text-xs tabular-nums text-subtle">+{DAILY_REWARDS[p.key]} XP</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, hint }: { icon: ReactNode; label: string; value: string; hint: string }) {
  return (
    <div className="rounded-card border border-border bg-surface p-4 shadow-soft sm:p-5">
      <dt className="flex items-center gap-2 text-[13px] text-muted"><span className="text-subtle" aria-hidden="true">{icon}</span>{label}</dt>
      <dd className="mt-2 text-xl font-semibold tabular-nums tracking-tight text-fg">{value}</dd>
      <dd className="mt-0.5 text-xs text-subtle">{hint}</dd>
    </div>
  );
}

function ScheduleRow({ icon, time, title, muted, highlight }: { icon?: ReactNode; time: string; title: string; muted?: boolean; highlight?: boolean }) {
  return (
    <li className={cn('flex items-center gap-3 rounded-lg px-2 py-2.5', highlight && 'bg-primary-soft')}>
      <span className={cn('w-[86px] shrink-0 text-[13px] font-medium tabular-nums', muted ? 'text-subtle' : 'text-fg')}>{time}</span>
      <span className={cn('flex min-w-0 items-center gap-2 text-sm', muted ? 'text-subtle' : 'text-muted')}>
        {icon && <span className="text-subtle" aria-hidden="true">{icon}</span>}
        <span className="truncate">{title}</span>
      </span>
    </li>
  );
}
