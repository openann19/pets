import React, { useEffect, useState } from 'react';
import { useAnimation } from '../../hooks/useAnimation';
import { useTheme } from '../../hooks/useTheme';

export interface PetRecommendation {
  id: string;
  name: string;
  type: string;
  breed?: string;
  age?: string;
  imageUrl: string;
  matchScore: number;
  matchReasons: string[];
  location?: string;
  distance?: number;
}

export interface PersonalizedRecommendationsProps {
  /**
   * User ID for personalized recommendations
   */
  userId: string;

  /**
   * Title for the recommendations section
   */
  title?: string;

  /**
   * Maximum number of recommendations to show
   */
  maxRecommendations?: number;

  /**
   * Whether to enable explanations for each recommendation
   */
  showExplanations?: boolean;

  /**
   * Callback when a recommendation is clicked
   */
  onRecommendationClick?: (recommendation: PetRecommendation) => void;

  /**
   * Whether to auto-refresh recommendations
   */
  autoRefresh?: boolean;

  /**
   * Auto-refresh interval in milliseconds
   */
  refreshInterval?: number;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Mock data for development purposes
   */
  mockData?: PetRecommendation[];
}

/**
 * A component that displays AI-powered personalized pet recommendations
 * Built with 2025 UI/UX best practices
 */
export const PersonalizedRecommendations: React.FC<PersonalizedRecommendationsProps> = ({
  userId,
  title = 'Recommended for You',
  maxRecommendations = 4,
  showExplanations = true,
  onRecommendationClick,
  autoRefresh = false,
  refreshInterval = 60000, // 1 minute
  className = '',
  mockData
}) => {
  const { isDarkMode } = useTheme();
  const { animate } = useAnimation();
  const [recommendations, setRecommendations] = useState<PetRecommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentHover, setCurrentHover] = useState<string | null>(null);

  // Fetch recommendations based on user behavior and preferences
  useEffect(() => {
    const fetchRecommendations = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        // If mock data is provided, use it instead of fetching
        if (mockData !== null && mockData !== undefined) {
          setRecommendations(mockData.slice(0, maxRecommendations));
          setLoading(false);
          return;
        }

        // In a real implementation, this would be an API call to a recommendation engine
        // For example: const response = await fetch(`/api/recommendations/${userId}`);

        // Simulating API response for demo purposes
        await new Promise(resolve => setTimeout(resolve, 1000));

        const demoRecommendations: PetRecommendation[] = [
          {
            id: '1',
            name: 'Luna',
            type: 'dog',
            breed: 'Labrador Retriever',
            age: '2 years',
            imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3',
            matchScore: 95,
            matchReasons: ['Similar to pets you liked', 'Matches your activity level', 'Good with children'],
            location: 'San Francisco, CA',
            distance: 3.2
          },
          {
            id: '2',
            name: 'Oliver',
            type: 'cat',
            breed: 'Maine Coon',
            age: '1 year',
            imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3',
            matchScore: 89,
            matchReasons: ['Playful personality', 'Low maintenance', 'Matches your living situation'],
            location: 'Oakland, CA',
            distance: 8.7
          },
          {
            id: '3',
            name: 'Max',
            type: 'dog',
            breed: 'Golden Retriever',
            age: '3 years',
            imageUrl: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?ixlib=rb-4.0.3',
            matchScore: 87,
            matchReasons: ['Friendly with other pets', 'Already trained', 'Good for first-time owners'],
            location: 'San Jose, CA',
            distance: 15.4
          },
          {
            id: '4',
            name: 'Whiskers',
            type: 'cat',
            breed: 'Siamese',
            age: '4 years',
            imageUrl: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?ixlib=rb-4.0.3',
            matchScore: 84,
            matchReasons: ['Quiet companion', 'Indoor lifestyle match', 'Matches your schedule'],
            location: 'Palo Alto, CA',
            distance: 7.6
          },
          {
            id: '5',
            name: 'Buddy',
            type: 'dog',
            breed: 'Beagle',
            age: '1 year',
            imageUrl: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?ixlib=rb-4.0.3',
            matchScore: 82,
            matchReasons: ['Energetic like you', 'Great for apartments', 'Social with other dogs'],
            location: 'San Francisco, CA',
            distance: 2.1
          }
        ];

        // Limit the recommendations to maxRecommendations
        setRecommendations(demoRecommendations.slice(0, maxRecommendations));
        setLoading(false);
      } catch (err) {
        setError('Failed to load recommendations. Please try again.');
        setLoading(false);
        console.error('Error fetching recommendations:', err);
      }
    };

    fetchRecommendations();

    // Set up auto-refresh if enabled
    let refreshTimer: ReturnType<typeof setInterval> | null = null;
    if (autoRefresh) {
      refreshTimer = setInterval(() => {
        fetchRecommendations();
      }, refreshInterval);
    }

    return () => {
      if (refreshTimer !== null) {
        clearInterval(refreshTimer);
      }
    };
  }, [userId, maxRecommendations, mockData, autoRefresh, refreshInterval]);

  const handleCardHover = (id: string): void => {
    setCurrentHover(id);
    animate('scale');
  };

  const handleCardClick = (recommendation: PetRecommendation): void => {
    if (onRecommendationClick !== null && onRecommendationClick !== undefined) {
      onRecommendationClick(recommendation);
    }
  };

  // Generate background gradient based on match score
  const getMatchScoreGradient = (score: number): string => {
    if (score >= 90) {
      return isDarkMode
        ? 'from-emerald-700/80 to-emerald-900/80'
        : 'from-emerald-400/90 to-emerald-600/90';
    } else if (score >= 80) {
      return isDarkMode
        ? 'from-blue-700/80 to-blue-900/80'
        : 'from-blue-400/90 to-blue-600/90';
    } else if (score >= 70) {
      return isDarkMode
        ? 'from-violet-700/80 to-violet-900/80'
        : 'from-violet-400/90 to-violet-600/90';
    } else {
      return isDarkMode
        ? 'from-amber-700/80 to-amber-900/80'
        : 'from-amber-400/90 to-amber-600/90';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          {title}
        </h2>
        <div className={`text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} cursor-pointer hover:underline`}>
          View all
        </div>
      </div>

      {/* Loading state */}
      {loading !== undefined && (
        <div className="w-full flex justify-center items-center py-16">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-slate-300 dark:bg-slate-700 h-10 w-10" />
            <div className="flex-1 space-y-3 py-1">
              <div className="h-2 bg-slate-300 dark:bg-slate-700 rounded" />
              <div className="h-2 bg-slate-300 dark:bg-slate-700 rounded" />
              <div className="h-2 bg-slate-300 dark:bg-slate-700 rounded" />
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {error !== undefined && (
        <div className={`w-full rounded-lg p-4 text-center ${isDarkMode ? 'bg-red-900/30 text-red-200' : 'bg-red-50 text-red-600'}`}>
          {error}
          <button
            className={`ml-4 px-3 py-1 rounded-md ${isDarkMode ? 'bg-red-800 hover:bg-red-700' : 'bg-red-100 hover:bg-red-200'}`}
            onClick={() => { setError(null); }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Recommendations grid */}
      {!loading && !error && recommendations.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendations.map((recommendation) => (
            <div
              key={recommendation.id}
              className={`
                rounded-xl overflow-hidden shadow-lg transition-all duration-300
                ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
                ${currentHover === recommendation.id ? 'transform scale-[1.03] shadow-xl' : ''}
                cursor-pointer
              `}
              onMouseEnter={() => { handleCardHover(recommendation.id); }}
              onMouseLeave={() => { setCurrentHover(null); }}
              onClick={() => { handleCardClick(recommendation); }}
            >
              {/* Pet image */}
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={recommendation.imageUrl}
                  alt={recommendation.name}
                  className="w-full h-full object-cover"
                />

                {/* Match score badge */}
                <div className={`
                  absolute top-3 right-3 rounded-full px-3 py-1
                  bg-gradient-to-r ${getMatchScoreGradient(recommendation.matchScore)}
                  backdrop-blur-sm text-white font-bold text-sm flex items-center gap-1
                `}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {recommendation.matchScore}% Match
                </div>
              </div>

              {/* Pet info */}
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {recommendation.name}
                  </h3>
                  <span className={`text-xs font-medium px-2 py-1 rounded-md ${recommendation.type === 'dog'
                    ? isDarkMode ? 'bg-blue-900/40 text-blue-200' : 'bg-blue-100 text-blue-800'
                    : isDarkMode ? 'bg-amber-900/40 text-amber-200' : 'bg-amber-100 text-amber-800'
                    }`}>
                    {recommendation.type.charAt(0).toUpperCase() + recommendation.type.slice(1)}
                  </span>
                </div>

                <div className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {recommendation.breed} • {recommendation.age}
                </div>

                <div className={`mt-2 flex items-center text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {recommendation.location} ({recommendation.distance} miles away)
                </div>

                {/* Match reasons */}
                {showExplanations !== undefined && (
                  <div className="mt-3">
                    <div className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Why we recommended {recommendation.name}:
                    </div>
                    <ul className={`text-xs space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {recommendation.matchReasons.slice(0, 2).map((reason, index) => (
                        <li key={index} className="flex items-center">
                          <svg className="h-3 w-3 mr-1 flex-shrink-0 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No recommendations state */}
      {!loading && !error && recommendations.length === 0 && (
        <div className={`
          w-full rounded-lg p-8 text-center
          ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-600'}
        `}>
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className={`mt-4 text-lg font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            No recommendations yet
          </h3>
          <p className="mt-2">
            As you interact with more pets, we'll learn your preferences and provide personalized recommendations.
          </p>
        </div>
      )}
    </div>
  );
};

export default PersonalizedRecommendations;
