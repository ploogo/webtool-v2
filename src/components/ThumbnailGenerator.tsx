import React, { useState, useCallback } from 'react';
import FileUploader from './FileUploader';
import PagePreview from './PagePreview';
import GenerateButton from './GenerateButton';
import ThumbnailGrid from './ThumbnailGrid';
import { processFile, ProcessedFile } from '../lib/fileProcessors';

interface Thumbnail {
  pageNumber: number;
  dataUrl: string;
}

interface PagePreviewData {
  pageNumber: number;
  dataUrl: string | null;
  loading: boolean;
}

export default function ThumbnailGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [processedFile, setProcessedFile] = useState<ProcessedFile | null>(null);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
  const [previews, setPreviews] = useState<PagePreviewData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback(async (selectedFile: File | null) => {
    setFile(selectedFile);
    setSelectedPages(new Set());
    setThumbnails([]);
    setPreviews([]);
    setError(null);
    setProcessedFile(null);

    if (!selectedFile) return;

    try {
      setLoading(true);
      const processed = await processFile(selectedFile);
      setProcessedFile(processed);

      // For single-page documents, automatically select the page
      if (processed.totalPages === 1) {
        setSelectedPages(new Set([1]));
      }

      const previewData: PagePreviewData[] = Array.from(
        { length: processed.totalPages },
        (_, i) => ({
          pageNumber: i + 1,
          dataUrl: null,
          loading: true,
        })
      );
      setPreviews(previewData);

      for (let i = 0; i < processed.totalPages; i++) {
        const pageNumber = i + 1;
        const dataUrl = await processed.getPage(pageNumber);
        setPreviews(prev =>
          prev.map(p =>
            p.pageNumber === pageNumber
              ? { ...p, dataUrl, loading: false }
              : p
          )
        );
      }

      // For single-page documents, generate thumbnail immediately
      if (processed.totalPages === 1) {
        const dataUrl = await processed.getPage(1);
        setThumbnails([{ pageNumber: 1, dataUrl }]);
      }
    } catch (err) {
      setError('Error processing file. Please try another file.');
      console.error('Error processing file:', err);
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
    if (!processedFile || selectedPages.size === 0) return;

    try {
      setLoading(true);
      setError(null);

      const newThumbnails: Thumbnail[] = [];

      for (const pageNumber of selectedPages) {
        try {
          const dataUrl = await processedFile.getPage(pageNumber);
          newThumbnails.push({ pageNumber, dataUrl });
        } catch (pageErr) {
          console.error(`Error processing page ${pageNumber}:`, pageErr);
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
      const convertedImage = canvas.toDataURL(mimeType, quality);

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
  }, []);

  return (
    <div className="relative pb-24">
      <div className="space-y-8">
        <FileUploader
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

        {processedFile && processedFile.totalPages > 1 && (
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

      {processedFile && processedFile.totalPages > 1 && (
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