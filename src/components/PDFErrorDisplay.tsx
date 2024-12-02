import React from 'react';
import { AlertCircle, FileWarning, Lock, FileX, HelpCircle } from 'lucide-react';
import { getReadableFileSize } from '../lib/pdfProcessing';

interface PDFErrorDisplayProps {
  error: string;
  details?: {
    size?: number;
    pages?: number;
    version?: string;
    isEncrypted?: boolean;
    isCorrupted?: boolean;
  };
}

export default function PDFErrorDisplay({ error, details }: PDFErrorDisplayProps) {
  const getErrorIcon = () => {
    if (details?.isEncrypted) return Lock;
    if (details?.isCorrupted) return FileX;
    if (error.includes('size')) return FileWarning;
    return AlertCircle;
  };

  const Icon = getErrorIcon();

  const getTroubleshootingSteps = () => {
    const steps: string[] = [];

    if (details?.isEncrypted) {
      steps.push('Open the PDF in Adobe Acrobat or another PDF editor');
      steps.push('Go to File > Properties > Security');
      steps.push('Remove password protection and save the file');
    } else if (details?.isCorrupted) {
      steps.push('Try opening and re-saving the PDF with Adobe Acrobat');
      steps.push('Use an online PDF repair tool');
      steps.push('If possible, regenerate the PDF from its source');
    } else if (details?.version) {
      steps.push('Save the PDF with a newer version of Adobe Acrobat');
      steps.push('Try converting the PDF to version 1.7 or earlier');
    }

    // Common steps
    steps.push('Verify the file opens correctly in a PDF reader');
    steps.push('Check if the file is not corrupted during download');
    steps.push('Try reducing the file size if it exceeds the limit');

    return steps;
  };

  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start gap-4">
        <Icon className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium text-red-700">Upload Failed</h3>
            <div className="relative group">
              <HelpCircle className="w-4 h-4 text-red-400 cursor-help" />
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-64 p-3 bg-red-900 text-red-50 text-xs rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10">
                Our system accepts PDFs up to 100MB in size, versions 1.0-2.0, without password protection.
              </div>
            </div>
          </div>
          
          <p className="mt-1 text-red-600">{error}</p>

          {details && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium text-red-700">File Details:</h4>
              <ul className="text-sm text-red-600 space-y-1">
                {details.size && (
                  <li>File size: {getReadableFileSize(details.size)}</li>
                )}
                {details.version && <li>PDF Version: {details.version}</li>}
                {details.pages && <li>Pages: {details.pages}</li>}
              </ul>
            </div>
          )}

          <div className="mt-6 space-y-2">
            <h4 className="text-sm font-medium text-red-700">Troubleshooting Steps:</h4>
            <ul className="text-sm text-red-600 space-y-2">
              {getTroubleshootingSteps().map((step, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="font-medium">{index + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 text-sm text-red-600">
            <p className="font-medium">Still having issues?</p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>Try using a different PDF viewer to verify the file</li>
              <li>Check if you have the latest version of your browser</li>
              <li>Clear your browser's cache and try again</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}