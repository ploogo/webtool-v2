import React, { useState } from 'react';
import ThumbnailGenerator from './components/ThumbnailGenerator';
import ColorShadeGenerator from './components/ColorShadeGenerator';
import URLGenerator from './components/URLGenerator';
import ImageEditor from './components/ImageEditor';
import { FileText, Palette, Link, Crop } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'thumbnails' | 'color' | 'url' | 'image'>('thumbnails');

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col gap-2 shadow-sm">
        <button
          onClick={() => setActiveTab('thumbnails')}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            activeTab === 'thumbnails'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <FileText className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">Thumbnails</span>
        </button>
        <button
          onClick={() => setActiveTab('color')}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            activeTab === 'color'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Palette className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">Color Tools</span>
        </button>
        <button
          onClick={() => setActiveTab('url')}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            activeTab === 'url'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Link className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">URL Tools</span>
        </button>
        <button
          onClick={() => setActiveTab('image')}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            activeTab === 'image'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Crop className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">Image Editor</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto">
          <div className="max-w-7xl mx-auto p-8">
            {activeTab === 'thumbnails' ? (
              <>
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                  Thumbnail Generator
                </h1>
                <ThumbnailGenerator />
              </>
            ) : activeTab === 'color' ? (
              <ColorShadeGenerator />
            ) : activeTab === 'url' ? (
              <>
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                  SEO URL Generator
                </h1>
                <URLGenerator />
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                  Image Editor
                </h1>
                <ImageEditor />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
