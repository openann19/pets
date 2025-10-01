'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EnvelopeIcon, LockClosedIcon, SparklesIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../src/hooks/api-hooks';
import PremiumButton from '../../../src/components/UI/PremiumButton';
import PremiumLayout from '../../../src/components/Layout/PremiumLayout';
import PremiumCard from '../../../src/components/UI/PremiumCard';
import HoloLogo from '../../../src/components/Brand/HoloLogo';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  // const router = useRouter(); // TODO: Add navigation after login
  const { login, isLoading, error } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    login({ email: data.email, password: data.password });
  };

  return (
    <PremiumLayout showHeader={false}>
      <div className="flex items-center justify-center min-h-screen px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-md w-full space-y-8"
        >
          {/* Logo and Header */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Link href="/" className="inline-flex justify-center items-center mb-8">
              <HoloLogo size={60} withText monochrome />
            </Link>
            <h2 className="text-4xl font-extrabold mb-3">
              <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">Welcome back!</span>
            </h2>
            <p className="text-base text-white/70">
              Don't have an account?{' '}
              <Link href="/register" className="font-semibold text-white hover:text-white/80 transition-colors underline">
                Sign up
              </Link>
            </p>
          </motion.div>

          {/* Main Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <PremiumCard variant="glass" className="p-8 space-y-6">
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence>
              {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-500/20 border border-red-500/30 text-red-200 p-4 rounded-xl text-sm font-medium flex items-center gap-2 backdrop-blur-md"
                  >
                    <ShieldCheckIcon className="h-5 w-5" />
                    {error?.message || 'Login failed'}
                  </motion.div>
              )}
            </AnimatePresence>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-white/90 mb-2">
                    Email address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                      <EnvelopeIcon className="h-5 w-5 text-white/60 group-focus-within:text-white/80" />
                    </div>
                    <input
                      {...register('email')}
                      type="email"
                      autoComplete="email"
                      className="appearance-none relative block w-full pl-12 pr-4 py-3.5 border border-white/20 placeholder-white/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all bg-white/10 backdrop-blur-sm hover:border-white/30"
                      placeholder="your@email.com"
                    />
                  </div>
              <AnimatePresence>
                {errors.email && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-2 text-sm text-red-300 flex items-center gap-1"
                    >
                      {errors.email.message}
                    </motion.p>
                )}
              </AnimatePresence>
            </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-white/90 mb-2">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                      <LockClosedIcon className="h-5 w-5 text-white/60 group-focus-within:text-white/80" />
                    </div>
                    <input
                      {...register('password')}
                      type="password"
                      autoComplete="current-password"
                      className="appearance-none relative block w-full pl-12 pr-4 py-3.5 border border-white/20 placeholder-white/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all bg-white/10 backdrop-blur-sm hover:border-white/30"
                      placeholder="Enter your password"
                    />
                  </div>
              <AnimatePresence>
                {errors.password && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-2 text-sm text-red-300 flex items-center gap-1"
                    >
                      {errors.password.message}
                    </motion.p>
                  )}
                </AnimatePresence>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-white focus:ring-white/30 border-white/30 bg-white/10 rounded cursor-pointer"
                    />
                    <label htmlFor="remember-me" className="ml-3 block text-sm text-white/80 font-medium cursor-pointer">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link href="/forgot-password" className="font-semibold text-white/80 hover:text-white transition-colors underline">
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <PremiumButton
                  variant="ghost"
                  size="lg"
                  disabled={isLoading}
                  loading={isLoading}
                  onClick={handleSubmit(onSubmit)}
                  className="w-full"
                  icon={<SparklesIcon className="h-5 w-5" />}
                >
                  Sign in
                </PremiumButton>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white/10 text-white/70 font-medium backdrop-blur-md rounded-full">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <PremiumButton
                    variant="outline"
                    className="w-full"
                    icon={
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 0C4.477 0 0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.879V12.89h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.989C16.343 19.129 20 14.99 20 10c0-5.523-4.477-10-10-10z"/>
                      </svg>
                    }
                  >
                    Facebook
                  </PremiumButton>

                  <PremiumButton
                    variant="outline"
                    className="w-full"
                    icon={
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"/>
                      </svg>
                    }
                  >
                    GitHub
                  </PremiumButton>
                </div>
              </form>
            </PremiumCard>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-6 text-sm text-white/70"
          >
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="h-5 w-5 text-emerald-400" />
              <span>Secure Login</span>
            </div>
            <div className="flex items-center gap-2">
              <SparklesIcon className="h-5 w-5 text-violet-400" />
              <span>AI-Powered</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </PremiumLayout>
  );
}
