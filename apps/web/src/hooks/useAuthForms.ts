import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

// Stub types for auth forms
type LoginFormData = { email: string; password: string };
type RegisterFormData = {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  agreeToTerms: boolean;
};

// Stub auth hook
const useAuth = () => ({
  login: async (_data: LoginFormData) => {},
  register: async (_data: RegisterFormData) => {},
  error: null as string | null,
  loading: false,
  clearError: () => {},
});

// Hook for login form
export function useLoginForm() {
  const router = useRouter();
  const { login, error, loading, clearError } = useAuth();

  const form = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSubmit = async (data: LoginFormData) => {
    await login(data);
    router.push('/dashboard');
  };

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

  const form = useForm<RegisterFormData>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      phone: '',
      agreeToTerms: false,
    },
  });

  const handleSubmit = async (data: RegisterFormData) => {
    await register(data);
    router.push('/pets/new');
  };

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
