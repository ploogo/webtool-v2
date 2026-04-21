import React, { useState } from 'react';
import { Copy, QrCode, Download } from 'lucide-react';

interface UTMParams {
  url: string;
  source: string;
  medium: string;
  campaign: string;
  term?: string;
  content?: string;
}

const COMMON_SOURCES = ['google', 'facebook', 'twitter', 'linkedin', 'email', 'newsletter'];
const COMMON_MEDIUMS = ['cpc', 'social', 'email', 'banner', 'affiliate'];

export default function UTMBuilder() {
  const [params, setParams] = useState<UTMParams>({
    url: '',
    source: '',
    medium: '',
    campaign: '',
  });
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [savedLinks, setSavedLinks] = useState<UTMParams[]>([]);

  const generateURL = () => {
    const url = new URL(params.url);
    url.searchParams.set('utm_source', params.source.toLowerCase());
    url.searchParams.set('utm_medium', params.medium.toLowerCase());
    url.searchParams.set('utm_campaign', params.campaign.toLowerCase());
    
    if (params.term) url.searchParams.set('utm_term', params.term.toLowerCase());
    if (params.content) url.searchParams.set('utm_content', params.content.toLowerCase());
    
    return url.toString();
  };

  const isValidURL = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isValid = () => {
    return isValidURL(params.url) && params.source && params.medium && params.campaign;
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const saveLink = () => {
    setSavedLinks([params, ...savedLinks]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* URL Builder Form */}
      <div className="card space-y-6">
        <h3 className="text-lg font-medium text-white">Campaign URL Builder</h3>

        <div className="space-y-4">
          {/* Website URL */}
          <div className="space-y-2">
            <label htmlFor="utm-url" className="block text-sm font-medium text-gray-300">
              Website URL
            </label>
            <input
              id="utm-url"
              type="url"
              value={params.url}
              onChange={(e) => setParams({ ...params, url: e.target.value })}
              placeholder="https://example.com"
              className="input"
              autoComplete="url"
              required
            />
          </div>

          {/* Campaign Source */}
          <div className="space-y-2">
            <label htmlFor="utm-source" className="block text-sm font-medium text-gray-300">
              Campaign Source
            </label>
            <div className="space-y-2">
              <input
                id="utm-source"
                type="text"
                value={params.source}
                onChange={(e) => setParams({ ...params, source: e.target.value })}
                placeholder="e.g., google"
                className="input"
                required
              />
              <div className="flex flex-wrap gap-2" role="group" aria-label="Common sources">
                {COMMON_SOURCES.map((source) => (
                  <button
                    key={source}
                    type="button"
                    onClick={() => setParams({ ...params, source })}
                    className="px-2 py-1 text-xs rounded-md bg-navy-700 text-gray-300 hover:bg-navy-600 focus:outline-none focus:ring-2 focus:ring-neon-500 focus:ring-offset-2 focus:ring-offset-jet-950"
                  >
                    {source}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Campaign Medium */}
          <div className="space-y-2">
            <label htmlFor="utm-medium" className="block text-sm font-medium text-gray-300">
              Campaign Medium
            </label>
            <div className="space-y-2">
              <input
                id="utm-medium"
                type="text"
                value={params.medium}
                onChange={(e) => setParams({ ...params, medium: e.target.value })}
                placeholder="e.g., cpc"
                className="input"
                required
              />
              <div className="flex flex-wrap gap-2" role="group" aria-label="Common mediums">
                {COMMON_MEDIUMS.map((medium) => (
                  <button
                    key={medium}
                    type="button"
                    onClick={() => setParams({ ...params, medium })}
                    className="px-2 py-1 text-xs rounded-md bg-navy-700 text-gray-300 hover:bg-navy-600 focus:outline-none focus:ring-2 focus:ring-neon-500 focus:ring-offset-2 focus:ring-offset-jet-950"
                  >
                    {medium}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Campaign Name */}
          <div className="space-y-2">
            <label htmlFor="utm-campaign" className="block text-sm font-medium text-gray-300">
              Campaign Name
            </label>
            <input
              id="utm-campaign"
              type="text"
              value={params.campaign}
              onChange={(e) => setParams({ ...params, campaign: e.target.value })}
              placeholder="e.g., summer_sale"
              className="input"
              required
            />
          </div>

          {/* Optional Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="utm-term" className="block text-sm font-medium text-gray-300">
                Campaign Term (Optional)
              </label>
              <input
                id="utm-term"
                type="text"
                value={params.term}
                onChange={(e) => setParams({ ...params, term: e.target.value })}
                placeholder="e.g., running+shoes"
                className="input"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="utm-content" className="block text-sm font-medium text-gray-300">
                Campaign Content (Optional)
              </label>
              <input
                id="utm-content"
                type="text"
                value={params.content}
                onChange={(e) => setParams({ ...params, content: e.target.value })}
                placeholder="e.g., logolink"
                className="input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Generated URL */}
      {isValid() && (
        <div className="card space-y-4" role="region" aria-live="polite" aria-label="Generated campaign URL">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">Generated URL</h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => copyToClipboard(generateURL(), 'url')}
                className="btn-icon-secondary"
                aria-label="Copy generated URL to clipboard"
              >
                {copiedField === 'url' ? (
                  <span className="text-xs">Copied!</span>
                ) : (
                  <Copy className="w-5 h-5" aria-hidden="true" />
                )}
              </button>
              <button
                type="button"
                onClick={saveLink}
                className="btn-icon-secondary"
                aria-label="Save campaign URL"
              >
                <Download className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="bg-navy-900 p-4 rounded-lg break-all font-mono text-sm text-gray-300">
            {generateURL()}
          </div>
        </div>
      )}

      {/* Saved Links */}
      {savedLinks.length > 0 && (
        <div className="card space-y-4">
          <h3 className="text-lg font-medium text-white">Saved Campaign URLs</h3>
          <ul className="space-y-2">
            {savedLinks.map((link, index) => (
              <li
                key={index}
                className="flex items-center justify-between p-4 bg-navy-800 rounded-lg"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">
                    {link.campaign}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {link.source} / {link.medium}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(generateURL(), `saved-${index}`)}
                    className="btn-icon-ghost"
                    aria-label={`Copy saved URL for ${link.campaign || 'campaign'}`}
                  >
                    <Copy className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="btn-icon-ghost"
                    aria-label={`Show QR code for ${link.campaign || 'campaign'}`}
                  >
                    <QrCode className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}