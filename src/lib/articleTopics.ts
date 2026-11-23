/** The three topics of the articles page. */
export type ArticleTopic = 'explain' | 'types' | 'creative';

export const TOPICS: { id: ArticleTopic; label: string; short: string; lead: string }[] = [
  { id: 'explain', label: 'הסבר', short: 'הסבר', lead: 'למה חיבור בין שתי תמונות הוא אימון למחשבה.' },
  { id: 'types', label: 'סוגי קשרים', short: 'סוגים', lead: 'הדרגות והמשפחות שבהן שני דברים נקשרים.' },
  { id: 'creative', label: 'קשרים יצירתיים', short: 'יצירתיים', lead: 'הגשר הנסתר, והסוד שמתגלה.' },
];

