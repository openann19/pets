'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { AnalyticsProvider } from '../src/contexts/AnalyticsContext';
import { AccessibilityProvider } from '../src/contexts/AccessibilityContext';
import { AuthProvider } from '../src/components/providers/AuthProvider';
import { MotionProvider } from '../src/contexts/MotionContext';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { DevTools } from '../src/components/DevTools';
import { ToastProvider } from '../src/components/ui/toast';

// Create query client per request to avoid sharing state between users
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes
            retry: 2,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MotionProvider>
          <AccessibilityProvider>
            <AnalyticsProvider>
              <ToastProvider>
                <AuthProvider>{children}</AuthProvider>
                <DevTools />
              </ToastProvider>
            </AnalyticsProvider>
          </AccessibilityProvider>
        </MotionProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
