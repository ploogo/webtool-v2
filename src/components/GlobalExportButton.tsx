import React, { useState } from 'react';
import { Download } from 'lucide-react';
import {
  generateGlobalTailwindConfig,
  generateGlobalCSSVariables,
  generateGlobalSassVariables,
  generateGlobalJSON,
} from '../lib/colorExport';

interface GlobalExportButtonProps {
  palettes: {
    [key: string]: {
      baseColor: string;
      shades: { hex: string; hsl: string }[];
    };
  };
  supporting: {
    [key: string]: {
      baseColor: string;
      shades: { hex: string; hsl: string }[];
    };
  };
}

export default function GlobalExportButton({ palettes, supporting }: GlobalExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const colorData = {
    palettes,
    supporting,
  };

  const formats = [
    {
      name: 'Tailwind CSS',
      extension: 'js',
      generate: () => generateGlobalTailwindConfig(colorData),
    },
    {
      name: 'CSS Variables',
      extension: 'css',
      generate: () => generateGlobalCSSVariables(colorData),
    },
    {
      name: 'SASS Variables',
      extension: 'scss',
      generate: () => generateGlobalSassVariables(colorData),
    },
    {
      name: 'JSON',
      extension: 'json',
      generate: () => generateGlobalJSON(colorData),
    },
  ];

  const downloadFile = (content: string, extension: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `color-palette.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <Download className="w-4 h-4" aria-hidden="true" />
        Export All Palettes
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-48 bg-jet-800 rounded-lg shadow-lg z-20 py-2 border border-jet-700" role="menu">
            {formats.map((format) => (
              <button
                key={format.extension}
                onClick={() => {
                  downloadFile(format.generate(), format.extension);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-jet-300 hover:bg-jet-700 hover:text-white transition-colors"
                role="menuitem"
              >
                Export as {format.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}