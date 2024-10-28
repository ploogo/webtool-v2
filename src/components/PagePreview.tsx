import React from 'react';
import { Loader2 } from 'lucide-react';

interface PagePreviewProps {
  pageNumber: number;
  dataUrl: string | null;
  isSelected: boolean;
  onToggle: () => void;
  loading?: boolean;
}

export default function PagePreview({ pageNumber, dataUrl, isSelected, onToggle, loading }: PagePreviewProps) {
  return (
    <button
      onClick={onToggle}
      className={`relative aspect-[3/4] rounded-lg overflow-hidden transition-all ${
        isSelected 
          ? 'ring-2 ring-blue-500 ring-offset-2' 
          : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-2'
      }`}
    >
      {loading ? (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      ) : dataUrl ? (
        <img
          src={dataUrl}
          alt={`Page ${pageNumber}`}
          className="w-full h-full object-cover bg-white"
        />
      ) : (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <span className="text-sm text-gray-500">No preview</span>
        </div>
      )}
      <div className="absolute bottom-0 inset-x-0 bg-black/75 h-8 flex items-center justify-center">
        <span className="text-sm text-white font-medium">Page {pageNumber}</span>
      </div>
    </button>
  );
}