import { ITEMS, SCORE_VALUES, type Level } from './gameItems';
import { LEXICON, TAGS, ARCHETYPES, DOMAINS, PARADOX_KINDS, FAMILIES } from './lexicon';

export interface Evaluation {
  lv: Level;
  sc: number;
  sub: string;
  exp: string;
  /** What the connection rests on, e.g. "עיקרון משותף · גלגול". */
  basis?: string;
  /** Why this reading earns its level, in one distilled sentence. */
  why?: string;
  /** The closing line that names what the pair shares. */
  insight?: string;
}

/** One way of reading a pair. A pair usually has several, at different depths. */
export interface Reading extends Evaluation {
  basis: string;
  why: string;
  /** Stable id within the pair, so a chosen reading can be remembered. */
  key: string;
  /** The reading broken into a line per card and a closing insight, for structured display. */
  lines?: { w: string; t: string }[];
}

/** Order-independent key for a pair of card indices. */
export function pairKey(a: number, b: number): string {
  return [Math.min(a, b), Math.max(a, b)].join(',');
}

// ── HAND-CRAFTED SECRETS ──
const SECRETS: Record<string, Evaluation> = {};
function S(a: number, b: number, lv: Level, sub: string, exp: string) {
  const k = pairKey(a, b);
  SECRETS[k] = { lv, sc: SCORE_VALUES[lv], sub, exp };
}

// SCIENCE-BASED
S(0,10,'s','סוד — ברק הצית את החיים','ב-1953 העבירו סטנלי מילר והרולד יורי ניצוצות חשמל, הדמיה של ברקים, דרך תערובת הגזים של כדור הארץ הקדום, וקיבלו חומצות אמינו, אבני הבניין של החיים. ייתכן שהברק היה שם לפני הנבט הראשון.');
S(4,20,'s','סוד — אותה משוואה','גל ים וצליל מוזיקלי מתוארים באותה משוואת גלים: תדר, אורך גל, משרעת. ההבדל הוא רק בתווך ובקנה המידה. הים והמוזיקה הם אותה פיזיקה בשתי מהירויות.');
S(7,0,'s','סוד — לחץ שמוליד','יהלום הוא פחמן רגיל שעבר לחץ עצום בעומק האדמה. נבט מפעיל לחץ של כמה אטמוספרות כדי לפרוץ קרקע קשה. באחד הלחץ מופעל עליו, ובשני הוא מפעיל אותו, ובשניהם הלחץ הוא מה שמוליד את הצורה.');
S(3,15,'s','סוד — סדר שמתארגן לבד','מערבולת היא דוגמה לארגון עצמי: מים שנעים בלי תכנון יוצרים צורה יציבה עם מרכז. פאזל הוא אותו תהליך בידיים: ערימה אקראית שמתארגנת לתמונה אחת. בשניהם הסדר לא נכפה מבחוץ, הוא נובע מהיחסים בין החלקים.');
S(12,20,'s','סוד — הירח מנגן','הגאות והשפל הם גל אחד ענק שהירח מושך סביב כדור הארץ, פעמיים ביום. גם תו הוא גל: לה רוטט 440 פעמים בשנייה. אותה פיזיקה של גלים, בהפרש של כעשרים מיליון מונים בתדר.');
S(6,20,'s','סוד — מפתח שהוא סולם','במוזיקה, "מפתח" (key) הוא הסולם שקובע אילו צלילים שייכים ליצירה. מפתח בדלת קובע מי שייך לחדר. אותה מילה, ואותה פעולה: לקבוע את הגבול בין פנים לחוץ.');
S(4,19,'s','סוד — גל של רעיונות','חוקר התקשורת אוורט רוג׳רס תיאר ב-1962 איך חידושים מתפשטים בחברה: מעטים מאמצים ראשונים, אחריהם גל של רבים, ואז דעיכה. ספר הוא אחד הכלים שמניעים גלים כאלה; אחרי מכבש הדפוס של גוטנברג, רעיונות חצו את אירופה בגלים של עשרות שנים.');
S(2,10,'s','סוד — אפקט הפרפר','ב-1972 שאל המטאורולוג אדוארד לורנץ אם משק כנפי פרפר בברזיל יכול לחולל טורנדו בטקסס. התשובה שלו: במערכת כאוטית, שינוי זעיר יכול לשנות את מהלך הסערה כולה. הפרפר, העדין שבטבע, והברק, האלים שבו, מחוברים דרך הכאוס.');
S(19,4,'s','סוד — רק פני השטח','גל הוא רק פני המים; מתחתיו נע ים שלם שאינו זז איתו. ספר הוא רק דיו על נייר; מתחתיו עולם שלם של כוונה. בשניהם מה שנראה הוא האות, לא המקור.');
S(21,7,'s','סוד — לשבור את האור','יהלום שובר אור לבן ומפרק אותו לקשת. רעיון טוב עושה אותו דבר לשאלה פשוטה: מפרק אותה לאפשרויות שלא נראו קודם. שניהם לוקחים דבר אחיד ומגלים שהיה בו ספקטרום שלם.');
S(8,24,'s','סוד — המזל של השמש','באסטרולוגיה השמש היא הכוכב השולט במזל אריה, ועונת האריה היא שיא הקיץ. בהרלדיקה ובאמנות, אריה ושמש מופיעים יחד כסמל אחד של מלכות, למשל בסמל "האריה והשמש" של פרס. אותה ישות, בשפת השמיים ובשפת הארץ.');
S(9,0,'s','סוד — זרעים שמחכים לאש','לאורן ירושלים יש אצטרובלים שנפתחים רק בחום של שריפה, ואז מפזרים זרעים על אדמה שהאפר דישן. האש אינה רק אויב של הנבט; אצל צמחים מסוימים היא התנאי ללידתו.');
S(12,17,'s','סוד — כף המאזניים של הים','הגאות היא שיווי משקל בין משיכת הירח לתנועת כדור הארץ. ים שלם עולה ויורד פעמיים ביום, כמו כף מאזניים ענקית שכוח בלתי נראה מכריע אותה.');
S(7,15,'s','סוד — שלמות של סידור','יהלום הוא פאזל מושלם: כל אטום פחמן קשור לארבעה שכנים בדיוק, בסריג שחוזר על עצמו. אותו פחמן בסידור אחר הוא גרפיט רך. השלמות אינה בחומר, אלא בסידור החלקים.');
S(14,18,'s','סוד — כל העולם במה','שייקספיר כתב ב"כטוב בעיניכם": כל העולם במה, וכל הגברים והנשים רק שחקנים. אם העולם הוא במה, המסכה אינה הסתרה אלא התלבושת של כולנו. השאלה היא רק מי יודע שהוא לובש אותה.');
S(18,22,'s','סוד — תמונה הפוכה','כדור בדולח פועל כעדשה: מי שמביט בו רואה את החדר הפוך ומוקטן. מסכה פועלת על הפנים כמו עדשה על המציאות. שניהם מבטיחים לגלות, ומראים בעיקר את מי שמביט.');
S(11,23,'s','סוד — שני שעונים','הר הוא שעון גיאולוגי: הגיל שלו נקרא בשכבות הסלע, במיליוני שנים. שעון אטומי מודד מיליארדיות שנייה. שניהם מודדים את אותו זמן, בהפרש של חמש עשרה סדרי גודל.');
S(21,9,'s','סוד — בעירה איטית','המוח צורך כעשרים וואט, כמו נורה קטנה, וכל מחשבה ניזונה מחמצון של סוכר. זו אותה תגובה כימית שמזינה אש, רק מבוקרת ואיטית. "ניצוץ של רעיון" הוא כמעט תיאור מדעי.');
S(23,16,'s','סוד — דחיפות וכיוון','מטרה אומרת "לשם"; שעון אומר "עד מתי". בלי שעון, מטרה היא חלום; בלי מטרה, שעון הוא רק תקתוק. הפרדוקס של חיים מודעים הוא ששניהם נחוצים יחד.');
S(1,24,'s','סוד — יופי עם טפרים','ורד ואריה מאחדים יופי ואיום. הוורד מושך ופוצע בקוץ; האריה מרהיב וטורף. האבולוציה לימדה אותנו לא לבטוח ביופי לבדו, ולכן שניהם מעוררים בנו משיכה וזהירות בבת אחת.');
S(19,20,'s','סוד — שתי שפות לבלתי ניתן לומר','ספר ותו הם שני ניסיונות לתרגם חוויה לשפה שאפשר למסור. מה שאי אפשר לומר, כותבים; מה שאי אפשר לכתוב, מנגנים. שתי מערכות סימון שנולדו מאותו צורך.');
S(13,6,'s','סוד — כלים לסגור','טלסקופ ומפתח שניהם פותחים את מה שסגור: אחד דלת, השני את השמיים. גבול קיים, עד שמישהו בונה את הכלי שעובר אותו.');
S(18,5,'s','סוד — מסכה בטבע','לדגי פרפר יש כתם שחור דמוי עין ליד הזנב, ופס כהה שמסתיר את העין האמיתית. טורף שתוקף את "הראש" מחטיא. זו מסכה במובן המלא: פנים מזויפות שנועדו להטעות.');
S(15,21,'s','סוד — הרגע שבו הפאזל נסגר','ב-2004 מדדו החוקרים מרק יונג-בימן וג׳ון קוניוס פרץ של גלי גמא בקצב של כ-40 הרץ באונה הרקתית הימנית, רגע לפני שנבדקים פתרו חידה בתובנה פתאומית. רגע ה"אהה" הוא, ממש פיזית, פאזל שנסגר במוח.');
S(3,12,'s','סוד — זמן שחוזר בספירלה','מערבולת היא ספירלה במרחב; מחזור הירח הוא ספירלה בזמן: חוזר לאותה צורה, אבל אף פעם לא לאותו רגע. שניהם מציעים שהזמן אינו קו ישר אלא סליל.');
S(16,21,'s','סוד — רעיון שקיבל כתובת','רעיון הוא מטרה שעוד אין לה כתובת; מטרה היא רעיון שקיבל כתובת. ברגע שרעיון הופך למטרה הוא מרוויח כיוון ומאבד חופש. אותו דבר, בשני שלבי בשלות.');

// CROSS-DOMAIN READINGS
S(0,17,'d','קשר מושגי — הברירה','כל נבט נשקל: האם התנאים יספיקו לו? הברירה הטבעית היא מאזניים בלי רחמים ובלי ערעור. מה שמתאים, שורד.');
S(11,24,'r','קשר סמלי — גדולה שאינה מכריזה','הר ואריה שולטים בממלכתם בלי מתחרים: ההר בנוף, האריה בסוואנה. שניהם מסמלים גדולה שאינה צריכה להכריז על עצמה.');
S(8,12,'p','קשר גלוי — שני מאורות','שמש וירח, היום והלילה. ועובדה מפתיעה: מכדור הארץ הם נראים כמעט באותו גודל, כי השמש גדולה מהירח פי 400 ורחוקה ממנו פי 400 בקירוב. לכן ליקוי חמה מלא אפשרי.');
S(13,22,'r','קשר סמלי — לראות מעבר','טלסקופ ובדולח הם שני כלי ראייה שמבטיחים לראות מעבר לאופק: אחד מדעי ואחד מיסטי. שניהם עונים על אותו צורך עתיק, לדעת את מה שרחוק.');
S(8,21,'r','קשר סמלי — שני מקורות אור','השמש מאירה את העולם הנראה; הרעיון מאיר את עולם המחשבה. בעברית, כמו ברוב השפות, הבנה היא "הארה".');
S(19,22,'d','קשר מושגי — לקרוא עתיד','כל ספר טוב מנבא: מה יקרה לדמות, לעולם, לנפש. הבדולח מבטיח לנבא. אבל שניהם בעצם קוראים את ההווה ומסיקים ממנו את מה שיבוא.');
S(11,12,'d','קשר מושגי — עדים שקטים','הר וירח עמדו כאן לפני האדם ויעמדו אחריו. שניהם ראו הכול ושתקו. עדות בלי מילים היא העדות היציבה ביותר.');
S(9,21,'r','קשר סמלי — ניצוץ','"ניצוץ של רעיון", "רעיון שהצית": השפה מחברת אש ומחשבה. האש הייתה אולי הרעיון הגדול הראשון של האנושות, וכמו אש, רעיון שנדלק קשה לכבות.');
S(1,7,'r','קשר סמלי — מתנת אהבה','ורד ויהלום הם שתי מתנות האהבה הקלאסיות. אבל הוורד נובל בתוך ימים והיהלום כמעט נצחי: שני סיפורים הפוכים על מה שאהבה מבטיחה.');
S(2,18,'r','קשר סמלי — כנפיים שמסתירות','על כנפי פרפרים רבים יש כתמים דמויי עיניים שמבהילים טורפים. הכנף היא מסכה: פנים גדולות ומאיימות שמסתירות יצור קטן ופגיע.');
S(5,24,'d','קשר מושגי — מלכים בממלכותיהם','דג ואריה הם מלכים בשני עולמות: הים והיבשה. אצל שניהם השליטה נובעת מהתאמה מושלמת לסביבה, לא מכוח לבדו.');

/** Keys of the hand-crafted "sod" pairs — the hidden secrets players can collect. */
export const SECRET_KEYS: readonly string[] = Object.keys(SECRETS).filter(k => SECRETS[k].lv === 's');

/** The hand-crafted secrets as pairs, for the collection page. */
export function secretEntries(): { key: string; a: number; b: number; ev: Evaluation }[] {
  return SECRET_KEYS.map(key => {
    const [a, b] = key.split(',').map(Number);
    return { key, a, b, ev: SECRETS[key] };
  });
}

export function isHandCraftedSecret(a: number, b: number): boolean {
  const s = SECRETS[pairKey(a, b)];
  return !!s && s.lv === 's';
}

// ── READING ENGINE ──
// Every pair is read on every axis the lexicon knows. Each axis yields a reading whose
// level follows the game's definitions; the deepest justified reading is the graded one.

const LEVEL_RANK: Record<Level, number> = { p: 0, r: 1, d: 2, s: 3 };

const domainOf = (i: number) => DOMAINS[ITEMS[i].p] ?? ITEMS[i].p;

function crossNote(a: number, b: number): string {
  return ITEMS[a].p === ITEMS[b].p ? `בתוך ${domainOf(a)}` : `בין ${domainOf(a)} ל${domainOf(b)}`;
}

const WHY: Record<Level, (name: string, a: number, b: number) => string> = {
  p: name => `פשט: המשותף, ${name}, נקלט בחושים. אין צורך בפרשנות כדי לראות אותו.`,
  r: name => `רמז: המשותף, ${name}, אינו בחומר עצמו. זו משמעות שהתרבות העניקה לשניהם.`,
  d: (name, a, b) => `דרש: אותו עיקרון, ${name}, פועל ${crossNote(a, b)}. כדי לראות אותו צריך להפשיט מהמקרה אל הכלל.`,
  s: (_name, a, b) => `סוד: הקשר אינו נראה, אינו סמל מוכר ואינו עיקרון כללי. הוא נשען על עובדה או סתירה נסתרת שמחברת ${crossNote(a, b)}.`,
};

function make(lv: Level, key: string, sub: string, basis: string, exp: string, why: string): Reading {
  return { lv, sc: SCORE_VALUES[lv], key, sub, basis, exp, why };
}

/** A reading made of one line per card plus an insight; `exp` is the same text flattened. */
function structured(lv: Level, key: string, sub: string, basis: string, lines: { w: string; t: string }[], insight: string, why: string): Reading {
  const exp = [...lines.map(l => `${l.w} — ${l.t}`), insight].join(' ');
  return { ...make(lv, key, sub, basis, exp, why), lines, insight };
}

const dot = (s: string) => (/[.!?]$/.test(s) ? s : `${s}.`);
const note = (i: number, tag: string) => ({ w: ITEMS[i].l, t: dot(LEXICON[i].notes[tag]) });
const ess = (i: number) => ({ w: ITEMS[i].l, t: LEXICON[i].essence });

function tagInsight(tag: string): string {
  const t = TAGS[tag];
  if (t.insight.length > 14) return t.insight;
  return t.lv === 'p' ? `תכונה גלויה משותפת: ${t.name}.` : t.lv === 'r' ? `משמעות תרבותית משותפת: ${t.name}.` : `עיקרון משותף: ${t.name}.`;
}

function directReadings(a: number, b: number): Reading[] {
  const ia = ITEMS[a], ib = ITEMS[b];
  const la = LEXICON[a], lb = LEXICON[b];
  const out: Reading[] = [];
  const k = pairKey(a, b);

  // Hand-crafted readings: researched, specific, authoritative at their level.
  const hc = SECRETS[k];
  if (hc) {
    out.push(make(hc.lv, 'hc', hc.sub, hc.lv === 's' ? 'סוד מתועד' : 'קריאה מתועדת', hc.exp,
      hc.lv === 's' ? WHY.s('', a, b) : WHY[hc.lv](hc.sub.replace(/^[^—]*—\s*/, ''), a, b)));
  }

  // Shared paradox: the same contradiction that turns out true in both.
  if (la.parKind === lb.parKind) {
    const kind = PARADOX_KINDS[la.parKind];
    out.push(structured('s', 'par', `סוד — ${kind.name}`, `פרדוקס משותף · ${kind.name}`,
      [{ w: ia.l, t: la.par }, { w: ib.l, t: lb.par }], kind.truth,
      `סוד: לא תכונה ולא סמל, אלא אותה סתירה שמתגלה כאמת אצל שניהם, ${crossNote(a, b)}.`));
  }

  // Shared archetype (Jung).
  if (ia.arch === ib.arch && ARCHETYPES[ia.arch]) {
    const ar = ARCHETYPES[ia.arch];
    out.push(structured('r', 'arch', `קשר ארכיטיפי — ${ar.name}`, `ארכיטיפ משותף · ${ar.name}`,
      [ess(a), ess(b)], `שניהם מגלמים את ${ar.name}: ${ar.gist}.`,
      `רמז: הארכיטיפ של ${ar.name} הוא דמות תרבותית עתיקה (לפי יונג), ושניהם לובשים אותה.`));
  }

  // Shared tags, each read through the two cards' own lines.
  const shared = ia.t.filter(t => ib.t.includes(t) && TAGS[t] && la.notes[t] && lb.notes[t]);
  for (const tag of shared) {
    const t = TAGS[tag];
    const label = t.lv === 'p' ? 'תכונה גלויה' : t.lv === 'r' ? 'סמל משותף' : 'עיקרון משותף';
    const kind = t.lv === 'p' ? 'קשר גלוי' : t.lv === 'r' ? 'קשר סמלי' : 'קשר מושגי';
    out.push(structured(t.lv, `t:${tag}`, `${kind} — ${t.name}`, `${label} · ${t.name}`,
      [note(a, tag), note(b, tag)], tagInsight(tag), WHY[t.lv](t.name, a, b)));
  }

  // Concept families: different tags, same idea — an analogy.
  for (const [fi, fam] of FAMILIES.entries()) {
    const ta = ia.t.find(t => fam.tags.includes(t) && la.notes[t]);
    const tb = ib.t.find(t => fam.tags.includes(t) && lb.notes[t]);
    if (!ta || !tb || ta === tb || shared.includes(ta) || shared.includes(tb)) continue;
    out.push(structured(fam.lv, `f:${fi}`, `${fam.lv === 'd' ? 'אנלוגיה' : 'קשר סמלי'} — ${TAGS[ta]?.name ?? ta} ו${TAGS[tb]?.name ?? tb}`, `${fam.lv === 'd' ? 'אנלוגיה' : 'סמל קרוב'} · ${fam.name}`,
      [note(a, ta), note(b, tb)], fam.insight,
      fam.lv === 'd'
        ? `דרש: לא אותה תכונה, אלא שני ביטויים של אותו רעיון, ${fam.name}, ${crossNote(a, b)}. מי שרואה את הרעיון המשותף מפשיט.`
        : `רמז: שני סמלים שונים מאותה משפחה תרבותית, ${fam.name}.`));
  }

  // Same domain: the most literal reading.
  if (ia.p === ib.p) {
    const literal = ia.p === 'nature' || ia.p === 'animal' || ia.p === 'object';
    out.push(structured(literal ? 'p' : 'r', 'fam', `${literal ? 'קשר גלוי' : 'קשר סמלי'} — ${DOMAINS[ia.p]}`, `אותו תחום · ${DOMAINS[ia.p]}`,
      [ess(a), ess(b)], `שניהם שייכים ל${DOMAINS[ia.p]}.`,
      literal ? WHY.p(`השייכות ל${DOMAINS[ia.p]}`, a, b) : `רמז: שניהם מושגים מ${DOMAINS[ia.p]}; הקרבה ביניהם היא במשמעות, לא בחומר.`));
  }

  return out;
}

const rankReadings = (rs: Reading[]) => {
  const pri = (r: Reading) => (r.key === 'hc' ? 3 : r.key === 'par' ? 2 : r.key.startsWith('t:') && TAGS[r.key.slice(2)].insight.length > 14 ? 1 : 0);
  return [...rs].sort((x, y) => LEVEL_RANK[y.lv] - LEVEL_RANK[x.lv] || pri(y) - pri(x));
};

const directCache = new Map<string, Reading[]>();
function direct(a: number, b: number): Reading[] {
  const k = pairKey(a, b);
  let rs = directCache.get(k);
  if (!rs) {
    rs = rankReadings(directReadings(Math.min(a, b), Math.max(a, b)));
    directCache.set(k, rs);
  }
  return rs;
}

/** When no thread runs straight between two cards, find the card that bridges them best. */
function bridgeReading(a: number, b: number): Reading | null {
  let best: { z: number; score: number } | null = null;
  for (let z = 0; z < ITEMS.length; z++) {
    if (z === a || z === b) continue;
    const ra = direct(a, z)[0], rb = direct(b, z)[0];
    if (!ra || !rb) continue;
    const score = LEVEL_RANK[ra.lv] + LEVEL_RANK[rb.lv];
    if (!best || score > best.score) best = { z, score };
  }
  if (!best) return null;
  const z = best.z, ra = direct(a, z)[0], rb = direct(b, z)[0];
  const ia = ITEMS[a], ib = ITEMS[b], iz = ITEMS[z];
  const via = (r: Reading) => r.sub.replace(/^[^—]*—\s*/, '');
  return structured('r', 'bridge', `קשר עקיף — דרך ${iz.l}`, `גשר דרך מתווך · ${iz.l}`,
    [ess(a), ess(b)],
    `אין חוט ישיר ביניהם, אבל ${iz.l} מחבר: עם ${ia.l} (${via(ra)}), ועם ${ib.l} (${via(rb)}).`,
    `רמז: אסוציאציה רחוקה, דרך מילה שלישית. כך פועלת חשיבה יצירתית (Mednick, 1962), אבל הקשר אינו עומד בפני עצמו.`);
}

/** Readings with wording in pick order (a first). */
function orient(r: Reading, a: number, b: number): Reading {
  if (a < b || r.key === 'hc') return r;
  // Rebuild order-sensitive text with the picked card first.
  const rebuilt = [...directReadings(a, b), ...(r.key === 'bridge' ? [bridgeReading(a, b)!] : [])].find(x => x.key === r.key);
  // Titles stay canonical so a pair reads the same whichever card came first.
  return rebuilt ? { ...rebuilt, sub: r.sub, basis: r.basis } : r;
}

/** Every reading of a pair, deepest first, at most five. */
export function readingsFor(idxA: number, idxB: number): Reading[] {
  let rs = direct(idxA, idxB);
  if (!rs.some(r => r.key !== 'fam')) {
    const br = bridgeReading(Math.min(idxA, idxB), Math.max(idxA, idxB));
    if (br) rs = rankReadings([...rs, br]);
  }
  return rs.slice(0, 5).map(r => orient(r, idxA, idxB));
}

// ── EVALUATION ──
export function evaluate(idxA: number, idxB: number): Evaluation {
  const r = readingsFor(idxA, idxB)[0];
  if (r) return r;
  const ia = ITEMS[idxA], ib = ITEMS[idxB];
  return {
    lv: 'p', sc: SCORE_VALUES.p, sub: 'קשר פתוח', basis: 'קשר פתוח',
    exp: `${ia.l}: ${LEXICON[idxA].essence} ${ib.l}: ${LEXICON[idxB].essence}`,
    why: 'פשט: לא נמצא חוט משותף מוכר. אם ראיתם קשר, כתבו אותו.',
  };
}

/** Short Hebrew labels of the other directions a pair could be read in. */
export function suggestConnectionTypes(idxA: number, idxB: number): string[] {
  const rs = readingsFor(idxA, idxB).slice(1, 4).map(r => r.basis.split(' · ').pop()!);
  return rs.length > 0 ? rs : ['חיבור בין עולמות שונים'];
}

