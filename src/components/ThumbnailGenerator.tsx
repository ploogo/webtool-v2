import React, { useState, useCallback, useEffect, useRef } from 'react';
import FileUploader from './FileUploader';
import PagePreview from './PagePreview';
import GenerateButton from './GenerateButton';
import ThumbnailGrid from './ThumbnailGrid';
import PDFErrorDisplay from './PDFErrorDisplay';
import { validatePDF, isPDFFile, PDFValidationResult } from '../lib/pdfProcessing';
import { extensionForDataUrl } from '../lib/imageFormats';
import {
  processFile,
  ProcessedFile,
  PREVIEW_MAX_SIZE,
  THUMBNAIL_MAX_SIZE,
} from '../lib/fileProcessors';

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
  const [validationResult, setValidationResult] = useState<PDFValidationResult | null>(null);

  // Selecting a new file while the previous one is still rendering would
  // otherwise let stale previews land in the grid.
  const requestId = useRef(0);
  const activeFile = useRef<ProcessedFile | null>(null);

  useEffect(() => {
    return () => {
      requestId.current += 1;
      void activeFile.current?.dispose();
    };
  }, []);

  const handleFileSelect = useCallback(async (selectedFile: File | null) => {
    const currentRequest = ++requestId.current;

    void activeFile.current?.dispose();
    activeFile.current = null;

    setFile(selectedFile);
    setSelectedPages(new Set());
    setThumbnails([]);
    setPreviews([]);
    setValidationResult(null);
    setProcessedFile(null);

    if (!selectedFile) return;

    try {
      setLoading(true);

      let processed: ProcessedFile;

      if (isPDFFile(selectedFile)) {
        const validation = await validatePDF(selectedFile);
        if (currentRequest !== requestId.current) {
          await validation.document?.destroy();
          return;
        }

        if (!validation.isValid) {
          setValidationResult(validation);
          return;
        }

        // Reuse the document parsed during validation rather than reading and
        // parsing the whole file a second time.
        processed = await processFile(selectedFile, { pdf: validation.document });
      } else {
        processed = await processFile(selectedFile);
      }

      if (currentRequest !== requestId.current) {
        await processed.dispose();
        return;
      }

      activeFile.current = processed;
      setProcessedFile(processed);

      const previewData: PagePreviewData[] = Array.from(
        { length: processed.totalPages },
        (_, i) => ({ pageNumber: i + 1, dataUrl: null, loading: true })
      );
      setPreviews(previewData);

      // Single-page documents have nothing to select, so render the full-size
      // thumbnail straight away.
      if (processed.totalPages === 1) {
        setSelectedPages(new Set([1]));
        const dataUrl = await processed.getPage(1, THUMBNAIL_MAX_SIZE);
        if (currentRequest !== requestId.current) return;
        setPreviews([{ pageNumber: 1, dataUrl, loading: false }]);
        setThumbnails([{ pageNumber: 1, dataUrl }]);
        return;
      }

      for (let pageNumber = 1; pageNumber <= processed.totalPages; pageNumber++) {
        const dataUrl = await processed.getPage(pageNumber, PREVIEW_MAX_SIZE);
        if (currentRequest !== requestId.current) return;
        setPreviews(prev =>
          prev.map(p =>
            p.pageNumber === pageNumber ? { ...p, dataUrl, loading: false } : p
          )
        );
      }
    } catch (err) {
      if (currentRequest !== requestId.current) return;
      console.error('Error processing file:', err);
      setValidationResult({
        isValid: false,
        error:
          err instanceof Error && err.message
            ? `An error occurred while processing the file: ${err.message}`
            : 'An unexpected error occurred while processing the file.',
        details: { size: selectedFile.size },
      });
    } finally {
      if (currentRequest === requestId.current) {
        setLoading(false);
      }
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

    const currentRequest = requestId.current;

    try {
      setLoading(true);
      const newThumbnails: Thumbnail[] = [];

      for (const pageNumber of Array.from(selectedPages).sort((a, b) => a - b)) {
        const dataUrl = await processedFile.getPage(pageNumber, THUMBNAIL_MAX_SIZE);
        newThumbnails.push({ pageNumber, dataUrl });
      }

      if (currentRequest !== requestId.current) return;
      setThumbnails(newThumbnails);
    } catch (err) {
      if (currentRequest !== requestId.current) return;
      console.error('Error generating thumbnails:', err);
      setValidationResult({
        isValid: false,
        error: 'Failed to generate thumbnails. Please try again.',
        details: { size: file?.size || 0 },
      });
    } finally {
      if (currentRequest === requestId.current) {
        setLoading(false);
      }
    }
  };

  const handleDownload = useCallback(
    async (dataUrl: string, pageNumber: number, format: string, size: number, filename: string) => {
      try {
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = () => reject(new Error('Failed to load generated image'));
          img.src = dataUrl;
        });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          throw new Error('Could not get canvas context');
        }

        const aspectRatio = img.height / img.width;
        canvas.width = size;
        canvas.height = Math.max(1, Math.round(size * aspectRatio));

        if (format !== 'png' && format !== 'webp') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const mimeType = `image/${format}`;
        const quality = format === 'png' ? undefined : 0.9;
        const convertedImage = canvas.toDataURL(mimeType, quality);

        const link = document.createElement('a');
        link.href = convertedImage;
        // Name the file after what the canvas actually encoded, so an
        // unsupported format never ships as a PNG wearing another extension.
        link.download = `${filename}.${extensionForDataUrl(convertedImage, format)}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error('Error downloading image:', err);
        setValidationResult({
          isValid: false,
          error: 'Failed to download image. Please try again.',
          details: { size: file?.size || 0 },
        });
      }
    },
    [file]
  );

  return (
    <div className="relative pb-24">
      <div className="space-y-8">
        <FileUploader
          onFileSelect={handleFileSelect}
          currentFileName={file?.name || null}
        />

        {validationResult && !validationResult.isValid && (
          <PDFErrorDisplay
            error={validationResult.error || 'Unknown error'}
            details={validationResult.details}
          />
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
              <h3 className="text-lg font-medium text-white mb-4">Select Pages</h3>
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
        <div className="fixed bottom-0 left-0 right-0 bg-jet-900 border-t border-jet-800 p-4 shadow-lg">
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
