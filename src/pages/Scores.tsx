import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import LearningChart from '../components/LearningChart';
import { trendLine } from '../lib/learning';
import PlayerCode from '../components/PlayerCode';
import Rich from '../components/Rich';

const EASE = [0.4, 0, 0.2, 1] as const;

export default function Scores() {
  const { stats, startGame } = useGame();
  const games = stats.history;
  const totals = [...games].reverse().map(g => g.total);
  const navigate = useNavigate();
  const play = () => { startGame(); navigate('/'); };

  return (
    <main className="mx-auto max-w-[1000px] px-5 pb-20 pt-10 md:pt-20">
      <header className="max-w-[640px]">
        <p className="label-mono flex items-center gap-3"><span className="h-px w-8 bg-foreground/40" />למידה</p>
        <h1 className="mt-6 text-5xl font-thin leading-[0.95] sm:text-7xl">הלמידה שלכם</h1>
        <p className="mt-7 text-xl font-light leading-relaxed text-foreground/80">
          כל משחק נשמר. הגרף מראה <mark className="hl">לאן אתם מתקדמים</mark>, וקוד השחקן מעביר אותו <mark className="hl">לכל מכשיר</mark>.
        </p>
      </header>

      <div className="mt-16 grid grid-cols-[minmax(0,1fr)] gap-16 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        {/* Personal learning graph */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, ease: EASE }} className="border-t border-foreground/80 pt-5">
          <p className="label-mono"><span className="num-mono">01</span> · גרף למידה אישי</p>
          {games.length === 0 ? (
            <div className="mt-4">
              <p className="text-2xl font-extralight">עוד אין משחקים. <mark className="hl">המשחק הראשון</mark> יפתח את הגרף.</p>
              <button onClick={play} className="btn btn-primary mt-6 h-12 px-8 text-base">התחלת משחק</button>
            </div>
          ) : (
            <>
              <h2 className="mb-6 mt-2 text-3xl font-extralight"><Rich text={trendLine(totals)} /></h2>
              <dl className="mb-8 grid grid-cols-3 border-y border-border">
                {[
                  ['משחקים', stats.gamesPlayed],
                  ['שיא', stats.bestScore],
                  ['ממוצע', Math.round(totals.reduce((a, b) => a + b, 0) / Math.max(1, totals.length))],
                ].map(([k, v]) => (
                  <div key={k} className="border-l border-border py-3 pl-3 last:border-l-0">
                    <dt className="label-mono">{k}</dt>
                    <dd className="display-num mt-1 text-4xl" dir="ltr" style={{ textAlign: 'right' }}>{v}</dd>
                  </div>
                ))}
              </dl>
              <LearningChart history={games} />
              <p className="label-mono mt-4">נשמר במכשיר הזה · {games.length} המשחקים האחרונים</p>
            </>
          )}
        </motion.section>

        <PlayerCode />
      </div>
    </main>
  );
}
