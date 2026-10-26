import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LEVEL_NAMES, LEVEL_ORDER, SCORE_VALUES, levelColor, CHAIN_RATIO } from '../game/gameItems';
import { GAME_DURATION, TOTAL_CARDS } from '../game/engine';
import { SECRET_KEYS } from '../game/evaluator';
import type { Stats } from '../lib/storage';
import { LEVEL_INFO } from '../game/levelInfo';
import BoardHero from './BoardHero';

interface SplashScreenProps {
  stats: Stats;
  onStart: () => void;
}

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] },
});

export default function SplashScreen({ stats, onStart }: SplashScreenProps) {
  const played = stats.gamesPlayed > 0;

  return (
    <main className="mx-auto max-w-[1080px] px-4 pb-16">
      {/* Hero */}
      <section className="grid grid-cols-[minmax(0,1fr)] items-center gap-2 pt-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:gap-10 md:pt-14">
        <div className="order-2 text-center md:order-1 md:text-right">
          <motion.p {...rise(0.05)} className="label-mono mb-4">משחק קשרים · {TOTAL_CARDS} כרטיסים · {GAME_DURATION / 60} דקות</motion.p>
          <motion.h1 {...rise(0.12)} className="text-[5.5rem] sm:text-[7.5rem] font-thin leading-[0.85] tracking-tight text-foreground">
            קֶשֶׁר
          </motion.h1>
          <motion.p {...rise(0.2)} className="mt-5 text-xl sm:text-2xl font-light leading-snug text-foreground/85 max-w-[30ch] mx-auto md:mx-0">
            בונים שרשרת אחת מכל הכרטיסים. המערכת מגלה כמה עמוק כל קשר.
          </motion.p>

          <motion.div {...rise(0.3)} className="mt-8 flex flex-wrap items-center justify-center gap-3 md:justify-start">
            <button onClick={onStart} className="btn btn-primary h-14 px-10 text-lg">
              {played ? 'משחק חדש' : 'התחילו לשחק'}
            </button>
            <Link to="/guide" className="btn btn-ghost h-14 px-6 text-base">איך משחקים</Link>
          </motion.div>

          {played && (
            <motion.dl {...rise(0.4)} className="mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-md border border-border bg-border shadow-sm" aria-label="השיאים שלך">
              {[
                { label: 'שיא אישי', value: stats.bestScore },
                { label: 'משחקים', value: stats.gamesPlayed },
                { label: 'סודות', value: `${stats.secrets.length}/${SECRET_KEYS.length}` },
              ].map(s => (
                <div key={s.label} className="bg-gradient-to-b from-surface-1 to-surface-2 px-3 py-3 text-center md:text-right">
                  <dt className="label-mono">{s.label}</dt>
                  <dd className="display-num mt-1.5 text-3xl text-foreground" dir="ltr">{s.value}</dd>
                </div>
              ))}
            </motion.dl>
          )}
        </div>

        <motion.div
          className="order-1 md:order-2"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <BoardHero />
        </motion.div>
      </section>

      {/* Section cut: the four depths */}
      <section aria-labelledby="depth-title" className="mt-14 md:mt-20">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="label-mono mb-2">חתך עומק</p>
            <h2 id="depth-title" className="text-3xl sm:text-4xl font-extralight">ארבע שכבות של קשר</h2>
          </div>
          <p className="label-mono hidden sm:block">נקודות לקשר</p>
        </div>

        <ol className="overflow-hidden rounded-md border border-border shadow-lg">
          {LEVEL_ORDER.map((lv, i) => (
            <motion.li
              key={lv}
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
              className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border px-5 py-5 last:border-b-0 sm:grid-cols-[9rem_minmax(0,1fr)_auto] sm:px-7"
              style={{
                background: `linear-gradient(180deg, hsl(var(--surface-${Math.min(3, i + 1)})), hsl(var(--surface-${Math.min(3, i + 1)}) / 0.6))`,
                boxShadow: `inset 0 ${2 + i * 3}px ${6 + i * 6}px -${4 + i}px hsl(var(--shade) / ${0.05 + i * 0.05})`,
              }}
            >
              <span className="absolute inset-y-0 right-0 w-1" style={{ background: levelColor(lv) }} />
              <div>
                <div className="label-mono mb-1">שכבה {i + 1}</div>
                <div className="text-3xl font-light" style={{ color: levelColor(lv) }}>{LEVEL_NAMES[lv]}</div>
              </div>
              <div className="col-span-2 row-start-2 sm:col-span-1 sm:row-start-auto">
                <div className="text-base font-medium text-foreground">{LEVEL_INFO[lv].title}</div>
                <p className="mt-0.5 text-sm text-muted-foreground leading-relaxed">{LEVEL_INFO[lv].desc}. {LEVEL_INFO[lv].examples}</p>
              </div>
              <div className="col-start-2 row-start-1 text-left sm:col-start-auto sm:row-start-auto">
                <span className="display-num text-4xl" style={{ color: levelColor(lv) }} dir="ltr">{SCORE_VALUES[lv]}</span>
              </div>
            </motion.li>
          ))}
        </ol>
      </section>

      {/* Chain bonus diagram */}
      <section aria-labelledby="chain-title" className="mt-14 grid items-center gap-8 md:grid-cols-2">
        <div>
          <p className="label-mono mb-2">בונוס</p>
          <h2 id="chain-title" className="text-3xl sm:text-4xl font-extralight">חיבורי שרשרת</h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground max-w-[44ch]">
            כשמחברים א׳ לב׳ ואז ב׳ לג׳, המערכת חושפת גם את הקשר הסמוי בין א׳ לג׳, ומוסיפה עליו
            <span className="font-medium text-foreground"> {Math.round(CHAIN_RATIO * 100)}% </span>
            מערכו. שרשרת חכמה מכפילה את הניקוד.
          </p>
        </div>
        <ChainDiagram />
      </section>

      <div className="mt-16 flex justify-center">
        <button onClick={onStart} className="btn btn-primary h-14 px-12 text-lg">{played ? 'משחק חדש' : 'התחילו לשחק'}</button>
      </div>
    </main>
  );
}

function ChainDiagram() {
  const nodes = [
    { x: 300, y: 60, e: '🌊', l: 'גל' },
    { x: 160, y: 150, e: '🎵', l: 'תו' },
    { x: 40, y: 60, e: '📖', l: 'ספר' },
  ];
  return (
    <div className="panel relative mx-auto w-full max-w-[420px] p-4" aria-hidden="true">
      <svg viewBox="0 0 340 210" className="w-full">
        <motion.path d="M300,60 L160,150" stroke={levelColor('s')} strokeWidth={2.5} strokeLinecap="round" fill="none"
          initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} />
        <motion.path d="M160,150 L40,60" stroke={levelColor('s')} strokeWidth={2.5} strokeLinecap="round" fill="none"
          initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ delay: 0.6, duration: 0.6 }} />
        <motion.path d="M300,60 Q170,10 40,60" stroke="hsl(var(--chain))" strokeWidth={1.8} strokeDasharray="5 5" fill="none"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 1.3, duration: 0.6 }} />
        <motion.text x="170" y="30" textAnchor="middle" className="font-mono" fontSize="11" fill="hsl(var(--chain))"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 1.6 }}>
          שרשרת +{Math.round(CHAIN_RATIO * 100)}%
        </motion.text>
        {nodes.map(n => (
          <g key={n.l}>
            <rect x={n.x - 24} y={n.y - 24} width={48} height={48} rx={5} fill="hsl(var(--surface-1))" stroke="hsl(var(--border))" />
            <text x={n.x} y={n.y + 8} textAnchor="middle" fontSize="22">{n.e}</text>
            <text x={n.x} y={n.y + 42} textAnchor="middle" fontSize="11" fill="hsl(var(--muted-foreground))">{n.l}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
