import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ITEMS, LEVEL_NAMES, LEVEL_ORDER, levelColor, type Level } from '../game/gameItems';
import { evaluate, readingsFor, secretEntries, type Reading } from '../game/evaluator';
import { LEVEL_DEFS } from '../game/levelInfo';
import { RELATION_GROUPS } from '../game/relationTypes';
import { LEXICON } from '../game/lexicon';
import { SONS, STANDING } from '../game/sons';
import ArticleSheet from '../components/ArticleSheet';
import { TOPICS, type ArticleTopic } from '../lib/articleTopics';
import Glyph from '../components/Glyph';
import Rich from '../components/Rich';
import { plain } from '../lib/marker';

const EASE = [0.23, 1, 0.32, 1] as const;
const idOf = (name: string) => ITEMS.findIndex(i => i.l === name);
const strip = (s: string) => s.replace(/^[^—]*—\s*/, '');
const firstSentence = (s: string) => (plain(s).match(/^.+?[.!?](\s|$)/)?.[0] ?? plain(s)).trim();

/** Two glyphs joined by a line in the colour of their connection. */
function Pair({ a, b, label }: { a: number; b: number; label?: string }) {
  const ev = evaluate(a, b);
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex items-center gap-2">
        <Glyph i={a} size={40} />
        <span className="h-[2px] w-8" style={{ background: levelColor(ev.lv) }} />
        <Glyph i={b} size={40} />
      </div>
      <p className="text-xs">{ITEMS[a].l} · {ITEMS[b].l}</p>
      <p className="label-mono" style={{ color: levelColor(ev.lv) }}>{label ?? LEVEL_NAMES[ev.lv]}</p>
    </div>
  );
}

// ── Figures ──

function FigureThreePairs() {
  const pairs: [string, string][] = [['נבט', 'ברק'], ['גל', 'תו'], ['יהלום', 'רעיון']];
  return (
    <div className="flex flex-wrap justify-around gap-5">
      {pairs.map(([a, b]) => <Pair key={a} a={idOf(a)} b={idOf(b)} />)}
    </div>
  );
}

/** One pair read on all four floors, drawn as a building section: the surface on top, the secret at the bottom. */
function FigureSection() {
  const a = idOf('שמש'), b = idOf('אש');
  const byLevel = new Map<Level, Reading>();
  for (const r of readingsFor(a, b)) if (!byLevel.has(r.lv)) byLevel.set(r.lv, r);
  return (
    <div>
      <div className="mb-3 flex items-center justify-center gap-3">
        <Glyph i={a} size={36} /><span className="text-sm">{ITEMS[a].l} ו{ITEMS[b].l}</span><Glyph i={b} size={36} />
      </div>
      <ol className="grid grid-cols-[minmax(0,1fr)]">
        {LEVEL_ORDER.map((lv, k) => {
          const r = byLevel.get(lv);
          return (
            <li key={lv} className={`grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3 py-2 ${k === 0 ? 'border-b-2 border-foreground/70' : 'border-b border-dashed border-foreground/25'}`}>
              <span>
                <span className="block text-sm" style={{ color: levelColor(lv) }}>{LEVEL_NAMES[lv]}</span>
                <span className="label-mono">{k === 0 ? 'פני השטח' : `קומה ‎-${k}`}</span>
              </span>
              <span className="text-sm">
                {r ? <><span className="font-normal">{strip(r.sub)}</span>. <span className="text-muted-foreground">{firstSentence(r.insight ?? r.exp)}</span></> : <span className="text-muted-foreground">אין קריאה ברמה הזו לזוג הזה.</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function FigureFamilies() {
  const groups = RELATION_GROUPS.filter(g => g.id !== 'personal');
  return (
    <ol className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
      {groups.map((g, i) => (
        <li key={g.id} className="border-b border-foreground/20 pb-2">
          <p className="flex items-baseline gap-2">
            <span className="num-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
            <span className="font-normal">{g.name}</span>
            <span className="flex gap-1">{g.levels.map(lv => <span key={lv} className="inline-block h-2 w-2 rounded-full" style={{ background: levelColor(lv) }} title={LEVEL_NAMES[lv]} />)}</span>
          </p>
          <p className="text-xs text-muted-foreground">{g.types[0].example}</p>
        </li>
      ))}
    </ol>
  );
}

function FigureSons() {
  return (
    <ol className="grid grid-cols-[minmax(0,1fr)]">
      {SONS.map((s, i) => (
        <li key={s.id} className="grid grid-cols-[minmax(0,1fr)_auto_3rem] items-center gap-3 border-b border-foreground/20 py-2">
          <span className="text-base font-light">{s.name}</span>
          <span className="flex gap-1">
            {LEVEL_ORDER.map(lv => (
              <span key={lv} className="inline-block h-2.5 w-6" style={{ background: s.sees.includes(lv) ? levelColor(lv) : 'hsl(var(--surface-3))' }} title={LEVEL_NAMES[lv]} />
            ))}
          </span>
          <span className="num-mono text-sm" dir="ltr">{STANDING.classic[i]}</span>
        </li>
      ))}
    </ol>
  );
}

/** A random pair joined only through a third card: the player guesses, then reveals. */
function FigureThirdWord() {
  const pick = () => {
    for (let n = 0; n < 400; n++) {
      const a = Math.floor(Math.random() * ITEMS.length), b = Math.floor(Math.random() * ITEMS.length);
      if (a === b) continue;
      const r = readingsFor(a, b)[0];
      if (r?.key !== 'bridge') continue;
      const via = idOf(r.sub.replace(/^.*דרך\s+/, '').trim());
      if (via >= 0) return { a, b, via, r };
    }
    return null;
  };
  const [p, setP] = useState(pick);
  const [shown, setShown] = useState(false);
  if (!p) return null;
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-3">
        <div className="text-center"><Glyph i={p.a} size={46} /><p className="text-xs">{ITEMS[p.a].l}</p></div>
        <span className="h-px w-6 bg-foreground/40" />
        <motion.div key={`${p.via}-${shown}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2, ease: EASE }}
          className="flex h-[70px] w-[70px] flex-col items-center justify-center border border-dashed border-foreground/50">
          {shown ? <><Glyph i={p.via} size={40} /><p className="text-xs">{ITEMS[p.via].l}</p></> : <span className="text-2xl font-thin">?</span>}
        </motion.div>
        <span className="h-px w-6 bg-foreground/40" />
        <div className="text-center"><Glyph i={p.b} size={46} /><p className="text-xs">{ITEMS[p.b].l}</p></div>
      </div>
      {shown && <p className="max-w-[46ch] text-center text-sm"><Rich text={p.r.insight ?? ''} /></p>}
      <div className="no-print flex gap-2">
        <button type="button" onClick={() => setShown(s => !s)} className="btn btn-primary h-10 px-4 text-sm">{shown ? 'הסתרת הגשר' : 'חשיפת הגשר'}</button>
        <button type="button" onClick={() => { setP(pick()); setShown(false); }} className="btn btn-ghost h-10 px-4 text-sm">זוג אחר</button>
      </div>
    </div>
  );
}

function FigureSecrets() {
  const all = secretEntries();
  const keys = [['נבט', 'ברק'], ['דבורה', 'מחול'], ['אבן', 'ספר'], ['דבורה', 'פאזל']]
    .map(([x, y]) => all.find(e => (e.a === idOf(x) && e.b === idOf(y)) || (e.a === idOf(y) && e.b === idOf(x))))
    .filter(Boolean) as ReturnType<typeof secretEntries>;
  return (
    <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {keys.map(e => (
        <li key={e.key} className="flex gap-3">
          <span className="flex flex-shrink-0 items-center gap-1"><Glyph i={e.a} size={28} /><Glyph i={e.b} size={28} /></span>
          <span className="text-sm">
            <span className="block font-normal" style={{ color: levelColor('s') }}>{strip(e.ev.sub)}</span>
            <span className="text-muted-foreground">{firstSentence(e.ev.exp)}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

// ── The articles ──

interface Article {
  topic: ArticleTopic;
  title: string;
  insight: string;
  quote: { text: string; who: string; where: string };
  body: string[];
  figure: () => JSX.Element | null;
  figureCaption: string;
  lines: [string, string, string];
}

const ARTICLES: Article[] = [
  {
    topic: 'explain',
    title: 'לחבר שתי מילים זה לחשוב',
    insight: '**יצירתיות היא חיבור** בין דברים רחוקים.',
    quote: { text: 'יצירתיות היא פשוט לחבר דברים.', who: 'סטיב ג׳ובס (Steve Jobs)', where: 'ראיון למגזין Wired, 1996' },
    body: [
      'ב-1950 קרא הפסיכולוג ג׳וי פול גילפורד (Joy Paul Guilford), בנאום לאגודה הפסיכולוגית האמריקנית, לחקור יצירתיות כיכולת שאפשר למדוד ולאמן. בהמשך תיאר **חשיבה מתפצלת**: היכולת להפיק תשובות רבות לשאלה אחת.',
      'ב-1962 הציע שרנוף מדניק (Sarnoff Mednick) שיצירתיות היא **חיבור בין רעיונות רחוקים**. ארתור קסטלר (Arthur Koestler) קרא לזה ב-1964 "ביסוציאציה": מפגש של שתי מסגרות חשיבה שלא נפגשו קודם.',
      'כל בחירה במשחק היא תרגיל כזה. הקריאה מראה **כמה עמוק הגעתם**, והשרשרת מחייבת להמשיך מהמילה שבה עצרתם, ולא מהמילה הנוחה.',
    ],
    figure: FigureThreePairs,
    figureCaption: 'שלושה זוגות מהמשחק, וצבע הקו לפי עומק הקשר.',
    lines: ['שתי מילים על השולחן', 'ביניהן חוט שלא נראה', 'עד שמושכים בו'],
  },
  {
    topic: 'explain',
    title: 'ארבעה בנים, ארבע דרכים לשאול',
    insight: '**השאלה קובעת** עד איזה עומק תגיעו.',
    quote: { text: 'כנגד ארבעה בנים דיברה תורה.', who: 'ההגדה של פסח', where: 'פרק ארבעת הבנים' },
    body: [
      'ההגדה מתארת ארבעה בנים שונים, ולכל אחד תשובה לפי השאלה שלו. במשחק כל בן הוא **רמת קריאה**: מה הוא מסוגל לראות בין שתי מילים.',
      'שאינו יודע לשאול רואה רק את הגלוי. התם רואה גם סמל. הרשע מנתח את השיטה כולה, אבל עומד בחוץ ולא מגיע לסוד. החכם **רואה את ארבע הרמות**.',
      'הציונים שלהם בטבלה אינם מומצאים: כל בן משחק את המשחק האמיתי, מוגבל לרמות שהוא רואה, ובקצב השאלות שלו.',
    ],
    figure: FigureSons,
    figureCaption: 'הרמות שכל בן רואה, וציונו בלוח הקלאסי.',
    lines: ['מה זאת, שאל התם', 'החכם שאל עד הסוף', 'ושניהם צדקו'],
  },
  {
    topic: 'types',
    title: 'ארבע קומות של קריאה',
    insight: '**אותו זוג**, ארבעה עומקים שונים.',
    quote: { text: 'ארבעה נכנסו בפרדס.', who: 'התלמוד הבבלי', where: 'חגיגה יד ע״ב' },
    body: [
      'פרשני ימי הביניים קראו כל פסוק בארבע שכבות: **פשט, רמז, דרש וסוד**. ראשי התיבות פרד״ס מופיעים בכתבים של המאה ה-13, בחוג של ספר הזוהר.',
      `המשחק מודד בסולם הזה קשר בין שתי מילים. ${plain(LEVEL_DEFS.p.definition)} ${plain(LEVEL_DEFS.s.definition)}`,
      'אפשר לקרוא אותו זוג בכל הקומות. הניקוד ניתן לפי הקריאה העמוקה ביותר שעומדת בהגדרה, ו**הבחירה שלכם בקריאה אחרת** נכנסת לפרופיל החשיבה.',
    ],
    figure: FigureSection,
    figureCaption: 'חתך: שמש ואש, מפני השטח ועד הסוד.',
    lines: ['אש בשמש, אור בעין', 'מתחת לפני השטח', 'אותה בעירה'],
  },
  {
    topic: 'types',
    title: 'שבע משפחות של קשר',
    insight: 'קשר אינו אחד: **יש לו משפחות**.',
    quote: { text: 'נראה לי שיש רק שלושה עקרונות של חיבור בין רעיונות: דמיון, סמיכות בזמן או במקום, וסיבה ותוצאה.', who: 'דייוויד יום (David Hume)', where: 'מחקר על שכל האדם, 1748' },
    body: [
      'אריסטו כתב בחיבור "על הזיכרון וההיזכרות" שזיכרון אחד מעלה אחר דרך **דמיון, ניגוד או סמיכות**. יום הוסיף סיבה ותוצאה, ופירס (Charles Sanders Peirce) מיין סימנים לאיקון, אינדקס וסמל.',
      'ב-1956 תיאר רומן יאקובסון (Roman Jakobson) שני צירים בשפה: **מטאפורה**, קשר של דמיון, ו**מטונימיה**, קשר של סמיכות.',
      'המשחק מקבץ את כל אלה לשבע משפחות. הן אינן מדורגות: כל משפחה נוטה להגיע לעומקים אחרים, כמו שמסמנות הנקודות.',
    ],
    figure: FigureFamilies,
    figureCaption: 'שבע המשפחות, דוגמה לכל אחת, והעומקים שאליהם היא מגיעה.',
    lines: ['דומה, מנוגד, סמוך', 'גורם, שייך, נאמר, מסמל', 'שבע דלתות לחדר אחד'],
  },
  {
    topic: 'creative',
    title: 'המילה השלישית',
    insight: 'כשאין חוט ישיר, **מחפשים גשר**.',
    quote: { text: 'משחק צירופים נראה כתכונה המהותית של מחשבה יוצרת.', who: 'אלברט איינשטיין (Albert Einstein)', where: 'מכתב לז׳אק הדמר (Jacques Hadamard), 1945' },
    body: [
      'במבחן של מדניק מקבלים שלוש מילים ומחפשים רביעית שמחברת את שלושתן. ההנחה שלו: מי שמגיע **לאסוציאציה רחוקה** חושב בצורה יוצרת יותר.',
      'במשחק, כשאין בין שתי מילים קשר ישיר, הקריאה מחפשת **מילה שלישית** שמתחברת לשתיהן. זה קשר עקיף, ולכן הוא לא עולה מעל רמז.',
      'נסו לנחש את הגשר לפני שחושפים אותו. הניחוש הוא התרגיל.',
    ],
    figure: FigureThirdWord,
    figureCaption: 'זוג אקראי מתוך 50 המילים, שמתחבר רק דרך מילה שלישית.',
    lines: ['בין שתי גדות', 'מילה אחת מונחת', 'ואפשר לעבור'],
  },
  {
    topic: 'creative',
    title: 'כשהסוד מתגלה במדע',
    insight: 'סוד הוא **עובדה מפתיעה ונכונה**.',
    quote: { text: 'הטבע אוהב להסתתר.', who: 'הרקליטוס (Heraclitus)', where: 'קטע 123' },
    body: [
      'במשחק, סוד אינו "קשר עמוק" כללי. הוא ניתן רק כשיש **עובדה מתועדת** שמחברת את שתי המילים, או פרדוקס ששתיהן חולקות.',
      'מאחורי כל סוד יש ממצא: ניסוי של מילר ויורי, ריקוד הדבורים שפענח קרל פון פריש (Karl von Frisch), אבן רוזטה (Rosetta Stone), וההוכחה של תומס הייל (Thomas Hales) לחלות הדבש.',
      'כל סוד שמגלים נשמר **באוסף הסודות**, ונשאר שם גם במשחקים הבאים.',
    ],
    figure: FigureSecrets,
    figureCaption: 'ארבעה סודות מהמאגר, כל אחד עם הממצא שמאחוריו.',
    lines: ['ברק פגש נבט', 'במעבדה, לפני יותר משבעים שנה', 'החיים חיכו לניצוץ'],
  },
];

/** A new article from the pool: a random pair, read on every level the game knows. */
function makeArticle(): Article {
  for (let n = 0; n < 500; n++) {
    const a = Math.floor(Math.random() * ITEMS.length), b = Math.floor(Math.random() * ITEMS.length);
    if (a === b) continue;
    const rs = readingsFor(a, b);
    if (!rs[0] || rs[0].lv === 'p' || rs[0].key === 'bridge') continue;
    const top = rs[0];
    const others = rs.slice(1, 4);
    return {
      topic: 'creative',
      title: `${ITEMS[a].l} ו${ITEMS[b].l}`,
      insight: top.insight ? firstSentence(top.insight) : `**${strip(top.sub)}**.`,
      quote: { text: LEXICON[a].par, who: `הפרדוקס של ${ITEMS[a].l}`, where: 'מתוך מילון המשחק' },
      body: [
        `**${ITEMS[a].l}**: ${LEXICON[a].essence} **${ITEMS[b].l}**: ${LEXICON[b].essence}`,
        `הקריאה העמוקה: ${strip(top.sub)}. ${plain(top.why)}`,
        others.length ? `קריאות נוספות: ${others.map(r => `${strip(r.sub)} (${LEVEL_NAMES[r.lv]})`).join(', ')}.` : 'לזוג הזה יש קריאה אחת בלבד.',
      ],
      figure: () => (
        <div className="flex flex-col items-center gap-3">
          <Pair a={a} b={b} label={`${LEVEL_NAMES[top.lv]} · ${strip(top.sub)}`} />
          <ol className="w-full">
            {rs.slice(0, 4).map(r => (
              <li key={r.key} className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-2 border-b border-foreground/15 py-1 text-sm">
                <span style={{ color: levelColor(r.lv) }}>{LEVEL_NAMES[r.lv]}</span>
                <span>{strip(r.sub)}</span>
              </li>
            ))}
          </ol>
        </div>
      ),
      figureCaption: 'כל הקריאות שהמשחק מכיר לזוג הזה, מהעמוקה ביותר.',
      lines: [`${ITEMS[a].l}, ${LEXICON[a].proc}`, strip(top.sub), `${ITEMS[b].l}, ${LEXICON[b].proc}`],
    };
  }
  return ARTICLES[0];
}

export default function Articles() {
  const [topic, setTopic] = useState<ArticleTopic | 'all'>('all');
  const [made, setMade] = useState<Article | null>(null);
  const list = useMemo(() => ARTICLES.filter(a => topic === 'all' || a.topic === topic), [topic]);

  /** Prints one sheet: every other sheet is hidden for the print. */
  const print = (no: number) => {
    document.body.dataset.printSheet = String(no);
    const done = () => { delete document.body.dataset.printSheet; window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    window.print();
  };

  return (
    <main className="mx-auto max-w-[900px] px-4 pb-20 pt-10 md:pt-16">
      <header className="no-print max-w-[640px]">
        <p className="label-mono flex items-center gap-3"><span className="h-px w-8 bg-foreground/40" />כתבות</p>
        <h1 className="mt-6 text-5xl font-thin leading-[0.95] sm:text-7xl">כוחו של קשר</h1>
        <p className="mt-6 text-xl font-light leading-relaxed text-foreground/80">
          שש כתבות על מה שקורה בראש כשמחברים שתי תמונות: <mark className="hl">למה זה מאמן חשיבה</mark>, אילו סוגי קשרים יש, ואיך נולד <mark className="hl">קשר יצירתי</mark>.
        </p>
      </header>

      <div className="no-print sticky top-[calc(var(--bar-h)+env(safe-area-inset-top))] z-10 -mx-4 mt-10 bg-background/90 px-4 py-3 backdrop-blur">
        <div role="tablist" aria-label="נושא" className="grid grid-cols-4 gap-1.5">
          {([{ id: 'all', label: 'הכול', short: 'הכול' }, ...TOPICS] as { id: ArticleTopic | 'all'; label: string; short: string }[]).map(t => (
            <button key={t.id} role="tab" aria-selected={topic === t.id} onClick={() => setTopic(t.id)}
              className={`btn h-11 text-sm ${topic === t.id ? 'btn-primary' : 'btn-ghost'}`}>
              <span className="sm:hidden">{t.short}</span><span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>
        <p className="label-mono mt-2">{topic === 'all' ? `${ARTICLES.length} כתבות, כל אחת גיליון A4` : TOPICS.find(t => t.id === topic)?.lead}</p>
      </div>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-10">
        {list.map(a => {
          const no = ARTICLES.indexOf(a) + 1;
          const Fig = a.figure;
          return (
            <motion.div key={a.title} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2, ease: EASE }}>
              <ArticleSheet no={no} of={ARTICLES.length} topic={a.topic} title={a.title} insight={a.insight} quote={a.quote}
                body={a.body} figure={<Fig />} figureCaption={a.figureCaption} lines={a.lines} onPrint={() => print(no)} />
            </motion.div>
          );
        })}

        {(topic === 'all' || topic === 'creative') && (
          <section className="grid grid-cols-[minmax(0,1fr)] gap-4">
            <div className="no-print flex flex-wrap items-center justify-between gap-3 border-t border-foreground/80 pt-5">
              <div>
                <p className="label-mono">כתבה מהמאגר</p>
                <p className="mt-1 text-lg font-light">זוג אקראי מתוך {ITEMS.length} המילים, וכל מה שהמשחק יודע עליו.</p>
              </div>
              <button type="button" onClick={() => setMade(makeArticle())} className="btn btn-primary h-12 px-6 text-base">
                {made ? 'כתבה חדשה' : 'יצירת כתבה'}
              </button>
            </div>
            {made && (() => {
              const Fig = made.figure;
              return (
                <ArticleSheet no={ARTICLES.length + 1} of={ARTICLES.length + 1} topic={made.topic} title={made.title} insight={made.insight}
                  quote={made.quote} body={made.body} figure={<Fig />} figureCaption={made.figureCaption} lines={made.lines}
                  onPrint={() => print(ARTICLES.length + 1)} />
              );
            })()}
          </section>
        )}
      </div>
    </main>
  );
}
