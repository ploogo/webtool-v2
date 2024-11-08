import React, { useState } from 'react';
import ThumbnailGenerator from './components/ThumbnailGenerator';
import ColorShadeGenerator from './components/ColorShadeGenerator';
import URLGenerator from './components/URLGenerator';
import ImageEditor from './components/ImageEditor';
import TextCaseConverter from './components/TextCaseConverter';
import MetaTagGenerator from './components/MetaTagGenerator';
import ImageCompressor from './components/ImageCompressor';
import { FileText, Palette, Link, Crop, Type, Menu, X, Tags, Image } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'thumbnails' | 'color' | 'url' | 'image' | 'text' | 'meta' | 'compress'>('thumbnails');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigation = [
    { id: 'thumbnails', name: 'Thumbnails', icon: FileText },
    { id: 'color', name: 'Color Tools', icon: Palette },
    { id: 'url', name: 'URL Tools', icon: Link },
    { id: 'image', name: 'Image Editor', icon: Crop },
    { id: 'compress', name: 'Image Compressor', icon: Image },
    { id: 'text', name: 'Text Case', icon: Type },
    { id: 'meta', name: 'Meta Tags', icon: Tags },
  ] as const;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">WebTool V2</h1>
          <div className="w-10" /> {/* Spacer for alignment */}
        </div>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 lg:hidden">
          <h1 className="text-xl font-bold">WebTool V2</h1>
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="px-2 py-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        <main className="min-h-screen pt-16 lg:pt-0">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
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
            ) : activeTab === 'image' ? (
              <>
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                  Image Editor
                </h1>
                <ImageEditor />
              </>
            ) : activeTab === 'compress' ? (
              <>
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                  Image Compressor
                </h1>
                <ImageCompressor />
              </>
            ) : activeTab === 'text' ? (
              <>
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                  Text Case Converter
                </h1>
                <TextCaseConverter />
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                  Meta Tag Generator
                </h1>
                <MetaTagGenerator />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;