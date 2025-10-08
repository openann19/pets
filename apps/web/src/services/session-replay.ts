/**
 * Session Re-Play (OpenReplay) Integration
 * UX recording system for debugging and analytics
 */

import { logger } from './logger'

import type { CustomEvent} from '@/types/common';
import { OpenReplayConfig, UserEvent } from '@/types/common'

interface SessionReplayConfig {
  projectKey: string
  enabled: boolean
  sampleRate: number
  maskAllInputs: boolean
  maskAllText: boolean
  defaultInputMode: number
  obscureTextEmails: boolean
  obscureInputEmails: boolean
  maskTextSelector: string
  maskAllTextSelector: string
  blockClass: string
  blockSelector: string
  ignoreClass: string
  maskClass: string
  collectFonts: boolean
  collectIFrames: boolean
  respectDoNotTrack: boolean
  maskTextPatterns: RegExp[]
}

class SessionReplayService {
  private readonly config: SessionReplayConfig
  private isInitialized = false
  private sessionId: string | null = null

  constructor() {
    this.config = {
      projectKey: process.env.NEXT_PUBLIC_OPENREPLAY_PROJECT_KEY || '',
      enabled: process.env.NODE_ENV === 'production' && !!process.env.NEXT_PUBLIC_OPENREPLAY_PROJECT_KEY,
      sampleRate: 0.1, // 10% of sessions
      maskAllInputs: true,
      maskAllText: false,
      defaultInputMode: 0,
      obscureTextEmails: true,
      obscureInputEmails: true,
      maskTextSelector: '[data-mask-text]',
      maskAllTextSelector: '[data-mask-all-text]',
      blockClass: 'openreplay-block',
      blockSelector: '[data-block]',
      ignoreClass: 'openreplay-ignore',
      maskClass: 'openreplay-mask',
      collectFonts: true,
      collectIFrames: false,
      respectDoNotTrack: true,
      maskTextPatterns: [
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
        /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, // Credit card
        /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
        /\b\d{10,}\b/g // Phone numbers
      ]
    }
  }

  /**
   * Initialize OpenReplay
   */
  async initialize(): Promise<void> {
    if (!this.config.enabled || this.isInitialized) {
      return
    }

    try {
      // Load OpenReplay script
      await this.loadOpenReplayScript()
      
      // Initialize OpenReplay
      if (window?.OpenReplay) {
        const {OpenReplay} = window
        
        this.sessionId = OpenReplay.start({
          projectKey: this.config.projectKey,
          sampleRate: this.config.sampleRate,
          maskAllInputs: this.config.maskAllInputs,
          maskAllText: this.config.maskAllText,
          defaultInputMode: this.config.defaultInputMode,
          obscureTextEmails: this.config.obscureTextEmails,
          obscureInputEmails: this.config.obscureInputEmails,
          maskTextSelector: this.config.maskTextSelector,
          maskAllTextSelector: this.config.maskAllTextSelector,
          blockClass: this.config.blockClass,
          blockSelector: this.config.blockSelector,
          ignoreClass: this.config.ignoreClass,
          maskClass: this.config.maskClass,
          collectFonts: this.config.collectFonts,
          collectIFrames: this.config.collectIFrames,
          respectDoNotTrack: this.config.respectDoNotTrack
        })

        // Set up event listeners
        this.setupEventListeners()
        
        this.isInitialized = true
        logger.info('OpenReplay initialized successfully', { sessionId: this.sessionId })
      }
    } catch (error) {
      logger.error('Failed to initialize OpenReplay', error)
    }
  }

  /**
   * Load OpenReplay script
   */
  private async loadOpenReplayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        resolve()
        return
      }

      // Check if script is already loaded
      if (window.OpenReplay) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://static.openreplay.com/3.5.0/openreplay.js'
      script.async = true
      
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load OpenReplay script'))
      
      document.head.appendChild(script)
    })
  }

  /**
   * Setup event listeners for custom events
   */
  private setupEventListeners(): void {
    if (!window?.OpenReplay) {
      return
    }

    const {OpenReplay} = window

    // Track user authentication
    window.addEventListener('user-login', (event: CustomEvent) => {
      OpenReplay.setUserID(event.detail.userId)
      OpenReplay.setMetadata('user', {
        id: event.detail.userId,
        email: event.detail.email,
        name: event.detail.name
      })
    })

    // Track user logout
    window.addEventListener('user-logout', () => {
      OpenReplay.setUserID(null)
      OpenReplay.setMetadata('user', null)
    })

    // Track page views
    window.addEventListener('page-view', (event: CustomEvent) => {
      OpenReplay.setMetadata('page', {
        url: event.detail.url,
        title: event.detail.title,
        timestamp: new Date().toISOString()
      })
    })

    // Track errors
    window.addEventListener('error', (event: ErrorEvent) => {
      OpenReplay.addIssue({
        type: 'error',
        message: event.message,
        stack: event.error?.stack,
        url: event.filename,
        line: event.lineno,
        column: event.colno
      })
    })

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      OpenReplay.addIssue({
        type: 'unhandledrejection',
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack
      })
    })
  }

  /**
   * Set user information
   */
  setUser(userId: string, email?: string, name?: string): void {
    if (!this.isInitialized || !window?.OpenReplay) {
      return
    }

    const {OpenReplay} = window
    OpenReplay.setUserID(userId)
    
    if (email || name) {
      OpenReplay.setMetadata('user', {
        id: userId,
        email,
        name
      })
    }
  }

  /**
   * Clear user information
   */
  clearUser(): void {
    if (!this.isInitialized || !window?.OpenReplay) {
      return
    }

    const {OpenReplay} = window
    OpenReplay.setUserID(null)
    OpenReplay.setMetadata('user', null)
  }

  /**
   * Add custom event
   */
  addEvent(name: string, data?: Record<string, unknown>): void {
    if (!this.isInitialized || !window?.OpenReplay) {
      return
    }

    const {OpenReplay} = window
    OpenReplay.addEvent(name, data)
  }

  /**
   * Add issue/error
   */
  addIssue(issue: {
    type: string
    message: string
    stack?: string
    url?: string
    line?: number
    column?: number
  }): void {
    if (!this.isInitialized || typeof window === 'undefined' || !(window as any).OpenReplay) {
      return
    }

    const {OpenReplay} = (window as any)
    OpenReplay.addIssue(issue)
  }

  /**
   * Set metadata
   */
  setMetadata(key: string, value: unknown): void {
    if (!this.isInitialized || !window?.OpenReplay) {
      return
    }

    const {OpenReplay} = window
    OpenReplay.setMetadata(key, value)
  }

  /**
   * Get session ID
   */
  getSessionId(): string | null {
    return this.sessionId
  }

  /**
   * Check if session replay is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled && this.isInitialized
  }

  /**
   * Stop session recording
   */
  stop(): void {
    if (!this.isInitialized || !window?.OpenReplay) {
      return
    }

    const {OpenReplay} = window
    OpenReplay.stop()
    this.isInitialized = false
    this.sessionId = null
  }

  /**
   * Restart session recording
   */
  restart(): void {
    if (this.config.enabled) {
      this.stop()
      this.initialize()
    }
  }
}

// Create singleton instance
export const sessionReplayService = new SessionReplayService()

// React hook for session replay
export function useSessionReplay() {
  const [isEnabled, setIsEnabled] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    const initialize = async () => {
      await sessionReplayService.initialize()
      setIsEnabled(sessionReplayService.isEnabled())
      setSessionId(sessionReplayService.getSessionId())
    }

    initialize()
  }, [])

  const setUser = (userId: string, email?: string, name?: string) => {
    sessionReplayService.setUser(userId, email, name)
  }

  const clearUser = () => {
    sessionReplayService.clearUser()
  }

  const addEvent = (name: string, data?: Record<string, unknown>) => {
    sessionReplayService.addEvent(name, data)
  }

  const addIssue = (issue: Parameters<typeof sessionReplayService.addIssue>[0]) => {
    sessionReplayService.addIssue(issue)
  }

  const setMetadata = (key: string, value: unknown) => {
    sessionReplayService.setMetadata(key, value)
  }

  return {
    isEnabled,
    sessionId,
    setUser,
    clearUser,
    addEvent,
    addIssue,
    setMetadata
  }
}

export default sessionReplayService
