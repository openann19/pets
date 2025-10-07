import { type UseMutationOptions, type UseMutationResult, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';
import type { Match, Message, Pet, User } from '../types';
import { type ApiClientResponse } from './client';
export declare function useApiQuery<TData = unknown, TError = Error>(queryKey: string[], endpoint: string, options?: Omit<UseQueryOptions<ApiClientResponse<TData>, TError>, 'queryKey' | 'queryFn'>): UseQueryResult<ApiClientResponse<TData>, TError>;
export declare function useApiMutation<TData = unknown, TVariables = void, TError = Error>(endpoint: string, options?: Omit<UseMutationOptions<ApiClientResponse<TData>, TError, TVariables>, 'mutationFn'>): UseMutationResult<ApiClientResponse<TData>, TError, TVariables>;
export declare function useLogin(): UseMutationResult<ApiClientResponse<{
    accessToken: string;
    refreshToken: string;
}>, Error, {
    email: string;
    password: string;
}>;
export declare function useRegister(): UseMutationResult<ApiClientResponse<{
    accessToken: string;
    refreshToken: string;
}>, Error, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    phone?: string;
}>;
export declare function useLogout(): UseMutationResult<ApiClientResponse<void>, Error, void>;
export declare function useUser(userId?: string): UseQueryResult<ApiClientResponse<User>, Error>;
export declare function useUpdateUser(): UseMutationResult<ApiClientResponse<User>, Error, Partial<User>>;
export declare function usePets(filters?: Record<string, unknown>): UseQueryResult<ApiClientResponse<Pet[]>, Error>;
export declare function usePet(petId: string): UseQueryResult<ApiClientResponse<Pet>, Error>;
export declare function useCreatePet(): UseMutationResult<ApiClientResponse<Pet>, Error, Partial<Pet>>;
export declare function useMatches(): UseQueryResult<ApiClientResponse<Match[]>, Error>;
export declare function useMatch(matchId: string): UseQueryResult<ApiClientResponse<Match>, Error>;
export declare function useCreateMatch(): UseMutationResult<ApiClientResponse<Match>, Error, {
    petId: string;
    targetPetId: string;
}>;
export declare function useChat(matchId: string): UseQueryResult<ApiClientResponse<Message[]>, Error>;
export declare function useSendMessage(): UseMutationResult<ApiClientResponse<Message>, Error, {
    matchId: string;
    content: string;
}>;
export declare function useGenerateBio(): UseMutationResult<ApiClientResponse<{
    bio: string;
}>, Error, {
    petId: string;
    species: string;
    breed: string;
    age: number;
    personality?: string[];
}>;
export declare function useAnalyzePhotos(): UseMutationResult<ApiClientResponse<{
    analysis: string;
}>, Error, {
    urls: string[];
    petType?: string;
}>;
export declare function useCompatibilityAnalysis(): UseMutationResult<ApiClientResponse<{
    compatibility: number;
    factors: string[];
}>, Error, {
    pet1Id: string;
    pet2Id: string;
}>;
export declare function useApplicationAssistance(): UseMutationResult<ApiClientResponse<{
    assistance: string;
}>, Error, {
    applicationId: string;
    question: string;
}>;
//# sourceMappingURL=hooks.d.ts.map