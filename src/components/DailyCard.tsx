import { useState } from 'react';
import { motion } from 'framer-motion';
import { ITEMS } from '../game/gameItems';
import { dailyFor, dateKey } from '../game/daily';
import type { DailyResult } from '../lib/storage';
import { buildDailyShareText, shareText, type ShareOutcome } from '../lib/share';
import Glyph from './Glyph';

/** Today's challenge on the home page: the route, the rule, and the player's result if any. */
export default function DailyCard({ results, onStart }: { results: Record<string, DailyResult>; onStart: () => void }) {
  const today = dailyFor(dateKey());
  const done = results[today.key];
  const [share, setShare] = useState<ShareOutcome | null>(null);

  const onShare = async () => {
    if (!done) return;
    setShare(await shareText(buildDailyShareText(done)));
    setTimeout(() => setShare(null), 2500);
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      aria-labelledby="daily-title"
      className="panel mt-16 grid grid-cols-[minmax(0,1fr)] gap-6 p-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-10 md:p-8"
    >
      <div>
        <p className="label-mono">אתגר יומי · <span className="num-mono">#{today.number}</span></p>
        <h2 id="daily-title" className="mt-2 text-3xl font-extralight sm:text-4xl">
          מ<mark className="hl">{ITEMS[today.start].l}</mark> אל <mark className="hl">{ITEMS[today.target].l}</mark> בחמישה קשרים
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          אותו אתגר לכולם, היום בלבד. <span className="text-foreground">בלי שעון</span>: מה שנמדד הוא העומק. הקשר האחרון חייב לנחות על היעד.
        </p>

        <div className="mt-5 flex items-center gap-2" aria-hidden="true">
          <Glyph i={today.start} size={40} />
          {Array.from({ length: today.links - 1 }, (_, k) => (
            <span key={k} className="flex flex-1 items-center gap-2">
              <span className="h-px flex-1 bg-border" />
              <span className="h-2 w-2 rounded-full border border-muted-foreground/50" />
            </span>
          ))}
          <span className="h-px flex-1 bg-border" />
          <Glyph i={today.target} size={40} />
        </div>
      </div>

      <div className="flex flex-col items-start gap-3 md:items-end">
        {done ? (
          <>
            <div className="text-right md:text-left">
              <div className="label-mono">התוצאה שלכם</div>
              <div className="display-num mt-1 text-5xl" dir="ltr">{done.score}<span className="text-muted-foreground">/{done.best}</span></div>
            </div>
            <div className="flex gap-2">
              <button onClick={onShare} className="btn btn-primary h-11 px-6 text-sm">
                {share === 'copied' ? 'התוצאה הועתקה' : share === 'shared' ? 'שותף' : 'שיתוף'}
              </button>
              <button onClick={onStart} className="btn btn-ghost h-11 px-5 text-sm">לשפר</button>
            </div>
          </>
        ) : (
          <>
            <div className="label-mono">מקסימום היום · <span className="num-mono">{today.best}</span></div>
            <button onClick={onStart} className="btn btn-primary h-12 px-8 text-base">לאתגר היומי</button>
          </>
        )}
      </div>
    </motion.section>
  );
}
