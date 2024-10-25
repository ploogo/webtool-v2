import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { ColorShade } from '../lib/colorUtils';
import {
  generateTailwindConfig,
  generateCSSVariables,
  generateSassVariables,
  generateJSON,
} from '../lib/colorExport';

interface ExportOptionsProps {
  title: string;
  baseColor: string;
  shades: ColorShade[];
}

export default function ExportOptions({ title, baseColor, shades }: ExportOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const exportData = { baseColor, shades };

  const formats = [
    {
      name: 'Tailwind CSS',
      extension: 'js',
      generate: () => generateTailwindConfig(title, exportData),
    },
    {
      name: 'CSS Variables',
      extension: 'css',
      generate: () => generateCSSVariables(title, exportData),
    },
    {
      name: 'SASS Variables',
      extension: 'scss',
      generate: () => generateSassVariables(title, exportData),
    },
    {
      name: 'JSON',
      extension: 'json',
      generate: () => generateJSON(title, exportData),
    },
  ];

  const downloadFile = (content: string, extension: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase()}-colors.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 text-gray-600 text-sm"
        title="Export colors"
      >
        <Download className="w-4 h-4" />
        Export
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-20 py-2">
            {formats.map((format) => (
              <button
                key={format.extension}
                onClick={() => {
                  downloadFile(format.generate(), format.extension);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
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