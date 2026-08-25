import { useState } from 'react';
import { Calculator, Trash2, PlusCircle, BarChart3 } from 'lucide-react';

interface Variant {
  name: string;
  visitors: number;
  conversions: number;
}

interface TestResult {
  winner: string;
  confidence: number;
  improvement: number;
}

/**
 * Abramowitz & Stegun 7.1.26 approximation of the error function. JavaScript
 * has no Math.erf, so the previous call threw a TypeError the moment anyone
 * pressed Calculate.
 */
function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);

  const t = 1 / (1 + 0.3275911 * absX);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t +
      0.254829592) *
      t *
      Math.exp(-absX * absX);

  return sign * y;
}

/** Two-tailed normal confidence, as a percentage, for a given z-score. */
function confidenceFromZ(z: number): number {
  return erf(z / Math.SQRT2) * 100;
}

export default function ABTestCalculator() {
  const [variants, setVariants] = useState<Variant[]>([
    { name: 'Control', visitors: 0, conversions: 0 },
    { name: 'Variant A', visitors: 0, conversions: 0 },
  ]);
  const [results, setResults] = useState<TestResult | null>(null);
  const [resultError, setResultError] = useState<string | null>(null);

  const addVariant = () => {
    const variantName = `Variant ${String.fromCharCode(65 + variants.length - 1)}`;
    setVariants([...variants, { name: variantName, visitors: 0, conversions: 0 }]);
  };

  const removeVariant = (index: number) => {
    if (variants.length > 2) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const updateVariant = (index: number, field: keyof Variant, value: string) => {
    // The numeric fields are typed as numbers, but the input hands back a
    // string. Storing it as-is left visitors/conversions holding strings, so
    // later comparisons ran lexicographically ("140" > "1000").
    const parsed: string | number =
      field === 'name' ? value : Math.max(0, Number(value) || 0);

    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: parsed };
    setVariants(newVariants);
  };

  const calculateResults = () => {
    const control = variants[0];

    // Rates are undefined without traffic, and every downstream number would
    // come out NaN.
    const missingTraffic = variants.find(variant => variant.visitors <= 0);
    if (missingTraffic) {
      setResults(null);
      setResultError(`Enter the number of visitors for ${missingTraffic.name}.`);
      return;
    }

    const overCounted = variants.find(variant => variant.conversions > variant.visitors);
    if (overCounted) {
      setResults(null);
      setResultError(`${overCounted.name} has more conversions than visitors.`);
      return;
    }

    const controlRate = control.conversions / control.visitors;

    let best: TestResult | null = null;

    variants.slice(1).forEach(variant => {
      const variantRate = variant.conversions / variant.visitors;
      const improvement = controlRate === 0
        ? (variantRate > 0 ? Infinity : 0)
        : ((variantRate - controlRate) / controlRate) * 100;

      // Standard error of the difference between two proportions
      const se = Math.sqrt(
        (controlRate * (1 - controlRate)) / control.visitors +
        (variantRate * (1 - variantRate)) / variant.visitors
      );

      // With no variance at all the test says nothing either way.
      if (se === 0) return;

      const z = Math.abs(variantRate - controlRate) / se;
      const confidence = confidenceFromZ(z);

      if (confidence > 95 && improvement > 0 && (!best || improvement > best.improvement)) {
        best = { winner: variant.name, confidence, improvement };
      }
    });

    setResults(best);
    setResultError(
      best ? null : 'No variant beat the control at 95% confidence yet.'
    );
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

      {/* With no winner the panel below stays hidden, so say why rather than
          leaving the button looking broken. */}
      {resultError && !results && (
        <div className="card text-sm text-gray-300">{resultError}</div>
      )}

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
                {results.confidence.toFixed(2)}%
              </div>
            </div>
            <div className="card bg-navy-800">
              <div className="text-sm text-gray-400">Improvement</div>
              <div className="text-xl font-medium text-white mt-1">
                {results.improvement > 0 ? '+' : ''}
                {Number.isFinite(results.improvement)
                  ? `${results.improvement.toFixed(2)}%`
                  : '∞'}
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