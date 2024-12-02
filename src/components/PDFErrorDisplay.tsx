import React from 'react';
import { AlertCircle, FileWarning, Lock, FileX } from 'lucide-react';

interface PDFErrorDisplayProps {
  error: string;
  details?: {
    size?: number;
    pages?: number;
    version?: string;
  };
}

export default function PDFErrorDisplay({ error, details }: PDFErrorDisplayProps) {
  const getErrorIcon = () => {
    if (error.includes('Password')) return Lock;
    if (error.includes('corrupted')) return FileX;
    if (error.includes('size')) return FileWarning;
    return AlertCircle;
  };

  const Icon = getErrorIcon();

  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-red-700 font-medium">{error}</p>
          {details && (
            <div className="mt-2 text-sm text-red-600">
              <ul className="list-disc list-inside space-y-1">
                {details.size && (
                  <li>File size: {(details.size / (1024 * 1024)).toFixed(2)}MB</li>
                )}
                {details.pages && <li>Pages: {details.pages}</li>}
                {details.version && <li>PDF Version: {details.version}</li>}
              </ul>
            </div>
          )}
          <div className="mt-3 text-sm text-red-600">
            <p className="font-medium">Troubleshooting steps:</p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>Ensure the file is a valid PDF document</li>
              <li>Try saving the PDF with a newer version of Adobe Acrobat or similar software</li>
              <li>Check if the PDF is password-protected and remove the protection</li>
              <li>Verify the file is not corrupted by opening it in a PDF reader</li>
              <li>Try reducing the file size if it exceeds the limit</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}