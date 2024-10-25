import React, { useState, useCallback } from 'react';
import { generateShades } from '../lib/colorUtils';
import ColorPaletteSection from './ColorPaletteSection';
import ColorPreview from './ColorPreview';
import GlobalExportButton from './GlobalExportButton';
import { Plus } from 'lucide-react';

interface ColorPalette {
  id: string;
  name: string;
  color: string;
  type: 'primary' | 'secondary' | 'neutral' | 'supporting';
  description: string;
  shades: { hex: string; hsl: string }[];
}

interface SupportingColors {
  success: string;
  warning: string;
  error: string;
  info: string;
  shades: {
    [key: string]: { hex: string; hsl: string }[];
  };
}

export default function ColorShadeGenerator() {
  const [mainPalettes, setMainPalettes] = useState<ColorPalette[]>([
    {
      id: 'primary',
      name: 'Primary',
      color: '#3B82F6',
      type: 'primary',
      description: 'Your main brand color. Use it for primary actions, key navigation elements, and important highlights.',
      shades: generateShades('#3B82F6'),
    },
    {
      id: 'secondary',
      name: 'Secondary',
      color: '#10B981',
      type: 'secondary',
      description: 'Complements your primary color. Use it for secondary actions, less prominent UI elements, and accents.',
      shades: generateShades('#10B981'),
    },
    {
      id: 'neutral',
      name: 'Neutral',
      color: '#64748B',
      type: 'neutral',
      description: 'These colors form the foundation of your UI. Use them for text, backgrounds, borders, and subtle elements.',
      shades: generateShades('#64748B'),
    },
  ]);

  const [supportingColors, setSupportingColors] = useState<SupportingColors>({
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#06B6D4',
    shades: {
      success: generateShades('#22C55E'),
      warning: generateShades('#F59E0B'),
      error: generateShades('#EF4444'),
      info: generateShades('#06B6D4'),
    },
  });

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleColorChange = useCallback((id: string, newColor: string) => {
    setMainPalettes(prev => 
      prev.map(palette => 
        palette.id === id 
          ? { ...palette, color: newColor, shades: generateShades(newColor) }
          : palette
      )
    );
  }, []);

  const handleShadeChange = useCallback((paletteId: string, shadeIndex: number, newColor: string) => {
    setMainPalettes(prev =>
      prev.map(palette =>
        palette.id === paletteId
          ? {
              ...palette,
              shades: palette.shades.map((shade, idx) =>
                idx === shadeIndex
                  ? { ...shade, hex: newColor }
                  : shade
              ),
            }
          : palette
      )
    );
  }, []);

  const handleSupportingColorChange = useCallback((key: keyof Omit<SupportingColors, 'shades'>, newColor: string) => {
    setSupportingColors(prev => ({
      ...prev,
      [key]: newColor,
      shades: {
        ...prev.shades,
        [key]: generateShades(newColor),
      },
    }));
  }, []);

  const handleSupportingShadeChange = useCallback((key: keyof Omit<SupportingColors, 'shades'>, shadeIndex: number, newColor: string) => {
    setSupportingColors(prev => ({
      ...prev,
      shades: {
        ...prev.shades,
        [key]: prev.shades[key].map((shade, idx) =>
          idx === shadeIndex
            ? { ...shade, hex: newColor }
            : shade
        ),
      },
    }));
  }, []);

  const copyToClipboard = useCallback((text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  }, []);

  const removePalette = useCallback((id: string) => {
    setMainPalettes(prev => prev.filter(palette => palette.id !== id));
  }, []);

  const addPalette = useCallback(() => {
    const newPalette: ColorPalette = {
      id: `custom-${Date.now()}`,
      name: 'Custom',
      color: '#3B82F6',
      type: 'primary',
      description: 'Custom color palette for your specific needs.',
      shades: generateShades('#3B82F6'),
    };
    setMainPalettes(prev => [...prev, newPalette]);
  }, []);

  const previewColors = {
    primary: mainPalettes.find(p => p.type === 'primary')?.color || '#3B82F6',
    secondary: mainPalettes.find(p => p.type === 'secondary')?.color || '#10B981',
    neutral: mainPalettes.find(p => p.type === 'neutral')?.color || '#64748B',
    supporting: {
      success: supportingColors.success,
      warning: supportingColors.warning,
      error: supportingColors.error,
      info: supportingColors.info,
    },
  };

  // Prepare data for global export
  const exportPalettes = mainPalettes.reduce((acc, palette) => ({
    ...acc,
    [palette.name]: {
      baseColor: palette.color,
      shades: palette.shades,
    },
  }), {});

  const exportSupporting = Object.keys(supportingColors).reduce((acc, key) => {
    if (key === 'shades') return acc;
    return {
      ...acc,
      [key]: {
        baseColor: supportingColors[key as keyof Omit<SupportingColors, 'shades'>],
        shades: supportingColors.shades[key],
      },
    };
  }, {});

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-start">
        <h1 className="text-3xl font-bold text-gray-900">Color Palette Generator</h1>
        <GlobalExportButton palettes={exportPalettes} supporting={exportSupporting} />
      </div>

      <ColorPreview colors={previewColors} />

      <div className="space-y-12">
        {mainPalettes.map((palette) => (
          <div key={palette.id} className="relative">
            <ColorPaletteSection
              title={palette.name}
              description={palette.description}
              baseColor={palette.color}
              shades={palette.shades}
              onColorChange={(color) => handleColorChange(palette.id, color)}
              onShadeChange={(index, color) => handleShadeChange(palette.id, index, color)}
              onCopy={copyToClipboard}
              copiedIndex={copiedIndex}
              onRemove={mainPalettes.length > 1 ? () => removePalette(palette.id) : undefined}
            />
          </div>
        ))}

        <button
          onClick={addPalette}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg 
            text-gray-600 hover:text-gray-900 hover:border-gray-400 transition-colors
            flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Custom Palette
        </button>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Supporting Colors</h2>
          <p className="mt-2 text-gray-600 max-w-2xl">
            Use these colors sparingly to communicate specific meanings or states in your interface.
          </p>
        </div>
        
        <div className="space-y-12">
          {(Object.keys(supportingColors) as Array<keyof Omit<SupportingColors, 'shades'>>).map(key => {
            if (key === 'shades') return null;
            return (
              <ColorPaletteSection
                key={key}
                title={key.charAt(0).toUpperCase() + key.slice(1)}
                description={getDescription(key)}
                baseColor={supportingColors[key]}
                shades={supportingColors.shades[key]}
                onColorChange={(color) => handleSupportingColorChange(key, color)}
                onShadeChange={(index, color) => handleSupportingShadeChange(key, index, color)}
                onCopy={copyToClipboard}
                copiedIndex={copiedIndex}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function getDescription(key: string): string {
  switch (key) {
    case 'success':
      return 'Use for positive actions, successful operations, and confirmations.';
    case 'warning':
      return 'Use for cautionary messages, actions that need attention, or potential issues.';
    case 'error':
      return 'Use for error states, destructive actions, or critical issues that need immediate attention.';
    case 'info':
      return 'Use for informational messages, help text, or neutral notifications.';
    default:
      return '';
  }
}