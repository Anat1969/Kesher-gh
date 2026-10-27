import { ITEMS, type Level } from './gameItems';
import { evaluate } from './evaluator';
import { gameReducer, initialState, totalScore, type GameState } from './engine';

/**
 * The four sons of the Passover Haggadah as standing players on the all-time board.
 * Each one plays the real game (same board, same scoring, same chain bonuses) with two limits
 * that follow the Haggadah: the levels of connection he is able to see, and how many links he
 * makes in five minutes (how much he asks). His score is computed, never typed in.
 */
export interface Son {
  id: string;
  name: string;
  /** His question in the Haggadah, and the verse it quotes. */
  asks: string;
  source: string;
  /** The answer the Haggadah gives him. */
  answer: string;
  /** Levels of connection he can see. */
  sees: Level[];
  /** Links he makes in a five-minute game. */
  links: number;
  /** Why these limits, in one line, with the insight marked. */
  why: string;
}

export const SONS: Son[] = [
  {
    id: 'son:chacham',
    name: 'חכם',
    asks: 'מה העדות והחקים והמשפטים אשר צוה ה׳ אלהינו אתכם?',
    source: 'דברים ו, כ',
    answer: 'ואף אתה אמור לו כהלכות הפסח: אין מפטירין אחר הפסח אפיקומן.',
    sees: ['p', 'r', 'd', 's'],
    links: 18,
    why: 'מבחין בין סוגים, כולל **החוקים שטעמם נסתר**, ושואל עד הפרט האחרון. רואה **את כל ארבע הרמות, עד הסוד**.',
  },
  {
    id: 'son:rasha',
    name: 'רשע',
    asks: 'מה העבודה הזאת לכם?',
    source: 'שמות יב, כו',
    answer: 'לכם ולא לו. ולפי שהוציא את עצמו מן הכלל, כפר בעיקר. ואף אתה הקהה את שיניו.',
    sees: ['p', 'r', 'd'],
    links: 14,
    why: 'חד ומנתח את **השיטה כולה**, אבל "לכם ולא לו": עומד בחוץ. מגיע **עד הדרש, ולא לסוד**.',
  },
  {
    id: 'son:tam',
    name: 'תם',
    asks: 'מה זאת?',
    source: 'שמות יג, יד',
    answer: 'בחוזק יד הוציאנו ה׳ ממצרים מבית עבדים.',
    sees: ['p', 'r'],
    links: 10,
    why: 'שואל שאלה פשוטה ומקבל **סיפור ודימוי** ("בחוזק יד"). רואה את **הגלוי ואת הסמל**.',
  },
  {
    id: 'son:eino',
    name: 'שאינו יודע לשאול',
    asks: 'אינו שואל.',
    source: 'שמות יג, ח',
    answer: 'את פתח לו, שנאמר: והגדת לבנך ביום ההוא לאמר, בעבור זה עשה ה׳ לי בצאתי ממצרים.',
    sees: ['p'],
    links: 5,
    why: '"בעבור **זה**": מראים לו את מה שמונח לפניו. רואה **רק את הגלוי**, ומחבר מעט.',
  },
];

function playFrom(son: Son, start: number): GameState {
  let state = gameReducer(initialState('game'), { type: 'pick', card: start });
  const can = new Set(son.sees);
  while (state.directConns.length < son.links && state.screen === 'game') {
    let best: GameState | null = null;
    for (let c = 0; c < ITEMS.length; c++) {
      if (state.path.includes(c) || !can.has(evaluate(state.currentCard, c).lv)) continue;
      const next = gameReducer(state, { type: 'pick', card: c });
      if (!best || totalScore(next) > totalScore(best)) best = next;
    }
    if (!best) break; // nothing he can see from here
    state = best;
  }
  return state;
}

export interface SonResult extends Son {
  best: number;
  path: number[];
  levels: Level[];
}

let cache: SonResult[] | null = null;

/** Each son's best game: his strategy (always the strongest link he can see) from every start card. */
export function sonResults(): SonResult[] {
  if (cache) return cache;
  cache = SONS.map(son => {
    let top: GameState | null = null;
    for (let s = 0; s < ITEMS.length; s++) {
      const g = playFrom(son, s);
      if (!top || totalScore(g) > totalScore(top)) top = g;
    }
    return { ...son, best: totalScore(top!), path: top!.path, levels: top!.directConns.map(c => c.ev.lv) };
  });
  return cache;
}

/** The highest son a score reaches or passes, or null below all four. */
export function sonReached(score: number): SonResult | null {
  return sonResults().find(s => score >= s.best) ?? null;
}
