import React, { useState, useCallback } from 'react';
import { pdfjsLib } from '../lib/pdfjs';
import PDFUploader from './PDFUploader';
import PagePreview from './PagePreview';
import GenerateButton from './GenerateButton';
import ThumbnailGrid from './ThumbnailGrid';

interface Thumbnail {
  pageNumber: number;
  dataUrl: string;
}

interface PagePreviewData {
  pageNumber: number;
  dataUrl: string | null;
  loading: boolean;
}

export default function PDFThumbnailGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
  const [previews, setPreviews] = useState<PagePreviewData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePreview = useCallback(async (pdf: pdfjsLib.PDFDocumentProxy, pageNumber: number) => {
    try {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.0 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Canvas context not available');
      }

      const scale = 150 / viewport.width;
      canvas.width = viewport.width * scale;
      canvas.height = viewport.height * scale;

      await page.render({
        canvasContext: context,
        viewport: page.getViewport({ scale }),
      }).promise;

      return canvas.toDataURL('image/jpeg', 0.5);
    } catch (err) {
      console.error(`Error generating preview for page ${pageNumber}:`, err);
      return null;
    }
  }, []);

  const convertFormat = useCallback(async (dataUrl: string, format: string, size: number): Promise<string> => {
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = dataUrl;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    const aspectRatio = img.height / img.width;
    canvas.width = size;
    canvas.height = size * aspectRatio;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const mimeType = `image/${format}`;
    const quality = format === 'jpeg' ? 0.9 : undefined;

    return canvas.toDataURL(mimeType, quality);
  }, []);

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
    setPreviews([]);
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
        
        const previewData: PagePreviewData[] = Array.from(
          { length: pdf.numPages },
          (_, i) => ({
            pageNumber: i + 1,
            dataUrl: null,
            loading: true,
          })
        );
        setPreviews(previewData);

        for (let i = 0; i < pdf.numPages; i++) {
          const pageNumber = i + 1;
          const dataUrl = await generatePreview(pdf, pageNumber);
          setPreviews(prev => 
            prev.map(p => 
              p.pageNumber === pageNumber
                ? { ...p, dataUrl, loading: false }
                : p
            )
          );
        }
      }
    } catch (err) {
      setError('Error loading PDF. Please try another file.');
    } finally {
      setLoading(false);
    }
  }, [generatePreview]);

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

          const scale = 1200 / viewport.width; // Generate at max quality
          canvas.width = viewport.width * scale;
          canvas.height = viewport.height * scale;

          await page.render({
            canvasContext: context,
            viewport: page.getViewport({ scale }),
          }).promise;

          newThumbnails.push({
            pageNumber,
            dataUrl: canvas.toDataURL('image/jpeg', 1.0),
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

  const handleDownload = useCallback(async (dataUrl: string, pageNumber: number, format: string, size: number, filename: string) => {
    try {
      const convertedImage = await convertFormat(dataUrl, format, size);
      const link = document.createElement('a');
      link.href = convertedImage;
      link.download = `${filename}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading image:', err);
      setError('Failed to download image. Please try again.');
    }
  }, [convertFormat]);

  return (
    <div className="relative pb-24">
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

        {thumbnails.length > 0 && (
          <ThumbnailGrid
            thumbnails={thumbnails}
            onDownload={handleDownload}
          />
        )}

        {numPages > 0 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Select Pages</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {previews.map((preview) => (
                  <PagePreview
                    key={preview.pageNumber}
                    pageNumber={preview.pageNumber}
                    dataUrl={preview.dataUrl}
                    isSelected={selectedPages.has(preview.pageNumber)}
                    onToggle={() => handlePageToggle(preview.pageNumber)}
                    loading={preview.loading}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {numPages > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
          <div className="max-w-7xl mx-auto px-8 flex justify-center">
            <GenerateButton
              onClick={generateThumbnails}
              disabled={selectedPages.size === 0 || loading}
              loading={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
}