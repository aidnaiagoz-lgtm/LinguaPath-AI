'use client';
import { Moon, Sun } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import { cn } from '@/lib/cn';

export const THEME_KEY = 'lp-theme';
type Theme = 'light' | 'dark';

/** Inline script for <head>: applies the saved theme before first paint. Light is the default. */
export const themeScript = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

const listeners = new Set<() => void>();
const read = (): Theme => (document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
function subscribe(l: () => void) { listeners.add(l); return () => { listeners.delete(l); }; }

export function setTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem(THEME_KEY, theme); } catch { /* storage blocked: theme still applies for this visit */ }
  listeners.forEach(l => l());
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, read, () => 'light');
}

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useTheme();
  const dark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      aria-label={dark ? 'Жарық режимге ауысу' : 'Қараңғы режимге ауысу'}
      title={dark ? 'Жарық режим' : 'Қараңғы режим'}
      className={cn('grid size-9 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-muted hover:text-fg', className)}
    >
      {dark ? <Sun className="size-[18px]" aria-hidden="true" /> : <Moon className="size-[18px]" aria-hidden="true" />}
    </button>
  );
}
