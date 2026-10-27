import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LEVEL_NAMES, LEVEL_ORDER, SCORE_VALUES, levelColor, CHAIN_RATIO } from '../game/gameItems';
import { GAME_DURATION, TOTAL_CARDS } from '../game/engine';
import { SECRET_KEYS } from '../game/evaluator';
import type { Stats } from '../lib/storage';
import { LEVEL_DEFS } from '../game/levelInfo';
import BoardHero from './BoardHero';
import Glyph from './Glyph';
import Rich from './Rich';
import { plain } from '../lib/marker';

interface SplashScreenProps {
  stats: Stats;
  onStart: () => void;
}

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.8, ease: [0.4, 0, 0.2, 1] },
});

const inView = (delay = 0) => ({
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: '-40px' },
  transition: { delay, duration: 0.8, ease: [0.4, 0, 0.2, 1] },
});

export default function SplashScreen({ stats, onStart }: SplashScreenProps) {
  const played = stats.gamesPlayed > 0;

  return (
    <main className="mx-auto max-w-[1120px] px-5 pb-20">
      {/* Hero */}
      <section className="grid grid-cols-[minmax(0,1fr)] items-center gap-10 pt-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-16 md:pt-20">
        <div>
          <motion.p {...fade(0)} className="label-mono flex items-center gap-3">
            <span className="h-px w-8 bg-foreground/40" />
            משחק קשרים בעברית
          </motion.p>
          <motion.h1 {...fade(0.08)} className="mt-6 text-[5.5rem] font-thin leading-[0.85] tracking-tight sm:text-[8rem]">
            קֶשֶׁר
          </motion.h1>
          <motion.p {...fade(0.16)} className="mt-7 max-w-[34ch] text-xl font-light leading-relaxed text-foreground/80 sm:text-[1.4rem]">
            שרשרת אחת של {TOTAL_CARDS} מילים. <mark className="hl">כל חיבור נמדד בעומקו</mark>, מהגלוי ועד הנסתר.
          </motion.p>

          <motion.div {...fade(0.24)} className="mt-10 flex flex-wrap items-center gap-3">
            <button onClick={onStart} className="btn btn-primary h-12 px-9 text-base">
              {played ? 'משחק חדש' : 'התחלת משחק'}
            </button>
            <Link to="/guide" className="btn btn-ghost h-12 px-6 text-base">איך משחקים</Link>
          </motion.div>

          <motion.dl {...fade(0.32)} className="mt-12 grid max-w-[460px] grid-cols-3 border-t border-border pt-4">
            {(played
              ? [
                  { label: 'שיא אישי', value: stats.bestScore },
                  { label: 'משחקים', value: stats.gamesPlayed },
                  { label: 'סודות', value: `${stats.secrets.length}/${SECRET_KEYS.length}` },
                ]
              : [
                  { label: 'מילים', value: TOTAL_CARDS },
                  { label: 'דקות', value: GAME_DURATION / 60 },
                  { label: 'סודות', value: SECRET_KEYS.length },
                ]
            ).map((s, i) => (
              <div key={s.label} className={i > 0 ? 'border-r border-border pr-4' : ''}>
                <dt className="label-mono">{s.label}</dt>
                <dd className="display-num mt-2 text-[2.1rem]" dir="ltr" style={{ textAlign: 'right' }}>{s.value}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 1.2 }}>
          <BoardHero />
        </motion.div>
      </section>

      {/* The four depths, as a table of contents */}
      <section aria-labelledby="depth-title" className="mt-24 md:mt-32">
        <motion.div {...inView()} className="grid grid-cols-[minmax(0,1fr)] gap-3 border-b border-foreground/80 pb-4 md:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <p className="label-mono">01 · שיטה</p>
            <h2 id="depth-title" className="mt-3 text-4xl font-extralight sm:text-5xl">ארבע שכבות של קשר</h2>
          </div>
          <p className="max-w-[40ch] self-end text-sm leading-relaxed text-muted-foreground">
            ארבע דרכי הפרשנות המסורתיות, פשט, רמז, דרש וסוד, הופכות כאן ל<mark className="hl">סרגל מדידה של חשיבה</mark>.
          </p>
        </motion.div>

        <ol>
          {LEVEL_ORDER.map((lv, i) => (
            <motion.li
              key={lv}
              {...inView(i * 0.08)}
              className="grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-baseline gap-4 border-b border-border py-6 sm:grid-cols-[3.5rem_11rem_minmax(0,1fr)_auto] sm:gap-8"
            >
              <span className="num-mono text-sm text-muted-foreground" dir="ltr" style={{ textAlign: 'right' }}>0{i + 1}</span>
              <span className="text-3xl font-extralight" style={{ color: levelColor(lv) }}>{LEVEL_NAMES[lv]}</span>
              <div className="col-span-3 col-start-2 row-start-2 sm:col-span-1 sm:col-start-auto sm:row-start-auto">
                <div className="text-base font-normal">{LEVEL_DEFS[lv].title}</div>
                <p className="mt-1 text-sm leading-relaxed text-foreground/80"><Rich text={LEVEL_DEFS[lv].definition} /></p>
                <p className="mt-1.5 text-[0.8rem] text-muted-foreground">מבחן: {plain(LEVEL_DEFS[lv].test)}</p>
              </div>
              <span className="col-start-3 row-start-1 text-left sm:col-start-auto sm:row-start-auto">
                <span className="display-num text-3xl" dir="ltr">{SCORE_VALUES[lv]}</span>
                <span className="label-mono mr-1.5">נק׳</span>
              </span>
            </motion.li>
          ))}
        </ol>
      </section>

      {/* Chain bonus */}
      <section aria-labelledby="chain-title" className="mt-24 grid grid-cols-[minmax(0,1fr)] items-center gap-10 md:grid-cols-2 md:gap-16">
        <motion.div {...inView()}>
          <p className="label-mono">02 · בונוס</p>
          <h2 id="chain-title" className="mt-3 text-4xl font-extralight sm:text-5xl">חיבורי שרשרת</h2>
          <p className="mt-5 max-w-[44ch] text-base leading-relaxed text-muted-foreground">
            כשמחברים א׳ לב׳ ואז ב׳ לג׳, המערכת <mark className="hl">חושפת גם את הקשר הסמוי</mark> בין א׳ לג׳, ומוסיפה עליו
            <span className="text-foreground"> {Math.round(CHAIN_RATIO * 100)}% </span>
            מערכו. מי שבונה שרשרת בתבונה, מכפיל את הניקוד.
          </p>
        </motion.div>
        <motion.div {...inView(0.1)}>
          <ChainDiagram />
        </motion.div>
      </section>

      <motion.div {...inView()} className="mt-24 flex flex-col items-center gap-6 border-t border-border pt-12 text-center">
        <p className="text-2xl font-extralight sm:text-3xl">חמש דקות. עשרים וחמש מילים. שרשרת אחת.</p>
        <button onClick={onStart} className="btn btn-primary h-12 px-10 text-base">{played ? 'משחק חדש' : 'התחלת משחק'}</button>
      </motion.div>
    </main>
  );
}

function ChainDiagram() {
  const nodes = [
    { x: 300, y: 80, l: 'גל', k: 'א׳', i: 4 },
    { x: 170, y: 170, l: 'תו', k: 'ב׳', i: 20 },
    { x: 40, y: 80, l: 'ספר', k: 'ג׳', i: 19 },
  ];
  const draw = (delay: number) => ({
    initial: { pathLength: 0 },
    whileInView: { pathLength: 1 },
    viewport: { once: true },
    transition: { delay, duration: 0.9, ease: [0.4, 0, 0.2, 1] },
  });
  return (
    <div className="panel relative mx-auto w-full max-w-[460px] p-5" aria-hidden="true">
      <div className="label-mono mb-2 flex justify-between border-b border-border pb-2">
        <span>גיליון 02 · חיבור שרשרת</span>
        <span>סוד · סוד · סוד</span>
      </div>
      <svg viewBox="0 0 340 230" className="w-full">
        <motion.path d="M300,80 L170,170" stroke={levelColor('s')} strokeWidth={1.25} fill="none" {...draw(0)} />
        <motion.path d="M170,170 L40,80" stroke={levelColor('s')} strokeWidth={1.25} fill="none" {...draw(0.8)} />
        <motion.path d="M300,80 Q170,0 40,80" stroke="hsl(var(--chain))" strokeWidth={1} strokeDasharray="3 4" fill="none" {...draw(1.6)} />
        <text x="170" y="26" textAnchor="middle" fontSize="11" fill="hsl(var(--chain))" style={{ fontFamily: 'IBM Plex Mono' }}>
          +{Math.round(CHAIN_RATIO * 100)}%
        </text>
        {nodes.map(n => (
          <g key={n.l}>
            <rect x={n.x - 17} y={n.y - 17} width={34} height={34} fill="hsl(var(--surface-1))" stroke="hsl(var(--foreground) / 0.4)" />
            <Glyph i={n.i} x={n.x - 12} y={n.y - 12} size={24} />
            <text x={n.x} y={n.y + 36} textAnchor="middle" fontSize="16" fontWeight={300} fill="hsl(var(--foreground))" style={{ fontFamily: 'IBM Plex Sans Hebrew' }}>{n.l}</text>
            <text x={n.x} y={n.y - 24} textAnchor="middle" fontSize="10" fill="hsl(var(--muted-foreground))" style={{ fontFamily: 'IBM Plex Mono' }}>{n.k}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
