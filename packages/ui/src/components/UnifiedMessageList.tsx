/**
 * 💎 UNIFIED MESSAGE LIST COMPONENT
 * Advanced message list with smooth animations and premium interactions
 * Features: Staggered animations, auto-scroll, and glass morphism styling
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import React, { useRef, useEffect, useState, useCallback } from 'react';

import { ANIMATIONS } from '../theme/design-tokens';
import { UnifiedMessageBubble } from './UnifiedMessageBubble';
import { UnifiedTypingIndicator } from './UnifiedTypingIndicator';

interface MessageData {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  messageType?: 'text' | 'image' | 'location' | 'system';
  attachments?: Array<{
    url: string;
    fileName?: string;
    type?: string;
  }>;
  reactions?: Array<{
    emoji: string;
    users: string[];
  }>;
  isRead?: boolean;
  isDelivered?: boolean;
}

interface TypingUser {
  id: string;
  name: string;
  avatar?: string;
}

interface UnifiedMessageListProps {
  messages: MessageData[];
  currentUserId: string;
  typingUsers?: TypingUser[];
  isLoading?: boolean;
  hasMoreMessages?: boolean;
  onLoadMore?: () => void;
  onReaction?: (messageId: string, emoji: string) => void;
  onImageClick?: (url: string) => void;
  variant?: 'default' | 'glass' | 'elevated' | 'gradient';
  enableAnimations?: boolean;
  enableReactions?: boolean;
  autoScroll?: boolean;
  className?: string;
}

export function UnifiedMessageList({
  messages,
  currentUserId,
  typingUsers = [],
  isLoading = false,
  hasMoreMessages = false,
  onLoadMore,
  onReaction,
  onImageClick,
  variant = 'glass',
  enableAnimations = true,
  enableReactions = true,
  autoScroll = true,
  className = '',
}: UnifiedMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    if (autoScroll && isScrolledToBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [autoScroll, isScrolledToBottom]);

  // Check if user is scrolled to bottom
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setIsScrolledToBottom(isAtBottom);
  }, []);

  // Load more messages
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !onLoadMore) return;
    
    setIsLoadingMore(true);
    try {
      await onLoadMore();
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, onLoadMore]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Determine if avatar should be shown
  const shouldShowAvatar = (message: MessageData, index: number) => {
    if (index === 0) return true;
    
    const previousMessage = messages[index - 1];
    return previousMessage.sender.id !== message.sender.id;
  };

  // Group consecutive messages from the same sender
  const groupedMessages = messages.reduce((groups, message, index) => {
    const isOwnMessage = message.sender.id === currentUserId;
    const showAvatar = shouldShowAvatar(message, index);
    
    groups.push({
      ...message,
      isOwnMessage,
      showAvatar,
    });
    
    return groups;
  }, [] as Array<MessageData & { isOwnMessage: boolean; showAvatar: boolean }>);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Load more button */}
      {hasMoreMessages && (
        <motion.div
          className="flex justify-center p-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={ANIMATIONS.spring.smooth}
        >
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="px-4 py-2 bg-white/80 backdrop-blur-xl rounded-full text-sm font-medium text-gray-700 border border-gray-200 hover:bg-white transition-colors disabled:opacity-50"
          >
            {isLoadingMore ? 'Loading...' : 'Load more messages'}
          </button>
        </motion.div>
      )}

      {/* Messages container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-2 space-y-4"
        onScroll={handleScroll}
      >
        <AnimatePresence initial={false}>
          {groupedMessages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={enableAnimations ? { opacity: 0, y: 20 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                ...ANIMATIONS.spring.smooth,
                delay: enableAnimations ? index * 0.05 : 0,
              }}
              layout
            >
              <UnifiedMessageBubble
                message={message}
                isOwnMessage={message.isOwnMessage}
                showAvatar={message.showAvatar}
                enableReactions={enableReactions}
                enableAnimations={enableAnimations}
                variant={variant}
                onReaction={onReaction}
                onImageClick={onImageClick}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <UnifiedTypingIndicator
          isVisible={typingUsers.length > 0}
          users={typingUsers}
          variant={variant}
        />

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {!isScrolledToBottom && (
        <motion.button
          className="absolute bottom-20 right-6 w-12 h-12 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToBottom}
          aria-label="Scroll to bottom"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.button>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <motion.div
          className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex flex-col items-center gap-3">
            <motion.div
              className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            <p className="text-gray-600 text-sm">Loading messages...</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Empty state component
interface EmptyMessageListProps {
  variant?: 'default' | 'glass' | 'elevated' | 'gradient';
  className?: string;
}

export function EmptyMessageList({ variant = 'glass', className = '' }: EmptyMessageListProps) {
  const getVariantStyles = () => {
    const variants = {
      default: 'text-gray-500',
      glass: 'text-gray-600',
      elevated: 'text-gray-600',
      gradient: 'text-gray-600',
    };
    return variants[variant];
  };

  return (
    <motion.div
      className={`flex flex-col items-center justify-center h-full ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={ANIMATIONS.spring.smooth}
    >
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary-100 to-secondary-100 flex items-center justify-center">
        <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
      <p className={`text-center max-w-sm ${getVariantStyles()}`}>
        Start the conversation! Send a message to begin chatting.
      </p>
    </motion.div>
  );
}
