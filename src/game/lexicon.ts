/**
 * The interpretive lexicon: what each card *is*, in Hebrew, facet by facet.
 * Every reading the game offers is assembled from these item-specific lines,
 * so no two pairs are explained with the same sentence.
 */
import type { Level } from './gameItems';

export interface ItemLexicon {
  /** One line on the card's essence. */
  essence: string;
  /** The process the card performs (Hebrew noun phrase). */
  proc: string;
  /** The card's inner paradox, as a sentence. */
  par: string;
  /** Paradox family, used to find pairs that share the same contradiction. */
  parKind: ParadoxKind;
  /** How this card embodies each of its tags. */
  notes: Record<string, string>;
}

export type ParadoxKind =
  | 'destroy-create' | 'hide-reveal' | 'silence-sound' | 'chaos-order'
  | 'pain-beauty' | 'far-near' | 'power-mortal' | 'time-flow' | 'nothing-something' | 'whole-part';

export const PARADOX_KINDS: Record<ParadoxKind, { name: string; truth: string }> = {
  'destroy-create': { name: 'בריאה מתוך הרס', truth: 'מה שנראה כסוף הוא תנאי להתחלה.' },
  'hide-reveal': { name: 'גילוי דרך הסתרה', truth: 'מה שמכסה הוא גם מה שמראה.' },
  'silence-sound': { name: 'הקול שבשתיקה', truth: 'השקט אינו היעדר; הוא החומר שממנו הקול עשוי.' },
  'chaos-order': { name: 'סדר בתוך כאוס', truth: 'האקראי הוא סדר שעוד לא קראנו.' },
  'pain-beauty': { name: 'יופי שנולד מקושי', truth: 'היופי אינו מנוגד לכאב; לעתים הוא עשוי ממנו.' },
  'far-near': { name: 'הרחוק והקרוב', truth: 'מי שמכוון אל הרחוק מפספס את מה שלידו, ולהפך.' },
  'power-mortal': { name: 'עוצמה שבריריות', truth: 'דווקא בשיא הכוח מתגלה הפגיעות.' },
  'time-flow': { name: 'לאחוז במה שזורם', truth: 'כל ניסיון לעצור את הזמן הוא עוד צורה של תנועתו.' },
  'nothing-something': { name: 'יש מאין', truth: 'הדבר החדש באמת נראה תמיד כאילו בא משום מקום.' },
  'whole-part': { name: 'השלם והחלק', truth: 'השלמות אינה סכום החלקים; היא היחס ביניהם.' },
};

export const LEXICON: ItemLexicon[] = [
  // 0 נבט
  {
    essence: 'החיים ברגע הראשון שלהם, לפני שידוע מה יהיו.',
    proc: 'צמיחה', par: 'הזרע חייב להיעלם כדי שהצמח יופיע.', parKind: 'destroy-create',
    notes: {
      growth: 'פורץ מגרעין זעיר אל צמח שלם',
      life: 'הוא החיים בצורתם הגולמית ביותר',
      potential: 'מכיל עץ שלם שעוד לא קרה',
      beginning: 'הוא ההתחלה עצמה, השנייה שבה משהו מתחיל',
      small: 'קטן עד כדי כך שקל לדרוך עליו',
      green: 'ירוק של כלורופיל, הצבע של אור שהפך למזון',
      fragile: 'נשבר מכף רגל אחת',
      earth: 'יוצא מהאדמה ונשען עליה',
    },
  },
  // 1 ורד
  {
    essence: 'יופי שמגן על עצמו.',
    proc: 'פריחה', par: 'היופי שלו בא יחד עם קוץ.', parKind: 'pain-beauty',
    notes: {
      beauty: 'הוא היופי הקלאסי, זה שמשוררים חוזרים אליו',
      love: 'הוא שפת האהבה המוכרת ביותר במערב',
      ephemeral: 'פורח לימים ספורים ונובל',
      fragile: 'עלי הכותרת שלו נחבלים במגע',
      red: 'אדום של דם ושל תשוקה',
      thorns: 'שומר על עצמו בקוצים',
      passion: 'מסמל תשוקה, לא רק חיבה',
      flower: 'הוא הפרח שכל פרח אחר נמדד מולו',
    },
  },
  // 2 פרפר
  {
    essence: 'הוכחה חיה שאפשר להפוך למשהו אחר לגמרי.',
    proc: 'גלגול', par: 'הזחל צריך להתפרק בגולם כדי לעוף.', parKind: 'destroy-create',
    notes: {
      transformation: 'מתפרק בגולם לנוזל ונבנה מחדש ככנף',
      beauty: 'כנפיו עשויות אלפי קשקשים שמפזרים אור',
      flight: 'עף בדרך לא צפויה, בזיגזג',
      ephemeral: 'חי כבוגר שבועות ספורים',
      freedom: 'הוא הדימוי של נפש משתחררת',
      colorful: 'צבעיו נוצרים ממבנה הכנף, לא רק מפיגמנט',
      delicate: 'אבקת כנפיו נמחקת במגע אצבע',
    },
  },
  // 3 מערבולת
  {
    essence: 'תנועה שנסגרת על עצמה ויוצרת מרכז.',
    proc: 'סחרור', par: 'בתוך הסערה יש עין שקטה ומסודרת.', parKind: 'chaos-order',
    notes: {
      spiral: 'מסתחררת בספירלה שמתהדקת לעבר מרכז',
      chaos: 'נראית כמו אובדן שליטה מוחלט',
      force: 'שואבת אליה כל מה שקרוב',
      motion: 'קיימת רק כל עוד היא נעה',
      fibonacci: 'מתפתלת ביחס שמופיע גם בצדפים ובגלקסיות',
      depth: 'מושכת כלפי מטה, אל העומק',
      pattern: 'חוזרת על אותה צורה בכל קנה מידה',
      vortex: 'היא המערבולת עצמה, צורת היסוד של זרימה',
    },
  },
  // 4 גל
  {
    essence: 'אנרגיה שעוברת דרך המים, בלי שהמים עצמם נוסעים.',
    proc: 'גלישה', par: 'אותו גל שמחריב חוף גם בונה אותו.', parKind: 'destroy-create',
    notes: {
      power: 'יכול להזיז סלעים ולשנות קו חוף',
      motion: 'הוא תנועה טהורה שעוברת דרך החומר',
      cyclic: 'חוזר שוב ושוב, בלי סוף',
      rhythm: 'מכה בחוף בקצב קבוע כמו נשימה',
      flow: 'זורם, נשבר ומתאסף מחדש',
      wave: 'הוא הגל במובן הפיזיקלי המלא: תדר, אורך גל, משרעת',
      destruction: 'שוחק צוקים',
      creation: 'מעצב חופים ודיונות',
    },
  },
  // 5 דג
  {
    essence: 'חיים שלמים שמתנהלים במקום שאנחנו לא רואים.',
    proc: 'זרימה', par: 'עולם שלם חי מתחת לפני המים בשקט.', parKind: 'hide-reveal',
    notes: {
      silent: 'חי בעולם בלי קול',
      freedom: 'נע בשלושה ממדים בלי משקל',
      depth: 'מגיע למקומות שהאור לא מגיע אליהם',
      hidden: 'חי מתחת לפני השטח, מחוץ לעין',
      nature: 'הוא אחד מבעלי החוליות הקדומים בטבע',
      water: 'אינו יכול להתקיים מחוץ למים',
      survival: 'שרד מאות מיליוני שנים כמעט בלי להשתנות',
      ancient: 'צורתו קדמה לדינוזאורים',
    },
  },
  // 6 מפתח
  {
    essence: 'כוונה קטנה שמכריעה בין סגור לפתוח.',
    proc: 'פתיחה', par: 'הנעילה היא שהופכת את הפתיחה למשמעותית.', parKind: 'hide-reveal',
    notes: {
      access: 'קובע מי נכנס ומי נשאר בחוץ',
      mystery: 'מרמז שיש משהו מאחורי הדלת',
      unlock: 'משחרר את מה שהיה נעול',
      solution: 'הוא התשובה שמתאימה בדיוק לשאלה אחת',
      metal: 'חרוט במתכת קשה',
      precision: 'עובד רק אם כל שן במקומה, בדיוק של עשירית מילימטר',
      control: 'מעניק שליטה למי שמחזיק בו',
    },
  },
  // 7 יהלום
  {
    essence: 'פחמן רגיל שעבר לחץ שאי אפשר לדמיין.',
    proc: 'דחיסה', par: 'היופי שלו הוא תוצאה של לחץ קיצוני.', parKind: 'pain-beauty',
    notes: {
      beauty: 'מפרק אור לבן לקשת צבעים',
      rare: 'נדיר בזכות התנאים הקיצוניים שבהם נוצר',
      value: 'מרכז ערך עצום בנפח זעיר',
      light: 'אינו מאיר בעצמו אלא שובר את האור',
      hard: 'הוא החומר הטבעי הקשה ביותר',
      crystal: 'סריג של אטומי פחמן בסדר מושלם',
      pressure: 'נוצר בעומק של כ-150 קילומטר תחת לחץ עצום',
      clarity: 'נמדד בצלילותו, בהיעדר פגמים',
      carbon: 'עשוי מאותו יסוד כמו פחם וכמו גוף האדם',
    },
  },
  // 8 שמש
  {
    essence: 'הכוכב שכל אנרגיה על פני הארץ באה ממנו.',
    proc: 'קרינה', par: 'אותה שמש שמזינה חיים גם שורפת אותם.', parKind: 'destroy-create',
    notes: {
      light: 'מקור האור הראשוני שלנו',
      energy: 'מקרינה בכל שנייה יותר אנרגיה ממה שהאנושות צרכה מעולם',
      warmth: 'מחממת את כדור הארץ למידה שמאפשרת חיים',
      life: 'מניעה את הפוטוסינתזה, הבסיס לשרשרת המזון',
      power: 'מחזיקה את כל מערכת השמש בכוח המשיכה שלה',
      fire: 'נראית כמו אש, אבל בוערת בהיתוך גרעיני',
      nuclear: 'הופכת מימן להליום בליבה שלה',
      cyclic: 'עולה ושוקעת, ויש לה גם מחזור פעילות של כ-11 שנה',
      gold: 'צבעה הוא הזהב של ציורים ושל אגדות',
    },
  },
  // 9 אש
  {
    essence: 'תגובה כימית שנראית כמו דבר חי.',
    proc: 'כילוי', par: 'אש יוצרת בדיוק במה שהיא מכלה.', parKind: 'destroy-create',
    notes: {
      energy: 'משחררת אנרגיה שהייתה כלואה בחומר',
      danger: 'מתפשטת מהר יותר משאפשר לברוח',
      transformation: 'הופכת עץ לאפר, חום ואור',
      power: 'שינתה את ההיסטוריה האנושית יותר מכל כלי אחר',
      light: 'הייתה מקור האור הראשון שהאדם שלט בו',
      heat: 'היא חום במצב גלוי',
      consume: 'אוכלת את מה שמזין אותה',
      purify: 'משמשת לטיהור מתכות ובטקסים של היטהרות',
    },
  },
  // 10 ברק
  {
    essence: 'רגע שבו השמיים משחררים מתח שנאגר.',
    proc: 'פריקה', par: 'השקט שלפני הרעם הוא חלק מהברק.', parKind: 'silence-sound',
    notes: {
      energy: 'מחמם את האוויר לטמפרטורה גבוהה מפני השמש',
      power: 'נושא זרם של עשרות אלפי אמפר',
      danger: 'פוגע ללא אזהרה',
      speed: 'חוצה קילומטרים בשבריר שנייה',
      light: 'מאיר את כל הנוף לרגע אחד',
      force: 'מבקע עצים וממיס חול לזכוכית',
      electric: 'הוא חשמל בצורתו הגולמית',
      sudden: 'מופיע ונעלם לפני שמספיקים להבין',
    },
  },
  // 11 הר
  {
    essence: 'זמן גיאולוגי שעומד מולנו.',
    proc: 'עמידה', par: 'הוא מגיע לשמיים ונשאר נטוע באדמה.', parKind: 'far-near',
    notes: {
      solid: 'הוא המוצק ביותר בנוף',
      eternal: 'נראה נצחי, אף שהוא נשחק לאט',
      silence: 'שותק מעל לכל רעש',
      power: 'נוצר מהתנגשות של לוחות יבשה',
      majesty: 'מעורר יראה במי שעומד לרגליו',
      tall: 'מתנשא אל מעל העננים',
      ancient: 'ראה מיליוני שנים עוברות',
      witness: 'עומד כעד לכל מה שקרה למטה',
    },
  },
  // 12 ירח
  {
    essence: 'מראה בשמיים שמחזירה את אור השמש בלילה.',
    proc: 'השתקפות', par: 'הוא מאיר באור שאינו שלו.', parKind: 'hide-reveal',
    notes: {
      night: 'הוא מלך הלילה',
      mystery: 'מסתיר תמיד את צדו האחד מאיתנו',
      cyclic: 'משנה צורה במחזור של 29.5 ימים',
      light: 'מחזיר כ-12 אחוז מאור השמש שפוגע בו',
      silence: 'עובר את השמיים בלי קול',
      reflection: 'אינו מאיר בעצמו אלא משקף',
      feminine: 'משויך בתרבויות רבות לנשי ולאלות',
      tides: 'מושך את הים ויוצר גאות ושפל',
    },
  },
  // 13 טלסקופ
  {
    essence: 'עין שהאדם בנה כדי לראות מעבר לגבול העין.',
    proc: 'הרחבה', par: 'רואה גלקסיות ומעוור למה שמולו.', parKind: 'far-near',
    notes: {
      vision: 'מרחיב את הראייה פי אלפים',
      discovery: 'בעזרתו גילה גלילאו את ירחי צדק',
      precision: 'תלוי בעדשות ובמראות מלוטשות עד רמת הננומטר',
      exploration: 'הוא כלי החקירה הבסיסי של היקום',
      distance: 'מקרב את מה שרחוק מיליארדי שנות אור',
      extend: 'הוא שלוחה של העין האנושית',
      reveal: 'חושף את מה שהיה שם תמיד ולא נראה',
    },
  },
  // 14 עולם
  {
    essence: 'הכול, כשמסתכלים עליו בבת אחת.',
    proc: 'חיבור', par: 'כולנו ביחד, וכל אחד לבד.', parKind: 'whole-part',
    notes: {
      complexity: 'מכיל מערכות בתוך מערכות',
      connection: 'מחובר ברשתות של מסחר, שפה ומידע',
      whole: 'הוא השלם שכל השאר חלקים ממנו',
      unity: 'נראה מהחלל כגוף אחד בלי גבולות',
      diversity: 'מחזיק אלפי שפות ומיליוני מינים',
      map: 'אנחנו מכירים אותו בעיקר דרך מפות',
      infinite: 'אין דרך לראות את כולו',
    },
  },
  // 15 פאזל
  {
    essence: 'תמונה שנשברה כדי שנבנה אותה מחדש.',
    proc: 'השלמה', par: 'הבלבול הוא השלב שלפני השלמות.', parKind: 'chaos-order',
    notes: {
      complexity: 'מאות חלקים שרק אחד מתאים בכל מקום',
      parts: 'הוא שלם שפורק במכוון לחלקים',
      solution: 'יש לו פתרון אחד בלבד',
      pattern: 'נפתר דרך זיהוי דפוסים של צבע וצורה',
      fit: 'כל חלק מתאים רק לשכניו',
      missing: 'חלק אחד חסר הורס את כל התמונה',
      order: 'מחזיר סדר למה שהתפזר',
      chaos: 'מתחיל כערימה כאוטית',
    },
  },
  // 16 מטרה
  {
    essence: 'נקודה אחת שהכול מכוון אליה.',
    proc: 'מיקוד', par: 'מי שמביט רק במטרה מפספס את הדרך.', parKind: 'far-near',
    notes: {
      focus: 'דורשת מיקוד שמבטל כל דבר אחר',
      precision: 'נמדדת בסנטימטרים מהמרכז',
      achievement: 'היא הרגע שבו המאמץ הופך להישג',
      direction: 'נותנת כיוון לכל תנועה',
      clarity: 'עובדת רק כשהיא ברורה',
      purpose: 'היא הסיבה לפעולה',
    },
  },
  // 17 מאזניים
  {
    essence: 'הכלי שהפך את ההוגנות לדבר שאפשר לראות.',
    proc: 'איזון', par: 'הצדק לעולם אינו שלם, ובכל זאת שוקלים.', parKind: 'whole-part',
    notes: {
      balance: 'מגיעים למנוחה רק כששני הצדדים שווים',
      decision: 'מכריעים בלי רגש',
      equality: 'מניחים ששני הצדדים שווים בזכויותיהם',
      truth: 'הם סמל האמת בבתי משפט',
      measurement: 'הם כלי המדידה העתיק ביותר שידוע',
      weight: 'מבחינים בהבדל של גרם',
      judgment: 'מוחזקים בידי אלת הצדק',
    },
  },
  // 18 מסכה
  {
    essence: 'פנים שבוחרים ללבוש.',
    proc: 'הסתרה', par: 'המסכה חושפת יותר ממה שהיא מסתירה.', parKind: 'hide-reveal',
    notes: {
      identity: 'מאפשרת להיות מישהו אחר',
      illusion: 'יוצרת אשליה של פנים',
      emotion: 'מקבעת רגש אחד על הפנים',
      role: 'היא התפקיד עצמו בתיאטרון היווני',
      duality: 'מופיעה בזוג: הצוחקת והבוכה',
      hide: 'מסתירה את הפנים האמיתיות',
      reveal: 'דווקא מאחוריה אנשים מעזים לומר את האמת',
      theater: 'הייתה הכלי המרכזי של השחקן בתיאטרון היווני',
    },
  },
  // 19 ספר
  {
    essence: 'מחשבה שנשמרת אחרי שהחושב איננו.',
    proc: 'תיעוד', par: 'מילים כתובות ממשיכות לחשוב.', parKind: 'time-flow',
    notes: {
      wisdom: 'אוגר ניסיון של דורות',
      story: 'הוא הבית של הסיפור',
      language: 'בנוי כולו משפה',
      time: 'מאפשר לדבר עם מי שחי לפני מאות שנים',
      record: 'מתעד את מה שאחרת היה נשכח',
      knowledge: 'הוא כלי המסירה העיקרי של ידע',
      portal: 'פותח עולם שלם בין שתי כריכות',
      memory: 'משמש כזיכרון חיצוני של התרבות',
    },
  },
  // 20 תו
  {
    essence: 'צליל אחד שמקבל משמעות רק בתוך מנגינה.',
    proc: 'רטט', par: 'השקט שבין הצלילים הוא שעושה מוזיקה.', parKind: 'silence-sound',
    notes: {
      emotion: 'מעורר רגש בלי מילה אחת',
      pattern: 'חלק מסולם, מבנה של יחסים מתמטיים',
      beauty: 'יפה רק ביחס לתווים שסביבו',
      language: 'הוא אות בשפה המוזיקלית',
      rhythm: 'נמדד גם באורכו, לא רק בגובהו',
      wave: 'הוא גל קול: לה נמצא ב-440 הרץ',
      vibration: 'נולד ממיתר או מעמוד אוויר שרוטט',
      time: 'קיים רק בזמן, ונעלם כשהוא נגמר',
    },
  },
  // 21 רעיון
  {
    essence: 'הרגע שבו שני דברים מתחברים בראש לראשונה.',
    proc: 'הארה', par: 'הוא נראה כאילו הופיע משום מקום.', parKind: 'nothing-something',
    notes: {
      creativity: 'הוא היחידה הבסיסית של היצירה',
      insight: 'מגיע כהבנה פתאומית, רגע של "אהה"',
      light: 'מתואר בכל השפות כ"הארה"',
      discovery: 'מגלה את מה שלא נראה קודם',
      innovation: 'הוא נקודת המוצא של כל המצאה',
      electricity: 'נולד מפעילות חשמלית של מיליארדי תאי עצב',
      sudden: 'מגיע ברגע אחד, אחרי זמן ארוך של בשלות',
      potential: 'שווה רק אם מממשים אותו',
    },
  },
  // 22 בדולח
  {
    essence: 'כדור צלול שבני אדם ביקשו לקרוא בו את העתיד.',
    proc: 'ניבוי', par: 'הוא מראה עתיד בכך שהוא משקף את ההווה.', parKind: 'hide-reveal',
    notes: {
      mystery: 'משויך למגידות עתידות ולנסתר',
      future: 'מבטיח לראות את מה שעוד לא קרה',
      vision: 'הוא כלי של ראייה פנימית',
      prediction: 'שימש לניבוי מימי הביניים ועד הקרקס',
      crystal: 'עשוי קוורץ או זכוכית צלולה',
      sphere: 'כדור מושלם, צורה בלי התחלה ובלי סוף',
      light: 'אוסף אור והופך את התמונה שבתוכו',
      illusion: 'מה שרואים בו הוא תמונה הפוכה של החדר',
    },
  },
  // 23 שעון
  {
    essence: 'מכונה שהופכת את הזמן לתנועה שאפשר לספור.',
    proc: 'מדידה', par: 'הוא סופר את מה שאי אפשר לעצור.', parKind: 'time-flow',
    notes: {
      time: 'מחלק את הזמן לשניות שוות',
      precision: 'שעון אטומי טועה בשנייה אחת במאות מיליוני שנים',
      cycle: 'חוזר על אותו סיבוב שתים עשרה שעות',
      order: 'מסדר את היום של כולנו',
      measurement: 'הוא כלי מדידה ראשון במעלה',
      past: 'כל תקתוק שלו הופך הווה לעבר',
      mortality: 'מזכיר שהזמן שלנו מוגבל',
      motion: 'עובד בתנועה מתמדת של גלגלי שיניים או של רטט',
    },
  },
  // 24 אריה
  {
    essence: 'הכוח שאינו צריך להוכיח את עצמו.',
    proc: 'שליטה', par: 'המלך שאינו פוחד משום דבר עדיין בן תמותה.', parKind: 'power-mortal',
    notes: {
      power: 'הוא הטורף בראש השרשרת',
      leadership: 'מוביל להקה',
      danger: 'מסוכן גם במנוחה',
      wild: 'הוא הפרא שאי אפשר לביית',
      majesty: 'רעמתו הפכה לסמל של מלכות',
      pride: 'חי בלהקה שנקראת באנגלית pride',
      king: 'נקרא מלך החיות בתרבויות רבות',
      strength: 'מסמל גבורה, כמו אריה יהודה',
      gold: 'צבעו זהוב כמו השמש',
    },
  },
];

/**
 * Tag dictionary: the depth each shared quality earns, its Hebrew name, and the
 * insight that names what the two cards share.
 * Levels follow the game's definitions: perceptible (p), cultural symbol (r),
 * abstract principle (d). Sod is never earned by a shared tag alone.
 */
export const TAGS: Record<string, { lv: Exclude<Level, 's'>; name: string; insight: string }> = {
  // Perceptible — you can see, hear or touch it
  green: { lv: 'p', name: 'ירוק', insight: 'צבע משותף, נראה לעין.' },
  red: { lv: 'p', name: 'אדום', insight: 'צבע משותף, נראה לעין.' },
  colorful: { lv: 'p', name: 'צבעוניות', insight: 'שפע צבעים שרואים מיד.' },
  gold: { lv: 'p', name: 'זהב', insight: 'אותו גוון זהוב, שהעין מחברת מיד.' },
  light: { lv: 'p', name: 'אור', insight: 'שניהם קשורים לאור, כל אחד ביחס אחר אליו.' },
  crystal: { lv: 'p', name: 'גביש', insight: 'אותו חומר צלול ושקוף.' },
  sphere: { lv: 'p', name: 'כדור', insight: 'צורה עגולה משותפת.' },
  hard: { lv: 'p', name: 'קשיות', insight: 'מוצקות שמרגישים במגע.' },
  metal: { lv: 'p', name: 'מתכת', insight: 'חומר משותף.' },
  water: { lv: 'p', name: 'מים', insight: 'שניהם שייכים למים.' },
  fire: { lv: 'p', name: 'אש', insight: 'שניהם נראים כאש.' },
  heat: { lv: 'p', name: 'חום', insight: 'שניהם מורגשים כחום.' },
  warmth: { lv: 'p', name: 'חום', insight: 'שניהם מורגשים כחום.' },
  small: { lv: 'p', name: 'קוטן', insight: 'גודל זעיר.' },
  tall: { lv: 'p', name: 'גובה', insight: 'התנשאות שרואים מרחוק.' },
  fragile: { lv: 'p', name: 'שבריריות', insight: 'שניהם נשברים או נחבלים בקלות.' },
  delicate: { lv: 'p', name: 'עדינות', insight: 'עדינות שנראית לעין.' },
  speed: { lv: 'p', name: 'מהירות', insight: 'תנועה מהירה שרואים.' },
  motion: { lv: 'p', name: 'תנועה', insight: 'שניהם נעים כל הזמן.' },
  flow: { lv: 'p', name: 'זרימה', insight: 'תנועה רציפה של זרימה.' },
  night: { lv: 'p', name: 'לילה', insight: 'שייכים לחשכה.' },
  solid: { lv: 'p', name: 'מוצקות', insight: 'מוצקות שאפשר למשש.' },
  electric: { lv: 'p', name: 'חשמל', insight: 'חשמל, נראה ונשמע.' },
  electricity: { lv: 'p', name: 'חשמל', insight: 'שניהם מתרחשים בחשמל.' },
  sudden: { lv: 'p', name: 'פתאומיות', insight: 'שניהם מופיעים ברגע אחד.' },
  earth: { lv: 'p', name: 'אדמה', insight: 'שניהם קשורים לקרקע.' },
  nature: { lv: 'p', name: 'טבע', insight: 'שניהם מן הטבע.' },
  flower: { lv: 'p', name: 'פרח', insight: 'פריחה.' },
  thorns: { lv: 'p', name: 'קוצים', insight: 'קוצים.' },
  silent: { lv: 'p', name: 'שקט', insight: 'שקט שאפשר לשמוע.' },
  flight: { lv: 'p', name: 'מעוף', insight: 'מעוף.' },

  // Symbolic — the shared meaning comes from culture
  beauty: { lv: 'r', name: 'יופי', insight: 'שניהם משמשים בתרבות כסמל של יופי, כל אחד ליופי מסוג אחר.' },
  love: { lv: 'r', name: 'אהבה', insight: 'שניהם סמלים של אהבה.' },
  passion: { lv: 'r', name: 'תשוקה', insight: 'שניהם מסמלים תשוקה.' },
  freedom: { lv: 'r', name: 'חופש', insight: 'שניהם דימויים תרבותיים של חופש.' },
  power: { lv: 'r', name: 'עוצמה', insight: 'שניהם סמלי עוצמה, אבל של כוח מסוג שונה.' },
  majesty: { lv: 'r', name: 'הוד', insight: 'שניהם מעוררים יראת כבוד מלכותית.' },
  king: { lv: 'r', name: 'מלכות', insight: 'שניהם סמלי מלכות.' },
  pride: { lv: 'r', name: 'גאווה', insight: 'גאווה.' },
  leadership: { lv: 'r', name: 'הנהגה', insight: 'הנהגה.' },
  strength: { lv: 'r', name: 'גבורה', insight: 'גבורה.' },
  wisdom: { lv: 'r', name: 'חוכמה', insight: 'שניהם סמלי חוכמה.' },
  value: { lv: 'r', name: 'ערך', insight: 'שניהם מסמלים ערך.' },
  rare: { lv: 'r', name: 'נדירות', insight: 'נדירות שהתרבות הופכת לערך.' },
  danger: { lv: 'r', name: 'סכנה', insight: 'שניהם משמשים בתרבות כאזהרה, סמלים של כוח מסוכן.' },
  feminine: { lv: 'r', name: 'נשיות', insight: 'נשיות.' },
  purify: { lv: 'r', name: 'טוהר', insight: 'טוהר.' },
  mystery: { lv: 'r', name: 'מסתורין', insight: 'שניהם סמלי הנסתר: מה שמבטיח שיש עוד מאחורי.' },
  role: { lv: 'r', name: 'תפקיד', insight: 'תפקיד.' },
  theater: { lv: 'r', name: 'תיאטרון', insight: 'תיאטרון.' },
  story: { lv: 'r', name: 'סיפור', insight: 'סיפור.' },
  eternal: { lv: 'r', name: 'נצח', insight: 'שניהם סמלי נצח.' },
  witness: { lv: 'r', name: 'עדות', insight: 'עדות.' },
  ancient: { lv: 'r', name: 'קדמוניות', insight: 'שניהם נושאים את ההילה של מה שהיה כאן לפנינו.' },
  emotion: { lv: 'r', name: 'רגש', insight: 'שניהם מעוררים רגש בלי מילים.' },
  future: { lv: 'r', name: 'עתיד', insight: 'עתיד.' },
  prediction: { lv: 'r', name: 'ניבוי', insight: 'ניבוי.' },
  illusion: { lv: 'r', name: 'אשליה', insight: 'שניהם עובדים דרך אשליה: מה שרואים אינו מה שיש.' },
  achievement: { lv: 'r', name: 'הישג', insight: 'הישג.' },
  wild: { lv: 'r', name: 'פראות', insight: 'פראות.' },
  vision: { lv: 'r', name: 'ראייה', insight: 'שניהם סמלים של ראייה מעבר לעין הרגילה.' },
  silence: { lv: 'r', name: 'שתיקה', insight: 'שניהם סמלי שתיקה, נוכחות בלי קול.' },
  truth: { lv: 'r', name: 'אמת', insight: 'אמת.' },
  judgment: { lv: 'r', name: 'שיפוט', insight: 'שיפוט.' },

  // Abstract — the same principle or process works in both
  growth: { lv: 'd', name: 'צמיחה', insight: 'אותו עיקרון: גדילה בלתי הפיכה מנקודה קטנה, שאי אפשר לזרז.' },
  life: { lv: 'd', name: 'חיים', insight: 'שניהם תנאי לחיים או צורה שלהם.' },
  potential: { lv: 'd', name: 'פוטנציאל', insight: 'אותו עיקרון: ערך שקיים בכוח, עוד לא בפועל.' },
  beginning: { lv: 'd', name: 'התחלה', insight: 'התחלה.' },
  transformation: { lv: 'd', name: 'גלגול', insight: 'אותו עיקרון: שינוי מהות, לא שינוי צורה. מה שיוצא אינו גרסה משופרת אלא דבר אחר.' },
  ephemeral: { lv: 'd', name: 'ארעיות', insight: 'אותו עיקרון: הקיום הזמני הוא שמעניק את הערך.' },
  cyclic: { lv: 'd', name: 'מחזוריות', insight: 'אותו עיקרון: חזרה מחזורית שאין לה סוף, רק שלבים.' },
  cycle: { lv: 'd', name: 'מחזוריות', insight: 'מחזוריות.' },
  rhythm: { lv: 'd', name: 'קצב', insight: 'אותו עיקרון: חלוקת הזמן לפעימות שחוזרות.' },
  wave: { lv: 'd', name: 'גל', insight: 'אותה פיזיקה: שניהם גלים, ואותן משוואות של תדר ומשרעת מתארות את שניהם.' },
  vibration: { lv: 'd', name: 'רטט', insight: 'רטט.' },
  pattern: { lv: 'd', name: 'דפוס', insight: 'אותו עיקרון: מבנה שחוזר על עצמו ומאפשר לחזות את ההמשך.' },
  spiral: { lv: 'd', name: 'ספירלה', insight: 'אותה גאומטריה: ספירלה, הצורה שבה גדילה וסיבוב נפגשים.' },
  fibonacci: { lv: 'd', name: 'פיבונאצ׳י', insight: 'פיבונאצ׳י.' },
  chaos: { lv: 'd', name: 'כאוס', insight: 'אותו עיקרון: מה שנראה אקראי מכיל סדר שמתגלה בהדרגה.' },
  order: { lv: 'd', name: 'סדר', insight: 'אותו עיקרון: הטלת סדר על מה שהיה מפוזר.' },
  complexity: { lv: 'd', name: 'מורכבות', insight: 'אותו עיקרון: שלם שמורכב מחלקים רבים התלויים זה בזה.' },
  parts: { lv: 'd', name: 'חלקים', insight: 'חלקים.' },
  whole: { lv: 'd', name: 'שלמות', insight: 'שלמות.' },
  unity: { lv: 'd', name: 'אחדות', insight: 'אחדות.' },
  connection: { lv: 'd', name: 'חיבור', insight: 'חיבור.' },
  diversity: { lv: 'd', name: 'גיוון', insight: 'גיוון.' },
  pressure: { lv: 'd', name: 'לחץ', insight: 'אותו עיקרון: הלחץ אינו האויב אלא הכוח המעצב.' },
  clarity: { lv: 'd', name: 'בהירות', insight: 'אותו עיקרון: הערך נמדד בהיעדר פגם או רעש.' },
  reflection: { lv: 'd', name: 'השתקפות', insight: 'אותו עיקרון: מה שנראה הוא תמיד דבר שהוחזר, לא המקור.' },
  time: { lv: 'd', name: 'זמן', insight: 'אותו עיקרון: שניהם מתקיימים בזמן ומתמודדים עם חלופו.' },
  past: { lv: 'd', name: 'עבר', insight: 'עבר.' },
  mortality: { lv: 'd', name: 'סופיות', insight: 'סופיות.' },
  measurement: { lv: 'd', name: 'מדידה', insight: 'אותו עיקרון: הפיכת דבר חמקמק למספר שאפשר להשוות.' },
  balance: { lv: 'd', name: 'איזון', insight: 'איזון.' },
  equality: { lv: 'd', name: 'שוויון', insight: 'שוויון.' },
  decision: { lv: 'd', name: 'הכרעה', insight: 'הכרעה.' },
  weight: { lv: 'd', name: 'משקל', insight: 'משקל.' },
  precision: { lv: 'd', name: 'דיוק', insight: 'אותו עיקרון: ההבדל בין עובד ללא עובד נמדד בפרטים זעירים.' },
  access: { lv: 'd', name: 'גישה', insight: 'גישה.' },
  unlock: { lv: 'd', name: 'פתיחה', insight: 'פתיחה.' },
  solution: { lv: 'd', name: 'פתרון', insight: 'אותו עיקרון: התאמה מדויקת אחת בין בעיה לתשובה.' },
  control: { lv: 'd', name: 'שליטה', insight: 'שליטה.' },
  record: { lv: 'd', name: 'תיעוד', insight: 'תיעוד.' },
  memory: { lv: 'd', name: 'זיכרון', insight: 'זיכרון.' },
  knowledge: { lv: 'd', name: 'ידע', insight: 'ידע.' },
  language: { lv: 'd', name: 'שפה', insight: 'אותו עיקרון: מערכת סימנים שמעבירה משמעות מאחד לאחר.' },
  portal: { lv: 'd', name: 'מעבר', insight: 'מעבר.' },
  discovery: { lv: 'd', name: 'גילוי', insight: 'אותו עיקרון: גילוי, חשיפת מה שהיה שם ולא נראה.' },
  exploration: { lv: 'd', name: 'חקירה', insight: 'חקירה.' },
  extend: { lv: 'd', name: 'הרחבה', insight: 'הרחבה.' },
  reveal: { lv: 'd', name: 'חשיפה', insight: 'אותו עיקרון: חשיפה, הפיכת הסמוי לגלוי.' },
  hide: { lv: 'd', name: 'הסתרה', insight: 'הסתרה.' },
  duality: { lv: 'd', name: 'כפילות', insight: 'כפילות.' },
  identity: { lv: 'd', name: 'זהות', insight: 'זהות.' },
  creativity: { lv: 'd', name: 'יצירה', insight: 'יצירה.' },
  insight: { lv: 'd', name: 'תובנה', insight: 'תובנה.' },
  innovation: { lv: 'd', name: 'חידוש', insight: 'חידוש.' },
  survival: { lv: 'd', name: 'הישרדות', insight: 'הישרדות.' },
  depth: { lv: 'd', name: 'עומק', insight: 'אותו עיקרון: העיקר נמצא מתחת לפני השטח.' },
  hidden: { lv: 'd', name: 'נסתר', insight: 'נסתר.' },
  consume: { lv: 'd', name: 'כילוי', insight: 'כילוי.' },
  destruction: { lv: 'd', name: 'הרס', insight: 'הרס.' },
  creation: { lv: 'd', name: 'בריאה', insight: 'בריאה.' },
  nuclear: { lv: 'd', name: 'גרעין', insight: 'גרעין.' },
  energy: { lv: 'd', name: 'אנרגיה', insight: 'אותו עיקרון: אנרגיה שנאגרה ומשתחררת ומשנה את מה שסביבה.' },
  force: { lv: 'd', name: 'כוח', insight: 'אותו עיקרון: כוח פיזיקלי שפועל על כל מה שבדרכו.' },
  vortex: { lv: 'd', name: 'מערבולת', insight: 'מערבולת.' },
  tides: { lv: 'd', name: 'גאות', insight: 'גאות.' },
  distance: { lv: 'd', name: 'מרחק', insight: 'מרחק.' },
  infinite: { lv: 'd', name: 'אינסוף', insight: 'אינסוף.' },
  map: { lv: 'd', name: 'מפה', insight: 'מפה.' },
  missing: { lv: 'd', name: 'חסר', insight: 'חסר.' },
  fit: { lv: 'd', name: 'התאמה', insight: 'התאמה.' },
  focus: { lv: 'd', name: 'מיקוד', insight: 'אותו עיקרון: ריכוז הכול בנקודה אחת.' },
  direction: { lv: 'd', name: 'כיוון', insight: 'כיוון.' },
  purpose: { lv: 'd', name: 'תכלית', insight: 'תכלית.' },
  carbon: { lv: 'd', name: 'פחמן', insight: 'פחמן.' },
};

/** Jungian archetype names in Hebrew, with what each archetype stands for. */
export const ARCHETYPES: Record<string, { name: string; gist: string }> = {
  hero: { name: 'הגיבור', gist: 'הכוח שיוצא למסע, מתגבר ומאיר את הדרך לאחרים' },
  sage: { name: 'החכם', gist: 'מי שיודע, שוקל ומחזיק את הידע לאורך זמן' },
  trickster: { name: 'התעתוען', gist: 'מי שמשנה צורה, משבש סדר ומגלה אמת דרך תחבולה' },
  lover: { name: 'המאהב', gist: 'התשוקה, היופי והקשר הרגשי' },
  innocent: { name: 'התמים', gist: 'ההתחלה הטהורה, האמון והתקווה' },
  shadow: { name: 'הצל', gist: 'מה שמודחק, הכוחות הלא נשלטים שמתחת לפני השטח' },
  ruler: { name: 'השליט', gist: 'הסמכות, הסדר והאחריות על הממלכה' },
  anima: { name: 'האנימה', gist: 'הצד הרגשי, האינטואיטיבי והנשי של הנפש' },
};

export const DOMAINS: Record<string, string> = {
  nature: 'הטבע', animal: 'עולם החי', object: 'עולם החפצים', abstract: 'עולם הרעיונות', art: 'עולם האמנות',
};

/**
 * Concept families: different tags that express the same underlying idea.
 * Two cards with different tags from one family are read as an analogy.
 */
export const FAMILIES: { name: string; lv: 'r' | 'd'; insight: string; tags: string[] }[] = [
  { name: 'מדידה וסדר', lv: 'd', insight: 'שניהם מכניסים סדר למה שחמקמק: מודדים, מסדרים, מדייקים.', tags: ['precision', 'measurement', 'order', 'weight', 'balance'] },
  { name: 'חשיפה וראייה', lv: 'd', insight: 'שניהם פועלים על הגבול בין הנראה לנסתר: אחד מסתיר, אחד חושף, או ששניהם חושפים בדרכים שונות.', tags: ['reveal', 'vision', 'discovery', 'extend', 'hidden', 'hide', 'mystery', 'depth', 'illusion', 'reflection'] },
  { name: 'צדק והכרעה', lv: 'd', insight: 'שניהם עוסקים בהכרעה: איך מחליטים מה נכון ומה ראוי.', tags: ['judgment', 'truth', 'decision', 'equality', 'balance'] },
  { name: 'כיוון ותכלית', lv: 'd', insight: 'שניהם מכוונים אל נקודה: תנועה שיש לה סיבה ויעד.', tags: ['focus', 'purpose', 'direction', 'achievement', 'solution'] },
  { name: 'השלם וחלקיו', lv: 'd', insight: 'שניהם עוסקים ביחס בין חלקים לשלם: איך הרבה נעשה אחד.', tags: ['whole', 'unity', 'connection', 'complexity', 'parts', 'fit', 'missing', 'diversity', 'map'] },
  { name: 'הזמן', lv: 'd', insight: 'שניהם מתמודדים עם הזמן: מודדים אותו, נשחקים בו או נשמרים מפניו.', tags: ['time', 'past', 'mortality', 'cycle', 'cyclic', 'ephemeral', 'eternal', 'ancient', 'record', 'memory', 'future'] },
  { name: 'אנרגיה וכוח', lv: 'd', insight: 'שניהם ביטויים של אנרגיה: כוח שנאגר, משתחרר ומשנה את סביבתו.', tags: ['energy', 'force', 'power', 'electric', 'electricity', 'nuclear', 'pressure', 'heat'] },
  { name: 'חיים וצמיחה', lv: 'd', insight: 'שניהם קשורים ללידה של משהו חדש: חיים, התחלה, פוטנציאל.', tags: ['growth', 'life', 'potential', 'beginning', 'creation', 'survival'] },
  { name: 'שינוי מהות', lv: 'd', insight: 'שניהם משנים מהות: מה שנכנס אליהם יוצא אחר.', tags: ['transformation', 'consume', 'destruction', 'purify', 'creation', 'pressure'] },
  { name: 'ידע ושפה', lv: 'd', insight: 'שניהם נושאים משמעות: שומרים אותה, מעבירים אותה או מקודדים אותה.', tags: ['language', 'story', 'record', 'memory', 'knowledge', 'wisdom', 'portal'] },
  { name: 'יצירה והארה', lv: 'd', insight: 'שניהם קשורים לרגע של יצירה: משהו שלא היה, ופתאום ישנו.', tags: ['creativity', 'insight', 'innovation', 'discovery', 'sudden', 'potential'] },
  { name: 'גל וקצב', lv: 'd', insight: 'שניהם מתנהגים כמו גל: תנועה שחוזרת בקצב.', tags: ['wave', 'vibration', 'rhythm', 'flow', 'motion', 'tides', 'cyclic'] },
  { name: 'דפוס וכאוס', lv: 'd', insight: 'שניהם מראים איך סדר מתגלה בתוך מה שנראה אקראי.', tags: ['pattern', 'spiral', 'fibonacci', 'order', 'chaos', 'vortex'] },
  { name: 'זהות ותפקיד', lv: 'd', insight: 'שניהם שואלים מה אמיתי ומה מוצג: זהות, תפקיד, פנים כפולות.', tags: ['identity', 'role', 'duality', 'illusion', 'hide', 'theater', 'reflection'] },
  { name: 'גישה ושליטה', lv: 'd', insight: 'שניהם קובעים מה נפתח ולמי: שליטה, גישה והתאמה.', tags: ['access', 'unlock', 'control', 'solution', 'fit'] },
  { name: 'אור', lv: 'r', insight: 'שניהם קשורים לאור, ובתרבות האור הוא תמיד גם ידיעה.', tags: ['light', 'fire', 'warmth', 'gold', 'clarity', 'insight'] },
  { name: 'הוד ומלכות', lv: 'r', insight: 'שניהם נושאים הילה של מלכות: גובה, סמכות, יראה.', tags: ['majesty', 'king', 'leadership', 'pride', 'tall', 'power', 'strength'] },
  { name: 'רגש ויופי', lv: 'r', insight: 'שניהם פונים ללב לפני השכל.', tags: ['beauty', 'love', 'passion', 'emotion', 'colorful'] },
  { name: 'סכנה ופראות', lv: 'r', insight: 'שניהם מסמלים כוח שאי אפשר לרסן עד הסוף.', tags: ['danger', 'wild', 'force', 'thorns'] },
  { name: 'שקט', lv: 'r', insight: 'שניהם מסמלים נוכחות שאינה זקוקה לקול.', tags: ['silence', 'silent', 'night', 'depth'] },
  { name: 'ניבוי וראייה קדימה', lv: 'r', insight: 'שניהם מבטיחים לראות את מה שעוד לא כאן.', tags: ['future', 'prediction', 'vision', 'distance', 'exploration'] },
  { name: 'שבריריות וחלוף', lv: 'r', insight: 'שניהם מזכירים כמה מהר יופי יכול להיעלם.', tags: ['fragile', 'delicate', 'ephemeral', 'small'] },
  { name: 'נדיר ויקר', lv: 'r', insight: 'שניהם נושאים ערך שהתרבות מעניקה לנדיר.', tags: ['rare', 'value', 'gold', 'crystal'] },
];
