'use client';
import { ArrowUp, Mic, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { ExplanationLanguage } from '@/content/types';
import { addMessages } from '@/lib/actions';
import { cn } from '@/lib/cn';
import { LANGUAGE_LABELS } from '@/lib/labels';
import { updateLearner, useHydrated, useLearner } from '@/lib/store';
import { DemoBadge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { SegmentedControl } from '@/components/ui/segmented';
import { demoReply, greetings, suggestions } from './demo-replies';
import { MiraAvatar, type MiraState } from './mira-avatar';

const LANG_OPTIONS = (['kk', 'zh', 'en'] as const).map(v => ({ value: v, label: LANGUAGE_LABELS[v].short, lang: v }));

export function MiraChat() {
  const state = useLearner();
  const hydrated = useHydrated();
  const [language, setLanguage] = useState<ExplanationLanguage | null>(null);
  const [input, setInput] = useState('');
  const [miraState, setMiraState] = useState<MiraState>('idle');
  const logRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const lang = language ?? state.language;

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [state.messages.length, miraState]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function send(text: string) {
    const message = text.trim().slice(0, 500);
    if (!message || miraState === 'thinking') return;
    updateLearner(s => addMessages(s, { role: 'user', text: message }));
    setInput('');
    setMiraState('thinking');
    // Short pause so the reply is readable as a reply; no network request is made.
    timer.current = window.setTimeout(() => {
      updateLearner(s => addMessages(s, { role: 'mira', text: demoReply(message, lang) }));
      setMiraState('idle');
    }, 450);
  }

  const onSubmit = (e: FormEvent) => { e.preventDefault(); send(input); };
  const messages = hydrated ? state.messages : [];

  return (
    <Card className="flex h-[min(680px,calc(100dvh-220px))] min-h-[460px] flex-col overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <MiraAvatar size={36} state={miraState} />
          <div>
            <p className="text-sm font-semibold text-fg">Mira</p>
            <p className="text-xs text-muted">{miraState === 'thinking' ? 'Жауап дайындап жатыр…' : 'Оқу көмекшісі · kk / 中文 / EN'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DemoBadge>Демо · нақты AI жоқ</DemoBadge>
          <SegmentedControl label="Mira жауап беретін тіл" size="sm" options={LANG_OPTIONS} value={lang} onChange={setLanguage} />
        </div>
      </div>

      <div ref={logRef} role="log" aria-live="polite" aria-label="Mira-мен хат алмасу" className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-5">
        <Bubble role="mira" lang={lang}>{greetings[lang]}</Bubble>
        {messages.map((m, i) => <Bubble key={i} role={m.role}>{m.text}</Bubble>)}
        {miraState === 'thinking' && (
          <div className="flex items-center gap-1.5 pl-11 text-subtle" aria-hidden="true">
            {[0, 1, 2].map(i => <span key={i} className="size-1.5 animate-pulse-soft rounded-full bg-current" style={{ animationDelay: `${i * 160}ms` }} />)}
          </div>
        )}
      </div>

      <div className="border-t border-border bg-surface-muted/50 px-4 py-3 sm:px-5">
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1" role="list" aria-label="Ұсынылған сұрақтар">
          {suggestions[lang].map(s => (
            <button key={s} role="listitem" type="button" lang={lang} onClick={() => send(s)} className="shrink-0 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-border-strong hover:text-fg">
              {s}
            </button>
          ))}
        </div>
        <form onSubmit={onSubmit} className="flex items-end gap-2">
          <label htmlFor="mira-input" className="sr-only">Mira-ға хабарлама</label>
          <textarea
            id="mira-input"
            rows={1}
            maxLength={500}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(input); } }}
            placeholder="Сәлем! · Hello! · 你好!"
            className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border border-input bg-surface px-3.5 py-2.5 text-sm text-fg placeholder:text-subtle focus:border-primary focus:outline-none focus-visible:outline-2 focus-visible:outline-ring"
          />
          <button type="button" disabled title="Дауыспен сөйлесу кейінгі кезеңде қосылады" aria-label="Дауыспен сөйлесу (жақында)" className="grid size-11 place-items-center rounded-xl border border-border bg-surface text-subtle">
            <Mic className="size-[18px]" aria-hidden="true" />
          </button>
          <button type="submit" disabled={!input.trim() || miraState === 'thinking'} aria-label="Жіберу" className="grid size-11 place-items-center rounded-xl bg-primary text-primary-fg transition-colors hover:bg-primary-hover disabled:opacity-40">
            <ArrowUp className="size-[18px]" aria-hidden="true" />
          </button>
        </form>
        <div className="mt-2 flex items-center justify-between gap-3 text-xs text-subtle">
          <p>Хабарламалар тек осы браузерде сақталады. Дауыс режимі — кейінгі кезеңде.</p>
          {messages.length > 0 && (
            <button type="button" onClick={() => updateLearner(s => ({ ...s, messages: [] }))} className="inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-muted hover:text-fg">
              <RotateCcw className="size-3.5" aria-hidden="true" />Тазалау
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}

function Bubble({ role, lang, children }: { role: 'user' | 'mira'; lang?: string; children: string }) {
  const mine = role === 'user';
  return (
    <div className={cn('flex animate-enter gap-3', mine && 'justify-end')}>
      {!mine && <MiraAvatar size={28} className="mt-0.5" />}
      <div lang={lang} data-role={role} className={cn('max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-relaxed', mine ? 'rounded-br-md bg-primary text-primary-fg' : 'rounded-tl-md border border-border bg-surface-muted text-fg')}>
        {children}
      </div>
    </div>
  );
}
