'use client';
import type { Skill } from '@/content/types';
import { cn } from '@/lib/cn';
import { skillAccuracy } from '@/lib/gamification';
import { SKILL_LABELS } from '@/lib/labels';
import { addDays, isoWeekday, lastDays, SKILLS, type SkillStat } from '@/lib/logic';

const WEEKDAYS = ['Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сн', 'Жс'];

/** 12-week activity grid (Mon–Sun rows). Active days use the primary colour + count summary for screen readers. */
export function ActivityHeatmap({ activity, today, weeks = 12 }: { activity: readonly string[]; today: string; weeks?: number }) {
  const set = new Set(activity);
  // Align so the last column ends with the current week (Sunday).
  const end = addDays(today, 7 - isoWeekday(today));
  const days = lastDays(end, weeks * 7);
  const active = days.filter(d => d <= today && set.has(d)).length;
  const columns = Array.from({ length: weeks }, (_, w) => days.slice(w * 7, w * 7 + 7));

  return (
    <figure>
      <div className="flex gap-2" role="img" aria-label={`Соңғы ${weeks} аптада ${active} белсенді күн`}>
        <div className="grid grid-rows-7 gap-1 pr-1 text-[10px] leading-none text-subtle" aria-hidden="true">
          {WEEKDAYS.map((d, i) => <span key={d} className={cn('flex h-3.5 items-center', i % 2 === 1 && 'invisible')}>{d}</span>)}
        </div>
        <div className="grid flex-1 grid-flow-col grid-cols-[repeat(12,minmax(0,1fr))] gap-1" aria-hidden="true">
          {columns.map((col, w) => (
            <div key={w} className="grid grid-rows-7 gap-1">
              {col.map(day => (
                <span
                  key={day}
                  title={day}
                  data-day={day}
                  data-active={set.has(day) || undefined}
                  className={cn('h-3.5 rounded-[3px]', day > today ? 'bg-transparent' : set.has(day) ? 'bg-primary' : 'bg-surface-sunken', day === today && 'ring-1 ring-fg/40 ring-offset-1 ring-offset-surface')}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <figcaption className="mt-3 flex items-center justify-between text-xs text-muted">
        <span><span className="font-medium tabular-nums text-fg">{active}</span> белсенді күн · Қазақстан уақыты</span>
        <span className="flex items-center gap-1.5" aria-hidden="true"><span className="size-2.5 rounded-[3px] bg-surface-sunken" />жоқ<span className="ml-2 size-2.5 rounded-[3px] bg-primary" />бар</span>
      </figcaption>
    </figure>
  );
}

const SHORT_DAY = ['Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сн', 'Жс'];

export function WeeklyXpChart({ data, goal }: { data: { day: string; xp: number }[]; goal: number }) {
  const max = Math.max(goal, ...data.map(d => d.xp), 1);
  const total = data.reduce((s, d) => s + d.xp, 0);
  return (
    <figure>
      <div className="relative flex h-36 items-end gap-2 sm:gap-3" role="img" aria-label={`Соңғы 7 күнде ${total} XP`}>
        <div className="pointer-events-none absolute inset-x-0 border-t border-dashed border-border-strong" style={{ bottom: `${(goal / max) * 100}%` }} aria-hidden="true" />
        {data.map(d => (
          <div key={d.day} className="flex h-full flex-1 flex-col justify-end" aria-hidden="true">
            <div className={cn('w-full rounded-t-md transition-[height] duration-500', d.xp >= goal ? 'bg-primary' : 'bg-primary/35')} style={{ height: `${Math.max(d.xp ? 6 : 2, (d.xp / max) * 100)}%` }} title={`${d.day}: ${d.xp} XP`} />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2 sm:gap-3" aria-hidden="true">
        {data.map(d => <span key={d.day} className="flex-1 text-center text-[11px] text-subtle">{SHORT_DAY[isoWeekday(d.day) - 1]}</span>)}
      </div>
      <figcaption className="mt-3 text-xs text-muted">Пунктир — күндік мақсат ({goal} XP). Аптада барлығы <span className="font-medium tabular-nums text-fg">{total} XP</span>.</figcaption>
    </figure>
  );
}

export function SkillBreakdown({ skills }: { skills: Record<Skill, SkillStat> }) {
  return (
    <ul className="grid gap-4">
      {SKILLS.map(skill => {
        const stat = skills[skill];
        const acc = skillAccuracy(stat);
        return (
          <li key={skill}>
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-fg">{SKILL_LABELS[skill]}</span>
              <span className="tabular-nums text-muted">{acc === null ? 'дерек жоқ' : `${Math.round(acc * 100)}% · ${stat.total} жауап`}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-sunken" role="progressbar" aria-label={`${SKILL_LABELS[skill]} дәлдігі`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={acc === null ? 0 : Math.round(acc * 100)}>
              <div className={cn('h-full rounded-full', acc === null ? 'bg-transparent' : acc >= 0.8 ? 'bg-success' : acc >= 0.6 ? 'bg-primary' : 'bg-warning')} style={{ width: `${Math.round((acc ?? 0) * 100)}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
