'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PremiumButton from '@/components/ui/PremiumButton';
import { SPRING_CONFIG } from '@/constants/animations';
import HoloLogo from '@/components/Brand/HoloLogo';
import ThemeToggle from '@/components/ThemeToggle';
import FluidGradient from '@/components/Background/FluidGradient';
import { GRADIENTS } from '@/constants/design-tokens';

export default function PremiumLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen text-white">
      {/* Ultra-smooth fluid gradient background */}
      <FluidGradient />

      {/* Light overlay for readability */}
      <div className="fixed inset-0 bg-white/5 pointer-events-none" />

      {/* Header matching Start Browsing button style exactly */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="relative mx-auto max-w-7xl px-6 py-4">
          <motion.div
            className="relative rounded-2xl border border-white/12 bg-transparent backdrop-blur text-white transform-gpu overflow-hidden"
            whileHover={{
              scale: 1.02,
              y: -2,
              rotateX: 2,
              transition: { type: 'spring', stiffness: 400, damping: 25 },
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Shimmer overlay for outline variant */}
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl animate-shimmer"
              style={{ opacity: 0.15 }}
            />
            <div className="relative">
              <div className="flex items-center justify-between px-4 py-3">
                <HoloLogo
                  size={44}
                  withText
                  monochrome
                />

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                  <Link
                    href="/browse"
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    Browse
                  </Link>
                  <Link
                    href="/matches"
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    Matches
                  </Link>
                  <Link
                    href="/dashboard"
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/map"
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    Map
                  </Link>
                  <Link
                    href="/premium"
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    Premium
                  </Link>
                </nav>

                <div className="flex items-center gap-3">
                  <ThemeToggle />
                  {/* Mobile menu button */}
                  <button
                    className="md:hidden text-white/80 hover:text-white transition-colors"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </button>

                  <Link
                    href="/register"
                    aria-label="Get Started"
                  >
                    <PremiumButton
                      variant="outline"
                      magneticEffect
                    >
                      Get Started
                    </PremiumButton>
                  </Link>
                </div>
              </div>

              {/* Mobile Navigation Menu */}
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="md:hidden border-t border-white/10 bg-black/20 backdrop-blur-md"
                >
                  <div className="px-4 py-3 space-y-2">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-white/80">Theme</span>
                      <ThemeToggle />
                    </div>
                    <div className="h-px w-full bg-white/10" />
                    <Link
                      href="/browse"
                      className="block text-white/80 hover:text-white transition-colors py-2"
                    >
                      Browse Pets
                    </Link>
                    <Link
                      href="/matches"
                      className="block text-white/80 hover:text-white transition-colors py-2"
                    >
                      My Matches
                    </Link>
                    <Link
                      href="/dashboard"
                      className="block text-white/80 hover:text-white transition-colors py-2"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/map"
                      className="block text-white/80 hover:text-white transition-colors py-2"
                    >
                      Pet Map
                    </Link>
                    <Link
                      href="/premium"
                      className="block text-white/80 hover:text-white transition-colors py-2"
                    >
                      Premium
                    </Link>
                    <Link
                      href="/ai/bio"
                      className="block text-white/80 hover:text-white transition-colors py-2"
                    >
                      AI Bio
                    </Link>
                    <Link
                      href="/ai/photo"
                      className="block text-white/80 hover:text-white transition-colors py-2"
                    >
                      AI Photo
                    </Link>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </header>

      {/* Center CTA over video */}
      <main className="relative z-40 flex min-h-screen items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={SPRING_CONFIG}
          className="text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING_CONFIG}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md mb-6 shadow-lg"
            whileHover={{ scale: 1.05, y: -2 }}
          >
            <motion.div
              className="w-2 h-2 rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ backgroundColor: '#22c55e' }} // Using success-500 from design tokens
            />
            <span className="text-sm text-gray-700 font-medium">Premium Pet Matching</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING_CONFIG}
            className="text-5xl md:text-7xl font-extrabold leading-[1.1] text-gray-800 drop-shadow-lg"
          >
            Find Your Pet&apos;s
            <span className="block text-transparent bg-clip-text" style={{ backgroundImage: GRADIENTS.mesh.sunset }}>
              Perfect Match
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING_CONFIG}
            className="mx-auto mt-4 max-w-2xl text-lg text-gray-600"
          >
            AI-powered compatibility, real-time chat, and ultra-premium experience — now with a
            cinematic backdrop.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING_CONFIG}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/register"
              aria-label="Create your profile"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                className="relative group"
              >
                <div className="absolute -inset-2 bg-gradient-to-r from-white/20 to-white/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                <PremiumButton
                  variant="primary"
                  magneticEffect
                  size="lg"
                  className="text-white relative z-10"
                >
                  Create Your Profile
                </PremiumButton>
              </motion.div>
            </Link>
            <Link
              href="/browse"
              aria-label="Start browsing"
            >
              <PremiumButton
                variant="outline"
                magneticEffect
                size="lg"
                className="text-white"
              >
                Start Browsing
              </PremiumButton>
            </Link>
          </motion.div>
        </motion.div>
      </main>

      {/* Holographic Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-50">
        <div className="relative mx-auto max-w-7xl px-6 py-4">
          <div className="relative rounded-2xl glass-dark border border-white/10 bg-black/20 backdrop-blur-md">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundImage: GRADIENTS.primary }}>
                  <span className="text-sm">🐾</span>
                </div>
                <span className="text-sm text-white/80">
                  © {new Date().getFullYear()} PawfectMatch
                </span>
              </div>
              <div className="text-sm text-white/70">Premium Experience</div>
            </div>
            <div className="h-px w-full opacity-50" style={{ backgroundImage: GRADIENTS.neon }} />
          </div>
        </div>
      </footer>
    </div>
  );
}
