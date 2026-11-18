'use client';
import { ArrowRight, Check, Clock, Lock } from 'lucide-react';
import Link from 'next/link';
import { lessons, upcomingLevels } from '@/content/lessons';
import type { CefrLevel, Lesson } from '@/content/types';
import { isLessonUnlocked } from '@/lib/actions';
import { cn } from '@/lib/cn';
import { SKILL_LABELS } from '@/lib/labels';
import { useLearner } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress';

const LEVEL_TITLES: Record<CefrLevel, string> = {
  A0: 'Нөлден бастау',
  A1: 'Күнделікті өмір',
  A2: 'Саяхат және тәжірибе',
  B1: 'Пікір және жұмыс',
  B2: 'Академиялық деңгей'
};

export function Roadmap() {
  const state = useLearner();
  const groups = (['A0', 'A1'] as const).map(level => ({ level, items: lessons.map((l, i) => ({ lesson: l, index: i })).filter(x => x.lesson.level === level) }));

  return (
    <ol className="grid grid-cols-1 gap-10">
      {groups.map(({ level, items }) => {
        const done = items.filter(x => state.done.includes(x.lesson.id)).length;
        return (
          <li key={level} aria-labelledby={`level-${level}`}>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-sm font-semibold text-primary-soft-fg">{level}</span>
                <div>
                  <h2 id={`level-${level}`} className="text-base font-semibold tracking-tight text-fg">{LEVEL_TITLES[level]}</h2>
                  <p className="text-sm text-muted">{done} / {items.length} сабақ аяқталды</p>
                </div>
              </div>
              <ProgressBar value={done / items.length} label={`${level} деңгейінің прогресі`} className="w-full sm:w-48" />
            </div>
            <ul className="overflow-hidden rounded-card border border-border bg-surface shadow-card">
              {items.map(({ lesson, index }) => (
                <LessonRow key={lesson.id} lesson={lesson} done={state.done.includes(lesson.id)} unlocked={isLessonUnlocked(lessons, index, state.done)} />
              ))}
            </ul>
          </li>
        );
      })}

      {upcomingLevels.map(u => (
        <li key={u.level} aria-labelledby={`level-${u.level}`}>
          <div className="flex flex-wrap items-center gap-3 rounded-card border border-dashed border-border-strong px-5 py-4">
            <span className="grid size-10 place-items-center rounded-xl bg-surface-muted text-sm font-semibold text-subtle">{u.level}</span>
            <div className="min-w-0 flex-1">
              <h2 id={`level-${u.level}`} className="text-[15px] font-semibold text-fg">{LEVEL_TITLES[u.level]}</h2>
              <p className="mt-0.5 truncate text-sm text-muted">{u.topics.join(' · ')}</p>
            </div>
            <Badge icon={<Lock className="size-3" aria-hidden="true" />}>Дайындалуда</Badge>
          </div>
        </li>
      ))}
    </ol>
  );
}

function LessonRow({ lesson, done, unlocked }: { lesson: Lesson; done: boolean; unlocked: boolean }) {
  const status = done ? 'аяқталды' : unlocked ? 'ашық' : 'жабық: алдыңғы сабақты өт';
  const content = (
    <>
      <span className={cn('grid size-9 shrink-0 place-items-center rounded-full border text-xs font-semibold tabular-nums', done ? 'border-success/40 bg-success-soft text-success' : unlocked ? 'border-primary/40 bg-primary-soft text-primary-soft-fg' : 'border-border bg-surface-muted text-subtle')} aria-hidden="true">
        {done ? <Check className="size-4" /> : unlocked ? lesson.id.slice(-2) : <Lock className="size-3.5" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn('block truncate text-[15px] font-medium', unlocked ? 'text-fg' : 'text-muted')}>{lesson.title}<span className="sr-only"> — {status}</span></span>
        <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
          <span>{SKILL_LABELS[lesson.skill]}</span>
          <span className="inline-flex items-center gap-1"><Clock className="size-3.5" aria-hidden="true" />{lesson.minutes} мин</span>
          <span className="tabular-nums">{lesson.xp} XP</span>
        </span>
      </span>
      <span className="hidden sm:block">
        {done ? <Badge tone="success">Аяқталды</Badge> : unlocked ? <Badge tone="primary">Ашық</Badge> : <Badge>Жабық</Badge>}
      </span>
      {unlocked && <ArrowRight className="size-4 shrink-0 text-subtle transition-transform group-hover:translate-x-0.5" aria-hidden="true" />}
    </>
  );
  return (
    <li className="border-b border-border last:border-b-0">
      {unlocked ? (
        <Link href={`/learn/${lesson.id}`} className="group flex items-center gap-4 px-4 py-4 transition-colors hover:bg-surface-muted/60 sm:px-5" data-lesson={lesson.id}>
          {content}
        </Link>
      ) : (
        <div className="flex items-center gap-4 bg-surface-muted/30 px-4 py-4 sm:px-5" data-lesson={lesson.id}>
          {content}
        </div>
      )}
    </li>
  );
}
