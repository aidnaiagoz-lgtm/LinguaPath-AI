'use client';
import { Download, Trash2 } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';
import type { ExplanationLanguage } from '@/content/types';
import { updateSettings } from '@/lib/actions';
import { cn } from '@/lib/cn';
import { LANGUAGE_LABELS } from '@/lib/labels';
import { DAILY_GOALS } from '@/lib/logic';
import { exportLearnerData, resetLearner, updateLearner, useHydrated, useLearner } from '@/lib/store';
import { setTheme, useTheme } from '@/components/layout/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { SegmentedControl } from '@/components/ui/segmented';
import { useToast } from '@/components/ui/toast';

const LANG_OPTIONS = (['kk', 'zh', 'en'] as const).map(v => ({ value: v, label: LANGUAGE_LABELS[v].name, lang: v }));

export function SettingsForm() {
  const hydrated = useHydrated();
  // Inputs start from stored values, so render them only once those are available
  // (avoids a remount that could discard what the learner already typed).
  if (!hydrated) return <div className="h-[520px] max-w-3xl animate-pulse rounded-card bg-surface-muted" aria-hidden="true" />;
  return <SettingsFields />;
}

function SettingsFields() {
  const state = useLearner();
  const theme = useTheme();
  const toast = useToast();
  const [language, setLanguage] = useState<ExplanationLanguage>(state.language);
  const [morning, setMorning] = useState(state.morning);
  const [evening, setEvening] = useState(state.evening);
  const [dailyGoal, setDailyGoal] = useState(state.dailyGoal);
  const [invalid, setInvalid] = useState<'morning' | 'evening' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    let check: ReturnType<typeof updateSettings>['check'] = { ok: true };
    updateLearner(s => { const r = updateSettings(s, { morning, evening, language, dailyGoal }); check = r.check; return r.state; });
    const c = check as ReturnType<typeof updateSettings>['check'];
    if (!c.ok) {
      setInvalid(c.field);
      setError(c.error);
      document.getElementById(c.field === 'morning' ? 'morning' : 'evening')?.focus();
      return;
    }
    setInvalid(null);
    setError(null);
    toast('Баптаулар сақталды');
  }

  function download() {
    const blob = new Blob([exportLearnerData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'linguapath-progress.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  const inputClass = (field: 'morning' | 'evening') => cn(
    'h-10 w-36 rounded-lg border bg-surface px-3 text-sm tabular-nums text-fg focus:border-primary focus:outline-none focus-visible:outline-2 focus-visible:outline-ring',
    invalid === field ? 'border-danger' : 'border-input'
  );

  return (
    <div className="grid max-w-3xl gap-6">
      <form onSubmit={onSubmit} noValidate>
        <Card className="divide-y divide-border">
          <div className="p-6"><CardHeader title="Оқу баптаулары" description="Түсіндірме тілі, кесте және күндік мақсат." /></div>

          <Row title="Түсіндірме тілі" description="Сабақтар мен Mira осы тілде түсіндіреді.">
            <SegmentedControl label="Түсіндірме тілі" options={LANG_OPTIONS} value={language} onChange={setLanguage} />
          </Row>

          <Row title={<label htmlFor="morning">Таңғы қайталау</label>} description={<span id="morning-hint">09:00-ге дейін</span>}>
            <input id="morning" type="time" required value={morning} onChange={e => setMorning(e.target.value)} aria-describedby={invalid === 'morning' ? 'morning-hint settings-error' : 'morning-hint'} aria-invalid={invalid === 'morning' || undefined} className={inputClass('morning')} />
          </Row>

          <Row title={<label htmlFor="evening">Кешкі сабақ</label>} description={<span id="evening-hint">19:00-ден кейін</span>}>
            <input id="evening" type="time" required value={evening} onChange={e => setEvening(e.target.value)} aria-describedby={invalid === 'evening' ? 'evening-hint settings-error' : 'evening-hint'} aria-invalid={invalid === 'evening' || undefined} className={inputClass('evening')} />
          </Row>

          <Row title="Күндік мақсат" description="Күн сайын жинайтын XP.">
            <SegmentedControl label="Күндік мақсат (XP)" options={DAILY_GOALS.map(g => ({ value: String(g), label: `${g} XP` }))} value={String(dailyGoal)} onChange={v => setDailyGoal(Number(v))} />
          </Row>

          <div className="flex flex-wrap items-center justify-between gap-3 p-6">
            <p id="settings-error" role="alert" className="text-sm text-danger">{error}</p>
            <Button type="submit">Сақтау</Button>
          </div>
        </Card>
      </form>

      <Card className="divide-y divide-border">
        <div className="p-6"><CardHeader title="Көрініс" /></div>
        <Row title="Тақырып" description="Жарық режим ұзақ оқуға ыңғайлы. Қараңғы режим — жұмсақ көк-сұр.">
          <SegmentedControl label="Тақырып" options={[{ value: 'light', label: 'Жарық' }, { value: 'dark', label: 'Қараңғы' }]} value={theme} onChange={v => setTheme(v)} />
        </Row>
      </Card>

      <Card className="divide-y divide-border">
        <div className="p-6"><CardHeader title="Деректер және құпиялылық" description="Прогресс тек осы браузерде (localStorage) сақталады. Ешқандай серверге жіберілмейді." /></div>
        <Row title="Деректерді экспорттау" description="Барлық прогресті JSON файлы ретінде жүктеп ал.">
          <Button variant="secondary" onClick={download} icon={<Download className="size-4" aria-hidden="true" />}>Экспорт</Button>
        </Row>
        <Row title="Прогресті өшіру" description="Сабақтар, XP, чат және тест нәтижелері өшіріледі.">
          <Button variant="secondary" className="text-danger" onClick={() => setConfirmReset(true)} icon={<Trash2 className="size-4" aria-hidden="true" />}>Өшіру</Button>
        </Row>
      </Card>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Барлық прогресс өшірілсін бе?"
        description="Бұл әрекетті қайтару мүмкін емес. Алдымен деректерді экспорттауды ұсынамыз."
        confirmLabel="Иә, өшіру"
        danger
        onConfirm={() => { resetLearner(); toast('Прогресс өшірілді', 'info'); }}
      />
    </div>
  );
}

function Row({ title, description, children }: { title: ReactNode; description?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="text-sm font-medium text-fg">{title}</div>
        {description && <div className="mt-0.5 text-sm text-muted">{description}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
