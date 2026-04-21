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
      type="button"
      onClick={onToggle}
      aria-pressed={isSelected}
      aria-label={`Page ${pageNumber}, ${isSelected ? 'selected' : 'not selected'}`}
      aria-busy={loading}
      className={`relative aspect-[3/4] rounded-lg overflow-hidden transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-500 focus-visible:ring-offset-2 focus-visible:ring-offset-jet-950 ${
        isSelected
          ? 'ring-2 ring-neon-500 ring-offset-2 ring-offset-jet-950'
          : 'hover:ring-2 hover:ring-jet-600 hover:ring-offset-2 hover:ring-offset-jet-950'
      }`}
    >
      {loading ? (
        <div className="absolute inset-0 bg-jet-800 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" aria-hidden="true" />
          <span className="sr-only">Loading page {pageNumber}</span>
        </div>
      ) : dataUrl ? (
        <img
          src={dataUrl}
          alt={`Preview of page ${pageNumber}`}
          className="w-full h-full object-cover bg-jet-800"
        />
      ) : (
        <div className="absolute inset-0 bg-jet-800 flex items-center justify-center">
          <span className="text-sm text-gray-400">No preview</span>
        </div>
      )}
      <div className="absolute bottom-0 inset-x-0 bg-jet-900/90 backdrop-blur-sm h-8 flex items-center justify-center">
        <span className="text-sm text-gray-300 font-medium">Page {pageNumber}</span>
      </div>
    </button>
  );
}