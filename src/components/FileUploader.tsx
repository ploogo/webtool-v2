import React, { useCallback, useRef } from 'react';
import { Upload, X } from 'lucide-react';

export type UploadKind = 'image' | 'pdf';

interface FileUploaderProps {
  onFileSelect: (file: File | null) => void;
  currentFileName: string | null;
  /** Which kinds of file this tool can actually handle. Defaults to both. */
  accept?: UploadKind[];
}

const KIND_LABELS: Record<UploadKind, string> = {
  image: 'Images (JPEG, PNG, WebP, etc.)',
  pdf: 'PDF documents',
};

const KIND_ACCEPT: Record<UploadKind, string> = {
  image: 'image/*',
  pdf: 'application/pdf,.pdf',
};

function matchesKind(file: File, kind: UploadKind): boolean {
  if (kind === 'image') return file.type.startsWith('image/');
  // Some platforms hand over a PDF with an empty or non-standard MIME type, so
  // fall back to the extension before rejecting the file.
  return file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
}

export default function FileUploader({
  onFileSelect,
  currentFileName,
  accept = ['image', 'pdf'],
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] || null;
      if (file && !accept.some(kind => matchesKind(file, kind))) {
        alert(
          'Please select a supported file type:\n' +
            accept.map(kind => KIND_LABELS[kind]).join('\n')
        );
        event.target.value = '';
        return;
      }
      onFileSelect(file);
    },
    [onFileSelect, accept]
  );

  const handleClear = useCallback(() => {
    // Without this, re-picking the same file fires no change event.
    if (inputRef.current) inputRef.current.value = '';
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
                {accept.map((kind) => (
                  <li key={kind}>{KIND_LABELS[kind]}</li>
                ))}
              </ul>
            </>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept.map(kind => KIND_ACCEPT[kind]).join(',')}
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
}
