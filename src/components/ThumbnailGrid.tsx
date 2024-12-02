import React, { useState } from 'react';
import { Download, Settings, PackageCheck, Info } from 'lucide-react';
import FileNamePattern from './FileNamePattern';

interface Thumbnail {
  pageNumber: number;
  dataUrl: string;
}

interface ThumbnailGridProps {
  thumbnails: Thumbnail[];
  onDownload: (dataUrl: string, pageNumber: number, format: string, size: number, filename: string) => void;
}

const IMAGE_FORMATS = [
  { value: 'jpeg', label: 'JPEG' },
  { value: 'png', label: 'PNG' },
  { value: 'webp', label: 'WebP' },
  { value: 'avif', label: 'AVIF' },
];

const SIZES = [
  { value: 300, label: 'Small (300px)' },
  { value: 600, label: 'Medium (600px)' },
  { value: 900, label: 'Large (900px)' },
  { value: 1200, label: 'Extra Large (1200px)' },
];

export default function ThumbnailGrid({ thumbnails, onDownload }: ThumbnailGridProps) {
  const [selectedFormat, setSelectedFormat] = useState('jpeg');
  const [selectedSize, setSelectedSize] = useState(300);
  const [showSettings, setShowSettings] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [filePattern, setFilePattern] = useState('page-{n}');

  if (thumbnails.length === 0) return null;

  const getFilename = (pageNumber: number) => {
    return filePattern.replace('{n}', pageNumber.toString());
  };

  const handleBatchExport = async () => {
    setExporting(true);
    try {
      for (const thumbnail of thumbnails) {
        await onDownload(
          thumbnail.dataUrl,
          thumbnail.pageNumber,
          selectedFormat,
          selectedSize,
          getFilename(thumbnail.pageNumber)
        );
        // Small delay to prevent browser from being overwhelmed
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium text-white">Generated Thumbnails</h3>
          <div className="relative group">
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-64 p-3 bg-jet-800 text-sm text-gray-300 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10">
              Click individual thumbnails to download, or use the export options to download all at once.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleBatchExport}
            disabled={exporting}
            className={`btn-primary ${exporting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {exporting ? (
              <>
                <PackageCheck className="w-4 h-4 animate-pulse" />
                Exporting...
              </>
            ) : (
              <>
                <PackageCheck className="w-4 h-4" />
                Export All
              </>
            )}
          </button>
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="btn-secondary"
            >
              <Settings className="w-4 h-4" />
              <span>Export Settings</span>
            </button>

            {showSettings && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowSettings(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-jet-800 rounded-lg shadow-lg z-20 p-4 space-y-4 border border-jet-700">
                  <FileNamePattern
                    onChange={setFilePattern}
                    defaultPattern={filePattern}
                  />

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Format
                    </label>
                    <select
                      value={selectedFormat}
                      onChange={(e) => setSelectedFormat(e.target.value)}
                      className="input"
                    >
                      {IMAGE_FORMATS.map((format) => (
                        <option key={format.value} value={format.value}>
                          {format.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Size
                    </label>
                    <select
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(Number(e.target.value))}
                      className="input"
                    >
                      {SIZES.map((size) => (
                        <option key={size.value} value={size.value}>
                          {size.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {thumbnails.map(({ pageNumber, dataUrl }) => (
          <div key={pageNumber} className="relative group">
            <img
              src={dataUrl}
              alt={`Page ${pageNumber}`}
              className="w-full rounded-lg shadow-md bg-jet-800"
            />
            <button
              onClick={() => onDownload(dataUrl, pageNumber, selectedFormat, selectedSize, getFilename(pageNumber))}
              className="absolute top-2 right-2 p-2 bg-jet-900/90 backdrop-blur-sm rounded-full shadow-md 
                opacity-0 group-hover:opacity-100 transition-opacity hover:bg-jet-800"
              title="Download thumbnail"
            >
              <Download className="w-4 h-4 text-gray-300" />
            </button>
            <div className="absolute bottom-2 left-2 px-3 py-1.5 bg-jet-900/90 backdrop-blur-sm text-gray-300 rounded-md text-sm">
              {getFilename(pageNumber)}.{selectedFormat}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}