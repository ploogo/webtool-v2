import React from 'react';
import { useAuthStore, TIER_LIMITS } from '../lib/store';

interface UsageIndicatorProps {
  type: 'pdfConversions' | 'imageCompressions';
}

export default function UsageIndicator({ type }: UsageIndicatorProps) {
  const { user } = useAuthStore();

  if (!user) return null;

  const usage = user.usageThisMonth[type];
  const limit = TIER_LIMITS[type][user.subscriptionTier];
  const percentage = limit === Infinity ? 0 : (usage / limit) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">
          {usage} / {limit === Infinity ? '∞' : limit} {type}
        </span>
        {limit !== Infinity && (
          <span className={`font-medium ${
            percentage > 80 ? 'text-red-400' : 'text-neon-500'
          }`}>
            {percentage.toFixed(0)}%
          </span>
        )}
      </div>
      {limit !== Infinity && (
        <div className="h-2 bg-jet-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              percentage > 80 ? 'bg-red-500' : 'bg-neon-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}