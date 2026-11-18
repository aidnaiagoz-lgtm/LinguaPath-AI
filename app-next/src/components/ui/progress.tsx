import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

const clamp = (v: number) => Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0));

export function ProgressBar({ value, label, className, tone = 'primary' }: { value: number; label: string; className?: string; tone?: 'primary' | 'accent' | 'success' }) {
  const pct = Math.round(clamp(value) * 100);
  const fill = tone === 'accent' ? 'bg-accent' : tone === 'success' ? 'bg-success' : 'bg-primary';
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} className={cn('h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken', className)}>
      <div className={cn('h-full rounded-full transition-[width] duration-500 ease-out', fill)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function ProgressRing({ value, size = 64, stroke = 6, label, children }: { value: number; size?: number; stroke?: number; label: string; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.round(clamp(value) * 100);
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-surface-sunken" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round" className="stroke-primary transition-[stroke-dashoffset] duration-700 ease-out" strokeDasharray={c} strokeDashoffset={c * (1 - clamp(value))} />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}
