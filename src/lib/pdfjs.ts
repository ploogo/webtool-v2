import * as pdfjsLib from 'pdfjs-dist';

// Configure the worker with a more reliable URL pattern
const workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

export { pdfjsLib };