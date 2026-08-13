function safeName(value) {
  return String(value || "Report").trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
}

function money(value) {
  return Number(value || 0).toFixed(2);
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function createWorkbook(event, employeeName, receipts) {
  const { default: writeXlsxFile } = await import("write-excel-file/browser");
  const header = (value) => ({ value, fontWeight: "bold", backgroundColor: "#DCE6F1" });
  const total = receipts.reduce((sum, receipt) => sum + Number(receipt.total || 0), 0);
  const categoryTotals = Object.entries(receipts.reduce((totals, receipt) => {
    totals[receipt.category] = (totals[receipt.category] || 0) + Number(receipt.total || 0);
    return totals;
  }, {})).sort(([a], [b]) => a.localeCompare(b));

  const summaryData = [
    [{ value: "Trip Expense Report", fontWeight: "bold", fontSize: 16 }, null],
    [header("Employee"), { value: employeeName }],
    [header("Event"), { value: event.name }],
    [header("Event dates"), { value: event.dates }],
    [header("Receipt count"), { value: receipts.length, type: Number }],
    [header("Grand total"), { value: total, type: Number, format: "$#,##0.00", fontWeight: "bold" }],
    [],
    [header("Category"), header("Total")],
    ...categoryTotals.map(([category, amount]) => [{ value: category }, { value: amount, type: Number, format: "$#,##0.00" }]),
  ];

  const detailHeaders = ["Receipt #", "Date", "Merchant", "Category", "Business purpose", "Subtotal", "Tax", "Tip", "Total", "Currency", "Notes", "Receipt file"];
  const detailData = [
    detailHeaders.map(header),
    ...receipts.map((receipt, index) => [
      { value: index + 1, type: Number },
      { value: receipt.date || "" },
      { value: receipt.merchant || "" },
      { value: receipt.category || "Other" },
      { value: receipt.businessPurpose || "" },
      ...[receipt.subtotal, receipt.tax, receipt.tip, receipt.total].map((value) => ({ value: Number(value || 0), type: Number, format: "$#,##0.00" })),
      { value: receipt.currency || "USD" },
      { value: receipt.notes || "" },
      { value: `Receipt-${String(index + 1).padStart(2, "0")}.jpg` },
    ]),
  ];

  return writeXlsxFile([
    { data: summaryData, sheet: "Expense Summary", columns: [{ width: 28 }, { width: 28 }] },
    { data: detailData, sheet: "All Receipts", columns: [10, 14, 24, 24, 32, 14, 12, 12, 14, 10, 30, 22].map((width) => ({ width })) },
  ]).toBlob();
}

async function createReceiptPdf(event, employeeName, receipts, images) {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const total = receipts.reduce((sum, receipt) => sum + Number(receipt.total || 0), 0);
  const cover = pdf.addPage([612, 792]);
  cover.drawText("Trip Expense Report", { x: 48, y: 724, size: 24, font: bold, color: rgb(0.04, 0.18, 0.38) });
  cover.drawText(employeeName, { x: 48, y: 684, size: 16, font: bold });
  cover.drawText(event.name, { x: 48, y: 657, size: 13, font: regular });
  cover.drawText(event.dates, { x: 48, y: 636, size: 11, font: regular, color: rgb(0.35, 0.35, 0.35) });
  cover.drawText(`${receipts.length} receipts`, { x: 48, y: 592, size: 12, font: regular });
  cover.drawText(`Total: $${money(total)}`, { x: 48, y: 563, size: 18, font: bold });
  cover.drawText("Receipt Index", { x: 48, y: 513, size: 14, font: bold });
  receipts.slice(0, 22).forEach((receipt, index) => {
    cover.drawText(`${index + 1}. ${receipt.date || "No date"}  ${receipt.merchant || "Merchant not added"}  $${money(receipt.total)}`, { x: 58, y: 486 - index * 19, size: 10, font: regular });
  });

  for (let index = 0; index < receipts.length; index += 1) {
    const receipt = receipts[index];
    const bytes = await images[index].arrayBuffer();
    const embedded = images[index].type === "image/png" ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
    const page = pdf.addPage([612, 792]);
    page.drawText(`Receipt ${index + 1}: ${receipt.merchant || "Merchant not added"}`, { x: 36, y: 755, size: 13, font: bold });
    page.drawText(`${receipt.date || "No date"}  |  ${receipt.category || "Other"}  |  $${money(receipt.total)}`, { x: 36, y: 733, size: 10, font: regular, color: rgb(0.3, 0.3, 0.3) });
    const availableWidth = 540;
    const availableHeight = 660;
    const scale = Math.min(availableWidth / embedded.width, availableHeight / embedded.height);
    const width = embedded.width * scale;
    const height = embedded.height * scale;
    page.drawImage(embedded, { x: (612 - width) / 2, y: 48 + (availableHeight - height) / 2, width, height });
  }
  return new Blob([await pdf.save()], { type: "application/pdf" });
}

export async function downloadExpensePackage({ event, employeeName, receipts, getImage }) {
  const [{ default: JSZip }, images] = await Promise.all([
    import("jszip"),
    Promise.all(receipts.map((receipt) => getImage(receipt.id))),
  ]);
  const [workbook, pdf] = await Promise.all([
    createWorkbook(event, employeeName, receipts),
    createReceiptPdf(event, employeeName, receipts, images),
  ]);
  const baseName = `${safeName(event.shortName || event.name)}-${event.year}-${safeName(employeeName)}-Expenses`;
  const zip = new JSZip();
  zip.file(`${baseName}-Expense-Report.xlsx`, workbook);
  zip.file(`${baseName}-Receipts.pdf`, pdf);
  const originals = zip.folder("Original-Receipts");
  images.forEach((image, index) => originals.file(`Receipt-${String(index + 1).padStart(2, "0")}.jpg`, image));
  downloadBlob(await zip.generateAsync({ type: "blob" }), `${baseName}.zip`);
}
