import type { Level } from './gameItems';

export const LEVEL_INFO: Record<Level, { title: string; desc: string; examples: string }> = {
  p: { title: 'קשר גלוי', desc: 'מה שכולם רואים מיד', examples: 'שניהם מהטבע, שניהם עגולים, שניהם מאירים.' },
  r: { title: 'קשר סמלי', desc: 'מטאפורה, ייצוג תרבותי', examples: 'אחד מסמל את השני, קשר מיתולוגי, הפכים.' },
  d: { title: 'קשר מופשט', desc: 'מושג, תהליך, עיקרון', examples: 'שניהם עוסקים בשינוי, עקרונות פנימיים משותפים.' },
  s: { title: 'קשר נסתר', desc: 'פרדוקס, קפיצה יצירתית', examples: 'סתירה שהיא אמת, חיבור עמוק בין תחומים.' },
};
