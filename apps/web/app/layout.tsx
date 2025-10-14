// import ThemeToggle from '@/components/ThemeToggle';
import KeyboardShortcutsOverlay from '@/components/KeyboardShortcuts/KeyboardShortcutsOverlay';
import PWAInitializer from '@/components/PWA/PWAInitializer';
import type { Metadata } from 'next';
import ErrorBoundary from '../src/components/ErrorBoundary';
import { ThemeScript } from '../src/contexts/ThemeContext';
import './globals.css';
import { Providers } from './providers';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: {
    default: 'PawfectMatch - Find Your Perfect Pet',
    template: '%s | PawfectMatch', // Dynamic page titles
  },
  description: 'Connect with your ideal pet companion through AI-powered matching',
  keywords: ['pet adoption', 'pet matching', 'dogs', 'cats', 'pets', 'adoption', 'AI pets'], // Expanded for better SEO
  authors: [{ name: 'PawfectMatch Team' }],
  creator: 'PawfectMatch',
  publisher: 'PawfectMatch',
  manifest: '/manifest.json', // PWA manifest
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: 'index, follow', // SEO: Allow crawling
  openGraph: {
    title: 'PawfectMatch - Find Your Perfect Pet',
    description: 'Connect with your ideal pet companion through AI-powered matching',
    url: 'https://pawfectmatch.com',
    siteName: 'PawfectMatch',
    images: [
      {
        url: 'https://pawfectmatch.com/og-image.jpg', // Assume static asset; optimize for 1200x630
        width: 1200,
        height: 630,
        alt: 'PawfectMatch Logo with Pets',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PawfectMatch - Find Your Perfect Pet',
    description: 'Connect with your ideal pet companion through AI-powered matching',
    images: ['https://pawfectmatch.com/twitter-image.jpg'], // Separate for Twitter optimization
  },
  alternates: {
    canonical: 'https://pawfectmatch.com', // SEO: Canonical URL
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PawfectMatch',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <head>
        {/* Prevent flash of unstyled content (FOUC) for theme */}
        <ThemeScript />
      </head>
      <body
        className="min-h-screen bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-gray-100"
        role="document"
        suppressHydrationWarning
      >
        <ErrorBoundary>
          <Providers>
            {/* Initialize PWA features */}
            <PWAInitializer />

            {/* Global Keyboard Shortcuts Overlay (Press '?' to show) */}
            <KeyboardShortcutsOverlay />

            <main role="main">{children}</main>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
