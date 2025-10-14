'use client';

import React, { useState } from 'react';
import { EnhancedFeaturesOverview } from '@/components/admin/EnhancedFeaturesOverview';
import { BiometricManagement } from '@/components/admin/BiometricManagement';
import { LeaderboardManagement } from '@/components/admin/LeaderboardManagement';
import { NotificationManagement } from '@/components/admin/NotificationManagement';

type Section = 'overview' | 'biometric' | 'leaderboard' | 'notifications';

export default function EnhancedFeaturesAdminPage() {
  const [currentSection, setCurrentSection] = useState<Section>('overview');

  const renderSection = () => {
    switch (currentSection) {
      case 'overview':
        return (
          <EnhancedFeaturesOverview
            onNavigate={(section) => setCurrentSection(section as Section)}
          />
        );
      case 'biometric':
        return <BiometricManagement onBack={() => setCurrentSection('overview')} />;
      case 'leaderboard':
        return <LeaderboardManagement onBack={() => setCurrentSection('overview')} />;
      case 'notifications':
        return <NotificationManagement onBack={() => setCurrentSection('overview')} />;
      default:
        return (
          <EnhancedFeaturesOverview
            onNavigate={(section) => setCurrentSection(section as Section)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{renderSection()}</div>
    </div>
  );
}
