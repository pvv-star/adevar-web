/**
 * Export the chart canvas as a branded PDF.
 * @param {HTMLCanvasElement} canvas - The chart <canvas> element
 * @param {object} meta
 * @param {string} meta.title - Chart title
 * @param {string} [meta.subtitle] - Chart subtitle
 * @param {string} [meta.url] - Chart URL
 * @returns {Promise<void>} triggers download
 */
export async function exportPdf(canvas, meta = {}) {
  const { title = 'Chart', subtitle = '', url = '' } = meta;

  const { default: jsPDF } = await import('jspdf');
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  // Background
  pdf.setFillColor(17, 19, 24);
  pdf.rect(0, 0, pageW, pageH, 'F');

  // Title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  pdf.setTextColor(255, 255, 255);
  pdf.text(title, 14, 18);

  // Subtitle
  if (subtitle) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.setTextColor(136, 144, 164);
    pdf.text(subtitle, 14, 26);
  }

  // Chart image
  const margin = 14;
  const imgY = subtitle ? 32 : 24;
  const imgW = pageW - margin * 2;
  const imgH = Math.min((canvas.height / canvas.width) * imgW, pageH - imgY - 20);
  pdf.addImage(imgData, 'PNG', margin, imgY, imgW, imgH);

  // Footer
  pdf.setFontSize(9);
  pdf.setTextColor(107, 107, 107);
  pdf.text('adevar.ai — Surse oficiale', 14, pageH - 6);
  if (url) {
    pdf.text(url, pageW - 14, pageH - 6, { align: 'right' });
  }

  pdf.save(`${title.replace(/[^a-zA-Z0-9-_ ]/g, '')}.pdf`);
}
