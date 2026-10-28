import { useCallback, useEffect, useRef, useState } from 'react';

/* Minimal typing for the Web Speech API (not in the TS DOM lib). */
interface SpeechAlternative { transcript: string }
interface SpeechResult { isFinal: boolean; 0: SpeechAlternative; length: number }
interface SpeechEvent { resultIndex: number; results: { length: number; [i: number]: SpeechResult } }
interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SpeechEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type RecognitionCtor = new () => Recognition;

function ctor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export const speechSupported = () => ctor() !== null;

export type SpeechError = 'denied' | 'no-speech' | 'network' | 'other';

/**
 * Live Hebrew dictation. `text` grows while the player speaks (final words plus the
 * words still being recognised); `stop()` resolves with the final transcript.
 */
export function useSpeech(lang = 'he-IL') {
  const [listening, setListening] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState<SpeechError | null>(null);
  const rec = useRef<Recognition | null>(null);
  const finalRef = useRef('');
  const wantRef = useRef(false);
  const doneRef = useRef<((t: string) => void) | null>(null);

  const finish = useCallback(() => {
    wantRef.current = false;
    setListening(false);
    const t = finalRef.current.trim();
    doneRef.current?.(t);
    doneRef.current = null;
  }, []);

  const start = useCallback((initial = '') => {
    const C = ctor();
    if (!C || wantRef.current) return;
    setError(null);
    finalRef.current = initial ? `${initial.trim()} ` : '';
    setText(finalRef.current);
    const r = new C();
    r.lang = lang;
    r.continuous = true;
    r.interimResults = true;
    r.onresult = e => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) finalRef.current += `${res[0].transcript.trim()} `;
        else interim += res[0].transcript;
      }
      setText(`${finalRef.current}${interim}`.trimStart());
    };
    r.onerror = e => {
      setError(e.error === 'not-allowed' || e.error === 'service-not-allowed' ? 'denied'
        : e.error === 'no-speech' ? 'no-speech' : e.error === 'network' ? 'network' : e.error === 'aborted' ? null : 'other');
    };
    // Some browsers (iOS, Android) end a session on a pause: restart while the player still wants to talk.
    r.onend = () => {
      if (wantRef.current) {
        try { r.start(); return; } catch { /* fall through */ }
      }
      finish();
    };
    rec.current = r;
    wantRef.current = true;
    setListening(true);
    try { r.start(); } catch { finish(); setError('other'); }
  }, [lang, finish]);

  const stop = useCallback(() => new Promise<string>(resolve => {
    if (!rec.current || !wantRef.current) { resolve(finalRef.current.trim()); return; }
    doneRef.current = resolve;
    wantRef.current = false;
    try { rec.current.stop(); } catch { finish(); }
  }), [finish]);

  useEffect(() => () => { wantRef.current = false; rec.current?.abort(); }, []);
  useEffect(() => { if (error === 'denied') wantRef.current = false; }, [error]);

  return { supported: speechSupported(), listening, text, error, start, stop };
}
