import type { Pet } from '@/types';

/**
 * SwipePet interface for use in SwipeCard component
 * Implements the Pet interface but with some modifications for simpler UI display
 * This helps avoid TypeScript errors with partial Pet objects in the UI
 */
export interface SwipePet {
    _id: string;
    name: string;
    age: number;
    photos: Array<{
        url: string;
        isPrimary?: boolean;
    }>;
    species?: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
    breed?: string;
    size?: string;
    description?: string;
    bio?: string;
    owner?: {
        id: string;
        name: string;
        avatar?: string;
        verified?: boolean;
    };
    featured?: {
        isFeatured: boolean;
    };
    healthInfo?: {
        vaccinated: boolean;
        spayedNeutered: boolean;
        microchipped?: boolean;
        specialNeeds?: {
            description: string;
            medicationRequired?: boolean;
            dietaryRestrictions?: string[];
        };
    };
    personalityTags?: string[];
}

/**
 * Type guard function to check if a pet has the featured property
 */
export function isFeaturedPet(pet: Pet | SwipePet): pet is SwipePet & { featured: { isFeatured: boolean } } {
    return !!(pet as SwipePet).featured?.isFeatured;
}

/**
 * Type guard function to check if a pet has personality tags
 */
export function hasPetPersonality(pet: Pet | SwipePet): pet is SwipePet & { personalityTags: string[] } {
    return !!(pet as SwipePet).personalityTags?.length;
}

/**
 * Type guard function to check if a pet has health info
 */
export function hasPetHealthInfo(pet: Pet | SwipePet): pet is SwipePet & { healthInfo: { vaccinated: boolean; spayedNeutered: boolean } } {
    return !!(pet as SwipePet).healthInfo;
}