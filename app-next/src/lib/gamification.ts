/* Adult-friendly gamification: levels, streaks, daily goal and analytics helpers. */
import type { Skill } from '@/content/types';
import { addDays, lastDays, type LearnerState, type SkillStat, SKILLS } from './logic';

/** XP needed to *reach* a level: L1 = 0, L2 = 100, L3 = 250, L4 = 450, L5 = 700 … */
export function levelThreshold(level: number): number {
  if (level <= 1) return 0;
  const n = level - 1;
  return 100 * n + 25 * n * (n - 1);
}

export interface LevelInfo { level: number; current: number; needed: number; progress: number; toNext: number }

export function levelInfo(xp: number): LevelInfo {
  let level = 1;
  while (xp >= levelThreshold(level + 1)) level++;
  const start = levelThreshold(level);
  const needed = levelThreshold(level + 1) - start;
  const current = xp - start;
  return { level, current, needed, progress: current / needed, toNext: needed - current };
}

export interface StreakInfo { current: number; best: number; activeToday: boolean }

/** Consecutive active days. A streak survives until the end of the next day. */
export function streakInfo(activity: readonly string[], today: string): StreakInfo {
  const days = new Set(activity);
  const activeToday = days.has(today);
  let cursor = activeToday ? today : addDays(today, -1);
  let current = 0;
  while (days.has(cursor)) { current++; cursor = addDays(cursor, -1); }

  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const day of [...days].sort()) {
    run = prev && addDays(prev, 1) === day ? run + 1 : 1;
    best = Math.max(best, run);
    prev = day;
  }
  return { current, best: Math.max(best, current), activeToday };
}

export function xpOn(state: LearnerState, day: string): number {
  return state.xpLog.filter(e => e.date === day).reduce((sum, e) => sum + e.amount, 0);
}

export function dailyGoalProgress(state: LearnerState, today: string) {
  const earned = xpOn(state, today);
  return { earned, goal: state.dailyGoal, progress: Math.min(1, earned / state.dailyGoal), reached: earned >= state.dailyGoal };
}

export function weeklyXp(state: LearnerState, today: string) {
  return lastDays(today, 7).map(day => ({ day, xp: xpOn(state, day) }));
}

export function skillAccuracy(stat: SkillStat): number | null {
  return stat.total ? stat.correct / stat.total : null;
}

/** Skills sorted weakest first (only skills with data). */
export function weakestSkills(skills: Record<Skill, SkillStat>, limit = 2): Skill[] {
  return SKILLS.filter(s => skills[s].total >= 3)
    .sort((a, b) => (skillAccuracy(skills[a]) ?? 1) - (skillAccuracy(skills[b]) ?? 1))
    .filter(s => (skillAccuracy(skills[s]) ?? 1) < 0.8)
    .slice(0, limit);
}
