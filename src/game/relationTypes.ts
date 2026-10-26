import type { Level } from './gameItems';

/** A kind of connection, outside the four-depth scale. */
export interface RelationType {
  name: string;
  definition: string;
  example: string;
}

/** Families of connection types. They are not ranked; each tends to land on certain depths. */
export interface RelationGroup {
  id: string;
  name: string;
  gist: string;
  /** Depths this family usually reaches in the game. */
  levels: Level[];
  types: RelationType[];
}

export const RELATION_GROUPS: RelationGroup[] = [
  {
    id: 'similarity', name: 'דמיון', gist: 'שני דברים חולקים תכונה, צורה או מבנה.', levels: ['p', 'r', 'd'],
    types: [
      { name: 'דמיון צורני', definition: 'אותה צורה, צבע או חומר.', example: 'שמש ובדולח: שניהם כדור.' },
      { name: 'אנלוגיה', definition: 'אותו יחס פנימי בשני תחומים שונים.', example: 'גל ותו: אותה משוואת גלים.' },
      { name: 'מטאפורה', definition: 'מעבירים שם של דבר אחד לדבר אחר בזכות דמיון.', example: 'רעיון הוא "הארה".' },
    ],
  },
  {
    id: 'contrast', name: 'ניגוד', gist: 'שני דברים מגדירים זה את זה דרך ההפך.', levels: ['r', 's'],
    types: [
      { name: 'הפכים', definition: 'שני קצוות של אותו ציר.', example: 'שמש וירח: יום ולילה.' },
      { name: 'ניגוד משלים', definition: 'שני חצאים שרק יחד הם שלם.', example: 'מסכת הצחוק ומסכת הבכי.' },
      { name: 'פרדוקס', definition: 'סתירה שמתגלה כאמת.', example: 'אש יוצרת במה שהיא מכלה.' },
    ],
  },
  {
    id: 'contiguity', name: 'סמיכות', gist: 'שני דברים נפגשים באותו מקום או באותו זמן.', levels: ['p', 'r'],
    types: [
      { name: 'סמיכות במקום', definition: 'נמצאים יחד.', example: 'דג וגל: שניהם בים.' },
      { name: 'סמיכות בזמן', definition: 'מופיעים באותו רגע.', example: 'ברק ורעם.' },
      { name: 'מטונימיה', definition: 'שם של דבר סמוך משמש במקום הדבר עצמו.', example: '"הכתר" במקום המלך.' },
    ],
  },
  {
    id: 'causality', name: 'סיבתיות', gist: 'דבר אחד גורם לשני, או נדרש לו.', levels: ['d', 's'],
    types: [
      { name: 'סיבה ותוצאה', definition: 'האחד מחולל את השני.', example: 'הירח מחולל גאות.' },
      { name: 'אמצעי ומטרה', definition: 'האחד הוא הדרך אל השני.', example: 'מפתח ופתיחה.' },
      { name: 'תנאי הכרחי', definition: 'בלי האחד, השני לא קיים.', example: 'שמש ונבט.' },
    ],
  },
  {
    id: 'structure', name: 'מבנה', gist: 'היחס בין מושגים במערכת מסודרת של מילים.', levels: ['p'],
    types: [
      { name: 'כלל ופרט', definition: 'אחד הוא סוג של השני (היפונימיה).', example: 'פרח וורד.' },
      { name: 'חלק ושלם', definition: 'אחד הוא חלק מהשני (מרונימיה).', example: 'חלק פאזל והתמונה.' },
      { name: 'אותה קבוצה', definition: 'שניהם חברים באותה משפחה.', example: 'ברק, שמש וירח: תופעות שמיים.' },
    ],
  },
  {
    id: 'language', name: 'לשון', gist: 'הקשר נמצא במילה עצמה, לא בדבר.', levels: ['r', 's'],
    types: [
      { name: 'שורש משותף', definition: 'שתי מילים מאותו שורש.', example: 'אור ואורה.' },
      { name: 'כפל משמעות', definition: 'מילה אחת לשני דברים.', example: 'מפתח בדלת ומפתח במוזיקה.' },
      { name: 'צירוף וניב', definition: 'השפה כבר חיברה ביניהם.', example: '"גיבור כארי".' },
    ],
  },
  {
    id: 'culture', name: 'תרבות', gist: 'משמעות שתרבות שלמה העניקה לשני דברים.', levels: ['r'],
    types: [
      { name: 'סמל', definition: 'דבר שמייצג רעיון לפי מוסכמה.', example: 'מאזניים לצדק.' },
      { name: 'ארכיטיפ', definition: 'דמות יסוד שחוזרת בכל התרבויות (יונג).', example: 'אריה ושמש: השליט והגיבור.' },
      { name: 'מיתוס', definition: 'סיפור שמחבר ביניהם.', example: 'ירח ואלות הירח.' },
    ],
  },
  {
    id: 'personal', name: 'אישי', gist: 'קשר שנולד מהחיים של מי שרואה אותו.', levels: [],
    types: [
      { name: 'זיכרון', definition: 'רגע שבו שני הדברים נפגשו בחיים שלכם.', example: 'ורד מחתונה, שעון של סבא.' },
      { name: 'רגש', definition: 'אותה תחושה ששניהם מעוררים בכם.', example: 'ים ומוזיקה שמרגיעים.' },
      { name: 'הקשר מקומי', definition: 'משמעות שיש רק בקהילה או במקום מסוים.', example: 'אריה בירושלים.' },
    ],
  },
];

/** Classic frameworks that sort associations, and which families each one names. */
export const FRAMEWORKS: { who: string; when: string; work: string; idea: string; groups: string[] }[] = [
  { who: 'אריסטו', when: 'המאה ה-4 לפנה״ס', work: 'על הזיכרון וההיזכרות', idea: 'זיכרון אחד מעלה אחר בשלוש דרכים: דמיון, ניגוד וסמיכות.', groups: ['similarity', 'contrast', 'contiguity'] },
  { who: 'מסורת הפרד״ס', when: 'ימי הביניים', work: 'פשט, רמז, דרש, סוד', idea: 'ארבע שכבות של פרשנות, מהגלוי אל הנסתר. זה הסולם שהמשחק מודד בו עומק.', groups: [] },
  { who: 'דייוויד יום', when: '1739', work: 'מסכת על טבע האדם', idea: 'שלושה עקרונות קושרים רעיונות: דמיון, סמיכות בזמן ובמקום, סיבה ותוצאה.', groups: ['similarity', 'contiguity', 'causality'] },
  { who: 'צ׳רלס סנדרס פירס', when: 'סוף המאה ה-19', work: 'תורת הסימנים', idea: 'סימן מתקשר למסומן בשלוש דרכים: איקון (דמיון), אינדקס (סמיכות או סיבה), סמל (מוסכמה).', groups: ['similarity', 'causality', 'culture'] },
  { who: 'קרל גוסטב יונג', when: 'המחצית הראשונה של המאה ה-20', work: 'הארכיטיפים והלא-מודע הקיבוצי', idea: 'דמויות יסוד חוזרות בכל התרבויות, ומחברות דברים שונים לאותה משמעות.', groups: ['culture'] },
  { who: 'רומן יאקובסון', when: '1956', work: 'שני היבטים של לשון', idea: 'השפה נעה על שני צירים: ציר הדמיון (מטאפורה) וציר הסמיכות (מטונימיה).', groups: ['similarity', 'contiguity', 'language'] },
  { who: 'שרנוף מדניק', when: '1962', work: 'מבחן האסוציאציות הרחוקות', idea: 'יצירתיות היא היכולת לחבר מילים רחוקות דרך מילה שלישית.', groups: ['personal'] },
  { who: 'WordNet', when: 'משנת 1985', work: 'אוניברסיטת פרינסטון', idea: 'מפה של השפה האנגלית לפי יחסים: נרדפות, הפכים, כלל ופרט, חלק ושלם.', groups: ['structure', 'contrast'] },
];
