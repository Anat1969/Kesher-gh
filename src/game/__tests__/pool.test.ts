import { describe, expect, it } from 'vitest';
import { BOARD_SIZE, CLASSIC_DECK, ITEMS, NEW_DECK } from '../gameItems';
import { LEXICON, TAGS, DOMAINS } from '../lexicon';
import { D } from '../../components/glyphPaths';
import { dealDeck, shuffle } from '../deck';
import { dailyFor, MIXED_FROM } from '../daily';
import { readingsFor, secretEntries } from '../evaluator';
import { sonResults } from '../sons';

describe('the card pool', () => {
  it('every card has a lexicon entry, a line per tag, a known domain and a drawing', () => {
    expect(ITEMS.length).toBe(50);
    expect(LEXICON).toHaveLength(ITEMS.length);
    expect(D).toHaveLength(ITEMS.length);
    ITEMS.forEach((item, i) => {
      expect(DOMAINS[item.p], `${item.l} domain`).toBeTruthy();
      for (const t of item.t) {
        expect(TAGS[t], `${item.l} tag ${t}`).toBeTruthy();
        expect(LEXICON[i].notes[t], `${item.l} note ${t}`).toBeTruthy();
      }
    });
  });

  it('card names are unique', () => {
    expect(new Set(ITEMS.map(i => i.l)).size).toBe(ITEMS.length);
  });

  it('new cards connect to the old ones, so mixed boards read well', () => {
    for (const n of NEW_DECK) {
      const deep = CLASSIC_DECK.filter(o => ['r', 'd', 's'].includes(readingsFor(n, o)[0].lv)).length;
      expect(deep, ITEMS[n].l).toBeGreaterThan(3);
    }
  });

  it('the second set adds documented secrets', () => {
    expect(secretEntries().filter(e => e.a >= 25 || e.b >= 25).length).toBeGreaterThanOrEqual(12);
  });
});

describe('boards', () => {
  it('deals the classic, new and mixed boards', () => {
    expect(dealDeck('classic')).toEqual([...CLASSIC_DECK]);
    expect(dealDeck('new')).toEqual([...NEW_DECK]);
    const mix = dealDeck('mix');
    expect(mix).toHaveLength(BOARD_SIZE);
    expect(new Set(mix).size).toBe(BOARD_SIZE);
    mix.forEach(i => expect(i).toBeLessThan(ITEMS.length));
  });

  it('shuffle keeps every element once', () => {
    expect([...shuffle([1, 2, 3, 4, 5])].sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('past daily challenges keep the classic board; new days deal from the pool', () => {
    const past = dailyFor('2026-11-01');
    expect(past.deck).toEqual([...CLASSIC_DECK]);
    const next = dailyFor(MIXED_FROM);
    expect(next.deck).toHaveLength(BOARD_SIZE);
    expect(next.deck).toContain(next.start);
    expect(next.deck).toContain(next.target);
    next.bestPath.forEach(c => expect(next.deck).toContain(c));
    expect(dailyFor(MIXED_FROM)).toEqual(next);
  });

  it('the four sons still play the classic board only', () => {
    for (const s of sonResults()) s.path.forEach(c => expect(c).toBeLessThan(25));
  });
});
