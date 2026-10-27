/** Learning-graph maths: rolling mean and a one-line trend, kept apart from the chart. */

export const WINDOW = 5;

/** Rolling mean over the last `WINDOW` games (fewer at the start). */
export function rolling(values: number[], w = WINDOW): number[] {
  return values.map((_, i) => {
    const slice = values.slice(Math.max(0, i - w + 1), i + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}

/** One-line takeaway: how the recent average compares with the first games. */
export function trendLine(totals: number[]): string {
  if (totals.length < 2) return 'שחקו עוד משחק כדי לראות **כיוון**.';
  const k = Math.min(WINDOW, Math.floor(totals.length / 2));
  const avg = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
  const first = avg(totals.slice(0, k));
  const last = avg(totals.slice(-k));
  const diff = Math.round(last - first);
  const span = k === 1 ? 'מהמשחק הראשון' : `מ-${k} המשחקים הראשונים`;
  if (Math.abs(diff) < 3) return `הממוצע **יציב**, בערך ${Math.round(last)} נקודות למשחק.`;
  return diff > 0
    ? `הממוצע **עלה ב-${diff} נקודות** ${span}.`
    : `הממוצע **ירד ב-${-diff} נקודות** ${span}. נסו לחפש את העיקרון המשותף.`;
}
