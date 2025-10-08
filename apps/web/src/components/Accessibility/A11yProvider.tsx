'use client';

import { useEffect } from 'react';

interface A11yProviderProps {
  children: React.ReactNode;
}

export default function A11yProvider({ children }: A11yProviderProps) {
  useEffect(() => {
    // Add focus visible class for keyboard navigation
    const handleFirstTab = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        document.body.classList.add('user-is-tabbing');
        window.removeEventListener('keydown', handleFirstTab);
        window.addEventListener('mousedown', handleMouseDown);
      }
    };

    const handleMouseDown = () => {
      document.body.classList.remove('user-is-tabbing');
      window.removeEventListener('mousedown', handleMouseDown);
      window.addEventListener('keydown', handleFirstTab);
    };

    window.addEventListener('keydown', handleFirstTab);

    // Announce route changes for screen readers
    const announceRouteChange = () => {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = 'Page navigation occurred';
      document.body.appendChild(announcement);
      
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    };

    // Listen for route changes
    const handleRouteChange = () => {
      announceRouteChange();
    };

    window.addEventListener('popstate', handleRouteChange);

    // Add ARIA landmarks if missing
    const main = document.querySelector('main');
    if (main && !main.hasAttribute('role')) {
      main.setAttribute('role', 'main');
      main.setAttribute('id', 'main-content');
    }

    const nav = document.querySelector('nav');
    if (nav && !nav.hasAttribute('role')) {
      nav.setAttribute('role', 'navigation');
      nav.setAttribute('aria-label', 'Main navigation');
    }

    return () => {
      window.removeEventListener('keydown', handleFirstTab);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return (
    <>
      <style jsx global>{`
        .user-is-tabbing *:focus {
          outline: 2px solid var(--primary-500, #ec4899);
          outline-offset: 2px;
        }
        
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
        
        .not-sr-only {
          position: static;
          width: auto;
          height: auto;
          padding: 0;
          margin: 0;
          overflow: visible;
          clip: auto;
          white-space: normal;
        }
      `}</style>
      {children}
    </>
  );
}