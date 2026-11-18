'use client';
import { Eye, Headphones, Play, RotateCcw, Turtle } from 'lucide-react';
import { useState } from 'react';
import { listening } from '@/content/practice';
import type { ExplanationLanguage } from '@/content/types';
import { claimDaily, recordSkill } from '@/lib/actions';
import { today, updateLearner, useHydrated, useLearner } from '@/lib/store';
import { useSpeak } from '@/lib/use-speech';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChoiceGroup } from '@/components/ui/choice-group';
import { ProgressBar } from '@/components/ui/progress';
import { useToast } from '@/components/ui/toast';

export function ListeningPractice() {
  const state = useLearner();
  const hydrated = useHydrated();
  const toast = useToast();
  const { supported, speaking, speak } = useSpeak();
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<number | undefined>();
  const [checked, setChecked] = useState(false);
  const [showText, setShowText] = useState(false);
  const [score, setScore] = useState(0);
  const lang: ExplanationLanguage = state.language;
  const item = listening[Math.min(index, listening.length - 1)];
  const finished = index >= listening.length;

  function check() {
    if (answer === undefined) return;
    const ok = answer === item.correct;
    if (ok) setScore(s => s + 1);
    setChecked(true);
    updateLearner(s => recordSkill(s, 'Listening', ok ? 1 : 0, 1));
  }

  function next() {
    const n = index + 1;
    setIndex(n);
    setAnswer(undefined);
    setChecked(false);
    setShowText(false);
    if (n >= listening.length) {
      let xp = 0;
      updateLearner(s => { const r = claimDaily(s, 'listening', today()); xp = r.xp; return r.state; });
      toast(xp ? `Тыңдалым аяқталды · +${xp} XP` : 'Тыңдалым аяқталды');
    }
  }

  function restart() { setIndex(0); setScore(0); setAnswer(undefined); setChecked(false); setShowText(false); }

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg bg-accent-soft text-accent-soft-fg" aria-hidden="true"><Headphones className="size-[18px]" /></span>
          <div>
            <h2 className="text-base font-semibold text-fg">Тыңдап, түсін</h2>
            <p className="text-sm text-muted">Қысқа сөйлемдер · A0–A1</p>
          </div>
        </div>
        <span className="text-sm text-muted tabular-nums">{Math.min(index + 1, listening.length)}/{listening.length}</span>
      </div>
      <ProgressBar value={index / listening.length} label="Тыңдалым прогресі" className="mt-4" tone="accent" />

      {hydrated && !supported && (
        <p className="mt-5 rounded-lg bg-warning-soft px-4 py-3 text-sm text-warning" role="note">
          Бұл браузер мәтінді дауыстап оқуды (Web Speech API) қолдамайды. Мәтінді ашып, оқылым жаттығуы ретінде орындауға болады.
        </p>
      )}

      {finished ? (
        <div className="mt-6 rounded-xl border border-border bg-surface-muted/60 p-6 text-center" role="status">
          <p className="text-base font-semibold text-fg">{score}/{listening.length} дұрыс</p>
          <p className="mt-1 text-sm text-muted">Жақсы жұмыс. Ертең жаңа XP-мен қайталауға болады.</p>
          <Button variant="secondary" className="mt-4" onClick={restart} icon={<RotateCcw className="size-4" aria-hidden="true" />}>Қайтадан</Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => speak(item.audioText)} disabled={!supported} icon={<Play className="size-4" aria-hidden="true" />}>{speaking ? 'Ойнап жатыр…' : 'Тыңдау'}</Button>
            <Button variant="secondary" onClick={() => speak(item.audioText, 0.7)} disabled={!supported} icon={<Turtle className="size-4" aria-hidden="true" />}>Баяу</Button>
            <Button variant="ghost" onClick={() => setShowText(v => !v)} icon={<Eye className="size-4" aria-hidden="true" />} aria-expanded={showText}>{showText ? 'Мәтінді жасыру' : 'Мәтінді көрсету'}</Button>
          </div>
          {(showText || checked) && (
            <div className="rounded-lg border border-border bg-surface-muted/50 px-4 py-3">
              <p lang="en" className="font-medium text-fg">{item.audioText}</p>
              <p lang={lang} className="mt-1 text-sm text-muted">{item.translation[lang]}</p>
            </div>
          )}
          <ChoiceGroup key={item.id} index={index} question={item.prompt} answers={item.answers} value={answer} onChange={setAnswer} disabled={checked} reveal={checked} correct={item.correct} testId="listening-question" />
          <div className="flex items-center gap-3">
            {checked ? <Button onClick={next}>{index + 1 < listening.length ? 'Келесі' : 'Аяқтау'}</Button> : <Button onClick={check} disabled={answer === undefined}>Тексеру</Button>}
            {checked && <Badge tone={answer === item.correct ? 'success' : 'warning'}>{answer === item.correct ? 'Дұрыс' : 'Қате'}</Badge>}
          </div>
        </div>
      )}
    </Card>
  );
}
