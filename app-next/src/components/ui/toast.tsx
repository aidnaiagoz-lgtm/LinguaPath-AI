'use client';
import { CircleAlert, CircleCheck, Info } from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'success' | 'info' | 'error';
interface ToastItem { id: number; message: string; tone: Tone }
const ToastContext = createContext<(message: string, tone?: Tone) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const show = useCallback((message: string, tone: Tone = 'success') => {
    const id = nextId.current++;
    setItems(list => [...list.slice(-2), { id, message, tone }]);
    window.setTimeout(() => setItems(list => list.filter(t => t.id !== id)), 3200);
  }, []);

  useEffect(() => {
    const onStorageError = () => show('Прогресс браузерде сақталмады: localStorage қолжетімсіз.', 'error');
    window.addEventListener('lp:storage-error', onStorageError);
    return () => window.removeEventListener('lp:storage-error', onStorageError);
  }, [show]);

  const value = useMemo(() => show, [show]);
  const icons = { success: CircleCheck, info: Info, error: CircleAlert };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 lg:bottom-6 lg:items-end lg:pr-6">
        {items.map(t => {
          const Icon = icons[t.tone];
          return (
            <div key={t.id} data-testid="toast" className={cn('pointer-events-auto flex max-w-sm animate-enter items-center gap-2.5 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-fg shadow-float')}>
              <Icon className={cn('size-4 shrink-0', t.tone === 'success' ? 'text-success' : t.tone === 'error' ? 'text-danger' : 'text-primary')} aria-hidden="true" />
              {t.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
