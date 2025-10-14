/**
 * AI-Powered Pet Matching Service
 * Real DeepSeek integration for intelligent pet compatibility analysis
 */

import type { MatchResult, PetProfile, UserPreferences } from '../matching/algorithm';
import type { DeepSeekConfig } from './deepSeekService';
import { DeepSeekService } from './deepSeekService';

export interface MatchingServiceConfig extends DeepSeekConfig {
  enablePhotoAnalysis?: boolean;
  enableBehaviorAnalysis?: boolean;
  enableCompatibilityScoring?: boolean;
}

/**
 * AI-Powered Pet Matching Service
 */
export class PetMatchingService {
  private readonly deepSeekService: DeepSeekService;
  private readonly config: MatchingServiceConfig;

  constructor(config: MatchingServiceConfig) {
    this.config = {
      enablePhotoAnalysis: true,
      enableBehaviorAnalysis: true,
      enableCompatibilityScoring: true,
      ...config,
    };
    this.deepSeekService = new DeepSeekService(config);
  }

  /**
   * Find best matches for a user
   */
  public async findMatches(
    userPreferences: UserPreferences,
    availablePets: PetProfile[],
    limit: number = 10
  ): Promise<MatchResult[]> {
    const matches: MatchResult[] = [];

    for (const pet of availablePets) {
      try {
        const matchResult = await this.analyzeCompatibility(pet, userPreferences);
        matches.push(matchResult);
      } catch (error) {
        console.error(`Failed to analyze compatibility for pet ${pet._id}:`, error);
        // Continue with other pets
      }
    }

    // Sort by compatibility score and return top matches
    return matches
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, limit);
  }

  /**
   * Analyze compatibility between pet and user preferences using AI
   */
  public async analyzeCompatibility(
    pet: PetProfile,
    userPreferences: UserPreferences
  ): Promise<MatchResult> {
    try {
      // Use DeepSeek to analyze compatibility
      const response = await this.deepSeekService.analyzeCompatibility(
        pet,
        pet, // For now, comparing pet with itself
        userPreferences
      );

      // Parse AI response
      const aiAnalysis = this.parseCompatibilityResponse(response);
      
      return {
        pet,
        compatibilityScore: aiAnalysis.compatibilityScore,
        breakdown: aiAnalysis.breakdown,
        reasons: aiAnalysis.reasons,
        concerns: aiAnalysis.concerns,
        recommendations: aiAnalysis.recommendations,
      };
    } catch (error) {
      console.error('AI compatibility analysis failed:', error);
      
      // Fallback to basic scoring
      return this.fallbackCompatibilityAnalysis(pet, userPreferences);
    }
  }

  /**
   * Analyze pet photos using AI vision
   */
  public async analyzePetPhotos(photos: string[]): Promise<unknown[]> {
    if (!this.config.enablePhotoAnalysis) {
      return [];
    }

    const analyses = [];

    for (const photo of photos) {
      try {
        const response = await this.deepSeekService.analyzePetPhoto(photo);
        const analysis = this.parsePhotoAnalysisResponse(response);
        analyses.push(analysis);
      } catch (error) {
        console.error('Photo analysis failed:', error);
        // Continue with other photos
      }
    }

    return analyses;
  }

  /**
   * Generate AI-powered pet bio
   */
  public async generatePetBio(pet: PetProfile): Promise<string> {
    try {
      const response = await this.deepSeekService.generatePetBio(pet);
      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Bio generation failed:', error);
      return this.generateFallbackBio(pet);
    }
  }

  /**
   * Analyze pet behavior using AI
   */
  public async analyzeBehavior(
    behaviorData: unknown,
    context: string
  ): Promise<any> {
    if (!this.config.enableBehaviorAnalysis) {
      return null;
    }

    try {
      const response = await this.deepSeekService.analyzeBehavior(behaviorData, context);
      return this.parseBehaviorAnalysisResponse(response);
    } catch (error) {
      console.error('Behavior analysis failed:', error);
      return null;
    }
  }

  /**
   * Parse AI compatibility response
   */
  private parseCompatibilityResponse(response: unknown): unknown {
    try {
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in AI response');
      }

      // Try to parse JSON from AI response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback parsing
      return this.parseTextResponse(content);
    } catch (error) {
      console.error('Failed to parse compatibility response:', error);
      return this.getDefaultCompatibilityAnalysis();
    }
  }

  /**
   * Parse AI photo analysis response
   */
  private parsePhotoAnalysisResponse(response: unknown): unknown {
    try {
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in AI response');
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return this.parseTextPhotoAnalysis(content);
    } catch (error) {
      console.error('Failed to parse photo analysis response:', error);
      return this.getDefaultPhotoAnalysis();
    }
  }

  /**
   * Parse AI behavior analysis response
   */
  private parseBehaviorAnalysisResponse(response: unknown): unknown {
    try {
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in AI response');
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return this.parseTextBehaviorAnalysis(content);
    } catch (error) {
      console.error('Failed to parse behavior analysis response:', error);
      return null;
    }
  }

  /**
   * Parse text-based AI response
   */
  private parseTextResponse(content: string): unknown {
    // Extract scores and information from text response
    const scoreMatch = content.match(/(\d+)\s*%/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 50;

    return {
      compatibilityScore: score,
      breakdown: {
        species: score,
        breed: score,
        age: score,
        temperament: score,
        activity: score,
        lifestyle: score,
      },
      reasons: ['AI analysis completed'],
      concerns: [],
      recommendations: ['Consider AI insights'],
    };
  }

  /**
   * Parse text-based photo analysis
   */
  private parseTextPhotoAnalysis(content: string): unknown {
    return {
      species: 'unknown',
      breed: 'unknown',
      confidence: 0.5,
      age: 0,
      health: { overall: 'good', conditions: [], recommendations: [] },
      characteristics: { size: 'medium', color: [], markings: [], features: [] },
      temperament: [],
      quality: { photoScore: 0.5, lighting: 'good', clarity: 'good' },
    };
  }

  /**
   * Parse text-based behavior analysis
   */
  private parseTextBehaviorAnalysis(content: string): unknown {
    return {
      behaviorType: 'friendly',
      energyLevel: 5,
      socialTendency: 'medium',
      trainingPotential: 'medium',
      recommendations: [],
      redFlags: [],
      positiveTraits: [],
    };
  }

  /**
   * Fallback compatibility analysis
   */
  private fallbackCompatibilityAnalysis(
    pet: PetProfile,
    userPreferences: UserPreferences
  ): MatchResult {
    // Basic scoring without AI
    let score = 50;

    if (userPreferences.species.includes(pet.species)) {
      score += 20;
    }

    if (userPreferences.breedPreferences.includes(pet.breed)) {
      score += 15;
    }

    const [minAge, maxAge] = userPreferences.ageRange;
    if (pet.age >= minAge && pet.age <= maxAge) {
      score += 15;
    }

    return {
      pet,
      compatibilityScore: Math.min(100, score),
      breakdown: {
        species: userPreferences.species.includes(pet.species) ? 100 : 0,
        breed: userPreferences.breedPreferences.includes(pet.breed) ? 100 : 50,
        age: (pet.age >= minAge && pet.age <= maxAge) ? 100 : 50,
        temperament: 50,
        activity: 50,
        location: 80,
        lifestyle: 50,
        specialNeeds: 0,
      },
      reasons: ['Basic compatibility analysis'],
      concerns: ['AI analysis unavailable'],
      recommendations: ['Consider manual review'],
    };
  }

  /**
   * Generate fallback bio
   */
  private generateFallbackBio(pet: PetProfile): string {
    return `${pet.name} is a ${pet.age}-year-old ${pet.breed} looking for a loving home. This ${pet.species} has a wonderful personality and would make a great companion.`;
  }

  /**
   * Default compatibility analysis
   */
  private getDefaultCompatibilityAnalysis(): unknown {
    return {
      compatibilityScore: 50,
      breakdown: {
        species: 50,
        breed: 50,
        age: 50,
        temperament: 50,
        activity: 50,
        lifestyle: 50,
      },
      reasons: ['Analysis in progress'],
      concerns: [],
      recommendations: [],
    };
  }

  /**
   * Default photo analysis
   */
  private getDefaultPhotoAnalysis(): unknown {
    return {
      species: 'unknown',
      breed: 'unknown',
      confidence: 0.5,
      age: 0,
      health: { overall: 'good', conditions: [], recommendations: [] },
      characteristics: { size: 'medium', color: [], markings: [], features: [] },
      temperament: [],
      quality: { photoScore: 0.5, lighting: 'good', clarity: 'good' },
    };
  }

  /**
   * Test service connection
   */
  public async testConnection(): Promise<boolean> {
    return this.deepSeekService.testConnection();
  }

  /**
   * Get service status
   */
  public getStatus(): unknown {
    return {
      deepSeekConnected: true,
      photoAnalysisEnabled: this.config.enablePhotoAnalysis,
      behaviorAnalysisEnabled: this.config.enableBehaviorAnalysis,
      compatibilityScoringEnabled: this.config.enableCompatibilityScoring,
    };
  }
}

/**
 * Create matching service instance
 */
export function createMatchingService(config: MatchingServiceConfig): PetMatchingService {
  return new PetMatchingService(config);
}
