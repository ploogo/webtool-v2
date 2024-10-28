import { pdfjsLib } from './pdfjs';
import imageCompression from 'browser-image-compression';

export interface ProcessedFile {
  type: 'image' | 'pdf';
  name: string;
  totalPages: number;
  getPage: (pageNumber: number) => Promise<string>;
}

export async function processFile(file: File): Promise<ProcessedFile> {
  switch (file.type) {
    case 'image/jpeg':
    case 'image/png':
    case 'image/webp':
    case 'image/gif':
      return processImage(file);
    case 'application/pdf':
      return processPDF(file);
    default:
      throw new Error('Unsupported file type');
  }
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
  };
}

async function processPDF(file: File): Promise<ProcessedFile> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  return {
    type: 'pdf',
    name: file.name,
    totalPages: pdf.numPages,
    getPage: async (pageNumber: number) => {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.0 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Canvas context not available');
      }

      const scale = Math.min(1920 / viewport.width, 1920 / viewport.height);
      canvas.width = viewport.width * scale;
      canvas.height = viewport.height * scale;

      await page.render({
        canvasContext: context,
        viewport: page.getViewport({ scale }),
      }).promise;

      return canvas.toDataURL('image/jpeg', 0.9);
    },
  };
}