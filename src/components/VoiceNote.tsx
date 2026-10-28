import { useEffect, useMemo, useState } from 'react';
import { ITEMS, LEVEL_NAMES, levelColor, type Level } from '../game/gameItems';
import { readingsFor } from '../game/evaluator';
import { compareMeaning, type Verdict } from '../lib/compare';
import { useSpeech } from '../hooks/useSpeech';
import Rich from './Rich';

interface VoiceNoteProps {
  a: number;
  b: number;
  note?: string;
  meant?: string;
  onNote: (note: string) => void;
  onMeant: (key: string, lv: Level) => void;
  /** One-row version for the phone reading strip. */
  compact?: boolean;
  /** Compact only: the reading's one-line insight, shown until the player speaks. */
  insight?: string;
  onOpen?: () => void;
  more?: number;
}

const short = (sub: string) => sub.replace(/^[^—]*—\s*/, '');

/** The verdict of comparing the player's words with the game's readings, in one line. */
export function VerdictLine({ v, meant, onMeant, compact }: { v: Verdict; meant?: string; onMeant?: (key: string, lv: Level) => void; compact?: boolean }) {
  if (v.kind === 'empty') return null;
  const words = v.words.length > 0 && !compact && (
    <span className="label-mono block mt-1">מילים משותפות · {v.words.join(', ')}</span>
  );
  if (v.kind === 'same') {
    return (
      <p className="text-sm">
        <mark className="hl">אותו כיוון</mark> כמו הקריאה שלי
        <span style={{ color: levelColor(v.reading.lv) }}> · {LEVEL_NAMES[v.reading.lv]}</span>
        {words}
      </p>
    );
  }
  if (v.kind === 'other') {
    return (
      <div className="text-sm">
        <p>
          <mark className="hl">חשבתם אחרת</mark>: קרוב לקריאת{' '}
          <span style={{ color: levelColor(v.reading.lv) }}>ה{LEVEL_NAMES[v.reading.lv]}</span>
          {!compact && <>, "{short(v.reading.sub)}"</>}
        </p>
        {words}
        {onMeant && meant !== v.reading.key && (
          <button type="button" onClick={() => onMeant(v.reading.key, v.reading.lv)} className="label-mono link-draw mt-1 text-foreground">
            כן, לזה התכוונתי
          </button>
        )}
      </div>
    );
  }
  return (
    <p className="text-sm">
      <mark className="hl">קשר משלכם</mark>{compact ? '' : ': לא מצאתי אותו בקריאות שלי. הוא נשמר בפרופיל החשיבה.'}
    </p>
  );
}

/**
 * Explain a connection out loud: live Hebrew transcription beside the game's reading, saved as
 * the player's own words and compared with the readings at once (and again on the results screen).
 * Typing is always available, and is the only way where the browser has no speech recognition.
 */
export default function VoiceNote({ a, b, note, meant, onNote, onMeant, compact = false, insight, onOpen, more = 0 }: VoiceNoteProps) {
  const speech = useSpeech();
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState(note ?? '');
  const readings = useMemo(() => readingsFor(a, b), [a, b]);
  const verdict = useMemo(
    () => compareMeaning(speech.listening ? speech.text : note ?? '', readings, [ITEMS[a].l, ITEMS[b].l]),
    [speech.listening, speech.text, note, readings, a, b],
  );

  useEffect(() => { setTyping(false); setDraft(note ?? ''); }, [a, b, note]);

  const toggle = async () => {
    if (speech.listening) {
      const t = await speech.stop();
      if (t) onNote(t.slice(0, 400));
    } else {
      speech.start();
    }
  };

  // Where the browser has no speech recognition (e.g. some installed iPhone apps), the same button
  // opens a text field: the phone keyboard's own microphone dictates Hebrew into it.
  const dictateHint = 'הקישו על סמל המיקרופון במקלדת ודברו, או כתבו';
  const recordButton = (
    <button
      type="button"
      onClick={speech.supported && speech.error !== 'denied' ? toggle : () => setTyping(true)}
      aria-pressed={speech.listening}
      className={`btn ${compact ? 'h-9 px-3.5 text-sm' : 'h-12 px-5 text-[0.95rem]'} ${speech.listening ? 'btn-primary' : 'btn-ghost'}`}
    >
      <span
        aria-hidden="true"
        className={`inline-block h-2.5 w-2.5 rounded-full border ${speech.listening ? 'animate-blink border-current bg-current' : 'border-current'}`}
      />
      {speech.listening ? 'סיום ההקלטה' : note ? 'הקלטה מחדש' : 'הסבירו בקול'}
    </button>
  );

  const errorLine = speech.error && (
    <p className="label-mono mt-1">
      {speech.error === 'denied' ? 'אין גישה למיקרופון. אפשר לאשר בדפדפן, או לכתוב.' : speech.error === 'no-speech' ? 'לא נשמע דיבור. נסו שוב קרוב יותר.' : 'התמלול נכשל. אפשר לכתוב.'}
    </p>
  );

  const typingForm = (rows: number) => (
    <form onSubmit={e => { e.preventDefault(); onNote(draft.trim()); setTyping(false); }} className="flex flex-col gap-2">
      <textarea
        aria-label="במילים שלכם, מה ראיתם?"
        placeholder={dictateHint}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        rows={rows}
        maxLength={400}
        autoFocus
        className="w-full resize-none rounded-[2px] border border-border bg-surface-1 px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
      />
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary h-9 px-4 text-sm">שמירה</button>
        <button type="button" onClick={() => setTyping(false)} className="btn btn-text h-9 px-2 text-sm">ביטול</button>
      </div>
    </form>
  );

  if (compact) {
    if (typing) return <div className="mt-2">{typingForm(2)}</div>;
    return (
      <div>
        <div className="mt-1 min-h-[2.6em] text-[0.84rem] leading-relaxed" aria-live="polite">
          {speech.listening ? (
            <p className="line-clamp-2"><span className="label-mono">אתם · </span>{speech.text || <span className="text-muted-foreground">מקשיב…</span>}</p>
          ) : note ? (
            <>
              <p className="truncate"><span className="label-mono">אתם · </span>"{note}"</p>
              <VerdictLine v={verdict} compact />
            </>
          ) : insight ? (
            <p className="line-clamp-2 text-foreground/85 [@media(max-height:760px)]:line-clamp-1"><Rich text={insight} /></p>
          ) : null}
        </div>
        <div className="mt-1.5 flex items-center justify-between gap-3">
          {onOpen && (
            <button type="button" onClick={onOpen} className="label-mono link-draw">
              קריאה מלאה{more > 0 ? ` · עוד ${more} קריאות` : ''}
            </button>
          )}
          {recordButton}
        </div>
        {errorLine}
      </div>
    );
  }

  return (
    <section className="border-r-2 border-foreground/70 pr-3" aria-live="polite">
      <p className="label-mono mb-2">ההסבר שלכם</p>

      {speech.listening ? (
        <div className="well min-h-[4.5rem] p-3 text-[0.95rem] leading-relaxed">
          {speech.text || <span className="text-muted-foreground">מקשיב… הסבירו מה מחבר בין {ITEMS[a].l} ל{ITEMS[b].l}</span>}
        </div>
      ) : typing ? (
        typingForm(3)
      ) : note ? (
        <p className="text-[0.95rem] leading-relaxed">"{note}"</p>
      ) : (
        <p className="text-sm text-muted-foreground">
          <>אמרו <mark className="hl">במשפט אחד</mark> מה ראיתם. התמלול מופיע כאן, ליד הקריאה שלי, ואני משווה ביניהם.</>
        </p>
      )}

      {!typing && <div className="mt-2"><VerdictLine v={verdict} meant={meant} onMeant={speech.listening ? undefined : onMeant} /></div>}

      {!typing && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          {recordButton}
          {!speech.listening && (
            <button type="button" onClick={() => setTyping(true)} className="label-mono link-draw">
              {note ? 'עריכה בכתב' : 'או כתבו'}
            </button>
          )}
        </div>
      )}
      {errorLine}
      {verdict.kind !== 'empty' && !speech.listening && <p className="label-mono mt-2 opacity-70">ההשוואה לפי מילים משותפות, הערכה ולא הבנה.</p>}
    </section>
  );
}
