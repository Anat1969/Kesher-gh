import { ITEMS, LEVEL_NAMES, type Level } from '@/game/gameItems';
import type { Connection } from '@/game/personality';

const LEVEL_SQUARES: Record<Level, string> = { p: '🟦', r: '🟪', d: '🟧', s: '🟨' };

export interface ShareSummary {
  total: number;
  directConns: Connection[];
  chainCount: number;
  personality?: { emoji: string; type: string } | null;
  best?: Connection | null;
}

/** Wordle-style spoiler-free summary: one coloured square per connection, in order. */
export function buildShareText({ total, directConns, chainCount, personality, best }: ShareSummary): string {
  const squares = directConns.map(c => LEVEL_SQUARES[c.ev.lv]).join('');
  const rows = squares.match(/.{1,10}/gu) ?? [];
  const lines = [
    `קֶשֶׁר — ${total} נקודות`,
    `${directConns.length} קשרים · ⛓ ${chainCount} חיבורי שרשרת`,
    ...rows,
  ];
  if (personality) lines.push(`${personality.emoji} ${personality.type}`);
  if (best) lines.push(`הקשר הטוב: ${ITEMS[best.a].e}+${ITEMS[best.b].e} (${LEVEL_NAMES[best.ev.lv]})`);
  return lines.join('\n');
}

export type ShareOutcome = 'shared' | 'copied' | 'failed';

export async function shareText(text: string, url = typeof location !== 'undefined' ? location.origin : ''): Promise<ShareOutcome> {
  try {
    if (navigator.share) {
      await navigator.share({ title: 'קֶשֶׁר', text, url });
      return 'shared';
    }
  } catch (e) {
    if ((e as DOMException)?.name === 'AbortError') return 'failed';
  }
  try {
    await navigator.clipboard.writeText(url ? `${text}\n${url}` : text);
    return 'copied';
  } catch {
    return 'failed';
  }
}
