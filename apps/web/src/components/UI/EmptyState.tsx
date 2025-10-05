/**
 * EmptyState Component
 * 
 * A beautiful, consistent empty state pattern for all lists/grids in the app.
 */

import React from 'react';
import { motion } from 'framer-motion';
import PremiumButton from './PremiumButton';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
  variant?: 'default' | 'compact';
}

const defaultIcons = {
  heart: (
    <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
};

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  variant = 'default',
}: EmptyStateProps) {
  const isCompact = variant === 'compact';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`flex flex-col items-center justify-center text-center ${
        isCompact ? 'py-8' : 'py-16 px-4'
      }`}
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5, type: 'spring' }}
        className="mb-6"
      >
        {icon || defaultIcons.heart}
      </motion.div>
      
      {/* Title */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={`font-bold text-gray-800 ${isCompact ? 'text-lg' : 'text-2xl'} mb-2`}
      >
        {title}
      </motion.h3>
      
      {/* Description */}
      {description && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`text-gray-500 max-w-md ${isCompact ? 'text-sm' : 'text-base'}`}
        >
          {description}
        </motion.p>
      )}
      
      {/* Action Button */}
      {actionLabel && onAction && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <PremiumButton
            variant="primary"
            size={isCompact ? 'md' : 'lg'}
            onClick={onAction}
            glow
            magneticEffect
            icon={actionIcon}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 font-bold shadow-xl"
          >
            {actionLabel}
          </PremiumButton>
        </motion.div>
      )}
    </motion.div>
  );
}

// Preset Empty States for common scenarios
export function NoMatchesEmptyState({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={
        <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      }
      title="No matches yet"
      description="Start swiping to find your perfect pet match! Your matches will appear here."
      actionLabel={onAction ? "Start Swiping" : undefined}
      onAction={onAction}
      actionIcon={
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      }
    />
  );
}

export function NoMessagesEmptyState() {
  return (
    <EmptyState
      icon={
        <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      }
      title="No messages yet"
      description="Start the conversation! Send a message to break the ice."
      variant="compact"
    />
  );
}

export function NoPetsEmptyState({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={
        <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
        </svg>
      }
      title="No pets added"
      description="Add your first pet to start matching with other pet owners in your area."
      actionLabel={onAction ? "Add Your Pet" : undefined}
      onAction={onAction}
      actionIcon={
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      }
    />
  );
}

export function NoNotificationsEmptyState() {
  return (
    <EmptyState
      icon={
        <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      }
      title="No notifications"
      description="You're all caught up! New notifications will appear here."
      variant="compact"
    />
  );
}

