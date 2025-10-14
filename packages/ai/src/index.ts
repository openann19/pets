/**
 * AI Package Exports for PawfectMatch
 * Real DeepSeek AI integration for pet matching and analysis
 */

export { AIMatchingAlgorithm, aiMatchingAlgorithm } from './matching/algorithm';
export { PetPhotoAnalysis, createPetPhotoAnalysis } from './vision/petAnalysis';
export { DeepSeekService, createDeepSeekService } from './services/deepSeekService';
export { PetMatchingService, createMatchingService } from './services/matchingService';

export type {
  PetProfile,
  UserPreferences,
  MatchResult,
  PetPhotoAnalysisData,
  AnalysisResult,
} from './vision/petAnalysis';

export type {
  DeepSeekConfig,
  DeepSeekResponse,
  DeepSeekError,
} from './services/deepSeekService';

export type {
  MatchingServiceConfig,
} from './services/matchingService';
