'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { showInstallPrompt, canInstall } from '../../utils/pwa';

export const InstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Listen for installable event
    const handleInstallable = () => {
      if (canInstall()) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('pwa-installable', handleInstallable);

    return () => {
      window.removeEventListener('pwa-installable', handleInstallable);
    };
  }, []);

  const handleInstall = async () => {
    const accepted = await showInstallPrompt();
    if (accepted) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setIsDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showPrompt || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🐾</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Install PawfectMatch</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Get the app experience</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Dismiss"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <ul className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-center">
            <span className="mr-2">✓</span>
            Works offline
          </li>
          <li className="flex items-center">
            <span className="mr-2">✓</span>
            Faster loading
          </li>
          <li className="flex items-center">
            <span className="mr-2">✓</span>
            Push notifications
          </li>
        </ul>

        <button
          onClick={handleInstall}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center space-x-2"
        >
          <ArrowDownTrayIcon className="w-5 h-5" />
          <span>Install App</span>
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;
