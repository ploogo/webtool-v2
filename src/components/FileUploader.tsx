import React, { useCallback } from 'react';
import { Upload, X } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File | null) => void;
  currentFileName: string | null;
}

const ACCEPTED_TYPES = {
  'image/*': 'Images (JPEG, PNG, WebP, etc.)',
  'application/pdf': 'PDF documents',
};

const ACCEPT_STRING = Object.keys(ACCEPTED_TYPES).join(',');

export default function FileUploader({ onFileSelect, currentFileName }: FileUploaderProps) {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file && !Object.keys(ACCEPTED_TYPES).some(type => {
      if (type.endsWith('*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    })) {
      alert('Please select a supported file type:\n' + Object.values(ACCEPTED_TYPES).join('\n'));
      return;
    }
    onFileSelect(file);
  }, [onFileSelect]);

  const handleClear = useCallback(() => {
    onFileSelect(null);
  }, [onFileSelect]);

  return (
    <div className="w-full">
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-jet-700 border-dashed rounded-lg cursor-pointer bg-jet-800/50 hover:bg-jet-800">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {currentFileName ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">{currentFileName}</span>
              <button
                onClick={handleClear}
                className="p-1 hover:bg-jet-700 rounded-full"
                aria-label="Clear file selection"
              >
                <X className="w-4 h-4 text-gray-400" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 mb-2 text-gray-400" aria-hidden="true" />
              <p className="mb-2 text-sm text-gray-300">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-400">
                Supported files:
              </p>
              <ul className="text-xs text-gray-400 list-disc list-inside">
                {Object.values(ACCEPTED_TYPES).map((type) => (
                  <li key={type}>{type}</li>
                ))}
              </ul>
            </>
          )}
        </div>
        <input
          type="file"
          className="hidden"
          accept={ACCEPT_STRING}
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
}