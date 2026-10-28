/**
 * Compares what the player said about a connection with the readings the game knows.
 * Method: shared content words (Hebrew prefixes and niqqud removed, card names and function
 * words ignored, 4-letter stems for inflection). It is a word-overlap estimate, not
 * understanding, so every verdict shows the words it is based on.
 */
import { plain } from './marker';

export interface ReadingLike {
  key: string;
  lv: 'p' | 'r' | 'd' | 's';
  sub: string;
  basis: string;
  exp: string;
  why: string;
  insight?: string;
  lines?: { w: string; t: string }[];
}

export type Verdict =
  | { kind: 'empty' }
  | { kind: 'same'; reading: ReadingLike; words: string[] }
  | { kind: 'other'; reading: ReadingLike; words: string[] }
  | { kind: 'own'; words: string[] };

const STOP = new Set(
  ('של את על עם זה זו זאת הוא היא הם הן אני אנחנו אתם יש אין כי גם או אם כמו כל לא כן מה מי איך למה ' +
    'שני שניהם שתיהן יותר פחות מאוד רק עוד אז אבל אחד אחת דבר דברים משהו כך ככה הזה הזאת להם לו לה ' +
    'שלו שלה שלהם בין אותו אותה אותם היה היו להיות הייתה עושה עושים ביחד קשר קשורים קשור חיבור מחבר ' +
    'חושב חשבתי נראה בעצם פשוט כאילו').split(' '),
);

const PREFIX = /^(וה|וב|ול|ומ|וש|שה|שב|של|כש|מה|לה|בה|ו|ה|ב|ל|מ|ש|כ)(?=[\u05d0-\u05ea]{3,})/;

/** Content-word stems of a Hebrew text. */
export function stems(text: string): string[] {
  const words = plain(text)
    .replace(/[֑-ׇ]/g, '')
    .replace(/[^א-תA-Za-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  const out: string[] = [];
  for (const raw of words) {
    if (STOP.has(raw) || raw.length < 3) continue;
    const w = raw.replace(PREFIX, '');
    if (STOP.has(w) || w.length < 3) continue;
    out.push(w.slice(0, 4));
  }
  return out;
}

const corpus = (r: ReadingLike) =>
  [r.sub, r.basis, r.exp, r.why, r.insight ?? '', ...(r.lines ?? []).map(l => l.t)].join(' ');

/** Compares a player's explanation with the readings (the first is the game's own reading). */
export function compareMeaning(text: string, readings: ReadingLike[], names: string[] = []): Verdict {
  const ignore = new Set(names.flatMap(n => stems(n)));
  const said = [...new Set(stems(text))].filter(s => !ignore.has(s));
  if (said.length === 0 || readings.length === 0) return { kind: 'empty' };

  // The player's own words, to show back what matched.
  const shown = new Map<string, string>();
  for (const w of plain(text).replace(/[֑-ׇ]/g, '').split(/\s+/)) {
    const s = stems(w)[0];
    if (s && !shown.has(s)) shown.set(s, w.replace(/[^א-תA-Za-z0-9]/g, ''));
  }

  let best: { r: ReadingLike; hits: string[] } | null = null;
  for (const r of readings) {
    const bag = new Set(stems(corpus(r)));
    const hits = said.filter(s => bag.has(s));
    if (!best || hits.length > best.hits.length) best = { r, hits };
  }
  // One shared word is enough for a short sentence; longer ones need about a fifth of their words.
  const need = Math.max(1, Math.ceil(said.length * 0.2));
  const words = (best?.hits ?? []).map(s => shown.get(s) ?? s);
  if (!best || best.hits.length < need) return { kind: 'own', words };
  return best.r.key === readings[0].key
    ? { kind: 'same', reading: best.r, words }
    : { kind: 'other', reading: best.r, words };
}
