'use client';
import { Check, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { words } from '@/content/practice';
import { claimDaily, recordSkill } from '@/lib/actions';
import { cn } from '@/lib/cn';
import { shuffleDifferent } from '@/lib/logic';
import { today, updateLearner } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SegmentedControl } from '@/components/ui/segmented';
import { useToast } from '@/components/ui/toast';

type Target = 'kk' | 'zh';
const indices = words.map((_, i) => i);

export function WordMatch() {
  const toast = useToast();
  const [target, setTarget] = useState<Target>('kk');
  // Shuffled per round on the client only (randomness must not be baked into the
  // prerendered HTML). Until then a skeleton is shown.
  const [order, setOrder] = useState<number[] | null>(null);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time client-only randomisation
  useEffect(() => { setOrder(shuffleDifferent(indices)); }, []);
  const [selected, setSelected] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [reward, setReward] = useState<number | null>(null);
  const [wrongFlash, setWrongFlash] = useState<number | null>(null);
  const finished = matched.length === words.length;

  function reset() {
    setOrder(shuffleDifferent(indices));
    setSelected(null);
    setMatched([]);
    setMistakes(0);
    setReward(null);
  }

  function pickEnglish(i: number) {
    setSelected(i);
  }

  function pickTranslation(i: number) {
    if (selected === null) { toast('Алдымен ағылшын сөзін таңда.', 'info'); return; }
    if (selected === i) {
      const next = [...matched, i];
      setMatched(next);
      setSelected(null);
      if (next.length === words.length) {
        let xp = 0;
        updateLearner(s => {
          const r = claimDaily(recordSkill(s, 'Vocabulary', words.length, words.length + mistakes), 'match', today());
          xp = r.xp;
          return r.state;
        });
        setReward(xp);
        toast(xp ? `Барлық сөз сәйкес · +${xp} XP` : 'Барлық сөз сәйкес');
      }
    } else {
      setMistakes(m => m + 1);
      setWrongFlash(i);
      window.setTimeout(() => setWrongFlash(null), 500);
      toast('Сәйкес емес. Тағы байқап көр.', 'info');
    }
  }

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-fg">Сөз сәйкестендіру</h2>
          <p className="mt-1 text-sm text-muted">Ағылшын сөзін, содан кейін оның аудармасын таңда. XP күніне бір рет беріледі.</p>
        </div>
        <SegmentedControl
          label="Аударма тілі"
          size="sm"
          options={[{ value: 'kk', label: 'Қазақша', lang: 'kk' }, { value: 'zh', label: '中文', lang: 'zh' }]}
          value={target}
          onChange={v => { setTarget(v); reset(); }}
        />
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div role="group" aria-label="Ағылшын сөздері" className="grid grid-cols-2 gap-2">
          {words.map((w, i) => {
            const done = matched.includes(i);
            return (
              <button
                key={w.en}
                type="button"
                lang="en"
                disabled={done}
                aria-pressed={selected === i}
                data-side="en"
                data-index={i}
                onClick={() => pickEnglish(i)}
                className={cn('flex h-12 items-center justify-center gap-1.5 rounded-lg border text-sm font-medium transition-colors duration-150',
                  done ? 'border-transparent bg-success-soft text-success' : selected === i ? 'border-primary bg-primary-soft text-primary-soft-fg' : 'border-border bg-surface text-fg hover:border-border-strong hover:bg-surface-muted')}
              >
                {done && <Check className="size-3.5" aria-hidden="true" />}{w.en}
              </button>
            );
          })}
        </div>
        <div role="group" aria-label="Аудармалар" className="grid grid-cols-2 gap-2" data-testid="translations">
          {!order && indices.map(i => <span key={i} className="h-12 animate-pulse rounded-lg bg-surface-muted" aria-hidden="true" />)}
          {order?.map(i => {
            const done = matched.includes(i);
            return (
              <button
                key={`${target}-${i}`}
                type="button"
                lang={target}
                disabled={done}
                data-side="target"
                data-index={i}
                onClick={() => pickTranslation(i)}
                className={cn('flex h-12 items-center justify-center gap-1.5 rounded-lg border text-sm font-medium transition-colors duration-150',
                  done ? 'border-transparent bg-success-soft text-success' : wrongFlash === i ? 'border-danger bg-danger-soft text-danger' : 'border-border bg-surface text-fg hover:border-border-strong hover:bg-surface-muted')}
              >
                {done && <Check className="size-3.5" aria-hidden="true" />}{words[i][target]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <p className="text-sm text-muted tabular-nums" aria-live="polite" data-testid="match-count">
          {matched.length}/{words.length} сәйкес · {mistakes} қате
        </p>
        <Button variant="secondary" size="sm" onClick={reset} icon={<RotateCcw className="size-3.5" aria-hidden="true" />}>Жаңа раунд</Button>
      </div>
      {finished && (
        <p className="mt-4 rounded-lg bg-success-soft px-4 py-3 text-sm text-success" role="status" data-testid="match-result">
          {reward ? `Тамаша! Барлық сөз сәйкес келді · +${reward} XP` : 'Барлық сөз сәйкес келді. Бүгінгі XP бұрын алынған — ертең тағы жинай аласың.'}
        </p>
      )}
    </Card>
  );
}
