'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { 
  useMobileAccessibility, 
  useKeyboardNavigation, 
  useScreenReaderAnnouncements, 
  useVoiceControl,
  accessibilityUtils 
} from '@/utils/mobile-accessibility';

interface AccessibilityContextType {
  isScreenReaderActive: boolean;
  isKeyboardNavigationActive: boolean;
  isVoiceControlActive: boolean;
  isHighContrastMode: boolean;
  isReducedMotionMode: boolean;
  isLargeTextMode: boolean;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  announcePageChange: (pageTitle: string) => void;
  announceError: (errorMessage: string) => void;
  announceSuccess: (successMessage: string) => void;
  announceLoading: (loadingMessage: string) => void;
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  clearTranscript: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

interface AccessibilityProviderProps {
  children: React.ReactNode;
  enableScreenReader?: boolean;
  enableKeyboardNavigation?: boolean;
  enableVoiceControl?: boolean;
  enableHighContrast?: boolean;
  enableReducedMotion?: boolean;
  enableLargeText?: boolean;
}

export function AccessibilityProvider({ 
  children, 
  enableScreenReader = true,
  enableKeyboardNavigation = true,
  enableVoiceControl = true,
  enableHighContrast = true,
  enableReducedMotion = true,
  enableLargeText = true,
}: AccessibilityProviderProps) {
  const { state } = useMobileAccessibility({
    enableScreenReader,
    enableKeyboardNavigation,
    enableVoiceControl,
    enableHighContrast,
    enableReducedMotion,
    enableLargeText,
  });

  useKeyboardNavigation();
  const screenReader = useScreenReaderAnnouncements();
  const voiceControl = useVoiceControl();

  // Initialize accessibility enhancements
  useEffect(() => {
    // Add skip links
    accessibilityUtils.addSkipLinks();
    
    // Enhance focus indicators
    accessibilityUtils.enhanceFocusIndicators();
    
    // Add high contrast support
    if (enableHighContrast) {
      accessibilityUtils.addHighContrastSupport();
    }
    
    // Add reduced motion support
    if (enableReducedMotion) {
      accessibilityUtils.addReducedMotionSupport();
    }
    
    // Add large text support
    if (enableLargeText) {
      accessibilityUtils.addLargeTextSupport();
    }
  }, [enableHighContrast, enableReducedMotion, enableLargeText]);

  const contextValue: AccessibilityContextType = {
    isScreenReaderActive: state.isScreenReaderActive,
    isKeyboardNavigationActive: state.isKeyboardNavigationActive,
    isVoiceControlActive: state.isVoiceControlActive,
    isHighContrastMode: state.isHighContrastMode,
    isReducedMotionMode: state.isReducedMotionMode,
    isLargeTextMode: state.isLargeTextMode,
    announce: screenReader.announce,
    announcePageChange: screenReader.announcePageChange,
    announceError: screenReader.announceError,
    announceSuccess: screenReader.announceSuccess,
    announceLoading: screenReader.announceLoading,
    isListening: voiceControl.isListening,
    transcript: voiceControl.transcript,
    startListening: voiceControl.startListening,
    stopListening: voiceControl.stopListening,
    clearTranscript: voiceControl.clearTranscript,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  );
}

/**
 * Accessibility Status Indicator Component
 */
export function AccessibilityStatusIndicator() {
  const {
    isScreenReaderActive,
    isKeyboardNavigationActive,
    isVoiceControlActive,
    isHighContrastMode,
    isReducedMotionMode,
    isLargeTextMode,
  } = useAccessibility();

  const activeFeatures = [
    isScreenReaderActive && 'Screen Reader',
    isKeyboardNavigationActive && 'Keyboard Navigation',
    isVoiceControlActive && 'Voice Control',
    isHighContrastMode && 'High Contrast',
    isReducedMotionMode && 'Reduced Motion',
    isLargeTextMode && 'Large Text',
  ].filter(Boolean);

  if (activeFeatures.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black/80 text-white px-3 py-2 rounded-lg text-xs">
      <div className="flex items-center space-x-2">
        <span className="text-green-400">♿</span>
        <span>Accessibility: {activeFeatures.join(', ')}</span>
      </div>
    </div>
  );
}

/**
 * Voice Control Interface Component
 */
export function VoiceControlInterface() {
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    clearTranscript,
  } = useAccessibility();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Voice Control
          </h3>
          <button
            onClick={isListening ? stopListening : startListening}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
            aria-label={isListening ? 'Stop listening' : 'Start listening'}
          >
            {isListening ? '⏹' : '🎤'}
          </button>
        </div>
        
        {isListening && (
          <div className="mb-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>Listening...</span>
            </div>
          </div>
        )}
        
        {transcript && (
          <div className="mb-3">
            <p className="text-sm text-gray-900 dark:text-white mb-2">
              <strong>Transcript:</strong>
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-2 rounded">
              {transcript}
            </p>
            <button
              onClick={clearTranscript}
              className="mt-2 text-xs text-blue-500 hover:text-blue-600"
            >
              Clear
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Keyboard Navigation Helper Component
 */
export function KeyboardNavigationHelper() {
  const { isKeyboardNavigationActive } = useAccessibility();

  if (!isKeyboardNavigationActive) return null;

  return (
    <div className="fixed top-4 left-4 z-50 bg-blue-500 text-white px-3 py-2 rounded-lg text-xs">
      <div className="flex items-center space-x-2">
        <span>⌨️</span>
        <span>Use arrow keys to navigate</span>
      </div>
    </div>
  );
}

/**
 * Accessibility Settings Panel Component
 */
export function AccessibilitySettingsPanel() {
  const [isOpen, setIsOpen] = React.useState(false);
  const {
    isHighContrastMode,
    isReducedMotionMode,
    isLargeTextMode,
  } = useAccessibility();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-50 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        aria-label="Open accessibility settings"
      >
        ♿
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Accessibility Settings
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Close settings"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-900 dark:text-white">High Contrast Mode</span>
                <span className={`text-sm ${isHighContrastMode ? 'text-green-500' : 'text-gray-500'}`}>
                  {isHighContrastMode ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-900 dark:text-white">Reduced Motion</span>
                <span className={`text-sm ${isReducedMotionMode ? 'text-green-500' : 'text-gray-500'}`}>
                  {isReducedMotionMode ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-900 dark:text-white">Large Text</span>
                <span className={`text-sm ${isLargeTextMode ? 'text-green-500' : 'text-gray-500'}`}>
                  {isLargeTextMode ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                These settings are automatically detected from your system preferences.
                To change them, please update your device or browser settings.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
