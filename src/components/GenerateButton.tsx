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
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-busy={loading}
      className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-neon-500 focus:ring-offset-2 focus:ring-offset-jet-950
        ${disabled
          ? 'bg-jet-700 text-gray-500 cursor-not-allowed'
          : 'bg-neon-500 text-jet-900 hover:bg-neon-600'
        }`}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
      {loading ? 'Generating...' : 'Generate Thumbnails'}
    </button>
  );
}