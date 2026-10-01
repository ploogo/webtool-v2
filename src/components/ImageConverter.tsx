import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Download, Loader2, Pipette } from 'lucide-react';
import FileUploader, { UploadKind } from './FileUploader';
import {
  RGB,
  RemovalMode,
  isSVGFile,
  prepareSVG,
  rasterizeSVG,
  rasterizeImageFile,
  detectBackgroundColor,
  removeBackground,
  imageDataToPNG,
  pixelAt,
  rgbToHex,
  hexToRgb,
} from '../lib/imageConversion';

const IMAGES_ONLY: UploadKind[] = ['image'];

const SCALE_OPTIONS = [1, 2, 4] as const;
type ScaleChoice = typeof SCALE_OPTIONS[number] | 'custom';

const REMOVAL_MODES: { value: RemovalMode; label: string; description: string }[] = [
  { value: 'edges', label: 'Edges only', description: 'Removes background connected to the image border. Matching colors inside the artwork stay.' },
  { value: 'all', label: 'All matches', description: 'Removes every pixel of the color, including holes inside letters and shapes.' },
];

const CHECKERBOARD: React.CSSProperties = {
  backgroundColor: '#ffffff',
  backgroundImage: 'conic-gradient(#d4d4d8 25%, transparent 0 50%, #d4d4d8 0 75%, transparent 0)',
  backgroundSize: '20px 20px',
};

const DEFAULT_KEY_COLOR: RGB = { r: 255, g: 255, b: 255 };

interface BaseRender {
  imageData: ImageData;
  clamped: boolean;
  removedSvgBackground: boolean;
}

interface Output {
  url: string;
  size: number;
  width: number;
  height: number;
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} Bytes`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export default function ImageConverter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [svgSource, setSvgSource] = useState<string | null>(null);
  const [svgSize, setSvgSize] = useState<{ width: number; height: number } | null>(null);

  const [scaleChoice, setScaleChoice] = useState<ScaleChoice>(2);
  const [customWidth, setCustomWidth] = useState(1024);
  const [stripSvgBackground, setStripSvgBackground] = useState(true);

  const [keyEnabled, setKeyEnabled] = useState(false);
  const [keyColor, setKeyColor] = useState<RGB>(DEFAULT_KEY_COLOR);
  const [tolerance, setTolerance] = useState(10);
  const [feather, setFeather] = useState(8);
  const [mode, setMode] = useState<RemovalMode>('edges');

  const [base, setBase] = useState<BaseRender | null>(null);
  const [output, setOutput] = useState<Output | null>(null);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-detect the key color once per file, never over a color the user picked.
  const keyColorTouched = useRef(false);

  const isSVG = svgSource !== null;

  const handleFileSelect = useCallback(async (file: File | null) => {
    setSelectedFile(file);
    setSvgSource(null);
    setSvgSize(null);
    setBase(null);
    setOutput(null);
    setError(null);
    keyColorTouched.current = false;
    if (!file || !isSVGFile(file)) return;

    try {
      const source = await file.text();
      const { width, height } = prepareSVG(source, 1, false);
      setSvgSource(source);
      setSvgSize({ width, height });
      setCustomWidth(Math.round(width * 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read this SVG.');
    }
  }, []);

  const scale = isSVG && svgSize
    ? scaleChoice === 'custom'
      ? Math.max(1, customWidth) / svgSize.width
      : scaleChoice
    : 1;

  // Rasterize the source whenever it or its render settings change.
  useEffect(() => {
    if (!selectedFile) return;
    if (isSVGFile(selectedFile) && svgSource === null) return;

    let cancelled = false;
    setRendering(true);
    setError(null);

    (async () => {
      try {
        let render: BaseRender;
        if (svgSource !== null) {
          const prepared = prepareSVG(svgSource, scale, stripSvgBackground);
          const raster = await rasterizeSVG(prepared);
          render = { ...raster, removedSvgBackground: prepared.removedBackground };
        } else {
          render = { ...(await rasterizeImageFile(selectedFile)), removedSvgBackground: false };
        }
        if (cancelled) return;
        if (!keyColorTouched.current) {
          setKeyColor(detectBackgroundColor(render.imageData) ?? DEFAULT_KEY_COLOR);
        }
        setBase(render);
      } catch (err) {
        if (cancelled) return;
        console.error('Error rendering image:', err);
        setError(err instanceof Error ? err.message : 'Failed to render this image.');
        setBase(null);
        setOutput(null);
        setRendering(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedFile, svgSource, scale, stripSvgBackground]);

  // Apply background removal and encode. Debounced so dragging a slider
  // doesn't queue a full-image pass per tick.
  useEffect(() => {
    if (!base) return;
    let cancelled = false;
    setRendering(true);

    const timer = setTimeout(async () => {
      try {
        const data = keyEnabled
          ? removeBackground(base.imageData, {
              color: keyColor,
              tolerance: tolerance / 100,
              feather: feather / 100,
              mode,
            })
          : base.imageData;
        const blob = await imageDataToPNG(data);
        if (cancelled) return;
        setOutput({ url: URL.createObjectURL(blob), size: blob.size, width: data.width, height: data.height });
      } catch (err) {
        if (cancelled) return;
        console.error('Error converting image:', err);
        setError('Failed to convert this image.');
      } finally {
        if (!cancelled) setRendering(false);
      }
    }, 120);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [base, keyEnabled, keyColor, tolerance, feather, mode]);

  useEffect(() => {
    if (!output) return;
    return () => URL.revokeObjectURL(output.url);
  }, [output]);

  const pickColor = (event: React.MouseEvent<HTMLImageElement>) => {
    if (!keyEnabled || !base) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const { width, height } = base.imageData;
    const x = Math.min(width - 1, Math.max(0, Math.floor(((event.clientX - rect.left) / rect.width) * width)));
    const y = Math.min(height - 1, Math.max(0, Math.floor(((event.clientY - rect.top) / rect.height) * height)));
    const p = pixelAt(base.imageData, x, y);
    if (p.a === 0) return;
    keyColorTouched.current = true;
    setKeyColor({ r: p.r, g: p.g, b: p.b });
  };

  const download = () => {
    if (!output || !selectedFile) return;
    const name = selectedFile.name.replace(/\.[^/.]+$/, '');
    const suffix = isSVG && scaleChoice !== 'custom' && scaleChoice !== 1 ? `@${scaleChoice}x` : '';
    const link = document.createElement('a');
    link.href = output.url;
    link.download = `${name}${suffix}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const buttonClass = (active: boolean) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      active ? 'bg-neon-500 text-jet-900' : 'bg-jet-700 text-jet-300 hover:bg-jet-600 hover:text-white'
    }`;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-8">
        {/* Settings */}
        <div className="space-y-6">
          <FileUploader
            onFileSelect={handleFileSelect}
            currentFileName={selectedFile?.name || null}
            accept={IMAGES_ONLY}
          />

          {selectedFile && isSVG && svgSize && (
            <div className="card space-y-4">
              <div>
                <h3 className="font-medium text-white">SVG to PNG</h3>
                <p className="text-sm text-jet-400 mt-1">
                  Source size {Math.round(svgSize.width)} × {Math.round(svgSize.height)} px
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-jet-300">Scale</label>
                <div className="grid grid-cols-4 gap-2">
                  {SCALE_OPTIONS.map(option => (
                    <button
                      key={option}
                      onClick={() => setScaleChoice(option)}
                      className={buttonClass(scaleChoice === option)}
                    >
                      {option}x
                    </button>
                  ))}
                  <button
                    onClick={() => setScaleChoice('custom')}
                    className={buttonClass(scaleChoice === 'custom')}
                  >
                    Custom
                  </button>
                </div>
                {scaleChoice === 'custom' && (
                  <div className="pt-2">
                    <label className="block text-sm font-medium text-jet-300 mb-1">Width (px)</label>
                    <input
                      type="number"
                      min={1}
                      max={8192}
                      value={customWidth}
                      onChange={e => setCustomWidth(Number(e.target.value))}
                      className="input"
                    />
                  </div>
                )}
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={stripSvgBackground}
                  onChange={e => setStripSvgBackground(e.target.checked)}
                  className="mt-1 rounded border-jet-600 bg-jet-700 text-neon-500 focus:ring-neon-500"
                />
                <span>
                  <span className="block text-sm font-medium text-white">Strip SVG background</span>
                  <span className="block text-xs text-jet-400">
                    Removes a full-size background rectangle or fill before rendering.
                    {base && stripSvgBackground && (
                      base.removedSvgBackground
                        ? <span className="text-neon-400"> Background removed.</span>
                        : <span> None found in this file.</span>
                    )}
                  </span>
                </span>
              </label>
            </div>
          )}

          {selectedFile && (
            <div className="card space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={keyEnabled}
                  onChange={e => setKeyEnabled(e.target.checked)}
                  className="mt-1 rounded border-jet-600 bg-jet-700 text-neon-500 focus:ring-neon-500"
                />
                <span>
                  <span className="block text-sm font-medium text-white">Remove background color</span>
                  <span className="block text-xs text-jet-400">
                    Makes a solid background transparent. Works on any image.
                  </span>
                </span>
              </label>

              {keyEnabled && (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-jet-300">Background color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={rgbToHex(keyColor)}
                        onChange={e => {
                          keyColorTouched.current = true;
                          setKeyColor(hexToRgb(e.target.value));
                        }}
                        className="h-10 w-14 rounded border border-jet-600 bg-jet-700 cursor-pointer"
                      />
                      <span className="font-mono text-sm text-jet-300">{rgbToHex(keyColor)}</span>
                    </div>
                    <p className="flex items-center gap-1 text-xs text-jet-400">
                      <Pipette className="w-3 h-3" aria-hidden="true" />
                      Or click the preview to pick a color.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-jet-300">Mode</label>
                    <div className="grid grid-cols-2 gap-2">
                      {REMOVAL_MODES.map(m => (
                        <button
                          key={m.value}
                          onClick={() => setMode(m.value)}
                          className={`group relative ${buttonClass(mode === m.value)}`}
                        >
                          {m.label}
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-2 bg-jet-900 text-jet-300 text-xs font-normal rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10">
                            {m.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-jet-300">Tolerance</label>
                      <span className="text-sm text-jet-400">{tolerance}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      value={tolerance}
                      onChange={e => setTolerance(Number(e.target.value))}
                      className="w-full accent-neon-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-jet-300">Edge smoothing</label>
                      <span className="text-sm text-jet-400">{feather}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={feather}
                      onChange={e => setFeather(Number(e.target.value))}
                      className="w-full accent-neon-500"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Preview */}
        {selectedFile && (
          <div className="card space-y-4 self-start">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-medium text-white">PNG Output</h3>
                {output && (
                  <p className="text-sm text-jet-400 mt-1">
                    {output.width} × {output.height} px · {formatFileSize(output.size)}
                  </p>
                )}
              </div>
              <button
                onClick={download}
                disabled={!output || rendering}
                className="btn-primary"
              >
                {rendering ? (
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Download className="w-4 h-4" aria-hidden="true" />
                )}
                Download PNG
              </button>
            </div>

            {base?.clamped && (
              <p className="text-xs text-amber-400">
                Reduced to fit the browser's maximum canvas size.
              </p>
            )}

            <div className="rounded-lg overflow-hidden p-4 flex items-center justify-center min-h-[300px]" style={CHECKERBOARD}>
              {output ? (
                <img
                  src={output.url}
                  alt={`PNG output of ${selectedFile.name}`}
                  onClick={pickColor}
                  className={`max-w-full max-h-[600px] object-contain ${keyEnabled ? 'cursor-crosshair' : ''}`}
                />
              ) : (
                <Loader2 className="w-8 h-8 animate-spin text-jet-500" aria-hidden="true" />
              )}
            </div>

            {isSVG && (
              <p className="text-xs text-jet-500">
                Linked images and web fonts inside an SVG can't load when it's rendered as an image. Embed or outline them first.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
