/**
 * Authentication Service for PawfectMatch Mobile App
 * Handles user authentication, token management, and secure storage
 */
import * as SecureStore from 'expo-secure-store';
import { logger } from '@pawfectmatch/core';
import { api } from './api';

// Types for authentication
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    profileComplete: boolean;
    subscriptionStatus: string;
    createdAt: string;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  profileComplete: boolean;
  subscriptionStatus: string;
  createdAt: string;
}

class AuthService {
  private static readonly ACCESS_TOKEN_KEY = 'auth_access_token';
  private static readonly REFRESH_TOKEN_KEY = 'auth_refresh_token';
  private static readonly USER_KEY = 'auth_user';

  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      // Store authentication data securely
      await this.storeAuthData(response);

      logger.info('User logged in successfully', { userId: response.user.id });
      return response;
    } catch (error) {
      logger.error('Login failed', { error, email: credentials.email });
      throw new AuthError('Login failed. Please check your credentials and try again.', error);
    }
  }

  /**
   * Register new user account
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Validate password confirmation
      if (data.password !== data.confirmPassword) {
        throw new AuthError('Passwords do not match');
      }

      const { confirmPassword, ...registerData } = data;
      const response = await api.request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(registerData),
      });

      // Store authentication data securely
      await this.storeAuthData(response);

      logger.info('User registered successfully', { userId: response.user.id });
      return response;
    } catch (error) {
      logger.error('Registration failed', { error, email: data.email });
      throw new AuthError('Registration failed. Please try again.', error);
    }
  }

  /**
   * Logout user and clear stored data
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = await this.getRefreshToken();
      if (refreshToken) {
        // Notify server about logout (optional)
        try {
          await api.request('/auth/logout', {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
          });
        } catch (error) {
          // Ignore server logout errors
          logger.warn('Server logout failed, continuing with local logout', { error });
        }
      }

      // Clear all stored auth data
      await this.clearAuthData();
      logger.info('User logged out successfully');
    } catch (error) {
      logger.error('Logout failed', { error });
      // Even if logout fails, clear local data
      await this.clearAuthData();
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<AuthResponse | null> {
    try {
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) {
        return null;
      }

      const response = await api.request<AuthResponse>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });

      // Store new tokens
      await this.storeAuthData(response);
      return response;
    } catch (error) {
      logger.error('Token refresh failed', { error });
      // Clear invalid tokens
      await this.clearAuthData();
      return null;
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.request<{ success: boolean; message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      logger.info('Password reset requested', { email });
      return response;
    } catch (error) {
      logger.error('Forgot password failed', { error, email });
      throw new AuthError('Failed to send password reset email. Please try again.', error);
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordData): Promise<{ success: boolean; message: string }> {
    try {
      if (data.password !== data.confirmPassword) {
        throw new AuthError('Passwords do not match');
      }

      const { confirmPassword, ...resetData } = data;
      const response = await api.request<{ success: boolean; message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(resetData),
      });

      logger.info('Password reset successful');
      return response;
    } catch (error) {
      logger.error('Password reset failed', { error });
      throw new AuthError('Failed to reset password. Please try again.', error);
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await SecureStore.getItemAsync(AuthService.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      logger.error('Failed to get current user', { error });
      return null;
    }
  }

  /**
   * Get stored access token
   */
  async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(AuthService.ACCESS_TOKEN_KEY);
    } catch (error) {
      logger.error('Failed to get access token', { error });
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      const user = await this.getCurrentUser();
      return !!(token && user);
    } catch (error) {
      logger.error('Authentication check failed', { error });
      return false;
    }
  }

  /**
   * Update user profile data
   */
  async updateUser(userData: Partial<User>): Promise<void> {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new AuthError('No authenticated user found');
      }

      const updatedUser = { ...currentUser, ...userData };
      await SecureStore.setItemAsync(AuthService.USER_KEY, JSON.stringify(updatedUser));
      logger.info('User data updated', { userId: updatedUser.id });
    } catch (error) {
      logger.error('Failed to update user data', { error });
      throw new AuthError('Failed to update user data', error);
    }
  }

  // Private helper methods

  private async storeAuthData(response: AuthResponse): Promise<void> {
    try {
      await Promise.all([
        SecureStore.setItemAsync(AuthService.ACCESS_TOKEN_KEY, response.accessToken),
        SecureStore.setItemAsync(AuthService.REFRESH_TOKEN_KEY, response.refreshToken),
        SecureStore.setItemAsync(AuthService.USER_KEY, JSON.stringify(response.user)),
      ]);
    } catch (error) {
      logger.error('Failed to store auth data', { error });
      throw new AuthError('Failed to save authentication data', error);
    }
  }

  private async clearAuthData(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(AuthService.ACCESS_TOKEN_KEY),
        SecureStore.deleteItemAsync(AuthService.REFRESH_TOKEN_KEY),
        SecureStore.deleteItemAsync(AuthService.USER_KEY),
      ]);
    } catch (error) {
      logger.error('Failed to clear auth data', { error });
      // Don't throw here as this is cleanup
    }
  }

  private async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(AuthService.REFRESH_TOKEN_KEY);
    } catch (error) {
      logger.error('Failed to get refresh token', { error });
      return null;
    }
  }
}

// Custom error class for authentication errors
export class AuthError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'AuthError';
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
