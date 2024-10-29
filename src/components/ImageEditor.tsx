import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import FileUploader from './FileUploader';
import { Download, Loader2, RefreshCw, Maximize2, MinusSquare, Lock, Unlock } from 'lucide-react';

interface ImageDimensions {
  width: number;
  height: number;
}

const IMAGE_FORMATS = [
  { value: 'image/jpeg', label: 'JPEG', ext: 'jpg', quality: 0.9 },
  { value: 'image/png', label: 'PNG', ext: 'png' },
  { value: 'image/webp', label: 'WebP', ext: 'webp', quality: 0.9 },
  { value: 'image/avif', label: 'AVIF', ext: 'avif', quality: 0.9 },
];

const PRESET_SIZES = [
  { width: 1200, height: 630, label: 'Social Media (1200×630)' },
  { width: 1080, height: 1080, label: 'Instagram Square (1080×1080)' },
  { width: 1080, height: 1350, label: 'Instagram Portrait (1080×1350)' },
  { width: 1280, height: 720, label: 'HD Video (1280×720)' },
  { width: 1920, height: 1080, label: 'Full HD (1920×1080)' },
];

const ASPECT_RATIOS = [
  { value: 1 / 1, label: '1:1 Square' },
  { value: 16 / 9, label: '16:9 Landscape' },
  { value: 9 / 16, label: '9:16 Portrait' },
  { value: 4 / 3, label: '4:3 Standard' },
  { value: 3 / 2, label: '3:2 Classic' },
  { value: 21 / 9, label: '21:9 Ultrawide' },
  { value: 5 / 4, label: '5:4 Large Format' },
];

export default function ImageEditor() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [selectedFormat, setSelectedFormat] = useState(IMAGE_FORMATS[0]);
  const [customSize, setCustomSize] = useState<ImageDimensions>({ width: 800, height: 600 });
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [originalDimensions, setOriginalDimensions] = useState<ImageDimensions>({ width: 0, height: 0 });
  
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const onSelectFile = useCallback((file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl('');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setPreviewUrl(reader.result as string);
      setCrop(undefined);
      setCompletedCrop(undefined);
      setSelectedAspectRatio(null);
    });
    reader.readAsDataURL(file);
  }, []);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setOriginalDimensions({ width, height });
    
    const aspect = maintainAspectRatio ? customSize.width / customSize.height : undefined;
    const crop = {
      unit: 'px',
      width: Math.min(width, height * (customSize.width / customSize.height)),
      height: Math.min(height, width * (customSize.height / customSize.width)),
      x: 0,
      y: 0,
    };
    
    crop.x = (width - crop.width) / 2;
    crop.y = (height - crop.height) / 2;
    
    setCrop(crop);
  }, [customSize.width, customSize.height, maintainAspectRatio]);

  const generateDownload = useCallback(async () => {
    if (!imgRef.current || !completedCrop) return;

    setLoading(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No 2d context');

      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

      canvas.width = customSize.width;
      canvas.height = customSize.height;

      ctx.imageSmoothingQuality = 'high';

      const sourceX = completedCrop.x * scaleX;
      const sourceY = completedCrop.y * scaleY;
      const sourceWidth = completedCrop.width * scaleX;
      const sourceHeight = completedCrop.height * scaleY;

      ctx.drawImage(
        imgRef.current,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        customSize.width,
        customSize.height
      );

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (blob) => resolve(blob!),
          selectedFormat.value,
          selectedFormat.quality
        );
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = selectedFile?.name.replace(/\.[^/.]+$/, '') || 'image';
      link.href = url;
      link.download = `${filename}-edited.${selectedFormat.ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating image:', err);
    } finally {
      setLoading(false);
    }
  }, [imgRef, completedCrop, customSize, selectedFormat, selectedFile]);

  const handlePresetSelect = useCallback((preset: typeof PRESET_SIZES[0]) => {
    setCustomSize({ width: preset.width, height: preset.height });
    if (maintainAspectRatio && imgRef.current) {
      const aspect = preset.width / preset.height;
      const img = imgRef.current;
      const imgAspect = img.width / img.height;
      
      let width = img.width;
      let height = img.height;
      
      if (imgAspect > aspect) {
        width = height * aspect;
      } else {
        height = width / aspect;
      }
      
      setCrop({
        unit: 'px',
        width,
        height,
        x: (img.width - width) / 2,
        y: (img.height - height) / 2,
      });
    }
  }, [maintainAspectRatio]);

  const handleAspectRatioSelect = useCallback((ratio: number) => {
    setSelectedAspectRatio(ratio);
    setMaintainAspectRatio(true);
    
    if (imgRef.current) {
      const img = imgRef.current;
      const imgAspect = img.width / img.height;
      
      let width = img.width;
      let height = img.height;
      
      if (imgAspect > ratio) {
        width = height * ratio;
      } else {
        height = width / ratio;
      }
      
      setCrop({
        unit: 'px',
        width,
        height,
        x: (img.width - width) / 2,
        y: (img.height - height) / 2,
      });

      // Update custom size to match aspect ratio
      const newWidth = Math.round(customSize.height * ratio);
      setCustomSize(prev => ({
        width: newWidth,
        height: prev.height
      }));
    }
  }, [customSize.height]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Image Area */}
        <div className="lg:col-span-2 space-y-4">
          <FileUploader
            onFileSelect={onSelectFile}
            currentFileName={selectedFile?.name || null}
          />

          {previewUrl && (
            <div className="relative bg-white rounded-lg shadow-lg p-4 overflow-hidden">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={selectedAspectRatio || (maintainAspectRatio ? customSize.width / customSize.height : undefined)}
                className="max-h-[600px]"
              >
                <img
                  ref={imgRef}
                  alt="Upload"
                  src={previewUrl}
                  className="max-w-full max-h-[600px] mx-auto"
                  onLoad={onImageLoad}
                />
              </ReactCrop>
              
              {originalDimensions.width > 0 && (
                <div className="absolute bottom-4 left-4 bg-black/75 text-white px-3 py-1.5 rounded-md text-sm">
                  {originalDimensions.width} × {originalDimensions.height}px
                </div>
              )}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-6">
          {/* Aspect Ratio Selection */}
          <div className="bg-white rounded-lg shadow p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Aspect Ratio</h3>
              <button
                onClick={() => {
                  setMaintainAspectRatio(!maintainAspectRatio);
                  setSelectedAspectRatio(null);
                }}
                className={`p-2 rounded-md transition-colors ${
                  maintainAspectRatio
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={maintainAspectRatio ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
              >
                {maintainAspectRatio ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {ASPECT_RATIOS.map((ratio) => (
                <button
                  key={ratio.value}
                  onClick={() => handleAspectRatioSelect(ratio.value)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedAspectRatio === ratio.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {ratio.label}
                </button>
              ))}
            </div>
          </div>

          {/* Format Selection */}
          <div className="bg-white rounded-lg shadow p-4 space-y-4">
            <h3 className="font-medium text-gray-900">Export Format</h3>
            <div className="grid grid-cols-2 gap-2">
              {IMAGE_FORMATS.map((format) => (
                <button
                  key={format.value}
                  onClick={() => setSelectedFormat(format)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedFormat.value === format.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {format.label}
                </button>
              ))}
            </div>
          </div>

          {/* Size Controls */}
          <div className="bg-white rounded-lg shadow p-4 space-y-4">
            <h3 className="font-medium text-gray-900">Output Size</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
                <input
                  type="number"
                  value={customSize.width}
                  onChange={(e) => {
                    const width = parseInt(e.target.value) || 0;
                    setCustomSize(prev => ({
                      width,
                      height: maintainAspectRatio
                        ? Math.round(width / (prev.width / prev.height))
                        : prev.height
                    }));
                  }}
                  className="w-full rounded-md border-gray-300"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                <input
                  type="number"
                  value={customSize.height}
                  onChange={(e) => {
                    const height = parseInt(e.target.value) || 0;
                    setCustomSize(prev => ({
                      height,
                      width: maintainAspectRatio
                        ? Math.round(height * (prev.width / prev.height))
                        : prev.width
                    }));
                  }}
                  className="w-full rounded-md border-gray-300"
                  min="1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Preset Sizes</h4>
              <div className="space-y-2">
                {PRESET_SIZES.map((preset) => (
                  <button
                    key={`${preset.width}x${preset.height}`}
                    onClick={() => handlePresetSelect(preset)}
                    className="w-full px-3 py-2 text-left text-sm rounded-md hover:bg-gray-100"
                  >
                    {preset.label}
                    <span className="text-gray-500 ml-1">
                      ({preset.width}×{preset.height})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={generateDownload}
            disabled={!completedCrop || loading}
            className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2
              ${!completedCrop || loading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export Image
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
