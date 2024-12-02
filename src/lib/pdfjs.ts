import * as pdfjsLib from 'pdfjs-dist';

// Properly type and configure the worker
const workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

export { pdfjsLib };