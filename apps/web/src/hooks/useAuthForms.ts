// @ts-nocheck
import { useRouter } from 'next/navigation';
import React from 'react';

import { useAuth } from '../contexts/AuthContext';
import type { LoginFormData, RegisterFormData} from '../schemas/auth';
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema, ForgotPasswordFormData, ResetPasswordFormData } from '../schemas/auth';

import { useFormValidation, useAsyncSubmit } from './useFormValidation';
// import { toast } from 'react-hot-toast';
const toast = { success: (msg: string) => console.log(msg), error: (msg: string) => console.error(msg) };

// Hook for login form
export function useLoginForm() {
  const router = useRouter();
  const { login, error, loading, clearError } = useAuth();
  
  const form = useFormValidation(loginSchema, {
    email: '',
    password: '',
  });

  const handleSubmit = useAsyncSubmit<LoginFormData>(
    async (data) => {
      await login(data);
    },
    () => router.push('/dashboard'),
    () => {
      // Error is handled by AuthContext
    }
  );

  // Clear auth errors when form changes
  const { watch } = form;
  const watchedFields = watch();
  
  React.useEffect(() => {
    if (error) {
      clearError();
    }
  }, [watchedFields, error, clearError]);

  return {
    form,
    handleSubmit: form.handleSubmit(handleSubmit),
    error,
    loading,
  };
}

// Hook for register form
export function useRegisterForm() {
  const router = useRouter();
  const { register, error, loading, clearError } = useAuth();
  
  const form = useFormValidation(registerSchema, {
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
    agreeToTerms: false,
  });

  const handleSubmit = useAsyncSubmit<RegisterFormData>(
    async (data) => {
      await register(data);
    },
    () => router.push('/pets/new'),
    () => {
      // Error is handled by AuthContext
    }
  );

  // Clear auth errors when form changes
  const { watch } = form;
  const watchedFields = watch();
  
  React.useEffect(() => {
    if (error) {
      clearError();
    }
  }, [watchedFields, error, clearError]);

  return {
    form,
    handleSubmit: form.handleSubmit(handleSubmit),
    error,
    loading,
  };
}
