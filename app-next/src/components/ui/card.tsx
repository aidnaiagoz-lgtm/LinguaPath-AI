import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Card({ className, ...rest }: ComponentProps<'div'>) {
  return <div className={cn('rounded-card border border-border bg-surface shadow-card', className)} {...rest} />;
}

export function CardHeader({ title, description, action, icon, as: Heading = 'h2', id }: { title: ReactNode; description?: ReactNode; action?: ReactNode; icon?: ReactNode; as?: 'h2' | 'h3'; id?: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-start gap-3">
        {icon && <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-surface-muted text-muted" aria-hidden="true">{icon}</span>}
        <div className="min-w-0">
          <Heading id={id} className="text-[15px] font-semibold tracking-tight text-fg">{title}</Heading>
          {description && <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
