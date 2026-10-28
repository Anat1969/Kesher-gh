import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ITEMS, LEVEL_NAMES, LEVEL_ORDER, levelColor, type Level } from '../game/gameItems';
import { readingsFor, type Reading } from '../game/evaluator';
import { LEVEL_DEFS } from '../game/levelInfo';
import Glyph from './Glyph';
import Rich from './Rich';
import { plain } from '../lib/marker';
import VoiceNote from './VoiceNote';

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
    <div className="space-y-3">
      {r.lines ? (
        <>
          {r.insight && (
            <p className="border-r-2 pr-3 text-[1.02rem] leading-relaxed text-foreground" style={{ borderColor: levelColor(r.lv) }}>
              <Rich text={r.insight} />
            </p>
          )}
          <dl className="space-y-1">
            {r.lines.map((l, i) => (
              <div key={i} className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3 text-[0.84rem] leading-relaxed">
                <dt className="font-normal text-foreground">{l.w}</dt>
                <dd className="text-muted-foreground"><Rich text={l.t} /></dd>
              </div>
            ))}
          </dl>
        </>
      ) : (
        <p className="text-[0.95rem] leading-relaxed text-foreground/85"><Rich text={r.exp} /></p>
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
        <div className="mt-3 flex items-end gap-4" aria-hidden="true">
          <Glyph i={a} size={44} />
          <span className="mb-4 h-px flex-1" style={{ background: levelColor(primary.lv) }} />
          <Glyph i={b} size={44} />
        </div>
        <h2 className="mt-2 flex justify-between text-[2rem] font-thin leading-tight">
          <span>{ITEMS[a].l}</span><span>{ITEMS[b].l}</span>
        </h2>
        <div className="mt-4"><DepthScale lv={primary.lv} /></div>
      </header>

      {/* Their words, beside the reading: recorded, transcribed and compared live */}
      <VoiceNote a={a} b={b} note={note} meant={meant} onNote={onNote} onMeant={onMeant} />

      {/* 2. The reading */}
      <section>
        <p className="label-mono mb-1.5">{primary.basis}</p>
        <h3 className="mb-3 text-xl font-light" style={{ color: levelColor(primary.lv) }}>{primary.sub.replace(/^[^—]*—\s*/, '')}</h3>
        <ReadingBody r={primary} />
      </section>

      {/* 3. Why this depth */}
      <section className="well p-3.5">
        <p className="label-mono mb-1">למה {LEVEL_NAMES[primary.lv]}?</p>
        <p className="text-[0.86rem] leading-relaxed text-foreground/85"><Rich text={primary.why} /></p>
        <p className="mt-2 text-[0.78rem] text-muted-foreground">שאלת המבחן: {plain(def.test)}</p>
      </section>

      {/* 4. What did you mean? */}
      <section>
        {others.length > 0 && <p className="label-mono mb-2">למה התכוונתם?</p>}
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
                        <div className="pb-3"><ReadingBody r={r} /><p className="mt-2 text-[0.78rem] text-muted-foreground"><Rich text={r.why} /></p></div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        )}

        {(chosen && chosen.key !== primary.key) && (
          <p className="mt-3 text-[0.75rem] text-muted-foreground">הניקוד נשאר לפי הקריאה העמוקה ביותר. הבחירה שלכם נכנסת לפרופיל סגנון החשיבה.</p>
        )}
      </section>
    </article>
  );
}
