import { useState, useCallback } from 'react';
import { loadPDFDocument } from './pdfjs';

interface UsePDFReturn {
  file: File | null;
  numPages: number;
  loading: boolean;
  error: string | null;
  loadPDF: (file: File | null) => Promise<void>;
}

export function usePDF(): UsePDFReturn {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPDF = useCallback(async (selectedFile: File | null) => {
    setFile(selectedFile);
    setError(null);

    if (!selectedFile) {
      setNumPages(0);
      return;
    }

    if (!selectedFile.type.includes('pdf')) {
      setError('Please select a valid PDF file.');
      setNumPages(0);
      return;
    }

    try {
      setLoading(true);
      const arrayBuffer = await selectedFile.arrayBuffer();
      // Supplying an empty password just made pdf.js ask again in a loop; let
      // it reject with a PasswordException and report that instead.
      const pdf = await loadPDFDocument(arrayBuffer).promise;
      setNumPages(pdf.numPages);
    } catch (err) {
      console.error('Error loading PDF:', err);
      setError(
        err instanceof Error
          ? `Error: ${err.message}`
          : 'Unable to load PDF. Please ensure it is a valid PDF document.'
      );
      setNumPages(0);
    } finally {
      setLoading(false);
    }
  }, []);

  return { file, numPages, loading, error, loadPDF };
}