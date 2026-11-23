/**
 * The story of a chain: the player's picks told as one continuous story, picture to picture.
 * Every sentence is built from what the game already knows to be true: each card's essence,
 * the thread of each connection (the reading the player meant, or the game's own), and the
 * player's own words when they explained a link. Nothing is invented.
 */
import { ITEMS, LEVEL_NAMES, type Level } from '../game/gameItems';
import { LEXICON } from '../game/lexicon';
import { readingsFor, type Reading } from '../game/evaluator';
import type { Connection } from '../game/personality';
import { plain } from './marker';

export interface StoryBeat {
  /** Card the beat arrives at (for the glyph beside it). */
  card: number;
  level: Level | null;
  /** The sentence, with **highlights**. */
  text: string;
}

export interface Story {
  title: string;
  /** Paragraphs of beats; the first paragraph opens on the first card. */
  paragraphs: StoryBeat[][];
  /** The thread that came back most often, if any. */
  motif: string | null;
  closing: string;
  /** The facts the story is made of, for the literary rewrite (never invented). */
  facts: { from: string; to: string; level: Level; thread: string; insight: string; said?: string }[];
}

const name = (i: number) => ITEMS[i].l;
/** Grammatically feminine card names, so verbs agree with them. */
const FEMININE = new Set(['מערבולת', 'שמש', 'אש', 'מטרה', 'מסכה', 'קשת', 'עין', 'מראה', 'נוצה', 'דבורה', 'אבן', 'שתיקה', 'מילה']);
const g = (i: number, m: string, f: string) => (FEMININE.has(name(i)) ? f : m);
const strip = (s: string) => s.replace(/^[^—]*—\s*/, '');
const firstSentence = (s: string) => {
  const t = plain(s).trim();
  const m = t.match(/^.+?[.!?](\s|$)/);
  return (m ? m[0] : t).trim();
};
const soft = (s: string) => s.replace(/[.!?]\s*$/, '');

/** The reading the player meant, or the game's deepest one. */
function threadOf(c: Connection): Reading | undefined {
  const rs = readingsFor(c.a, c.b);
  return (c.meant && rs.find(r => r.key === c.meant)) || rs[0];
}

/** Openers that turn a list into a journey; chosen by position so a story never repeats one twice in a row. */
const OPENERS = [
  (a: number, b: number) => `מ**${name(a)}** הדרך עברה אל **${name(b)}**`,
  (_a: number, b: number) => `ומשם, אל **${name(b)}**`,
  (_a: number, b: number) => `ואז ${g(b, 'הופיע', 'הופיעה')} **${name(b)}**`,
  (a: number, b: number) => `**${name(a)}** ${g(a, 'הוביל', 'הובילה')} אל **${name(b)}**`,
  (_a: number, b: number) => `הצעד הבא ${g(b, 'היה', 'הייתה')} **${name(b)}**`,
  (a: number, b: number) => `מתוך **${name(a)}** ${g(b, 'נפתח', 'נפתחה')} **${name(b)}**`,
];

const BY_LEVEL: Record<Level, string> = {
  p: 'במבט ראשון',
  r: 'דרך סמל',
  d: 'דרך עיקרון משותף',
  s: 'דרך סוד',
};

export function buildStory(path: number[], directConns: Connection[]): Story | null {
  if (path.length < 2 || directConns.length === 0) return null;
  const first = path[0];
  const last = path[path.length - 1];

  const beats: StoryBeat[] = [{
    card: first,
    level: null,
    text: `הכול התחיל ב**${name(first)}**: ${soft(LEXICON[first].essence)}.`,
  }];

  // The deepest link is the turning point of the story, when one link stands above the rest.
  const top = Math.max(...directConns.map(c => c.ev.sc));
  const atTop = directConns.map((c, i) => (c.ev.sc === top ? i : -1)).filter(i => i >= 0);
  const peak = atTop.length === 1 && atTop[0] > 0 ? atTop[0] : -1;
  const facts: Story['facts'] = [];
  const motifs = new Map<string, number>();

  directConns.forEach((c, i) => {
    const r = threadOf(c);
    const lv = (c.meantLv ?? r?.lv ?? c.ev.lv) as Level;
    const thread = r ? strip(r.sub) : strip(c.ev.sub);
    const insight = r ? firstSentence(r.insight ?? r.exp) : firstSentence(c.ev.exp);
    // The motif is the named thread (a quality, a principle, a paradox), never the kind of source.
    const basis = r?.basis.includes(' · ') ? r.basis.split(' · ').pop() : undefined;
    if (basis) motifs.set(basis, (motifs.get(basis) ?? 0) + 1);
    facts.push({ from: name(c.a), to: name(c.b), level: lv, thread, insight: plain(insight), said: c.note });

    const opener = OPENERS[i % OPENERS.length](c.a, c.b);
    let text = i === peak
      ? `וכאן הלב של השרשרת: ${opener.replace(/^ו/, '')}, ${BY_LEVEL[lv]}. **${thread}**. ${insight}`
      : `${opener}, ${BY_LEVEL[lv]}: ${thread}. ${insight}`;
    if (c.note) text += ` ואתם ראיתם שם: "${c.note.trim()}".`;
    beats.push({ card: c.b, level: lv, text });
  });

  // Paragraphs: the opening with the first two links, then breathing every three links.
  const paragraphs: StoryBeat[][] = [];
  paragraphs.push(beats.slice(0, 3));
  for (let i = 3; i < beats.length; i += 3) paragraphs.push(beats.slice(i, i + 3));

  const most = [...motifs.entries()].sort((x, y) => y[1] - x[1])[0];
  const motif = most && most[1] > 1 ? most[0] : null;
  const deepest = directConns.reduce((m, c) => Math.max(m, c.ev.sc), 0);
  const deepLv = (Object.entries({ p: 5, r: 10, d: 18, s: 30 }) as [Level, number][]).find(([, v]) => v === deepest)?.[0];

  const closing = [
    `והסוף ב**${name(last)}**: ${soft(LEXICON[last].essence)}.`,
    `${directConns.length} צעדים, מ${name(first)} אל ${name(last)}${deepLv ? `, ועד עומק של **${LEVEL_NAMES[deepLv]}**` : ''}.`,
    motif ? `החוט שחזר לאורך כל הדרך: **${motif}**.` : '',
  ].filter(Boolean).join(' ');

  return {
    title: `מ${name(first)} אל ${name(last)}`,
    paragraphs,
    motif,
    closing,
    facts,
  };
}

/** The story as plain text, for reading aloud, copying and sharing. */
export function storyText(s: Story): string {
  return [s.title, ...s.paragraphs.map(p => p.map(b => plain(b.text)).join(' ')), plain(s.closing)].join('\n\n');
}
