/**
 * 💎 Premium Subscription Page - Phase 3
 * Tier selection and upgrade flow
 */

'use client';

import { usePremiumTier } from '@/hooks/premium-hooks';
import { _useAuthStore as useAuthStore } from '@/stores/auth-store';
import {
    BoltIcon,
    ChartBarIcon,
    CheckIcon,
    GlobeAltIcon,
    SparklesIcon,
    VideoCameraIcon,
} from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { useState } from 'react';
// import type { PremiumTier } from '@/lib/premium-tier-service';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import PremiumButton from '@/components/ui/PremiumButton';
import PremiumCard from '@/components/ui/PremiumCard';

// Premium tier ID type
type TierId = string;

export default function PremiumPage() {
  const { user } = useAuthStore();
  const { currentTier, plan, allPlans, upgrade, isUpgrading } = usePremiumTier(user?.id || '');
  const [selectedTier, setSelectedTier] = useState<TierId>(currentTier);

  // Loading state
  if (!allPlans || allPlans.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const handleUpgrade = () => {
    if (selectedTier !== currentTier) {
      const tierToUpgrade = allPlans.find((p) => p.id === selectedTier);
      if (tierToUpgrade) {
        upgrade(tierToUpgrade);
      }
    }
  };

  const tierIcons: Record<string, typeof BoltIcon> = {
    free: BoltIcon,
    basic: BoltIcon,
    premium: VideoCameraIcon,
    gold: ChartBarIcon,
    ultimate: GlobeAltIcon,
  };

  const tierColors: Record<string, string> = {
    free: 'from-gray-400 to-gray-500',
    basic: 'from-blue-400 to-blue-500',
    premium: 'from-pink-500 to-purple-600',
    gold: 'from-yellow-500 to-orange-500',
    ultimate: 'from-purple-600 to-pink-600',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <SparklesIcon className="w-16 h-16 mx-auto text-purple-500 mb-4" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Upgrade to Premium
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Unlock powerful features and find your perfect match faster
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Current Plan:{' '}
            <span className="font-semibold text-purple-600">{plan?.name || 'Loading...'}</span>
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {allPlans.map((tierPlan, index) => {
            const Icon = tierIcons[tierPlan.id] || BoltIcon;
            const isCurrentTier = tierPlan.id === currentTier;
            const isSelected = tierPlan.id === selectedTier;
            const isPremium = tierPlan.id !== 'free';

            return (
              <motion.div
                key={tierPlan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PremiumCard
                hover
                className={`p-6 h-full ${isSelected ? 'ring-4 ring-purple-500' : ''}`}
                >
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="mb-6">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-r ${tierColors[tierPlan.id] || 'from-gray-400 to-gray-500'} flex items-center justify-center mb-4`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {tierPlan.name}
                      </h3>
                      <div className="flex items-baseline mb-2">
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">
                          ${tierPlan.price ?? 0}
                        </span>
                        {(tierPlan.price ?? 0) > 0 && <span className="text-gray-500 ml-2">/month</span>}
                      </div>
                      {isCurrentTier ? <span className="inline-block px-3 py-1 text-xs font-semibold text-white bg-purple-500 rounded-full">
                          Current Plan
                        </span> : null}
                    </div>

                    {/* Features */}
                    <div className="flex-1 space-y-3 mb-6">
                      {tierPlan.features.slice(0, 6).map((feature) => (
                        <div key={feature} className="flex items-center gap-2">
                          <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Action Button */}
                    <PremiumButton
                      size="lg"
                      variant={isSelected ? 'primary' : 'secondary'}
                      disabled={isCurrentTier || !isPremium}
                      onClick={() => setSelectedTier(tierPlan.id)}
                    >
                      {isCurrentTier ? 'Current Plan' : isSelected ? 'Selected' : 'Select Plan'}
                    </PremiumButton>
                  </div>
                </PremiumCard>
              </motion.div>
            );
          })}
        </div>

        {/* Upgrade Button */}
        {selectedTier !== currentTier && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <PremiumCard
              className="max-w-2xl mx-auto p-8"
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Ready to upgrade?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Upgrade to {allPlans.find((p) => p.id === selectedTier)?.name} for just
                <span className="font-bold text-purple-600 mx-2">
                  ${allPlans.find((p) => p.id === selectedTier)?.price ?? 0}/month
                </span>
              </p>
              <div className="flex gap-4 justify-center">
                <PremiumButton
                  size="lg"
                  variant="secondary"
                  onClick={() => setSelectedTier(currentTier)}
                >
                  Cancel
                </PremiumButton>
                <PremiumButton
                  size="lg"
                  loading={isUpgrading}
                  onClick={handleUpgrade}
                >
                  Upgrade Now
                </PremiumButton>
              </div>
            </PremiumCard>
          </motion.div>
        )}

        {/* Feature Comparison */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Feature Comparison
          </h2>
          <PremiumCard className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 text-gray-900 dark:text-white font-semibold">
                      Feature
                    </th>
                    {allPlans.map((tierPlan) => (
                      <th
                        key={tierPlan.id}
                        className="text-center py-4 px-4 text-gray-900 dark:text-white font-semibold"
                      >
                        {tierPlan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-600">Premium Features</td>
                    {allPlans.map((tierPlan) => (
                      <td
                        key={tierPlan.id}
                        className="text-center py-3 px-4"
                      >
                        {(tierPlan.price ?? 0) > 0 ? (
                          <CheckIcon className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-600">Price</td>
                    {allPlans.map((tierPlan) => (
                      <td
                        key={tierPlan.id}
                        className="text-center py-3 px-4 text-gray-900 dark:text-white font-semibold"
                      >
                        ${(tierPlan.price ?? 0)}/mo
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-gray-600">Features</td>
                    {allPlans.map((tierPlan) => (
                      <td
                        key={tierPlan.id}
                        className="text-center py-3 px-4 text-sm text-gray-600"
                      >
                        {tierPlan.features.length} features
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </PremiumCard>
        </div>
      </div>
    </div>
  );
}
