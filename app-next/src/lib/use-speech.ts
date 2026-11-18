'use client';
/* Text-to-speech through the browser's built-in Web Speech API.
 * No audio is sent to any server by this app. Gracefully reports when unsupported. */
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

const noop = () => () => {};
export function useSpeechSupported(): boolean {
  return useSyncExternalStore(noop, () => typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined', () => false);
}

function pickVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return voices.find(v => v.lang === 'en-US' && v.localService) ?? voices.find(v => v.lang.startsWith('en-')) ?? undefined;
}

export function useSpeak() {
  const supported = useSpeechSupported();
  const [speaking, setSpeaking] = useState(false);

  // Cancel speech when the component is hidden/unmounted (route Activity, navigation).
  useEffect(() => () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); }, []);

  const speak = useCallback((text: string, rate = 0.92) => {
    if (!supported) return false;
    try {
      const synth = window.speechSynthesis;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = rate;
      const voice = pickVoice();
      if (voice) u.voice = voice;
      u.onstart = () => setSpeaking(true);
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      synth.speak(u);
      return true;
    } catch {
      setSpeaking(false);
      return false;
    }
  }, [supported]);

  const stop = useCallback(() => {
    if (supported) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  return { supported, speaking, speak, stop };
}
