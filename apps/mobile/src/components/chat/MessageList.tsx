import type { Message } from '@pawfectmatch/core';
import React, { useEffect, useRef } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

interface MessageListProps {
  messages: Message[];
  userId?: string;
  typingUsers: string[];
  onMessageRead?: (messageId: string) => void;
}

/**
 * Optimized Message List Component
 * Handles message rendering, scrolling, and typing indicators
 */
export const MessageList: React.FC<MessageListProps> = ({
  messages,
  userId,
  typingUsers,
  onMessageRead
}) => {
  const flatListRef = useRef<FlatList>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.sender._id === userId;

    // Mark message as read if it's not from current user
    if (!isOwnMessage && onMessageRead) {
      const isRead = item.readBy.some(receipt => receipt.user === userId);
      if (!isRead) {
        onMessageRead(item._id);
      }
    }

    return (
      <View style={styles.messageWrapper}>
        <MessageBubble
          message={item}
          isOwnMessage={isOwnMessage}
          showStatus={isOwnMessage}
          currentUserId={userId || ''}
        />
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (typingUsers.length === 0) return null;

    return (
      <View style={styles.typingWrapper}>
        <TypingIndicator
          isVisible
          typingUsers={typingUsers}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={renderMessage}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        inverted={false}
        onContentSizeChange={() => {
          // Auto-scroll when content size changes
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }}
      />
      {renderTypingIndicator()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  messageWrapper: {
    marginBottom: 8,
  },
  typingWrapper: {
    marginTop: 8,
  },
});

export default MessageList;
