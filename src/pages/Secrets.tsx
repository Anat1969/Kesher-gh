import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ITEMS, levelColor } from '../game/gameItems';
import { secretEntries } from '../game/evaluator';
import { useGame } from '../context/GameContext';

export default function Secrets() {
  const { stats, state, startGame } = useGame();
  const entries = useMemo(secretEntries, []);
  const known = new Set(stats.secrets);
  const found = entries.filter(e => known.has(e.key)).length;
  const [open, setOpen] = useState<string | null>(null);
  const inGame = state.screen === 'game';

  return (
    <main className="mx-auto max-w-[1000px] px-4 pb-16 pt-8 md:pt-12">
      <header className="grid items-end gap-6 md:grid-cols-[minmax(0,1fr)_auto]">
        <div className="max-w-[600px]">
          <p className="label-mono mb-3">אוסף</p>
          <h1 className="text-5xl sm:text-6xl font-thin leading-[0.95]">אוסף הסודות</h1>
          <p className="mt-4 text-lg font-light leading-relaxed text-foreground/85">
            בין הכרטיסים מוסתרים {entries.length} זוגות שהקשר ביניהם הוא סוד אמיתי: ממצא מדעי, מיתוס או תבנית מתמטית.
            כל זוג שמחברים במשחק נחשף כאן לתמיד.
          </p>
        </div>
        <div className="panel min-w-[200px] p-4">
          <div className="label-mono">נחשפו</div>
          <div className="display-num mt-1 text-5xl" dir="ltr">
            {found}<span className="text-muted-foreground">/{entries.length}</span>
          </div>
          <div className="well mt-3 h-2 overflow-hidden rounded-full">
            <motion.div className="h-full rounded-full" style={{ background: levelColor('s') }}
              initial={{ width: 0 }} animate={{ width: `${(found / entries.length) * 100}%` }} transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }} />
          </div>
        </div>
      </header>

      {stats.gamesPlayed > 0 && (
        <dl className="mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-md border border-border bg-border shadow-sm">
          {[
            { label: 'שיא אישי', value: stats.bestScore },
            { label: 'משחקים', value: stats.gamesPlayed },
            { label: 'קשרים שנמצאו', value: stats.totalConnections },
          ].map(s => (
            <div key={s.label} className="bg-gradient-to-b from-surface-1 to-surface-2 px-4 py-3">
              <dt className="label-mono">{s.label}</dt>
              <dd className="display-num mt-1.5 text-3xl" dir="ltr">{s.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="הסודות">
        {entries.map((e, i) => {
          const isKnown = known.has(e.key);
          const isOpen = open === e.key;
          const title = e.ev.sub.replace(/^סוד\s*—\s*/, '');
          return (
            <motion.li
              key={e.key}
              layout
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.03, duration: 0.45 }}
              className={isOpen ? 'sm:col-span-2 lg:col-span-3' : ''}
            >
              {isKnown ? (
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : e.key)}
                  aria-expanded={isOpen}
                  className="panel relative w-full overflow-hidden p-4 text-right transition-transform hover:-translate-y-0.5"
                >
                  <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: levelColor('s') }} />
                  <div className="flex items-center gap-3">
                    <span className="whitespace-nowrap text-3xl" aria-hidden="true">{ITEMS[e.a].e}{ITEMS[e.b].e}</span>
                    <div className="min-w-0">
                      <div className="label-mono">{ITEMS[e.a].l} ו{ITEMS[e.b].l}</div>
                      <div className="mt-0.5 text-lg font-light" style={{ color: levelColor('s') }}>{title}</div>
                    </div>
                  </div>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden text-base leading-relaxed text-foreground/85"
                      >
                        <span className="block pt-3">{e.ev.exp}</span>
                      </motion.p>
                    )}
                  </AnimatePresence>
                </button>
              ) : (
                <div className="well flex items-center gap-3 p-4" aria-label="סוד חתום">
                  <span className="flex gap-1" aria-hidden="true">
                    {[0, 1].map(k => (
                      <span key={k} className="grid h-9 w-9 place-items-center rounded-[5px] border border-dashed border-border font-mono text-sm text-muted-foreground/70">?</span>
                    ))}
                  </span>
                  <div>
                    <div className="label-mono">סוד חתום</div>
                    <div className="mt-0.5 text-sm text-muted-foreground">נחשף כשמחברים את הזוג הנכון</div>
                  </div>
                </div>
              )}
            </motion.li>
          );
        })}
      </ul>

      <div className="mt-12 flex justify-center">
        {inGame
          ? <Link to="/" className="btn btn-primary h-14 px-10 text-lg">חזרה למשחק</Link>
          : <Link to="/" onClick={startGame} className="btn btn-primary h-14 px-10 text-lg">{found ? 'לחשוף עוד סודות' : 'התחילו לשחק'}</Link>}
      </div>
    </main>
  );
}
