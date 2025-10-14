import { useState, useEffect } from 'react';

export function useAria() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);
  const [prefersDarkMode, setPrefersDarkMode] = useState(false);
  const [prefersLightMode, setPrefersLightMode] = useState(false);
  const [prefersReducedTransparency, setPrefersReducedTransparency] = useState(false);
  
  useEffect(() => {
    // Check for reduced motion preference
    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionMediaQuery.matches);
    
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    motionMediaQuery.addEventListener('change', handleMotionChange);
    
    // Check for high contrast preference
    const contrastMediaQuery = window.matchMedia('(prefers-contrast: high)');
    setPrefersHighContrast(contrastMediaQuery.matches);
    
    const handleContrastChange = (e: MediaQueryListEvent) => {
      setPrefersHighContrast(e.matches);
    };
    
    contrastMediaQuery.addEventListener('change', handleContrastChange);
    
    // Check for dark mode preference
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setPrefersDarkMode(darkModeMediaQuery.matches);
    
    const handleDarkModeChange = (e: MediaQueryListEvent) => {
      setPrefersDarkMode(e.matches);
    };
    
    darkModeMediaQuery.addEventListener('change', handleDarkModeChange);
    
    // Check for light mode preference
    const lightModeMediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    setPrefersLightMode(lightModeMediaQuery.matches);
    
    const handleLightModeChange = (e: MediaQueryListEvent) => {
      setPrefersLightMode(e.matches);
    };
    
    lightModeMediaQuery.addEventListener('change', handleLightModeChange);
    
    // Check for reduced transparency preference
    const transparencyMediaQuery = window.matchMedia('(prefers-reduced-transparency: reduce)');
    setPrefersReducedTransparency(transparencyMediaQuery.matches);
    
    const handleTransparencyChange = (e: MediaQueryListEvent) => {
      setPrefersReducedTransparency(e.matches);
    };
    
    transparencyMediaQuery.addEventListener('change', handleTransparencyChange);
    
    return () => {
      motionMediaQuery.removeEventListener('change', handleMotionChange);
      contrastMediaQuery.removeEventListener('change', handleContrastChange);
      darkModeMediaQuery.removeEventListener('change', handleDarkModeChange);
      lightModeMediaQuery.removeEventListener('change', handleLightModeChange);
      transparencyMediaQuery.removeEventListener('change', handleTransparencyChange);
    };
  }, []);
  
  return {
    prefersReducedMotion,
    prefersHighContrast,
    prefersDarkMode,
    prefersLightMode,
    prefersReducedTransparency,
    getAriaProps: (description: string) => ({
      'aria-describedby': description,
      'aria-label': description
    })
  };
}

export default useAria;
