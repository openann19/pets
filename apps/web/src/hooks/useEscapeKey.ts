/**
 * useEscapeKey Hook
 * 
 * Universal hook for implementing escape-key-to-close pattern
 */

import { useEffect } from 'react';

export function useEscapeKey(
  handler: (event: KeyboardEvent) => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const listener = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Esc') {
        handler(event);
      }
    };

    document.addEventListener('keydown', listener);

    return () => {
      document.removeEventListener('keydown', listener);
    };
  }, [handler, enabled]);
}

