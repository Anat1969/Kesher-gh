import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { JoinForm, Leaderboard } from '../components/Competition';
import Rich from '../components/Rich';
import { dailyFor } from '../game/daily';
import { sonResults } from '../game/sons';
import { LEVEL_NAMES, LEVEL_ORDER, levelColor } from '../game/gameItems';
import type { Mode } from '../lib/remote';

const EASE = [0.4, 0, 0.2, 1] as const;

export default function Board() {
  const { player } = useGame();
  const [tab, setTab] = useState<Mode>('classic');
  const [renaming, setRenaming] = useState(false);
  const daily = dailyFor();
  const sons = sonResults();

  return (
    <main className="mx-auto max-w-[1000px] px-5 pb-20 pt-10 md:pt-20">
      <header className="max-w-[640px]">
        <p className="label-mono flex items-center gap-3"><span className="h-px w-8 bg-foreground/40" />טבלה</p>
        <h1 className="mt-6 text-5xl font-thin leading-[0.95] sm:text-7xl">הציון הגבוה של כל משתתף</h1>
        <p className="mt-7 text-xl font-light leading-relaxed text-foreground/80">
          לצד המשתתפים עומדים בטבלה <mark className="hl">ארבעת הבנים מההגדה</mark>. כל אחד מהם הוא <mark className="hl">רמת חשיבה</mark>: לפיהם רואים כמה עמוק הגעתם.
        </p>
      </header>

      <div className="mt-16 grid grid-cols-[minmax(0,1fr)] gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, ease: EASE }} className="border-t border-foreground/80 pt-5">
          <p className="label-mono"><span className="num-mono">01</span> · תחרות</p>
          {!player ? (
            <div className="my-6">
              <p className="mb-3 text-muted-foreground">בחרו כינוי והציונים הבאים ייכנסו לטבלה. <mark className="hl">רק הכינוי והציון</mark> נשמרים.</p>
              <JoinForm />
            </div>
          ) : renaming ? (
            <div className="my-6"><JoinForm cta="שמירה" initial={player.name} onDone={() => setRenaming(false)} /><p className="label-mono mt-2">הכינוי החדש יופיע מהמשחק הבא.</p></div>
          ) : (
            <p className="label-mono my-6">
              משחקים בשם <span className="text-foreground">{player.name}</span> ·{' '}
              <button onClick={() => setRenaming(true)} className="link-draw">שינוי כינוי</button>
            </p>
          )}

          <div role="tablist" aria-label="סוג הטבלה" className="mb-2 grid grid-cols-2 border border-border">
            {([['classic', 'כל הזמנים'], ['daily', `האתגר של היום · #${daily.number}`]] as const).map(([m, label]) => (
              <button
                key={m}
                role="tab"
                aria-selected={tab === m}
                onClick={() => setTab(m)}
                className={`h-11 text-sm transition-colors ${tab === m ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="label-mono mb-3">{tab === 'classic' ? 'משחק רגיל של 5 דקות · שיא אישי לכל משתתף · הבנים בקו מקווקו' : `מקסימום אפשרי היום: ${daily.best}`}</p>
          <div role="tabpanel"><Leaderboard mode={tab} /></div>
        </motion.section>

        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1, duration: 0.8, ease: EASE }} className="border-t border-foreground/80 pt-5">
          <p className="label-mono"><span className="num-mono">02</span> · ארבעה בנים, ארבע רמות</p>
          <h2 className="mb-3 mt-2 text-3xl font-extralight">כל בן רואה עד רמה אחרת</h2>
          <p className="mb-6 text-muted-foreground">
            הציון שלהם <mark className="hl">מחושב, לא מומצא</mark>: כל בן משחק את המשחק האמיתי, בוחר תמיד את הקשר החזק ביותר שהוא מסוגל לראות, ובקצב השאלות שלו.
          </p>
          <ol className="grid grid-cols-[minmax(0,1fr)] gap-0">
            {sons.map((s, i) => (
              <li key={s.id} className="border-b border-border py-6">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-2xl font-light">
                    <span className="num-mono ml-3 text-sm text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
                    {s.name}
                  </h3>
                  <span className="display-num text-4xl" dir="ltr">{s.best}</span>
                </div>
                <blockquote className="mt-3 border-r-2 border-foreground/20 pr-3 text-base font-light">
                  "{s.asks}" <span className="label-mono">· {s.source}</span>
                </blockquote>
                <p className="mt-1 pr-3.5 text-sm text-muted-foreground">התשובה: {s.answer}</p>
                <p className="mt-3 text-base font-light"><Rich text={s.why} /></p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="label-mono">רואה</span>
                  {LEVEL_ORDER.map(lv => {
                    const on = s.sees.includes(lv);
                    return (
                      <span key={lv} className={`text-sm ${on ? '' : 'line-through opacity-35'}`} style={{ color: on ? levelColor(lv) : undefined }}>
                        {LEVEL_NAMES[lv]}
                      </span>
                    );
                  })}
                  <span className="label-mono">· {s.levels.length} קשרים</span>
                </div>
                <div className="mt-2 flex h-1.5 gap-px" aria-label={`הקשרים במשחק הטוב שלו: ${s.levels.map(l => LEVEL_NAMES[l]).join(', ')}`}>
                  {s.levels.map((lv, k) => <span key={k} className="flex-1" style={{ background: levelColor(lv, 0.8) }} />)}
                  {Array.from({ length: 18 - s.levels.length }, (_, k) => <span key={'e' + k} className="flex-1 bg-surface-3" />)}
                </div>
              </li>
            ))}
          </ol>
        </motion.section>
      </div>
    </main>
  );
}
