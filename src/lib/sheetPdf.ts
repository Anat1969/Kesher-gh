import { fitSheet } from './sheetFit';

/** A4 at 96 dpi: the sheet is laid out at this width for the file, whatever the screen. */
const A4_PX = 794;

/**
 * Saves one article as an A4 PDF file, exactly as it is drawn: the sheet is copied off-screen at
 * A4 width, fitted into its frame, drawn by the browser itself (so Hebrew and the fonts stay
 * right), and placed on a single A4 page. The libraries load only when someone downloads.
 */
export async function downloadSheet(sheet: HTMLElement, fileName: string) {
  const [{ toJpeg }, { jsPDF }] = await Promise.all([import('html-to-image'), import('jspdf')]);

  const stage = document.createElement('div');
  stage.setAttribute('aria-hidden', 'true');
  Object.assign(stage.style, { position: 'fixed', top: '0', left: '-20000px', width: `${A4_PX}px`, pointerEvents: 'none' });
  const copy = sheet.cloneNode(true) as HTMLElement;
  copy.classList.add('is-a4');
  copy.style.boxShadow = 'none';
  stage.appendChild(copy);
  document.body.appendChild(stage);

  try {
    await document.fonts?.ready;
    fitSheet(copy);
    const bg = getComputedStyle(document.body).backgroundColor || '#ffffff';
    const image = await toJpeg(copy, {
      quality: 0.92,
      pixelRatio: 2.5,
      backgroundColor: bg,
      filter: node => !(node instanceof HTMLElement && node.classList.contains('no-print')),
    });
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    pdf.addImage(image, 'JPEG', 0, 0, 210, 297);
    pdf.save(fileName);
  } finally {
    stage.remove();
  }
}
