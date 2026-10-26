import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ITEMS, levelColor } from '../game/gameItems';
import { secretEntries } from '../game/evaluator';
import { useGame } from '../context/GameContext';

const EASE = [0.4, 0, 0.2, 1] as const;
const pad2 = (n: number) => String(n).padStart(2, '0');

export default function Secrets() {
  const { stats, state, startGame } = useGame();
  const entries = useMemo(secretEntries, []);
  const known = new Set(stats.secrets);
  const found = entries.filter(e => known.has(e.key)).length;
  const [open, setOpen] = useState<string | null>(null);
  const inGame = state.screen === 'game';

  return (
    <main className="mx-auto max-w-[1000px] px-5 pb-20 pt-10 md:pt-20">
      <header className="grid grid-cols-[minmax(0,1fr)] items-end gap-10 md:grid-cols-[minmax(0,1fr)_auto]">
        <div className="max-w-[600px]">
          <p className="label-mono flex items-center gap-3"><span className="h-px w-8 bg-foreground/40" />קטלוג</p>
          <h1 className="mt-6 text-5xl font-thin leading-[0.95] sm:text-7xl">אוסף הסודות</h1>
          <p className="mt-7 text-xl font-light leading-relaxed text-foreground/80">
            {entries.length} זוגות שהקשר ביניהם הוא סוד אמיתי: ממצא מדעי, מיתוס או תבנית מתמטית.
            כל זוג שמחברים במשחק נרשם כאן לתמיד.
          </p>
        </div>
        <div className="min-w-[220px] border-t border-foreground/80 pt-4">
          <div className="label-mono">נחשפו</div>
          <div className="display-num mt-2 text-6xl" dir="ltr" style={{ textAlign: 'right' }}>
            {pad2(found)}<span className="text-muted-foreground">/{entries.length}</span>
          </div>
          <div className="relative mt-4 h-[3px] bg-surface-3">
            <motion.div className="absolute inset-y-0 right-0" style={{ background: levelColor('s') }}
              initial={{ width: 0 }} animate={{ width: `${(found / entries.length) * 100}%` }} transition={{ duration: 1.2, ease: EASE }} />
          </div>
        </div>
      </header>

      {stats.gamesPlayed > 0 && (
        <dl className="mt-14 grid grid-cols-3 border-y border-border">
          {[
            { label: 'שיא אישי', value: stats.bestScore },
            { label: 'משחקים', value: stats.gamesPlayed },
            { label: 'קשרים שנמצאו', value: stats.totalConnections },
          ].map((s, i) => (
            <div key={s.label} className={`py-4 ${i > 0 ? 'border-r border-border pr-4' : ''}`}>
              <dt className="label-mono">{s.label}</dt>
              <dd className="display-num mt-2 text-3xl" dir="ltr" style={{ textAlign: 'right' }}>{s.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <ol className="mt-14 grid grid-cols-[minmax(0,1fr)] border-t border-foreground/80 md:grid-cols-2 md:gap-x-10" aria-label="הסודות">
        {entries.map((e, i) => {
          const isKnown = known.has(e.key);
          const isOpen = open === e.key;
          const title = e.ev.sub.replace(/^סוד\s*—\s*/, '');
          return (
            <motion.li
              key={e.key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 + i * 0.025, duration: 0.6, ease: EASE }}
              className="border-b border-border"
            >
              {isKnown ? (
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : e.key)}
                  aria-expanded={isOpen}
                  className="grid w-full grid-cols-[2.5rem_minmax(0,1fr)] gap-3 py-5 text-right transition-colors hover:bg-surface-1"
                >
                  <span className="num-mono pt-1 text-sm" style={{ color: levelColor('s'), textAlign: 'right' }} dir="ltr">{pad2(i + 1)}</span>
                  <div className="min-w-0">
                    <div className="label-mono">{ITEMS[e.a].l} · {ITEMS[e.b].l}</div>
                    <div className="mt-1 text-xl font-light" style={{ color: levelColor('s') }}>{title}</div>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.p
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: EASE }}
                          className="overflow-hidden text-[0.95rem] leading-relaxed text-foreground/85"
                        >
                          <span className="block pt-3">{e.ev.exp}</span>
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </button>
              ) : (
                <div className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 py-5" aria-label="סוד חתום">
                  <span className="num-mono pt-1 text-sm text-muted-foreground/60" dir="ltr" style={{ textAlign: 'right' }}>{pad2(i + 1)}</span>
                  <div>
                    <div className="label-mono">סוד חתום</div>
                    <div className="mt-2.5 flex items-center gap-2" aria-hidden="true">
                      <span className="h-px w-14 border-t border-dashed border-muted-foreground/40" />
                      <span className="text-muted-foreground/50">·</span>
                      <span className="h-px w-14 border-t border-dashed border-muted-foreground/40" />
                    </div>
                  </div>
                </div>
              )}
            </motion.li>
          );
        })}
      </ol>

      <div className="mt-20 flex justify-center border-t border-border pt-12">
        {inGame
          ? <Link to="/" className="btn btn-primary h-12 px-10 text-base">חזרה למשחק</Link>
          : <Link to="/" onClick={startGame} className="btn btn-primary h-12 px-10 text-base">{found ? 'לחשוף עוד סודות' : 'התחלת משחק'}</Link>}
      </div>
    </main>
  );
}
