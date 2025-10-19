/**
 * 🛠️ ADMIN API SERVICE
 * Complete API service for admin panel functionality
 */

import { AdminStats, User, Pet, Match, SystemLog, NotificationRequest, SystemHealth, MemoryUsage, ApiResponse } from '@/types';


// HTTP Client for Admin API
class AdminHttpClient {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('accessToken');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Admin API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: Record<string, unknown>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: Record<string, unknown>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

class AdminApiService {
  private http = new AdminHttpClient();
  private baseUrl = '/admin';

  /**
   * Get comprehensive platform statistics
   */
  async getStats(): Promise<AdminStats> {
    const response = await this.http.get<{ success: boolean; data: AdminStats }>(`${this.baseUrl}/stats`);
    return response.data;
  }

  /**
   * Get all users with pagination and filtering
   */
  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'all' | 'premium' | 'verified' | 'unverified';
  } = {}): Promise<{
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);

    const response = await this.http.get<ApiResponse<{ users: User[]; pagination: { page: number; limit: number; total: number; pages: number } }>>(`${this.baseUrl}/users?${queryParams}`);
    return response.data;
  }

  /**
   * Update user information
   */
  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const response = await this.http.put<{ success: boolean; data: User }>(`${this.baseUrl}/users/${userId}`, updates);
    return response.data;
  }

  /**
   * Delete user and all associated data
   */
  async deleteUser(userId: string): Promise<void> {
    await this.http.delete(`${this.baseUrl}/users/${userId}`);
  }

  /**
   * Get all pets with filtering
   */
  async getPets(params: {
    page?: number;
    limit?: number;
    species?: string;
    search?: string;
  } = {}): Promise<{
    pets: Pet[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.species) queryParams.append('species', params.species);
    if (params.search) queryParams.append('search', params.search);

    const response = await this.http.get<ApiResponse<{ pets: Pet[]; pagination: { page: number; limit: number; total: number; pages: number } }>>(`${this.baseUrl}/pets?${queryParams}`);
    return response.data;
  }

  /**
   * Get all matches with filtering
   */
  async getMatches(params: {
    page?: number;
    limit?: number;
    status?: 'all' | 'active' | 'inactive' | 'blocked';
  } = {}): Promise<{
    matches: Match[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status) queryParams.append('status', params.status);

    const response = await this.http.get<ApiResponse<{ matches: Match[]; pagination: { page: number; limit: number; total: number; pages: number } }>>(`${this.baseUrl}/matches?${queryParams}`);
    return response.data;
  }

  /**
   * Get system metrics
   */
  async getMetrics(): Promise<Record<string, unknown>> {
    const response = await this.http.get<ApiResponse<Record<string, unknown>>>(`${this.baseUrl}/metrics`);
    return response.data;
  }

  /**
   * Reset system metrics
   */
  async resetMetrics(): Promise<void> {
    await this.http.post(`${this.baseUrl}/metrics/reset`);
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<Record<string, unknown>> {
    const response = await this.http.get<ApiResponse<Record<string, unknown>>>(`${this.baseUrl}/cache/stats`);
    return response.data;
  }

  /**
   * Clear all cache
   */
  async clearCache(): Promise<{ deletedCount: number }> {
    const response = await this.http.post<{ success: boolean; data: { deletedCount: number } }>(`${this.baseUrl}/cache/clear`);
    return response.data;
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidateCache(pattern: string): Promise<{ deletedCount: number }> {
    const response = await this.http.post<{ success: boolean; data: { deletedCount: number } }>(`${this.baseUrl}/cache/invalidate`, { pattern });
    return response.data;
  }

  /**
   * Get system information
   */
  async getSystemInfo(): Promise<Record<string, unknown>> {
    const response = await this.http.get<ApiResponse<Record<string, unknown>>>(`${this.baseUrl}/system/info`);
    return response.data;
  }

  /**
   * Send notification to users
   */
  async sendNotification(request: NotificationRequest): Promise<{
    sent: number;
    failed: number;
    total: number;
  }> {
    const response = await this.http.post<ApiResponse<{ sent: number; failed: number; total: number }>>(`${this.baseUrl}/notifications/send`, request);
    return response.data;
  }

  /**
   * Get system logs
   */
  async getLogs(params: {
    level?: 'all' | 'info' | 'warn' | 'error';
    limit?: number;
    search?: string;
  } = {}): Promise<SystemLog[]> {
    const queryParams = new URLSearchParams();
    if (params.level) queryParams.append('level', params.level);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);

    const response = await this.http.get<{ success: boolean; data: SystemLog[] }>(`${this.baseUrl}/logs?${queryParams}`);
    return response.data;
  }

  /**
   * Restart system services
   */
  async restartSystem(service: string = 'all'): Promise<void> {
    await this.http.post(`${this.baseUrl}/system/restart`, { service });
  }

  /**
   * Create database backup
   */
  async createBackup(type: string = 'full'): Promise<{
    backupId: string;
    estimatedTime: string;
  }> {
    const response = await this.http.post<ApiResponse<{ backupId: string; estimatedTime: string }>>(`${this.baseUrl}/database/backup`, { type });
    return response.data;
  }

  /**
   * Get API endpoint statistics
   */
  async getApiEndpoints(): Promise<Array<{
    method: string;
    path: string;
    calls: number;
    avgTime: string;
    errors: number;
  }>> {
    // This would typically come from your monitoring system
    // For now, return mock data
    return [
      { method: 'GET', path: '/api/users', calls: 1250, avgTime: '45ms', errors: 2 },
      { method: 'POST', path: '/api/pets', calls: 890, avgTime: '120ms', errors: 5 },
      { method: 'GET', path: '/api/matches', calls: 2100, avgTime: '65ms', errors: 1 },
      { method: 'POST', path: '/api/auth/login', calls: 3400, avgTime: '85ms', errors: 12 },
      { method: 'GET', path: '/api/pets/discover', calls: 5600, avgTime: '95ms', errors: 8 },
      { method: 'POST', path: '/api/premium/subscribe', calls: 450, avgTime: '200ms', errors: 3 },
      { method: 'GET', path: '/api/analytics/user', calls: 1800, avgTime: '75ms', errors: 4 },
      { method: 'POST', path: '/api/messages/send', calls: 3200, avgTime: '55ms', errors: 6 },
    ];
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    services: Array<{
      name: string;
      status: 'healthy' | 'warning' | 'critical';
      uptime?: string;
      lastCheck: string;
    }>;
  }> {
    // This would typically come from your monitoring system
    // For now, return mock data
    return {
      status: 'healthy',
      services: [
        { name: 'Server', status: 'healthy', uptime: '15d 8h 32m', lastCheck: new Date().toISOString() },
        { name: 'Database', status: 'healthy', uptime: '15d 8h 32m', lastCheck: new Date().toISOString() },
        { name: 'Redis Cache', status: 'healthy', uptime: '15d 8h 32m', lastCheck: new Date().toISOString() },
        { name: 'WebSocket', status: 'healthy', uptime: '15d 8h 32m', lastCheck: new Date().toISOString() },
        { name: 'AI Service', status: 'healthy', uptime: '15d 8h 32m', lastCheck: new Date().toISOString() },
        { name: 'CDN', status: 'healthy', uptime: '15d 8h 32m', lastCheck: new Date().toISOString() },
      ]
    };
  }

  /**
   * Export user data
   */
  async exportUserData(userId: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/users/${userId}/export`, {
      headers: {
        ...(this.http['token'] && { Authorization: `Bearer ${this.http['token']}` }),
      },
    });
    return response.blob();
  }

  /**
   * Bulk user operations
   */
  async bulkUserOperation(operation: string, userIds: string[], data?: Record<string, unknown>): Promise<{
    success: number;
    failed: number;
    errors: Array<{ userId: string; error: string }>;
  }> {
    const response = await this.http.post<ApiResponse<{ success: number; failed: number; errors: Array<{ userId: string; error: string }> }>>(`${this.baseUrl}/users/bulk`, {
      operation,
      userIds,
      data
    });
    return response.data;
  }

  /**
   * Get platform analytics
   */
  async getPlatformAnalytics(period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<{
    userGrowth: Array<{ date: string; count: number }>;
    matchRate: Array<{ date: string; rate: number }>;
    revenue: Array<{ date: string; amount: number }>;
    engagement: Array<{ date: string; sessions: number; duration: number }>;
  }> {
    const response = await this.http.get<ApiResponse<{ userGrowth: Array<{ date: string; count: number }>; matchRate: Array<{ date: string; rate: number }>; revenue: Array<{ date: string; amount: number }>; engagement: Array<{ date: string; sessions: number; duration: number }> }>>(`${this.baseUrl}/analytics/platform?period=${period}`);
    return response.data;
  }

  /**
   * Manage feature flags
   */
  async getFeatureFlags(): Promise<Array<{
    name: string;
    enabled: boolean;
    description: string;
    usersAffected: number;
  }>> {
    const response = await this.http.get<ApiResponse<Array<{ name: string; enabled: boolean; description: string; usersAffected: number }>>>(`${this.baseUrl}/features/flags`);
    return response.data;
  }

  async updateFeatureFlag(name: string, enabled: boolean): Promise<void> {
    await this.http.put(`${this.baseUrl}/features/flags/${name}`, { enabled });
  }

  /**
   * Security operations
   */
  async getSecurityAlerts(): Promise<Array<{
    id: string;
    type: 'suspicious_login' | 'rate_limit_exceeded' | 'invalid_token' | 'other';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: string;
    userId?: string;
    ip?: string;
    resolved: boolean;
  }>> {
    const response = await this.http.get<ApiResponse<Array<{ id: string; type: 'suspicious_login' | 'rate_limit_exceeded' | 'invalid_token' | 'other'; severity: 'low' | 'medium' | 'high' | 'critical'; message: string; timestamp: string; userId?: string; ip?: string; resolved: boolean }>>>(`${this.baseUrl}/security/alerts`);
    return response.data;
  }

  async resolveSecurityAlert(alertId: string): Promise<void> {
    await this.http.put(`${this.baseUrl}/security/alerts/${alertId}/resolve`);
  }

  /**
   * Content moderation
   */
  async getModerationQueue(): Promise<Array<{
    id: string;
    type: 'pet_profile' | 'user_profile' | 'message' | 'photo';
    content: unknown;
    reportedBy: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
  }>> {
    const response = await this.http.get<ApiResponse<Array<{ id: string; type: 'pet_profile' | 'user_profile' | 'message' | 'photo'; content: Record<string, unknown>; reportedBy: string; reason: string; status: 'pending' | 'approved' | 'rejected'; createdAt: string }>>>(`${this.baseUrl}/moderation/queue`);
    return response.data;
  }

  async moderateContent(contentId: string, action: 'approve' | 'reject', reason?: string): Promise<void> {
    await this.http.post(`${this.baseUrl}/moderation/${contentId}`, { action, reason });
  }
}

// Create singleton instance
const adminApiService = new AdminApiService();

export default adminApiService;
