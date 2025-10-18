/**
 * Real-Time Typing Indicator Hook
 * Leverages existing WebSocket infrastructure for typing events
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useEnhancedSocket } from './useEnhancedSocket'
import { useAuthStore } from '@/lib/auth-store'

interface TypingUser {
  userId: string
  userName: string
  avatar?: string
  timestamp: number
}

interface UseTypingIndicatorOptions {
  chatId?: string
  roomId?: string
  throttleMs?: number
  timeoutMs?: number
}

export function useTypingIndicator(options: UseTypingIndicatorOptions = {}) {
  const { chatId, roomId, throttleMs = 1000, timeoutMs = 3000 } = options
  const { user } = useAuthStore()
  const { socket, isConnected } = useEnhancedSocket()
  
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [isUserTyping, setIsUserTyping] = useState(false)
  
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastTypingEventRef = useRef<number>(0)
  const typingUsersRef = useRef<Map<string, TypingUser>>(new Map())

  // Clean up typing users that haven't typed recently
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now()
      const activeUsers = Array.from(typingUsersRef.current.values())
        .filter(user => now - user.timestamp < timeoutMs)
      
      if (activeUsers.length !== typingUsersRef.current.size) {
        typingUsersRef.current.clear()
        activeUsers.forEach(user => typingUsersRef.current.set(user.userId, user))
        setTypingUsers(activeUsers)
      }
    }, 1000)

    return () => clearInterval(cleanupInterval)
  }, [timeoutMs])

  // Set up socket event listeners
  useEffect(() => {
    if (!socket || !isConnected) return

    const room = chatId ? `chat:${chatId}` : roomId ? `room:${roomId}` : null
    if (!room) return

    // Join typing room
    socket.emit('join_typing_room', { room })

    // Listen for typing events
    const handleUserTyping = (data: {
      userId: string
      userName: string
      avatar?: string
      room: string
    }) => {
      if (data.room !== room || data.userId === user?.id) return

      const typingUser: TypingUser = {
        userId: data.userId,
        userName: data.userName,
        avatar: data.avatar,
        timestamp: Date.now()
      }

      typingUsersRef.current.set(data.userId, typingUser)
      setTypingUsers(Array.from(typingUsersRef.current.values()))
    }

    const handleUserStoppedTyping = (data: {
      userId: string
      room: string
    }) => {
      if (data.room !== room || data.userId === user?.id) return

      typingUsersRef.current.delete(data.userId)
      setTypingUsers(Array.from(typingUsersRef.current.values()))
    }

    socket.on('user_typing', handleUserTyping)
    socket.on('user_stopped_typing', handleUserStoppedTyping)

    return () => {
      socket.off('user_typing', handleUserTyping)
      socket.off('user_stopped_typing', handleUserStoppedTyping)
      socket.emit('leave_typing_room', { room })
    }
  }, [socket, isConnected, chatId, roomId, user?.id])

  // Send typing event
  const sendTypingEvent = useCallback(() => {
    if (!socket || !isConnected || !user || !chatId && !roomId) return

    const now = Date.now()
    if (now - lastTypingEventRef.current < throttleMs) return

    lastTypingEventRef.current = now
    const room = chatId ? `chat:${chatId}` : `room:${roomId}`

    socket.emit('typing', {
      room,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      avatar: user.profilePicture
    })

    setIsUserTyping(true)

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      sendStopTypingEvent()
    }, timeoutMs)
  }, [socket, isConnected, user, chatId, roomId, throttleMs, timeoutMs])

  // Send stop typing event
  const sendStopTypingEvent = useCallback(() => {
    if (!socket || !isConnected || !user || !chatId && !roomId) return

    const room = chatId ? `chat:${chatId}` : `room:${roomId}`
    
    socket.emit('stop_typing', {
      room,
      userId: user.id
    })

    setIsUserTyping(false)

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }
  }, [socket, isConnected, user, chatId, roomId])

  // Handle input change (throttled)
  const handleInputChange = useCallback((value: string) => {
    if (!value.trim()) {
      sendStopTypingEvent()
      return
    }

    sendTypingEvent()
  }, [sendTypingEvent, sendStopTypingEvent])

  // Handle input focus
  const handleInputFocus = useCallback(() => {
    setIsTyping(true)
  }, [])

  // Handle input blur
  const handleInputBlur = useCallback(() => {
    setIsTyping(false)
    sendStopTypingEvent()
  }, [sendStopTypingEvent])

  // Get typing display text
  const getTypingText = useCallback(() => {
    if (typingUsers.length === 0) return null

    if (typingUsers.length === 1) {
      return `${typingUsers[0].userName} is typing...`
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing...`
    } else {
      return `${typingUsers.length} people are typing...`
    }
  }, [typingUsers])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  return {
    typingUsers,
    isTyping,
    isUserTyping,
    typingText: getTypingText(),
    handleInputChange,
    handleInputFocus,
    handleInputBlur,
    sendTypingEvent,
    sendStopTypingEvent
  }
}

// Hook for online status
export function useOnlineStatus(userIds: string[]) {
  const { socket, isConnected } = useEnhancedSocket()
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!socket || !isConnected) return

    // Request online status for users
    socket.emit('get_online_status', { userIds })

    const handleOnlineStatus = (data: { userIds: string[] }) => {
      setOnlineUsers(new Set(data.userIds))
    }

    const handleUserOnline = (data: { userId: string }) => {
      setOnlineUsers(prev => new Set([...prev, data.userId]))
    }

    const handleUserOffline = (data: { userId: string }) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev)
        newSet.delete(data.userId)
        return newSet
      })
    }

    socket.on('online_status', handleOnlineStatus)
    socket.on('user_online', handleUserOnline)
    socket.on('user_offline', handleUserOffline)

    return () => {
      socket.off('online_status', handleOnlineStatus)
      socket.off('user_online', handleUserOnline)
      socket.off('user_offline', handleUserOffline)
    }
  }, [socket, isConnected, userIds.join(',')])

  return {
    onlineUsers,
    isUserOnline: (userId: string) => onlineUsers.has(userId),
    onlineCount: onlineUsers.size
  }
}
