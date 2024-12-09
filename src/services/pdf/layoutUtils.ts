import PDFDocument from "pdfkit";

export const PAGE_MARGIN = 50;
export const PAGE_WIDTH = 595.28; // A4 width in points
export const PAGE_HEIGHT = 841.89; // A4 height in points
export const CONTENT_WIDTH = PAGE_WIDTH - 2 * PAGE_MARGIN;
export const LEFT_COLUMN_WIDTH = 160;
export const RIGHT_COLUMN_WIDTH = CONTENT_WIDTH - LEFT_COLUMN_WIDTH - 30;
export const RIGHT_COLUMN_START = LEFT_COLUMN_WIDTH + 70;

export function trimLocation(location: string): string {
  const locationMap: Record<string, string> = {
    "Gothenburg, Vastra Gotaland County, Sweden": "Gothenburg, Sweden",
    "Gothenburg Metropolitan Area": "Gothenburg, Sweden",
    "Göteborg, Sverige": "Gothenburg, Sweden",
  };

  return locationMap[location] || location;
}

export function formatDate(date: string): string {
  return date || "Present";
}

export type PDFState = {
  doc: PDFKit.PDFDocument;
  currentY: number;
};

export function moveDown(state: PDFState, lines: number = 1): void {
  state.currentY += lines * state.doc.currentLineHeight();
}

export function resetY(state: PDFState): void {
  state.currentY = PAGE_MARGIN;
}

export function checkPageBreak(state: PDFState, requiredHeight: number): void {
  if (state.currentY + requiredHeight > PAGE_HEIGHT - PAGE_MARGIN) {
    state.doc.addPage();
    resetY(state);
  }
}
