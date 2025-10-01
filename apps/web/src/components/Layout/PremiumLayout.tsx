'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { SPRING_CONFIG } from '@/constants/animations';
import HoloLogo from '@/components/Brand/HoloLogo';
import PremiumButton from '@/components/UI/PremiumButton';
import ThemeToggle from '../ThemeToggle';

interface PremiumLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
}

const PremiumLayout: React.FC<PremiumLayoutProps> = ({
  children,
  showHeader = true,
  showFooter = false,
  className = '',
}) => {
  const videos = [
    '/media/landing-cat.mp4',
    '/media/landing-cat-2.mp4',
  ];
  const [activeIndex, setActiveIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [pinkFlash, setPinkFlash] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % videos.length);
    }, 12000);
    return () => clearInterval(intervalId);
  }, [videos.length]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const flashInterval = setInterval(() => {
      setPinkFlash(true);
      setTimeout(() => setPinkFlash(false), 200);
    }, 4000 + Math.random() * 2000);
    return () => clearInterval(flashInterval);
  }, []);

  return (
    <div className={`relative min-h-screen text-white ${className}`}>
      {/* Background videos (crossfade montage) */}
      <div className="fixed inset-0">
        {videos.map((src, i) => (
          <motion.video
            key={src}
            className="absolute inset-0 w-full h-full object-cover"
            src={src}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
            style={{ 
              filter: pinkFlash 
                ? 'brightness(1.05) contrast(1.12) saturate(1.18) hue-rotate(320deg) saturate(1.8)' 
                : 'brightness(1.05) contrast(1.12) saturate(1.18)',
              transition: 'filter 0.1s ease-out'
            }}
            initial={{ opacity: i === 0 ? 1 : 0 }}
            animate={{ opacity: activeIndex === i ? 1 : 0 }}
            transition={SPRING_CONFIG}
          />
        ))}
      </div>

      {/* Enhanced overlays with mouse interaction */}
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/50" />
      <motion.div 
        className="pointer-events-none fixed inset-0"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.06), transparent 70%)`
        }}
      />
      
      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="pointer-events-none fixed w-2 h-2 bg-white/20 rounded-full blur-sm"
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -100, 50, 0],
            opacity: [0.2, 0.6, 0.3, 0.2],
          }}
          transition={{
            duration: 20 + i * 5,
            repeat: Infinity,
            ease: "linear",
            delay: i * 3,
          }}
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + i * 10}%`,
          }}
        />
      ))}

      {/* Header */}
      {showHeader && (
        <header className="fixed top-0 left-0 right-0 z-50">
          <div className="relative mx-auto max-w-7xl px-6 py-4">
            <motion.div
              className="relative rounded-2xl border border-white/12 bg-transparent backdrop-blur text-white transform-gpu overflow-hidden"
              whileHover={{ 
                scale: 1.02,
                y: -2,
                rotateX: 2,
                transition: { type: "spring", stiffness: 400, damping: 25 }
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Shimmer overlay */}
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl animate-shimmer"
                style={{ opacity: 0.15 }}
              />
              <div className="relative">
                <div className="flex items-center justify-between px-4 py-3">
                  <Link href="/">
                    <HoloLogo size={44} withText monochrome />
                  </Link>
                  
                  {/* Desktop Navigation */}
                  <nav className="hidden md:flex items-center gap-6">
                    <Link href="/browse" className="text-white/80 hover:text-white transition-colors">Browse</Link>
                    <Link href="/matches" className="text-white/80 hover:text-white transition-colors">Matches</Link>
                    <Link href="/dashboard" className="text-white/80 hover:text-white transition-colors">Dashboard</Link>
                    <Link href="/map" className="text-white/80 hover:text-white transition-colors">Map</Link>
                    <Link href="/premium" className="text-white/80 hover:text-white transition-colors">Premium</Link>
                  </nav>

                  {/* Right actions */}
                  <div className="hidden md:flex items-center gap-3">
                    <div className="relative z-50"><ThemeToggle /></div>
                    <Link href="/register" aria-label="Get Started">
                      <PremiumButton variant="outline" magneticEffect>
                        Get Started
                      </PremiumButton>
                    </Link>
                  </div>

                  {/* Mobile actions */}
                  <div className="flex md:hidden items-center gap-3">
                    <div className="relative z-50"><ThemeToggle /></div>
                    <button
                      className="text-white/80 hover:text-white transition-colors"
                      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                      aria-label="Toggle menu"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                    <Link href="/register" aria-label="Get Started">
                      <PremiumButton variant="outline" magneticEffect>
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
                      <Link href="/browse" className="block text-white/80 hover:text-white transition-colors py-2">Browse Pets</Link>
                      <Link href="/matches" className="block text-white/80 hover:text-white transition-colors py-2">My Matches</Link>
                      <Link href="/dashboard" className="block text-white/80 hover:text-white transition-colors py-2">Dashboard</Link>
                      <Link href="/map" className="block text-white/80 hover:text-white transition-colors py-2">Pet Map</Link>
                      <Link href="/premium" className="block text-white/80 hover:text-white transition-colors py-2">Premium</Link>
                      <Link href="/ai/bio" className="block text-white/80 hover:text-white transition-colors py-2">AI Bio</Link>
                      <Link href="/ai/photo" className="block text-white/80 hover:text-white transition-colors py-2">AI Photo</Link>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={`relative z-40 ${showHeader ? 'pt-24' : ''}`}>
        {children}
      </main>

      {/* Footer */}
      {showFooter && (
        <footer className="fixed bottom-0 left-0 right-0 z-50">
          <div className="relative mx-auto max-w-7xl px-6 py-4">
            <div className="relative rounded-2xl glass-dark border border-white/10 bg-black/20 backdrop-blur-md">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center">
                    <span className="text-sm">💖</span>
                  </div>
                  <span className="text-sm text-white/80">© {new Date().getFullYear()} Paws</span>
                </div>
                <div className="text-sm text-white/70">Premium Experience</div>
              </div>
              <div className="h-px w-full bg-gradient-to-r from-violet-400/70 via-sky-400/70 to-fuchsia-400/70 opacity-50" />
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default PremiumLayout;
