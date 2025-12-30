import React from 'react';
import { Search, Bell, Menu, ChevronDown, Settings } from 'lucide-react';

interface ColorPreviewProps {
  colors: {
    primary: string;
    secondary: string;
    neutral: string;
    supporting: {
      success: string;
      warning: string;
      error: string;
      info: string;
    };
  };
}

export default function ColorPreview({ colors }: ColorPreviewProps) {
  return (
    <div className="mt-12 rounded-lg overflow-hidden shadow-xl border border-jet-700">
      {/* Header/Navigation */}
      <div style={{ backgroundColor: colors.primary }} className="p-4">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-8">
            <Menu className="w-6 h-6" />
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="opacity-70 hover:opacity-100">Dashboard</a>
              <a href="#" className="opacity-100">Analytics</a>
              <a href="#" className="opacity-70 hover:opacity-100">Reports</a>
              <a href="#" className="opacity-70 hover:opacity-100">Settings</a>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Bell className="w-5 h-5" />
            <Settings className="w-5 h-5" />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-white/20"></div>
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ backgroundColor: colors.primary }} className="px-4 pb-4 pt-2">
        <div className="bg-jet-800 rounded-lg p-3 flex items-center space-x-4 shadow-lg">
          <Search className="w-5 h-5 text-jet-400" />
          <input
            type="text"
            placeholder="Search reports..."
            className="flex-1 outline-none bg-transparent text-white placeholder-jet-400"
          />
          <button
            style={{ backgroundColor: colors.secondary }}
            className="px-4 py-2 rounded-md text-white text-sm font-medium"
          >
            Search
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-4 p-4 bg-jet-950">
        {/* Calendar Card */}
        <div className="col-span-12 md:col-span-4 bg-jet-900/50 p-4 rounded-lg shadow border border-jet-800/50">
          <h3 className="font-medium mb-4" style={{ color: colors.neutral }}>
            Calendar
          </h3>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 31 }, (_, i) => (
              <div
                key={i}
                className={`aspect-square rounded-md flex items-center justify-center text-sm
                  ${i === 15 ? 'text-white' : 'text-jet-300 hover:bg-jet-800'}`}
                style={i === 15 ? { backgroundColor: colors.primary } : {}}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Chart Card */}
        <div className="col-span-12 md:col-span-8 bg-jet-900/50 p-4 rounded-lg shadow border border-jet-800/50">
          <h3 className="font-medium mb-4" style={{ color: colors.neutral }}>
            Performance Overview
          </h3>
          <div className="h-[200px] flex items-end space-x-2">
            {Array.from({ length: 12 }, (_, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-md transition-all duration-200"
                style={{
                  backgroundColor: i === 8 ? colors.primary : colors.secondary,
                  opacity: i === 8 ? 1 : 0.7,
                  height: `${Math.random() * 100 + 50}px`,
                }}
              ></div>
            ))}
          </div>
        </div>

        {/* Table Card */}
        <div className="col-span-12 bg-jet-900/50 rounded-lg shadow border border-jet-800/50">
          <div className="p-4 border-b">
            <h3 className="font-medium" style={{ color: colors.neutral }}>
              Recent Activity
            </h3>
          </div>
          <div className="divide-y">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-jet-800/50">
                <div className="flex items-center space-x-4">
                  <div
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: colors.secondary + '20' }}
                  ></div>
                  <div>
                    <p className="font-medium text-white">Activity {i + 1}</p>
                    <p className="text-sm text-jet-400">Description text here</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span
                    className="px-2 py-1 rounded-full text-xs"
                    style={{
                      backgroundColor: colors.supporting.success + '20',
                      color: colors.supporting.success,
                    }}
                  >
                    Completed
                  </span>
                  <button
                    className="text-sm font-medium"
                    style={{ color: colors.primary }}
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}