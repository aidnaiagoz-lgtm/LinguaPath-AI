'use client';
import { TriangleAlert } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

export default function ErrorBoundary({ error, retry }: { error: unknown; retry: () => void }) {
  const digest = error instanceof Error && 'digest' in error ? String((error as Error & { digest?: string }).digest ?? '') : '';
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <EmptyState
        icon={<TriangleAlert className="size-5" />}
        title="Бірдеңе дұрыс болмады"
        description={<>Бұл бөлімді көрсету кезінде қате шықты. Прогресің сақтаулы.{digest && <span className="mt-2 block text-xs text-subtle">Код: {digest}</span>}</>}
        action={<div className="flex gap-2"><Button onClick={() => retry()}>Қайталау</Button><ButtonLink href="/dashboard" variant="secondary">Басты бет</ButtonLink></div>}
      />
    </div>
  );
}
