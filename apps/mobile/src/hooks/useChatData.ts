import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { useAuthStore } from '@pawfectmatch/core';
import { logger } from '../services/logger';

export interface Message {
  _id: string;
  content: string;
  senderId: string;
  timestamp: string;
  read: boolean;
  type: 'text' | 'image' | 'emoji';
  status?: 'sending' | 'sent' | 'failed';
  error?: boolean;
}

export interface ChatData {
  messages: Message[];
  isLoading: boolean;
  isSending: boolean;
  isOnline: boolean;
  otherUserTyping: boolean;
  typingUsers: string[];
  error: string | null;
}

export interface ChatActions {
  sendMessage: (content: string) => Promise<void>;
  loadMessages: () => Promise<void>;
  retryMessage: (messageId: string) => Promise<void>;
  markAsRead: () => Promise<void>;
  clearError: () => void;
}

export interface UseChatDataReturn {
  data: ChatData;
  actions: ChatActions;
}

const MAX_MESSAGE_LENGTH = 500;
const TYPING_TIMEOUT = 2000;
const MESSAGE_BATCH_SIZE = 20;

export const useChatData = (matchId: string): UseChatDataReturn => {
  const { user } = useAuthStore();
  
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<any>(null); // Mock socket for now
  
  // Mock socket setup
  useEffect(() => {
    // TODO: Implement real socket connection
    logger.debug('Socket connection would be established here', { matchId });
  }, [matchId]);

  // Load messages from API
  const loadMessages = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // TODO: Implement real API call
      // const messagesData = await api.messages.getMessages(matchId);
      const messagesData: Message[] = [];
      
      if (messagesData.length > 0) {
        setMessages(messagesData);
        // TODO: Mark messages as read
        // await api.chat.markAsRead(matchId);
      } else {
        setMessages([]);
      }
    } catch (err) {
      const errorMessage = 'Failed to load messages. Please check your connection and try again.';
      logger.error('Failed to load messages', { error: err, matchId });
      setError(errorMessage);
      Alert.alert('Connection Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [matchId]);

  // Send message with optimistic updates
  const sendMessage = useCallback(async (content: string): Promise<void> => {
    if (!content.trim() || isSending) return;

    const messageContent = content.trim();
    const tempId = `temp_${Date.now()}`;
    
    // Optimistic UI update
    const optimisticMessage: Message = {
      _id: tempId,
      content: messageContent,
      senderId: user?._id ?? 'me',
      timestamp: new Date().toISOString(),
      read: false,
      type: 'text',
      status: 'sending',
    };

    setIsSending(true);
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      // TODO: Implement real API call
      // const sentMessage = await api.chat.sendMessage(matchId, messageContent);
      const sentMessage: Message = {
        _id: tempId,
        content: messageContent,
        senderId: user?._id ?? 'me',
        timestamp: new Date().toISOString(),
        read: false,
        type: 'text',
        status: 'sent',
      };
      
      // Replace optimistic message with server response
      setMessages(prev => prev.map((msg): Message => 
        msg._id === tempId ? { ...sentMessage, status: 'sent' } : msg
      ));

      // Emit to socket for real-time updates
      if (socketRef.current) {
        socketRef.current.emit('send_message', sentMessage);
        socketRef.current.emit('typing', { matchId, userId: user?._id, isTyping: false });
      }

      // Simulate realistic response for demo
      setTimeout(() => {
        setOtherUserTyping(true);
        setTimeout(() => {
          setOtherUserTyping(false);
          const response: Message = {
            _id: `response_${Date.now()}`,
            content: getIntelligentResponse(messageContent),
            senderId: 'other',
            timestamp: new Date().toISOString(),
            read: false,
            type: 'text',
          };
          
          setMessages(prev => [...prev, response]);
        }, 1500 + Math.random() * 1000);
      }, 800);

    } catch (err) {
      logger.error('Failed to send message', { error: err, matchId, content });
      
      // Show error state
      setMessages(prev => prev.map(msg => 
        msg._id === tempId ? { ...msg, status: 'failed', error: true } : msg
      ));
      
      setError('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  }, [isSending, user?._id, matchId]);

  // Retry failed message
  const retryMessage = useCallback(async (messageId: string): Promise<void> => {
    const message = messages.find(msg => msg._id === messageId);
    if (!message) return;

    const retryMessage: Message = {
      ...message,
      _id: `retry_${Date.now()}`,
      status: 'sending',
      error: false,
    };

    setMessages(prev => prev.map(msg => msg._id === messageId ? retryMessage : msg));
    
    try {
      // TODO: Implement retry logic
      await sendMessage(message.content);
    } catch (err) {
      logger.error('Failed to retry message', { error: err, messageId });
      setMessages(prev => prev.map(msg => 
        msg._id === retryMessage._id ? { ...msg, status: 'failed', error: true } : msg
      ));
    }
  }, [messages, sendMessage]);

  // Mark messages as read
  const markAsRead = useCallback(async (): Promise<void> => {
    try {
      // TODO: Implement mark as read API
      // await api.chat.markAsRead(matchId);
      logger.debug('Messages marked as read', { matchId });
    } catch (err) {
      logger.error('Failed to mark messages as read', { error: err, matchId });
    }
  }, [matchId]);

  // Clear error state
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  // Load messages on mount
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    data: {
      messages,
      isLoading,
      isSending,
      isOnline,
      otherUserTyping,
      typingUsers,
      error,
    },
    actions: {
      sendMessage,
      loadMessages,
      retryMessage,
      markAsRead,
      clearError,
    },
  };
};

// Intelligent response generation based on message content
const getIntelligentResponse = (messageContent: string): string => {
  const content = messageContent.toLowerCase();
  
  if (content.includes('weekend') || content.includes('saturday') || content.includes('sunday')) {
    return "Weekends work perfectly for me! My schedule is pretty flexible then 📅";
  }
  if (content.includes('park') || content.includes('dog park')) {
    return "The dog park sounds amazing! My pup absolutely loves meeting new friends there 🌳🐕";
  }
  if (content.includes('time') || content.includes('when')) {
    return "I'm pretty flexible with timing! What works best for your schedule? ⏰";
  }
  if (content.includes('weather') || content.includes('sunny') || content.includes('perfect')) {
    return "Yes! I checked the forecast too - it's going to be beautiful! Perfect day for our pets to play ☀️";
  }
  if (content.includes('excited') || content.includes('can\'t wait') || content.includes('looking forward')) {
    return "Me too! This is going to be so much fun. I think our pets are going to be best friends! 🐾💕";
  }
  if (content.includes('photo') || content.includes('picture') || content.includes('pic')) {
    return "I'd love to see more photos! Your pet is absolutely adorable 📸✨";
  }
  
  // Default contextual responses
  const responses = [
    "That sounds absolutely perfect! I'm really looking forward to it 🎾",
    "Amazing! My pet is going to be so excited to meet yours 🐕💕",
    "Perfect! I think this is going to be the start of a beautiful friendship 😊",
    "Wonderful! I can already tell our pets are going to get along great 🌟",
    "Fantastic! This is exactly what I was hoping for 🎉",
    "Love it! I have a really good feeling about this playdate ✨",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
};
