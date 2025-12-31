import React, { useState, useEffect } from 'react';
import { Monitor, Smartphone, Copy, RefreshCw } from 'lucide-react';

interface MetaPreview {
  title: string;
  description: string;
  url: string;
}

export default function MetaTagGenerator() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [url, setUrl] = useState('');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('desktop');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const generateMetaTags = () => {
    return `<!-- Primary Meta Tags -->
<title>${title}</title>
<meta name="title" content="${title}">
<meta name="description" content="${description}">
${keywords ? `<meta name="keywords" content="${keywords}">` : ''}

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="${url}">
<meta property="twitter:title" content="${title}">
<meta property="twitter:description" content="${description}">`;
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const buttonClasses = (active: boolean) => `btn-icon ${
    active ? 'btn-icon-primary' : 'btn-icon-ghost'
  }`;

  const getCharacterCount = (text: string) => {
    return {
      count: text.length,
      status: text.length > 0 
        ? text.length <= (text === title ? 60 : 160) 
          ? 'text-green-500' 
          : 'text-red-500'
        : 'text-gray-400'
    };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Input Form */}
      <div className="card space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="page-title" className="block text-sm font-medium text-gray-300">
              Page Title
            </label>
            <div className="relative">
              <input
                id="page-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your page title"
                maxLength={60}
                className="input pr-16"
              />
              <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs ${getCharacterCount(title).status}`}>
                {getCharacterCount(title).count}/60
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Optimal length: 50-60 characters
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="meta-description" className="block text-sm font-medium text-gray-300">
              Meta Description
            </label>
            <div className="relative">
              <textarea
                id="meta-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter your meta description"
                maxLength={160}
                rows={3}
                className="input pr-16"
              />
              <span className={`absolute right-2 top-2 text-xs ${getCharacterCount(description).status}`}>
                {getCharacterCount(description).count}/160
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Optimal length: 150-160 characters
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="keywords" className="block text-sm font-medium text-gray-300">
              Keywords (optional)
            </label>
            <input
              id="keywords"
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="Enter keywords separated by commas"
              className="input"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="page-url" className="block text-sm font-medium text-gray-300">
              Page URL
            </label>
            <input
              id="page-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/page"
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="card space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-white">Preview</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={buttonClasses(previewDevice === 'mobile')}
              aria-label="Mobile preview"
              aria-pressed={previewDevice === 'mobile'}
            >
              <Smartphone className="w-5 h-5" aria-hidden="true" />
            </button>
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={buttonClasses(previewDevice === 'desktop')}
              aria-label="Desktop preview"
              aria-pressed={previewDevice === 'desktop'}
            >
              <Monitor className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className={`border border-navy-600 rounded-lg overflow-hidden ${
          previewDevice === 'mobile' ? 'max-w-sm mx-auto' : ''
        }`}>
          <div className="bg-white p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500" />
                <div className="text-xs text-green-700 truncate">{url || 'https://example.com'}</div>
              </div>
              <h2 className="text-lg font-medium text-gray-900 line-clamp-2">
                {title || 'Page Title'}
              </h2>
              <p className="text-sm text-gray-600 line-clamp-2">
                {description || 'Meta description will appear here. Make it compelling to improve click-through rates.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Code */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-white">Generated Meta Tags</h3>
          <button
            onClick={() => copyToClipboard(generateMetaTags(), 'meta')}
            className="btn-icon-secondary"
            aria-label="Copy meta tags to clipboard"
          >
            {copiedField === 'meta' ? (
              <span className="text-xs">Copied!</span>
            ) : (
              <Copy className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>
        <pre className="bg-navy-900 p-4 rounded-lg overflow-x-auto text-sm text-gray-300">
          <code>{generateMetaTags()}</code>
        </pre>
      </div>
    </div>
  );
}