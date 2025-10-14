/**
 * Matching Service
 * Handles pet matching logic and compatibility calculations
 */
import { logger } from '@pawfectmatch/core';

// Temporary fallback until core package is properly built
const errorHandler = {
  handleApiError: (error: Error, context: unknown, apiInfo: unknown) => {
    logger.error('API Error:', { error: error.message, context, apiInfo });
  },
  handleError: (error: Error, context: unknown, options: unknown) => {
    logger.error('Error:', { error: error.message, context, options });
  }
};

// Local interfaces for this service
export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  size: string;
  personalityTags: string[];
  intent: string;
}

export interface PetFilters {
  species?: string;
  minAge?: number;
  maxAge?: number;
  size?: string;
  intent?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// Base API URL from environment variable
const API_BASE_URL = (process.env['NEXT_PUBLIC_API_URL'] as string | undefined) ?? '/api';

/**
 * Generic fetch wrapper for matching endpoints
 */
async function fetchMatchingApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token && token.trim().length > 0) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({ message: undefined }))) as {
      message?: string;
    };
    throw new Error(errorData.message ?? `API error: ${response.status.toString()}`);
  }

  return (await response.json()) as ApiResponse<T>;
}

class MatchingService {
  /**
   * Calculate compatibility score between two pets
   */
  calculateCompatibilityScore(pet1: Pet, pet2: Pet): number {
    let score = 0;

    // Species match (30 points)
    if (pet1.species === pet2.species) {
      score += 30;
    }

    // Intent match (25 points)
    if (pet1.intent === pet2.intent || pet1.intent === 'all' || pet2.intent === 'all') {
      score += 25;
    }

    // Size compatibility (15 points)
    const sizeCompatibility = this.calculateSizeCompatibility(pet1.size, pet2.size);
    score += sizeCompatibility * 15;

    // Age compatibility (15 points)
    const ageDiff = Math.abs(pet1.age - pet2.age);
    const ageScore = Math.max(0, 1 - ageDiff / 10);
    score += ageScore * 15;

    // Personality tags overlap (15 points)
    const commonTags = pet1.personalityTags.filter((tag: string) =>
      pet2.personalityTags.includes(tag),
    );
    const personalityScore =
      commonTags.length / Math.max(pet1.personalityTags.length, pet2.personalityTags.length, 1);
    score += personalityScore * 15;

    return Math.round(Math.min(100, Math.max(0, score)));
  }

  /**
   * Calculate size compatibility
   */
  private calculateSizeCompatibility(size1: string, size2: string): number {
    const sizeOrder = ['tiny', 'small', 'medium', 'large', 'extra-large'];
    const index1 = sizeOrder.indexOf(size1);
    const index2 = sizeOrder.indexOf(size2);

    if (index1 === -1 || index2 === -1) return 0.5;

    const diff = Math.abs(index1 - index2);
    return Math.max(0, 1 - diff * 0.25);
  }

  /**
   * Get pet recommendations
   */
  async getRecommendations(userId: string, intent?: string): Promise<Pet[]> {
    try {
      const response = await fetchMatchingApi<Pet[]>(
        `/matching/recommendations?userId=${encodeURIComponent(userId)}`,
      );
      if (!response.success || !response.data) {
        errorHandler.handleError(
          new Error('Failed to fetch recommendations'),
          { response, userId },
          {},
        );
        return [];
      }
      let recommendations = response.data;
      if (intent && intent.trim().length > 0) {
        recommendations = recommendations.filter(
          (pet: Pet) => pet.intent === intent || pet.intent === 'all',
        );
      }
      return recommendations;
    } catch (error) {
      // Cast error to Error type for strict typing
      const typedError = error instanceof Error ? error : new Error(String(error));
      errorHandler.handleError(typedError, { error, userId }, {});
      return [];
    }
  }

  /**
   * Get compatibility analysis
   */
  async getCompatibilityAnalysis(
    petId1: string,
    petId2: string,
  ): Promise<{ score: number; reasons: string[] } | null> {
    try {
      const response = await fetchMatchingApi<{ score: number; reasons: string[] }>(
        '/matching/compatibility',
        {
          method: 'POST',
          body: JSON.stringify({ petId1, petId2 }),
        },
      );
      if (!response.success || !response.data) {
        logger.error('Failed to fetch compatibility analysis', { response, petId1, petId2 });
        return null;
      }
      return response.data;
    } catch (error) {
      logger.error('Failed to get compatibility analysis', { error, petId1, petId2 });
      return null;
    }
  }

  /**
   * Apply filters to pet list
   */
  applyFilters(pets: Pet[], filters: PetFilters): Pet[] {
    return pets.filter((pet: Pet) => {
      if (filters.species && filters.species.length > 0 && pet.species !== filters.species)
        return false;
      if (typeof pet.age !== 'number') return false;
      if (filters.minAge !== undefined && pet.age < filters.minAge) return false;
      if (filters.maxAge !== undefined && pet.age > filters.maxAge) return false;
      if (filters.size && filters.size.length > 0 && pet.size !== filters.size) return false;
      if (
        filters.intent &&
        filters.intent.length > 0 &&
        pet.intent !== filters.intent &&
        pet.intent !== 'all'
      )
        return false;
      return true;
    });
  }

  /**
   * Sort recommendations by compatibility score
   */
  sortRecommendations(recommendations: Pet[]): Pet[] {
    return [...recommendations].sort((a, b) => {
      // Sort by name if no compatibility score available
      return a.name.localeCompare(b.name);
    });
  }
}


export {
  API_BASE_URL, errorHandler, fetchMatchingApi, MatchingService
};

