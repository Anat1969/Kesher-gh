import { CLASSIC_DECK, NEW_DECK, type Level } from './gameItems';
import { dealDeck, type DeckMode } from './deck';
import { evaluate } from './evaluator';
import { gameReducer, initialState, totalScore, type GameState } from './engine';

/**
 * The four sons of the Passover Haggadah as standing players on the all-time board.
 * Each one plays the real game (same board, same scoring, same chain bonuses) with two limits
 * that follow the Haggadah (always on the classic board, so the standing scores never move): the levels of connection he is able to see, and how many links he
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

function playFrom(son: Son, start: number, deck: readonly number[]): GameState {
  let state = gameReducer({ ...initialState('game'), deck: [...deck] }, { type: 'pick', card: start });
  const can = new Set(son.sees);
  while (state.directConns.length < son.links && state.screen === 'game') {
    let best: GameState | null = null;
    for (const c of deck) {
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

/** A son's best game on one board: his strategy from every start card. */
function bestOn(son: Son, deck: readonly number[]): GameState {
  let top: GameState | null = null;
  for (const s of deck) {
    const g = playFrom(son, s, deck);
    if (!top || totalScore(g) > totalScore(top)) top = g;
  }
  return top!;
}

/** Seeded boards for the "changing board" standing score: the same for every visitor. */
const MIX_SAMPLE = 4;
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const cache = new Map<DeckMode, SonResult[]>();

/**
 * Each son's standing score on a kind of board. Classic and new: his best game on that board.
 * Changing board: the mean of his best games on a fixed sample of dealt boards, since every
 * player meets a different one.
 */
export function sonResults(board: DeckMode = 'classic'): SonResult[] {
  const hit = cache.get(board);
  if (hit) return hit;
  const decks = board === 'classic' ? [CLASSIC_DECK] : board === 'new' ? [NEW_DECK]
    : Array.from({ length: MIX_SAMPLE }, (_, k) => dealDeck('mix', seeded(2026 + k)));
  const out = SONS.map(son => {
    const games = decks.map(d => bestOn(son, d));
    const mean = Math.round(games.reduce((t, g) => t + totalScore(g), 0) / games.length);
    const top = games[0];
    return { ...son, best: mean, path: top.path, levels: top.directConns.map(c => c.ev.lv) };
  });
  cache.set(board, out);
  return out;
}

/**
 * The standing scores as the board shows them, without making the visitor wait for the search.
 * They are the output of sonResults(), never typed by hand: sons.test recomputes all three
 * boards and fails if one number here differs.
 */
export const STANDING: Record<DeckMode, number[]> = {
  classic: [688, 400, 208, 48],
  new: [680, 404, 196, 22],
  mix: [680, 402, 202, 37],
};

/** The four sons with their standing score on a board (instant). */
export function sonStanding(board: DeckMode = 'classic') {
  return SONS.map((son, i) => ({ ...son, best: STANDING[board][i] }));
}

/** The highest son a score reaches or passes, or null below all four. */
export function sonReached(score: number, board: DeckMode = 'classic') {
  return sonStanding(board).find(s => score >= s.best) ?? null;
}
