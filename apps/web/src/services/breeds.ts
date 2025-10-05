// Ultra-Premium Breed Search API Service
import { apiService } from './api';

export interface Breed {
  _id: string;
  name: string;
  species: string;
  group?: string;
  size: 'tiny' | 'small' | 'medium' | 'large' | 'giant';
  weightRange?: { min: number; max: number };
  lifeSpan?: { min: number; max: number };
  
  temperament: string[];
  energyLevel: 'low' | 'moderate' | 'high' | 'very-high';
  exerciseNeeds: 'minimal' | 'moderate' | 'high' | 'extensive';
  groomingNeeds: 'minimal' | 'moderate' | 'high' | 'extensive';
  
  familyFriendly: 'excellent' | 'good' | 'fair' | 'poor';
  kidFriendly: 'excellent' | 'good' | 'fair' | 'poor';
  petFriendly: 'excellent' | 'good' | 'fair' | 'poor';
  strangerFriendly: 'excellent' | 'good' | 'fair' | 'poor';
  
  apartmentFriendly: boolean;
  yardRequired?: boolean;
  
  trainability?: 'easy' | 'moderate' | 'difficult' | 'stubborn';
  barkingTendency?: 'quiet' | 'moderate' | 'high' | 'very-high';
  healthConcerns?: string[];
  
  popularity: number;
  availablePets?: number;
  isVerified?: boolean;
  
  compatibility: {
    kids?: string;
    pets?: string;
    strangers?: string;
    exercise?: string;
  };
}

export interface BreedSuggestionRequest {
  species?: string;
  livingSpace?: 'apartment' | 'house' | 'farm' | 'any';
  familySize?: 'single' | 'couple' | 'with_children' | 'large_family';
  energyPreference?: 'low' | 'moderate' | 'high' | 'very_high';
  groomingTime?: 'minimal' | 'moderate' | 'extensive';
  exerciseLevel?: 'minimal' | 'moderate' | 'high' | 'extensive';
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export interface BreedSearchFilters {
  species?: string | string[];
  size?: string | string[];
  energyLevel?: string | string[];
  exerciseNeeds?: string | string[];
  familyFriendly?: string | string[];
  apartmentFriendly?: boolean;
  temperament?: string | string[];
  groomingNeeds?: string | string[];
}

export const breedsAPI = {
  /**
   * Get breeds with advanced filtering
   */
  async getBreeds(filters?: BreedSearchFilters & {
    search?: string;
    page?: number;
    limit?: number;
  }) {
    return apiService.request('/breeds', {
      params: filters
    });
  },

  /**
   * Get breed details with compatibility information
   */
  async getBreed(name: string) {
    return apiService.request(`/breeds/${encodeURIComponent(name)}`);
  },

  /**
   * Search breeds with autocomplete
   */
  async searchBreeds(query: string, options?: {
    species?: string;
    limit?: number;
  }) {
    return apiService.request('/breeds/search/autocomplete', {
      params: {
        q: query,
        ...options
      }
    });
  },

  /**
   * Get personalized breed suggestions
   */
  async getBreedSuggestions(preferences: BreedSuggestionRequest) {
    return apiService.request('/breeds/suggestions', {
      method: 'POST',
      body: JSON.stringify(preferences)
    });
  },

  /**
   * Get breed statistics for analytics
   */
  async getBreedStats() {
    return apiService.request('/breeds/stats');
  },

  /**
   * Advanced pet discovery with comprehensive filtering
   */
  async discoverPetsAdvanced(filters: {
    // Basic filters
    species?: string | string[];
    breeds?: string | string[];
    ages?: { min: number; max: number };
    sizes?: string | string[];
    genders?: string | string[];
    colors?: string | string[];
    
    // Temperament & behavior
    temperaments?: string | string[];
    energyLevels?: string | string[];
    trainability?: string | string[];
    barkiness?: string | string[];
    
    // Compatibility filters
    familyFriendly?: string | string[];
    petFriendly?: string | string[];
    strangerFriendly?: string | string[];
    apartmentFriendly?: boolean;
    houseSafe?: boolean;
    yardRequired?: boolean;
    
    // Health & care
    healthStatus?: string | string[];
    vaccinationStatus?: string | string[];
    groomingNeeds?: string | string[];
    exerciseNeeds?: string | string[];
    
    // Location & availability
    availability?: string | string[];
    locationRadius?: number;
    nearMeFirst?: boolean;
    
    // Advanced sorting
    sortBy?: 'relevance' | 'newest' | 'popularity' | 'distance' | 'breed_match' | 'age' | 'featured';
    sortDirection?: 'asc' | 'desc';
    resultLimit?: number;
    
    // Premium features
    premiumFeatures?: {
      trending?: boolean;
      verified?: boolean;
      featured?: boolean;
      aiRecommended?: boolean;
    };
    
    // Search preferences
    searchQuery?: string;
    boostFeature?: boolean;
    
    // Pagination
    page?: number;
    limit?: number;
  }) {
    return apiService.request('/pets/discover/advanced', {
      params: {
        ...filters,
        // Convert arrays to comma-separated strings
        species: Array.isArray(filters.species) ? filters.species.join(',') : filters.species,
        breeds: Array.isArray(filters.breeds) ? filters.breeds.join(',') : filters.breeds,
        sizes: Array.isArray(filters.sizes) ? filters.sizes.join(',') : filters.sizes,
        genders: Array.isArray(filters.genders) ? filters.genders.join(',') : filters.genders,
        temperaments: Array.isArray(filters.temperaments) ? filters.temperaments.join(',') : filters.temperaments,
        energyLevels: Array.isArray(filters.energyLevels) ? filters.energyLevels.join(',') : filters.energyLevels
      }
    });
  },

  /**
   * Advanced pet matching algorithm
   */
  async matchPetsAdvanced(request: {
    userPreferences?: {
      breedPreference?: string[];
      temperamentPreference?: string[];
      sizePreference?: string[];
      ageRange?: { min: number; max: number };
      location?: { coordinates: [number, number] };
    };
    
    lifestyleFactors?: {
      livingSpace?: 'apartment' | 'house' | 'farm';
      experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
      timeCommitment?: 'limited' | 'moderate' | 'extensive';
      desiredEnergyLevel?: 'low' | 'moderate' | 'high' | 'very_high';
      familySize?: 'single' | 'couple' | 'family_with_kids';
      otherPets?: boolean;
    };
    
    matchingCriteria?: {
      importanceScore?: 'breedMatch' | 'temperamentMatch' | 'lifestyleMatch' | 'balanced';
      maxDistance?: number;
      agePreference?: 'young' | 'adult' | 'senior' | 'any';
      trainingLevel?: 'none_required' | 'some_training' | 'advanced_training';
    };
    
    personalityAssessment?: {
      experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
      patienceLevel?: 'low' | 'moderate' | 'high';
      activityLevel?: 'sedentary' | 'moderate' | 'active' | 'very_active';
    };
  }) {
    return apiService.request('/pets/match/advanced', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  },

  /**
   * Get breed compatibility matrix
   */
  async getBreedCompatibility(breedNames: string[]) {
    return apiService.request('/breeds/compatibility', {
      method: 'POST',
    });
  },

  /**
   * Search breeds by characteristics
   */
  async searchByCharacteristics(criteria: {
    energyLevel?: string;
    apartmentFriendly?: boolean;
    familyFriendly?: string;
    exerciseNeeds?: string;
    groomingNeeds?: string;
    trainability?: string;
    size?: string;
    species?: string;
  }) {
    return apiService.request('/breeds/by-characteristics', {
      method: 'POST',
      body: JSON.stringify(criteria)
    });
  }
};

// Utility functions for breed filtering
export const breedUtils = {
  /**
   * Generate filter query parameters from UI state
   */
  generateQueryParams(filterState: any) {
    const params: Record<string, any> = {};
    
    // Convert arrays to comma-separated strings
    Object.entries(filterState).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        params[key] = value.join(',');
      } else if (typeof value === 'object' && value !== null) {
        // Handle nested objects like ages: { min: 0, max: 5 }
        if (value.min !== undefined || value.max !== undefined) {
          params[key] = `${value.min || 0}-${value.max || 20}`;
        } else {
          // Handle object like premiumFeatures
          Object.entries(value).forEach(([subKey, subValue]) => {
            if (subValue) {
              params[`${key}.${subKey}`] = subValue;
            }
          });
        }
      } else if (value !== null && value !== undefined && value !== '') {
        params[key] = value;
      }
    });
    
    return params;
  },

  /**
   * Parse response data and extract pet information
   */
  parsePetResponse(response: any) {
    return {
      pets: response.data?.pets || [],
      recommendations: response.data?.recommendations || [],
      pagination: response.data?.pagination || {},
      analytics: response.data?.analytics || {},
      appliedFilters: response.data?.appliedFilters || 0
    };
  },

  /**
   * Calculate breed compatibility score
   */
  calculateCompatibility(petBreed: string, userPreferences: string[]) {
    if (!userPreferences.includes(petBreed.toLowerCase())) {
      return 0.3; // Default compatibility
    }
    
    // Simple scoring algorithm
    const preferenceIndex = userPreferences.indexOf(petBreed.toLowerCase());
    return Math.max(0.6, 1.0 - (preferenceIndex * 0.1));
  },

  /**
   * Filter breeds by user criteria
   */
  filterBreedsByCriteria(breeds: Breed[], criteria: BreedSearchFilters) {
    return breeds.filter(breed => {
      // Species filter
      if (criteria.species && breed.species !== criteria.species) {
        return false;
      }
      
      // Size filter
      if (criteria.size && breed.size !== criteria.size) {
        return false;
      }
      
      // Energy level filter
      if (criteria.energyLevel && breed.energyLevel !== criteria.energyLevel) {
        return false;
      }
      
      // Apartment friendly filter
      if (criteria.apartmentFriendly !== undefined && breed.apartmentFriendly !== criteria.apartmentFriendly) {
        return false;
      }
      
      // Family friendly filter
      if (criteria.familyFriendly && breed.familyFriendly !== criteria.familyFriendly) {
        return false;
      }
      
      return true;
    });
  },

  /**
   * Sort breeds by relevance
   */
  sortBreedsByRelevance(breeds: Breed[], userPreferences: string[]) {
    return breeds.sort((a, b) => {
      const scoreA = breedUtils.calculateCompatibility(a.name, userPreferences);
      const scoreB = breedUtils.calculateCompatibility(b.name, userPreferences);
      
      // Secondary sort by popularity
      if (Math.abs(scoreA - scoreB) < 0.1) {
        return b.popularity - a.popularity;
      }
      
      return scoreB - scoreA;
    });
  }
};
