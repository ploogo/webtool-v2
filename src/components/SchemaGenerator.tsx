import { useState } from 'react';
import { Copy, Search, HelpCircle, Code, RefreshCw } from 'lucide-react';
import { schemaTypes, SchemaType, SchemaField } from '../lib/schemaTypes';

interface FormData {
  [key: string]: string;
}

type SchemaValue = string | Record<string, string>;

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', CAD: 'CA$', AUD: 'A$',
};

function currencySymbol(code?: string): string {
  if (!code) return '$';
  return CURRENCY_SYMBOLS[code.toUpperCase()] ?? `${code.toUpperCase()} `;
}

/** Whole stars to draw, clamped so the preview cannot render a negative count. */
function ratingStars(value?: string): number {
  const rating = Math.round(Number(value));
  if (!Number.isFinite(rating) || rating <= 0) return 0;
  return Math.min(5, rating);
}

export default function SchemaGenerator() {
  const [selectedType, setSelectedType] = useState<SchemaType | null>(null);
  const [formData, setFormData] = useState<FormData>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const generateSchema = () => {
    if (!selectedType) return '';

    const schema = {
      '@context': 'https://schema.org',
      '@type': selectedType.type,
      ...Object.entries(formData).reduce<Record<string, SchemaValue>>((acc, [key, value]) => {
        if (value) {
          // Handle nested objects
          if (key.includes('.')) {
            const [parent, child] = key.split('.');
            const existing = acc[parent];
            const nested = typeof existing === 'object' && existing !== null ? existing : {};
            nested[child] = value;
            acc[parent] = nested;
          } else {
            acc[key] = value;
          }
        }
        return acc;
      }, {}),
    };

    return JSON.stringify(schema, null, 2);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const resetForm = () => {
    setFormData({});
    setSelectedType(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const renderField = (field: SchemaField) => {
    const value = formData[field.id] || '';
    
    return (
      <div key={field.id} className="space-y-2">
        <div className="flex items-center gap-2">
          <label className="block text-sm font-medium text-gray-300">
            {field.label}
            {field.required && <span className="text-brand-coral ml-1">*</span>}
          </label>
          <button
            className="btn-icon-ghost"
            onMouseEnter={() => setShowTooltip(field.id)}
            onMouseLeave={() => setShowTooltip(null)}
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
        
        {showTooltip === field.id && (
          <div className="absolute z-50 mt-1 p-2 bg-navy-700 text-sm text-gray-300 rounded-lg shadow-lg max-w-xs">
            {field.description}
          </div>
        )}

        {field.type === 'textarea' ? (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className="input h-24"
            placeholder={field.placeholder}
            required={field.required}
          />
        ) : (
          <input
            type={field.type}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className="input"
            placeholder={field.placeholder}
            required={field.required}
          />
        )}
      </div>
    );
  };

  const renderPreview = () => {
    if (!selectedType || !formData) return null;

    switch (selectedType.type) {
      case 'Article':
        return (
          <div className="space-y-2">
            <div className="text-brand-coral text-sm">{formData.url || 'example.com'}</div>
            <h3 className="text-lg font-medium text-white">
              {formData.headline || 'Article Title'}
            </h3>
            <p className="text-sm text-gray-400">
              {formData.description || 'Article description will appear here...'}
            </p>
            <div className="text-xs text-gray-500">
              By {formData['author.name'] || 'Author'} • {formData.datePublished || 'Publication date'}
            </div>
          </div>
        );

      case 'Product':
        return (
          <div className="space-y-2">
            <div className="text-brand-coral text-sm">{formData.url || 'example.com'}</div>
            <h3 className="text-lg font-medium text-white">
              {formData.name || 'Product Name'}
            </h3>
            <div className="text-xl font-medium text-brand-coral">
              {formData['offers.price']
                ? `${currencySymbol(formData['offers.priceCurrency'])}${formData['offers.price']}`
                : '$0.00'}
            </div>
            <p className="text-sm text-gray-400">
              {formData.description || 'Product description will appear here...'}
            </p>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex text-yellow-400">
                {'★'.repeat(ratingStars(formData['aggregateRating.ratingValue']))}
                {'☆'.repeat(5 - ratingStars(formData['aggregateRating.ratingValue']))}
              </div>
              <span className="text-gray-500">
                {formData['aggregateRating.reviewCount'] || '0'} reviews
              </span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Schema Type Selection */}
      <div className="card space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-white">Select Schema Type</h3>
          {selectedType && (
            <button onClick={resetForm} className="btn-icon-ghost">
              <RefreshCw className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {schemaTypes.map((type) => (
            <button
              key={type.type}
              onClick={() => setSelectedType(type)}
              className={`p-4 rounded-lg border transition-colors ${
                selectedType?.type === type.type
                  ? 'border-brand-coral bg-navy-700 text-white'
                  : 'border-navy-600 hover:border-brand-coral text-gray-300'
              }`}
            >
              <div className="text-center space-y-2">
                <type.icon className="w-6 h-6 mx-auto" />
                <div className="text-sm font-medium">{type.type}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedType && (
        <>
          {/* Form Fields */}
          <div className="card space-y-6">
            <h3 className="text-lg font-medium text-white">
              {selectedType.type} Properties
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedType.fields.map(renderField)}
            </div>
          </div>

          {/* Preview */}
          <div className="card space-y-4">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-brand-coral" />
              <h3 className="text-lg font-medium text-white">Search Result Preview</h3>
            </div>
            <div className="p-4 bg-navy-800 rounded-lg">
              {renderPreview()}
            </div>
          </div>

          {/* Generated Code */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-brand-coral" />
                <h3 className="text-lg font-medium text-white">Generated Schema</h3>
              </div>
              <button
                onClick={() => copyToClipboard(generateSchema(), 'schema')}
                className="btn-icon-secondary"
              >
                {copiedField === 'schema' ? (
                  <span className="text-xs">Copied!</span>
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
            <pre className="bg-navy-900 p-4 rounded-lg overflow-x-auto">
              <code className="text-sm text-gray-300">{generateSchema()}</code>
            </pre>
          </div>
        </>
      )}
    </div>
  );
}