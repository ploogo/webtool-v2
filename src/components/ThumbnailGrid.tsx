import React from 'react';
import { Download } from 'lucide-react';

interface Thumbnail {
  pageNumber: number;
  dataUrl: string;
}

interface ThumbnailGridProps {
  thumbnails: Thumbnail[];
  onDownload: (dataUrl: string, pageNumber: number) => void;
}

export default function ThumbnailGrid({ thumbnails, onDownload }: ThumbnailGridProps) {
  if (thumbnails.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Generated Thumbnails</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {thumbnails.map(({ pageNumber, dataUrl }) => (
          <div key={pageNumber} className="relative group">
            <img
              src={dataUrl}
              alt={`Page ${pageNumber}`}
              className="w-full rounded-lg shadow-md"
            />
            <button
              onClick={() => onDownload(dataUrl, pageNumber)}
              className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-md 
                opacity-0 group-hover:opacity-100 transition-opacity"
              title="Download thumbnail"
            >
              <Download className="w-4 h-4 text-gray-700" />
            </button>
            <span className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white rounded-md text-sm">
              Page {pageNumber}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}