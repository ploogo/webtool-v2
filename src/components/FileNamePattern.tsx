import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface FileNamePatternProps {
  onChange: (pattern: string) => void;
  defaultPattern?: string;
}

export default function FileNamePattern({ onChange, defaultPattern = 'page-{n}' }: FileNamePatternProps) {
  const [pattern, setPattern] = useState(defaultPattern);

  const handleChange = (value: string) => {
    setPattern(value);
    onChange(value);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="block text-sm font-medium text-gray-700">
          Filename Pattern
        </label>
        <div className="relative group">
          <Info className="w-4 h-4 text-gray-400 cursor-help" />
          <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-white rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-30">
            <p className="text-xs text-gray-600">
              Use {'{n}'} for page number. Example: <br />
              "document-{'{n}'}" becomes "document-1.jpg"
            </p>
          </div>
        </div>
      </div>
      <input
        type="text"
        value={pattern}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Enter filename pattern"
        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
      <p className="text-xs text-gray-500">
        Preview: {pattern.replace('{n}', '1')}.jpg
      </p>
    </div>
  );
}