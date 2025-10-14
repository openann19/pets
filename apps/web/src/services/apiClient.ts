/**
 * PawfectMatch API Client
 * Production-ready API client for the PawfectMatch application
 */

import type { PetPlayground } from '@/components/Map/PlaygroundMap';
import type { PetProfile } from '@/components/Profile/PetProfileEditor';
import type { PetCareReminder } from '@/components/Reminders/PetCareReminders';

// Base API URL from environment variable
const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || '/api';

/**
 * Generic fetch wrapper with error handling and authorization
 */
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  const { headers: optionHeaders, ...restOptions } = options;
  const headers = new Headers(optionHeaders as HeadersInit | undefined);

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...restOptions,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

/**
 * Community API
 */
export interface CommunityPostAuthor {
  _id: string;
  name: string;
  avatar?: string;
}

export interface CommunityComment {
  _id: string;
  author: CommunityPostAuthor;
  content: string;
  createdAt: string;
}

export interface CommunityPost {
  _id: string;
  author: CommunityPostAuthor;
  content: string;
  images: string[];
  likes: number;
  liked?: boolean;
  comments: CommunityComment[];
  createdAt: string;
  packId?: string;
  packName?: string;
  type: 'post' | 'activity';
  activityDetails?: {
    date: string;
    location: string;
    maxAttendees?: number;
    currentAttendees?: number;
  };
  authorFollowed?: boolean; // Whether current user follows this post's author
}

export interface CommunityFeedResponse {
  success: boolean;
  posts: CommunityPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CommunityCommentResponse {
  success: boolean;
  comment: CommunityComment;
  message: string;
}

export interface CommunityPostResponse {
  success: boolean;
  post: CommunityPost;
  message: string;
}

export interface CommunityPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export const communityApi = {
  getFeed: (params: { page?: number; limit?: number; packId?: string; type?: string } = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    const query = searchParams.toString();
    return fetchApi<CommunityFeedResponse>(`/community/posts${query ? `?${query}` : ''}`);
  },

  createPost: (payload: { content: string; images?: string[]; packId?: string; type?: string; activityDetails?: Record<string, unknown> }) =>
    fetchApi<CommunityPostResponse>('/community/posts', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  likePost: (postId: string) =>
    fetchApi<CommunityPostResponse>(`/community/posts/${postId}/like`, {
      method: 'POST',
    }),

  addComment: (postId: string, content: string) =>
    fetchApi<CommunityCommentResponse>(`/community/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  getComments: (postId: string, params: { page?: number; limit?: number } = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && `${value}` !== '') {
        searchParams.append(key, String(value));
      }
    });

    const query = searchParams.toString();
    return fetchApi<{ success: boolean; comments: CommunityComment[]; pagination: CommunityPagination }>(
      `/community/posts/${postId}/comments${query ? `?${query}` : ''}`,
    );
  },

  reportContent: (payload: { targetType: 'post' | 'user' | 'comment'; targetId: string; reason: string; details?: string }) =>
    fetchApi<{ success: boolean; message: string }>('/community/report', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  blockUser: (userId: string) =>
    fetchApi<{ success: boolean; message: string }>(`/community/block/${userId}`, {
      method: 'POST',
    }),

  followUser: (userId: string) =>
    fetchApi<{ success: boolean; message: string }>(`/community/follow/${userId}`, {
      method: 'POST',
    }),

  unfollowUser: (userId: string) =>
    fetchApi<{ success: boolean; message: string }>(`/community/unfollow/${userId}`, {
      method: 'POST',
    }),

  // Notification subscription management
  subscribeToNotifications: (subscription: PushSubscription) =>
    fetchApi<{ success: boolean; message: string }>('/notifications/subscribe', {
      method: 'POST',
      body: JSON.stringify({ subscription }),
    }),

  unsubscribeFromNotifications: (endpoint: string) =>
    fetchApi<{ success: boolean; message: string }>('/notifications/unsubscribe', {
      method: 'POST',
      body: JSON.stringify({ endpoint }),
    }),
};

/**
 * Pets API
 */
export const petsApi = {
  getAll: () => fetchApi<Pet[]>('/pets'),

  getById: (id: string) => fetchApi<PetProfile>(`/pets/${id}`),

  create: (pet: Omit<Pet, 'id'>) =>
    fetchApi<Pet>('/pets', {
      method: 'POST',
      body: JSON.stringify(pet),
    }),

  update: (id: string, pet: Partial<PetProfile>) =>
    fetchApi<PetProfile>(`/pets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(pet),
    }),

  delete: (id: string) =>
    fetchApi<void>(`/pets/${id}`, {
      method: 'DELETE',
    }),

  uploadPhoto: async (id: string, photoBlob: Blob) => {
    const formData = new FormData();
    formData.append('photo', photoBlob);

    const response = await fetch(`${API_BASE_URL}/pets/${id}/photo`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload photo');
    }

    return response.json();
  },
};

/**
 * Reminders API
 */
export const remindersApi = {
  getAll: () => fetchApi<PetCareReminder[]>('/reminders'),

  getById: (id: string) => fetchApi<PetCareReminder>(`/reminders/${id}`),

  create: (reminder: Omit<PetCareReminder, 'id'>) =>
    fetchApi<PetCareReminder>('/reminders', {
      method: 'POST',
      body: JSON.stringify(reminder),
    }),

  update: (id: string, reminder: Partial<PetCareReminder>) =>
    fetchApi<PetCareReminder>(`/reminders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reminder),
    }),

  delete: (id: string) =>
    fetchApi<void>(`/reminders/${id}`, {
      method: 'DELETE',
    }),

  toggleComplete: (id: string, completed: boolean) =>
    fetchApi<PetCareReminder>(`/reminders/${id}/complete`, {
      method: 'PUT',
      body: JSON.stringify({ completed }),
    }),
};

/**
 * Calendar API
 */
export const calendarApi = {
  getEvents: () => fetchApi<CalendarEvent[]>('/events'),

  getEventById: (id: string) => fetchApi<CalendarEvent>(`/events/${id}`),

  createEvent: (event: Omit<CalendarEvent, 'id'>) =>
    fetchApi<CalendarEvent>('/events', {
      method: 'POST',
      body: JSON.stringify(event),
    }),

  updateEvent: (id: string, event: Partial<CalendarEvent>) =>
    fetchApi<CalendarEvent>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(event),
    }),

  deleteEvent: (id: string) =>
    fetchApi<void>(`/events/${id}`, {
      method: 'DELETE',
    }),
};

/**
 * Playgrounds API
 */
export const playgroundsApi = {
  getAll: (filters?: unknown) =>
    fetchApi<PetPlayground[]>('/playgrounds', {
      method: 'POST',
      body: JSON.stringify(filters || {}),
    }),

  getById: (id: string) => fetchApi<PetPlayground>(`/playgrounds/${id}`),

  toggleFavorite: (id: string, isFavorite: boolean) =>
    fetchApi<PetPlayground>(`/playgrounds/${id}/favorite`, {
      method: 'PUT',
      body: JSON.stringify({ isFavorite }),
    }),
};

/**
 * User API
 */
export const userApi = {
  getProfile: () => fetchApi<User>('/user/profile'),

  updateProfile: (profile: Partial<User>) =>
    fetchApi<User>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    }),

  getPreferences: () => fetchApi<UserPreferences>('/user/preferences'),

  updatePreferences: (preferences: Partial<UserPreferences>) =>
    fetchApi<UserPreferences>('/user/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    }),
};

/**
 * Types
 */
export interface User {
  _id: string;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  token?: string;
  premium?: {
    isActive: boolean;
    plan: string;
    expiresAt: string;
  };
  streak?: {
    current: number;
    longest: number;
    lastCheckIn?: string;
  };
  stats?: {
    matches?: number;
    messages?: number;
    likes?: number;
  };
  twoFactorEnabled?: boolean;
  privacySettings?: {
    profileVisibility: 'everyone' | 'matches' | 'nobody';
    showOnlineStatus: boolean;
    showDistance: boolean;
    showLastActive: boolean;
    allowMessages: 'everyone' | 'matches' | 'nobody';
    showReadReceipts: boolean;
    incognitoMode: boolean;
    shareLocation: boolean;
  };
  notificationPreferences?: {
    enabled: boolean;
    matches: boolean;
    messages: boolean;
    likes: boolean;
    reminders: boolean;
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
    frequency: 'instant' | 'batched' | 'daily';
    sound: boolean;
    vibration: boolean;
  };
}

export interface Pet {
  id: string;
  name: string;
  avatar?: string;
  species: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  type: string;
  petIds: string[];
  location?: string;
  allDay?: boolean;
}

export interface UserPreferences {
  notifications: {
    enabled: boolean;
    matches: boolean;
    messages: boolean;
    likes: boolean;
    reminders: boolean;
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
    frequency: 'instant' | 'batched' | 'daily';
    sound: boolean;
    vibration: boolean;
  };
  privacy: {
    profileVisibility: 'everyone' | 'matches' | 'none';
    showOnlineStatus: boolean;
    showDistance: boolean;
    showLastActive: boolean;
    allowMessages: 'everyone' | 'matches' | 'none';
    showReadReceipts: boolean;
    incognitoMode: boolean;
    shareLocation: boolean;
  };
}

const apiClient = {
  pets: petsApi,
  reminders: remindersApi,
  calendar: calendarApi,
  playgrounds: playgroundsApi,
  user: userApi,
  community: communityApi,
};

export default apiClient;
