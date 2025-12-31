import React, { useState, useCallback } from 'react';
import { Copy, RefreshCw } from 'lucide-react';

type CaseType = 
  | 'camel'
  | 'pascal'
  | 'snake'
  | 'kebab'
  | 'constant'
  | 'dot'
  | 'path'
  | 'title'
  | 'sentence'
  | 'lower'
  | 'upper';

const CASE_TYPES: { value: CaseType; label: string; example: string }[] = [
  { value: 'camel', label: 'camelCase', example: 'myVariableName' },
  { value: 'pascal', label: 'PascalCase', example: 'MyVariableName' },
  { value: 'snake', label: 'snake_case', example: 'my_variable_name' },
  { value: 'kebab', label: 'kebab-case', example: 'my-variable-name' },
  { value: 'constant', label: 'CONSTANT_CASE', example: 'MY_VARIABLE_NAME' },
  { value: 'dot', label: 'dot.case', example: 'my.variable.name' },
  { value: 'path', label: 'path/case', example: 'my/variable/name' },
  { value: 'title', label: 'Title Case', example: 'My Variable Name' },
  { value: 'sentence', label: 'Sentence case', example: 'My variable name' },
  { value: 'lower', label: 'lowercase', example: 'my variable name' },
  { value: 'upper', label: 'UPPERCASE', example: 'MY VARIABLE NAME' },
];

function convertCase(text: string, type: CaseType): string {
  // First, normalize the text by splitting it into words
  const words = text
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Split camelCase
    .replace(/[_\-./]/g, ' ') // Replace common separators with spaces
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  switch (type) {
    case 'camel':
      return words
        .map((word, i) => 
          i === 0 
            ? word.toLowerCase() 
            : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join('');

    case 'pascal':
      return words
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');

    case 'snake':
      return words.map(word => word.toLowerCase()).join('_');

    case 'kebab':
      return words.map(word => word.toLowerCase()).join('-');

    case 'constant':
      return words.map(word => word.toUpperCase()).join('_');

    case 'dot':
      return words.map(word => word.toLowerCase()).join('.');

    case 'path':
      return words.map(word => word.toLowerCase()).join('/');

    case 'title':
      return words
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

    case 'sentence':
      return words
        .map((word, i) => 
          i === 0 
            ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            : word.toLowerCase()
        )
        .join(' ');

    case 'lower':
      return words.map(word => word.toLowerCase()).join(' ');

    case 'upper':
      return words.map(word => word.toUpperCase()).join(' ');

    default:
      return text;
  }
}

export default function TextCaseConverter() {
  const [input, setInput] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = useCallback((text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const clearInput = () => {
    setInput('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Input Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label htmlFor="input" className="block text-sm font-medium text-gray-700">
            Enter your text
          </label>
          <button
            onClick={clearInput}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Clear
          </button>
        </div>
        <textarea
          id="input"
          value={input}
          onChange={handleInputChange}
          placeholder="Type or paste your text here..."
          className="w-full h-32 p-4 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Conversions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CASE_TYPES.map((caseType, index) => (
          <div
            key={caseType.value}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">{caseType.label}</h3>
              <button
                onClick={() => copyToClipboard(convertCase(input, caseType.value), index)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
                aria-label={`Copy ${caseType.label} to clipboard`}
              >
                <Copy className="w-4 h-4 text-gray-500" aria-hidden="true" />
                {copiedIndex === index && (
                  <span className="absolute right-0 top-full mt-1 text-xs bg-black/75 text-white px-2 py-1 rounded">
                    Copied!
                  </span>
                )}
              </button>
            </div>
            <div className="font-mono text-sm bg-gray-50 p-3 rounded-md break-all">
              {input ? convertCase(input, caseType.value) : caseType.example}
            </div>
          </div>
        ))}
      </div>

      {/* Help Text */}
      <div className="text-sm text-gray-500">
        <p>
          This tool converts text between different case styles. Type or paste your text above to see it
          converted into various formats. Click the copy button to copy any result to your clipboard.
        </p>
      </div>
    </div>
  );
}
