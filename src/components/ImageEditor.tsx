import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import FileUploader from './FileUploader';
import { Download, Loader2, Lock, Unlock } from 'lucide-react';

interface ImageDimensions {
  width: number;
  height: number;
}

const ASPECT_RATIOS = [
  { value: 1 / 1, label: '1:1 Square', description: 'Perfect for profile pictures and thumbnails' },
  { value: 16 / 9, label: '16:9 Landscape', description: 'Standard widescreen format for videos and presentations' },
  { value: 9 / 16, label: '9:16 Portrait', description: 'Ideal for mobile content and stories' },
  { value: 4 / 3, label: '4:3 Standard', description: 'Classic photo and display format' },
  { value: 3 / 2, label: '3:2 Classic', description: 'Traditional DSLR camera format' },
  { value: 21 / 9, label: '21:9 Ultrawide', description: 'Cinematic widescreen format' },
];

const OUTPUT_FORMATS = [
  { value: 'jpeg', label: 'JPEG', description: 'Best for photographs and complex images' },
  { value: 'png', label: 'PNG', description: 'Best for graphics with transparency' },
  { value: 'webp', label: 'WebP', description: 'Modern format with excellent compression' },
  { value: 'avif', label: 'AVIF', description: 'Next-gen format with superior compression' },
];

const PRESET_SIZES = [
  { width: 1200, height: 630, label: 'Social Media', description: 'Optimal size for social media sharing' },
  { width: 1080, height: 1080, label: 'Instagram Square', description: 'Perfect for Instagram feed posts' },
  { width: 1080, height: 1350, label: 'Instagram Portrait', description: 'Maximizes Instagram feed real estate' },
  { width: 1280, height: 720, label: 'HD Video', description: 'Standard HD video resolution' },
  { width: 1920, height: 1080, label: 'Full HD', description: 'Full HD resolution for high-quality displays' },
];

export default function ImageEditor() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [selectedFormat, setSelectedFormat] = useState(OUTPUT_FORMATS[0]);
  const [customSize, setCustomSize] = useState<ImageDimensions>({ width: 800, height: 600 });
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [originalDimensions, setOriginalDimensions] = useState<ImageDimensions>({ width: 0, height: 0 });
  
  const imgRef = useRef<HTMLImageElement>(null);

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

      const newWidth = Math.round(customSize.height * ratio);
      setCustomSize(prev => ({
        width: newWidth,
        height: prev.height
      }));
    }
  }, [customSize.height]);

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

  return (
    <div className="w-full max-w-[100vw] overflow-hidden">
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        {/* Upload Area */}
        <FileUploader
          onFileSelect={onSelectFile}
          currentFileName={selectedFile?.name || null}
        />

        {/* Preview and Controls */}
        {previewUrl && (
          <div className="space-y-8">
            {/* Image Preview */}
            <div className="relative bg-jet-800 rounded-lg shadow-lg p-4 overflow-hidden">
              <div className="max-w-full overflow-auto">
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
              </div>
              
              {originalDimensions.width > 0 && (
                <div className="absolute bottom-4 left-4 bg-jet-900/75 text-white px-3 py-1.5 rounded-md text-sm">
                  {originalDimensions.width} × {originalDimensions.height}px
                </div>
              )}
            </div>

            {/* Controls Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Aspect Ratio */}
              <div className="card space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-white">Aspect Ratio</h3>
                  <button
                    onClick={() => {
                      setMaintainAspectRatio(!maintainAspectRatio);
                      setSelectedAspectRatio(null);
                    }}
                    className={`btn-icon ${
                      maintainAspectRatio
                        ? 'btn-icon-primary'
                        : 'btn-icon-ghost'
                    }`}
                    title={maintainAspectRatio ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
                  >
                    {maintainAspectRatio ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      <Unlock className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {ASPECT_RATIOS.map((ratio) => (
                    <button
                      key={ratio.value}
                      onClick={() => handleAspectRatioSelect(ratio.value)}
                      className={`group relative px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedAspectRatio === ratio.value
                          ? 'bg-neon-500 text-jet-900'
                          : 'bg-jet-800 text-jet-300 hover:bg-jet-700'
                      }`}
                    >
                      {ratio.label}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-jet-900 text-jet-300 text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10">
                        {ratio.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Export Format */}
              <div className="card space-y-4">
                <h3 className="font-medium text-white">Export Format</h3>
                <div className="grid grid-cols-2 gap-2">
                  {OUTPUT_FORMATS.map((format) => (
                    <button
                      key={format.value}
                      onClick={() => setSelectedFormat(format)}
                      className={`group relative px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedFormat.value === format.value
                          ? 'bg-neon-500 text-jet-900'
                          : 'bg-jet-800 text-jet-300 hover:bg-jet-700'
                      }`}
                    >
                      {format.label}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-jet-900 text-jet-300 text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10">
                        {format.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Output Size */}
              <div className="card space-y-4">
                <h3 className="font-medium text-white">Output Size</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-jet-300 mb-1">Width</label>
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
                      className="input"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-jet-300 mb-1">Height</label>
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
                      className="input"
                      min="1"
                    />
                  </div>
                </div>
              </div>

              {/* Preset Sizes */}
              <div className="card space-y-4 xl:col-span-2">
                <h3 className="font-medium text-white">Preset Sizes</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PRESET_SIZES.map((preset) => (
                    <button
                      key={`${preset.width}x${preset.height}`}
                      onClick={() => handlePresetSelect(preset)}
                      className="group relative px-3 py-2 text-left text-sm rounded-md hover:bg-jet-800 transition-colors"
                    >
                      <span className="text-white">{preset.label}</span>
                      <span className="block text-jet-400 text-xs">
                        {preset.width}×{preset.height}
                      </span>
                      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-48 p-2 bg-jet-900 text-jet-300 text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10">
                        {preset.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Export Button */}
              <div className="card xl:col-span-1">
                <button
                  onClick={generateDownload}
                  disabled={!completedCrop || loading}
                  className="w-full btn-primary h-full min-h-[120px] flex-col"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin mb-2" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-6 h-6 mb-2" />
                      <span>Export Image</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
