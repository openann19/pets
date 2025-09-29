import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useFormValidation, useAsyncSubmit } from './useFormValidation';
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema, LoginFormData, RegisterFormData, ForgotPasswordFormData, ResetPasswordFormData } from '../schemas/auth';
import { toast } from 'react-hot-toast';

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
