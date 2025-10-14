/**
 * ULTRA PREMIUM API Service 🚀
 * Production-ready with full type safety, error handling, and real-time features
 */

import type { User } from '@pawfectmatch/core';
import { logger } from '@pawfectmatch/core';
import { toURLSearchParams } from '../utils/http/params';

const API_BASE_URL: string = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:5000/api';

// Auth response types
interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    isPremium?: boolean;
    preferences?: Record<string, unknown>;
  };
}

// Forgot password request schema
export interface ForgotPasswordRequest {
  email: string;
}

// Reset password request schema
export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

// Current user response schema
interface CurrentUserResponse {
  user: User;
}

// Pet creation/update types
interface PetCreateData {
  name: string;
  breed: string;
  age: number;
  gender: 'male' | 'female';
  size: 'small' | 'medium' | 'large';
  weight: number;
  description: string;
  temperament: string[];
  energy: 'low' | 'medium' | 'high';
  training: 'none' | 'basic' | 'intermediate' | 'advanced';
  goodWithKids: boolean;
  goodWithPets: boolean;
  houseTrained: boolean;
  specialNeeds?: string;
  photos: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
}

interface PetUpdateData extends Partial<PetCreateData> {
  id: string;
}

// User preferences type
interface UserPreferences {
  maxDistance: number;
  ageRange: { min: number; max: number };
  sizePreference: ('small' | 'medium' | 'large')[];
  breedPreference: string[];
  temperamentPreference: string[];
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

// Message attachment type
interface MessageAttachment {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  name: string;
  size: number;
  mimeType: string;
}

// AI analysis types
interface AIAnalysisOptions {
  includeBehavior?: boolean;
  includeCompatibility?: boolean;
  includeRecommendations?: boolean;
}

interface BehaviorAnalysisData {
  activityLevel: number;
  socialBehavior: string[];
  trainingProgress: number;
  healthIndicators: Record<string, unknown>;
}

// Logger utility with proper typing
interface LogLevel {
  info: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
}

const apiLogger: LogLevel = {
  info: (...args: unknown[]): void => {
    logger.info('[API]', { args });
  },
  error: (...args: unknown[]): void => {
    logger.error('[API ERROR]', { args });
  },
  warn: (...args: unknown[]): void => {
    logger.warn('[API WARN]', { args });
  },
};

/**
 * Error severity levels for classification
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Error categories for better organization
 */
export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NETWORK = 'network',
  SERVER = 'server',
  CLIENT = 'client',
  RATE_LIMIT = 'rate_limit',
  NOT_FOUND = 'not_found',
  CONFLICT = 'conflict',
  UNKNOWN = 'unknown',
}

/**
 * Error recovery strategies
 */
export enum RecoveryStrategy {
  RETRY = 'retry',
  REDIRECT = 'redirect',
  REFRESH_AUTH = 'refresh_auth',
  FALLBACK = 'fallback',
  MANUAL = 'manual',
  NONE = 'none',
}

/**
 * Enhanced API Error class with classification, recovery, and user-friendly messages
 */
export class ApiError extends Error {
  public readonly timestamp: Date;
  public readonly id: string;
  public readonly isOperational: boolean;
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly recovery: RecoveryStrategy;

  constructor(
    public status: number,
    message: string,
    public code?: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
    this.timestamp = new Date();
    this.id = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Auto-classify error
    const classification = this.classifyError(status);
    this.category = classification.category;
    this.severity = classification.severity;
    this.recovery = classification.recovery;
    this.isOperational = status >= 400 && status < 500;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  private classifyError(status: number): { category: ErrorCategory; severity: ErrorSeverity; recovery: RecoveryStrategy } {
    if (status === 401) {
      return { category: ErrorCategory.AUTHENTICATION, severity: ErrorSeverity.HIGH, recovery: RecoveryStrategy.REFRESH_AUTH };
    }
    if (status === 403) {
      return { category: ErrorCategory.AUTHORIZATION, severity: ErrorSeverity.HIGH, recovery: RecoveryStrategy.REDIRECT };
    }
    if (status === 404) {
      return { category: ErrorCategory.NOT_FOUND, severity: ErrorSeverity.LOW, recovery: RecoveryStrategy.FALLBACK };
    }
    if (status === 409) {
      return { category: ErrorCategory.CONFLICT, severity: ErrorSeverity.MEDIUM, recovery: RecoveryStrategy.MANUAL };
    }
    if (status === 400 || status === 422) {
      return { category: ErrorCategory.VALIDATION, severity: ErrorSeverity.LOW, recovery: RecoveryStrategy.MANUAL };
    }
    if (status === 429) {
      return { category: ErrorCategory.RATE_LIMIT, severity: ErrorSeverity.MEDIUM, recovery: RecoveryStrategy.RETRY };
    }
    if (status >= 400 && status < 500) {
      return { category: ErrorCategory.CLIENT, severity: ErrorSeverity.MEDIUM, recovery: RecoveryStrategy.MANUAL };
    }
    if (status >= 500) {
      return { category: ErrorCategory.SERVER, severity: ErrorSeverity.HIGH, recovery: RecoveryStrategy.RETRY };
    }
    if (status <= 0) {
      return { category: ErrorCategory.NETWORK, severity: ErrorSeverity.HIGH, recovery: RecoveryStrategy.RETRY };
    }
    return { category: ErrorCategory.UNKNOWN, severity: ErrorSeverity.MEDIUM, recovery: RecoveryStrategy.MANUAL };
  }

  /**
   * Get user-friendly error message
   */
  public getUserFriendlyMessage(): string {
    // Code-specific messages
    const codeMessages: Record<string, string> = {
      'EMAIL_EXISTS': 'This email is already registered. Please use a different email or log in.',
      'INVALID_CREDENTIALS': 'Invalid email or password. Please try again.',
      'TOKEN_EXPIRED': 'Your session has expired. Please log in again.',
      'TOKEN_INVALID': 'Invalid session. Please log in again.',
      'WEAK_PASSWORD': 'Please choose a stronger password (8+ chars, uppercase, lowercase, numbers).',
      'RATE_LIMIT_EXCEEDED': 'Too many requests. Please wait a moment and try again.',
      'EMAIL_NOT_VERIFIED': 'Please verify your email address.',
      'ACCOUNT_SUSPENDED': 'Your account has been suspended. Contact support.',
      'INSUFFICIENT_PERMISSIONS': 'You don\'t have permission for this action.',
      'RESOURCE_NOT_FOUND': 'The requested resource was not found.',
      'PAYMENT_REQUIRED': 'This feature requires a premium subscription.',
      'UPLOAD_TOO_LARGE': 'File too large. Max 10MB.',
      'UNSUPPORTED_FILE_TYPE': 'File type not supported. Use JPG, PNG, or GIF.',
    };

    if (this.code && codeMessages[this.code]) {
      return codeMessages[this.code] ?? this.message;
    }

    // Category-based messages
    switch (this.category) {
      case ErrorCategory.AUTHENTICATION:
        return 'Authentication failed. Please log in again.';
      case ErrorCategory.AUTHORIZATION:
        return 'You don\'t have permission to access this resource.';
      case ErrorCategory.VALIDATION:
        return 'Please check your input and try again.';
      case ErrorCategory.NETWORK:
        return 'Network error. Check your connection and try again.';
      case ErrorCategory.SERVER:
        return 'Server error. Our team has been notified.';
      case ErrorCategory.RATE_LIMIT:
        return 'Too many requests. Please wait before trying again.';
      case ErrorCategory.NOT_FOUND:
        return 'Resource not found.';
      case ErrorCategory.CONFLICT:
        return 'This action conflicts with existing data.';
      default:
        if (this.status >= 500) return 'Something went wrong. Please try again later.';
        if (this.status === 404) return 'Page not found.';
        if (this.status === 403) return 'Access denied.';
        if (this.status === 401) return 'Please log in to continue.';
        return 'An unexpected error occurred.';
    }
  }

  /**
   * Check if error is retryable
   */
  public isRetryable(): boolean {
    return this.recovery === RecoveryStrategy.RETRY || this.status === 429 || this.status >= 500;
  }

  /**
   * Convert to JSON for logging
   */
  public toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      message: this.message,
      status: this.status,
      code: this.code,
      category: this.category,
      severity: this.severity,
      recovery: this.recovery,
      userMessage: this.getUserFriendlyMessage(),
      details: this.details,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
      isOperational: this.isOperational,
    };
  }
}

/**
 * Retry configuration options
 */
export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxAttempts?: number;
  /** Initial delay in milliseconds (default: 1000) */
  initialDelay?: number;
  /** Backoff multiplier (default: 2 for exponential) */
  backoffMultiplier?: number;
  /** Maximum delay cap in milliseconds (default: 10000) */
  maxDelay?: number;
  /** Custom retry condition function */
  shouldRetry?: (error: unknown, attempt: number) => boolean;
  /** Callback on each retry attempt */
  onRetry?: (error: unknown, attempt: number, delay: number) => void;
}

/**
 * Exponential backoff retry wrapper for async functions
 * Automatically retries on ApiError with isRetryable() === true
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    backoffMultiplier = 2,
    maxDelay = 10000,
    shouldRetry,
    onRetry,
  } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if we should retry
      const isLastAttempt = attempt === maxAttempts;
      const shouldRetryDefault = error instanceof ApiError && error.isRetryable();
      const shouldRetryCustom = shouldRetry ? shouldRetry(error, attempt) : shouldRetryDefault;

      if (isLastAttempt || !shouldRetryCustom) {
        throw error;
      }

      // Calculate delay with exponential backoff and jitter
      const exponentialDelay = initialDelay * Math.pow(backoffMultiplier, attempt - 1);
      const jitter = Math.random() * 0.3 * exponentialDelay; // ±30% jitter
      const delay = Math.min(exponentialDelay + jitter, maxDelay);

      // Log retry attempt
      apiLogger.warn(`[RETRY] Attempt ${attempt}/${maxAttempts} failed. Retrying in ${Math.round(delay)}ms...`, {
        error: error instanceof ApiError ? error.toJSON() : { message: String(error) },
        attempt,
        delay: Math.round(delay),
      });

      // Call retry callback
      onRetry?.(error, attempt, delay);

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Retry decorator for class methods
 */
export function retry(options: RetryOptions = {}) {
  return function (
    _target: unknown,
    _propertyKey: string,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value as (...args: unknown[]) => Promise<unknown>;

    descriptor.value = async function (this: unknown, ...args: unknown[]): Promise<unknown> {
      return withRetry(() => originalMethod.apply(this, args), options);
    };

    return descriptor;
  };
}

// Request options with proper typing
type QueryParams = Record<string, string | number | boolean | undefined>;

interface RequestOptions extends RequestInit {
  params?: QueryParams;
}
class ApiService {
  private token: string | null = null;
  private refreshToken: string | null = null;
  private cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();

  constructor() {
    this.initializeFromStorage();
    this.startCacheCleanup();
  }

  private startCacheCleanup(): void {
    if (typeof window === 'undefined') return;

    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.cache.entries()) {
        if (now - value.timestamp > value.ttl) {
          this.cache.delete(key);
        }
      }
    }, 60000); // Cleanup every minute
  }

  private initializeFromStorage(): void {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token') ?? null;
      this.refreshToken = localStorage.getItem('refresh_token') ?? null;
    }
  }

  setToken(token: string, refreshToken?: string): void {
    this.token = token;
    if (refreshToken !== undefined && refreshToken !== '') {
      this.refreshToken = refreshToken;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      if (refreshToken !== undefined && refreshToken !== '') {
        localStorage.setItem('refresh_token', refreshToken);
      }
    }
    apiLogger.info('Auth token updated');
  }

  clearToken(): void {
    this.token = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
    }
    apiLogger.info('Auth tokens cleared');
  }

  getToken(): string | null {
    return this.token;
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (this.refreshToken === null || this.refreshToken === '') return false;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (response.ok) {
        interface TokenResponse {
          token?: string;
          accessToken?: string;
          refreshToken?: string;
          refresh_token?: string;
        }

        const data = (await response.json().catch(() => ({}) as TokenResponse)) as TokenResponse;
        const token = data.token ?? data.accessToken;
        const refresh = data.refreshToken ?? data.refresh_token;
        if (token !== undefined && token !== '') {
          this.setToken(token, refresh);
        }
        return Boolean(token);
      }
    } catch (error) {
      apiLogger.error('Token refresh failed', error);
    }

    return false;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}, retryCount = 0): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    // Build query string from params
    let finalUrl = url;
    if (options.params !== undefined) {
      const queryString = toURLSearchParams(options.params).toString();
      if (queryString !== '') {
        finalUrl = `${url}?${queryString}`;
      }
    }

    // Get CSRF token from cookie for state-changing requests
    const method = options.method?.toUpperCase() || 'GET';
    const needsCsrf = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    let csrfToken: string | undefined;

    if (needsCsrf && typeof document !== 'undefined') {
      const cookies = document.cookie.split(';');
      const csrfCookie = cookies.find((cookie) => cookie.trim().startsWith('csrf-token='));
      csrfToken = csrfCookie?.split('=')[1]?.trim();
    }

    const config: RequestInit & { params?: QueryParams } = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token !== null && { Authorization: `Bearer ${token}` }),
        ...(csrfToken !== undefined && needsCsrf && { 'x-csrf-token': csrfToken }),
        ...((options.headers as Record<string, string>) || {}),
      },
      credentials: 'include', // Ensure cookies are sent
    };

    // Remove params from config as they're in the URL
    const finalConfig = { ...config } as RequestInit & { params?: Record<string, unknown> };
    delete finalConfig.params;

    try {
      const response = await fetch(finalUrl, finalConfig);

      if (!response.ok) {
        if (response.status === 401 && retryCount === 0) {
          // Try to refresh token
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            return await this.request<T>(endpoint, options, retryCount + 1);
          } else {
            this.clearToken();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
          }
        }

        const errorData = (await response.json().catch(() => null)) as {
          message?: string;
          error?: string;
          msg?: string;
          code?: string;
          errorCode?: string;
        } | null;
        const errorObj = errorData;
        const message =
          errorObj !== null
            ? (errorObj.message ??
              errorObj.error ??
              errorObj.msg ??
              `API Error: ${String(response.status)} ${response.statusText}`)
            : `API Error: ${String(response.status)} ${response.statusText}`;
        const code = errorObj !== null ? (errorObj.code ?? errorObj.errorCode) : undefined;
        throw new ApiError(response.status, message, code, errorData ?? undefined);
      }

      const contentType = response.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        try {
          return (await response.json()) as T;
        } catch {
          // No body or invalid JSON
          return {} as T;
        }
      } else {
        const text = await response.text();
        return text as unknown as T;
      }
    } catch (error: unknown) {
      apiLogger.error('API request failed:', error);
      if (error instanceof ApiError) throw error;
      const message = error instanceof Error ? error.message : 'Network error';
      throw new ApiError(-1, message, undefined, error);
    }
  }

  /**
   * Request with automatic retry using exponential backoff
   * Retries on 429 (rate limit) and 5xx (server errors)
   */
  async requestWithRetry<T>(endpoint: string, options: RequestOptions = {}, retryOptions?: RetryOptions): Promise<T> {
    return withRetry(
      () => this.request<T>(endpoint, options),
      {
        maxAttempts: retryOptions?.maxAttempts ?? 3,
        initialDelay: retryOptions?.initialDelay ?? 1000,
        backoffMultiplier: retryOptions?.backoffMultiplier ?? 2,
        maxDelay: retryOptions?.maxDelay ?? 10000,
        ...retryOptions,
      },
    );
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.token, response.refreshToken);
    return response;
  }

  async register(data: {
    email: string;
    password: string;
    name: string;
    dateOfBirth?: string;
    location?: string;
  }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(response.token, response.refreshToken);
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.clearToken();
    }
  }

  async forgotPassword(email: string): Promise<unknown> {
    return await this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string, confirmPassword: string): Promise<unknown> {
    return await this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password, confirmPassword }),
    });
  }

  async getCurrentUser(): Promise<CurrentUserResponse> {
    return await this.request<CurrentUserResponse>('/auth/me', {
      method: 'GET',
    });
  }

  // Pet endpoints
  async getPets(): Promise<unknown> {
    return await this.request('/pets');
  }

  async getPet(id: string): Promise<unknown> {
    return await this.request(`/pets/${id}`);
  }

  async createPet(data: PetCreateData): Promise<unknown> {
    return await this.request('/pets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePet(id: string, data: PetUpdateData): Promise<unknown> {
    return await this.request(`/pets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePet(id: string): Promise<unknown> {
    return await this.request(`/pets/${id}`, {
      method: 'DELETE',
    });
  }

  async updatePetProfile(data: Partial<PetCreateData>): Promise<unknown> {
    return await this.request('/pets/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Match endpoints
  async getMatches(filters?: PetFilters): Promise<unknown> {
    try {
      const params = new URLSearchParams();
      if (filters?.species) params.append('species', filters.species);
      if (filters?.minAge) params.append('minAge', filters.minAge.toString());
      if (filters?.maxAge) params.append('maxAge', filters.maxAge.toString());
      if (filters?.size) params.append('size', filters.size);
      if (filters?.intent) params.append('intent', filters.intent);
      if (filters?.maxDistance) params.append('maxDistance', filters.maxDistance.toString());
      if (filters?.personalityTags?.length) {
        params.append('personalityTags', filters.personalityTags.join(','));
      }

      const queryString = params.toString();
      const endpoint = queryString ? `/matches?${queryString}` : '/matches';

      return await this.request(endpoint);
    } catch (error) {
      logger.error('Failed to get matches:', { error });
      throw error;
    }
  }

  // Pet Actions API
  async likePet(petId: string): Promise<{ matched?: boolean; matchId?: string }> {
    try {
      return await this.request<{ matched?: boolean; matchId?: string }>(`/pets/${petId}/like`, {
        method: 'POST',
      });
    } catch (error) {
      logger.error('Failed to like pet', { error, petId });
      throw error;
    }
  }

  async passPet(petId: string): Promise<{ success: boolean }> {
    try {
      return await this.request<{ success: boolean }>(`/pets/${petId}/pass`, {
        method: 'POST',
      });
    } catch (error) {
      logger.error('Failed to pass pet', { error, petId });
      throw error;
    }
  }
}

// Create singleton instance
const apiInstance = new ApiService();

// Pet filters interface - aligned with core types
interface PetFilters {
  species?: string;
  minAge?: number;
  maxAge?: number;
  size?: string;
  intent?: string;
  maxDistance?: number;
  personalityTags?: string[];
  // Legacy properties for backward compatibility
  ageRange?: { min: number; max: number };
  sizePreference?: ('small' | 'medium' | 'large')[];
  breedPreference?: string[];
  temperamentPreference?: string[];
  energyLevel?: ('low' | 'medium' | 'high')[];
  goodWithKids?: boolean;
  goodWithPets?: boolean;
  houseTrained?: boolean;
}

// Pets API endpoints
export const petsAPI = {
  async getSwipeablePets(filters?: PetFilters): Promise<unknown> {
    return await apiInstance.request('/pets/discover', {
      params: filters as unknown as QueryParams,
    });
  },

  async likePet(petId: string): Promise<unknown> {
    return await apiInstance.request(`/pets/${petId}/swipe`, {
      method: 'POST',
      body: JSON.stringify({ action: 'like' }),
    });
  },

  async passPet(petId: string): Promise<unknown> {
    return await apiInstance.request(`/pets/${petId}/swipe`, {
      method: 'POST',
      body: JSON.stringify({ action: 'pass' }),
    });
  },

  async superLikePet(petId: string): Promise<unknown> {
    return await apiInstance.request(`/pets/${petId}/swipe`, {
      method: 'POST',
      body: JSON.stringify({ action: 'superlike' }),
    });
  },

  async reportPet(petId: string, reason: string): Promise<unknown> {
    return await apiInstance.request(`/pets/${petId}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
};

// Matches API endpoints
export const matchesAPI = {
  async getMatches(filters?: PetFilters): Promise<unknown> {
    return await apiInstance.getMatches(filters);
  },

  async getMatch(matchId: string): Promise<unknown> {
    return await apiInstance.request(`/matches/${matchId}`);
  },

  async unmatch(matchId: string): Promise<unknown> {
    return await apiInstance.request(`/matches/${matchId}/unmatch`, {
      method: 'POST',
    });
  },
};

// Chat API endpoints
export const chatAPI = {
  async getConversations(): Promise<unknown> {
    return await apiInstance.request('/chat/conversations');
  },

  async getMessages(conversationId: string): Promise<unknown> {
    return await apiInstance.request(`/chat/conversations/${conversationId}/messages`);
  },

  async sendMessage(
    conversationId: string,
    message: string,
    attachments?: MessageAttachment[],
  ): Promise<unknown> {
    return await apiInstance.request(`/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message, attachments }),
    });
  },

  async markAsRead(conversationId: string): Promise<unknown> {
    return await apiInstance.request(`/chat/conversations/${conversationId}/read`, {
      method: 'POST',
    });
  },

  async reactToMessage(matchId: string, messageId: string, emoji: string): Promise<unknown> {
    return await apiInstance.request(`/chat/${matchId}/messages/${messageId}/react`, {
      method: 'POST',
      body: JSON.stringify({ emoji }),
    });
  },
};

// AI API endpoints
export const aiAPI = {
  async generateBio(data: {
    petName: string;
    breed: string;
    age: number;
    temperament: string[];
    specialTraits?: string[];
  }): Promise<unknown> {
    return await apiInstance.request('/ai/generate-bio', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async analyzePhoto(formData: FormData): Promise<unknown> {
    const token = apiInstance.getToken();
    return await fetch(`${API_BASE_URL}/ai/analyze-photo`, {
      method: 'POST',
      headers: {
        ...(token !== null && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    }).then((res) => res.json());
  },

  async analyzeCompatibility(
    petAId: string,
    petBId: string,
    options?: AIAnalysisOptions,
  ): Promise<unknown> {
    return await apiInstance.request('/ai/analyze-compatibility', {
      method: 'POST',
      body: JSON.stringify({ petAId, petBId, ...options }),
    });
  },

  async getChatSuggestions(matchId: string): Promise<unknown> {
    return await apiInstance.request(`/ai/chat-suggestions/${matchId}`, {
      method: 'GET',
    });
  },

  async getSmartRecommendations(userId: string): Promise<unknown> {
    return await apiInstance.request('/ai/recommendations', {
      params: { userId },
    });
  },

  async analyzeBehavior(petId: string, data: BehaviorAnalysisData): Promise<unknown> {
    return await apiInstance.request('/ai/behavior-analysis', {
      method: 'POST',
      body: JSON.stringify({ petId, ...data }),
    });
  },
};

// Import subscription API types
import type {
  ApiResponse,
  CheckoutSessionData,
  CheckoutSessionRequest,
  SubscriptionApi,
  SubscriptionData,
  SubscriptionUpdateRequest,
  UsageStatsData,
  WebhookEventData,
} from './api.subscription';

// Subscription API endpoints
export const subscriptionAPI: SubscriptionApi = {
  async getCurrentSubscription() {
    return await apiInstance.request<ApiResponse<{ subscription: SubscriptionData }>>(
      '/subscription/current',
    );
  },

  async getUsageStats() {
    return await apiInstance.request<ApiResponse<UsageStatsData>>('/subscription/usage');
  },

  async createCheckoutSession(data: CheckoutSessionRequest) {
    return await apiInstance.request<ApiResponse<CheckoutSessionData>>(
      '/subscription/create-checkout',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    );
  },

  async cancelSubscription(subscriptionId: string) {
    return await apiInstance.request<ApiResponse<SubscriptionData>>(
      `/subscription/${subscriptionId}/cancel`,
      {
        method: 'POST',
      },
    );
  },

  async reactivateSubscription(subscriptionId: string) {
    return await apiInstance.request<ApiResponse>(`/subscription/${subscriptionId}/reactivate`, {
      method: 'POST',
    });
  },

  async getPlans() {
    return await apiInstance.request<ApiResponse<{ id: string; name: string; price: number }[]>>(
      '/subscription/plans',
    );
  },

  async updatePaymentMethod(paymentMethodId: string) {
    return await apiInstance.request<ApiResponse>('/subscription/payment-method', {
      method: 'PUT',
      body: JSON.stringify({ paymentMethodId }),
    });
  },

  async handleWebhook(event: WebhookEventData) {
    return await apiInstance.request<ApiResponse>('/subscription/webhook', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  },

  async updateSubscription(subscriptionId: string, data: SubscriptionUpdateRequest) {
    return await apiInstance.request<ApiResponse<SubscriptionData>>(
      `/subscription/${subscriptionId}/update`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    );
  },
};

// Analytics API endpoints
export const analyticsAPI = {
  async trackUserEvent(
    eventType: string,
    metadata: Record<string, unknown> = {},
  ): Promise<unknown> {
    return await apiInstance.request('/analytics/user', {
      method: 'POST',
      body: JSON.stringify({ eventType, metadata }),
    });
  },

  async trackPetEvent(
    petId: string,
    eventType: string,
    metadata: Record<string, unknown> = {},
  ): Promise<unknown> {
    return await apiInstance.request('/analytics/pet', {
      method: 'POST',
      body: JSON.stringify({ petId, eventType, metadata }),
    });
  },

  async trackMatchEvent(
    matchId: string,
    eventType: string,
    metadata: Record<string, unknown> = {},
  ): Promise<unknown> {
    return await apiInstance.request('/analytics/match', {
      method: 'POST',
      body: JSON.stringify({ matchId, eventType, metadata }),
    });
  },

  async getUserAnalytics(): Promise<unknown> {
    return await apiInstance.request('/analytics/user');
  },

  async getPetAnalytics(petId: string): Promise<unknown> {
    return await apiInstance.request(`/analytics/pet/${petId}`);
  },

  async getMatchAnalytics(matchId: string): Promise<unknown> {
    return await apiInstance.request(`/analytics/match/${matchId}`);
  },
};

// Matching API endpoints
export const matchingAPI = {
  async getRecommendations(userId: string): Promise<unknown> {
    return await apiInstance.request(`/matching/recommendations/${userId}`);
  },

  async getCompatibilityAnalysis(petId1: string, petId2: string): Promise<unknown> {
    return await apiInstance.request(`/matching/compatibility/${petId1}/${petId2}`);
  },
};

// Video Call API endpoints
export const videoCallAPI = {
  async createCall(receiverId: string): Promise<unknown> {
    return await apiInstance.request('/video-call/create', {
      method: 'POST',
      body: JSON.stringify({ receiverId }),
    });
  },

  async joinCall(callId: string): Promise<unknown> {
    return await apiInstance.request(`/video-call/${callId}/join`, {
      method: 'POST',
    });
  },

  async endCall(callId: string): Promise<unknown> {
    return await apiInstance.request(`/video-call/${callId}/end`, {
      method: 'POST',
    });
  },

  async sendOffer(callId: string, offer: RTCSessionDescriptionInit): Promise<unknown> {
    return await apiInstance.request(`/video-call/${callId}/offer`, {
      method: 'POST',
      body: JSON.stringify({ offer }),
    });
  },

  async getAnswer(callId: string): Promise<unknown> {
    return await apiInstance.request(`/video-call/${callId}/answer`);
  },

  async sendIceCandidate(callId: string, candidate: unknown): Promise<unknown> {
    return await apiInstance.request(`/video-call/${callId}/ice-candidate`, {
      method: 'POST',
      body: JSON.stringify({ candidate }),
    });
  },

  async startRecording(callId: string): Promise<unknown> {
    return await apiInstance.request(`/video-call/${callId}/recording/start`, {
      method: 'POST',
    });
  },

  async stopRecording(callId: string): Promise<unknown> {
    return await apiInstance.request(`/video-call/${callId}/recording/stop`, {
      method: 'POST',
    });
  },
};

// Export the main API instance and all sub-APIs
export const api = {
  request: apiInstance.request.bind(apiInstance),
  requestWithRetry: apiInstance.requestWithRetry.bind(apiInstance),
  setToken: apiInstance.setToken.bind(apiInstance),
  clearToken: apiInstance.clearToken.bind(apiInstance),
  getToken: apiInstance.getToken.bind(apiInstance),
  login: apiInstance.login.bind(apiInstance),
  register: apiInstance.register.bind(apiInstance),
  logout: apiInstance.logout.bind(apiInstance),
  forgotPassword: apiInstance.forgotPassword.bind(apiInstance),
  resetPassword: apiInstance.resetPassword.bind(apiInstance),
  getCurrentUser: apiInstance.getCurrentUser.bind(apiInstance),
  getPets: apiInstance.getPets.bind(apiInstance),
  getPet: apiInstance.getPet.bind(apiInstance),
  createPet: apiInstance.createPet.bind(apiInstance),
  updatePet: apiInstance.updatePet.bind(apiInstance),
  deletePet: apiInstance.deletePet.bind(apiInstance),
  updatePetProfile: apiInstance.updatePetProfile.bind(apiInstance),
  getMatches: apiInstance.getMatches.bind(apiInstance),
  swipe: apiInstance.swipe.bind(apiInstance),
  getMessages: (matchId: string, params?: { page?: number; limit?: number }) => apiInstance.getMessages(matchId, params),
  sendMessage: apiInstance.sendMessage.bind(apiInstance),
  getWeather: apiInstance.getWeather.bind(apiInstance),
  updateLocation: apiInstance.updateLocation.bind(apiInstance),
  syncPreferences: apiInstance.syncPreferences.bind(apiInstance),
  getSubscription: subscriptionAPI.getCurrentSubscription.bind(subscriptionAPI),
  createSubscription: subscriptionAPI.createCheckoutSession.bind(subscriptionAPI),
  cancelSubscription: subscriptionAPI.cancelSubscription.bind(subscriptionAPI),
  pets: petsAPI,
  matches: matchesAPI,
  chat: chatAPI,
  ai: aiAPI,
  subscription: subscriptionAPI,
  analytics: analyticsAPI,
  matching: matchingAPI,
  videoCall: videoCallAPI,
};

export default api;
