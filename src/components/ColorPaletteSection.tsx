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
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          {description && (
            <p className="mt-2 text-jet-300 max-w-2xl">{description}</p>
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
              className="h-8 w-8 cursor-pointer rounded border border-jet-700"
              aria-label={`Change ${title.toLowerCase()} base color`}
            />
            <input
              type="text"
              value={baseColor}
              onChange={(e) => handleColorInputChange(e.target.value)}
              onFocus={() => setEditingBase(true)}
              onBlur={() => setEditingBase(false)}
              className={`w-20 px-1 py-0.5 text-sm font-mono border rounded text-white bg-jet-800 ${
                editingBase ? 'border-neon-500' : 'border-jet-700'
              }`}
              placeholder="#000000"
              aria-label={`${title} base color hex value`}
            />
          </div>
          {onRemove && (
            <button
              onClick={onRemove}
              className="p-2 hover:bg-red-900/20 text-red-400 rounded-lg transition-colors"
              aria-label={`Remove ${title} palette`}
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            className="relative group p-1 rounded hover:bg-jet-700/50"
            aria-label="Color palette help information"
          >
            <Info className="w-5 h-5 text-jet-400" aria-hidden="true" />
            <div className="absolute right-0 w-64 p-2 bg-jet-800 rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-focus:opacity-100 group-hover:pointer-events-auto group-focus:pointer-events-auto transition-opacity z-10" role="tooltip">
              <p className="text-sm text-jet-300">
                Click the color picker or enter a hex value to change colors. The base color will automatically generate a new palette.
              </p>
            </div>
          </button>
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
              <div className="absolute inset-0 bg-jet-900/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      <input
                        type="color"
                        value={shade.hex}
                        onChange={(e) => onShadeChange(index, e.target.value)}
                        className="h-6 w-6 cursor-pointer rounded flex-shrink-0"
                        aria-label={`Change shade ${index + 1} color`}
                      />
                      <input
                        type="text"
                        value={shade.hex}
                        onChange={(e) => handleColorInputChange(e.target.value, index)}
                        onFocus={() => setEditingIndex(index)}
                        onBlur={() => setEditingIndex(null)}
                        className={`w-[4.5rem] px-1 py-0.5 text-xs font-mono border rounded text-white bg-jet-800 ${
                          editingIndex === index ? 'border-neon-500' : 'border-jet-700'
                        }`}
                        aria-label={`Shade ${index + 1} hex value`}
                      />
                    </div>
                    <button
                      onClick={() => onCopy(shade.hex, index)}
                      className="p-1.5 hover:bg-jet-700 rounded-full transition-colors flex-shrink-0 text-white"
                      aria-label={`Copy hex code ${shade.hex}`}
                    >
                      <Copy className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                  <p className="font-mono text-xs text-jet-300 mt-1">{shade.hsl}</p>
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