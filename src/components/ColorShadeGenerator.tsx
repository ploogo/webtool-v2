import { useState, useCallback, useMemo } from 'react';
import { generateShades, toShade } from '../lib/colorUtils';
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

  // Scoped to one palette: a bare index lit up the same swatch in every palette.
  const [copied, setCopied] = useState<{ paletteId: string; index: number } | null>(null);

  const supportingKeys = (Object.keys(supportingColors) as Array<keyof SupportingColors>)
    .filter((key): key is keyof Omit<SupportingColors, 'shades'> => key !== 'shades');

  // Prepare export data
  const exportData = useMemo(() => {
    const palettes = mainPalettes.reduce((acc, palette) => {
      // Custom palettes can share a name; fall back to a suffix so they do not
      // overwrite one another in the export.
      let key = palette.name;
      let suffix = 2;
      while (key in acc) key = `${palette.name}-${suffix++}`;

      return {
        ...acc,
        [key]: {
          baseColor: palette.color,
          shades: palette.shades,
        },
      };
    }, {} as Record<string, { baseColor: string; shades: { hex: string; hsl: string }[] }>);

    const supporting = Object.keys(supportingColors).reduce((acc, key) => {
      if (key === 'shades') return acc;
      return {
        ...acc,
        [key]: {
          baseColor: supportingColors[key as keyof Omit<SupportingColors, 'shades'>],
          shades: supportingColors.shades[key],
        },
      };
    }, {});

    return { palettes, supporting };
  }, [mainPalettes, supportingColors]);

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
                idx === shadeIndex ? toShade(newColor) : shade
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
          idx === shadeIndex ? toShade(newColor) : shade
        ),
      },
    }));
  }, []);

  const copyToClipboard = useCallback((paletteId: string, text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopied({ paletteId, index });
    setTimeout(() => setCopied(null), 1500);
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

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Color Palette Generator</h1>
        <GlobalExportButton palettes={exportData.palettes} supporting={exportData.supporting} />
      </div>

      {/* Color Palettes */}
      <div className="space-y-6">
        {mainPalettes.map((palette) => (
          <div key={palette.id} className="bg-jet-900/50 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-jet-800/50">
            <ColorPaletteSection
              title={palette.name}
              description={palette.description}
              baseColor={palette.color}
              shades={palette.shades}
              onColorChange={(color) => handleColorChange(palette.id, color)}
              onShadeChange={(index, color) => handleShadeChange(palette.id, index, color)}
              onCopy={(text, index) => copyToClipboard(palette.id, text, index)}
              copiedIndex={copied?.paletteId === palette.id ? copied.index : null}
              onRemove={mainPalettes.length > 1 ? () => removePalette(palette.id) : undefined}
            />
          </div>
        ))}

        <button
          onClick={addPalette}
          className="w-full py-4 border-2 border-dashed border-jet-700 rounded-xl
            text-jet-300 hover:text-white hover:border-jet-600 hover:bg-jet-800/50
            transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" aria-hidden="true" />
          Add Custom Palette
        </button>
      </div>

      {/* Supporting Colors */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Supporting Colors</h2>
          <p className="mt-2 text-jet-300">
            Use these colors sparingly to communicate specific meanings or states in your interface.
          </p>
        </div>
        
        <div className="space-y-6">
          {supportingKeys.map(key => (
              <div key={key} className="bg-jet-900/50 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-jet-800/50">
                <ColorPaletteSection
                  title={key.charAt(0).toUpperCase() + key.slice(1)}
                  description={getDescription(key)}
                  baseColor={supportingColors[key]}
                  shades={supportingColors.shades[key]}
                  onColorChange={(color) => handleSupportingColorChange(key, color)}
                  onShadeChange={(index, color) => handleSupportingShadeChange(key, index, color)}
                  onCopy={(text, index) => copyToClipboard(key, text, index)}
                  copiedIndex={copied?.paletteId === key ? copied.index : null}
                />
              </div>
          ))}
        </div>
      </div>

      {/* Live Preview */}
      <div className="bg-jet-900/50 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-jet-800/50">
        <h2 className="text-lg font-semibold text-white mb-6">Live Preview</h2>
        <ColorPreview colors={previewColors} />
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