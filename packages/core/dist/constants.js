/**
 * PawfectMatch Core Constants
 * Shared constants for pet matching platform
 */
export const SPECIES_OPTIONS = [
    { label: 'Dog', value: 'dog', emoji: '🐕' },
    { label: 'Cat', value: 'cat', emoji: '🐱' },
    { label: 'Bird', value: 'bird', emoji: '🐦' },
    { label: 'Rabbit', value: 'rabbit', emoji: '🐰' },
    { label: 'Other', value: 'other', emoji: '🐾' },
];
export const SIZE_OPTIONS = [
    { label: 'Tiny', value: 'tiny' },
    { label: 'Small', value: 'small' },
    { label: 'Medium', value: 'medium' },
    { label: 'Large', value: 'large' },
    { label: 'Giant', value: 'giant' },
];
export const INTENT_OPTIONS = [
    { label: 'Adoption', value: 'adoption' },
    { label: 'Mating', value: 'mating' },
    { label: 'Playdate', value: 'playdate' },
    { label: 'All', value: 'all' },
];
export const PERSONALITY_TAGS = [
    'Playful', 'Calm', 'Energetic', 'Gentle', 'Protective', 'Friendly',
    'Independent', 'Loyal', 'Curious', 'Affectionate', 'Social', 'Quiet',
    'Active', 'Relaxed', 'Intelligent', 'Obedient', 'Stubborn', 'Shy',
    'Confident', 'Adventurous', 'Cautious', 'Brave', 'Sensitive', 'Cheerful'
];
export const GENDER_OPTIONS = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Unknown', value: 'unknown' },
];
export const AGE_RANGES = [
    { label: 'Puppy/Kitten (0-1 years)', value: { min: 0, max: 1 } },
    { label: 'Young (1-3 years)', value: { min: 1, max: 3 } },
    { label: 'Adult (3-7 years)', value: { min: 3, max: 7 } },
    { label: 'Senior (7+ years)', value: { min: 7, max: 20 } },
];
export const BREED_OPTIONS = {
    dog: [
        'Labrador Retriever', 'Golden Retriever', 'German Shepherd', 'Bulldog',
        'Poodle', 'Beagle', 'Rottweiler', 'Yorkshire Terrier', 'Dachshund',
        'Siberian Husky', 'Boxer', 'French Bulldog', 'Border Collie', 'Shih Tzu',
        'Mixed Breed', 'Other'
    ],
    cat: [
        'Persian', 'Maine Coon', 'British Shorthair', 'Ragdoll', 'Abyssinian',
        'Siamese', 'American Shorthair', 'Russian Blue', 'Scottish Fold',
        'Norwegian Forest Cat', 'Mixed Breed', 'Other'
    ],
    bird: [
        'Parrot', 'Canary', 'Finch', 'Cockatiel', 'Lovebird', 'Budgerigar',
        'Macaw', 'Cockatoo', 'Other'
    ],
    rabbit: [
        'Dutch', 'Lop', 'Rex', 'Angora', 'Lionhead', 'Mini Rex', 'Other'
    ],
    other: ['Other']
};
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        PROFILE: '/auth/profile',
    },
    PETS: {
        LIST: '/pets',
        CREATE: '/pets',
        UPDATE: '/pets/:id',
        DELETE: '/pets/:id',
        MY_PETS: '/pets/my',
        BOOST: '/pets/:id/boost',
        PAUSE: '/pets/:id/pause',
        ACTIVATE: '/pets/:id/activate',
    },
    MATCHES: {
        LIST: '/matches',
        LIKE: '/matches/like',
        PASS: '/matches/pass',
        SUPER_LIKE: '/matches/super-like',
    },
    MESSAGES: {
        LIST: '/messages/:matchId',
        SEND: '/messages/:matchId',
        MARK_READ: '/messages/:matchId/read',
    },
    CALLS: {
        INITIATE: '/calls/initiate',
        ACCEPT: '/calls/:callId/accept',
        REJECT: '/calls/:callId/reject',
        END: '/calls/:callId/end',
    },
};
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'auth_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_PREFERENCES: 'user_preferences',
    ONBOARDING_COMPLETE: 'onboarding_complete',
    THEME_PREFERENCE: 'theme_preference',
};
export const VALIDATION_RULES = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD_MIN_LENGTH: 8,
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 50,
    BIO_MAX_LENGTH: 500,
    PHONE: /^\+?[\d\s\-\(\)]+$/,
};
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'Please log in to continue.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    SERVER_ERROR: 'Server error. Please try again later.',
    UNKNOWN_ERROR: 'An unexpected error occurred.',
};
export const SUCCESS_MESSAGES = {
    PROFILE_UPDATED: 'Profile updated successfully.',
    PET_CREATED: 'Pet profile created successfully.',
    PET_UPDATED: 'Pet profile updated successfully.',
    PET_DELETED: 'Pet profile deleted successfully.',
    MATCH_LIKED: 'Match liked successfully.',
    MESSAGE_SENT: 'Message sent successfully.',
};
