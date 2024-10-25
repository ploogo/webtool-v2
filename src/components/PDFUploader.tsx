import React, { useCallback } from 'react';
import { Upload, X } from 'lucide-react';

interface PDFUploaderProps {
  onFileSelect: (file: File | null) => void;
  currentFileName: string | null;
}

export default function PDFUploader({ onFileSelect, currentFileName }: PDFUploaderProps) {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file && !file.type.includes('pdf')) {
      alert('Please select a PDF file');
      return;
    }
    onFileSelect(file);
  }, [onFileSelect]);

  const handleClear = useCallback(() => {
    onFileSelect(null);
  }, [onFileSelect]);

  return (
    <div className="w-full">
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {currentFileName ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">{currentFileName}</span>
              <button
                onClick={handleClear}
                className="p-1 hover:bg-gray-200 rounded-full"
                title="Clear selection"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 mb-2 text-gray-500" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PDF files only</p>
            </>
          )}
        </div>
        <input
          type="file"
          className="hidden"
          accept=".pdf"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
}