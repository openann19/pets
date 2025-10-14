import { create } from 'zustand';

export type PetFilters = {
    species?: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
    minAge?: number;
    maxAge?: number;
    size?: 'small' | 'medium' | 'large' | 'extra-large';
    intent?: 'adoption' | 'mating' | 'playdate' | 'all';
    maxDistance?: number;
    personalityTags?: string[];
    excludeIds?: string[];
};

const DEFAULT_FILTERS: PetFilters = {};

interface FilterStore {
    filters: PetFilters;
    setFilters: (filters: PetFilters) => void;
    resetFilters: () => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
    filters: DEFAULT_FILTERS,
    setFilters: (filters) => set({ filters }),
    resetFilters: () => set({ filters: DEFAULT_FILTERS }),
}));
