import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LEVEL_NAMES, LEVEL_ORDER, levelColor } from '../game/gameItems';
import { RELATION_GROUPS, FRAMEWORKS } from '../game/relationTypes';

const EASE = [0.4, 0, 0.2, 1] as const;
const inView = (delay = 0) => ({
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: '-30px' },
  transition: { delay, duration: 0.8, ease: EASE },
});
const pad2 = (n: number) => String(n).padStart(2, '0');

function Heading({ n, kicker, title, lead }: { n: string; kicker: string; title: string; lead?: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-3 border-b border-foreground/80 pb-4 md:grid-cols-[minmax(0,1fr)_auto]">
      <div>
        <p className="label-mono"><span className="num-mono">{n}</span> · {kicker}</p>
        <h2 className="mt-3 text-4xl font-extralight">{title}</h2>
      </div>
      {lead && <p className="max-w-[42ch] self-end text-sm leading-relaxed text-muted-foreground">{lead}</p>}
    </div>
  );
}

export default function DidYouKnow() {
  const [focus, setFocus] = useState<string | null>(null);
  const groupName = (id: string) => RELATION_GROUPS.find(g => g.id === id)?.name ?? id;

  return (
    <main className="mx-auto max-w-[1040px] px-5 pb-20 pt-10 md:pt-20">
      <header className="max-w-[680px]">
        <p className="label-mono flex items-center gap-3"><span className="h-px w-8 bg-foreground/40" />הידעת</p>
        <h1 className="mt-6 text-5xl font-thin leading-[0.95] sm:text-7xl">יש יותר מארבע דרכים לקשור</h1>
        <p className="mt-7 text-xl font-light leading-relaxed text-foreground/80">
          פשט, רמז, דרש וסוד מודדים כמה עמוק קשר. אבל אפשר גם לשאול <mark className="hl">איזה סוג של קשר הוא</mark>.
          לסוגים אין סדר של עומק; <mark className="hl">הם משפחות</mark>, וכל משפחה נוטה לנחות על דרגות מסוימות.
        </p>
      </header>

      {/* Families */}
      <section aria-labelledby="groups-title" className="mt-20">
        <Heading n="01" kicker="משפחות" title="שמונה משפחות של קשר" lead="בחרו משפחה כדי לראות היכן היא נמצאת על סולם העומק ובאילו מסגרות היא נזכרת." />
        <div className="grid grid-cols-[minmax(0,1fr)] md:grid-cols-2 md:gap-x-10">
          {RELATION_GROUPS.map((g, i) => {
            const active = focus === g.id;
            return (
              <motion.article
                key={g.id}
                {...inView((i % 2) * 0.06)}
                className={`border-b border-border py-7 transition-opacity ${focus && !active ? 'opacity-40' : ''}`}
              >
                <button type="button" onClick={() => setFocus(active ? null : g.id)} aria-pressed={active} className="w-full text-right">
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="flex items-baseline gap-3">
                      <span className="num-mono text-sm text-muted-foreground" dir="ltr">{pad2(i + 1)}</span>
                      <h3 className="text-3xl font-extralight">{g.name}</h3>
                    </div>
                    <span className="flex gap-1" aria-label={`דרגות טיפוסיות: ${g.levels.map(l => LEVEL_NAMES[l]).join(', ') || 'לא נמדד'}`}>
                      {LEVEL_ORDER.map(l => (
                        <span key={l} className="h-[3px] w-4" style={{ background: g.levels.includes(l) ? levelColor(l) : 'hsl(var(--surface-3))' }} />
                      ))}
                    </span>
                  </div>
                  <p className="mt-2 text-base text-foreground/80"><mark className="hl">{g.gist}</mark></p>
                </button>
                <ul className="mt-4 space-y-3">
                  {g.types.map(t => (
                    <li key={t.name} className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3 text-sm">
                      <span className="font-normal">{t.name}</span>
                      <span>
                        <span className="text-foreground/80">{t.definition}</span>
                        <span className="mt-0.5 block text-[0.8rem] text-muted-foreground">{t.example}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.article>
            );
          })}
        </div>
      </section>

      {/* Matrix: families × depth */}
      <section aria-labelledby="matrix-title" className="mt-20">
        <Heading n="02" kicker="מפה" title="איפה כל משפחה נוחתת" lead="המשפחות אינן היררכיה. המפה מראה איך הן נפרשות על ארבע דרגות העומק של המשחק." />
        <div className="overflow-x-auto">
          <table className="mt-2 w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="py-3 text-right font-normal"><span className="label-mono">משפחה</span></th>
                {LEVEL_ORDER.map(l => (
                  <th key={l} className="py-3 text-center text-base font-light" style={{ color: levelColor(l) }}>{LEVEL_NAMES[l]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RELATION_GROUPS.map(g => (
                <tr
                  key={g.id}
                  onClick={() => setFocus(focus === g.id ? null : g.id)}
                  className={`cursor-pointer border-t border-border transition-colors hover:bg-surface-1 ${focus === g.id ? 'bg-surface-1' : ''} ${focus && focus !== g.id ? 'opacity-40' : ''}`}
                >
                  <td className="py-3 text-base">{g.name}</td>
                  {LEVEL_ORDER.map(l => (
                    <td key={l} className="py-3 text-center">
                      {g.levels.includes(l)
                        ? <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: levelColor(l) }} aria-label="טיפוסי" />
                        : <span className="inline-block h-px w-3 bg-border" aria-hidden="true" />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          קשר אישי אינו נמדד בסולם, כי רק אתם יודעים אותו. לכן במשחק אפשר תמיד לכתוב את הקשר שלכם במילים שלכם.
        </p>
      </section>

      {/* Frameworks */}
      <section aria-labelledby="frameworks-title" className="mt-20">
        <Heading n="03" kicker="מקורות" title="מי מיין קשרים לפנינו" lead="המשפחות נשענות על מסגרות מוכרות בפילוסופיה, בבלשנות ובפסיכולוגיה." />
        <ol>
          {FRAMEWORKS.map((f, i) => (
            <motion.li
              key={f.who}
              {...inView(i * 0.04)}
              className={`grid grid-cols-[minmax(0,1fr)] gap-2 border-b border-border py-6 transition-opacity md:grid-cols-[12rem_minmax(0,1fr)_auto] md:gap-8 ${focus && !f.groups.includes(focus) ? 'opacity-40' : ''}`}
            >
              <div>
                <div className="text-lg font-light">{f.who}</div>
                <div className="label-mono mt-0.5">{f.when}</div>
              </div>
              <div>
                <div className="text-sm font-normal">{f.work}</div>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.idea}</p>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 md:max-w-[12rem] md:justify-end">
                {f.groups.map(id => <span key={id} className="label-mono">{groupName(id)}</span>)}
              </div>
            </motion.li>
          ))}
        </ol>
      </section>

      <div className="mt-20 flex justify-center border-t border-border pt-12">
        <Link to="/" className="btn btn-primary h-12 px-10 text-base">לנסות את זה במשחק</Link>
      </div>
    </main>
  );
}
