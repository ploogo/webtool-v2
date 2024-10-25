import React from 'react';
import { Loader2 } from 'lucide-react';

interface GenerateButtonProps {
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
}

export default function GenerateButton({ onClick, disabled, loading }: GenerateButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2
        ${disabled 
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
          : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {loading ? 'Generating...' : 'Generate Thumbnails'}
    </button>
  );
}