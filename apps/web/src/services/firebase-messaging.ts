/**
 * Firebase Cloud Messaging Service
 * Handles push notifications for web and mobile
 */

import { initializeApp, getApps } from 'firebase/app'
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging'
import { useState, useEffect } from 'react'
import { logger } from './logger'

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env['NEXT_PUBLIC_FIREBASE_API_KEY'],
  authDomain: process.env['NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'],
  projectId: process.env['NEXT_PUBLIC_FIREBASE_PROJECT_ID'],
  storageBucket: process.env['NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'],
  messagingSenderId: process.env['NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'],
  appId: process.env['NEXT_PUBLIC_FIREBASE_APP_ID'],
  measurementId: process.env['NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID']
}

// VAPID key for web push
const VAPID_KEY = process.env['NEXT_PUBLIC_FIREBASE_VAPID_KEY']

// Initialize Firebase
let app: any = null
let messaging: any = null

if (typeof window !== 'undefined') {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig)
  } else {
    app = getApps()[0]
  }
}

export interface PushNotificationPayload {
  title: string
  body: string
  icon?: string
  image?: string
  badge?: string
  tag?: string
  data?: Record<string, any>
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
  requireInteraction?: boolean
  silent?: boolean
}

export interface NotificationPermission {
  permission: NotificationPermission
  token: string | null
  error: string | null
}

class FirebaseMessagingService {
  private token: string | null = null
  private isSupported: boolean = false
  private permission: NotificationPermission = 'default'
  private messageHandlers: Array<(payload: any) => void> = []

  async initialize(): Promise<NotificationPermission> {
    try {
      // Check if messaging is supported
      this.isSupported = await isSupported()
      
      if (!this.isSupported) {
        logger.warn('[FCM] Messaging not supported in this browser')
        return {
          permission: 'denied',
          token: null,
          error: 'Messaging not supported'
        }
      }

      // Initialize messaging
      messaging = getMessaging(app)

      // Request permission
      this.permission = await this.requestPermission()
      
      if (this.permission === 'granted') {
        // Get FCM token
        this.token = await this.getFCMToken()
        
        // Set up message listener
        this.setupMessageListener()
        
        logger.info('[FCM] Initialized successfully', { token: this.token?.substring(0, 20) + '...' })
      }

      return {
        permission: this.permission,
        token: this.token,
        error: null
      }
    } catch (error: any) {
      logger.error('[FCM] Initialization failed', error)
      return {
        permission: 'denied',
        token: null,
        error: error.message
      }
    }
  }

  private async requestPermission(): Promise<NotificationPermission> {
    try {
      if (!('Notification' in window)) {
        throw new Error('Notifications not supported')
      }

      if (Notification.permission === 'granted') {
        return 'granted'
      }

      if (Notification.permission === 'denied') {
        return 'denied'
      }

      // Request permission
      const permission = await Notification.requestPermission()
      return permission
    } catch (error: any) {
      logger.error('[FCM] Permission request failed', error)
      return 'denied' as NotificationPermission
    }
  }

  private async getFCMToken(): Promise<string | null> {
    try {
      if (!messaging || !VAPID_KEY) {
        throw new Error('Messaging not initialized or VAPID key missing')
      }

      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY
      })

      if (token) {
        // Send token to server
        await this.sendTokenToServer(token)
        return token
      }

      return null
    } catch (error: any) {
      logger.error('[FCM] Token generation failed', error)
      return null
    }
  }

  private async sendTokenToServer(token: string): Promise<void> {
    try {
      const response = await fetch('/api/notifications/register-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      })

      if (!response.ok) {
        throw new Error('Failed to register token with server')
      }

      logger.info('[FCM] Token registered with server')
    } catch (error: any) {
      logger.error('[FCM] Failed to register token', error)
    }
  }

  private setupMessageListener(): void {
    if (!messaging) return

    onMessage(messaging, (payload) => {
      logger.info('[FCM] Message received', payload)
      
      // Show notification
      this.showNotification(payload)
      
      // Notify handlers
      this.messageHandlers.forEach(handler => handler(payload))
    })
  }

  private showNotification(payload: any): void {
    if (this.permission !== 'granted') return

    const { notification, data } = payload

    const notificationOptions: NotificationOptions & { image?: string } = {
      body: notification.body,
      icon: notification.icon || '/icons/icon-192x192.png',
      image: notification.image,
      badge: '/icons/badge-72x72.png',
      tag: notification.tag || 'pawfectmatch',
      data: data || {},
      requireInteraction: false,
      silent: false,
      actions: [
        {
          action: 'view',
          title: 'View',
          icon: '/icons/view-icon.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    }

    const notificationInstance = new Notification(notification.title, notificationOptions)

    // Handle notification click
    notificationInstance.onclick = (event) => {
      event.preventDefault()
      
      // Handle different actions
      if (data?.action === 'match') {
        window.open('/matches', '_blank')
      } else if (data?.action === 'message') {
        window.open(`/chat/${data.chatId}`, '_blank')
      } else if (data?.action === 'premium') {
        window.open('/premium', '_blank')
      } else {
        window.open('/', '_blank')
      }

      notificationInstance.close()
    }

    // Auto-close after 5 seconds
    setTimeout(() => {
      notificationInstance.close()
    }, 5000)
  }

  // Public methods
  getToken(): string | null {
    return this.token
  }

  getPermission(): NotificationPermission {
    return this.permission
  }

  isMessagingSupported(): boolean {
    return this.isSupported
  }

  onMessage(handler: (payload: any) => void): () => void {
    this.messageHandlers.push(handler)
    
    // Return unsubscribe function
    return () => {
      const index = this.messageHandlers.indexOf(handler)
      if (index > -1) {
        this.messageHandlers.splice(index, 1)
      }
    }
  }

  async refreshToken(): Promise<string | null> {
    try {
      this.token = await this.getFCMToken()
      return this.token
    } catch (error: any) {
      logger.error('[FCM] Token refresh failed', error)
      return null
    }
  }

  // Test notification
  async sendTestNotification(): Promise<void> {
    if (this.permission !== 'granted') {
      throw new Error('Notification permission not granted')
    }

    const testPayload = {
      notification: {
        title: '🐾 PawfectMatch Test',
        body: 'Push notifications are working!',
        icon: '/icons/icon-192x192.png'
      },
      data: {
        action: 'test',
        timestamp: Date.now().toString()
      }
    }

    this.showNotification(testPayload)
  }
}

// Create singleton instance
export const firebaseMessaging = new FirebaseMessagingService()

// React hook for using Firebase Messaging
export function useFirebaseMessaging() {
  const [state, setState] = useState<{
    isSupported: boolean
    permission: NotificationPermission
    token: string | null
    error: string | null
    isInitialized: boolean
  }>({
    isSupported: false,
    permission: 'default' as NotificationPermission,
    token: null,
    error: null,
    isInitialized: false
  })

  useEffect(() => {
    let isMounted = true

    const initialize = async () => {
      try {
        const result = await firebaseMessaging.initialize()
        
        if (isMounted) {
          setState({
            isSupported: firebaseMessaging.isMessagingSupported(),
            permission: result.permission,
            token: result.token,
            error: result.error,
            isInitialized: true
          })
        }
      } catch (error: any) {
        if (isMounted) {
          setState(prev => ({
            ...prev,
            error: error.message,
            isInitialized: true
          }))
        }
      }
    }

    initialize()

    return () => {
      isMounted = false
    }
  }, [])

  const requestPermission = async () => {
    try {
      const result = await firebaseMessaging.initialize()
      setState(prev => ({
        ...prev,
        permission: result.permission,
        token: result.token,
        error: result.error
      }))
      return result
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message
      }))
      throw error
    }
  }

  const sendTestNotification = async () => {
    await firebaseMessaging.sendTestNotification()
  }

  const refreshToken = async () => {
    try {
      const token = await firebaseMessaging.refreshToken()
      setState(prev => ({
        ...prev,
        token
      }))
      return token
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message
      }))
      throw error
    }
  }

  return {
    ...state,
    requestPermission,
    sendTestNotification,
    refreshToken,
    onMessage: firebaseMessaging.onMessage.bind(firebaseMessaging)
  }
}

export default firebaseMessaging
