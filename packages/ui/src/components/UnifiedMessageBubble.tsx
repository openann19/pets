/**
 * 💎 UNIFIED MESSAGE BUBBLE COMPONENT
 * Advanced message bubble with animations, reactions, and premium styling
 * Features: Smooth animations, message reactions, and glass morphism effects
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useCallback } from 'react';
import { HeartIcon, FaceSmileIcon, HandThumbUpIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, HandThumbUpIcon as HandThumbUpSolidIcon } from '@heroicons/react/24/solid';

import { ANIMATIONS, COLORS, GRADIENTS, SHADOWS } from '../theme/design-tokens';

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

interface UnifiedMessageBubbleProps {
  message: MessageData;
  isOwnMessage: boolean;
  showAvatar?: boolean;
  showTimestamp?: boolean;
  enableReactions?: boolean;
  enableAnimations?: boolean;
  variant?: 'default' | 'glass' | 'elevated' | 'gradient';
  onReaction?: (messageId: string, emoji: string) => void;
  onImageClick?: (url: string) => void;
  className?: string;
}

const reactionEmojis = [
  { emoji: '❤️', icon: HeartIcon, solidIcon: HeartSolidIcon },
  { emoji: '👍', icon: HandThumbUpIcon, solidIcon: HandThumbUpSolidIcon },
  { emoji: '😊', icon: FaceSmileIcon, solidIcon: FaceSmileIcon },
];

export function UnifiedMessageBubble({
  message,
  isOwnMessage,
  showAvatar = true,
  showTimestamp = true,
  enableReactions = true,
  enableAnimations = true,
  variant = 'default',
  onReaction,
  onImageClick,
  className = '',
}: UnifiedMessageBubbleProps) {
  const [showReactions, setShowReactions] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Get variant styles
  const getVariantStyles = () => {
    const variants = {
      default: {
        own: 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white',
        other: 'bg-white text-gray-900 shadow-sm border border-gray-100',
      },
      glass: {
        own: 'bg-gradient-to-r from-primary-500/80 to-secondary-500/80 backdrop-blur-xl text-white border border-white/20',
        other: 'bg-white/80 backdrop-blur-xl text-gray-900 border border-white/30',
      },
      elevated: {
        own: 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg',
        other: 'bg-white text-gray-900 shadow-lg border border-gray-100',
      },
      gradient: {
        own: 'bg-gradient-to-r from-primary-500 to-tertiary-500 text-white',
        other: 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900 border border-gray-200',
      },
    };

    return variants[variant];
  };

  const variantStyles = getVariantStyles();
  const bubbleStyle = isOwnMessage ? variantStyles.own : variantStyles.other;

  // Handle reaction
  const handleReaction = useCallback((emoji: string) => {
    onReaction?.(message.id, emoji);
    setShowReactions(false);
  }, [message.id, onReaction]);

  // Format timestamp
  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(timestamp);
  };

  // Check if user has reacted
  const hasUserReacted = (emoji: string) => {
    return message.reactions?.some(reaction => 
      reaction.emoji === emoji && reaction.users.includes(message.sender.id)
    );
  };

  return (
    <motion.div
      className={`flex items-end gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} ${className}`}
      initial={enableAnimations ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={ANIMATIONS.spring.smooth}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Avatar */}
      {showAvatar && !isOwnMessage && (
        <motion.div
          className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-400 to-secondary-400 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
          initial={enableAnimations ? { scale: 0 } : false}
          animate={{ scale: 1 }}
          transition={{ ...ANIMATIONS.spring.bouncy, delay: 0.1 }}
        >
          {message.sender.avatar ? (
            <img
              src={message.sender.avatar}
              alt={message.sender.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            message.sender.name.charAt(0).toUpperCase()
          )}
        </motion.div>
      )}

      {/* Message Content */}
      <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'mr-2' : 'ml-2'}`}>
        {/* Sender name */}
        {!isOwnMessage && showAvatar && (
          <motion.p
            className="text-xs text-gray-500 mb-1 ml-3"
            initial={enableAnimations ? { opacity: 0, x: -10 } : false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...ANIMATIONS.spring.smooth, delay: 0.1 }}
          >
            {message.sender.name}
          </motion.p>
        )}

        {/* Message bubble */}
        <motion.div
          className={`relative px-4 py-2 rounded-2xl ${bubbleStyle} ${
            isOwnMessage ? 'rounded-br-md' : 'rounded-bl-md'
          }`}
          initial={enableAnimations ? { scale: 0.8, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
          transition={ANIMATIONS.spring.bouncy}
          whileHover={enableAnimations ? { scale: 1.02 } : {}}
        >
          {/* Message content based on type */}
          {message.messageType === 'text' && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
          )}

          {message.messageType === 'image' && message.attachments && (
            <div className="space-y-2">
              {message.attachments.map((attachment, index) => (
                <motion.div
                  key={index}
                  className="rounded-lg overflow-hidden"
                  initial={enableAnimations ? { scale: 0.9, opacity: 0 } : false}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ ...ANIMATIONS.spring.smooth, delay: index * 0.1 }}
                >
                  <img
                    src={attachment.url}
                    alt={attachment.fileName || 'Image'}
                    className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => onImageClick?.(attachment.url)}
                  />
                </motion.div>
              ))}
              {message.content && (
                <p className="text-sm leading-relaxed mt-2">{message.content}</p>
              )}
            </div>
          )}

          {message.messageType === 'location' && (
            <div className="space-y-2">
              <div className="bg-black/10 rounded-lg p-3 text-center">
                <p className="text-sm">📍 Location shared</p>
                <p className="text-xs opacity-80 mt-1">Tap to view in maps</p>
              </div>
              {message.content && (
                <p className="text-sm leading-relaxed">{message.content}</p>
              )}
            </div>
          )}

          {message.messageType === 'system' && (
            <div className="text-center">
              <p className="text-xs opacity-80 italic">{message.content}</p>
            </div>
          )}

          {/* Timestamp and status */}
          <div className={`flex items-center gap-1 mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            {showTimestamp && (
              <span className="text-xs opacity-60">
                {formatTimestamp(message.timestamp)}
              </span>
            )}
            {isOwnMessage && (
              <div className="flex items-center gap-1">
                {message.isDelivered && (
                  <motion.div
                    className="w-3 h-3 rounded-full bg-white/20 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={ANIMATIONS.spring.micro}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </motion.div>
                )}
                {message.isRead && (
                  <motion.div
                    className="w-3 h-3 rounded-full bg-white/20 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ ...ANIMATIONS.spring.micro, delay: 0.1 }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <motion.div
            className={`flex flex-wrap gap-1 mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={ANIMATIONS.spring.smooth}
          >
            {message.reactions.map((reaction, index) => (
              <motion.button
                key={index}
                className="flex items-center gap-1 px-2 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs border border-gray-200 hover:bg-white transition-colors"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ ...ANIMATIONS.spring.bouncy, delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleReaction(reaction.emoji)}
              >
                <span>{reaction.emoji}</span>
                <span className="text-gray-600">{reaction.users.length}</span>
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Reaction picker */}
        <AnimatePresence>
          {showReactions && enableReactions && (
            <motion.div
              className={`absolute ${isOwnMessage ? 'left-0' : 'right-0'} -top-12 bg-white/90 backdrop-blur-xl rounded-full px-3 py-2 shadow-lg border border-gray-200 flex items-center gap-2`}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={ANIMATIONS.spring.micro}
            >
              {reactionEmojis.map((reaction, index) => {
                const IconComponent = hasUserReacted(reaction.emoji) ? reaction.solidIcon : reaction.icon;
                return (
                  <motion.button
                    key={index}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleReaction(reaction.emoji)}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ ...ANIMATIONS.spring.bouncy, delay: index * 0.05 }}
                  >
                    <IconComponent className="w-5 h-5 text-gray-600" />
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reaction trigger */}
      {enableReactions && isHovered && (
        <motion.button
          className="opacity-0 hover:opacity-100 transition-opacity p-1"
          onClick={() => setShowReactions(!showReactions)}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaceSmileIcon className="w-4 h-4 text-gray-400" />
        </motion.button>
      )}
    </motion.div>
  );
}
