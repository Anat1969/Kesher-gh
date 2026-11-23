import { BOARD_SIZE, CLASSIC_DECK, ITEMS, NEW_DECK } from './gameItems';

/** Which board a game is dealt from. */
export type DeckMode = 'mix' | 'classic' | 'new';

export const DECK_MODES: { id: DeckMode; label: string; hint: string }[] = [
  { id: 'mix', label: 'מתחלף', hint: `25 מילים מתוך ${ITEMS.length}, לוח חדש בכל משחק` },
  { id: 'classic', label: 'קלאסי', hint: 'הלוח המקורי, אותן 25 מילים' },
  { id: 'new', label: 'חדש', hint: '25 המילים החדשות: מושגים, גוף ומרחב בנוי' },
];

/** Fisher–Yates on a copy, with an injectable random source (seeded for the daily board). */
export function shuffle<T>(list: readonly T[], random: () => number = Math.random): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Deals one board of BOARD_SIZE card ids. */
export function dealDeck(mode: DeckMode = 'mix', random: () => number = Math.random): number[] {
  if (mode === 'classic') return [...CLASSIC_DECK];
  if (mode === 'new') return [...NEW_DECK];
  return shuffle(ITEMS.map((_, i) => i), random).slice(0, BOARD_SIZE);
}
