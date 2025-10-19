/**
 * In-App Coach Tooltips Service
 * Uses Shepherd.js for guided tours and tooltips
 */

import Shepherd from 'shepherd.js'
import 'shepherd.js/dist/css/shepherd.css'
import { logger } from './logger'

export interface TourStep {
  id: string
  title: string
  text: string
  attachTo: {
    element: string
    on: 'top' | 'bottom' | 'left' | 'right' | 'auto'
  }
  buttons?: Array<{
    text: string
    action: () => void
    classes?: string
  }>
  beforeShowPromise?: () => Promise<void>
  showOn?: () => boolean
  canClickTarget?: boolean
  modalOverlayOpeningPadding?: number
  modalOverlayOpeningRadius?: number
}

export interface TourConfig {
  id: string
  name: string
  description: string
  steps: TourStep[]
  defaultStepOptions?: {
    classes?: string
    scrollTo?: boolean
    cancelIcon?: {
      enabled?: boolean
    }
  }
}

class CoachTooltipsService {
  private tours: Map<string, Shepherd.Tour> = new Map()
  private currentTour: Shepherd.Tour | null = null
  private isInitialized = false

  /**
   * Initialize the service
   */
  initialize() {
    if (this.isInitialized) return

    // Configure default Shepherd options
    Shepherd.defaults = {
      ...Shepherd.defaults,
      classes: 'shepherd-theme-pawfectmatch',
      useModalOverlay: true,
      scrollTo: true,
      cancelIcon: {
        enabled: true
      }
    }

    this.isInitialized = true
    logger.info('Coach tooltips service initialized')
  }

  /**
   * Create a new tour
   */
  createTour(config: TourConfig): Shepherd.Tour {
    this.initialize()

    const tour = new Shepherd.Tour({
      id: config.id,
      useModalOverlay: true,
      defaultStepOptions: {
        classes: 'shepherd-theme-pawfectmatch',
        scrollTo: true,
        cancelIcon: {
          enabled: true
        },
        ...config.default as anyStepOptions
      }
    })

    // Add steps to tour
    config.steps.forEach(stepConfig => {
      tour.addStep({
        id: stepConfig.id,
        title: stepConfig.title,
        text: stepConfig.text,
        attachTo: stepConfig.attachTo,
        buttons: stepConfig.buttons || this.getDefaultButtons(tour),
        beforeShowPromise: stepConfig.beforeShowPromise,
        showOn: stepConfig.showOn,
        canClickTarget: stepConfig.canClickTarget,
        modalOverlayOpeningPadding: stepConfig.modalOverlayOpeningPadding,
        modalOverlayOpeningRadius: stepConfig.modalOverlayOpeningRadius
      })
    })

    // Store tour
    this.tours.set(config.id, tour)

    // Add event listeners
    tour.on('complete', () => {
      this.onTourComplete(config.id)
    })

    tour.on('cancel', () => {
      this.onTourCancel(config.id)
    })

    return tour
  }

  /**
   * Start a tour
   */
  startTour(tourId: string): boolean {
    const tour = this.tours.get(tourId)
    if (!tour) {
      logger.warn('Tour not found', { tourId })
      return false
    }

    this.currentTour = tour
    tour.start()
    
    logger.info('Tour started', { tourId })
    return true
  }

  /**
   * Stop current tour
   */
  stopTour(): void {
    if (this.currentTour) {
      this.currentTour.cancel()
      this.currentTour = null
    }
  }

  /**
   * Show a single tooltip
   */
  showTooltip(config: {
    id: string
    title: string
    text: string
    element: string
    position?: 'top' | 'bottom' | 'left' | 'right' | 'auto'
    duration?: number
  }): void {
    this.initialize()

    const tour = new Shepherd.Tour({
      useModalOverlay: false,
      defaultStepOptions: {
        classes: 'shepherd-theme-pawfectmatch-tooltip'
      }
    })

    tour.addStep({
      id: config.id,
      title: config.title,
      text: config.text,
      attachTo: {
        element: config.element,
        on: config.position || 'auto'
      },
      buttons: [
        {
          text: 'Got it!',
          action: () => tour.complete()
        }
      ]
    })

    tour.start()

    // Auto-hide after duration
    if (config.duration) {
      setTimeout(() => {
        tour.complete()
      }, config.duration)
    }
  }

  /**
   * Get predefined tours
   */
  getPredefinedTours(): Record<string, TourConfig> {
    return {
      onboarding: {
        id: 'onboarding',
        name: 'Welcome to PawfectMatch',
        description: 'Get started with your pet matching journey',
        steps: [
          {
            id: 'welcome',
            title: 'Welcome to PawfectMatch! 🐾',
            text: 'Let\'s take a quick tour to help you get started with finding the perfect match for your furry friend.',
            attachTo: {
              element: 'body',
              on: 'auto'
            }
          },
          {
            id: 'profile-setup',
            title: 'Set Up Your Pet Profile',
            text: 'First, let\'s create a profile for your pet. Click here to add photos, personality traits, and preferences.',
            attachTo: {
              element: '[data-tour="profile-setup"]',
              on: 'bottom'
            }
          },
          {
            id: 'swipe-interface',
            title: 'Discover New Matches',
            text: 'Swipe through potential matches for your pet. Swipe right to like, left to pass, and up for super like!',
            attachTo: {
              element: '[data-tour="swipe-interface"]',
              on: 'top'
            }
          },
          {
            id: 'chat-feature',
            title: 'Start Conversations',
            text: 'Once you match, you can chat with other pet owners to plan playdates or meetings.',
            attachTo: {
              element: '[data-tour="chat-feature"]',
              on: 'left'
            }
          },
          {
            id: 'premium-features',
            title: 'Unlock Premium Features',
            text: 'Upgrade to Premium for unlimited swipes, advanced filters, and priority matching.',
            attachTo: {
              element: '[data-tour="premium-features"]',
              on: 'right'
            }
          }
        ]
      },
      swipeTutorial: {
        id: 'swipe-tutorial',
        name: 'Swipe Tutorial',
        description: 'Learn how to use the swipe interface',
        steps: [
          {
            id: 'swipe-basics',
            title: 'Swipe Basics',
            text: 'Swipe right to like a pet, left to pass, and up for super like. You can also tap to see more details.',
            attachTo: {
              element: '[data-tour="swipe-card"]',
              on: 'top'
            }
          },
          {
            id: 'swipe-actions',
            title: 'Swipe Actions',
            text: 'Use the action buttons below the card for quick interactions without swiping.',
            attachTo: {
              element: '[data-tour="swipe-actions"]',
              on: 'top'
            }
          },
          {
            id: 'filters',
            title: 'Use Filters',
            text: 'Adjust your preferences to see more relevant matches. Filter by distance, age, size, and more.',
            attachTo: {
              element: '[data-tour="filters"]',
              on: 'bottom'
            }
          }
        ]
      },
      chatTutorial: {
        id: 'chat-tutorial',
        name: 'Chat Tutorial',
        description: 'Learn how to use the chat features',
        steps: [
          {
            id: 'chat-interface',
            title: 'Chat Interface',
            text: 'Send messages, share photos, and plan meetups with other pet owners.',
            attachTo: {
              element: '[data-tour="chat-interface"]',
              on: 'right'
            }
          },
          {
            id: 'typing-indicator',
            title: 'Typing Indicators',
            text: 'See when someone is typing a message to you in real-time.',
            attachTo: {
              element: '[data-tour="typing-indicator"]',
              on: 'top'
            }
          },
          {
            id: 'message-actions',
            title: 'Message Actions',
            text: 'React to messages, share your location, or send photos to enhance your conversations.',
            attachTo: {
              element: '[data-tour="message-actions"]',
              on: 'left'
            }
          }
        ]
      }
    }
  }

  /**
   * Check if user has completed a tour
   */
  hasCompletedTour(tourId: string): boolean {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(`tour_completed_${tourId}`) === 'true'
  }

  /**
   * Mark tour as completed
   */
  markTourCompleted(tourId: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(`tour_completed_${tourId}`, 'true')
  }

  /**
   * Reset tour completion status
   */
  resetTourCompletion(tourId: string): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(`tour_completed_${tourId}`)
  }

  /**
   * Get default buttons for tour steps
   */
  private getDefaultButtons(tour: Shepherd.Tour) {
    return [
      {
        text: 'Skip',
        action: () => tour.cancel(),
        classes: 'shepherd-button-secondary'
      },
      {
        text: 'Next',
        action: () => tour.next(),
        classes: 'shepherd-button-primary'
      }
    ]
  }

  /**
   * Handle tour completion
   */
  private onTourComplete(tourId: string): void {
    this.markTourCompleted(tourId)
    this.currentTour = null
    
    logger.info('Tour completed', { tourId })
    
    // Track analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'tour_completed', {
        tour_id: tourId
      })
    }
  }

  /**
   * Handle tour cancellation
   */
  private onTourCancel(tourId: string): void {
    this.currentTour = null
    
    logger.info('Tour cancelled', { tourId })
    
    // Track analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'tour_cancelled', {
        tour_id: tourId
      })
    }
  }
}

// Create singleton instance
export const coachTooltipsService = new CoachTooltipsService()

// React hook for coach tooltips
export function useCoachTooltips() {
  const [currentTour, setCurrentTour] = useState<string | null>(null)
  const [isTourActive, setIsTourActive] = useState(false)

  const startTour = (tourId: string) => {
    const success = coachTooltipsService.startTour(tourId)
    if (success) {
      setCurrentTour(tourId)
      setIsTourActive(true)
    }
    return success
  }

  const stopTour = () => {
    coachTooltipsService.stopTour()
    setCurrentTour(null)
    setIsTourActive(false)
  }

  const showTooltip = (config: Parameters<typeof coachTooltipsService.showTooltip>[0]) => {
    coachTooltipsService.showTooltip(config)
  }

  const hasCompletedTour = (tourId: string) => {
    return coachTooltipsService.hasCompletedTour(tourId)
  }

  const markTourCompleted = (tourId: string) => {
    coachTooltipsService.markTourCompleted(tourId)
  }

  const resetTourCompletion = (tourId: string) => {
    coachTooltipsService.resetTourCompletion(tourId)
  }

  const getPredefinedTours = () => {
    return coachTooltipsService.getPredefinedTours()
  }

  return {
    currentTour,
    isTourActive,
    startTour,
    stopTour,
    showTooltip,
    hasCompletedTour,
    markTourCompleted,
    resetTourCompletion,
    getPredefinedTours
  }
}

export default coachTooltipsService
