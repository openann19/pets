/**
 * Complete React Hooks for all API operations
 * Production-ready with caching, optimistic updates, and error handling
 */

// @ts-nocheck
import { useAuthStore } from '@/lib/auth-store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PetCreationData } from '@/types';
import apiClient from '../lib/api-client';
import type { Match, Message, Pet, SwipeAction, User } from '../types';

// ============= AUTHENTICATION HOOKS =============
export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setUser, setTokens, logout: storeLogout } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => 
      apiClient.login(email, password),
    onSuccess: (data) => {
      const user = (data as any)?.user || (data as any)?.data?.user;
      const accessToken = (data as any)?.accessToken || (data as any)?.data?.accessToken;
      const refreshToken = (data as any)?.refreshToken || (data as any)?.data?.refreshToken;
      if (user && accessToken) {
        setUser(user);
        setTokens(accessToken, refreshToken || '');
        queryClient.invalidateQueries({ queryKey: ['user'] });
        router.push('/dashboard');
      }
    }
  });

  const registerMutation = useMutation({
    mutationFn: (data: { email: string; password: string; name: string }) =>
      apiClient.register(data),
    onSuccess: (data) => {
      const user = (data as any)?.user || (data as any)?.data?.user;
      const accessToken = (data as any)?.accessToken || (data as any)?.data?.accessToken;
      const refreshToken = (data as any)?.refreshToken || (data as any)?.data?.refreshToken;
      if (user && accessToken) {
        setUser(user);
        setTokens(accessToken, refreshToken || '');
        queryClient.invalidateQueries({ queryKey: ['user'] });
        router.push('/dashboard');
      }
    }
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiClient.logout(),
    onSuccess: () => {
      storeLogout();
      queryClient.clear();
      router.push('/');
    }
  });

  return {
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    isLoading: loginMutation.isPending || registerMutation.isPending,
    error: loginMutation.error || registerMutation.error
  };
}

// ============= USER PROFILE HOOKS =============
export function useCurrentUser() {
  const { setUser, isAuthenticated } = useAuthStore();
  
  return useQuery({
    queryKey: ['user', 'current'],
    queryFn: async () => {
      const response = await apiClient.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
        return response.data;
      }
      throw new Error(response.error || 'Failed to fetch user');
    },
    enabled: isAuthenticated, // Only fetch when authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: (data: Partial<User>) => apiClient.updateProfile(data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        setUser(response.data);
        queryClient.invalidateQueries({ queryKey: ['user'] });
      }
    }
  });
}

// ============= PETS HOOKS =============
export function usePets() {
  return useQuery({
    queryKey: ['pets'],
    queryFn: async () => {
      const response = await apiClient.getPets();
      if (response.success) return response.data;
      throw new Error(response.error);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useMyPets() {
  const { isAuthenticated } = useAuthStore();
  
  return useQuery({
    queryKey: ['pets', 'my'],
    queryFn: async () => {
      const response = await apiClient.getMyPets();
      if (response.success) return response.data;
      throw new Error(response.error);
    },
    enabled: isAuthenticated, // Only fetch when authenticated
    staleTime: 5 * 60 * 1000,
  });
}

// Alias for useMyPets to match the import in MyPetsPage
export const useUserPets = useMyPets;

export function useCreatePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PetCreationData) => apiClient.createPet(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
    }
  });
}

export function useUpdatePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pet> }) => 
      apiClient.updatePet(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
    }
  });
}

export function useDeletePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deletePet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      queryClient.invalidateQueries({ queryKey: ['pets', 'my'] });
    }
  });
}

// ============= SWIPE & MATCHING HOOKS =============
export function useSwipeQueue() {
  const { isAuthenticated } = useAuthStore();
  
  return useQuery({
    queryKey: ['swipe', 'queue'],
    queryFn: async () => {
      const response = await apiClient.getSwipeQueue();
      if (response.success) return response.data;
      throw new Error(response.error);
    },
    enabled: isAuthenticated, // Only fetch when authenticated
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useSwipe() {
  const queryClient = useQueryClient();
  const [lastMatch, setLastMatch] = useState<Match | null>(null);

  const swipeMutation = useMutation({
    mutationFn: (action: SwipeAction) => apiClient.swipe(action),
    onSuccess: (response) => {
      if (response.success && response.data) {
        if (response.data.isMatch && response.data.match) {
          setLastMatch(response.data.match);
        }
        queryClient.invalidateQueries({ queryKey: ['swipe', 'queue'] });
        queryClient.invalidateQueries({ queryKey: ['matches'] });
      }
    }
  });

  return {
    swipe: swipeMutation.mutate,
    isLoading: swipeMutation.isPending,
    lastMatch,
    clearMatch: () => setLastMatch(null)
  };
}

export function useMatches() {
  const { isAuthenticated } = useAuthStore();
  
  return useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const response = await apiClient.getMatches();
      if (response.success) return response.data;
      throw new Error(response.error);
    },
    enabled: isAuthenticated, // Only fetch when authenticated
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

export function useMatch(matchId: string) {
  return useQuery({
    queryKey: ['matches', matchId],
    queryFn: async () => {
      const response = await apiClient.getMatch(matchId);
      if (response.success) return response.data;
      throw new Error(response.error);
    },
    enabled: !!matchId,
  });
}

// ============= CHAT & MESSAGING HOOKS =============
export function useMessages(matchId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['messages', matchId],
    queryFn: async () => {
      const response = await apiClient.getMessages(matchId);
      if (response.success) return response.data;
      throw new Error(response.error);
    },
    enabled: !!matchId,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  // Setup WebSocket listeners
  useEffect(() => {
    if (!matchId) return;

    const handleNewMessage = (message: Message) => {
      if (message.matchId === matchId) {
        queryClient.setQueryData(['messages', matchId], (old: Message[] = []) => 
          [...old, message]
        );
      }
    };

    apiClient.onSocketEvent('new-message', handleNewMessage);

    return () => {
      // Cleanup would go here if we had removeListener
    };
  }, [matchId, queryClient]);

  return query;
}

export function useSendMessage(matchId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => apiClient.sendMessage(matchId, content),
    onMutate: async (content) => {
      // Optimistic update
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        matchId,
        senderId: 'current-user', // This should come from auth
        content,
        timestamp: new Date().toISOString(),
        read: true
      };

      queryClient.setQueryData(['messages', matchId], (old: Message[] = []) => 
        [...old, tempMessage]
      );

      return { tempMessage };
    },
    onSuccess: (response, _, context) => {
      if (response.success && response.data) {
        // Replace temp message with real one
        queryClient.setQueryData(['messages', matchId], (old: Message[] = []) =>
          old.map(msg => 
            msg.id === context?.tempMessage.id ? response.data! : msg
          )
        );
      }
    }
  });
}

export function useMarkMessagesAsRead(matchId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.markMessagesAsRead(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    }
  });
}

// ============= AI SERVICE HOOKS =============
export function useGenerateBio() {
  return useMutation({
    mutationFn: (request: AIBioRequest) => apiClient.generateBio(request),
  });
}

export function useAnalyzePhoto() {
  return useMutation({
    mutationFn: (photoUrl: string) => apiClient.analyzePhoto(photoUrl),
  });
}

export function useCalculateCompatibility() {
  return useMutation({
    mutationFn: ({ pet1, pet2 }: { pet1: Pet; pet2: Pet }) => 
      apiClient.calculateCompatibility(pet1, pet2),
  });
}

export function useSuggestImprovements() {
  return useMutation({
    mutationFn: (pet: Pet) => apiClient.suggestProfileImprovements(pet),
  });
}

// ============= SUBSCRIPTION HOOKS =============
export function useSubscription() {
  const { isAuthenticated } = useAuthStore();
  
  return useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const response = await apiClient.getSubscription();
      if (response.success) return response.data;
      return null; // No subscription
    },
    enabled: isAuthenticated, // Only fetch when authenticated
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (plan: string) => apiClient.createSubscription(plan),
    onSuccess: (response) => {
      if (response.success && response.data?.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      }
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    }
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.cancelSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    }
  });
}

// ============= LOCATION HOOKS =============
export function useUpdateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (location: Location) => apiClient.updateLocation(location),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    }
  });
}

export function useNearbyPets(radius: number = 10) {
  return useQuery({
    queryKey: ['pets', 'nearby', radius],
    queryFn: async () => {
      const response = await apiClient.getNearbyPets(radius);
      if (response.success) return response.data;
      throw new Error(response.error);
    },
    staleTime: 2 * 60 * 1000,
  });
}

// ============= NOTIFICATION HOOKS =============
export function useNotifications() {
  const { isAuthenticated } = useAuthStore();
  
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await apiClient.getNotifications();
      if (response.success) return response.data;
      throw new Error(response.error);
    },
    enabled: isAuthenticated, // Only fetch when authenticated
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
}

// ============= WEBSOCKET HOOKS =============
export function useWebSocket(userId?: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    
    console.log('[WebSocket] Initializing connection for user:', userId);
    
    // Connect to WebSocket
    const connectSocket = async () => {
      try {
        const socket = await apiClient.connectWebSocket(userId);
        if (socket) {
          setIsConnected(true);
          setConnectionError(null);
          console.log('[WebSocket] Connected successfully');
        }
      } catch (error) {
        console.error('[WebSocket] Connection failed:', error);
        setConnectionError(error instanceof Error ? error.message : 'Connection failed');
        setIsConnected(false);
      }
    };

    connectSocket();
    
    // Cleanup on unmount or userId change
    return () => {
      console.log('[WebSocket] Cleaning up connection');
      apiClient.disconnectWebSocket();
      setIsConnected(false);
      setConnectionError(null);
    };
  }, [userId]);

  return {
    isConnected,
    connectionError,
    isWebSocketConnected: apiClient.isWebSocketConnected,
    joinMatchRoom: apiClient.joinMatchRoom,
    leaveMatchRoom: apiClient.leaveMatchRoom,
    sendChatMessage: apiClient.sendChatMessage,
    sendTypingIndicator: apiClient.sendTypingIndicator,
    markMessagesAsRead: apiClient.markMessagesAsRead,
    performMatchAction: apiClient.performMatchAction,
    onWebSocketEvent: apiClient.onWebSocketEvent,
  };
}

// ============= COMBINED HOOKS =============
export function useDashboardData() {
  const user = useCurrentUser();
  const pets = useMyPets();
  const matches = useMatches();
  const notifications = useNotifications();
  const subscription = useSubscription();

  return {
    user: user.data,
    pets: pets.data || [],
    matches: matches.data || [],
    notifications: notifications.data || [],
    subscription: subscription.data,
    isLoading: user.isLoading || pets.isLoading || matches.isLoading,
    error: user.error || pets.error || matches.error
  };
}

export function useSwipeData() {
  const queue = useSwipeQueue();
  const { swipe, isLoading, lastMatch, clearMatch } = useSwipe();
  const user = useCurrentUser();

  return {
    pets: queue.data || [],
    currentPet: queue.data?.[0],
    swipe,
    isLoading: queue.isLoading || isLoading,
    lastMatch,
    clearMatch,
    isPremium: user.data?.isPremium || false,
    refetch: queue.refetch
  };
}

export function useChatData(matchId: string) {
  const match = useMatch(matchId);
  const messages = useMessages(matchId);
  const sendMessage = useSendMessage(matchId);
  const markAsRead = useMarkMessagesAsRead(matchId);

  useEffect(() => {
    if (matchId && messages.data) {
      markAsRead.mutate();
    }
  }, [matchId, messages.data]);

  return {
    match: match.data,
    messages: messages.data || [],
    sendMessage: sendMessage.mutate,
    isLoading: match.isLoading || messages.isLoading,
    isSending: sendMessage.isPending
  };
}
