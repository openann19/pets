/**
 * ULTRA PREMIUM UNIFIED TYPES 🚀
 * Production-ready comprehensive type definitions for PawfectMatch
 * Eliminates all unsafe operations and provides complete type safety
 */
import type { UserPreferences } from '../stores/usePreferencesStore';
export interface ApiResponse<T = unknown> {
    success: boolean;
    data: T;
    message?: string;
    error?: string;
}
export interface PaginatedResponse<T = unknown> {
    success: boolean;
    data: {
        items: T[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            hasMore: boolean;
        };
    };
    message?: string;
    error?: string;
}
export interface GeoLocation {
    type: 'Point';
    coordinates: [number, number];
    address?: {
        street?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
    };
}
export interface User {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    age: number;
    avatar?: string;
    bio?: string;
    phone?: string;
    location: GeoLocation;
    preferences: UserPreferences;
    premium: PremiumStatus;
    pets: string[];
    analytics: UserAnalytics;
    isEmailVerified: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface PremiumStatus {
    isActive: boolean;
    plan: 'basic' | 'premium' | 'gold';
    expiresAt?: string;
    features: {
        unlimitedLikes: boolean;
        boostProfile: boolean;
        seeWhoLiked: boolean;
        advancedFilters: boolean;
    };
}
export interface UserAnalytics {
    totalSwipes: number;
    totalLikes: number;
    totalMatches: number;
    profileViews: number;
    lastActive: string;
}
export interface Pet {
    _id: string;
    owner: User | string;
    name: string;
    species: PetSpecies;
    breed: string;
    age: number;
    gender: PetGender;
    size: PetSize;
    weight?: number;
    color?: PetColor;
    photos: PetPhoto[];
    videos?: PetVideo[];
    description?: string;
    bio?: string;
    personalityTags: string[];
    intent: PetIntent;
    availability: PetAvailability;
    healthInfo: PetHealthInfo;
    location: GeoLocation;
    aiData?: PetAIData;
    featured: PetFeatured;
    analytics: PetAnalytics;
    isActive: boolean;
    isVerified: boolean;
    status: PetStatus;
    adoptedAt?: string;
    listedAt: string;
    createdAt: string;
    updatedAt: string;
}
export type PetSpecies = 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
export type PetGender = 'male' | 'female';
export type PetSize = 'tiny' | 'small' | 'medium' | 'large' | 'extra-large';
export type PetIntent = 'adoption' | 'mating' | 'playdate' | 'all';
export type PetStatus = 'active' | 'paused' | 'adopted' | 'unavailable';
export interface PetColor {
    primary?: string;
    secondary?: string;
    pattern?: 'solid' | 'spotted' | 'striped' | 'mixed' | 'other';
}
export interface PetPhoto {
    url: string;
    publicId?: string;
    caption?: string;
    isPrimary: boolean;
}
export interface PetVideo {
    url: string;
    publicId?: string;
    caption?: string;
    duration?: number;
}
export interface PetAvailability {
    isAvailable: boolean;
    schedule?: WeeklySchedule;
}
export interface WeeklySchedule {
    monday: DaySchedule;
    tuesday: DaySchedule;
    wednesday: DaySchedule;
    thursday: DaySchedule;
    friday: DaySchedule;
    saturday: DaySchedule;
    sunday: DaySchedule;
}
export interface DaySchedule {
    available: boolean;
    times: string[];
}
export interface PetHealthInfo {
    vaccinated: boolean;
    spayedNeutered: boolean;
    microchipped: boolean;
    healthConditions?: string[];
    medications?: string[];
    specialNeeds?: string;
    lastVetVisit?: string;
    vetContact?: {
        name?: string;
        phone?: string;
        clinic?: string;
    };
}
export interface PetAIData {
    personalityScore?: {
        friendliness?: number;
        energy?: number;
        trainability?: number;
        socialness?: number;
        aggression?: number;
    };
    compatibilityTags?: string[];
    breedCharacteristics?: {
        temperament?: string[];
        energyLevel?: string;
        groomingNeeds?: string;
        healthConcerns?: string[];
    };
    lastUpdated?: string;
}
export interface PetFeatured {
    isFeatured: boolean;
    featuredUntil?: string;
    boostCount: number;
    lastBoosted?: string;
}
export interface PetAnalytics {
    views: number;
    likes: number;
    matches: number;
    messages: number;
    lastViewed?: string;
}
export interface Match {
    _id: string;
    pet1: Pet;
    pet2: Pet;
    user1: User;
    user2: User;
    matchType: MatchType;
    compatibilityScore: number;
    aiRecommendationReason?: string;
    status: MatchStatus;
    messages: Message[];
    meetings?: Meeting[];
    lastActivity: string;
    lastMessageAt?: string;
    messageCount: number;
    userActions: {
        user1: UserMatchActions;
        user2: UserMatchActions;
    };
    outcome?: MatchOutcome;
    createdAt: string;
    updatedAt: string;
}
export type MatchType = 'adoption' | 'mating' | 'playdate' | 'general';
export type MatchStatus = 'active' | 'archived' | 'blocked' | 'deleted' | 'completed';
export interface UserMatchActions {
    isArchived: boolean;
    isBlocked: boolean;
    isFavorite: boolean;
    muteNotifications: boolean;
    lastSeen?: string;
}
export interface MatchOutcome {
    result?: 'pending' | 'met' | 'adopted' | 'mated' | 'no-show' | 'incompatible';
    completedAt?: string;
    rating?: {
        user1Rating?: number;
        user2Rating?: number;
    };
    feedback?: {
        user1Feedback?: string;
        user2Feedback?: string;
    };
}
export interface Message {
    _id: string;
    sender: User;
    content: string;
    messageType: MessageType;
    attachments?: Attachment[];
    readBy: ReadReceipt[];
    sentAt: string;
    editedAt?: string;
    isEdited: boolean;
    isDeleted: boolean;
}
export type MessageType = 'text' | 'image' | 'location' | 'system';
export interface Attachment {
    type: string;
    fileType?: string;
    fileName?: string;
    url: string;
}
export interface ReadReceipt {
    user: string;
    readAt: string;
}
export interface Meeting {
    _id?: string;
    proposedBy: string;
    title: string;
    description?: string;
    proposedDate: string;
    location?: {
        name?: string;
        address?: string;
        coordinates?: [number, number];
    };
    status: MeetingStatus;
    responses: MeetingResponse[];
    createdAt: string;
}
export type MeetingStatus = 'proposed' | 'accepted' | 'declined' | 'completed' | 'cancelled';
export interface MeetingResponse {
    user: string;
    response: 'accepted' | 'declined' | 'maybe';
    respondedAt: string;
    note?: string;
}
export interface AdoptionApplication {
    _id: string;
    petId: string;
    applicantId: string;
    status: AdoptionApplicationStatus;
    applicationData: AdoptionApplicationData;
    createdAt: string;
    updatedAt: string;
}
export type AdoptionApplicationStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn';
export interface AdoptionApplicationData {
    reason: string;
    experience: string;
    homeType: string;
    hasOtherPets: boolean;
    otherPetsDescription: string;
    hasChildren: boolean;
    childrenAges: string;
    vetReference: string;
    references: string[];
}
export interface AdoptionListing {
    _id: string;
    petId: string;
    title: string;
    description: string;
    requirements: string[];
    status: AdoptionListingStatus;
    applications: string[];
    createdAt: string;
    updatedAt: string;
}
export type AdoptionListingStatus = 'active' | 'pending' | 'closed';
export interface CallData {
    callId: string;
    matchId: string;
    callerId: string;
    callerName: string;
    callerAvatar?: string;
    callType: CallType;
    timestamp: number;
}
export type CallType = 'voice' | 'video';
export interface LoginForm {
    email: string;
    password: string;
}
export interface RegisterForm {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    phone?: string;
    agreeToTerms: boolean;
}
export interface PetForm {
    name: string;
    species: string;
    breed: string;
    age: number;
    gender: string;
    size: string;
    weight?: number;
    description?: string;
    personalityTags: string[];
    intent: string;
    photos: File[];
    healthInfo: {
        vaccinated: boolean;
        spayedNeutered: boolean;
        microchipped: boolean;
        specialNeeds?: string;
    };
}
export interface PetFilters {
    species?: string;
    intent?: string;
    maxDistance?: number;
    minAge?: number;
    maxAge?: number;
    size?: string;
    gender?: string;
    breed?: string;
}
export interface SwipeParams {
    species?: string[];
    intent?: string[];
    maxDistance?: number;
    minAge?: number;
    maxAge?: number;
    size?: string[];
    gender?: string[];
    breed?: string[];
}
export interface SwipeAction {
    petId: string;
    action: SwipeActionType;
}
export type SwipeActionType = 'like' | 'pass' | 'superlike';
export interface SwipeResult {
    isMatch: boolean;
    matchId?: string;
    action: string;
    match?: Match;
}
export interface AIRecommendation {
    petId: string;
    score: number;
    reasons: string[];
}
export interface CompatibilityAnalysis {
    compatibility_score: number;
    factors: string[];
    recommendation: string;
}
export interface BioGenerationData {
    petId: string;
    photos: string[];
    species: string;
    breed: string;
    age: number;
    personalityTags: string[];
}
export interface CompatibilityOptions {
    includePersonality?: boolean;
    includeHealth?: boolean;
    includeLocation?: boolean;
}
export interface BehaviorAnalysisData {
    observations: string[];
    context: string;
    timestamp: string;
}
export interface NotificationProps {
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}
export interface LoadingState {
    isLoading: boolean;
    message?: string;
}
export interface SocketMessage {
    matchId: string;
    message: Message;
}
export interface SocketNotification {
    type: 'new_message' | 'new_match' | 'user_online' | 'user_offline';
    title: string;
    body?: string;
    matchId?: string;
    senderId?: string;
    userId?: string;
}
export interface ApiService {
    login(email: string, password: string): Promise<ApiResponse<{
        token: string;
        user: User;
    }>>;
    register(userData: Partial<User> & {
        password: string;
    }): Promise<ApiResponse<{
        token: string;
        user: User;
    }>>;
    logout(): Promise<ApiResponse<void>>;
    refreshToken(): Promise<ApiResponse<{
        token: string;
    }>>;
    getPets(): Promise<ApiResponse<Pet[]>>;
    getPetById(id: string): Promise<ApiResponse<Pet>>;
    createPet(petData: Partial<Pet>): Promise<ApiResponse<Pet>>;
    updatePet(id: string, petData: Partial<Pet>): Promise<ApiResponse<Pet>>;
    deletePet(id: string): Promise<ApiResponse<void>>;
    getAdoptionListings(): Promise<ApiResponse<AdoptionListing[]>>;
    getAdoptionListingById(id: string): Promise<ApiResponse<AdoptionListing>>;
    createAdoptionListing(listingData: Partial<AdoptionListing>): Promise<ApiResponse<AdoptionListing>>;
    updateAdoptionListing(id: string, listingData: Partial<AdoptionListing>): Promise<ApiResponse<AdoptionListing>>;
    deleteAdoptionListing(id: string): Promise<ApiResponse<void>>;
    getAdoptionApplications(): Promise<ApiResponse<AdoptionApplication[]>>;
    getAdoptionApplicationById(id: string): Promise<ApiResponse<AdoptionApplication>>;
    submitAdoptionApplication(applicationData: Partial<AdoptionApplication>): Promise<ApiResponse<AdoptionApplication>>;
    updateAdoptionApplication(id: string, applicationData: Partial<AdoptionApplication>): Promise<ApiResponse<AdoptionApplication>>;
    deleteAdoptionApplication(id: string): Promise<ApiResponse<void>>;
    getMatches(): Promise<ApiResponse<Match[]>>;
    getMatchById(id: string): Promise<ApiResponse<Match>>;
    createMatch(matchData: Partial<Match>): Promise<ApiResponse<Match>>;
    updateMatch(id: string, matchData: Partial<Match>): Promise<ApiResponse<Match>>;
    getMessages(matchId: string): Promise<ApiResponse<Message[]>>;
    sendMessage(messageData: Partial<Message>): Promise<ApiResponse<Message>>;
    markMessageAsRead(messageId: string): Promise<ApiResponse<Message>>;
    getCurrentUser(): Promise<ApiResponse<User>>;
    updateUser(userData: Partial<User>): Promise<ApiResponse<User>>;
    getUserById(id: string): Promise<ApiResponse<User>>;
    initiateCall(callData: CallData): Promise<ApiResponse<{
        callId: string;
    }>>;
    answerCall(callId: string): Promise<ApiResponse<void>>;
    endCall(callId: string): Promise<ApiResponse<void>>;
}
export declare const isPet: (obj: unknown) => obj is Pet;
export declare const isUser: (obj: unknown) => obj is User;
export declare const isMatch: (obj: unknown) => obj is Match;
export declare const isMessage: (obj: unknown) => obj is Message;
export type UserFormData = Partial<User> & {
    password?: string;
    confirmPassword?: string;
};
export type MessageAttachment = {
    type: 'image' | 'video' | 'audio' | 'document';
    url: string;
    fileName?: string;
    fileSize?: number;
};
export type UserRegistrationData = {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    phone?: string;
};
export type PetCreationData = {
    name: string;
    species: PetSpecies;
    breed: string;
    age: number;
    gender: PetGender;
    size: PetSize;
    description?: string;
    personalityTags: string[];
    intent: PetIntent;
    photos: File[];
    healthInfo: PetHealthInfo;
};
//# sourceMappingURL=unified.d.ts.map