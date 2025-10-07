/**
 * PawfectMatch Core Constants
 * Shared constants for pet matching platform
 */
export declare const SPECIES_OPTIONS: readonly [{
    readonly label: "Dog";
    readonly value: "dog";
    readonly emoji: "🐕";
}, {
    readonly label: "Cat";
    readonly value: "cat";
    readonly emoji: "🐱";
}, {
    readonly label: "Bird";
    readonly value: "bird";
    readonly emoji: "🐦";
}, {
    readonly label: "Rabbit";
    readonly value: "rabbit";
    readonly emoji: "🐰";
}, {
    readonly label: "Other";
    readonly value: "other";
    readonly emoji: "🐾";
}];
export declare const SIZE_OPTIONS: readonly [{
    readonly label: "Tiny";
    readonly value: "tiny";
}, {
    readonly label: "Small";
    readonly value: "small";
}, {
    readonly label: "Medium";
    readonly value: "medium";
}, {
    readonly label: "Large";
    readonly value: "large";
}, {
    readonly label: "Giant";
    readonly value: "giant";
}];
export declare const INTENT_OPTIONS: readonly [{
    readonly label: "Adoption";
    readonly value: "adoption";
}, {
    readonly label: "Mating";
    readonly value: "mating";
}, {
    readonly label: "Playdate";
    readonly value: "playdate";
}, {
    readonly label: "All";
    readonly value: "all";
}];
export declare const PERSONALITY_TAGS: readonly ["Playful", "Calm", "Energetic", "Gentle", "Protective", "Friendly", "Independent", "Loyal", "Curious", "Affectionate", "Social", "Quiet", "Active", "Relaxed", "Intelligent", "Obedient", "Stubborn", "Shy", "Confident", "Adventurous", "Cautious", "Brave", "Sensitive", "Cheerful"];
export declare const GENDER_OPTIONS: readonly [{
    readonly label: "Male";
    readonly value: "male";
}, {
    readonly label: "Female";
    readonly value: "female";
}, {
    readonly label: "Unknown";
    readonly value: "unknown";
}];
export declare const AGE_RANGES: readonly [{
    readonly label: "Puppy/Kitten (0-1 years)";
    readonly value: {
        readonly min: 0;
        readonly max: 1;
    };
}, {
    readonly label: "Young (1-3 years)";
    readonly value: {
        readonly min: 1;
        readonly max: 3;
    };
}, {
    readonly label: "Adult (3-7 years)";
    readonly value: {
        readonly min: 3;
        readonly max: 7;
    };
}, {
    readonly label: "Senior (7+ years)";
    readonly value: {
        readonly min: 7;
        readonly max: 20;
    };
}];
export declare const BREED_OPTIONS: {
    readonly dog: readonly ["Labrador Retriever", "Golden Retriever", "German Shepherd", "Bulldog", "Poodle", "Beagle", "Rottweiler", "Yorkshire Terrier", "Dachshund", "Siberian Husky", "Boxer", "French Bulldog", "Border Collie", "Shih Tzu", "Mixed Breed", "Other"];
    readonly cat: readonly ["Persian", "Maine Coon", "British Shorthair", "Ragdoll", "Abyssinian", "Siamese", "American Shorthair", "Russian Blue", "Scottish Fold", "Norwegian Forest Cat", "Mixed Breed", "Other"];
    readonly bird: readonly ["Parrot", "Canary", "Finch", "Cockatiel", "Lovebird", "Budgerigar", "Macaw", "Cockatoo", "Other"];
    readonly rabbit: readonly ["Dutch", "Lop", "Rex", "Angora", "Lionhead", "Mini Rex", "Other"];
    readonly other: readonly ["Other"];
};
export declare const API_ENDPOINTS: {
    readonly AUTH: {
        readonly LOGIN: "/auth/login";
        readonly REGISTER: "/auth/register";
        readonly LOGOUT: "/auth/logout";
        readonly REFRESH: "/auth/refresh";
        readonly PROFILE: "/auth/profile";
    };
    readonly PETS: {
        readonly LIST: "/pets";
        readonly CREATE: "/pets";
        readonly UPDATE: "/pets/:id";
        readonly DELETE: "/pets/:id";
        readonly MY_PETS: "/pets/my";
        readonly BOOST: "/pets/:id/boost";
        readonly PAUSE: "/pets/:id/pause";
        readonly ACTIVATE: "/pets/:id/activate";
    };
    readonly MATCHES: {
        readonly LIST: "/matches";
        readonly LIKE: "/matches/like";
        readonly PASS: "/matches/pass";
        readonly SUPER_LIKE: "/matches/super-like";
    };
    readonly MESSAGES: {
        readonly LIST: "/messages/:matchId";
        readonly SEND: "/messages/:matchId";
        readonly MARK_READ: "/messages/:matchId/read";
    };
    readonly CALLS: {
        readonly INITIATE: "/calls/initiate";
        readonly ACCEPT: "/calls/:callId/accept";
        readonly REJECT: "/calls/:callId/reject";
        readonly END: "/calls/:callId/end";
    };
};
export declare const STORAGE_KEYS: {
    readonly AUTH_TOKEN: "auth_token";
    readonly REFRESH_TOKEN: "refresh_token";
    readonly USER_PREFERENCES: "user_preferences";
    readonly ONBOARDING_COMPLETE: "onboarding_complete";
    readonly THEME_PREFERENCE: "theme_preference";
};
export declare const VALIDATION_RULES: {
    readonly EMAIL: RegExp;
    readonly PASSWORD_MIN_LENGTH: 8;
    readonly NAME_MIN_LENGTH: 2;
    readonly NAME_MAX_LENGTH: 50;
    readonly BIO_MAX_LENGTH: 500;
    readonly PHONE: RegExp;
};
export declare const ERROR_MESSAGES: {
    readonly NETWORK_ERROR: "Network error. Please check your connection.";
    readonly UNAUTHORIZED: "Please log in to continue.";
    readonly FORBIDDEN: "You do not have permission to perform this action.";
    readonly NOT_FOUND: "The requested resource was not found.";
    readonly VALIDATION_ERROR: "Please check your input and try again.";
    readonly SERVER_ERROR: "Server error. Please try again later.";
    readonly UNKNOWN_ERROR: "An unexpected error occurred.";
};
export declare const SUCCESS_MESSAGES: {
    readonly PROFILE_UPDATED: "Profile updated successfully.";
    readonly PET_CREATED: "Pet profile created successfully.";
    readonly PET_UPDATED: "Pet profile updated successfully.";
    readonly PET_DELETED: "Pet profile deleted successfully.";
    readonly MATCH_LIKED: "Match liked successfully.";
    readonly MESSAGE_SENT: "Message sent successfully.";
};
//# sourceMappingURL=constants.d.ts.map