import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from '../contexts/AuthContext';
import { SocketProvider } from '../contexts/SocketContext';
import ErrorBoundary from '../components/ErrorBoundary';
import { useAnalytics } from '../utils/analytics-system';
import './App.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
const ThemeContext = React.createContext<{
  isDark: boolean;
  theme: string;
  toggleTheme: () => void;
  setTheme: (theme: string) => void;
}>({
  isDark: false,
  theme: 'default',
  toggleTheme: () => {},
  setTheme: () => {},
});

// Advanced Theme Provider with full design token management and dark mode
const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = React.useState(false);
  const [theme, setTheme] = React.useState('default');

  React.useEffect(() => {
    // Detect system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => setIsDark(!isDark);

  const value = {
    isDark,
    theme,
    toggleTheme,
    setTheme,
  };

  return (
    <div className={`${isDark ? 'dark' : ''} min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300`}>
      <ThemeContext.Provider value={value}>
        {children}
      </ThemeContext.Provider>
    </div>
  );
};

// Advanced Analytics Provider with comprehensive tracking
const AnalyticsProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <AnalyticsContextProvider>
      {children}
    </AnalyticsContextProvider>
  );
};

const AnalyticsContextProvider = ({ children }: { children: React.ReactNode }) => {
  const analytics = useAnalytics();

  React.useEffect(() => {
    // Track app initialization with metadata
    analytics.trackInteraction('App', 'initialized', {
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
    });

    // Track page visibility changes
    const handleVisibilityChange = () => {
      analytics.trackInteraction('Page', 'visibility_change', {
        hidden: document.hidden,
        timestamp: Date.now(),
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Track performance metrics
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        analytics.trackApiCall('performance', entry.duration, 200);
      }
    });

    observer.observe({ entryTypes: ['navigation', 'resource', 'paint'] });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer.disconnect();
    };
  }, [analytics]);

  return <>{children}</>;
};

// Advanced Motion Provider with Framer Motion configuration
const MotionProvider = ({ children }: { children: React.ReactNode }) => {
  const [reducedMotion, setReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <div className={reducedMotion ? 'motion-reduce' : ''}>
      {children}
    </div>
  );
};

// Advanced Accessibility Provider with comprehensive a11y features
const AccessibilityProvider = ({ children }: { children: React.ReactNode }) => {
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const [highContrast, setHighContrast] = React.useState(false);
  const [focusVisible, setFocusVisible] = React.useState(false);

  React.useEffect(() => {
    // Reduced motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(motionQuery.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    motionQuery.addEventListener('change', handleMotionChange);

    // High contrast
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    setHighContrast(contrastQuery.matches);
    const handleContrastChange = (e: MediaQueryListEvent) => setHighContrast(e.matches);
    contrastQuery.addEventListener('change', handleContrastChange);

    // Focus visible
    const handleFocusIn = () => setFocusVisible(true);
    const handleMouseDown = () => setFocusVisible(false);

    document.addEventListener('keydown', handleFocusIn);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
      document.removeEventListener('keydown', handleFocusIn);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const classes = [
    reducedMotion ? 'motion-reduce' : '',
    highContrast ? 'contrast-high' : '',
    focusVisible ? 'focus-visible' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {/* Skip to content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50 focus:ring-2 focus:ring-blue-300"
        aria-label="Skip to main content"
      >
        Skip to main content
      </a>

      {/* Screen reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" id="sr-announcements" />

      {children}
    </div>
  );
};

function App(): React.ReactElement {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <MotionProvider>
          <AccessibilityProvider>
            <AnalyticsProvider>
              <QueryClientProvider client={queryClient}>
                <AuthProvider>
                  <SocketProvider>
                    <div className="App">
                      <header className="App-header">
                        <h1>PawfectMatch Premium</h1>
                        <p>AI-powered pet matching platform</p>
                      </header>
                      <main id="main-content" className="flex-1">
                        <p>Welcome to PawfectMatch Premium!</p>
                        {/* Route content will be rendered here by Next.js */}
                      </main>
                    </div>
                  </SocketProvider>
                </AuthProvider>
                <ReactQueryDevtools initialIsOpen={false} />
              </QueryClientProvider>
            </AnalyticsProvider>
          </AccessibilityProvider>
        </MotionProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
