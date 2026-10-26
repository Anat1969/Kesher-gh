import type { Level } from './gameItems';
import type { Evaluation } from './evaluator';
import { ITEMS, LEVEL_NAMES, LEVEL_COLORS } from './gameItems';

export interface Connection {
  a: number;
  b: number;
  ev: Evaluation;
  isChain?: boolean;
  /** Key of the reading the player said they meant, and its level. */
  meant?: string;
  meantLv?: Level;
  /** The player's own words for the connection. */
  note?: string;
  bonus?: number;
  bridge?: number;
}

export interface PersonalityResult {
  type: string;
  emoji: string;
  desc: string;
  strength: string;
  growth: string;
  cnt: Record<Level, number>;
  deepRatio: number;
  best: Connection | null;
}

export function analyzePersonality(directConns: Connection[], chainConns: Connection[]): PersonalityResult {
  const cnt: Record<Level, number> = { p: 0, r: 0, d: 0, s: 0 };
  // The thinking profile follows what the player meant, when they told us.
  directConns.forEach(c => cnt[c.meantLv ?? c.ev.lv]++);
  const total = directConns.length || 1;
  const ratios = { p: cnt.p / total, r: cnt.r / total, d: cnt.d / total, s: cnt.s / total };
  const deepRatio = (cnt.d + cnt.s) / total;
  const chainRatio = chainConns.length / Math.max(1, directConns.length);

  let type: string, emoji: string, desc: string, strength: string, growth: string;

  if (ratios.s > 0.35) {
    // Many sod connections — mystical leap thinker
    type = 'הפייטן המיסטי'; emoji = '🔮';
    desc = 'החשיבה שלך קופצת מעבר לגבולות הקטגוריה — אתה מחבר בין דברים שרוב האנשים לא מרשים לעצמם לחבר. הקשרים שמצאת לא מוסברים בהיגיון לינארי; הם מגיעים ממקום אחר לגמרי.';
    strength = 'אסוציאטיביות חופשית ואמיצה. אתה לא מפחד מחיבורים שנראים "מוזרים" מבחוץ — ובדיוק שם, במרחב שרוב האנשים מתרחקים ממנו, חיים הרעיונות הגדולים ביותר.';
    growth = 'נסה לבנות את הגשר הלוגי שמחבר את הקצוות שמצאת. לא כדי לצמצם את האינטואיציה — אלא כדי להפוך את ה"מוזר" לאמין עבור אחרים, וכך להוביל אותם לאותו המקום שאתה כבר רואה.';
  } else if (ratios.s > 0.2 && ratios.d > 0.25) {
    // Mix of sod and drash — paradox explorer
    type = 'חוקר הפרדוקס'; emoji = '♾️';
    desc = 'אתה חי בנוח עם הסתירה. הראש שלך לא ממהר לפתור מתחים — הוא מתעניין בהם. כשאחרים רואים שני דברים שמתנגשים, אתה שואל: "מה הם אומרים ביחד שכל אחד לא יכול לומר לבד?"';
    strength = 'יכולת נדירה לחיות בין שתי אמיתות סותרות בלי לבחור צד מהר מדי. זה מה שמאפיין חשיבה עמוקה — לעצור לפני המסקנה המהירה.';
    growth = 'הפרדוקסים שמצאת הם שאלות, לא תשובות. נסה לשאול: "אם שניהם נכונים — מה זה משנה לגבי האופן שבו אני חי?"';
  } else if (ratios.d > 0.4) {
    // Many drash connections — principle seeker
    type = 'הפילוסוף'; emoji = '⚖️';
    desc = 'הראש שלך לא מסתפק בפרטים — הוא מחפש את העיקרון שמאחורי הכל. כשאתה רואה שניים שנראים שונים, השאלה הראשונה שלך היא: "מה חוק הטבע שגורם לשניהם להתנהג כך?"';
    strength = 'זיהוי דפוסים אוניברסליים ועקרונות מנחים. כשאתה מסביר משהו, אנשים מרגישים שהם מבינים משהו עמוק יותר ממה שנשאלו עליו — כי אתה מגיע לשורש.';
    growth = 'שחק עם הפרדוקסים — הסתירות הן שם שמחכות ה"סוד". הפילוסוף הגדול ביותר הוא זה שיכול להחזיק שתי אמיתות שמתנגשות ולשאול "מה שתיהן מגלות יחד?"';
  } else if (ratios.r > 0.35 && ratios.s > 0.1) {
    // Symbolic + some sod — mythic storyteller
    type = 'המספר המיתי'; emoji = '🌙';
    desc = 'אתה חושב בדימויים ובסיפורים — אבל לא רק. מתחת לסמלים שמצאת יש שאלות שקצת הפתיעו אותך בעצמך. אתה בין עולמות: הסמלי הוא הבית שלך, אבל הנסתר מושך אותך.';
    strength = 'אינטליגנציה תרבותית ועומק. אנשים זוכרים מה שאמרת כי אמרת אותו בצורה שנרשמת — דרך תמונה, דרך סיפור, דרך רגע שנגע.';
    growth = 'הסמל שמצאת — מה הוא מסתיר? שאל את עצמך: "מה לא אמרתי כשבחרתי את הדימוי הזה?" שם מתחיל הסוד.';
  } else if (ratios.r > 0.4) {
    // Many remez connections — symbolic thinker
    type = 'הסיפורן'; emoji = '📖';
    desc = 'אתה חושב בסמלים ובנרטיבים. כל דבר בשבילך הוא מטאפורה לדבר אחר, וכל שניים הם סיפור שמחכה לסיום. החיבורים שמצאת מספרים משהו — אתה רק ניסחת אותו.';
    strength = 'אינטליגנציה תרבותית עשירה ויכולת תקשורת דרך דימויים. אנשים זוכרים את מה שאמרת — כי אמרת אותו בצורה שנרשמת.';
    growth = 'נסה להעמיק אל מעבר לסמל — מה הרעיון הבסיסי שמאחורי המטאפורה? מה המטאפורה *מסתירה* שהיא לא אומרת ישירות?';
  } else if (ratios.p > 0.5) {
    // Many pshat connections — sharp observer
    type = 'המנתח החד-עין'; emoji = '🔭';
    desc = 'אתה רואה את המובן מאליו בחדות שאחרים מפספסים. הבסיס הוא החוזקה שלך — אתה לא קופץ לפני שהבנת את הקרקע. כל שאר הבניין יעמוד כי היסודות שלך חזקים.';
    strength = 'דיוק, ראיית מציאות, ויכולת לזהות קשרים ישירים שאחרים מפספסים בגלל שהם בולטים מדי. אתה לא מתבייש לומר את הפשוט — ולפעמים הפשוט הוא הנכון ביותר.';
    growth = 'אחרי שראית "מה שגלוי" — שאל "מה נסתר כאן?" הפשט הוא רק השאלה הראשונה. מה תמצא אם תמשיך לחפור אחרי שהמובן מאליו כבר ידוע?';
  } else if (ratios.p > 0.3 && ratios.d > 0.2) {
    // Mix of pshat and drash — pattern recognizer
    type = 'רואה הדפוסים'; emoji = '🧩';
    desc = 'אתה עובד בשני שכבות במקביל: רואה את מה שגלוי, אבל כל הזמן שואל "מה הכלל שמסביר את זה?" החיבורים שלך לא רק מתארים — הם מסווגים, ממפים, מארגנים לדפוס שאפשר לסמוך עליו.';
    strength = 'חשיבה אנליטית שמחפשת הכללה. אתה לא מרוצה עד שמצאת את הכלל שגורם לדוגמאות להיות הגיוניות — וזה נכס עצום.';
    growth = 'כשמצאת דפוס — חפש את הדוגמה שפורצת אותו. הכלל שעומד בפני החריג שלו הוא הכלל האמיתי.';
  } else if (chainRatio > 0.8) {
    // High chain ratio — network thinker
    type = 'בונה הגשרים'; emoji = '⛓';
    desc = 'החשיבה שלך בנויה ברשתות. כל חיבור שאתה עושה פותח שלושה נוספים. אתה לא מחבר נקודות — אתה בונה מפה. המרחב בין הדברים הוא גם חלק מהמפה שלך.';
    strength = 'חשיבה מערכתית. אתה לא רואה דברים בודדים — אתה רואה איך הכל קשור לכל. זו מיומנות נדירה מאוד שנחוצה בכל בעיה מורכבת.';
    growth = 'נסה לבחור כמה חיבורים ולהעמיק אותם לחלוטין במקום להרחיב ללא הגבלה. עומק ביחד עם רוחב — זה המשחק הגדול.';
  } else {
    // Balanced — curious explorer
    type = 'הסייר הסקרן'; emoji = '🌐';
    desc = 'אתה מגלה שכל מקום מוביל למקום אחר. הסקרנות היא הכלי העיקרי שלך — אתה לא מפחד להתחיל מנקודה ולראות לאן היא מובילה. הגמישות הזאת היא לא חוסר כיוון; היא בחירה.';
    strength = 'רוחב אופקים ויכולת למצוא עניין בכל זוג אפשרי. הסקרנות שלך היא גם הנשק הגדול ביותר של יצירתיות — ראיית הקשר שאחרים לא עצרו לחפש.';
    growth = 'בחר כיוון ולך עמוק. הסקרנות שמוסיפה שאלות יותר מתשובות — הפוך אותה לסקרנות שבונה עולם שלם סביב שאלה אחת.';
  }

  const best = directConns.length > 0
    ? directConns.reduce((m, c) => c.ev.sc > m.ev.sc ? c : m, directConns[0])
    : null;

  return { type, emoji, desc, strength, growth, cnt, deepRatio, best };
}
