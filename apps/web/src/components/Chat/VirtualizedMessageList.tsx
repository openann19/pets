import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SPRING_CONFIG, PREMIUM_VARIANTS } from '../../constants/animations';
import {} from '../../types';
import MessageBubble from './MessageBubble';

interface VirtualizedMessageListProps {
  messages: Message[];
  currentUserId: string;
  height: number;
  className?: string;
}

/**
 * A simplified message list component that uses MessageBubble components
 * This is a temporary replacement for a proper virtualized list (react-window)
 */
const VirtualizedMessageList = ({
  messages,
  currentUserId,
  height,
  className = '',
}: VirtualizedMessageListProps) => {
  // Early return for empty state
  if (!messages.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={SPRING_CONFIG}
        className={`flex items-center justify-center h-full text-gray-500 ${className}`}
      >
        <p>No messages yet. Start the conversation!</p>
      </motion.div>
    );
  }

  // Using a simple scrollable div for now until react-window is properly integrated
  return (
    <div
      className={`${className} overflow-y-auto px-4`}
      style={{ height }}
    >
      {messages.map((message, index) => (
        <motion.div
          key={message._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING_CONFIG, delay: index * 0.05 }}
          className="mb-4"
        >
          <MessageBubble
            message={message}
            isOwnMessage={message.sender._id === currentUserId}
            currentUser={{
              _id: currentUserId,
              email: '',
              firstName: '',
              lastName: '',
              dateOfBirth: '',
              age: 0,
              location: {
                type: 'Point',
                coordinates: [0, 0],
              },
              preferences: {
                maxDistance: 0,
                ageRange: { min: 0, max: 0 },
                species: [],
                intents: [],
                notifications: {
                  email: false,
                  push: false,
                  matches: false,
                  messages: false,
                },
              },
              premium: {
                isActive: false,
                plan: 'basic',
                features: {
                  unlimitedLikes: false,
                  boostProfile: false,
                  seeWhoLiked: false,
                  advancedFilters: false,
                },
              },
              pets: [],
              analytics: {
                totalSwipes: 0,
                totalLikes: 0,
                totalMatches: 0,
                profileViews: 0,
                lastActive: '',
              },
              isEmailVerified: false,
              isActive: true,
              createdAt: '',
              updatedAt: '',
            }}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default VirtualizedMessageList;
