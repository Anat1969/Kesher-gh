import { describe, expect, it } from 'vitest';
import { compareMeaning, stems, type ReadingLike } from '../compare';
import { readingsFor } from '../../game/evaluator';
import { ITEMS } from '../../game/gameItems';

const r = (key: string, lv: ReadingLike['lv'], text: string): ReadingLike => ({ key, lv, sub: text, basis: '', exp: text, why: '' });
const readings = [
  r('a', 's', 'שניהם **מתחילים מניצוץ** אחד: אור שבוקע מתוך החושך'),
  r('b', 'r', 'סמל של התחדשות ותקווה באביב'),
];

describe('compareMeaning', () => {
  it('strips prefixes, niqqud and function words', () => {
    expect(stems('והאור של הניצוצות')).toEqual(['אור', 'ניצו']);
  });
  it('same direction as the game reading', () => {
    const v = compareMeaning('שניהם יוצאים מניצוץ של אור', readings);
    expect(v.kind).toBe('same');
  });
  it('another reading the player meant', () => {
    const v = compareMeaning('זה סמל של תקווה, כמו האביב', readings);
    expect(v).toMatchObject({ kind: 'other', reading: { key: 'b' } });
    if (v.kind === 'other') expect(v.words).toContain('תקווה');
  });
  it('a connection of their own', () => {
    expect(compareMeaning('שתיהן מילים שאמא שלי אהבה להגיד בבוקר', readings).kind).toBe('own');
    expect(compareMeaning('   ', readings).kind).toBe('empty');
  });
  it('ignores the card names themselves', () => {
    const real = readingsFor(0, 10);
    const v = compareMeaning(`${ITEMS[0].l} ו${ITEMS[10].l}`, real, [ITEMS[0].l, ITEMS[10].l]);
    expect(v.kind).toBe('empty');
  });
});

describe('compareMeaning on a real reading', () => {
  it('hears "spark" in the Miller-Urey reading of sprout and lightning', async () => {
    const { ITEMS: items } = await import('../../game/gameItems');
    const a = items.findIndex(i => i.l === 'נבט'), b = items.findIndex(i => i.l === 'ברק');
    const v = compareMeaning('שניהם מתחילים מניצוץ קטן של אור', readingsFor(a, b), ['נבט', 'ברק']);
    expect(v.kind).toBe('same');
  });
});
