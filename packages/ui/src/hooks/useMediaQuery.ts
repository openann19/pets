import { useState, useEffect } from 'react';

/**
 * A hook that returns true if the media query matches
 * @param query The media query to check
 * @returns boolean Whether the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    // Check for browser environment
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }
    
    const mediaQuery = window.matchMedia(query);
    
    // Set initial match
    setMatches(mediaQuery.matches);
    
    // Create event listener function
    const handleMatch = (event: MediaQueryListEvent): void => {
      setMatches(event.matches);
    };
    
    // Modern browsers support addEventListener
    mediaQuery.addEventListener('change', handleMatch);
    
    return () => {
      mediaQuery.removeEventListener('change', handleMatch);
    };
  }, [query]);
  
  return matches;
}

/**
 * A hook that returns true if the user prefers reduced motion
 * @returns boolean Whether the user prefers reduced motion
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/**
 * A hook that returns true if the user prefers dark color scheme
 * @returns boolean Whether the user prefers dark mode
 */
export function usePrefersDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)');
}

export default useMediaQuery;
