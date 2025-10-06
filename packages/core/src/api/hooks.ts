import { useMutation, useQuery, useQueryClient, type UseMutationOptions, type UseMutationResult, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';

import type { Match, Message, Pet, User } from '../types';
import { setItemSync, removeItemSync } from '../utils/storage';

import { apiClient, type ApiClientResponse } from './client';

// Query hook factory
export function useApiQuery<TData = unknown, TError = Error>(
  queryKey: string[],
  endpoint: string,
  options?: Omit<UseQueryOptions<ApiClientResponse<TData>, TError>, 'queryKey' | 'queryFn'>
): UseQueryResult<ApiClientResponse<TData>, TError> {
  return useQuery<ApiClientResponse<TData>, TError>({
    queryKey,
    queryFn: () => apiClient.get<TData>(endpoint),
    ...options,
  });
}
// Mutation hook factory
export function useApiMutation<TData = unknown, TVariables = void, TError = Error>(
  endpoint: string,
  options?: Omit<UseMutationOptions<ApiClientResponse<TData>, TError, TVariables>, 'mutationFn'>
): UseMutationResult<ApiClientResponse<TData>, TError, TVariables> {
  const queryClient = useQueryClient();

  return useMutation<ApiClientResponse<TData>, TError, TVariables>({
    mutationFn: (variables) => {
      if (variables === undefined) {
        return apiClient.post<TData>(endpoint);
      }
      return apiClient.post<TData>(endpoint, variables);
    },
    onSuccess: (data, variables, context, mutationContext) => {
      // Invalidate related queries
      void queryClient.invalidateQueries();

      // Call the original onSuccess if provided
      options?.onSuccess?.(data, variables, context, mutationContext);
    },
    ...options,
  });
}

// Specific hooks for common operations

// Auth hooks
export function useLogin(): UseMutationResult<ApiClientResponse<{ accessToken: string; refreshToken: string }>, Error, { email: string; password: string }> {
  return useApiMutation<{ accessToken: string; refreshToken: string }, { email: string; password: string }>('/auth/login', {
    onSuccess: (data) => {
      if (data.success && data.data != null) {
        const { accessToken, refreshToken } = data.data as { accessToken: string; refreshToken: string };
        setItemSync('accessToken', accessToken);
        setItemSync('refreshToken', refreshToken);
      }
    },
  });
}

export function useRegister(): UseMutationResult<ApiClientResponse<{ accessToken: string; refreshToken: string }>, Error, { email: string; password: string; firstName: string; lastName: string; dateOfBirth: string; phone?: string }> {
  return useApiMutation<{ accessToken: string; refreshToken: string }, { email: string; password: string; firstName: string; lastName: string; dateOfBirth: string; phone?: string }>('/auth/register', {
    onSuccess: (data) => {
      if (data.success && data.data != null) {
        const { accessToken, refreshToken } = data.data as { accessToken: string; refreshToken: string };
        setItemSync('accessToken', accessToken);
        setItemSync('refreshToken', refreshToken);
      }
    },
  });
}

export function useLogout(): UseMutationResult<ApiClientResponse<void>, Error, void> {
  const queryClient = useQueryClient();

  return useApiMutation('/auth/logout', {
    onSuccess: () => {
      // Use cross-platform storage utility
      removeItemSync('accessToken');
      removeItemSync('refreshToken');
      queryClient.clear();
    },
  });
}

// User hooks
export function useUser(userId?: string): UseQueryResult<ApiClientResponse<User>, Error> {
  return useApiQuery<User>(
    ['user', userId ?? 'me'],
    userId != null && userId !== '' ? `/users/${userId}` : '/users/me'
  );
}

export function useUpdateUser(): UseMutationResult<ApiClientResponse<User>, Error, Partial<User>> {
  const queryClient = useQueryClient();

  return useApiMutation('/users/me', {
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

// Pet hooks
export function usePets(filters?: Record<string, unknown>): UseQueryResult<ApiClientResponse<Pet[]>, Error> {
  const queryKey = ['pets', JSON.stringify(filters ?? {})];
  const queryString = filters != null ? `?${new URLSearchParams(filters as Record<string, string>).toString()}` : '';

  return useApiQuery<Pet[]>(queryKey, `/pets${queryString}`);
}

export function usePet(petId: string): UseQueryResult<ApiClientResponse<Pet>, Error> {
  return useApiQuery<Pet>(['pet', petId], `/pets/${petId}`);
}

export function useCreatePet(): UseMutationResult<ApiClientResponse<Pet>, Error, Partial<Pet>> {
  const queryClient = useQueryClient();

  return useApiMutation('/pets', {
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pets'] });
    },
  });
}

// Match hooks
export function useMatches(): UseQueryResult<ApiClientResponse<Match[]>, Error> {
  return useApiQuery<Match[]>(['matches'], '/matches');
}

export function useMatch(matchId: string): UseQueryResult<ApiClientResponse<Match>, Error> {
  return useApiQuery<Match>(['match', matchId], `/matches/${matchId}`);
}

export function useCreateMatch(): UseMutationResult<ApiClientResponse<Match>, Error, { petId: string; targetPetId: string }> {
  const queryClient = useQueryClient();

  return useApiMutation('/matches', {
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}

// Chat hooks
export function useChat(matchId: string): UseQueryResult<ApiClientResponse<Message[]>, Error> {
  return useApiQuery<Message[]>(['chat', matchId], `/chat/${matchId}`);
}

export function useSendMessage(): UseMutationResult<ApiClientResponse<Message>, Error, { matchId: string; content: string }> {
  const queryClient = useQueryClient();

  return useApiMutation('/chat', {
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['chat'] });
    },
  });
}

// AI hooks
export function useGenerateBio(): UseMutationResult<ApiClientResponse<{ bio: string }>, Error, { petId: string; species: string; breed: string; age: number; personality?: string[] }> {
  return useApiMutation('/ai/generate-bio');
}

export function useAnalyzePhotos(): UseMutationResult<ApiClientResponse<{ analysis: string }>, Error, { urls: string[]; petType?: string }> {
  return useApiMutation('/ai/analyze-photos');
}

export function useCompatibilityAnalysis(): UseMutationResult<ApiClientResponse<{ compatibility: number; factors: string[] }>, Error, { pet1Id: string; pet2Id: string }> {
  return useApiMutation('/ai/compatibility');
}

export function useApplicationAssistance(): UseMutationResult<ApiClientResponse<{ assistance: string }>, Error, { applicationId: string; question: string }> {
  return useApiMutation('/ai/assist-application');
}
