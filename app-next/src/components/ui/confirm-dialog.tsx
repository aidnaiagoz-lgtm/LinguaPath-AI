'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { Button } from './button';

/** Native <dialog> confirmation: focus trap, Escape and backdrop come for free. */
export function ConfirmDialog({ open, title, description, confirmLabel, onConfirm, onClose, danger }: { open: boolean; title: string; description: ReactNode; confirmLabel: string; onConfirm: () => void; onClose: () => void; danger?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog ref={ref} onClose={onClose} aria-labelledby="confirm-title" className="m-auto w-[min(92vw,420px)] rounded-2xl border border-border bg-surface p-0 text-fg shadow-float">
      <div className="p-6">
        <h2 id="confirm-title" className="text-base font-semibold">{title}</h2>
        <div className="mt-2 text-sm leading-relaxed text-muted">{description}</div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} autoFocus>Бас тарту</Button>
          <Button onClick={() => { onConfirm(); onClose(); }} className={danger ? 'bg-danger text-white hover:bg-danger/90 dark:text-brand-navy' : undefined}>{confirmLabel}</Button>
        </div>
      </div>
    </dialog>
  );
}
