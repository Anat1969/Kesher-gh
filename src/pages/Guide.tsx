import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LEVEL_NAMES, LEVEL_ORDER, SCORE_VALUES, MILESTONES, CHAIN_RATIO, ITEMS, levelColor } from '../game/gameItems';
import { GAME_DURATION, TOTAL_CARDS } from '../game/engine';
import { evaluate } from '../game/evaluator';
import { LEVEL_INFO } from '../game/levelInfo';
import { useGame } from '../context/GameContext';

const EXAMPLES: Record<string, [number, number]> = { p: [8, 12], r: [1, 7], d: [11, 12], s: [0, 10] };

const STEPS = [
  { n: '01', title: 'פותחים שרשרת', body: 'בוחרים כרטיס ראשון. הוא ראש השרשרת.' },
  { n: '02', title: 'מחברים את הבא', body: 'כל כרטיס חדש מתחבר לכרטיס הנוכחי, והמערכת מסבירה מה הקשר ביניהם ובאיזה עומק.' },
  { n: '03', title: 'ממשיכים עד הסוף', body: `המטרה: כל ${TOTAL_CARDS} הכרטיסים בשרשרת אחת, תוך ${GAME_DURATION / 60} דקות. כרטיס שכבר בשרשרת לא נבחר שוב.` },
  { n: '04', title: 'חושפים סודות', body: 'בין הכרטיסים מוסתרים זוגות עם סוד אמיתי מהמדע, מהתרבות או מהמיתוס. כל סוד שנחשף נשמר באוסף.' },
];

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-30px' },
  transition: { delay, duration: 0.5, ease: [0.2, 0.8, 0.2, 1] },
});

export default function Guide() {
  const { state, startGame } = useGame();
  const inGame = state.screen === 'game';

  return (
    <main className="mx-auto max-w-[900px] px-4 pb-16 pt-8 md:pt-12">
      <header className="max-w-[640px]">
        <p className="label-mono mb-3">מדריך</p>
        <h1 className="text-5xl sm:text-6xl font-thin leading-[0.95]">איך משחקים בקשר</h1>
        <p className="mt-4 text-lg font-light leading-relaxed text-foreground/85">
          קשר הוא משחק על עומק החשיבה. לא מספיק למצוא קשר, המערכת מודדת כמה הוא עמוק: מהגלוי ועד הנסתר.
          ארבע הרמות לקוחות מדרכי הפרשנות המסורתיות: פשט, רמז, דרש וסוד.
        </p>
      </header>

      <section aria-label="שלבי המשחק" className="mt-10 grid gap-px overflow-hidden rounded-md border border-border bg-border shadow-md sm:grid-cols-2">
        {STEPS.map((s, i) => (
          <motion.div key={s.n} {...reveal(i * 0.06)} className="bg-gradient-to-b from-surface-1 to-surface-2 p-5 sm:p-6">
            <div className="font-mono text-sm text-muted-foreground" dir="ltr">{s.n}</div>
            <h2 className="mt-2 text-xl font-light">{s.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </motion.div>
        ))}
      </section>

      <section aria-labelledby="levels-title" className="mt-14">
        <p className="label-mono mb-2">ארבע הרמות</p>
        <h2 id="levels-title" className="text-3xl sm:text-4xl font-extralight">מהגלוי אל הנסתר</h2>
        <div className="mt-6 grid gap-4">
          {LEVEL_ORDER.map((lv, i) => {
            const [a, b] = EXAMPLES[lv];
            const ev = evaluate(a, b);
            return (
              <motion.article key={lv} {...reveal(i * 0.05)} className="panel relative overflow-hidden p-5 sm:p-6" style={{ marginInlineStart: `${i * 0.75}rem` }}>
                <span className="absolute inset-y-0 right-0 w-1" style={{ background: levelColor(lv) }} />
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div className="flex items-baseline gap-3">
                    <h3 className="text-3xl font-light" style={{ color: levelColor(lv) }}>{LEVEL_NAMES[lv]}</h3>
                    <span className="text-base font-medium">{LEVEL_INFO[lv].title}</span>
                  </div>
                  <span className="label-mono"><span className="display-num text-2xl" style={{ color: levelColor(lv) }} dir="ltr">{SCORE_VALUES[lv]}</span> נקודות</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{LEVEL_INFO[lv].desc}. {LEVEL_INFO[lv].examples}</p>
                <div className="well mt-4 flex items-start gap-3 p-3.5">
                  <span className="whitespace-nowrap text-2xl" aria-hidden="true">{ITEMS[a].e}{ITEMS[b].e}</span>
                  <div className="min-w-0">
                    <div className="label-mono mb-1">דוגמה: {ITEMS[a].l} ו{ITEMS[b].l}</div>
                    <p className="text-sm leading-relaxed text-foreground/85">{ev.exp}</p>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="score-title" className="mt-14 grid gap-4 md:grid-cols-2">
        <motion.div {...reveal()} className="panel p-5 sm:p-6">
          <p className="label-mono mb-1">בונוס</p>
          <h2 id="score-title" className="text-2xl font-extralight">חיבורי שרשרת</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            חיבור א׳ לב׳ ואז ב׳ לג׳ חושף גם את הקשר הסמוי בין א׳ לג׳. הוא מצטרף לניקוד בשווי
            <span className="font-medium text-foreground"> {Math.round(CHAIN_RATIO * 100)}% </span>
            מערכו, ומופיע על הלוח כקו מקווקו.
          </p>
        </motion.div>
        <motion.div {...reveal(0.06)} className="panel p-5 sm:p-6">
          <p className="label-mono mb-1">אבני דרך</p>
          <h2 className="text-2xl font-extralight">לאן אפשר להגיע</h2>
          <ol className="mt-3 space-y-1.5">
            {MILESTONES.map(m => (
              <li key={m.pts} className="flex items-baseline justify-between border-b border-dashed border-border pb-1.5 text-sm last:border-b-0">
                <span>{m.lbl}</span>
                <span className="font-mono text-muted-foreground" dir="ltr">{m.pts}</span>
              </li>
            ))}
          </ol>
        </motion.div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <motion.div {...reveal()} className="panel p-5 sm:p-6">
          <p className="label-mono mb-1">מקלדת</p>
          <h2 className="text-2xl font-extralight">משחק בלי עכבר</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Tab עובר אל הלוח, החצים זזים בין הכרטיסים, Enter בוחר. Escape סוגר את חלון ההשהיה.</p>
        </motion.div>
        <motion.div {...reveal(0.06)} className="panel p-5 sm:p-6">
          <p className="label-mono mb-1">טיפ</p>
          <h2 className="text-2xl font-extralight">לחשוב בתהליכים</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">צבע וצורה נותנים פשט. תהליך משותף, כמו צמיחה, לחץ או מחזוריות, מוביל לדרש. סתירה שמתגלה כאמת היא כמעט תמיד סוד.</p>
        </motion.div>
      </section>

      <div className="mt-12 flex justify-center">
        {inGame
          ? <Link to="/" className="btn btn-primary h-14 px-10 text-lg">חזרה למשחק</Link>
          : <Link to="/" onClick={startGame} className="btn btn-primary h-14 px-10 text-lg">התחילו לשחק</Link>}
      </div>
    </main>
  );
}
