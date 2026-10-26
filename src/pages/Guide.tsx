import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LEVEL_NAMES, LEVEL_ORDER, SCORE_VALUES, MILESTONES, CHAIN_RATIO, ITEMS, levelColor } from '../game/gameItems';
import { GAME_DURATION, TOTAL_CARDS } from '../game/engine';
import { evaluate } from '../game/evaluator';
import { LEVEL_DEFS } from '../game/levelInfo';
import { useGame } from '../context/GameContext';

const STEPS = [
  { title: 'פותחים שרשרת', body: 'בוחרים מילה ראשונה. היא ראש השרשרת.' },
  { title: 'מחברים את הבאה', body: 'כל מילה חדשה מתחברת לנוכחית. המערכת מסבירה מה הקשר ביניהן, ובאיזה עומק.' },
  { title: 'ממשיכים עד הסוף', body: `המטרה: כל ${TOTAL_CARDS} המילים בשרשרת אחת, תוך ${GAME_DURATION / 60} דקות. מילה שכבר בשרשרת לא נבחרת שוב.` },
  { title: 'חושפים סודות', body: 'בין המילים מוסתרים זוגות עם סוד אמיתי מהמדע, מהתרבות או מהמיתוס. כל סוד שנחשף נשמר באוסף.' },
];

const EASE = [0.4, 0, 0.2, 1] as const;
const inView = (delay = 0) => ({
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: '-30px' },
  transition: { delay, duration: 0.8, ease: EASE },
});

const pad2 = (n: number) => String(n).padStart(2, '0');

function Heading({ n, kicker, title }: { n: string; kicker: string; title: string }) {
  return (
    <div className="border-b border-foreground/80 pb-4">
      <p className="label-mono"><span className="num-mono">{n}</span> · {kicker}</p>
      <h2 className="mt-3 text-4xl font-extralight">{title}</h2>
    </div>
  );
}

export default function Guide() {
  const { state, startGame } = useGame();
  const inGame = state.screen === 'game';

  return (
    <main className="mx-auto max-w-[920px] px-5 pb-20 pt-10 md:pt-20">
      <header className="max-w-[640px]">
        <p className="label-mono flex items-center gap-3"><span className="h-px w-8 bg-foreground/40" />מדריך</p>
        <h1 className="mt-6 text-5xl font-thin leading-[0.95] sm:text-7xl">איך משחקים בקשר</h1>
        <p className="mt-7 text-xl font-light leading-relaxed text-foreground/80">
          קשר הוא משחק על עומק החשיבה. לא מספיק למצוא קשר; המערכת מודדת כמה הוא עמוק, מהגלוי ועד הנסתר.
        </p>
      </header>

      <section aria-label="שלבי המשחק" className="mt-20">
        <Heading n="01" kicker="מהלך" title="ארבעה צעדים" />
        <ol className="grid grid-cols-[minmax(0,1fr)] sm:grid-cols-2">
          {STEPS.map((s, i) => (
            <motion.li key={s.title} {...inView(i * 0.06)} className={`grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 border-b border-border py-6 ${i % 2 === 0 ? 'sm:pl-8' : 'sm:border-r sm:pr-8'}`}>
              <span className="num-mono text-sm text-muted-foreground" dir="ltr" style={{ textAlign: 'right' }}>{pad2(i + 1)}</span>
              <div>
                <h3 className="text-xl font-light">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="levels-title" className="mt-20">
        <Heading n="02" kicker="ארבע הרמות" title="מהגלוי אל הנסתר" />
        <div>
          {LEVEL_ORDER.map((lv, i) => {
            const def = LEVEL_DEFS[lv];
            const [a, b] = def.example;
            const ev = evaluate(a, b);
            return (
              <motion.article key={lv} {...inView(i * 0.05)} className="grid grid-cols-[minmax(0,1fr)] gap-5 border-b border-border py-10 md:grid-cols-[12rem_minmax(0,1fr)] md:gap-10">
                <div>
                  <span className="num-mono text-sm text-muted-foreground">0{i + 1}</span>
                  <h3 className="mt-1 text-5xl font-extralight" style={{ color: levelColor(lv) }}>{LEVEL_NAMES[lv]}</h3>
                  <div className="mt-1 text-base">{def.title}</div>
                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="display-num text-2xl" dir="ltr">{SCORE_VALUES[lv]}</span>
                    <span className="label-mono">נקודות</span>
                  </div>
                </div>
                <div>
                  <dl className="grid grid-cols-[minmax(0,1fr)] gap-4">
                    <div>
                      <dt className="label-mono mb-1">הגדרה</dt>
                      <dd className="text-xl font-light leading-snug">{def.definition}</dd>
                    </div>
                    <div className="border-r-2 pr-3" style={{ borderColor: levelColor(lv) }}>
                      <dt className="label-mono mb-1">שאלת המבחן</dt>
                      <dd className="text-base">{def.test}</dd>
                    </div>
                    <div>
                      <dt className="label-mono mb-1.5">סימנים</dt>
                      <dd>
                        <ul className="space-y-1">
                          {def.signs.map(sg => (
                            <li key={sg} className="flex items-baseline gap-2.5 text-sm">
                              <span className="h-px w-3 flex-shrink-0 translate-y-[-3px]" style={{ background: levelColor(lv) }} />
                              {sg}
                            </li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                    <div>
                      <dt className="label-mono mb-1">מה זה לא</dt>
                      <dd className="text-sm text-muted-foreground">{def.notThis}</dd>
                    </div>
                  </dl>
                  <blockquote className="well mt-5 p-4">
                    <div className="label-mono mb-1.5">דוגמה · {ITEMS[a].l} ו{ITEMS[b].l}</div>
                    <p className="text-sm leading-relaxed text-foreground/85">{ev.exp}</p>
                  </blockquote>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="grading-title" className="mt-20">
        <Heading n="03" kicker="איך נקבעת הדרגה" title="קריאות, ולא תשובה אחת" />
        <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-8 md:grid-cols-3">
          {[
            { t: 'כמה קריאות לכל זוג', b: 'המערכת קוראת כל זוג בכל הצירים: תכונה גלויה, סמל, עיקרון, אנלוגיה, פרדוקס ותגלית. כל ציר נותן קריאה בדרגה אחרת.' },
            { t: 'הדרגה היא העמוקה המוצדקת', b: 'הניקוד ניתן לפי הקריאה העמוקה ביותר שעומדת בשאלת המבחן של הדרגה שלה. ליד כל קריאה מופיע הנימוק.' },
            { t: 'אתם מחליטים למה התכוונתם', b: 'אם ראיתם קשר אחר, בחרו אותו או כתבו אותו במילים שלכם. הניקוד לא יורד, והבחירה שלכם קובעת את פרופיל סגנון החשיבה.' },
          ].map((x, i) => (
            <motion.div key={x.t} {...inView(i * 0.06)} className="border-t border-border pt-4">
              <span className="num-mono text-sm text-muted-foreground" dir="ltr">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-1 text-xl font-light">{x.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{x.b}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mt-20 grid grid-cols-[minmax(0,1fr)] gap-14 md:grid-cols-2 md:gap-10">
        <motion.div {...inView()}>
          <Heading n="04" kicker="בונוס" title="חיבורי שרשרת" />
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            חיבור א׳ לב׳ ואז ב׳ לג׳ חושף גם את הקשר הסמוי בין א׳ לג׳. הוא מצטרף לניקוד בשווי
            <span className="text-foreground"> {Math.round(CHAIN_RATIO * 100)}% </span>
            מערכו, ומופיע על הלוח כקו מקווקו.
          </p>
        </motion.div>
        <motion.div {...inView(0.06)}>
          <Heading n="05" kicker="סולם" title="אבני דרך" />
          <ol>
            {MILESTONES.map(m => (
              <li key={m.pts} className="flex items-baseline justify-between border-b border-border py-2.5 text-sm">
                <span>{m.lbl}</span>
                <span className="num-mono text-muted-foreground" dir="ltr">{m.pts}</span>
              </li>
            ))}
          </ol>
        </motion.div>
      </section>

      <section className="mt-14 grid grid-cols-[minmax(0,1fr)] gap-14 md:grid-cols-2 md:gap-10">
        <motion.div {...inView()}>
          <Heading n="06" kicker="מקלדת" title="משחק בלי עכבר" />
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">Tab עובר אל הלוח, החצים זזים בין המילים, Enter בוחר. Escape סוגר את חלון ההשהיה.</p>
        </motion.div>
        <motion.div {...inView(0.06)}>
          <Heading n="07" kicker="עצה" title="לחשוב בתהליכים" />
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">צבע וצורה נותנים פשט. תהליך משותף, כמו צמיחה, לחץ או מחזוריות, מוביל לדרש. סתירה שמתגלה כאמת היא כמעט תמיד סוד.</p>
        </motion.div>
      </section>

      <div className="mt-20 flex justify-center border-t border-border pt-12">
        {inGame
          ? <Link to="/" className="btn btn-primary h-12 px-10 text-base">חזרה למשחק</Link>
          : <Link to="/" onClick={startGame} className="btn btn-primary h-12 px-10 text-base">התחלת משחק</Link>}
      </div>
    </main>
  );
}
