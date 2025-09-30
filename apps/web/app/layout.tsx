import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import PageTransition from '@/components/Layout/PageTransition';

const inter = Inter({
  subsets: ['latin'], // Optimized subset for perf
  variable: '--font-inter', // Allow variable font usage in CSS
  display: 'swap', // Fallback during load
});

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-inter min-h-screen bg-gray-50 text-gray-900`}
        role="document"
        suppressHydrationWarning
      >
        <Providers>
          <main role="main">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
        </Providers>
      </body>
    </html>
  );
}