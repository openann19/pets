'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartIcon,
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  SparklesIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  StarIcon,
  BoltIcon,
  BeakerIcon,
  EyeIcon,
  CameraIcon,
} from '@heroicons/react/24/outline';
import { 
  PREMIUM_VARIANTS, 
  STAGGER_CONFIG,
  SPRING_CONFIG,
} from '../src/constants/animations';
import PremiumCard from '../src/components/UI/PremiumCard';
import PremiumButton from '../src/components/UI/PremiumButton';

export default function HomePage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Advanced mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const testimonials = [
    {
      name: 'Sarah Johnson',
      location: 'San Francisco, CA',
      text: 'Luna found her best friend through PawfectMatch! The AI matching is incredible - they play together every weekend now.',
      petName: 'Luna',
      petType: 'Golden Retriever',
      avatar: 'SJ',
      rating: 5,
    },
    {
      name: 'Mike Chen',
      location: 'Austin, TX',
      text: 'The compatibility analysis was spot-on! Max was matched with a dog that has the exact same energy level and personality.',
      petName: 'Max',
      petType: 'Border Collie', 
      avatar: 'MC',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      location: 'Miami, FL',
      text: 'We adopted Bella through PawfectMatch. The premium features and AI insights made the process seamless and perfect.',
      petName: 'Bella',
      petType: 'Rescue Mix',
      avatar: 'ER',
      rating: 5,
    },
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 6000);
    
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const enhancedFeatures = [
    {
      icon: BeakerIcon,
      title: 'AI-Powered Matching',
      description: 'Advanced machine learning algorithms analyze personality, breed compatibility, and behavioral patterns to find perfect matches.',
      variant: 'glass' as const,
      badge: '🤖 AI',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Real-Time Communication',
      description: 'Instant messaging with typing indicators, read receipts, and seamless photo sharing in premium glass morphism interface.',
      variant: 'gradient' as const,
      badge: '⚡ Live',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: CameraIcon,
      title: 'AI Photo Analysis',
      description: 'Computer vision technology analyzes pet photos to detect personality traits, health indicators, and compatibility factors.',
      variant: 'neon' as const,
      badge: '🔬 Vision',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: EyeIcon,
      title: 'Premium Analytics',
      description: 'Detailed insights into matching patterns, success rates, and personalized recommendations powered by advanced AI.',
      variant: 'holographic' as const,
      badge: '📊 Insights',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: MapPinIcon,
      title: 'Smart Location',
      description: 'Intelligent proximity matching with real-time activity tracking and safety-verified meetup locations.',
      variant: 'elevated' as const,
      badge: '📍 Smart',
      color: 'from-red-500 to-pink-500',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Premium Security',
      description: 'Enterprise-grade security with verified profiles, background checks, and advanced fraud detection algorithms.',
      variant: 'glass' as const,
      badge: '🛡️ Secure',
      color: 'from-indigo-500 to-purple-500',
    },
  ];


  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Interactive Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-64 h-64 rounded-full opacity-20"
            style={{
              background: `radial-gradient(circle, ${['#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'][i % 5]} 0%, transparent 70%)`,
              left: `${20 + i * 15}%`,
              top: `${10 + i * 20}%`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Premium Navigation */}
      <motion.nav
        className="bg-gray-950/90 backdrop-blur sticky top-0 z-50 border-b border-white/10"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={SPRING_CONFIG}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex justify-between items-center h-20">
            {/* Enhanced Logo */}
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              transition={SPRING_CONFIG}
            >
              <motion.div 
                className="text-3xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                🐾
              </motion.div>
              <span className="text-2xl font-extrabold text-white">
                PawfectMatch
              </span>
              <motion.div
                className="px-3 py-1 bg-yellow-400/90 text-yellow-900 rounded-full text-xs font-bold"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                PREMIUM
              </motion.div>
            </motion.div>

            {/* Enhanced Navigation Buttons */}
            <div className="flex items-center space-x-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/login">
                  <PremiumButton variant="ghost" size="md">
                    Login
                  </PremiumButton>
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/register">
                  <PremiumButton 
                    variant="glass" 
                    size="md"
                    glow
                    magneticEffect
                    icon={<StarIcon className="w-4 h-4" />}
                  >
                    Sign Up Free
                  </PremiumButton>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Jaw-Dropping Hero Section */}
      <section className="relative pt-32 pb-40 px-6 overflow-hidden">
        {/* Subtle solid background */}
        <div className="absolute inset-0 bg-gray-950" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            variants={PREMIUM_VARIANTS.fadeInUp}
            initial="initial"
            animate="animate"
            className="text-center mb-16"
          >
            {/* Premium Hero Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-6 py-3 glass-light rounded-full mb-8"
              animate={{ 
                boxShadow: [
                  "0 0 20px rgba(255, 255, 255, 0.3)",
                  "0 0 40px rgba(255, 255, 255, 0.5)",
                  "0 0 20px rgba(255, 255, 255, 0.3)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <BeakerIcon className="w-5 h-5 text-white" />
              <span className="text-white font-semibold">AI-Powered Pet Matching</span>
              <motion.div
                className="w-2 h-2 bg-green-400 rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>

            {/* Premium Hero Title */}
            <motion.h1 
              className="text-6xl md:text-8xl font-extrabold mb-8 relative"
              variants={PREMIUM_VARIANTS.fadeInUp}
              transition={{ delay: 0.2 }}
            >
              <span className="block text-white drop-shadow-2xl">
                Find Your Perfect
              </span>
              <span className="block text-white">Pet Match</span>
            </motion.h1>

            {/* Premium Subtitle */}
            <motion.p 
              className="text-xl md:text-2xl text-gray-200 max-w-4xl mx-auto mb-12 leading-relaxed"
              variants={PREMIUM_VARIANTS.fadeInUp}
              transition={{ delay: 0.4 }}
            >
              Revolutionary AI-powered platform that connects pets with their perfect companions.
              <br />
              <motion.span
                className="text-gray-300 font-semibold"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Advanced machine learning • Real-time matching • Premium experience
              </motion.span>
            </motion.p>

            {/* Premium CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              variants={PREMIUM_VARIANTS.fadeInUp}
              transition={{ delay: 0.6 }}
            >
              <Link href="/register">
                <PremiumButton 
                  variant="primary" 
                  size="lg"
                  glow
                  icon={<SparklesIcon className="w-5 h-5" />}
                >
                  Start Your Journey Free
                </PremiumButton>
              </Link>
              
              <Link href="#features">
                <PremiumButton 
                  variant="secondary" 
                  size="lg"
                  icon={<EyeIcon className="w-5 h-5" />}
                >
                  Explore Features
                </PremiumButton>
              </Link>
            </motion.div>

            {/* Premium Stats */}
            <motion.div
              className="mt-16 flex flex-wrap justify-center gap-8"
              variants={PREMIUM_VARIANTS.fadeInUp}
              transition={{ delay: 0.8 }}
            >
              {[
                { value: '10,000+', label: 'Happy Pets', icon: '🐕' },
                { value: '95%', label: 'Match Success', icon: '💕' },
                { value: '24/7', label: 'AI Support', icon: '🤖' },
                { value: '5★', label: 'User Rating', icon: '⭐' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                >
                  <div className="text-3xl font-bold text-white mb-1">
                    {stat.icon} {stat.value}
                  </div>
                  <div className="text-white/70 text-sm font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Premium Hero Visual */}
          <motion.div
            className="relative"
            variants={PREMIUM_VARIANTS.scaleIn}
            transition={{ delay: 1.2 }}
          >
            <PremiumCard variant="glass" glow tilt className="p-4 max-w-4xl mx-auto">
              <div className="relative overflow-hidden rounded-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1552053831-71594a27632d?w=1200&auto=format&fit=crop"
                  alt="Happy pets together"
                  width={1200}
                  height={600}
                  className="w-full h-[600px] object-cover"
                  priority
                  quality={95}
                />
                
                {/* Interactive Overlay */}
                <div className="absolute inset-0 bg-black/30" />
                
                {/* Floating Stats */}
                <motion.div
                  className="absolute top-6 right-6 glass-light p-4 rounded-2xl"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="text-white text-center">
                    <div className="text-2xl font-bold">98%</div>
                    <div className="text-xs opacity-80">Success Rate</div>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute bottom-6 left-6 glass-light p-4 rounded-2xl"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                >
                  <div className="text-white text-center">
                    <div className="text-2xl font-bold">🤖</div>
                    <div className="text-xs opacity-80">AI Powered</div>
                  </div>
                </motion.div>
              </div>
            </PremiumCard>
          </motion.div>
        </div>
      </section>

      {/* Premium Features Section */}
      <section id="features" className="py-32 relative">
        {/* Section Background */}
        <div className="absolute inset-0 bg-white" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Premium Section Header */}
          <motion.div 
            className="text-center mb-20"
            variants={PREMIUM_VARIANTS.fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.h2 
              className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6"
            >
              Revolutionary Features
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed"
              variants={PREMIUM_VARIANTS.fadeInUp}
              transition={{ delay: 0.2 }}
            >
              Experience the future of pet matching with our world-class AI technology, 
              premium glass morphism interface, and advanced analytics that create perfect connections.
            </motion.p>
          </motion.div>

          {/* Premium Features Grid */}
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={STAGGER_CONFIG}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
          >
            {enhancedFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={PREMIUM_VARIANTS.fadeInUp}
                transition={{ delay: index * 0.1 }}
              >
                <PremiumCard
                  variant={feature.variant}
                  hover
                  tilt
                  glow
                  className="p-8 group cursor-pointer h-full"
                  entrance="scaleIn"
                  delay={index * 0.05}
                >
                  <div className="relative">
                    {/* Premium Icon */}
                    <motion.div 
                      className={`w-16 h-16 rounded-2xl bg-gray-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                      whileHover={{ rotate: 10, scale: 1.2 }}
                      transition={SPRING_CONFIG}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </motion.div>

                    {/* Floating Badge */}
                    <motion.div
                      className="absolute -top-2 -right-2 bg-white/90 backdrop-blur text-gray-700 text-xs px-3 py-1 rounded-full shadow-lg font-bold"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0] 
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity,
                        delay: index * 0.5 
                      }}
                    >
                      {feature.badge}
                    </motion.div>

                    {/* Content */}
                    <h3 className={`text-2xl font-extrabold mb-4 text-gray-900 transition-all`}>
                      {feature.title}
                    </h3>
                    
                    <p className={`leading-relaxed text-gray-600`}>
                      {feature.description}
                    </p>

                    {/* Interactive Arrow */}
                    <motion.div
                      className={`mt-6 flex items-center text-sm font-semibold text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity`}
                      initial={{ x: -10 }}
                      animate={{ x: 0 }}
                      transition={SPRING_CONFIG}
                    >
                      <span>Learn More</span>
                      <motion.span
                        className="ml-2"
                        animate={{ x: [0, 6, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        →
                      </motion.span>
                    </motion.div>
                  </div>
                </PremiumCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Premium Testimonials Section */}
      <section className="py-32 relative overflow-hidden">
        {/* Solid Background */}
        <div className="absolute inset-0 bg-gray-50" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Premium Section Header */}
          <motion.div 
            className="text-center mb-20"
            variants={PREMIUM_VARIANTS.fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.h2 
              className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              Amazing Success Stories
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              variants={PREMIUM_VARIANTS.fadeInUp}
              transition={{ delay: 0.2 }}
            >
              Join thousands of pets who have found their perfect match through our AI-powered platform
            </motion.p>
          </motion.div>

          {/* Premium Testimonial Carousel */}
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, scale: 0.9, rotateY: 90 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.9, rotateY: -90 }}
                transition={SPRING_CONFIG}
              >
                <PremiumCard 
                  variant="glass" 
                  glow 
                  tilt 
                  className="p-12 text-center"
                >
                  {/* Rating Stars */}
                  <motion.div 
                    className="flex justify-center gap-1 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                      >
                        <StarIcon className="w-6 h-6 text-yellow-400 fill-current" />
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Testimonial Text */}
                  <motion.blockquote 
                    className="text-2xl text-gray-700 italic font-medium mb-8 leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    "{testimonials[currentTestimonial].text}"
                  </motion.blockquote>

                  {/* Premium Author Info */}
                  <motion.div 
                    className="flex items-center justify-center gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <motion.div 
                      className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-lg shadow-lg"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={SPRING_CONFIG}
                    >
                      {testimonials[currentTestimonial].avatar}
                    </motion.div>
                    <div className="text-left">
                      <p className="font-bold text-gray-900 text-lg">
                        {testimonials[currentTestimonial].name}
                      </p>
                      <p className="text-gray-600">
                        {testimonials[currentTestimonial].location}
                      </p>
                      <p className="text-sm text-purple-600 font-semibold">
                        {testimonials[currentTestimonial].petName} • {testimonials[currentTestimonial].petType}
                      </p>
                    </div>
                  </motion.div>
                </PremiumCard>
              </motion.div>
            </AnimatePresence>

            {/* Testimonial Navigation */}
            <motion.div 
              className="flex justify-center gap-3 mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentTestimonial 
                      ? 'bg-purple-500 scale-125' 
                      : 'bg-white/50 hover:bg-white/80'
                  }`}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Premium CTA Section */}
      <section className="py-40 relative overflow-hidden">
        {/* Solid Background */}
        <div className="absolute inset-0 bg-gray-950" />
        <div className="absolute inset-0 bg-black/30" />
        
        <div className="max-w-6xl mx-auto text-center px-6 relative z-10">
          <motion.div
            variants={PREMIUM_VARIANTS.fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {/* Premium CTA Badge */}
            <motion.div
              className="inline-flex items-center gap-3 px-8 py-4 glass-light rounded-full mb-12"
              animate={{ 
                scale: [1, 1.05, 1],
                boxShadow: [
                  "0 0 30px rgba(255, 255, 255, 0.3)",
                  "0 0 60px rgba(255, 255, 255, 0.5)",
                  "0 0 30px rgba(255, 255, 255, 0.3)"
                ]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <SparklesIcon className="w-6 h-6 text-white" />
              </motion.div>
              <span className="text-white font-bold text-lg">Limited Time: Free Premium Trial</span>
              <motion.div
                className="w-3 h-3 bg-green-400 rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>

            {/* Premium CTA Title */}
            <motion.h2 
              className="text-5xl md:text-7xl font-extrabold text-white mb-8 drop-shadow-2xl"
              variants={PREMIUM_VARIANTS.fadeInUp}
              transition={{ delay: 0.2 }}
            >
              Ready to Transform Your Pet's
              <span className="block text-white">Social Life? 🚀</span>
            </motion.h2>

            {/* Premium CTA Subtitle */}
            <motion.p 
              className="text-xl md:text-2xl text-white/90 mb-16 leading-relaxed max-w-4xl mx-auto"
              variants={PREMIUM_VARIANTS.fadeInUp}
              transition={{ delay: 0.4 }}
            >
              Join the revolution in pet matching. Experience AI-powered compatibility analysis,
              real-time chat with glass morphism interface, and premium features that create perfect connections.
            </motion.p>

            {/* Premium CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-8 justify-center items-center"
              variants={PREMIUM_VARIANTS.fadeInUp}
              transition={{ delay: 0.6 }}
            >
              <Link href="/register">
                <PremiumButton 
                  variant="primary" 
                  size="xl"
                  glow
                  magneticEffect
                  icon={<BoltIcon className="w-6 h-6" />}
                >
                  Start Matching Now - Free
                </PremiumButton>
              </Link>
              
              <Link href="/premium">
                <PremiumButton 
                  variant="secondary" 
                  size="xl"
                  glow
                  icon={<StarIcon className="w-6 h-6" />}
                >
                  See Premium Features
                </PremiumButton>
              </Link>
            </motion.div>

            {/* Premium Guarantee */}
            <motion.div
              className="mt-16 flex flex-wrap justify-center gap-6 text-white/80"
              variants={PREMIUM_VARIANTS.fadeInUp}
              transition={{ delay: 0.8 }}
            >
              {[
                '✅ Free Forever Plan',
                '🚀 Instant Setup',
                '💯 Money-Back Guarantee',
                '🔒 Privacy Protected',
              ].map((guarantee, index) => (
                <motion.div
                  key={guarantee}
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + index * 0.1 }}
                >
                  <span className="text-sm font-medium">{guarantee}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="relative bg-gray-900 text-white py-20 overflow-hidden">

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div 
            className="grid md:grid-cols-4 gap-12 mb-16"
            variants={STAGGER_CONFIG}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {/* Premium Brand Section */}
            <motion.div variants={PREMIUM_VARIANTS.fadeInUp}>
              <div className="flex items-center space-x-3 mb-6">
                <motion.div 
                  className="text-3xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  🐾
                </motion.div>
                <span className="text-2xl font-extrabold text-white">
                  PawfectMatch
                </span>
              </div>
              <p className="text-gray-300 leading-relaxed mb-6">
                Revolutionary AI-powered pet matching platform connecting furry friends worldwide since 2024.
              </p>
              <div className="flex gap-4">
                {['🌟', '🚀', '💎', '🏆'].map((emoji, index) => (
                  <motion.div
                    key={emoji}
                    className="w-10 h-10 glass-light rounded-full flex items-center justify-center"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={SPRING_CONFIG}
                    animate={{ 
                      y: [0, -5, 0],
                    }}
                    style={{
                      animationDelay: `${index * 0.5}s`,
                      animationDuration: '3s',
                      animationIterationCount: 'infinite',
                    }}
                  >
                    <span className="text-lg">{emoji}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Enhanced Footer Links */}
            {[
              {
                title: 'Product',
                links: [
                  { label: 'AI Features', href: '#features' },
                  { label: 'Premium Plans', href: '/premium' },
                  { label: 'Mobile App', href: '/mobile' },
                  { label: 'API Access', href: '/api' },
                ]
              },
              {
                title: 'Company',
                links: [
                  { label: 'About Us', href: '/about' },
                  { label: 'Careers', href: '/careers' },
                  { label: 'Press Kit', href: '/press' },
                  { label: 'Investors', href: '/investors' },
                ]
              },
              {
                title: 'Support',
                links: [
                  { label: 'Help Center', href: '/help' },
                  { label: 'Safety Guide', href: '/safety' },
                  { label: 'Contact Us', href: '/contact' },
                  { label: 'Status Page', href: '/system-status' },
                ]
              }
            ].map((section, sectionIndex) => (
              <motion.div 
                key={section.title}
                variants={PREMIUM_VARIANTS.fadeInUp}
                transition={{ delay: sectionIndex * 0.1 }}
              >
                <h3 className="font-bold text-lg mb-6 text-white">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <motion.li
                      key={link.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (sectionIndex * 0.1) + (linkIndex * 0.05) }}
                    >
                      <Link 
                        href={link.href}
                        className="text-gray-300 hover:text-white transition-colors font-semibold"
                      >
                        {link.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>

          {/* Premium Footer Bottom */}
          <motion.div 
            className="border-t border-gray-700 pt-12 text-center"
            variants={PREMIUM_VARIANTS.fadeInUp}
            transition={{ delay: 0.8 }}
          >
            <motion.p 
              className="text-gray-400 mb-4"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              &copy; 2024 PawfectMatch. All rights reserved. Made with ❤️ for pets worldwide.
            </motion.p>
            <div className="flex justify-center gap-6 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
              <Link href="/cookies" className="hover:text-gray-300 transition-colors">Cookie Policy</Link>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}