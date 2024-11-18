import React from 'react';
import { useAuthStore, SubscriptionTier } from '../lib/store';
import { ArrowRight, Check } from 'lucide-react';

interface UpgradePromptProps {
  feature: string;
  requiredTier: SubscriptionTier;
}

export default function UpgradePrompt({ feature, requiredTier }: UpgradePromptProps) {
  const { upgradeSubscription, loading } = useAuthStore();

  const handleUpgrade = async () => {
    await upgradeSubscription(requiredTier);
  };

  return (
    <div className="p-8 text-center space-y-6">
      <div className="bg-jet-800/50 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
        <Check className="w-8 h-8 text-neon-500" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-white">Upgrade Required</h3>
        <p className="text-gray-400">
          {feature} is available in the {requiredTier} plan and above.
        </p>
      </div>

      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="btn-primary"
      >
        {loading ? 'Upgrading...' : `Upgrade to ${requiredTier}`}
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}