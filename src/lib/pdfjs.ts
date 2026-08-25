import * as pdfjsLib from 'pdfjs-dist';
// Bundle the worker with the app instead of pulling it from a CDN. pdf.js v5
// only ships an ESM worker (pdf.worker.min.mjs), so the old CDN URL pointing at
// pdf.worker.min.js always 404'd and every document load fell back to a broken
// fake worker.
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// pdfjs-dist 5.4.530 ships declarations that omit several members it really
// exports (GlobalWorkerOptions among them), so reach it through a narrow cast
// rather than dropping the type check on the whole module.
const { GlobalWorkerOptions } = pdfjsLib as unknown as {
  GlobalWorkerOptions: { workerSrc: string };
};

GlobalWorkerOptions.workerSrc = workerUrl;

// Runtime assets copied out of pdfjs-dist by the `pdfjs-assets` Vite plugin.
const assetBase = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/pdfjs`;

/**
 * Document options every call site should use: without the CMap and standard
 * font data, pages using non-embedded fonts render with missing text.
 */
export const PDF_DOCUMENT_OPTIONS = {
  cMapUrl: `${assetBase}/cmaps/`,
  cMapPacked: true,
  standardFontDataUrl: `${assetBase}/standard_fonts/`,
  iccUrl: `${assetBase}/iccs/`,
  wasmUrl: `${assetBase}/wasm/`,
};

/** Loads a PDF from raw bytes with the asset options applied. */
export function loadPDFDocument(data: ArrayBuffer | Uint8Array) {
  return pdfjsLib.getDocument({ ...PDF_DOCUMENT_OPTIONS, data });
}

export { pdfjsLib };
