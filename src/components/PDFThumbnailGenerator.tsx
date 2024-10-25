import React, { useState, useCallback } from 'react';
import { pdfjsLib } from '../lib/pdfjs';
import PDFUploader from './PDFUploader';
import PageSelector from './PageSelector';
import GenerateButton from './GenerateButton';
import ThumbnailGrid from './ThumbnailGrid';

interface Thumbnail {
  pageNumber: number;
  dataUrl: string;
}

export default function PDFThumbnailGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPDF = async (pdfFile: File): Promise<pdfjsLib.PDFDocumentProxy | null> => {
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      return await loadingTask.promise;
    } catch (err) {
      console.error('Error loading PDF:', err);
      throw new Error('Failed to load PDF file');
    }
  };

  const handleFileSelect = useCallback(async (selectedFile: File | null) => {
    setFile(selectedFile);
    setSelectedPages(new Set());
    setThumbnails([]);
    setError(null);

    if (!selectedFile) {
      setNumPages(0);
      return;
    }

    try {
      setLoading(true);
      const pdf = await loadPDF(selectedFile);
      if (pdf) {
        setNumPages(pdf.numPages);
      }
    } catch (err) {
      setError('Error loading PDF. Please try another file.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePageToggle = useCallback((pageNumber: number) => {
    setSelectedPages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pageNumber)) {
        newSet.delete(pageNumber);
      } else {
        newSet.add(pageNumber);
      }
      return newSet;
    });
  }, []);

  const generateThumbnails = async () => {
    if (!file || selectedPages.size === 0) return;

    try {
      setLoading(true);
      setError(null);

      const pdf = await loadPDF(file);
      if (!pdf) {
        throw new Error('Failed to load PDF');
      }

      const newThumbnails: Thumbnail[] = [];

      for (const pageNumber of selectedPages) {
        try {
          const page = await pdf.getPage(pageNumber);
          const viewport = page.getViewport({ scale: 1.0 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          if (!context) {
            throw new Error('Failed to get canvas context');
          }

          const scale = 300 / viewport.width;
          canvas.width = viewport.width * scale;
          canvas.height = viewport.height * scale;

          await page.render({
            canvasContext: context,
            viewport: page.getViewport({ scale }),
          }).promise;

          newThumbnails.push({
            pageNumber,
            dataUrl: canvas.toDataURL('image/jpeg', 0.8),
          });
        } catch (pageErr) {
          console.error(`Error rendering page ${pageNumber}:`, pageErr);
          setError(`Error generating thumbnail for page ${pageNumber}`);
        }
      }

      if (newThumbnails.length > 0) {
        setThumbnails(newThumbnails);
      }
    } catch (err) {
      setError('Error generating thumbnails. Please try again.');
      console.error('Error generating thumbnails:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = useCallback((dataUrl: string, pageNumber: number) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `page-${pageNumber}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return (
    <div className="space-y-8">
      <PDFUploader
        onFileSelect={handleFileSelect}
        currentFileName={file?.name || null}
      />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      {numPages > 0 && (
        <div className="space-y-6">
          <PageSelector
            numPages={numPages}
            selectedPages={selectedPages}
            onPageToggle={handlePageToggle}
          />

          <div className="flex justify-center">
            <GenerateButton
              onClick={generateThumbnails}
              disabled={selectedPages.size === 0 || loading}
              loading={loading}
            />
          </div>
        </div>
      )}

      <ThumbnailGrid
        thumbnails={thumbnails}
        onDownload={handleDownload}
      />
    </div>
  );
}