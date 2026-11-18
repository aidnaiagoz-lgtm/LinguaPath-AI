'use client';
import { Mic, Pause, Play, RotateCcw, Square, Volume2 } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { speaking } from '@/content/practice';
import { claimDaily, recordSkill } from '@/lib/actions';
import { today, updateLearner, useLearner } from '@/lib/store';
import { useSpeak } from '@/lib/use-speech';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress';
import { useToast } from '@/components/ui/toast';

type RecState = 'idle' | 'recording' | 'recorded' | 'denied' | 'unsupported';

/**
 * Shadowing practice: listen → repeat aloud → (optionally) record yourself and compare.
 * Recordings stay in memory in this tab only: never uploaded, never stored.
 */
export function SpeakingPractice() {
  const state = useLearner();
  const toast = useToast();
  const { supported, speaking: playing, speak } = useSpeak();
  const [index, setIndex] = useState(0);
  const [rec, setRec] = useState<RecState>('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [replaying, setReplaying] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const finished = index >= speaking.length;
  const phrase = speaking[Math.min(index, speaking.length - 1)];

  function stopStream() {
    stream.current?.getTracks().forEach(t => t.stop());
    stream.current = null;
  }

  // Release the microphone and recorded audio when leaving the page.
  useEffect(() => () => { stopStream(); recorder.current = null; }, []);
  useEffect(() => () => { if (audioUrl) URL.revokeObjectURL(audioUrl); }, [audioUrl]);

  async function startRecording() {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') { setRec('unsupported'); return; }
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      const r = new MediaRecorder(stream.current);
      const chunks: Blob[] = [];
      r.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
      r.onstop = () => {
        stopStream();
        setAudioUrl(URL.createObjectURL(new Blob(chunks, { type: r.mimeType })));
        setRec('recorded');
      };
      recorder.current = r;
      r.start();
      setRec('recording');
    } catch {
      stopStream();
      setRec('denied');
    }
  }

  function stopRecording() { if (recorder.current?.state === 'recording') recorder.current.stop(); }

  function replay() {
    if (!audioUrl) return;
    audio.current?.pause();
    const a = new Audio(audioUrl);
    audio.current = a;
    a.onended = () => setReplaying(false);
    setReplaying(true);
    a.play().catch(() => setReplaying(false));
  }

  function assess(confident: boolean) {
    updateLearner(s => recordSkill(s, 'Speaking', confident ? 1 : 0, 1));
    setAudioUrl(null);
    setRec(r => (r === 'denied' || r === 'unsupported' ? r : 'idle'));
    const n = index + 1;
    setIndex(n);
    if (n >= speaking.length) {
      let xp = 0;
      updateLearner(s => { const r = claimDaily(s, 'speaking', today()); xp = r.xp; return r.state; });
      toast(xp ? `Айтылым жаттығуы аяқталды · +${xp} XP` : 'Айтылым жаттығуы аяқталды');
    }
  }

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg bg-primary-soft text-primary-soft-fg" aria-hidden="true"><Mic className="size-[18px]" /></span>
          <div>
            <h2 className="text-base font-semibold text-fg">Shadowing</h2>
            <p className="text-sm text-muted">Тыңда → дауыстап қайтала → өзіңді салыстыр</p>
          </div>
        </div>
        <span className="text-sm text-muted tabular-nums">{Math.min(index + 1, speaking.length)}/{speaking.length}</span>
      </div>
      <ProgressBar value={index / speaking.length} label="Айтылым прогресі" className="mt-4" />

      {finished ? (
        <div className="mt-6 rounded-xl border border-border bg-surface-muted/60 p-6 text-center" role="status">
          <p className="text-base font-semibold text-fg">Жарайсың!</p>
          <p className="mt-1 text-sm text-muted">Күн сайын 5 минут shadowing айтылымды тұрақты жақсартады.</p>
          <Button variant="secondary" className="mt-4" onClick={() => setIndex(0)} icon={<RotateCcw className="size-4" aria-hidden="true" />}>Қайтадан</Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-5">
          <div className="rounded-xl border border-border bg-surface-muted/50 px-5 py-6">
            <p lang="en" className="text-xl font-medium leading-snug text-fg sm:text-2xl">{phrase.text}</p>
            <p lang={state.language} className="mt-3 text-sm text-muted">{phrase.tip[state.language]}</p>
          </div>

          <ol className="grid gap-3 sm:grid-cols-3">
            <Step n={1} title="Тыңда">
              <Button variant="secondary" size="sm" onClick={() => speak(phrase.text, 0.85)} disabled={!supported} icon={<Volume2 className="size-4" aria-hidden="true" />}>{playing ? 'Ойнап жатыр…' : 'Үлгіні тыңдау'}</Button>
              {!supported && <p className="mt-2 text-xs text-muted">Браузер TTS қолдамайды.</p>}
            </Step>
            <Step n={2} title="Жазып ал (міндетті емес)">
              {rec === 'recording'
                ? <Button size="sm" onClick={stopRecording} icon={<Square className="size-3.5" aria-hidden="true" />}>Тоқтату</Button>
                : <Button variant="secondary" size="sm" onClick={startRecording} disabled={rec === 'unsupported'} icon={<Mic className="size-4" aria-hidden="true" />}>{rec === 'recorded' ? 'Қайта жазу' : 'Жазуды бастау'}</Button>}
              {rec === 'recording' && <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-danger" role="status"><span className="size-1.5 animate-pulse-soft rounded-full bg-current" aria-hidden="true" />Жазылып жатыр</p>}
              {rec === 'denied' && <p className="mt-2 text-xs text-muted" role="alert">Микрофонға рұқсат берілмеді. Жазбасыз да жаттығуға болады.</p>}
              {rec === 'unsupported' && <p className="mt-2 text-xs text-muted" role="alert">Бұл браузерде дауыс жазу қолжетімсіз.</p>}
            </Step>
            <Step n={3} title="Салыстыр">
              <Button variant="secondary" size="sm" onClick={replay} disabled={!audioUrl} icon={replaying ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}>Өз дауысым</Button>
            </Step>
          </ol>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <p className="text-sm text-muted">Өзіңді қалай бағалайсың?</p>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => assess(false)}>Қиындық болды</Button>
              <Button onClick={() => assess(true)}>Еркін айттым</Button>
            </div>
          </div>
        </div>
      )}
      <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-muted">
        <Badge tone="neutral">Жеке</Badge>
        Жазба тек осы бетте, құрылғыңның жадында тұрады: серверге жіберілмейді және сақталмайды. AI айтылым бағасы кейінгі кезеңде қосылады.
      </div>
    </Card>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <li className="rounded-lg border border-border p-3.5">
      <p className="mb-2.5 text-xs font-medium text-subtle"><span className="tabular-nums">{n}.</span> {title}</p>
      {children}
    </li>
  );
}
