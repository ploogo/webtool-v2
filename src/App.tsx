import React, { useState } from 'react';
import PDFThumbnailGenerator from './components/PDFThumbnailGenerator';
import ColorShadeGenerator from './components/ColorShadeGenerator';
import URLGenerator from './components/URLGenerator';
import { FileText, Palette, Link } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'pdf' | 'color' | 'url'>('pdf');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-center">
          <div className="inline-flex rounded-lg bg-white p-1 shadow">
            <button
              onClick={() => setActiveTab('pdf')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'pdf'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              PDF Tools
            </button>
            <button
              onClick={() => setActiveTab('color')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'color'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Palette className="w-4 h-4" />
              Color Tools
            </button>
            <button
              onClick={() => setActiveTab('url')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'url'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Link className="w-4 h-4" />
              URL Tools
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          {activeTab === 'pdf' ? (
            <>
              <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                PDF Thumbnail Generator
              </h1>
              <PDFThumbnailGenerator />
            </>
          ) : activeTab === 'color' ? (
            <>
              <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Color Shade Generator
              </h1>
              <ColorShadeGenerator />
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                SEO URL Generator
              </h1>
              <URLGenerator />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;