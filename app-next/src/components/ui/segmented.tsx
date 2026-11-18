'use client';
import { useId } from 'react';
import { cn } from '@/lib/cn';

export interface SegmentOption<T extends string> { value: T; label: string; lang?: string }

/** Accessible segmented control built on native radio inputs (arrow keys work). */
export function SegmentedControl<T extends string>({ label, options, value, onChange, size = 'md', className }: { label: string; options: SegmentOption<T>[]; value: T; onChange: (v: T) => void; size?: 'sm' | 'md'; className?: string }) {
  const name = useId();
  return (
    <fieldset className={cn('inline-flex rounded-lg border border-border bg-surface-muted p-0.5', className)}>
      <legend className="sr-only">{label}</legend>
      {options.map(o => (
        <label key={o.value} lang={o.lang} className={cn('relative rounded-md font-medium transition-colors duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring has-[:focus-visible]:outline-offset-1', size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-[13px]', value === o.value ? 'bg-surface text-fg shadow-soft' : 'text-muted hover:text-fg')}>
          <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} className="sr-only" />
          {o.label}
        </label>
      ))}
    </fieldset>
  );
}
