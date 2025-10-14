export interface PersonalityArchetype {
  name: string;
  description: string;
  icon: string;
  traits: string[];
  compatibility: string[];
  energyLevel: 'low' | 'medium' | 'high' | 'very-high';
  independence: 'low' | 'medium' | 'high';
  sociability: 'low' | 'medium' | 'high';
}

export interface PersonalityScore {
  energy: number;
  independence: number;
  sociability: number;
}

export interface PetPersonality {
  petId: string;
  primaryArchetype: string;
  secondaryArchetype: string;
  personalityScore: PersonalityScore;
  description: string;
  compatibilityTips: string;
  compatibilityInsights: {
    energyMatch: string;
    socialMatch: string;
    independenceMatch: string;
  };
  traits: string[];
  createdAt: string;
}

export interface CompatibilityAnalysis {
  pet1Id: string;
  pet2Id: string;
  interactionType: 'playdate' | 'mating' | 'adoption' | 'cohabitation';
  compatibilityScore: number;
  compatibility_score?: number; // Legacy field for backwards compatibility
  analysis: {
    energyCompatibility: {
      score: number;
      description: string;
    };
    socialCompatibility: {
      score: number;
      description: string;
    };
    independenceCompatibility: {
      score: number;
      description: string;
    };
  };
  recommendations: string[];
  interview_questions?: string[]; // AI-generated interview questions for adoption assessment
  factors?: string[]; // Compatibility factors
  recommendation?: string; // Overall recommendation text
  createdAt: string;
}

import { errorHandler } from './errorHandler';

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

interface PersonalityApiResponse {
  success: boolean;
  data: PetPersonality;
}

interface CompatibilityApiResponse {
  success: boolean;
  data: CompatibilityAnalysis;
}

interface ArchetypesApiResponse {
  success: boolean;
  data: {
    archetypes: Record<string, PersonalityArchetype>;
  };
}

class PersonalityService {
  /**
   * Generate personality archetype for a pet
   */
  async generatePersonality(data: {
    petId: string;
    breed?: string;
    age?: number;
    personalityTags?: string[];
    description?: string;
  }): Promise<PetPersonality> {
    try {
      const response = await fetch('/api/personality/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') ?? ''}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as ApiErrorResponse;
        const errorMessage =
          errorData.message ?? `Failed to generate personality (${response.status.toString()})`;
        const error = new Error(errorMessage);
        const userId = localStorage.getItem('userId');
        errorHandler.handleApiError(
          error,
          {
            component: 'PersonalityService',
            action: 'generatePersonality',
            ...(userId ? { userId } : {}),
            metadata: { status: response.status, data, errorData },
          },
          {
            endpoint: '/api/personality/generate',
            method: 'POST',
            statusCode: response.status,
          },
        );
        throw error;
      }
      const result = (await response.json()) as PersonalityApiResponse;
      return result.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      const networkError = new Error('Unable to generate personality. Please try again.');
      errorHandler.handleNetworkError(networkError, {
        component: 'PersonalityService',
        action: 'generatePersonality',
        metadata: { data },
      });
      throw networkError;
    }
  }

  /**
   * Get personality compatibility between two pets
   */
  async getCompatibility(data: {
    pet1Id: string;
    pet2Id: string;
    interactionType?: 'playdate' | 'mating' | 'adoption' | 'cohabitation';
  }): Promise<CompatibilityAnalysis> {
    try {
      const response = await fetch('/api/personality/compatibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') ?? ''}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as ApiErrorResponse;
        const errorMessage =
          errorData.message ?? `Failed to analyze compatibility (${response.status.toString()})`;
        const error = new Error(errorMessage);
        const userId = localStorage.getItem('userId');
        errorHandler.handleApiError(
          error,
          {
            component: 'PersonalityService',
            action: 'getCompatibility',
            ...(userId ? { userId } : {}),
            metadata: { status: response.status, data, errorData },
          },
          {
            endpoint: '/api/personality/compatibility',
            method: 'POST',
            statusCode: response.status,
          },
        );
        throw error;
      }
      const result = (await response.json()) as CompatibilityApiResponse;
      return result.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      const networkError = new Error('Unable to analyze compatibility. Please try again.');
      errorHandler.handleNetworkError(networkError, {
        component: 'PersonalityService',
        action: 'getCompatibility',
        metadata: { data },
      });
      throw networkError;
    }
  }

  /**
   * Get all personality archetypes
   */
  async getArchetypes(): Promise<Record<string, PersonalityArchetype>> {
    try {
      const response = await fetch('/api/personality/archetypes', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
        },
      });
      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as ApiErrorResponse;
        const errorMessage =
          errorData.message ?? `Failed to load personality types (${response.status.toString()})`;
        const error = new Error(errorMessage);
        const userId = localStorage.getItem('userId');
        errorHandler.handleApiError(
          error,
          {
            component: 'PersonalityService',
            action: 'getArchetypes',
            ...(userId ? { userId } : {}),
            metadata: { status: response.status, errorData },
          },
          {
            endpoint: '/api/personality/archetypes',
            method: 'GET',
            statusCode: response.status,
          },
        );
        throw error;
      }
      const result = (await response.json()) as ArchetypesApiResponse;
      return result.data.archetypes;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      const networkError = new Error('Unable to load personality types. Please try again.');
      errorHandler.handleNetworkError(networkError, {
        component: 'PersonalityService',
        action: 'getArchetypes',
      });
      throw networkError;
    }
  }

  /**
   * Get archetype by key
   */
  async getArchetype(key: string): Promise<PersonalityArchetype | null> {
    try {
      const archetypes = await this.getArchetypes();
      return archetypes[key] ?? null;
    } catch (error) {
      errorHandler.handleError(
        error instanceof Error ? error : new Error('Failed to get archetype'),
        {
          component: 'PersonalityService',
          action: 'getArchetype',
          metadata: { key },
        },
        { showNotification: false },
      );
      return null;
    }
  }

  /**
   * Calculate personality compatibility score
   */
  calculateCompatibilityScore(pet1: PetPersonality, pet2: PetPersonality): number {
    const energyDiff = Math.abs(pet1.personalityScore.energy - pet2.personalityScore.energy);
    const independenceDiff = Math.abs(
      pet1.personalityScore.independence - pet2.personalityScore.independence,
    );
    const sociabilityDiff = Math.abs(
      pet1.personalityScore.sociability - pet2.personalityScore.sociability,
    );

    const avgDifference = (energyDiff + independenceDiff + sociabilityDiff) / 3;
    return Math.max(0, 100 - avgDifference * 10);
  }

  /**
   * Get compatibility level description
   */
  getCompatibilityLevel(score: number): { level: string; color: string; description: string } {
    if (score >= 80) {
      return {
        level: 'Excellent',
        color: 'text-green-600',
        description: 'These pets should get along very well',
      };
    } else if (score >= 60) {
      return {
        level: 'Good',
        color: 'text-blue-600',
        description: 'Good potential match with some considerations',
      };
    } else if (score >= 40) {
      return {
        level: 'Moderate',
        color: 'text-yellow-600',
        description: 'Moderate compatibility - proceed with caution',
      };
    } else {
      return {
        level: 'Low',
        color: 'text-red-600',
        description: 'Low compatibility - may not be suitable',
      };
    }
  }

  /**
   * Get energy level description
   */
  getEnergyLevelDescription(score: number): string {
    if (score >= 8) return 'Very High Energy';
    if (score >= 6) return 'High Energy';
    if (score >= 4) return 'Medium Energy';
    return 'Low Energy';
  }

  /**
   * Get independence level description
   */
  getIndependenceLevelDescription(score: number): string {
    if (score >= 7) return 'Very Independent';
    if (score >= 5) return 'Moderately Independent';
    return 'Low Independence';
  }

  /**
   * Get sociability level description
   */
  getSociabilityLevelDescription(score: number): string {
    if (score >= 7) return 'Very Social';
    if (score >= 5) return 'Moderately Social';
    return 'Low Sociability';
  }
}

export const personalityService = new PersonalityService();
export default personalityService;
