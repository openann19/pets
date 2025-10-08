import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FieldValues } from 'react-hook-form';

// Simplified hook for form validation with Zod
export function useFormValidation(schema: any, defaultValues?: any) {
  return useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange', // Validate on change for better UX
  });
}

// Hook for handling async form submission
export function useAsyncSubmit<T>(
  onSubmit: (data: T) => Promise<void>,
  onSuccess?: () => void,
  onError?: (error: any) => void
) {
  const handleSubmit = async (data: T) => {
    try {
      await onSubmit(data);
      onSuccess?.();
    } catch (error) {
      onError?.(error);
    }
  };

  return handleSubmit;
}
