import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ITEMS, LEVEL_NAMES, LEVEL_ORDER, levelColor, type Level } from '../game/gameItems';
import { readingsFor, type Reading } from '../game/evaluator';
import { LEVEL_DEFS } from '../game/levelInfo';

const EASE = [0.4, 0, 0.2, 1] as const;

interface ReadingPanelProps {
  a: number;
  b: number;
  /** 1-based ordinal of the connection in this game. */
  ordinal: number;
  meant?: string;
  note?: string;
  onMeant: (key: string, lv: Level) => void;
  onNote: (note: string) => void;
}

/** Four-step depth scale with the graded level marked. */
export function DepthScale({ lv }: { lv: Level }) {
  const at = LEVEL_ORDER.indexOf(lv);
  return (
    <div className="grid grid-cols-4 gap-[3px]" aria-label={`דרגה: ${LEVEL_NAMES[lv]}`}>
      {LEVEL_ORDER.map((l, i) => (
        <div key={l}>
          <div className="h-[3px]" style={{ background: i <= at ? levelColor(lv) : 'hsl(var(--surface-3))' }} />
          <div className="mt-1.5 text-[0.72rem]" style={{ color: i === at ? levelColor(lv) : 'hsl(var(--muted-foreground) / 0.7)' }}>
            {LEVEL_NAMES[l]}
          </div>
        </div>
      ))}
    </div>
  );
}

function ReadingBody({ r }: { r: Reading }) {
  return (
    <div className="space-y-2">
      {r.lines ? (
        <>
          <dl className="space-y-1.5">
            {r.lines.map((l, i) => (
              <div key={i} className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3 text-[0.92rem] leading-relaxed">
                <dt className="font-normal text-foreground">{l.w}</dt>
                <dd className="text-foreground/80">{l.t}</dd>
              </div>
            ))}
          </dl>
          {r.insight && (
            <p className="border-r-2 pr-3 text-[0.92rem] leading-relaxed text-foreground" style={{ borderColor: levelColor(r.lv) }}>{r.insight}</p>
          )}
        </>
      ) : (
        <p className="text-[0.92rem] leading-relaxed text-foreground/85">{r.exp}</p>
      )}
    </div>
  );
}

/**
 * The full reading of one connection, top to bottom: the pair, its depth, the reading,
 * why it earns that depth, and the other readings the player may have meant.
 */
export default function ReadingPanel({ a, b, ordinal, meant, note, onMeant, onNote }: ReadingPanelProps) {
  const readings = useMemo(() => readingsFor(a, b), [a, b]);
  const primary = readings[0];
  const others = readings.slice(1);
  const chosen = readings.find(r => r.key === meant);
  const [writing, setWriting] = useState(false);
  const [draft, setDraft] = useState(note ?? '');

  useEffect(() => { setWriting(false); setDraft(note ?? ''); }, [a, b, note]);

  if (!primary) return null;
  const def = LEVEL_DEFS[primary.lv];

  return (
    <article className="flex flex-col gap-5">
      {/* 1. The pair and its grade */}
      <header>
        <div className="flex items-baseline justify-between">
          <span className="label-mono">קשר <span className="num-mono" dir="ltr">{String(ordinal).padStart(2, '0')}</span></span>
          <span className="num-mono text-xl font-light" style={{ color: levelColor(primary.lv) }} dir="ltr">+{primary.sc}</span>
        </div>
        <h2 className="mt-2 text-[2rem] font-thin leading-tight">
          {ITEMS[a].l} <span className="text-muted-foreground/60">·</span> {ITEMS[b].l}
        </h2>
        <div className="mt-4"><DepthScale lv={primary.lv} /></div>
      </header>

      {/* 2. The reading */}
      <section>
        <p className="label-mono mb-1.5">{primary.basis}</p>
        <h3 className="mb-3 text-xl font-light" style={{ color: levelColor(primary.lv) }}>{primary.sub.replace(/^[^—]*—\s*/, '')}</h3>
        <ReadingBody r={primary} />
      </section>

      {/* 3. Why this depth */}
      <section className="well p-3.5">
        <p className="label-mono mb-1">למה {LEVEL_NAMES[primary.lv]}?</p>
        <p className="text-[0.86rem] leading-relaxed text-foreground/85">{primary.why}</p>
        <p className="mt-2 text-[0.78rem] text-muted-foreground">שאלת המבחן: {def.test}</p>
      </section>

      {/* 4. What did you mean? */}
      <section>
        <p className="label-mono mb-2">{others.length ? 'למה התכוונתם?' : 'התכוונתם למשהו אחר?'}</p>
        {others.length > 0 && (
          <ul className="border-t border-border">
            {readings.map((r, i) => {
              const isChosen = chosen ? r.key === chosen.key : i === 0;
              return (
                <li key={r.key} className="border-b border-border">
                  <button
                    type="button"
                    onClick={() => onMeant(r.key, r.lv)}
                    aria-pressed={isChosen}
                    className="grid w-full grid-cols-[3.5rem_minmax(0,1fr)_auto] items-baseline gap-3 py-2.5 text-right transition-colors hover:bg-surface-2"
                  >
                    <span className="text-sm" style={{ color: levelColor(r.lv) }}>{LEVEL_NAMES[r.lv]}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm">{r.sub.replace(/^[^—]*—\s*/, '')}</span>
                      <span className="label-mono block truncate">{r.basis}</span>
                    </span>
                    <span className={`label-mono ${isChosen ? 'text-foreground' : ''}`}>{isChosen ? (chosen ? 'לזה התכוונתי' : 'הקריאה שלנו') : 'בחירה'}</span>
                  </button>
                  <AnimatePresence initial={false}>
                    {chosen && r.key === chosen.key && i > 0 && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: EASE }} className="overflow-hidden">
                        <div className="pb-3"><ReadingBody r={r} /><p className="mt-2 text-[0.78rem] text-muted-foreground">{r.why}</p></div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-3">
          {note && !writing ? (
            <div className="border-r-2 border-foreground pr-3">
              <p className="label-mono mb-0.5">הקשר שלכם</p>
              <p className="text-sm">{note}</p>
              <button type="button" onClick={() => setWriting(true)} className="label-mono link-draw mt-1">עריכה</button>
            </div>
          ) : writing ? (
            <form
              onSubmit={e => { e.preventDefault(); onNote(draft.trim()); setWriting(false); }}
              className="flex flex-col gap-2"
            >
              <label className="label-mono" htmlFor={`note-${a}-${b}`}>במילים שלכם, מה ראיתם?</label>
              <textarea
                id={`note-${a}-${b}`}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                rows={2}
                maxLength={160}
                autoFocus
                className="w-full resize-none rounded-[2px] border border-border bg-surface-1 px-3 py-2 text-sm focus:border-foreground focus:outline-none"
              />
              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary h-9 px-4 text-sm">שמירה</button>
                <button type="button" onClick={() => setWriting(false)} className="btn btn-text h-9 px-2 text-sm">ביטול</button>
              </div>
            </form>
          ) : (
            <button type="button" onClick={() => setWriting(true)} className="label-mono link-draw">ראיתם קשר אחר? כתבו אותו</button>
          )}
        </div>
        {(chosen && chosen.key !== primary.key) && (
          <p className="mt-3 text-[0.75rem] text-muted-foreground">הניקוד נשאר לפי הקריאה העמוקה ביותר. הבחירה שלכם נכנסת לפרופיל סגנון החשיבה.</p>
        )}
      </section>
    </article>
  );
}
