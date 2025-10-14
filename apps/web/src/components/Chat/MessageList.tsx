import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {} from '../../types';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import {} from '../providers/AppErrorBoundary';

interface MessageListProps {
  messages: Message[];
  currentUser: User;
  isLoading: boolean;
  hasMoreMessages: boolean;
  typingUsers: string[];
  onLoadMore: () => void;
  onScroll?: () => void;
}

const MessageList = ({
  messages,
  currentUser,
  isLoading,
  hasMoreMessages,
  typingUsers,
  onLoadMore,
  onScroll,
}: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle scroll to load more messages
  const handleScroll = (): void => {
    const container = messagesContainerRef.current;
    if (container && container.scrollTop === 0 && hasMoreMessages && !isLoading) {
      onLoadMore();
    }
    onScroll?.();
  };

  return (
    <div
      ref={messagesContainerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto bg-gray-50 px-4 py-4"
    >
      {/* Load more indicator */}
      {hasMoreMessages !== undefined && (
        <div className="text-center py-4">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Load more messages'}
          </button>
        </div>
      )}

      {/* Messages */}
      <AnimatePresence initial={false}>
        {messages.map((message, index) => {
          const isOwnMessage =
            typeof message.sender === 'object'
              ? message.sender._id === currentUser?._id
              : message.sender === currentUser?._id;

          const showAvatar =
            index === 0 ||
            (typeof messages[index - 1]?.sender === 'object' && typeof message.sender === 'object'
              ? (messages[index - 1].sender as User)._id !== message.sender._id
              : typeof messages[index - 1]?.sender === 'string' &&
                  typeof message.sender === 'string'
                ? messages[index - 1].sender !== message.sender
                : true);

          return (
            <MessageBubble
              key={message._id || index}
              message={message}
              isOwnMessage={isOwnMessage}
              currentUser={currentUser}
              showAvatar={showAvatar}
            />
          );
        })}
      </AnimatePresence>

      {/* Typing indicator */}
      <TypingIndicator
        isVisible={typingUsers.length > 0}
        userNames={typingUsers}
      />

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default withErrorBoundary(MessageList);
