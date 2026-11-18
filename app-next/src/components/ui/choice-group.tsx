'use client';
import { Check, X } from 'lucide-react';
import { useId } from 'react';
import { cn } from '@/lib/cn';

/**
 * A question with single-choice answers, built on native radio inputs inside a
 * fieldset/legend: screen readers announce it as a group and arrow keys work.
 * After `reveal`, correct/incorrect states are shown with icon + text, not colour alone.
 */
export function ChoiceGroup({ index, question, answers, value, onChange, disabled, reveal, correct, lang, testId }: {
  index: number;
  question: string;
  answers: string[];
  value: number | undefined;
  onChange: (answer: number) => void;
  disabled?: boolean;
  reveal?: boolean;
  correct?: number;
  lang?: string;
  testId?: string;
}) {
  const name = useId();
  return (
    <fieldset className="rounded-xl border border-border bg-surface p-4 sm:p-5" data-testid={testId}>
      <legend className="float-left mb-3 w-full text-[15px] font-medium leading-snug text-fg">
        <span className="mr-2 text-subtle tabular-nums">{index + 1}.</span>
        {question}
      </legend>
      <div className="clear-both grid gap-2">
        {answers.map((answer, j) => {
          const selected = value === j;
          const isCorrect = reveal && correct === j;
          const isWrong = reveal && selected && correct !== j;
          return (
            <label key={j} className={cn(
              'flex min-h-11 items-center gap-3 rounded-lg border px-3.5 py-2.5 text-sm transition-colors duration-150',
              'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring',
              disabled ? 'cursor-default' : 'hover:border-border-strong hover:bg-surface-muted',
              isCorrect ? 'border-success/50 bg-success-soft' : isWrong ? 'border-danger/50 bg-danger-soft' : selected ? 'border-primary bg-primary-soft' : 'border-border bg-surface'
            )}>
              <input type="radio" name={name} value={j} checked={selected} disabled={disabled} onChange={() => onChange(j)} className="peer sr-only" />
              <span aria-hidden="true" className={cn('grid size-4 shrink-0 place-items-center rounded-full border transition-colors', selected ? 'border-primary bg-primary' : 'border-input bg-surface')}>
                {selected && <span className="size-1.5 rounded-full bg-primary-fg" />}
              </span>
              <span lang={lang} className="flex-1 text-fg">{answer}</span>
              {isCorrect && <span className="inline-flex items-center gap-1 text-xs font-medium text-success"><Check className="size-3.5" aria-hidden="true" />Дұрыс жауап</span>}
              {isWrong && <span className="inline-flex items-center gap-1 text-xs font-medium text-danger"><X className="size-3.5" aria-hidden="true" />Сенің жауабың</span>}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
