import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface SymbolCategory {
  name: string;
  symbols: {
    symbol: string;
    name: string;
  }[];
}

const SYMBOL_CATEGORIES: SymbolCategory[] = [
  {
    name: 'Trademarks & Copyright',
    symbols: [
      { symbol: '™', name: 'Trademark' },
      { symbol: '©', name: 'Copyright' },
      { symbol: '®', name: 'Registered Trademark' },
      { symbol: '℠', name: 'Service Mark' },
    ],
  },
  {
    name: 'Math Operators',
    symbols: [
      { symbol: '±', name: 'Plus-Minus' },
      { symbol: '×', name: 'Multiplication' },
      { symbol: '÷', name: 'Division' },
      { symbol: '≈', name: 'Approximately Equal' },
      { symbol: '≠', name: 'Not Equal' },
      { symbol: '≤', name: 'Less Than or Equal' },
      { symbol: '≥', name: 'Greater Than or Equal' },
      { symbol: '∞', name: 'Infinity' },
    ],
  },
  {
    name: 'Math Symbols',
    symbols: [
      { symbol: 'π', name: 'Pi' },
      { symbol: 'µ', name: 'Micro' },
      { symbol: '∑', name: 'Sum' },
      { symbol: '∏', name: 'Product' },
      { symbol: '√', name: 'Square Root' },
      { symbol: '∫', name: 'Integral' },
      { symbol: '∆', name: 'Delta' },
      { symbol: '∂', name: 'Partial Derivative' },
    ],
  },
  {
    name: 'Arrows',
    symbols: [
      { symbol: '←', name: 'Left Arrow' },
      { symbol: '→', name: 'Right Arrow' },
      { symbol: '↑', name: 'Up Arrow' },
      { symbol: '↓', name: 'Down Arrow' },
      { symbol: '↔', name: 'Left Right Arrow' },
      { symbol: '⇒', name: 'Double Right Arrow' },
      { symbol: '⇐', name: 'Double Left Arrow' },
      { symbol: '⇔', name: 'Double Left Right Arrow' },
    ],
  },
  {
    name: 'Currency',
    symbols: [
      { symbol: '€', name: 'Euro' },
      { symbol: '£', name: 'Pound' },
      { symbol: '¥', name: 'Yen' },
      { symbol: '¢', name: 'Cent' },
      { symbol: '₿', name: 'Bitcoin' },
      { symbol: '₽', name: 'Ruble' },
      { symbol: '₹', name: 'Rupee' },
    ],
  },
];

function SymbolsToolbar() {
  const [copiedSymbol, setCopiedSymbol] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(SYMBOL_CATEGORIES[0].name);

  const copyToClipboard = (symbol: string) => {
    navigator.clipboard.writeText(symbol);
    setCopiedSymbol(symbol);
    setTimeout(() => setCopiedSymbol(null), 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {SYMBOL_CATEGORIES.map((category) => (
          <button
            key={category.name}
            onClick={() => setSelectedCategory(category.name)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === category.name
                ? 'bg-brand-coral text-white'
                : 'bg-navy-700 text-gray-300 hover:bg-navy-600 hover:text-white'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Symbols Grid */}
      <div className="card">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {SYMBOL_CATEGORIES.find(c => c.name === selectedCategory)?.symbols.map(({ symbol, name }) => (
            <button
              key={symbol}
              onClick={() => copyToClipboard(symbol)}
              className="group relative flex items-center gap-3 p-3 rounded-lg bg-navy-800 hover:bg-navy-700 transition-colors"
            >
              <span className="text-2xl font-medium text-white">{symbol}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-300 truncate">{name}</p>
                <p className="text-xs text-gray-400">Click to copy</p>
              </div>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                {copiedSymbol === symbol ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </div>
              {copiedSymbol === symbol && (
                <span className="absolute -top-2 right-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                  Copied!
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Reference */}
      <div className="text-sm text-gray-400">
        <p>
          Tip: Click any symbol to copy it to your clipboard. You can then paste it anywhere using{' '}
          <kbd className="px-2 py-1 rounded bg-navy-700 text-gray-300">Ctrl</kbd>
          {' + '}
          <kbd className="px-2 py-1 rounded bg-navy-700 text-gray-300">V</kbd>
          {' or '}
          <kbd className="px-2 py-1 rounded bg-navy-700 text-gray-300">⌘</kbd>
          {' + '}
          <kbd className="px-2 py-1 rounded bg-navy-700 text-gray-300">V</kbd>
        </p>
      </div>
    </div>
  );
}

export default SymbolsToolbar;