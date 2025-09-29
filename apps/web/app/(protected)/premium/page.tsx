/**
 * 💎 Premium Subscription Page - Phase 3
 * Tier selection and upgrade flow
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckIcon, 
  SparklesIcon,
  VideoCameraIcon,
  ChartBarIcon,
  GlobeAltIcon,
  UserGroupIcon,
  BoltIcon
} from '@heroicons/react/24/solid';
import { useAuthStore } from '@/lib/auth-store';
import PremiumButton from '@/components/UI/PremiumButton';
import PremiumCard from '@/components/UI/PremiumCard';

// Dev-safe stubs for premium tier logic when hooks/services are missing
type PremiumTier = 'free' | 'premium_plus' | 'enterprise' | 'global_elite';
const premiumTierService = {
  getPlans: () => ([
    { tier: 'free', name: 'Free', price: 0, features: { videoCalls: false, analytics: false, apiAccess: false, conciergeService: false }, limits: { dailySwipes: 50 } },
    { tier: 'premium_plus', name: 'Premium+', price: 9, features: { videoCalls: true, analytics: true, apiAccess: false, conciergeService: false }, limits: { dailySwipes: -1 } },
    { tier: 'enterprise', name: 'Enterprise', price: 19, features: { videoCalls: true, analytics: true, apiAccess: true, conciergeService: false }, limits: { dailySwipes: -1 } },
    { tier: 'global_elite', name: 'Global Elite', price: 49, features: { videoCalls: true, analytics: true, apiAccess: true, conciergeService: true }, limits: { dailySwipes: -1 } },
  ])
};

function usePremiumTier(userId: string) {
  const plans = premiumTierService.getPlans();
  const currentTier: PremiumTier = 'free';
  return {
    currentTier,
    plan: plans[0],
    allPlans: plans,
    upgrade: (tier: PremiumTier) => console.log('Mock upgrade to', tier),
    isUpgrading: false,
  };
}

export default function PremiumPage() {
  const { user } = useAuthStore();
  const { currentTier, plan, allPlans, upgrade, isUpgrading } = usePremiumTier(user?.id || '');
  const [selectedTier, setSelectedTier] = useState<PremiumTier>(currentTier);

  const handleUpgrade = () => {
    if (selectedTier !== currentTier) {
      upgrade(selectedTier);
    }
  };

  const tierIcons = {
    free: BoltIcon,
    premium_plus: VideoCameraIcon,
    enterprise: ChartBarIcon,
    global_elite: GlobeAltIcon,
  };

  const tierColors = {
    free: 'from-gray-400 to-gray-500',
    premium_plus: 'from-pink-500 to-purple-600',
    enterprise: 'from-blue-500 to-indigo-600',
    global_elite: 'from-yellow-500 to-orange-600',
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
            Current Plan: <span className="font-semibold text-purple-600">{plan.name}</span>
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {allPlans.map((tierPlan, index) => {
            const Icon = tierIcons[tierPlan.tier];
            const isCurrentTier = tierPlan.tier === currentTier;
            const isSelected = tierPlan.tier === selectedTier;
            const isPremium = tierPlan.tier !== 'free';

            return (
              <motion.div
                key={tierPlan.tier}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PremiumCard
                  hover
                  glow={isSelected}
                  gradient={tierColors[tierPlan.tier]}
                  className={`p-6 h-full ${isSelected ? 'ring-4 ring-purple-500' : ''}`}
                >
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="mb-6">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${tierColors[tierPlan.tier]} flex items-center justify-center mb-4`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {tierPlan.name}
                      </h3>
                      <div className="flex items-baseline mb-2">
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">
                          ${tierPlan.price}
                        </span>
                        {tierPlan.price > 0 && (
                          <span className="text-gray-500 ml-2">/month</span>
                        )}
                      </div>
                      {isCurrentTier && (
                        <span className="inline-block px-3 py-1 text-xs font-semibold text-white bg-purple-500 rounded-full">
                          Current Plan
                        </span>
                      )}
                    </div>

                    {/* Features */}
                    <div className="flex-1 space-y-3 mb-6">
                      {Object.entries(tierPlan.features).slice(0, 6).map(([feature, enabled]) => {
                        if (typeof enabled === 'boolean') {
                          return (
                            <div key={feature} className="flex items-center gap-2">
                              {enabled ? (
                                <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                              ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                              )}
                              <span className={`text-sm ${enabled ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                                {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </span>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>

                    {/* Action Button */}
                    <PremiumButton
                      size="lg"
                      variant={isSelected ? 'primary' : 'secondary'}
                      disabled={isCurrentTier || !isPremium}
                      onClick={() => setSelectedTier(tierPlan.tier)}
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
            <PremiumCard className="max-w-2xl mx-auto p-8" glow>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Ready to upgrade?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Upgrade to {allPlans.find(p => p.tier === selectedTier)?.name} for just 
                <span className="font-bold text-purple-600 mx-2">
                  ${allPlans.find(p => p.tier === selectedTier)?.price}/month
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
                    {allPlans.map(tierPlan => (
                      <th key={tierPlan.tier} className="text-center py-4 px-4 text-gray-900 dark:text-white font-semibold">
                        {tierPlan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-600">Video Calls</td>
                    {allPlans.map(tierPlan => (
                      <td key={tierPlan.tier} className="text-center py-3 px-4">
                        {tierPlan.features.videoCalls ? (
                          <CheckIcon className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-600">Analytics Dashboard</td>
                    {allPlans.map(tierPlan => (
                      <td key={tierPlan.tier} className="text-center py-3 px-4">
                        {tierPlan.features.analytics ? (
                          <CheckIcon className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-600">Daily Swipes</td>
                    {allPlans.map(tierPlan => (
                      <td key={tierPlan.tier} className="text-center py-3 px-4 text-gray-900 dark:text-white font-semibold">
                        {tierPlan.limits.dailySwipes === -1 ? 'Unlimited' : tierPlan.limits.dailySwipes}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-600">API Access</td>
                    {allPlans.map(tierPlan => (
                      <td key={tierPlan.tier} className="text-center py-3 px-4">
                        {tierPlan.features.apiAccess ? (
                          <CheckIcon className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-gray-600">Concierge Service</td>
                    {allPlans.map(tierPlan => (
                      <td key={tierPlan.tier} className="text-center py-3 px-4">
                        {tierPlan.features.conciergeService ? (
                          <CheckIcon className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
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
