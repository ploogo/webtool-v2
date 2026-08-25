import { useState, useCallback } from 'react';
import { loadPDFDocument } from './pdfjs';

interface Thumbnail {
  pageNumber: number;
  dataUrl: string;
}

interface UseThumbnailsReturn {
  thumbnails: Thumbnail[];
  loading: boolean;
  error: string | null;
  generateThumbnails: (file: File, selectedPages: Set<number>) => Promise<void>;
}

export function useThumbnails(): UseThumbnailsReturn {
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateThumbnails = useCallback(async (file: File, selectedPages: Set<number>) => {
    if (!file || selectedPages.size === 0) return;

    try {
      setLoading(true);
      setError(null);

      const arrayBuffer = await file.arrayBuffer();
      // With no onPassword handler pdf.js rejects with a PasswordException,
      // which the catch below turns into a message. Throwing from inside the
      // handler, as before, left the rejection unhandled.
      const pdf = await loadPDFDocument(arrayBuffer).promise;
      const newThumbnails: Thumbnail[] = [];
      const sortedPages = Array.from(selectedPages).sort((a, b) => a - b);

      for (const pageNumber of sortedPages) {
        try {
          const page = await pdf.getPage(pageNumber);
          const viewport = page.getViewport({ scale: 1.0 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          if (!context) {
            throw new Error('Canvas context not available');
          }

          const scale = Math.min(300 / viewport.width, 300 / viewport.height);
          canvas.width = viewport.width * scale;
          canvas.height = viewport.height * scale;

          await page.render({
            canvas,
            canvasContext: context,
            viewport: page.getViewport({ scale }),
          }).promise;

          newThumbnails.push({
            pageNumber,
            dataUrl: canvas.toDataURL('image/jpeg', 0.8),
          });
        } catch (pageErr) {
          console.error(`Error rendering page ${pageNumber}:`, pageErr);
          throw new Error(`Failed to generate thumbnail for page ${pageNumber}`);
        }
      }

      setThumbnails(newThumbnails);
    } catch (err) {
      const isPassword = err instanceof Error && err.name === 'PasswordException';
      setError(
        isPassword
          ? 'Password-protected PDFs are not supported.'
          : err instanceof Error
            ? err.message
            : 'Failed to generate thumbnails'
      );
      setThumbnails([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { thumbnails, loading, error, generateThumbnails };
}