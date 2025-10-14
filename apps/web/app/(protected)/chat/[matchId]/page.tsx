'use client';

import MessageInput from '@/components/Chat/MessageInput';
import { MessageReactions } from '@/components/Chat/MessageReactions';
import PremiumLayout from '@/components/Layout/PremiumLayout';
import { MemoryWeave3D } from '@/components/MemoryWeave/MemoryWeave3D';
import { BlockMuteMenu } from '@/components/moderation/BlockMuteMenu';
import { ReportDialog } from '@/components/moderation/ReportDialog';
import { useAuth } from '@/components/providers/AuthProvider';
import { useSocket } from '@/hooks/useSocket';
import { api, chatAPI } from '@/services/api';
import { logger, type LogMetadata } from '@/services/logger';
import {
  ArrowLeftIcon,
  CheckIcon,
  CpuChipIcon,
  EllipsisVerticalIcon,
  HeartIcon,
  InformationCircleIcon,
  PhoneIcon,
  SparklesIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
  type:
  | 'text'
  | 'image'
  | 'emoji'
  | 'gift'
  | 'location'
  | 'gif'
  | 'sticker'
  | 'file'
  | 'voice'
  | 'video'
  | 'audio';
  metadata?: {
    duration?: number;
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    [key: string]: unknown;
  };
  reactions?:
  | {
    emoji: string;
    count: number;
    users: string[];
    hasReacted: boolean;
  }[]
  | undefined;
}

interface Match {
  id: string;
  ownerId: string;
  petName: string;
  petPhoto: string;
  ownerName: string;
  lastSeen: string;
  isOnline: boolean;
  isTyping: boolean;
}

export default function ChatPage(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const matchId = params['matchId'] as string;
  const { user } = useAuth();
  const socket = useSocket();

  const [match, setMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [_isTyping, _setIsTyping] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showMatchInfo, setShowMatchInfo] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [uploadingImage] = useState(false);
  const [showMemoryWeave, setShowMemoryWeave] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showModerationMenu, setShowModerationMenu] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  // const _typingTimeoutRef = useRef<NodeJS.Timeout>();

  const emojis = ['😀', '❤️', '🐕', '🐱', '🎾', '🦴', '🐾', '💕', '😍', '🥰', '😊', '🎉'];

  // Using useCallback for loadChat to avoid issues with dependencies
  const loadChat = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Load match info
      const matchData = await api.matches.getMatch(matchId);
      setMatch(matchData as unknown as Match);

      // Load messages
      const messagesData = await chatAPI.getMessages(matchId);
      setMessages(messagesData as unknown as Message[]);

      // Mark as read
      await chatAPI.markAsRead(matchId);

      // Get AI suggestions for conversation starters
      if ((messagesData as unknown as Message[]).length === 0) {
        try {
          const suggestions = await api.ai.getChatSuggestions(matchId);
          if (Array.isArray(suggestions)) {
            setAiSuggestions(suggestions);
          }
        } catch (_error) {
          // Default suggestions
          setAiSuggestions([
            'Hi! Your pet looks adorable! 😊',
            'Would love to arrange a playdate! 🐾',
            "What's your pet's favorite activity?",
          ]);
        }
      }

      logger.info('Chat loaded', { matchId });
    } catch (_error) {
      logger.error('Failed to load chat', _error as LogMetadata);
    } finally {
      setIsLoading(false);
    }
  }, [matchId, setIsLoading, setMatch, setMessages, setAiSuggestions, api.matches, api.ai, chatAPI]);

  const joinChatRoom = useCallback((): void => {
    if (socket && socket instanceof Socket) {
      socket.emit('join_chat', { matchId, userId: user?.id });
    }
  }, [socket, matchId, user?.id]);

  const leaveChatRoom = useCallback((): void => {
    if (socket && socket instanceof Socket) {
      socket.emit('leave_chat', { matchId, userId: user?.id });
    }
  }, [socket, matchId, user?.id]);

  useEffect(() => {
    loadChat();
    joinChatRoom();

    return () => {
      leaveChatRoom();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  useEffect(() => {
    if (socket && socket instanceof Socket) {
      socket.on('new_message', handleNewMessage);
      socket.on('typing', handleTypingIndicator);
      socket.on('read_receipt', handleReadReceipt);
      socket.on('user_status', ({ isOnline }: { isOnline: boolean }) => {
        setMatch((prev) => (prev ? { ...prev, isOnline } : prev));
      });
    }

    return () => {
      if (socket && socket instanceof Socket) {
        socket.off('new_message');
        socket.off('typing');
        socket.off('read_receipt');
        socket.off('user_status');
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // TODO: Integrate AI suggestions into the UI
  // Currently using default suggestions
  useEffect(() => {
    setAiSuggestions([
      'Hi! Your pet looks adorable! 😊',
      'Would love to arrange a playdate! 🐾',
      "What's your pet's favorite activity?",
    ]);
  }, []);

  const handleNewMessage = (message: Message): void => {
    setMessages((prev) => [...prev, message]);

    // Show notification if message is from other user
    if (message.senderId !== user?.id) {
      playNotificationSound();
      showNotification(message);

      // Enhanced haptic feedback for new messages
      if ('vibrate' in navigator) {
        navigator.vibrate([20, 10, 20]);
      }
    }
  };

  const handleTypingIndicator = ({
    userId,
    isTyping: typing,
  }: {
    userId: string;
    isTyping: boolean;
  }): void => {
    if (userId !== user?.id && match) {
      setMatch({ ...match, isTyping: typing });
    }
  };

  const handleReadReceipt = ({ messageIds }: { messageIds: string[] }): void => {
    setMessages((prev) =>
      prev.map((msg) => (messageIds.includes(msg.id) ? { ...msg, read: true } : msg)),
    );
  };

  const sendMessage = async (content?: string, type?: string): Promise<void> => {
    const messageContent = content || inputMessage.trim();
    const messageType = type || 'text';

    if (!messageContent || !socket) return;

    // Enhanced haptic feedback for sending messages
    if ('vibrate' in navigator) {
      navigator.vibrate([10]);
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: user?.id || '',
      content: messageContent,
      timestamp: new Date().toISOString(),
      read: false,
      type: messageType as Message['type'],
    };

    // Optimistic update with enhanced animation
    setMessages((prev) => [...prev, newMessage]);
    setInputMessage('');

    // Send via socket
    if (socket && socket instanceof Socket) {
      socket.emit('send_message', {
        matchId,
        message: newMessage,
      });
    }

    // Mark as sent
    try {
      await chatAPI.sendMessage(matchId, messageContent);
      logger.info('Message sent', { matchId });
    } catch (error) {
      logger.error('Failed to send message', error as LogMetadata);
      // Remove temp message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== newMessage.id));
    }
  };

  // Typing handler - currently unused but kept for future implementation
  // const handleTyping = (): void => {
  //   if (!isTyping) {
  //     setIsTyping(true);
  //     if (socket && socket instanceof Socket) {
  //       socket.emit('typing', { matchId, userId: user?.id, isTyping: true });
  //     }
  //   }

  //   // Clear existing timeout
  //   if (typingTimeoutRef.current) {
  //     clearTimeout(typingTimeoutRef.current);
  //   }

  //   // Set new timeout with debouncing
  //   typingTimeoutRef.current = setTimeout(() => {
  //     setIsTyping(false);
  //     if (socket && socket instanceof Socket) {
  //       socket.emit('typing', { matchId, userId: user?.id, isTyping: false });
  //     }
  //   }, 1500); // Reduced from 2000ms for more responsive typing indicators
  // };

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const playNotificationSound = (): void => {
    // Enhanced notification sound with fallback
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.3; // Reduced volume for better UX
      audio.play().catch(() => {
        // Fallback to system sound
        if ('vibrate' in navigator) {
          navigator.vibrate([100, 50, 100]);
        }
      });
    } catch (_error) {
      // Fallback to haptic feedback only
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
    }
  };

  const showNotification = (message: Message): void => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`New message from ${match?.petName}`, {
        body: message.content,
        icon: match?.petPhoto || '', // Use empty string instead of undefined
      });
    }
  };

  const handleReact = async (messageId: string, emoji: string): Promise<void> => {
    try {
      await chatAPI.reactToMessage(matchId, messageId, emoji);

      // Update local state optimistically
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === messageId) {
            const existingReaction = msg.reactions?.find((r) => r.emoji === emoji);
            if (existingReaction) {
              if (existingReaction.hasReacted) {
                // Remove reaction
                const updatedReaction = {
                  ...existingReaction,
                  count: existingReaction.count - 1,
                  hasReacted: false,
                  users: existingReaction.users.filter((u) => u !== user?.id),
                };
                return {
                  ...msg,
                  reactions: msg.reactions
                    ?.map((r) => (r.emoji === emoji ? updatedReaction : r))
                    .filter((r) => r.count > 0),
                };
              } else {
                // Add reaction
                return {
                  ...msg,
                  reactions: msg.reactions?.map((r) =>
                    r.emoji === emoji
                      ? {
                        ...r,
                        count: r.count + 1,
                        hasReacted: true,
                        users: [...r.users, user?.id || ''],
                      }
                      : r,
                  ),
                };
              }
            } else {
              // New reaction
              return {
                ...msg,
                reactions: [
                  ...(msg.reactions || []),
                  {
                    emoji,
                    count: 1,
                    hasReacted: true,
                    users: [user?.id || ''],
                  },
                ],
              };
            }
          }
          return msg;
        }),
      );
    } catch (error) {
      logger.error('Failed to react to message', error as LogMetadata);
    }
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (isLoading) {
    return (
      <PremiumLayout>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="flex items-center justify-center min-h-[60vh]"
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <HeartIcon className="h-12 w-12 text-pink-500 mx-auto" />
            </motion.div>
            <p className="mt-4 text-white/80">Loading chat...</p>
          </div>
        </motion.div>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="flex flex-col h-[calc(100vh-6rem)] bg-transparent"
      >
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.1 }}
          className="bg-white border-b px-4 py-3 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => {
                  router.push('/matches');
                }}
                className="mr-3 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>

              <div className="relative">
                <img
                  src={match?.petPhoto || '/placeholder-pet.jpg'}
                  alt={match?.petName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                {match?.isOnline ? (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                ) : null}
              </div>

              <div className="ml-3">
                <h2 className="font-semibold text-gray-900">{match?.petName}</h2>
                <p className="text-xs text-gray-500">
                  {match?.isTyping ? (
                    <span className="text-purple-600">Typing...</span>
                  ) : match?.isOnline ? (
                    <span className="text-green-600">Online</span>
                  ) : (
                    `Last seen ${match?.lastSeen}`
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <PhoneIcon className="h-5 w-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <VideoCameraIcon className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={() => {
                  setShowMemoryWeave(true);
                }}
                className="p-2 hover:bg-purple-100 rounded-full transition-colors"
                title="Memory Weave Analysis"
              >
                <CpuChipIcon className="h-5 w-5 text-purple-600" />
              </button>
              <button
                onClick={() => {
                  setShowMatchInfo(!showMatchInfo);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <InformationCircleIcon className="h-5 w-5 text-gray-600" />
              </button>

              {/* Moderation Menu */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowModerationMenu(!showModerationMenu);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="Moderation Options"
                >
                  <EllipsisVerticalIcon className="h-5 w-5 text-gray-600" />
                </button>

                {showModerationMenu && match && (
                  <div className="absolute right-0 top-full mt-2 z-50">
                    <div className="bg-white rounded-lg shadow-lg border p-2 min-w-[200px]">
                      <button
                        onClick={() => {
                          setShowReportDialog(true);
                          setShowModerationMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                      >
                        🚨 Report User
                      </button>
                      <BlockMuteMenu
                        userId={match.ownerId}
                        userName={match.ownerName}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <SparklesIcon className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <p className="text-gray-600 mb-6">Start a conversation!</p>

              {/* AI Suggestions */}
              {aiSuggestions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 mb-3">AI-suggested openers:</p>
                  {aiSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInputMessage(suggestion);
                        void sendMessage(suggestion);
                      }}
                      className="block w-full max-w-sm mx-auto text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-xl text-sm text-purple-700 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex mb-4 ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md ${message.senderId === user?.id ? 'order-2' : 'order-1'}`}
                  >
                    <div
                      className={`px-4 py-2 rounded-2xl ${message.senderId === user?.id
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'bg-white text-gray-900 shadow-md'
                        }`}
                    >
                      {message.type === 'emoji' ? (
                        <span className="text-3xl">{message.content}</span>
                      ) : message.type === 'voice' ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-black/20 rounded-full flex items-center justify-center">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 1c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2s2-.9 2-2V3c0-1.1-.9-2-2-2zm0 16c-2.76 0-5-2.24-5-5V9c0-.55-.45-1-1-1s-1 .45-1 1v3c0 3.87 3.13 7 7 7s7-3.13 7-7V9c0-.55-.45-1-1-1s-1 .45-1 1v3c0 2.76-2.24 5-5 5z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Voice Message</p>
                            <p className="text-xs opacity-75">
                              {message.metadata?.duration
                                ? `${Math.floor(message.metadata.duration / 60)}:${(message.metadata.duration % 60).toString().padStart(2, '0')}`
                                : ''}
                            </p>
                          </div>
                        </div>
                      ) : message.type === 'video' ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-black/20 rounded-full flex items-center justify-center">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Video Message</p>
                            <p className="text-xs opacity-75">
                              {message.metadata?.duration
                                ? `${Math.floor(message.metadata.duration / 60)}:${(message.metadata.duration % 60).toString().padStart(2, '0')}`
                                : ''}
                            </p>
                          </div>
                        </div>
                      ) : message.type === 'gif' || message.type === 'sticker' ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-black/20 rounded-full flex items-center justify-center">
                            <span className="text-lg">{message.type === 'gif' ? '🎭' : '😊'}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {message.type === 'gif' ? 'GIF' : 'Sticker'}
                            </p>
                          </div>
                        </div>
                      ) : message.type === 'file' ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-black/20 rounded-full flex items-center justify-center">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM16 18H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium">File</p>
                            <p className="text-xs opacity-75">
                              {message.metadata?.fileName || 'Attachment'}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="break-words">{message.content}</p>
                      )}
                    </div>

                    <div className="flex items-center mt-1 px-2">
                      <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                      {message.senderId === user?.id && message.read ? (
                        <CheckIcon className="h-3 w-3 text-blue-500 ml-1" />
                      ) : null}

                      {/* Message Reactions */}
                      <div className="ml-2">
                        <MessageReactions
                          messageId={message.id}
                          reactions={message.reactions || []}
                          onReact={handleReact}
                          currentUserId={user?.id || ''}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {match?.isTyping ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center text-gray-500 text-sm"
            >
              <div className="flex space-x-1">
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0ms' }}
                />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
              <span className="ml-2">{match.petName} is typing...</span>
            </motion.div>
          ) : null}

          <div ref={messagesEndRef} />
        </div>

        {/* Emoji Picker */}
        <AnimatePresence>
          {showEmojis ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-white border-t px-4 py-2"
            >
              <div className="flex gap-2 overflow-x-auto">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      void sendMessage(emoji, 'emoji');
                      setShowEmojis(false);
                    }}
                    className="text-2xl hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Enhanced Message Input with All Features */}
        <MessageInput
          onSendMessage={(content, type) => {
            if (type === 'image' || type === 'gif' || type === 'sticker' || type === 'file') {
              // Handle special message types
              void sendMessage(content, type);
            } else {
              // Handle text messages
              void sendMessage(content);
            }
          }}
          onTyping={(isTyping) => {
            if (socket && socket instanceof Socket) {
              socket.emit('typing', { matchId, userId: user?.id, isTyping });
            }
          }}
          disabled={uploadingImage}
          placeholder="Type a message..."
        />

        {/* Match Info Sidebar */}
        <AnimatePresence>
          {showMatchInfo ? (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg z-50 overflow-y-auto"
            >
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Match Info</h3>
                  <button
                    onClick={() => {
                      setShowMatchInfo(false);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <ArrowLeftIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <img
                  src={match?.petPhoto || '/placeholder-pet.jpg'}
                  alt={match?.petName}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />

                <h4 className="font-semibold text-lg mb-2">{match?.petName}</h4>
                <p className="text-gray-600 mb-4">Owner: {match?.ownerName}</p>

                <div className="space-y-3">
                  <button className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    View Profile
                  </button>
                  <button className="w-full py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
                    Schedule Playdate
                  </button>
                  <button className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                    Report/Block
                  </button>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Memory Weave Modal */}
        <AnimatePresence>
          {showMemoryWeave ? (
            <MemoryWeave3D
              matchId={matchId}
              userId={user?.id || ''}
              partnerId={match?.id || ''}
              messages={messages.filter(m =>
                ['text', 'image', 'system'].includes(m.type)
              ).map(m => ({ id: m.id, senderId: m.senderId, content: m.content, timestamp: m.timestamp, type: m.type as 'text' | 'image' | 'system' }))}
              onClose={() => {
                setShowMemoryWeave(false);
              }}
            />
          ) : null}
        </AnimatePresence>

        {/* Report Dialog */}
        {match && (
          <ReportDialog
            open={showReportDialog}
            onOpenChange={setShowReportDialog}
            targetId={match.ownerId}
            category="user"
          />
        )}
      </motion.div>
    </PremiumLayout>
  );
}
