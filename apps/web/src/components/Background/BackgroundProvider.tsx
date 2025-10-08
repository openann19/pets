'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext } from 'react';

import FluidGradient from './FluidGradient';

interface BackgroundContextType {
  isActive: boolean;
}

const BackgroundContext = createContext<BackgroundContextType>({ isActive: true });

export const useBackground = () => useContext(BackgroundContext);

interface BackgroundProviderProps {
  children: ReactNode;
}

/**
 * Global Background Provider
 * Provides the Three.js FluidGradient background across the entire app
 */
export default function BackgroundProvider({ children }: BackgroundProviderProps) {
  return (
    <BackgroundContext.Provider value={{ isActive: true }}>
      {/* Global Three.js Fluid Gradient Background */}
      <FluidGradient />
      
      {/* Light overlay for better readability */}
      <div className="fixed inset-0 bg-black/5 pointer-events-none z-0" />
      
      {/* App content */}
      <div className="relative z-10">
        {children}
      </div>
    </BackgroundContext.Provider>
  );
}
