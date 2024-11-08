import React, { useState, useCallback } from 'react';
import { Upload, Download, Image as ImageIcon, FileDown, Loader2, RefreshCw } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import FileUploader from './FileUploader';

interface CompressedImage {
  file: File;
  preview: string;
  originalSize: number;
  compressedSize: number;
}

const IMAGE_QUALITY_PRESETS = [
  { name: 'High', quality: 0.8, maxWidthOrHeight: 2048 },
  { name: 'Medium', quality: 0.6, maxWidthOrHeight: 1600 },
  { name: 'Low', quality: 0.4, maxWidthOrHeight: 1200 },
  { name: 'Custom', quality: 0.7, maxWidthOrHeight: 1920 },
] as const;

const OUTPUT_FORMATS = [
  { value: 'keep', label: 'Keep Original' },
  { value: 'jpeg', label: 'JPEG' },
  { value: 'webp', label: 'WebP' },
  { value: 'png', label: 'PNG' },
] as const;

export default function ImageCompressor() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [compressedImage, setCompressedImage] = useState<CompressedImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<typeof IMAGE_QUALITY_PRESETS[number]>(IMAGE_QUALITY_PRESETS[0]);
  const [customQuality, setCustomQuality] = useState(70);
  const [customMaxSize, setCustomMaxSize] = useState(1920);
  const [selectedFormat, setSelectedFormat] = useState<typeof OUTPUT_FORMATS[number]>(OUTPUT_FORMATS[0]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculateReduction = (original: number, compressed: number) => {
    const reduction = ((original - compressed) / original) * 100;
    return Math.round(reduction);
  };

  const handleFileSelect = useCallback((file: File | null) => {
    setSelectedFile(file);
    setCompressedImage(null);
    setError(null);
  }, []);

  const compressImage = useCallback(async () => {
    if (!selectedFile) return;

    try {
      setLoading(true);
      setError(null);

      const options = {
        maxSizeMB: 10,
        maxWidthOrHeight: selectedPreset.name === 'Custom' ? customMaxSize : selectedPreset.maxWidthOrHeight,
        useWebWorker: true,
        fileType: selectedFormat.value === 'keep' ? undefined : `image/${selectedFormat.value}`,
        quality: selectedPreset.name === 'Custom' ? customQuality / 100 : selectedPreset.quality,
      };

      const compressedFile = await imageCompression(selectedFile, options);
      const preview = await imageCompression.getDataUrlFromFile(compressedFile);

      setCompressedImage({
        file: compressedFile,
        preview,
        originalSize: selectedFile.size,
        compressedSize: compressedFile.size,
      });
    } catch (err) {
      console.error('Error compressing image:', err);
      setError('Failed to compress image. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedFile, selectedPreset, customQuality, customMaxSize, selectedFormat]);

  const downloadCompressedImage = useCallback(() => {
    if (!compressedImage) return;

    const link = document.createElement('a');
    link.href = compressedImage.preview;
    const extension = selectedFormat.value === 'keep' 
      ? selectedFile?.name.split('.').pop() 
      : selectedFormat.value;
    const filename = `compressed_${selectedFile?.name.replace(/\.[^/.]+$/, '')}.${extension}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [compressedImage, selectedFile, selectedFormat]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <FileUploader
            onFileSelect={handleFileSelect}
            currentFileName={selectedFile?.name || null}
          />

          {selectedFile && (
            <div className="space-y-6">
              {/* Compression Settings */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
                <h3 className="font-medium text-gray-900">Compression Settings</h3>

                {/* Quality Presets */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Quality Preset
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {IMAGE_QUALITY_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => setSelectedPreset(preset)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedPreset.name === preset.name
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Settings */}
                {selectedPreset.name === 'Custom' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Quality ({customQuality}%)
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={customQuality}
                        onChange={(e) => setCustomQuality(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Max Width/Height (px)
                      </label>
                      <input
                        type="number"
                        value={customMaxSize}
                        onChange={(e) => setCustomMaxSize(Number(e.target.value))}
                        min="100"
                        max="4096"
                        className="w-full rounded-lg border-gray-300"
                      />
                    </div>
                  </div>
                )}

                {/* Output Format */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Output Format
                  </label>
                  <select
                    value={selectedFormat.value}
                    onChange={(e) => setSelectedFormat(
                      OUTPUT_FORMATS.find(f => f.value === e.target.value) || OUTPUT_FORMATS[0]
                    )}
                    className="w-full rounded-lg border-gray-300"
                  >
                    {OUTPUT_FORMATS.map((format) => (
                      <option key={format.value} value={format.value}>
                        {format.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Compress Button */}
                <button
                  onClick={compressImage}
                  disabled={loading}
                  className={`w-full py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2
                    ${loading
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Compressing...
                    </>
                  ) : (
                    <>
                      <FileDown className="w-4 h-4" />
                      Compress Image
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}
        </div>

        {/* Preview Section */}
        <div className="space-y-6">
          {selectedFile && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-medium text-gray-900">Original Image</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Size: {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <div className="p-4">
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Original"
                  className="w-full rounded-lg"
                />
              </div>
            </div>
          )}

          {compressedImage && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Compressed Image</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Size: {formatFileSize(compressedImage.compressedSize)} ({' '}
                      <span className="text-green-600">
                        {calculateReduction(compressedImage.originalSize, compressedImage.compressedSize)}%
                        reduction
                      </span>
                      )
                    </p>
                  </div>
                  <button
                    onClick={downloadCompressedImage}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
              <div className="p-4">
                <img
                  src={compressedImage.preview}
                  alt="Compressed"
                  className="w-full rounded-lg"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}