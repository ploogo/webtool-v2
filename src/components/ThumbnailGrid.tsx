import React, { useState } from 'react';
import { Download, Settings, PackageCheck } from 'lucide-react';
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
        <h3 className="text-lg font-medium text-gray-900">Generated Thumbnails</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={handleBatchExport}
            disabled={exporting}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              exporting
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
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
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm">Export Settings</span>
            </button>

            {showSettings && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowSettings(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-20 p-4 space-y-4">
                  <FileNamePattern
                    onChange={setFilePattern}
                    defaultPattern={filePattern}
                  />

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Format
                    </label>
                    <select
                      value={selectedFormat}
                      onChange={(e) => setSelectedFormat(e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      {IMAGE_FORMATS.map((format) => (
                        <option key={format.value} value={format.value}>
                          {format.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Size
                    </label>
                    <select
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(Number(e.target.value))}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
              className="w-full rounded-lg shadow-md"
            />
            <button
              onClick={() => onDownload(dataUrl, pageNumber, selectedFormat, selectedSize, getFilename(pageNumber))}
              className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-md 
                opacity-0 group-hover:opacity-100 transition-opacity"
              title="Download thumbnail"
            >
              <Download className="w-4 h-4 text-gray-700" />
            </button>
            <div className="absolute bottom-2 left-2 px-3 py-1.5 bg-black/75 text-white rounded-md text-sm">
              {getFilename(pageNumber)}.{selectedFormat}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}