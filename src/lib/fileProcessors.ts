import { pdfjsLib, loadPDFDocument } from './pdfjs';
import { isPDFFile } from './pdfProcessing';
import imageCompression from 'browser-image-compression';

export interface ProcessedFile {
  type: 'image' | 'pdf';
  name: string;
  totalPages: number;
  /** Renders a page to a JPEG data URL, fitted inside a `maxSize` px box. */
  getPage: (pageNumber: number, maxSize?: number) => Promise<string>;
  /** Releases the underlying document. Safe to call more than once. */
  dispose: () => Promise<void>;
}

export interface ProcessFileOptions {
  /** An already-parsed PDF document to reuse, avoiding a second parse of the file. */
  pdf?: pdfjsLib.PDFDocumentProxy;
}

export const PREVIEW_MAX_SIZE = 400;
export const THUMBNAIL_MAX_SIZE = 1920;

export async function processFile(
  file: File,
  options: ProcessFileOptions = {}
): Promise<ProcessedFile> {
  if (file.type.startsWith('image/')) {
    return processImage(file);
  }

  if (isPDFFile(file)) {
    return processPDF(file, options.pdf);
  }

  throw new Error('Unsupported file type');
}

async function processImage(file: File): Promise<ProcessedFile> {
  const compressedFile = await imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  });

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(compressedFile);
  });

  return {
    type: 'image',
    name: file.name,
    totalPages: 1,
    getPage: async () => dataUrl,
    dispose: async () => {},
  };
}

async function processPDF(
  file: File,
  preloaded?: pdfjsLib.PDFDocumentProxy
): Promise<ProcessedFile> {
  const pdf =
    preloaded ??
    (await loadPDFDocument(await file.arrayBuffer()).promise);

  let disposed = false;

  return {
    type: 'pdf',
    name: file.name,
    totalPages: pdf.numPages,
    getPage: async (pageNumber: number, maxSize: number = THUMBNAIL_MAX_SIZE) => {
      const page = await pdf.getPage(pageNumber);
      const baseViewport = page.getViewport({ scale: 1.0 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Canvas context not available');
      }

      // Never upscale: a small page rendered at 1920px is all interpolation.
      const scale = Math.min(
        maxSize / baseViewport.width,
        maxSize / baseViewport.height,
        1
      );
      const viewport = page.getViewport({ scale });
      canvas.width = Math.max(1, Math.floor(viewport.width));
      canvas.height = Math.max(1, Math.floor(viewport.height));

      // PDF pages have no background of their own; without this, transparent
      // areas render as black in the JPEG.
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);

      try {
        await page.render({ canvasContext: context, viewport }).promise;
        return canvas.toDataURL('image/jpeg', 0.9);
      } finally {
        page.cleanup();
      }
    },
    dispose: async () => {
      if (disposed) return;
      disposed = true;
      await pdf.destroy();
    },
  };
}
