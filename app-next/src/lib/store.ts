'use client';
/* Client-side learner store backed by localStorage.
 * - SSR-safe: the server (and the first client render) use a constant default state,
 *   then React switches to the stored state after hydration (no hydration mismatch).
 * - Every write is sanitized + persisted; storage failures are reported, never thrown.
 * - Changes from other tabs are picked up through the `storage` event. */
import { useSyncExternalStore } from 'react';
import { LESSON_IDS } from '@/content/lessons';
import { STORAGE_KEY, dateKey, defaultState, loadState, saveState, sanitizeState, type LearnerState } from './logic';

const SERVER_STATE: LearnerState = defaultState();
const listeners = new Set<() => void>();
let current: LearnerState | null = null;
let storageFailed = false;

function storage(): Storage | null {
  try { return window.localStorage; } catch { return null; }
}

function emit() { listeners.forEach(l => l()); }

function onStorage(e: StorageEvent) {
  if (e.key !== STORAGE_KEY && e.key !== null) return;
  current = loadState(storage(), LESSON_IDS);
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) window.removeEventListener('storage', onStorage);
  };
}

function getSnapshot(): LearnerState {
  if (!current) current = loadState(storage(), LESSON_IDS);
  return current;
}

const getServerSnapshot = () => SERVER_STATE;

/** Current learner state. Returns the default state during SSR/hydration. */
export function useLearner(): LearnerState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

const noopSubscribe = () => () => {};
/** True once the component is hydrated on the client (stored data is available). */
export function useHydrated(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

export type SaveResult = { ok: boolean };

/** Apply a pure transition, persist it and notify subscribers. */
export function updateLearner(fn: (state: LearnerState) => LearnerState): SaveResult {
  const prev = getSnapshot();
  const result = fn(prev);
  if (result === prev) return { ok: true }; // nothing changed (e.g. rejected input): don't write
  const next = sanitizeState(result, LESSON_IDS);
  current = next;
  const ok = saveState(storage(), next);
  if (!ok && !storageFailed) {
    storageFailed = true;
    window.dispatchEvent(new CustomEvent('lp:storage-error'));
  }
  emit();
  return { ok };
}

export function resetLearner() {
  try { storage()?.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  current = defaultState();
  emit();
}

export function exportLearnerData(): string {
  return JSON.stringify({ app: 'LinguaPath AI', exportedAt: new Date().toISOString(), data: getSnapshot() }, null, 2);
}

/** Today's date in Kazakhstan time (client only). */
export function today(): string {
  return dateKey(new Date());
}
