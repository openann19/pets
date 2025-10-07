/**
 * 💎 UNIFIED TYPING INDICATOR COMPONENT
 * Advanced typing indicator with smooth animations and user avatars
 * Features: Pulsing dots, user names, and glass morphism styling
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';

import { ANIMATIONS, COLORS, GRADIENTS } from '../theme/design-tokens';

interface TypingUser {
  id: string;
  name: string;
  avatar?: string;
}

interface UnifiedTypingIndicatorProps {
  isVisible: boolean;
  users?: TypingUser[];
  userNames?: string[];
  variant?: 'default' | 'glass' | 'elevated' | 'gradient';
  showAvatars?: boolean;
  maxVisibleUsers?: number;
  className?: string;
}

export function UnifiedTypingIndicator({
  isVisible,
  users = [],
  userNames = [],
  variant = 'glass',
  showAvatars = true,
  maxVisibleUsers = 3,
  className = '',
}: UnifiedTypingIndicatorProps) {
  // Combine users and userNames into a unified format
  const typingUsers = users.length > 0 
    ? users 
    : userNames.map(name => ({ id: name, name, avatar: undefined }));

  // Get variant styles
  const getVariantStyles = () => {
    const variants = {
      default: {
        background: 'bg-white/90',
        border: 'border border-gray-200',
        text: 'text-gray-700',
      },
      glass: {
        background: 'bg-white/80 backdrop-blur-xl',
        border: 'border border-white/30',
        text: 'text-gray-700',
      },
      elevated: {
        background: 'bg-white shadow-lg',
        border: 'border border-gray-200',
        text: 'text-gray-700',
      },
      gradient: {
        background: 'bg-gradient-to-r from-primary-50 to-secondary-50',
        border: 'border border-primary-200',
        text: 'text-gray-700',
      },
    };

    return variants[variant];
  };

  const variantStyles = getVariantStyles();

  // Format typing text
  const getTypingText = () => {
    if (typingUsers.length === 0) return '';
    
    const visibleUsers = typingUsers.slice(0, maxVisibleUsers);
    const remainingCount = typingUsers.length - maxVisibleUsers;
    
    if (visibleUsers.length === 1) {
      return `${visibleUsers[0].name} is typing`;
    } else if (visibleUsers.length === 2) {
      return `${visibleUsers[0].name} and ${visibleUsers[1].name} are typing`;
    } else if (remainingCount > 0) {
      return `${visibleUsers.slice(0, -1).map(u => u.name).join(', ')}, and ${remainingCount + 1} others are typing`;
    } else {
      return `${visibleUsers.slice(0, -1).map(u => u.name).join(', ')}, and ${visibleUsers[visibleUsers.length - 1].name} are typing`;
    }
  };

  if (!isVisible || typingUsers.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${variantStyles.background} ${variantStyles.border} ${className}`}
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        transition={ANIMATIONS.spring.smooth}
      >
        {/* User avatars */}
        {showAvatars && (
          <div className="flex -space-x-2">
            {typingUsers.slice(0, maxVisibleUsers).map((user, index) => (
              <motion.div
                key={user.id}
                className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-400 to-secondary-400 flex items-center justify-center text-white text-sm font-semibold border-2 border-white"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...ANIMATIONS.spring.bouncy, delay: index * 0.1 }}
                style={{ zIndex: maxVisibleUsers - index }}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Typing text */}
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${variantStyles.text}`}>
            {getTypingText()}
          </span>
          
          {/* Animated dots */}
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-2 h-2 rounded-full bg-primary-500"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: index * 0.2,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Compact typing indicator for smaller spaces
interface CompactTypingIndicatorProps {
  isVisible: boolean;
  userCount?: number;
  className?: string;
}

export function CompactTypingIndicator({
  isVisible,
  userCount = 1,
  className = '',
}: CompactTypingIndicatorProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className={`flex items-center gap-2 ${className}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={ANIMATIONS.spring.micro}
      >
        <span className="text-xs text-gray-500">
          {userCount === 1 ? 'typing' : `${userCount} typing`}
        </span>
        
        {/* Compact dots */}
        <div className="flex items-center gap-0.5">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-1 h-1 rounded-full bg-gray-400"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: index * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
