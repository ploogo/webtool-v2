import React, { useState, useCallback } from 'react';
import { Copy, AlertCircle, Smartphone, Monitor, RefreshCw } from 'lucide-react';

interface MetaData {
  title: string;
  description: string;
  keywords: string;
}

const LIMITS = {
  title: {
    min: 30,
    max: 60,
    warning: 55,
  },
  description: {
    min: 120,
    max: 160,
    warning: 150,
  },
  keywords: {
    max: 10, // maximum number of keywords
  },
};

export default function MetaTagGenerator() {
  const [meta, setMeta] = useState<MetaData>({
    title: '',
    description: '',
    keywords: '',
  });
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('desktop');
  const [copied, setCopied] = useState<string | null>(null);

  const getCharacterStatus = (type: 'title' | 'description', length: number) => {
    const limits = LIMITS[type];
    if (length === 0) return 'empty';
    if (length < limits.min) return 'short';
    if (length > limits.max) return 'long';
    if (length >= limits.warning) return 'warning';
    return 'good';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'empty':
        return 'text-gray-400';
      case 'short':
        return 'text-orange-500';
      case 'long':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'good':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const getKeywordsCount = () => {
    return meta.keywords.split(',').filter(k => k.trim()).length;
  };

  const generateMetaTags = () => {
    return `<title>${meta.title}</title>
<meta name="description" content="${meta.description}" />
<meta name="keywords" content="${meta.keywords}" />`;
  };

  const copyToClipboard = useCallback((text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 1500);
  }, []);

  const clearAll = () => {
    setMeta({
      title: '',
      description: '',
      keywords: '',
    });
  };

  const titleStatus = getCharacterStatus('title', meta.title.length);
  const descriptionStatus = getCharacterStatus('description', meta.description.length);
  const keywordsCount = getKeywordsCount();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Input Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Meta Tags</h2>
          <button
            onClick={clearAll}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <RefreshCw className="w-4 h-4" />
            Clear All
          </button>
        </div>

        {/* Title Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Page Title
            </label>
            <span className={`text-sm ${getStatusColor(titleStatus)}`}>
              {meta.title.length}/{LIMITS.title.max} characters
            </span>
          </div>
          <input
            type="text"
            value={meta.title}
            onChange={(e) => setMeta(prev => ({ ...prev, title: e.target.value }))}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter your page title"
          />
          {titleStatus !== 'good' && titleStatus !== 'empty' && (
            <p className={`text-sm flex items-center gap-1 ${getStatusColor(titleStatus)}`}>
              <AlertCircle className="w-4 h-4" />
              {titleStatus === 'short' && 'Title is too short. Add more relevant keywords.'}
              {titleStatus === 'long' && 'Title is too long. Keep it concise.'}
              {titleStatus === 'warning' && 'Title is approaching maximum length.'}
            </p>
          )}
        </div>

        {/* Description Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Meta Description
            </label>
            <span className={`text-sm ${getStatusColor(descriptionStatus)}`}>
              {meta.description.length}/{LIMITS.description.max} characters
            </span>
          </div>
          <textarea
            value={meta.description}
            onChange={(e) => setMeta(prev => ({ ...prev, description: e.target.value }))}
            className="w-full h-24 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter your meta description"
          />
          {descriptionStatus !== 'good' && descriptionStatus !== 'empty' && (
            <p className={`text-sm flex items-center gap-1 ${getStatusColor(descriptionStatus)}`}>
              <AlertCircle className="w-4 h-4" />
              {descriptionStatus === 'short' && 'Description is too short. Add more details.'}
              {descriptionStatus === 'long' && 'Description is too long. Keep it within limits.'}
              {descriptionStatus === 'warning' && 'Description is approaching maximum length.'}
            </p>
          )}
        </div>

        {/* Keywords Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Keywords (comma-separated)
            </label>
            <span className={`text-sm ${keywordsCount > LIMITS.keywords.max ? 'text-red-500' : 'text-gray-500'}`}>
              {keywordsCount} keywords
            </span>
          </div>
          <input
            type="text"
            value={meta.keywords}
            onChange={(e) => setMeta(prev => ({ ...prev, keywords: e.target.value }))}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter keywords, separated by commas"
          />
          {keywordsCount > LIMITS.keywords.max && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Too many keywords. Keep it under {LIMITS.keywords.max} for better SEO.
            </p>
          )}
        </div>
      </div>

      {/* Preview Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Preview</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`p-2 rounded-lg transition-colors ${
                previewDevice === 'mobile'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Smartphone className="w-5 h-5" />
            </button>
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`p-2 rounded-lg transition-colors ${
                previewDevice === 'desktop'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Monitor className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {/* Google Search Result Preview */}
          <div className="p-6 space-y-4">
            <div className={previewDevice === 'mobile' ? 'max-w-sm' : ''}>
              <div className="space-y-1">
                <div className="text-sm text-gray-600 truncate">
                  {window.location.origin}
                </div>
                <h2 className="text-blue-600 text-xl hover:underline cursor-pointer truncate">
                  {meta.title || 'Page Title'}
                </h2>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {meta.description || 'Meta description will appear here. Make it compelling and informative to improve click-through rates.'}
                </p>
              </div>
            </div>
          </div>

          {/* Generated Code */}
          <div className="border-t border-gray-200 bg-gray-50">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">Generated Meta Tags</h4>
                <button
                  onClick={() => copyToClipboard(generateMetaTags(), 'meta')}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors relative"
                >
                  <Copy className="w-4 h-4 text-gray-600" />
                  {copied === 'meta' && (
                    <span className="absolute right-0 top-full mt-1 text-xs bg-black/75 text-white px-2 py-1 rounded">
                      Copied!
                    </span>
                  )}
                </button>
              </div>
              <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                <code>{generateMetaTags()}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}