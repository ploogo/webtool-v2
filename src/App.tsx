import React, { useEffect, useState } from 'react';
import ThumbnailGenerator from './components/ThumbnailGenerator';
import ColorShadeGenerator from './components/ColorShadeGenerator';
import URLGenerator from './components/URLGenerator';
import ImageEditor from './components/ImageEditor';
import TextCaseConverter from './components/TextCaseConverter';
import MetaTagGenerator from './components/MetaTagGenerator';
import ImageCompressor from './components/ImageCompressor';
import SymbolsToolbar from './components/SymbolsToolbar';
import ABTestCalculator from './components/analytics/ABTestCalculator';
import UTMBuilder from './components/analytics/UTMBuilder';
import SchemaGenerator from './components/SchemaGenerator';
import HomePage from './components/HomePage';
import {
  FileText, Palette, Link, Crop, Type, Menu, X, Tags, Image, Hash,
  Calculator, Share2, Code, LayoutGrid, Home,
} from 'lucide-react';

type ActiveTab = 'home' | 'thumbnails' | 'color' | 'url' | 'image' | 'text' | 'meta' | 'compress' | 'symbols' | 'abtest' | 'utm' | 'schema';

interface NavCategory {
  name: string;
  icon: React.ElementType;
  items: {
    id: ActiveTab;
    name: string;
    icon: React.ElementType;
    description: string;
  }[];
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isSidebarOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsSidebarOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isSidebarOpen]);

  const navigation: NavCategory[] = [
    {
      name: 'General',
      icon: Home,
      items: [
        { id: 'home', name: 'Home', icon: Home, description: 'Welcome to WebTool V2' },
      ],
    },
    {
      name: 'Media Tools',
      icon: LayoutGrid,
      items: [
        { id: 'thumbnails', name: 'PDF Thumbnails', icon: FileText, description: 'Generate thumbnails from PDF pages' },
        { id: 'compress', name: 'Image Compressor', icon: Image, description: 'Compress and optimize images' },
        { id: 'image', name: 'Image Editor', icon: Crop, description: 'Crop and resize images' },
      ],
    },
    {
      name: 'SEO & Meta',
      icon: Tags,
      items: [
        { id: 'meta', name: 'Meta Tags', icon: Tags, description: 'Generate meta tags for better SEO' },
        { id: 'schema', name: 'Schema.org', icon: Code, description: 'Create structured data markup' },
        { id: 'url', name: 'URL Generator', icon: Link, description: 'Create SEO-friendly URLs' },
      ],
    },
    {
      name: 'Analytics & Marketing',
      icon: Calculator,
      items: [
        { id: 'abtest', name: 'A/B Testing', icon: Calculator, description: 'Calculate statistical significance' },
        { id: 'utm', name: 'UTM Builder', icon: Share2, description: 'Create campaign tracking URLs' },
      ],
    },
    {
      name: 'Design Tools',
      icon: Palette,
      items: [
        { id: 'color', name: 'Color Tools', icon: Palette, description: 'Generate color palettes and shades' },
      ],
    },
    {
      name: 'Text Tools',
      icon: Type,
      items: [
        { id: 'text', name: 'Text Case', icon: Type, description: 'Convert text case formats' },
        { id: 'symbols', name: 'Symbols', icon: Hash, description: 'Copy common symbols and characters' },
      ],
    },
  ];

  if (activeTab === 'home') {
    return <HomePage onGetStarted={() => setActiveTab('thumbnails')} />;
  }

  return (
    <div className="min-h-screen bg-jet-950">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-neon-500 focus:text-jet-900 focus:font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-jet-950 focus:ring-neon-500"
      >
        Skip to main content
      </a>
      {/* Mobile Header */}
      <header className="lg:hidden bg-jet-900/50 backdrop-blur-sm border-b border-jet-800/50 fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-jet-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-500 focus:ring-offset-2 focus:ring-offset-jet-950"
            aria-label={isSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isSidebarOpen}
            aria-controls="primary-navigation"
          >
            <Menu className="w-6 h-6 text-white" aria-hidden="true" />
          </button>
          <h1 className="text-lg font-semibold text-white">WebTool V2</h1>
          <div className="w-10" />
        </div>
      </header>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-jet-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        id="primary-navigation"
        aria-label="Primary"
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-jet-900/50 backdrop-blur-sm border-r border-jet-800/50 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 lg:hidden">
          <span className="text-xl font-bold text-white">WebTool V2</span>
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 hover:bg-jet-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-500 focus:ring-offset-2 focus:ring-offset-jet-950"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5 text-jet-300" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Tools" className="px-2 py-4 space-y-4">
          {navigation.map((category) => (
            <div key={category.name} className="space-y-1" role="group" aria-labelledby={`nav-heading-${category.name}`}>
              <div
                id={`nav-heading-${category.name}`}
                className="px-3 py-2 text-sm font-medium text-jet-300"
              >
                {category.name}
              </div>
              <div className="space-y-1">
                {category.items.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsSidebarOpen(false);
                      }}
                      aria-current={isActive ? 'page' : undefined}
                      className={`w-full flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-neon-500 focus:ring-offset-2 focus:ring-offset-jet-950 ${
                        isActive
                          ? 'bg-neon-500 text-jet-900 font-semibold'
                          : 'text-jet-300 hover:bg-jet-800 hover:text-white'
                      }`}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                      <span className="truncate">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        <main id="main-content" tabIndex={-1} className="min-h-screen pt-16 lg:pt-0 scroll-mt-20">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {activeTab !== 'home' && (
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">
                  {navigation
                    .flatMap(category => category.items)
                    .find(item => item.id === activeTab)?.name}
                </h1>
                <p className="mt-2 text-jet-300">
                  {navigation
                    .flatMap(category => category.items)
                    .find(item => item.id === activeTab)?.description}
                </p>
              </div>
            )}

            {activeTab === 'thumbnails' ? (
              <ThumbnailGenerator />
            ) : activeTab === 'compress' ? (
              <ImageCompressor />
            ) : activeTab === 'color' ? (
              <ColorShadeGenerator />
            ) : activeTab === 'url' ? (
              <URLGenerator />
            ) : activeTab === 'image' ? (
              <ImageEditor />
            ) : activeTab === 'text' ? (
              <TextCaseConverter />
            ) : activeTab === 'symbols' ? (
              <SymbolsToolbar />
            ) : activeTab === 'abtest' ? (
              <ABTestCalculator />
            ) : activeTab === 'utm' ? (
              <UTMBuilder />
            ) : activeTab === 'schema' ? (
              <SchemaGenerator />
            ) : (
              <MetaTagGenerator />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}