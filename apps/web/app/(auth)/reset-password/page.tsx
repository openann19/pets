'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LockClosedIcon, CheckCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import PremiumButton from '@/components/UI/PremiumButton';
import apiClient from '@/lib/api-client';
import PremiumLayout from '@/components/Layout/PremiumLayout';
import HoloLogo from '@/components/Brand/HoloLogo';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token');
    }
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('Invalid or missing reset token');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.resetPassword(token, data.password);
      
      if (response.success) {
        setIsSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(response.error || 'Failed to reset password');
      }
    } catch (err: any) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PremiumLayout showHeader={false}>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-md w-full space-y-8 relative z-10"
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
          
          {!isSuccess ? (
            <>
              <h2 className="text-4xl font-extrabold mb-3">
                <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">Reset Password</span>
              </h2>
              <p className="text-base text-white/70">
                Enter your new password below.
              </p>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <CheckCircleIcon className="h-16 w-16 text-green-500" />
              </div>
              <h2 className="text-4xl font-extrabold mb-3">
                <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">Password Reset Successful!</span>
              </h2>
              <p className="text-base text-white/70">
                Redirecting you to login...
              </p>
            </>
          )}
        </motion.div>

        {/* Main Form Card */}
        {!isSuccess ? (
          <motion.form 
            className="space-y-6" 
            onSubmit={handleSubmit(onSubmit)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="glass-light p-8 rounded-3xl shadow-2xl space-y-6 border border-white/20">
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium flex items-center gap-2"
                  >
                    <ShieldCheckIcon className="h-5 w-5" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-white/90 mb-2">
                  New Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                    <LockClosedIcon className="h-5 w-5 text-white/60 group-focus-within:text-white/80" />
                  </div>
                  <input
                    {...register('password')}
                    type="password"
                    autoComplete="new-password"
                    className="appearance-none relative block w-full pl-12 pr-4 py-3.5 border border-white/20 placeholder-white/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all bg-white/10 backdrop-blur-sm hover:border-white/30"
                    placeholder="Enter new password"
                  />
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-2 text-sm text-red-300"
                    >
                      {errors.password.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-white/90 mb-2">
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                    <LockClosedIcon className="h-5 w-5 text-white/60 group-focus-within:text-white/80" />
                  </div>
                  <input
                    {...register('confirmPassword')}
                    type="password"
                    autoComplete="new-password"
                    className="appearance-none relative block w-full pl-12 pr-4 py-3.5 border border-white/20 placeholder-white/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all bg-white/10 backdrop-blur-sm hover:border-white/30"
                    placeholder="Confirm new password"
                  />
                </div>
                <AnimatePresence>
                  {errors.confirmPassword && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-2 text-sm text-red-300"
                    >
                      {errors.confirmPassword.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <PremiumButton
                size="lg"
                disabled={isLoading || !token}
                loading={isLoading}
                onClick={handleSubmit(onSubmit)}
                className="w-full shadow-xl hover:shadow-2xl"
              >
                <span className="flex items-center justify-center gap-2">
                  <LockClosedIcon className="h-5 w-5" />
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </span>
              </PremiumButton>

              <div className="text-center">
                <Link 
                  href="/login" 
                  className="text-sm font-semibold text-white/80 hover:text-white transition-colors underline"
                >
                  Back to login
                </Link>
              </div>
            </div>
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl space-y-6 border border-white/20"
          >
            <div className="space-y-4 text-center">
              <p className="text-white/80">
                Your password has been successfully reset.
              </p>
              <p className="text-sm text-white/70">
                You can now log in with your new password.
              </p>
            </div>

            <Link href="/login" className="block">
              <PremiumButton
                size="lg"
                className="w-full"
              >
                Go to Login
              </PremiumButton>
            </Link>
          </motion.div>
        )}

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-6 text-sm text-white/70"
        >
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="h-5 w-5 text-emerald-400" />
            <span>Secure & Encrypted</span>
          </div>
        </motion.div>
      </motion.div>
      </div>
    </PremiumLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <PremiumLayout>
        <div className="min-h-[60vh] flex items-center justify-center text-white/80">Loading...</div>
      </PremiumLayout>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
