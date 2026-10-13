// A PDF receipt (a hotel folio, an airline e-receipt, an Uber email saved as
// PDF) turned into one JPEG before upload.
//
// Everything after upload works on images: the reader that pulls out the
// merchant and total, the thumbnail on the Money tab, and the trip report that
// bundles each receipt's picture. Converting here, in the browser, means none
// of that has to learn a second format.
//
// The first few pages are stacked into one tall image, because a folio's
// total is usually on its last page and a two-page receipt read as page one
// alone would come back without it.

const MAX_PAGES = 3;
const TARGET_WIDTH = 1400;

export function isPdfFile(file) {
  return file?.type === "application/pdf" || /\.pdf$/i.test(file?.name || "");
}

let loading = null;
function loadPdfJs() {
  // Loaded on first use only: most people never pick a PDF, and the library
  // is large. The legacy build runs on older iPhones the modern one does not.
  loading ||= Promise.all([
    import("pdfjs-dist/legacy/build/pdf.mjs"),
    import("pdfjs-dist/legacy/build/pdf.worker.min.mjs?url"),
  ]).then(([pdfjs, worker]) => {
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
    return pdfjs;
  });
  return loading;
}

export async function pdfToReceiptImage(file) {
  const pdfjs = await loadPdfJs();
  let pdf;
  try {
    pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  } catch (error) {
    if (error?.name === "PasswordException") throw new Error("That PDF is password-protected. Open it, save a copy without the password, or upload a screenshot.");
    throw new Error("Could not open that PDF.");
  }

  const pages = [];
  for (let number = 1; number <= Math.min(pdf.numPages, MAX_PAGES); number += 1) {
    const page = await pdf.getPage(number);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: TARGET_WIDTH / base.width });
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const context = canvas.getContext("2d");
    // Receipts are often transparent PDFs; on a transparent canvas the JPEG
    // comes out black.
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: context, viewport }).promise;
    pages.push(canvas);
  }
  pdf.destroy();

  const gap = 12;
  const stacked = document.createElement("canvas");
  stacked.width = Math.max(...pages.map((page) => page.width));
  stacked.height = pages.reduce((sum, page) => sum + page.height, 0) + gap * (pages.length - 1);
  const context = stacked.getContext("2d");
  context.fillStyle = "#e5e7eb";
  context.fillRect(0, 0, stacked.width, stacked.height);
  let y = 0;
  for (const page of pages) {
    context.drawImage(page, 0, y);
    y += page.height + gap;
  }

  const blob = await new Promise((resolve, reject) =>
    stacked.toBlob((value) => (value ? resolve(value) : reject(new Error("Could not prepare that PDF."))), "image/jpeg", 0.88));
  const name = (file.name || "receipt").replace(/\.pdf$/i, "");
  return new File([blob], `${name}.jpg`, { type: "image/jpeg" });
}
