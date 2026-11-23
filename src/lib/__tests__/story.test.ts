import { describe, expect, it } from 'vitest';
import { gameReducer, initialState } from '../../game/engine';
import { buildStory, storyText } from '../story';
import { ITEMS } from '../../game/gameItems';

const idOf = (n: string) => ITEMS.findIndex(i => i.l === n);
function play(names: string[]) {
  const ids = names.map(idOf);
  const deck = ids.concat([...Array(ITEMS.length).keys()].filter(i => !ids.includes(i))).slice(0, 25);
  let s = gameReducer(initialState('game'), { type: 'start', deck });
  for (const c of ids) s = gameReducer(s, { type: 'pick', card: c });
  return s;
}

describe('the story of a chain', () => {
  it('tells every card in order, from the first to the last, with the player own words', () => {
    let s = play(['נבט', 'ברק', 'פרפר', 'מסכה', 'מראה']);
    s = gameReducer(s, { type: 'annotate', index: 0, note: 'שניהם מתחילים מניצוץ' });
    const story = buildStory(s.path, s.directConns)!;
    const text = storyText(story);
    expect(story.title).toBe('מנבט אל מראה');
    let at = -1;
    for (const n of ['נבט', 'ברק', 'פרפר', 'מסכה', 'מראה']) {
      const k = text.indexOf(n, at + 1);
      expect(k, n).toBeGreaterThan(at);
      at = k;
    }
    expect(text).toContain('"שניהם מתחילים מניצוץ"');
    expect(story.facts).toHaveLength(4);
  });

  it('verbs agree with feminine cards', () => {
    const text = storyText(buildStory(play(['פרפר', 'ברק', 'גל', 'מסכה', 'אש']).path, play(['פרפר', 'ברק', 'גל', 'מסכה', 'אש']).directConns)!);
    expect(text).not.toMatch(/הופיע (מסכה|אש)|מסכה הוביל |נפתח (מסכה|אש)/);
  });

  it('needs at least one connection', () => {
    expect(buildStory([idOf('נבט')], [])).toBeNull();
  });
});
