'use client';
import { Flame } from 'lucide-react';
import { levelInfo, streakInfo } from '@/lib/gamification';
import { today, useHydrated, useLearner } from '@/lib/store';
import { cn } from '@/lib/cn';

export function StreakChip({ className }: { className?: string }) {
  const state = useLearner();
  const hydrated = useHydrated();
  const streak = hydrated ? streakInfo(state.activity, today()) : { current: 0, activeToday: false };
  return (
    <span
      className={cn('inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 text-[13px] font-medium tabular-nums text-fg', className)}
      title="Күнделікті streak — қатарынан оқыған күндер"
      data-testid="streak-chip"
    >
      <Flame className={cn('size-4', streak.activeToday ? 'text-warning' : 'text-subtle')} aria-hidden="true" />
      <span className="sr-only">Streak:</span>
      {streak.current}
      <span className="sr-only">күн</span>
    </span>
  );
}

export function LevelSummary() {
  const state = useLearner();
  const info = levelInfo(state.xp);
  return (
    <div className="rounded-xl border border-border bg-surface-muted/60 p-3.5">
      <div className="flex items-baseline justify-between text-[13px]">
        <span className="font-medium text-fg">Деңгей {info.level}</span>
        <span className="tabular-nums text-subtle">{state.xp} XP</span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-sunken" aria-hidden="true">
        <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${Math.round(info.progress * 100)}%` }} />
      </div>
      <p className="mt-2 text-xs text-muted">Келесі деңгейге {info.toNext} XP</p>
    </div>
  );
}
