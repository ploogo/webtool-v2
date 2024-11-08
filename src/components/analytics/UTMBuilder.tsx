import React, { useState } from 'react';
import { Link2, Copy, QrCode, Download } from 'lucide-react';

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
            <label className="block text-sm font-medium text-gray-300">
              Website URL
            </label>
            <input
              type="url"
              value={params.url}
              onChange={(e) => setParams({ ...params, url: e.target.value })}
              placeholder="https://example.com"
              className="input"
            />
          </div>

          {/* Campaign Source */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Campaign Source
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={params.source}
                onChange={(e) => setParams({ ...params, source: e.target.value })}
                placeholder="e.g., google"
                className="input"
              />
              <div className="flex flex-wrap gap-2">
                {COMMON_SOURCES.map((source) => (
                  <button
                    key={source}
                    onClick={() => setParams({ ...params, source })}
                    className="px-2 py-1 text-xs rounded-md bg-navy-700 text-gray-300 hover:bg-navy-600"
                  >
                    {source}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Campaign Medium */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Campaign Medium
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={params.medium}
                onChange={(e) => setParams({ ...params, medium: e.target.value })}
                placeholder="e.g., cpc"
                className="input"
              />
              <div className="flex flex-wrap gap-2">
                {COMMON_MEDIUMS.map((medium) => (
                  <button
                    key={medium}
                    onClick={() => setParams({ ...params, medium })}
                    className="px-2 py-1 text-xs rounded-md bg-navy-700 text-gray-300 hover:bg-navy-600"
                  >
                    {medium}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Campaign Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Campaign Name
            </label>
            <input
              type="text"
              value={params.campaign}
              onChange={(e) => setParams({ ...params, campaign: e.target.value })}
              placeholder="e.g., summer_sale"
              className="input"
            />
          </div>

          {/* Optional Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Campaign Term (Optional)
              </label>
              <input
                type="text"
                value={params.term}
                onChange={(e) => setParams({ ...params, term: e.target.value })}
                placeholder="e.g., running+shoes"
                className="input"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Campaign Content (Optional)
              </label>
              <input
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
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">Generated URL</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(generateURL(), 'url')}
                className="btn-icon-secondary"
              >
                {copiedField === 'url' ? (
                  <span className="text-xs">Copied!</span>
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={saveLink}
                className="btn-icon-secondary"
              >
                <Download className="w-5 h-5" />
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
          <div className="space-y-2">
            {savedLinks.map((link, index) => (
              <div
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
                    onClick={() => copyToClipboard(generateURL(), `saved-${index}`)}
                    className="btn-icon-ghost"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button className="btn-icon-ghost">
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}