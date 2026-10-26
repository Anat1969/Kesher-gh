import { describe, expect, it } from 'vitest';
import { buildShareText } from '../share';
import { evaluate } from '@/game/evaluator';

describe('buildShareText', () => {
  it('summarises score and levels without spoiling explanations', () => {
    const directConns = [{ a: 0, b: 10, ev: evaluate(0, 10) }, { a: 10, b: 8, ev: evaluate(10, 8) }];
    const text = buildShareText({ total: 77, directConns, chainCount: 1 });
    expect(text).toContain('77');
    expect(text).toContain('🟨');
    expect(text).not.toContain(directConns[0].ev.exp);
  });
});
