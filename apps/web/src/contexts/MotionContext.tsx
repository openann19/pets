'use client';

import { LazyMotion, domAnimation } from 'framer-motion';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface MotionContextType {
  reducedMotion: boolean;
}

const MotionContext = createContext<MotionContextType | undefined>(undefined);

export function useMotion(): MotionContextType {
  const context = useContext(MotionContext);
  if (context === undefined) {
    throw new Error('useMotion must be used within a MotionProvider');
  }
  return context;
}

interface MotionProviderProps {
  children: ReactNode;
}

export function MotionProvider({ children }: MotionProviderProps): React.JSX.Element {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const value: MotionContextType = {
    reducedMotion,
  };

  return (
    <MotionContext.Provider value={value}>
      <LazyMotion features={domAnimation} strict>
        {children}
      </LazyMotion>
    </MotionContext.Provider>
  );
}
