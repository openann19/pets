'use client';

import {
  ArrowTrendingUpIcon,
  ChartBarIcon,
  CheckCircleIcon,
  HeartIcon,
  HomeIcon,
  InformationCircleIcon,
  MapPinIcon,
  SparklesIcon,
  StarIcon,
  UserGroupIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion'
import { logger } from '@pawfectmatch/core';
;
import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '../../lib/auth-store';
import { logger } from '../../services/logger';

interface CompatibilityScore {
  overall: number;
  personality: number;
  lifestyle: number;
  activity: number;
  social: number;
  environment: number;
}

interface CompatibilityInsight {
  type: 'positive' | 'neutral' | 'negative';
  category: string;
  message: string;
  importance: 'high' | 'medium' | 'low';
}

interface PetProfile {
  id: string;
  name: string;
  photo: string;
  breed: string;
  age: number;
  bio: string;
  location: {
    city: string;
    distance: number;
  };
  owner: {
    name: string;
    verified: boolean;
  };
}

interface EnhancedCompatibilityReport {
  compatibility_score: number;
  confidence: number;
  breakdown: {
    species_match: number;
    breed_compatibility: number;
    personality_match: number;
    size_compatibility: number;
    age_compatibility: number;
    activity_match: number;
  };
  insights: string[];
  recommendations: string[];
  risk_factors: string[];
  interaction_suitability: {
    playdate: number;
    mating: number;
    cohabitation: number;
  };
  ai_analysis: string;
  calculated_at: string;
}

interface CompatibilityReport {
  petA: PetProfile;
  petB: PetProfile;
  scores: CompatibilityScore;
  insights: CompatibilityInsight[];
  recommendations: string[];
  successPrediction: {
    shortTerm: number;
    longTerm: number;
  };
  sharedInterests: string[];
  potentialChallenges: string[];
  meetingTips: string[];
  generatedAt: string;
  enhancedData?: EnhancedCompatibilityReport;
}

interface PetData {
  _id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  gender: string;
  size: string;
  personalityTags: string[];
  healthInfo: {
    vaccinated: boolean;
    spayedNeutered: boolean;
    microchipped: boolean;
  };
  location: {
    coordinates: [number, number];
  };
}

interface CompatibilityAnalyzerProps {
  targetPetId?: string;
  pet1?: PetData;
  pet2?: PetData;
  interactionType?: 'playdate' | 'mating' | 'adoption' | 'cohabitation';
}

export function CompatibilityAnalyzer({
  targetPetId,
  pet1,
  pet2,
  interactionType = 'playdate',
}: CompatibilityAnalyzerProps): JSX.Element {
  const { user } = useAuthStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<CompatibilityReport | null>(null);
  const [enhancedData, setEnhancedData] = useState<EnhancedCompatibilityReport | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedInteractionType, setSelectedInteractionType] = useState(interactionType);

  const analyzeCompatibility = useCallback(async () => {
    setIsAnalyzing(true);

    try {
      // Use the enhanced compatibility endpoint
      interface UserWithActivePet {
        activePetId?: string;
        activePetName?: string;
      }
      const pet1Data = pet1 ?? {
        id: user?.activePetId,
        name: (user as unknown as UserWithActivePet)?.activePetName || 'Your Pet',
        species: 'dog',
        breed: 'mixed',
        age: 2,
        size: 'medium',
        personality_tags: ['friendly'],
        activity_level: 5,
      };

      const pet2Data = pet2 ?? {
        id: targetPetId,
        name: 'Target Pet',
        species: 'dog',
        breed: 'mixed',
        age: 3,
        size: 'medium',
        personality_tags: ['friendly'],
        activity_level: 5,
      };

      logger.info('Analyzing compatibility with enhanced backend:', { pet1Data, pet2Data });

      const response = await fetch(
        `${process.env['NEXT_PUBLIC_API_URL']}/api/ai/enhanced-compatibility`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
          },
          body: JSON.stringify({
            pet1: pet1Data,
            pet2: pet2Data,
            interaction_type: selectedInteractionType,
          }),
        },
      );

      if (response.ok) {
        const enhancedResult: EnhancedCompatibilityReport = await response.json();
        setEnhancedData(enhancedResult);

        // Convert to legacy format for UI compatibility
        const legacyReport: CompatibilityReport = {
          petA: {
            id: (pet1Data as { id?: string }).id || '',
            name: pet1Data.name,
            photo: '/api/placeholder-pet.jpg',
            breed: pet1Data.breed,
            age: pet1Data.age,
            bio: '',
            location: { city: 'Unknown', distance: 0 },
            owner: { name: 'Owner', verified: false },
          },
          petB: {
            id: (pet2Data as { id?: string }).id || '',
            name: pet2Data.name,
            photo: '/api/placeholder-pet.jpg',
            breed: pet2Data.breed,
            age: pet2Data.age,
            bio: '',
            location: { city: 'Unknown', distance: 0 },
            owner: { name: 'Owner', verified: false },
          },
          scores: {
            overall: Math.round(enhancedResult.compatibility_score),
            personality: Math.round(enhancedResult.breakdown.personality_match * 100),
            lifestyle: Math.round(enhancedResult.breakdown.breed_compatibility * 100),
            activity: Math.round(enhancedResult.breakdown.activity_match * 100),
            social: Math.round(enhancedResult.breakdown.species_match * 100),
            environment: Math.round(
              (enhancedResult.breakdown.size_compatibility +
                enhancedResult.breakdown.age_compatibility) *
              50,
            ),
          },
          insights: enhancedResult.insights.map((insight) => ({
            type: 'positive' as const,
            category: 'compatibility',
            message: insight,
            importance: 'medium' as const,
          })),
          recommendations: enhancedResult.recommendations,
          successPrediction: {
            shortTerm: Math.round(enhancedResult.interaction_suitability.playdate * 100),
            longTerm: Math.round(enhancedResult.interaction_suitability.cohabitation * 100),
          },
          sharedInterests: ['Playing', 'Walking', 'Treats'], // Mock data
          potentialChallenges: enhancedResult.risk_factors,
          meetingTips: [
            'Start with a neutral, public location',
            'Keep initial meetings short (15-20 minutes)',
            'Bring treats and positive reinforcement',
          ],
          generatedAt: enhancedResult.calculated_at,
          enhancedData: enhancedResult,
        };

        setReport(legacyReport);
        logger.info('Enhanced compatibility analysis completed', {
          overall: enhancedResult.compatibility_score,
          confidence: enhancedResult.confidence,
        });
      } else {
        throw new Error(`API request failed with status: ${response.status}`);
      }
    } catch (error) {
      logger.error('Compatibility analysis failed', { error });
      // Show error state instead of fallback mock data
      setIsAnalyzing(false);
      return;
    } finally {
      setIsAnalyzing(false);
    }
  }, [user, targetPetId, pet1, pet2, selectedInteractionType, setIsAnalyzing, setReport, setEnhancedData]);

  useEffect(() => {
    if ((targetPetId && user?.activePetId) || (pet1 && pet2)) {
      analyzeCompatibility();
    }
  }, [targetPetId, pet1, pet2, selectedInteractionType, analyzeCompatibility, user?.activePetId]);

  // Removed mock report generator in favor of actual API data

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreGradient = (score: number): string => {
    if (score >= 80) return 'from-green-400 to-emerald-600';
    if (score >= 60) return 'from-yellow-400 to-orange-600';
    return 'from-red-400 to-pink-600';
  };

  const getScoreEmoji = (score: number): string => {
    if (score >= 90) return '🔥';
    if (score >= 80) return '💕';
    if (score >= 70) return '❤️';
    if (score >= 60) return '💛';
    if (score >= 50) return '🤔';
    return '💔';
  };

  if (isAnalyzing !== null && isAnalyzing !== undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <HeartIcon className="h-16 w-16 text-pink-500" />
        </motion.div>
        <p className="ml-4 text-lg text-gray-600">Analyzing compatibility with AI...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center p-8">
        <HeartIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Select pets to analyze compatibility</p>
        {pet1 !== undefined && pet2 && (
          <motion.button
            onClick={analyzeCompatibility}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Analyze Compatibility
          </motion.button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl p-8 shadow-2xl"
      >
        {/* Interaction Type Selector */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">Interaction Type:</p>
          <div className="flex gap-2">
            {[
              { value: 'playdate', label: 'Playdate', emoji: '🎾' },
              { value: 'mating', label: 'Breeding', emoji: '💕' },
              { value: 'adoption', label: 'Adoption', emoji: '🏠' },
              { value: 'cohabitation', label: 'Living Together', emoji: '🏡' },
            ].map((type) => (
              <motion.button
                key={type.value}
                onClick={() =>
                  setSelectedInteractionType(
                    type.value as 'playdate' | 'mating' | 'adoption' | 'cohabitation',
                  )
                }
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedInteractionType === type.value
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                {type.emoji} {type.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Enhanced Data Display */}
        {enhancedData !== undefined && (
          <div className="mb-6 bg-white rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <SparklesIcon className="h-5 w-5 mr-2 text-purple-600" />
                Enhanced AI Analysis
              </h3>
              <div className="text-sm text-gray-600">
                Confidence: {enhancedData && Math.round(enhancedData.confidence * 100)}%
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-700 leading-relaxed">{enhancedData?.ai_analysis}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {enhancedData && Object.entries(enhancedData.interaction_suitability).map(([type, suitability]) => (
                <div
                  key={type}
                  className="text-center"
                >
                  <p className="text-xs text-gray-600 uppercase tracking-wide">{type}</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.round((suitability as number) * 100)}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Header with Pets */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            {/* Pet A */}
            <div className="text-center">
              <img
                src={report.petA.photo}
                alt={report.petA.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <p className="mt-2 font-semibold">{report.petA.name}</p>
              <p className="text-sm text-gray-600">{report.petA.breed}</p>
            </div>

            {/* Hearts Animation */}
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-4xl"
              >
                {getScoreEmoji(report.scores.overall)}
              </motion.div>
            </div>

            {/* Pet B */}
            <div className="text-center">
              <img
                src={report.petB.photo}
                alt={report.petB.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <p className="mt-2 font-semibold">{report.petB.name}</p>
              <p className="text-sm text-gray-600">{report.petB.breed}</p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">AI Compatibility Score</p>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`text-5xl font-bold bg-gradient-to-r ${getScoreGradient(report.scores.overall)} bg-clip-text text-transparent`}
            >
              {report.scores.overall}%
            </motion.div>
          </div>
        </div>

        {/* Main Score Display */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Overall Score */}
            <div className="md:col-span-3">
              <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${report.scores.overall}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getScoreGradient(report.scores.overall)}`}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-lg drop-shadow-lg">
                    {report.scores.overall}% Match
                  </span>
                </div>
              </div>
            </div>

            {/* Success Predictions */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
              <div className="flex items-center mb-2">
                <ArrowTrendingUpIcon className="h-5 w-5 text-purple-600 mr-2" />
                <span className="font-semibold text-gray-700">Success Prediction</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">First Month:</span>
                  <span className="font-semibold">{report.successPrediction.shortTerm}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Long Term:</span>
                  <span className="font-semibold">{report.successPrediction.longTerm}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Scores */}
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {[
            { key: 'personality', label: 'Personality', icon: StarIcon },
            { key: 'lifestyle', label: 'Lifestyle', icon: HomeIcon },
            { key: 'activity', label: 'Activity', icon: ChartBarIcon },
            { key: 'social', label: 'Social', icon: UserGroupIcon },
            { key: 'environment', label: 'Environment', icon: MapPinIcon },
          ].map((category) => {
            const score = report.scores[category.key as keyof CompatibilityScore];
            return (
              <motion.div
                key={category.key}
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-xl p-4 shadow-md"
              >
                <category.icon className="h-6 w-6 text-gray-600 mb-2" />
                <p className="text-sm font-semibold text-gray-700">{category.label}</p>
                <div className="mt-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-2xl font-bold ${getScoreColor(score).split(' ')[0]}`}>
                      {score}%
                    </span>
                    <span className="text-lg">{getScoreEmoji(score)}</span>
                  </div>
                  <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className={`h-full bg-gradient-to-r ${getScoreGradient(score)}`}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Enhanced Breakdown (if available) */}
        {enhancedData !== undefined && (
          <div className="mb-6 bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2" />
              Detailed Compatibility Breakdown
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enhancedData && Object.entries(enhancedData.breakdown).map(([key, value]) => {
                const score = Math.round(value * 100);
                const label = key
                  .split('_')
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ');

                return (
                  <div
                    key={key}
                    className="bg-gray-50 rounded-xl p-4"
                  >
                    <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">{label}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xl font-bold ${getScoreColor(score).split(' ')[0]}`}>
                        {score}%
                      </span>
                      <div className="flex-1 ml-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${score}%` }}
                          transition={{ duration: 0.8, delay: 0.3 }}
                          className={`h-full bg-gradient-to-r ${getScoreGradient(score)}`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {enhancedData && enhancedData.risk_factors !== undefined && enhancedData.risk_factors.length > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 rounded-xl">
                <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
                  <InformationCircleIcon className="h-4 w-4 mr-2" />
                  Risk Factors to Consider
                </h4>
                <ul className="space-y-1">
                  {enhancedData && enhancedData.risk_factors.map((risk, index) => (
                    <li
                      key={index}
                      className="text-sm text-yellow-700 flex items-start"
                    >
                      <span className="mr-2">⚠️</span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Detailed Analysis */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Insights */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <InformationCircleIcon className="h-5 w-5 mr-2" />
              Key Insights
            </h3>
            <div className="space-y-3">
              {report.insights.slice(0, 5).map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start"
                >
                  {insight.type === 'positive' ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  ) : insight.type === 'negative' ? (
                    <XCircleIcon className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  ) : (
                    <InformationCircleIcon className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{insight.message}</p>
                    {insight.importance === 'high' && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                        Important
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Shared Interests */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <SparklesIcon className="h-5 w-5 mr-2" />
              Shared Interests
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {report.sharedInterests.map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-medium"
                >
                  {interest}
                </span>
              ))}
            </div>

            {report.potentialChallenges.length > 0 && (
              <>
                <h4 className="font-semibold text-gray-700 mb-2">Potential Challenges</h4>
                <ul className="space-y-1">
                  {report.potentialChallenges.slice(0, 3).map((challenge, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-600 flex items-start"
                    >
                      <span className="text-yellow-500 mr-2">⚠️</span>
                      {challenge}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        {/* Meeting Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white"
        >
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <StarIcon className="h-5 w-5 mr-2" />
            AI-Recommended Meeting Tips
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {report.meetingTips.map((tip, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur rounded-xl p-3"
              >
                <div className="flex items-start">
                  <span className="text-2xl mr-2">
                    {index === 0 ? '📍' : index === 1 ? '⏰' : '💡'}
                  </span>
                  <p className="text-sm">{tip}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4">
          <motion.button
            onClick={() => setShowDetails(!showDetails)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-3 bg-white text-purple-700 rounded-xl font-semibold hover:bg-purple-50 transition-colors flex items-center justify-center"
          >
            <ChartBarIcon className="h-5 w-5 mr-2" />
            {showDetails ? 'Hide' : 'Show'} Full Report
          </motion.button>

          {report.scores.overall >= 70 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center"
            >
              <HeartIcon className="h-5 w-5 mr-2" />
              Start Conversation
            </motion.button>
          )}
        </div>

        {/* Detailed Report (Collapsible) */}
        <AnimatePresence>
          {showDetails !== undefined && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 bg-white rounded-2xl p-6 shadow-lg overflow-hidden"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Detailed Compatibility Report
              </h3>

              {/* All Recommendations */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">All Recommendations</h4>
                <ul className="space-y-2">
                  {report.recommendations.map((rec, index) => (
                    <li
                      key={index}
                      className="flex items-start"
                    >
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
