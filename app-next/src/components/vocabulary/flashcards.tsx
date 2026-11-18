'use client';
import { Eye, RotateCcw, Volume2 } from 'lucide-react';
import { useState } from 'react';
import { words } from '@/content/practice';
import { claimDaily, markWord, recordSkill } from '@/lib/actions';
import { today, updateLearner, useLearner } from '@/lib/store';
import { useSpeak } from '@/lib/use-speech';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress';
import { useToast } from '@/components/ui/toast';

export function Flashcards() {
  const state = useLearner();
  const toast = useToast();
  const { supported, speak } = useSpeak();
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [knownInSession, setKnownInSession] = useState(0);
  const finished = index >= words.length;
  const word = words[Math.min(index, words.length - 1)];

  function answer(known: boolean) {
    updateLearner(s => recordSkill(markWord(s, word.en, known), 'Vocabulary', known ? 1 : 0, 1));
    if (known) setKnownInSession(k => k + 1);
    setRevealed(false);
    const next = index + 1;
    setIndex(next);
    if (next >= words.length) {
      let xp = 0;
      updateLearner(s => { const r = claimDaily(s, 'flashcards', today()); xp = r.xp; return r.state; });
      toast(xp ? `Карточкалар аяқталды · +${xp} XP` : 'Карточкалар аяқталды');
    }
  }

  function restart() { setIndex(0); setRevealed(false); setKnownInSession(0); }

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-fg">Карточкалар</h2>
          <p className="mt-1 text-sm text-muted">Сөзді есіңе түсір, содан кейін аудармасын аш. Үйренген сөздер: <span className="font-medium tabular-nums text-fg">{state.knownWords.length}</span></p>
        </div>
        <span className="text-sm text-muted tabular-nums">{Math.min(index + 1, words.length)}/{words.length}</span>
      </div>
      <ProgressBar value={index / words.length} label="Карточкалар прогресі" className="mt-4" tone="accent" />

      {finished ? (
        <div className="mt-6 rounded-xl border border-border bg-surface-muted/60 p-6 text-center" role="status">
          <p className="text-base font-semibold text-fg">Сессия аяқталды</p>
          <p className="mt-1 text-sm text-muted">{knownInSession}/{words.length} сөзді білдің. Қайталауға қалғандары келесі жолы алдымен шығады.</p>
          <Button variant="secondary" className="mt-4" onClick={restart} icon={<RotateCcw className="size-4" aria-hidden="true" />}>Қайтадан</Button>
        </div>
      ) : (
        <div className="mt-6">
          <div className="grid min-h-48 place-items-center rounded-xl border border-border bg-surface-muted/50 px-6 py-8 text-center">
            <div>
              <p lang="en" className="text-3xl font-semibold tracking-tight text-fg">{word.en}</p>
              {revealed ? (
                <p className="mt-3 animate-enter text-base text-muted">
                  <span lang="kk">{word.kk}</span><span className="mx-2 text-border-strong">·</span><span lang="zh">{word.zh}</span>
                </p>
              ) : (
                <p className="mt-3 text-sm text-subtle">Аудармасын ойша айт</p>
              )}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap justify-between gap-2">
            {supported ? <Button variant="ghost" size="sm" onClick={() => speak(word.en)} icon={<Volume2 className="size-4" aria-hidden="true" />}>Айтылуы</Button> : <span />}
            {revealed ? (
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => answer(false)}>Қайталау керек</Button>
                <Button onClick={() => answer(true)}>Білемін</Button>
              </div>
            ) : (
              <Button onClick={() => setRevealed(true)} icon={<Eye className="size-4" aria-hidden="true" />}>Аудармасын көрсету</Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
