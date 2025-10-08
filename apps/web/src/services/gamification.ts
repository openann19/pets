/**
 * Gamification Service
 * Handles streaks, badges, and achievement system
 */

import { logger } from './logger'

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: 'swipe' | 'match' | 'chat' | 'profile' | 'social' | 'premium'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlockedAt?: string
  progress?: number
  maxProgress?: number
}

export interface Streak {
  type: 'daily_swipe' | 'daily_login' | 'daily_chat'
  current: number
  longest: number
  lastActivity: string
  nextMilestone: number
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  points: number
  unlockedAt?: string
  progress?: number
  maxProgress?: number
}

export interface UserGamification {
  userId: string
  totalPoints: number
  level: number
  badges: Badge[]
  streaks: Streak[]
  achievements: Achievement[]
  lastUpdated: string
}

class GamificationService {
  private apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

  /**
   * Get user's gamification data
   */
  async getUserGamification(userId: string): Promise<UserGamification | null> {
    try {
      const response = await fetch(`${this.apiUrl}/api/gamification/user/${userId}`)
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      return data.gamification
    } catch (error: any) {
      logger.error('Failed to get user gamification data', error)
      return null
    }
  }

  /**
   * Record user activity for streaks
   */
  async recordActivity(userId: string, activity: {
    type: 'swipe' | 'login' | 'chat' | 'match' | 'profile_update'
    count?: number
    metadata?: Record<string, any>
  }): Promise<void> {
    try {
      await fetch(`${this.apiUrl}/api/gamification/activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          activity,
          timestamp: new Date().toISOString()
        })
      })
    } catch (error: any) {
      logger.error('Failed to record activity', error)
    }
  }

  /**
   * Check and unlock new badges
   */
  async checkBadgeUnlocks(userId: string): Promise<Badge[]> {
    try {
      const response = await fetch(`${this.apiUrl}/api/gamification/check-badges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      return data.newBadges || []
    } catch (error: any) {
      logger.error('Failed to check badge unlocks', error)
      return []
    }
  }

  /**
   * Get available badges
   */
  async getAvailableBadges(): Promise<Badge[]> {
    try {
      const response = await fetch(`${this.apiUrl}/api/gamification/badges`)
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      return data.badges || []
    } catch (error: any) {
      logger.error('Failed to get available badges', error)
      return this.getFallbackBadges()
    }
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(type: 'points' | 'streaks' | 'badges', limit: number = 10): Promise<Array<{
    userId: string
    userName: string
    userAvatar?: string
    score: number
    rank: number
  }>> {
    try {
      const response = await fetch(`${this.apiUrl}/api/gamification/leaderboard?type=${type}&limit=${limit}`)
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      return data.leaderboard || []
    } catch (error: any) {
      logger.error('Failed to get leaderboard', error)
      return []
    }
  }

  /**
   * Get fallback badges when API is unavailable
   */
  private getFallbackBadges(): Badge[] {
    return [
      {
        id: 'first_swipe',
        name: 'First Swipe',
        description: 'Complete your first swipe',
        icon: '👆',
        category: 'swipe',
        rarity: 'common',
        maxProgress: 1
      },
      {
        id: 'swipe_streak_7',
        name: 'Week Warrior',
        description: 'Swipe for 7 days in a row',
        icon: '🔥',
        category: 'swipe',
        rarity: 'rare',
        maxProgress: 7
      },
      {
        id: 'first_match',
        name: 'Matchmaker',
        description: 'Get your first match',
        icon: '💕',
        category: 'match',
        rarity: 'common',
        maxProgress: 1
      },
      {
        id: 'match_streak_5',
        name: 'Love Magnet',
        description: 'Get 5 matches in a row',
        icon: '🧲',
        category: 'match',
        rarity: 'epic',
        maxProgress: 5
      },
      {
        id: 'first_chat',
        name: 'Chatterbox',
        description: 'Send your first message',
        icon: '💬',
        category: 'chat',
        rarity: 'common',
        maxProgress: 1
      },
      {
        id: 'chat_streak_30',
        name: 'Social Butterfly',
        description: 'Chat for 30 days in a row',
        icon: '🦋',
        category: 'chat',
        rarity: 'legendary',
        maxProgress: 30
      },
      {
        id: 'complete_profile',
        name: 'Profile Perfectionist',
        description: 'Complete your pet profile with all details',
        icon: '✨',
        category: 'profile',
        rarity: 'rare',
        maxProgress: 1
      },
      {
        id: 'premium_member',
        name: 'Premium Paws',
        description: 'Upgrade to Premium',
        icon: '👑',
        category: 'premium',
        rarity: 'epic',
        maxProgress: 1
      },
      {
        id: 'social_share',
        name: 'Social Sharer',
        description: 'Share your pet profile on social media',
        icon: '📱',
        category: 'social',
        rarity: 'common',
        maxProgress: 1
      },
      {
        id: 'feedback_giver',
        name: 'Helpful Hound',
        description: 'Submit feedback to help improve the app',
        icon: '🐕',
        category: 'social',
        rarity: 'rare',
        maxProgress: 1
      }
    ]
  }

  /**
   * Calculate user level from points
   */
  calculateLevel(points: number): number {
    // Level formula: level = floor(sqrt(points / 100))
    return Math.floor(Math.sqrt(points / 100)) + 1
  }

  /**
   * Calculate points needed for next level
   */
  getPointsForNextLevel(currentLevel: number): number {
    return Math.pow(currentLevel, 2) * 100
  }

  /**
   * Get level progress percentage
   */
  getLevelProgress(points: number): { current: number; next: number; percentage: number } {
    const currentLevel = this.calculateLevel(points)
    const currentLevelPoints = Math.pow(currentLevel - 1, 2) * 100
    const nextLevelPoints = Math.pow(currentLevel, 2) * 100
    
    const progress = points - currentLevelPoints
    const total = nextLevelPoints - currentLevelPoints
    const percentage = (progress / total) * 100

    return {
      current: currentLevelPoints,
      next: nextLevelPoints,
      percentage: Math.min(100, Math.max(0, percentage))
    }
  }
}

// Create singleton instance
export const gamificationService = new GamificationService()

// React hook for gamification
export function useGamification(userId?: string) {
  const [gamification, setGamification] = useState<UserGamification | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newBadges, setNewBadges] = useState<Badge[]>([])

  const fetchGamification = async () => {
    if (!userId) return

    setIsLoading(true)
    setError(null)

    try {
      const data = await gamificationService.getUserGamification(userId)
      setGamification(data)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const recordActivity = async (activity: Parameters<typeof gamificationService.recordActivity>[1]) => {
    if (!userId) return

    try {
      await gamificationService.recordActivity(userId, activity)
      
      // Check for new badges
      const badges = await gamificationService.checkBadgeUnlocks(userId)
      if (badges.length > 0) {
        setNewBadges(badges)
        // Refresh gamification data
        await fetchGamification()
      }
    } catch (error: any) {
      setError(error.message)
    }
  }

  const clearNewBadges = () => {
    setNewBadges([])
  }

  useEffect(() => {
    if (userId) {
      fetchGamification()
    }
  }, [userId])

  return {
    gamification,
    isLoading,
    error,
    newBadges,
    fetchGamification,
    recordActivity,
    clearNewBadges,
    calculateLevel: gamificationService.calculateLevel.bind(gamificationService),
    getLevelProgress: gamificationService.getLevelProgress.bind(gamificationService)
  }
}

export default gamificationService
