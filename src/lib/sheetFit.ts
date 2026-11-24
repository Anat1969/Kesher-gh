/**
 * Every article sits on one A4 sheet, inside its frame, never cut.
 * The sheet keeps the A4 proportion; when the content is taller than the frame, the whole
 * content is set a little smaller (zoom, in steps of 3%) until it fits, down to 70%.
 * The frame (the sheet's first child) keeps its full size; only what is inside it shrinks.
 */
export const FIT_MIN = 0.7;
const STEP = 0.03;

const overflows = (frame: HTMLElement) => frame.scrollHeight > frame.clientHeight + 1;

export function fitSheet(sheet: HTMLElement): number {
  const frame = sheet.firstElementChild as HTMLElement | null;
  if (!frame) return 1;
  const content = frame;
  content.style.zoom = '1';
  // A sheet without a fixed height (phone layout) grows with its text: nothing to fit.
  const fixed = sheet.classList.contains('is-a4') || getComputedStyle(sheet).aspectRatio !== 'auto' || window.matchMedia('print').matches;
  if (!fixed) {
    sheet.dataset.fit = '1';
    return 1;
  }
  let k = 1;
  while (overflows(frame) && k - STEP >= FIT_MIN) {
    k = Math.round((k - STEP) * 100) / 100;
    content.style.zoom = String(k);
  }
  sheet.dataset.fit = String(k);
  return k;
}

export function fitAll(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('.article-sheet').forEach(fitSheet);
}
