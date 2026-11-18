import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'soft';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-colors duration-150 ' +
  'disabled:opacity-50 disabled:pointer-events-none select-none';

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-primary-fg hover:bg-primary-hover shadow-soft',
  secondary: 'bg-surface text-fg border border-border-strong hover:bg-surface-muted',
  ghost: 'text-muted hover:text-fg hover:bg-surface-muted',
  soft: 'bg-primary-soft text-primary-soft-fg hover:bg-primary-soft/70'
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-[15px]'
};

interface CommonProps { variant?: Variant; size?: Size; icon?: ReactNode; iconRight?: ReactNode; className?: string; children?: ReactNode }

export function buttonClass({ variant = 'primary', size = 'md', className }: Pick<CommonProps, 'variant' | 'size' | 'className'> = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({ variant, size, icon, iconRight, className, children, type = 'button', ...rest }: CommonProps & Omit<ComponentProps<'button'>, keyof CommonProps>) {
  return (
    <button type={type} className={buttonClass({ variant, size, className })} {...rest}>
      {icon}
      {children}
      {iconRight}
    </button>
  );
}

export function ButtonLink({ variant, size, icon, iconRight, className, children, ...rest }: CommonProps & Omit<ComponentProps<typeof Link>, keyof CommonProps>) {
  return (
    <Link className={buttonClass({ variant, size, className })} {...rest}>
      {icon}
      {children}
      {iconRight}
    </Link>
  );
}
