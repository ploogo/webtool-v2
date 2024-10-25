import React, { useState } from 'react';
import { ColorShade } from '../lib/colorUtils';
import { Copy, Info, Trash2 } from 'lucide-react';
import ExportOptions from './ExportOptions';

interface ColorPaletteSectionProps {
  title: string;
  description?: string;
  baseColor: string;
  shades: ColorShade[];
  onColorChange: (color: string) => void;
  onShadeChange: (index: number, color: string) => void;
  onCopy: (text: string, index: number) => void;
  copiedIndex: number | null;
  onRemove?: () => void;
}

export default function ColorPaletteSection({
  title,
  description,
  baseColor,
  shades,
  onColorChange,
  onShadeChange,
  onCopy,
  copiedIndex,
  onRemove,
}: ColorPaletteSectionProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingBase, setEditingBase] = useState(false);

  const handleColorInputChange = (value: string, index?: number) => {
    // Validate hex color format
    const isValidHex = /^#[0-9A-Fa-f]{6}$/.test(value);
    if (!isValidHex) return;

    if (typeof index === 'number') {
      onShadeChange(index, value);
    } else {
      onColorChange(value);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {description && (
            <p className="mt-2 text-gray-600 max-w-2xl">{description}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <ExportOptions
            title={title}
            baseColor={baseColor}
            shades={shades}
          />
          <div className="flex items-center gap-1">
            <input
              type="color"
              value={baseColor}
              onChange={(e) => onColorChange(e.target.value)}
              className="h-8 w-8 cursor-pointer rounded border border-gray-200"
              title={`Change ${title.toLowerCase()} base color`}
            />
            <input
              type="text"
              value={baseColor}
              onChange={(e) => handleColorInputChange(e.target.value)}
              onFocus={() => setEditingBase(true)}
              onBlur={() => setEditingBase(false)}
              className={`w-20 px-1 py-0.5 text-sm font-mono border rounded ${
                editingBase ? 'border-blue-500' : 'border-gray-200'
              }`}
              placeholder="#000000"
            />
          </div>
          {onRemove && (
            <button
              onClick={onRemove}
              className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
              title="Remove palette"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <div className="relative group">
            <Info className="w-5 h-5 text-gray-400 cursor-help" />
            <div className="absolute right-0 w-64 p-2 bg-white rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-10">
              <p className="text-sm text-gray-600">
                Click the color picker or enter a hex value to change colors. The base color will automatically generate a new palette.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {shades.map((shade, index) => (
          <div
            key={shade.hex}
            className="relative group rounded-lg overflow-hidden shadow-md"
            style={{ backgroundColor: shade.hex }}
          >
            <div className="p-4 h-24">
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      <input
                        type="color"
                        value={shade.hex}
                        onChange={(e) => onShadeChange(index, e.target.value)}
                        className="h-6 w-6 cursor-pointer rounded flex-shrink-0"
                        title="Change shade color"
                      />
                      <input
                        type="text"
                        value={shade.hex}
                        onChange={(e) => handleColorInputChange(e.target.value, index)}
                        onFocus={() => setEditingIndex(index)}
                        onBlur={() => setEditingIndex(null)}
                        className={`w-[4.5rem] px-1 py-0.5 text-xs font-mono border rounded ${
                          editingIndex === index ? 'border-blue-500' : 'border-gray-200'
                        }`}
                      />
                    </div>
                    <button
                      onClick={() => onCopy(shade.hex, index)}
                      className="p-1.5 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                      title="Copy hex code"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="font-mono text-xs text-gray-600 mt-1">{shade.hsl}</p>
                </div>
              </div>
            </div>
            {copiedIndex === index && (
              <span className="absolute top-2 right-2 text-xs bg-black/75 text-white px-2 py-1 rounded">
                Copied!
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}