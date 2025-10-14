import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef } from 'react';
import { useForm, type FieldPath, type UseFormReturn, type UseFormSetValue } from 'react-hook-form';
import type { z } from 'zod';


/**
 * Custom hook for form validation with Zod schemas
 * @param schema - Zod schema to validate against
 * @param defaultValues - Default values for the form
 * @returns UseFormReturn object with enhanced setValue
 */
export function useFormValidation<
  TFieldValues extends FieldValues = FieldValues,
  TSchema extends z.ZodType<any, any, any> = z.ZodType<any, any, any>,
  TContext = any
>({
  schema,
  defaultValues,
}: {
  schema: TSchema;
  defaultValues?: Partial<TFieldValues>;
}): UseFormReturn<z.infer<TSchema>, TContext> {
  // Use proper typing for zodResolver
  const resolver = zodResolver(schema);

  const form = useForm<z.infer<TSchema>, TContext>({
    resolver,
    defaultValues: defaultValues as unknown as z.infer<TSchema>,
    mode: 'all', // Validate on all events (change, blur, submit)
    reValidateMode: 'onChange',
    criteriaMode: 'all',
  });

  // Store original setValue with proper typing
  const originalSetValue = useRef<UseFormSetValue<z.infer<TSchema>>>(form.setValue);

  // If needed, consumers can call setValue with validation flags explicitly.
  useEffect(() => {
    // no override to avoid type incompatibilities across packages
  }, [form]);

  // Enhanced form object already has all the properties we need
  return form;
}

// Hook for handling async form submission
export function useAsyncSubmit<T>(
  onSubmit: (data: T) => Promise<void>,
  onSuccess?: () => void,
  onError?: (error: unknown) => void,
): (data: T) => Promise<void> {
  const handleSubmit = async (data: T): Promise<void> => {
    try {
      await onSubmit(data);
      onSuccess?.();
    } catch (error) {
      onError?.(error);
    }
  };

  return handleSubmit;
}
