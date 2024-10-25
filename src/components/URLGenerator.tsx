import React, { useState, useCallback } from 'react';
import { generateSEOUrl } from '../lib/urlUtils';
import { Copy, RefreshCw } from 'lucide-react';

interface URLVariation {
  type: string;
  url: string;
}

export default function URLGenerator() {
  const [input, setInput] = useState('');
  const [urls, setUrls] = useState<URLVariation[]>([]);
  const [copied, setCopied] = useState<number | null>(null);

  const generateURLs = useCallback(() => {
    if (!input.trim()) return;

    const variations: URLVariation[] = [
      { type: 'standard', url: generateSEOUrl(input) },
      { type: 'long', url: generateSEOUrl(input, { maxLength: 50 }) },
      { type: 'medium', url: generateSEOUrl(input, { maxLength: 30 }) },
      { type: 'short', url: generateSEOUrl(input, { maxLength: 20 }) },
      { type: 'dated', url: generateSEOUrl(input, { maxLength: 20, includeDate: true }) },
    ];

    setUrls(variations);
  }, [input]);

  const copyToClipboard = useCallback((text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 1500);
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Enter your title or text
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="title"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g., 10 Best Practices for Writing Clean Code in 2024"
              className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <button
              onClick={generateURLs}
              disabled={!input.trim()}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2
                ${!input.trim()
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
            >
              <RefreshCw className="w-4 h-4" />
              Generate
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-500">
          Enter a title or text, and we'll generate SEO-friendly URL variations that are easy to read
          and share.
        </p>
      </div>

      {urls.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">URL Variations</h2>
          <div className="space-y-3">
            {urls.map((variation, index) => (
              <div
                key={`${variation.type}-${variation.url}`}
                className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg group relative"
              >
                <div className="flex-1 font-mono text-sm text-gray-600 break-all">
                  {variation.url}
                </div>
                <button
                  onClick={() => copyToClipboard(variation.url, index)}
                  className="p-2 hover:bg-gray-200 rounded-md transition-colors"
                  title="Copy URL"
                >
                  <Copy className="w-4 h-4 text-gray-500" />
                </button>
                {copied === index && (
                  <span className="absolute right-12 top-1/2 -translate-y-1/2 text-xs bg-black/75 text-white px-2 py-1 rounded">
                    Copied!
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="text-sm text-gray-500">
            <p>URL variations include:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Standard version (with common words removed)</li>
              <li>Long version (up to 50 characters)</li>
              <li>Medium version (up to 30 characters)</li>
              <li>Short version (up to 20 characters)</li>
              <li>Dated version (includes current year)</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}