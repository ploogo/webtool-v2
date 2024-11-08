import React, { useState } from 'react';
import { Calculator, Trash2, PlusCircle, BarChart3 } from 'lucide-react';

interface Variant {
  name: string;
  visitors: number;
  conversions: number;
}

export default function ABTestCalculator() {
  const [variants, setVariants] = useState<Variant[]>([
    { name: 'Control', visitors: 0, conversions: 0 },
    { name: 'Variant A', visitors: 0, conversions: 0 },
  ]);
  const [results, setResults] = useState<{
    winner?: string;
    confidence?: number;
    improvement?: number;
  } | null>(null);

  const addVariant = () => {
    const variantName = `Variant ${String.fromCharCode(65 + variants.length - 1)}`;
    setVariants([...variants, { name: variantName, visitors: 0, conversions: 0 }]);
  };

  const removeVariant = (index: number) => {
    if (variants.length > 2) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const updateVariant = (index: number, field: keyof Variant, value: string | number) => {
    const newVariants = [...variants];
    newVariants[index] = {
      ...newVariants[index],
      [field]: typeof value === 'string' ? value : Math.max(0, Number(value)),
    };
    setVariants(newVariants);
  };

  const calculateResults = () => {
    // Z-score for 95% confidence level
    const Z = 1.96;
    const control = variants[0];
    let winner = null;
    let maxImprovement = 0;
    let highestConfidence = 0;

    const controlRate = control.conversions / control.visitors;

    variants.slice(1).forEach(variant => {
      const variantRate = variant.conversions / variant.visitors;
      const improvement = ((variantRate - controlRate) / controlRate) * 100;

      // Standard error calculation
      const se = Math.sqrt(
        (controlRate * (1 - controlRate)) / control.visitors +
        (variantRate * (1 - variantRate)) / variant.visitors
      );

      // Z-score calculation
      const z = Math.abs(variantRate - controlRate) / se;
      const confidence = (0.5 * (1 + Math.erf(z / Math.sqrt(2)))) * 100;

      if (confidence > 95 && improvement > maxImprovement) {
        winner = variant.name;
        maxImprovement = improvement;
        highestConfidence = confidence;
      }
    });

    setResults(winner ? {
      winner,
      confidence: highestConfidence,
      improvement: maxImprovement,
    } : null);
  };

  const getConversionRate = (variant: Variant) => {
    if (!variant.visitors) return 0;
    return (variant.conversions / variant.visitors) * 100;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Variants */}
      <div className="card space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-white">Test Variants</h3>
          <button
            onClick={addVariant}
            className="btn-icon-secondary"
            disabled={variants.length >= 5}
          >
            <PlusCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {variants.map((variant, index) => (
            <div key={index} className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-3">
                <input
                  type="text"
                  value={variant.name}
                  onChange={(e) => updateVariant(index, 'name', e.target.value)}
                  className="input"
                  placeholder="Variant name"
                />
              </div>
              <div className="col-span-3">
                <input
                  type="number"
                  value={variant.visitors}
                  onChange={(e) => updateVariant(index, 'visitors', e.target.value)}
                  className="input"
                  placeholder="Visitors"
                  min="0"
                />
              </div>
              <div className="col-span-3">
                <input
                  type="number"
                  value={variant.conversions}
                  onChange={(e) => updateVariant(index, 'conversions', e.target.value)}
                  className="input"
                  placeholder="Conversions"
                  min="0"
                  max={variant.visitors}
                />
              </div>
              <div className="col-span-2">
                <div className="text-sm text-gray-300">
                  {getConversionRate(variant).toFixed(2)}%
                </div>
              </div>
              <div className="col-span-1">
                {index > 1 && (
                  <button
                    onClick={() => removeVariant(index)}
                    className="btn-icon-ghost text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={calculateResults}
          className="btn-primary w-full"
          disabled={variants.some(v => !v.visitors)}
        >
          <Calculator className="w-5 h-5" />
          Calculate Results
        </button>
      </div>

      {/* Results */}
      {results && (
        <div className="card space-y-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-brand-coral" />
            <h3 className="text-lg font-medium text-white">Test Results</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card bg-navy-800">
              <div className="text-sm text-gray-400">Winner</div>
              <div className="text-xl font-medium text-white mt-1">
                {results.winner}
              </div>
            </div>
            <div className="card bg-navy-800">
              <div className="text-sm text-gray-400">Confidence Level</div>
              <div className="text-xl font-medium text-white mt-1">
                {results.confidence?.toFixed(2)}%
              </div>
            </div>
            <div className="card bg-navy-800">
              <div className="text-sm text-gray-400">Improvement</div>
              <div className="text-xl font-medium text-white mt-1">
                {results.improvement > 0 ? '+' : ''}{results.improvement?.toFixed(2)}%
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-400">
            <p>
              Statistical significance is calculated using a two-tailed Z-test with a 95%
              confidence level. The winner is determined when the confidence level exceeds
              95% and shows a positive improvement over the control variant.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}