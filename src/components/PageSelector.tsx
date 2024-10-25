import React from 'react';

interface PageSelectorProps {
  numPages: number;
  selectedPages: Set<number>;
  onPageToggle: (pageNumber: number) => void;
}

export default function PageSelector({ numPages, selectedPages, onPageToggle }: PageSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Select Pages</h3>
      <div className="grid grid-cols-8 gap-2">
        {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => onPageToggle(pageNum)}
            className={`p-2 text-sm rounded-md transition-colors ${
              selectedPages.has(pageNum)
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {pageNum}
          </button>
        ))}
      </div>
    </div>
  );
}