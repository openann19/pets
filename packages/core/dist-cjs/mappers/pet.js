"use strict";
// Removed empty import statement
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCorePet = toCorePet;
exports.toCorePets = toCorePets;
exports.toLegacyPet = toLegacyPet;
function toCorePet(legacy) {
    const now = new Date().toISOString();
    // Handle various location formats
    let coordinates = [0, 0];
    if (legacy.location) {
        if ('coordinates' in legacy.location && Array.isArray(legacy.location.coordinates)) {
            coordinates = legacy.location.coordinates;
        }
        else if ('latitude' in legacy.location && 'longitude' in legacy.location) {
            coordinates = [legacy.location.longitude || 0, legacy.location.latitude || 0];
        }
        else if ('lon' in legacy.location && 'lat' in legacy.location) {
            coordinates = [legacy.location.lon || 0, legacy.location.lat || 0];
        }
    }
    // Normalize size
    const sizeMap = {
        'small': 'small',
        'medium': 'medium',
        'large': 'large',
        'tiny': 'tiny',
        'extra-large': 'extra-large',
        'xl': 'extra-large',
    };
    const size = legacy.size ? (sizeMap[legacy.size.toLowerCase()] || 'medium') : 'medium';
    // Normalize species
    const speciesMap = {
        'dog': 'dog',
        'cat': 'cat',
        'bird': 'bird',
        'rabbit': 'rabbit',
    };
    const species = legacy.species ? (speciesMap[legacy.species.toLowerCase()] || 'other') : 'dog';
    // Convert photos
    const photos = (legacy.photos || []).map((photo, index) => ({
        url: typeof photo === 'string' ? photo : photo.url,
        isPrimary: typeof photo === 'object' ? (photo.isPrimary || index === 0) : index === 0,
        caption: '',
    }));
    const corePet = {
        _id: legacy.id,
        owner: legacy.ownerId || '',
        name: legacy.name || 'Unknown',
        species,
        breed: legacy.breed || 'Mixed',
        age: legacy.age || 0,
        gender: legacy.gender || 'male',
        size,
        ...(legacy.weight !== undefined && { weight: legacy.weight }),
        photos,
        videos: [],
        description: legacy.description || '',
        personalityTags: legacy.temperament || [],
        intent: 'all',
        availability: {
            isAvailable: true,
        },
        healthInfo: {
            vaccinated: false,
            spayedNeutered: false,
            microchipped: false,
        },
        location: {
            type: 'Point',
            coordinates,
        },
        featured: {
            isFeatured: false,
            boostCount: 0,
        },
        analytics: {
            views: 0,
            likes: 0,
            matches: 0,
            messages: 0,
        },
        isActive: true,
        isVerified: false,
        status: 'active',
        listedAt: now,
        createdAt: now,
        updatedAt: now,
    };
    return corePet;
}
/**
 * Convert array of legacy pets to core Pet types
 */
function toCorePets(legacyPets) {
    return legacyPets.map(toCorePet);
}
/**
 * Convert core Pet to legacy format (for API requests)
 */
function toLegacyPet(pet) {
    const legacy = {
        id: pet._id,
        name: pet.name,
        breed: pet.breed,
        age: pet.age,
    };
    if (typeof pet.owner === 'string') {
        legacy.ownerId = pet.owner;
    }
    else if (pet.owner) {
        legacy.ownerId = pet.owner._id;
    }
    if (pet.species)
        legacy.species = pet.species;
    if (pet.gender)
        legacy.gender = pet.gender;
    if (pet.size)
        legacy.size = pet.size;
    if (pet.weight !== undefined)
        legacy.weight = pet.weight;
    if (pet.description)
        legacy.description = pet.description;
    if (pet.personalityTags?.length)
        legacy.temperament = pet.personalityTags;
    if (pet.photos?.length) {
        legacy.photos = pet.photos.map(p => ({ url: p.url, isPrimary: p.isPrimary }));
    }
    if (pet.location?.coordinates) {
        legacy.location = {
            longitude: pet.location.coordinates[0],
            latitude: pet.location.coordinates[1],
        };
    }
    return legacy;
}
