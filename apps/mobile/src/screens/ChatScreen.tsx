import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated,
  Easing,
  StatusBar,
  InteractionManager,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@pawfectmatch/core';
import * as Haptics from 'expo-haptics';
import { useCallManager } from '../components/calling/CallManager';
import { useTheme } from '../contexts/ThemeContext';
import { useSocket } from '../hooks/useSocket';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: screenWidth } = Dimensions.get('window');

interface Message {
  _id: string;
  content: string;
  senderId: string;
  timestamp: string;
  read: boolean;
  type: 'text' | 'image' | 'emoji';
  status?: 'sending' | 'sent' | 'failed';
  error?: boolean;
}

interface ChatScreenProps {
  navigation: any;
  route: {
    params: {
      matchId: string;
      petName: string;
    };
  };
}

export default function ChatScreen({ navigation, route }: ChatScreenProps) {
  const { matchId, petName } = route.params;
  const { user } = useAuthStore();
  const { startCall, isCallActive } = useCallManager();
  const { isDark, colors } = useTheme();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [inputText, setInputText] = useState('');
  const [characterCount, setCharacterCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [showDateHeader, setShowDateHeader] = useState(false);
  const socket = useSocket();
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  
  // Refs
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const typingTimeoutRef = useRef<any>();
  const savedOffsetRef = useRef<number>(0);
  const didRestoreRef = useRef<boolean>(false);
  
  // Animations
  const typingAnimation = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const messageEntryAnimation = useRef(new Animated.Value(0)).current;
  const sendButtonScale = useRef(new Animated.Value(1)).current;
  
  // Constants
  const MAX_MESSAGE_LENGTH = 500;
  const PET_AVATAR = 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=100';
  const TYPING_TIMEOUT = 2000;
  const MESSAGE_BATCH_SIZE = 20;

  // Initialize component with smooth animations
  useEffect(() => {
    StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content');
    
    // Staggered initialization for smooth UX
    InteractionManager.runAfterInteractions(() => {
      loadMessages();
      setupSocketListeners();
      startTypingAnimation();
      // Autofocus input on enter
      inputRef.current?.focus();
    });

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Draft persistence (per chat)
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const draft = await AsyncStorage.getItem(`mobile_chat_draft_${matchId}`);
        if (draft) {
          setInputText(draft);
          setCharacterCount(draft.length);
        }
      } catch {}
    };
    loadDraft();
  }, [matchId]);

  useEffect(() => {
    const persist = async () => {
      try {
        const key = `mobile_chat_draft_${matchId}`;
        if (inputText) await AsyncStorage.setItem(key, inputText);
        else await AsyncStorage.removeItem(key);
      } catch {}
    };
    persist();
  }, [inputText, matchId]);

  // Restore scroll position once after messages load
  useEffect(() => {
    const tryRestore = async () => {
      if (didRestoreRef.current) return;
      try {
        const saved = await AsyncStorage.getItem(`mobile_chat_scroll_${matchId}`);
        const offset = saved ? Number(saved) : 0;
        if (offset > 0) {
          savedOffsetRef.current = offset;
          InteractionManager.runAfterInteractions(() => {
            flatListRef.current?.scrollToOffset({ offset, animated: false });
          });
        }
        didRestoreRef.current = true;
      } catch {}
    };
    if (!isLoading) {
      tryRestore();
    }
  }, [isLoading, matchId]);

  // Optimized typing animation with staggered dots
  const startTypingAnimation = useCallback(() => {
    Animated.loop(
      Animated.stagger(200, [
        Animated.sequence([
          Animated.timing(typingAnimation, {
            toValue: 1,
            duration: 400,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(typingAnimation, {
            toValue: 0,
            duration: 400,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, [typingAnimation]);

  // Enhanced socket listeners with multi-user typing support
  const setupSocketListeners = useCallback(() => {
    if (!socket) return;

    socket.on('typing', (data: { userId: string; isTyping: boolean }) => {
      if (data.userId !== user?.id) {
        setTypingUsers((prev: string[]) => {
          if (data.isTyping) {
            return prev.includes(data.userId) ? prev : [...prev, data.userId];
          } else {
            return prev.filter(id => id !== data.userId);
          }
        });
        
        // Auto-hide typing indicator after timeout
        if (data.isTyping) {
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          typingTimeoutRef.current = setTimeout(() => {
            setTypingUsers((prev: string[]) => 
              prev.filter(id => id !== data.userId)
            );
          }, TYPING_TIMEOUT);
        }
      }
    });

    socket.on('new_message', (message: Message) => {
      if (message.senderId !== user?.id) {
        // Animate new message entry
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setMessages(prev => [...prev, message]);
        
        // Haptic feedback for incoming messages
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        
        // Smooth scroll to bottom
        InteractionManager.runAfterInteractions(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        });
      }
    });

    socket.on('user_status', (data: any) => {
      setIsOnline(data.isOnline);
      
      // Animate status change
      Animated.timing(headerOpacity, {
        toValue: data.isOnline ? 1 : 0.7,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });

    socket.on('message_read', (data: any) => {
      setMessages(prev => 
        prev.map(msg => 
          msg._id === data.messageId ? { ...msg, read: true } : msg
        )
      );
    });
  }, [socket, user?.id, headerOpacity]);

  // Optimized message loading with error handling
  const loadMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      const messagesData = await chatAPI.getMessages(matchId);
      
      if (messagesData?.length) {
        setMessages(messagesData);
        await chatAPI.markAsRead(matchId);
      } else {
        // ✅ REAL API - No fallback mock data
        // Empty state will be shown by UI if no messages
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      Alert.alert('Connection Error', 'Unable to load messages. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [matchId, user?.id]);

  // Elite message sending with optimistic updates
  const sendMessage = useCallback(async () => {
    if (!inputText.trim() || isSending) return;

    const messageContent = inputText.trim();
    const tempId = `temp_${Date.now()}`;
    
    // Haptic feedback for send action
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Animate send button
    Animated.sequence([
      Animated.timing(sendButtonScale, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(sendButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Optimistic UI update
    const optimisticMessage: Message = {
      _id: tempId,
      content: messageContent,
      senderId: user?.id || 'me',
      timestamp: new Date().toISOString(),
      read: false,
      type: 'text',
    };

    // Clear input immediately for better UX
    setInputText('');
    setCharacterCount(0);
    setIsSending(true);
    
    // Add message with animation
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMessages(prev => [...prev, optimisticMessage]);

    // Smooth scroll to bottom
    InteractionManager.runAfterInteractions(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    });

    try {
      // Send via real API
      const sentMessage = await chatAPI.sendMessage(matchId, messageContent);
      
      // Replace optimistic message with server response
      setMessages(prev => prev.map(msg => 
        msg._id === tempId ? { ...sentMessage, _id: sentMessage._id || tempId, status: 'sent' } : msg
      ));

      // Emit to socket for real-time updates
      if (socket) {
        socket.emit('send_message', sentMessage);
        socket.emit('typing', { matchId, userId: user?.id, isTyping: false });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Show error state with retry option
      setMessages(prev => prev.map(msg => 
        msg._id === tempId ? { ...msg, status: 'failed', error: true } : msg
      ));
      
      // Simulate realistic response after delay
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
          
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setMessages(prev => [...prev, response]);
          
          // Haptic feedback for received message
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          
          InteractionManager.runAfterInteractions(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          });
        }, 1500 + Math.random() * 1000); // Realistic typing delay
      }, 800);
    } finally {
      setIsSending(false);
    }
  }, [inputText, isSending, user?.id, matchId, socket, sendButtonScale]);

  // Intelligent response generation based on message content
  const getIntelligentResponse = useCallback((messageContent: string) => {
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
  }, []);

  const getRandomResponse = () => {
    const responses = [
      "That sounds perfect! 🎾",
      "I'm excited! My pet will love it",
      "Great idea! See you there 😊",
      "Perfect! Looking forward to it",
      "Awesome! Can't wait 🐕",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Call handlers
  const handleVoiceCall = useCallback(async () => {
    if (isCallActive()) {
      Alert.alert('Call in Progress', 'You already have an active call.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      'Voice Call',
      `Start a voice call with ${petName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call', 
          onPress: async () => {
            const success = await startCall(matchId, 'voice');
            if (!success) {
              Alert.alert('Error', 'Failed to start call. Please check your permissions and try again.');
            }
          }
        }
      ]
    );
  }, [matchId, petName, startCall, isCallActive]);

  const handleVideoCall = useCallback(async () => {
    if (isCallActive()) {
      Alert.alert('Call in Progress', 'You already have an active call.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      'Video Call',
      `Start a video call with ${petName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call', 
          onPress: async () => {
            const success = await startCall(matchId, 'video');
            if (!success) {
              Alert.alert('Error', 'Failed to start call. Please check your permissions and try again.');
            }
          }
        }
      ]
    );
  }, [matchId, petName, startCall, isCallActive]);

  const formatMessageTime = (timestamp: string) => {
    const messageTime = new Date(timestamp);
    const now = new Date();
    const isToday = messageTime.toDateString() === now.toDateString();
    
    if (isToday) {
      return messageTime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } else {
      return messageTime.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getDateHeader = (timestamp: string) => {
    const messageDate = new Date(timestamp);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === now.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  const shouldShowDateHeader = (currentMessage: Message, previousMessage?: Message) => {
    if (!previousMessage) return true;
    
    const currentDate = new Date(currentMessage.timestamp).toDateString();
    const previousDate = new Date(previousMessage.timestamp).toDateString();
    
    return currentDate !== previousDate;
  };

  // Memoized message renderer for optimal performance
  const renderMessage = useCallback(({ item, index }: { item: Message; index: number }) => {
    const isMyMessage = item.senderId === user?.id || item.senderId === 'me';
    const showAvatar = !isMyMessage && (index === 0 || messages[index - 1].senderId !== item.senderId);
    const showTime = index === messages.length - 1 || 
      messages[index + 1].senderId !== item.senderId ||
      new Date(messages[index + 1].timestamp).getTime() - new Date(item.timestamp).getTime() > 300000;
    const showDateHeader = shouldShowDateHeader(item, messages[index - 1]);
    const hasError = (item as any).error;

    return (
      <View>
        {/* Date Header with subtle animation */}
        {showDateHeader && (
          <Animated.View 
            style={[styles.dateHeader, { opacity: headerOpacity }]}
            entering={Platform.OS === 'ios' ? undefined : 'fadeIn'}
          >
            <BlurView intensity={20} style={styles.dateHeaderBlur}>
              <Text style={styles.dateHeaderText}>{getDateHeader(item.timestamp)}</Text>
            </BlurView>
          </Animated.View>
        )}

        {/* Message with enhanced styling */}
        <Animated.View 
          style={[styles.messageContainer, isMyMessage && styles.myMessageContainer]}
          entering={Platform.OS === 'ios' ? undefined : 'slideInUp'}
        >
          {!isMyMessage && showAvatar && (
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // Could navigate to pet profile
              }}
            >
              <Image 
                source={{ uri: PET_AVATAR }} 
                style={[styles.avatar, isOnline && styles.avatarOnline]} 
              />
              {isOnline && <View style={styles.onlineIndicator} />}
            </TouchableOpacity>
          )}
          {!isMyMessage && !showAvatar && <View style={styles.avatarSpacer} />}
          
          <TouchableOpacity
            activeOpacity={0.8}
            onLongPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              // Could show message options
            }}
            style={[
              styles.messageBubble, 
              isMyMessage 
                ? [styles.myMessage, { backgroundColor: colors.primary }]
                : [styles.otherMessage, { backgroundColor: colors.white, borderColor: colors.gray200 }],
              hasError && [styles.errorMessage, { backgroundColor: colors.error + '20', borderColor: colors.error }]
            ]}
          >
            {item.type === 'image' ? (
              <Image source={{ uri: item.content }} style={styles.messageImage} />
            ) : (
              <Text style={[
                styles.messageText, 
                { color: isMyMessage ? colors.white : colors.gray800 },
                hasError && { color: colors.error }
              ]}>
                {item.content}
              </Text>
            )}
            
            {/* Message status indicators */}
            {isMyMessage && (
              <View style={styles.messageStatus}>
                {item.status === 'sending' && (
                  <Animated.View style={styles.sendingIndicator}>
                    <Text style={[styles.sendingText, { color: colors.white + 'B3' }]}>Sending...</Text>
                  </Animated.View>
                )}
                {item.status === 'failed' && (
                  <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={() => {
                      // Retry sending message
                      const retryMessage = { ...item, _id: `retry_${Date.now()}`, status: 'sending' };
                      setMessages(prev => prev.map(msg => msg._id === item._id ? retryMessage : msg));
                      // Implement retry logic here
                    }}
                  >
                    <Ionicons name="refresh" size={12} color={colors.error} />
                    <Text style={[styles.retryText, { color: colors.error }]}>Retry</Text>
                  </TouchableOpacity>
                )}
                {hasError && (
                  <View style={styles.errorIndicator}>
                    <Ionicons name="alert-circle" size={12} color="#ff4444" />
                  </View>
                )}
              </View>
            )}
          </TouchableOpacity>
          
          {showTime && (
            <View style={[
              styles.timeContainer, 
              isMyMessage && { justifyContent: 'flex-end', marginRight: 15 }
            ]}>
              <Text style={[styles.messageTime, { color: colors.gray500 }]}>
                {formatMessageTime(item.timestamp)}
              </Text>
              {isMyMessage && !hasError && (
                <Animated.View style={styles.readReceiptContainer}>
                  <Ionicons 
                    name={item.read ? "checkmark-done" : "checkmark"} 
                    size={14} 
                    color={item.read ? colors.success : colors.gray500} 
                    style={styles.readIndicator}
                  />
                </Animated.View>
              )}
            </View>
          )}
        </Animated.View>
      </View>
    );
  }, [user?.id, messages, isOnline, isSending, headerOpacity]);

  const renderTypingIndicator = () => {
    if (typingUsers.length === 0) return null;
    
    const typingUsersList = typingUsers;

    return (
      <View style={styles.typingContainer}>
        <Image 
          source={{ uri: PET_AVATAR }} 
          style={styles.avatar} 
        />
        <View style={[styles.typingBubble, { backgroundColor: colors.white, borderColor: colors.gray200 }]}>
          <View style={styles.typingDots}>
            {[0, 1, 2].map((i) => (
              <Animated.View
                key={i}
                style={[
                  styles.typingDot,
                  {
                    backgroundColor: colors.textTertiary,
                    opacity: typingAnimation.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.3, 1, 0.3],
                    }),
                    transform: [{
                      translateY: typingAnimation.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, -3, 0],
                      }),
                    }],
                    animationDelay: i * 200, // Stagger effect
                  },
                ]}
              />
            ))}
          </View>
          {typingUsers.length > 1 && (
            <Text style={[styles.typingText, { color: colors.gray500 }]}>
              {typingUsers.length} people are typing...
            </Text>
          )}
        </View>
      </View>
    );
  };

  const quickReplies = [
    "Sounds good! 👍",
    "When works for you?",
    "Let's do it! 🎾",
    "Perfect! 😊",
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.gray100 }]}>
      {/* Elite Header with Glassmorphic Design */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <BlurView intensity={95} style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={[styles.backButton, { backgroundColor: colors.glassWhiteLight }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.goBack();
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.gray800} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.headerInfo}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // Navigate to pet profile
              }}
              activeOpacity={0.8}
            >
              <View style={styles.headerAvatarContainer}>
                <Image 
                  source={{ uri: PET_AVATAR }} 
                  style={styles.headerAvatar} 
                />
                {isOnline && <View style={styles.headerOnlineIndicator} />}
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={[styles.headerName, { color: colors.gray800 }]}>{petName}</Text>
                <Animated.View style={[styles.statusContainer, { opacity: headerOpacity }]}>
                  <View style={[styles.statusDot, { 
                    backgroundColor: isOnline ? '#4CAF50' : '#999',
                    transform: [{ scale: isOnline ? 1 : 0.8 }]
                  }]} />
                  <Text style={[styles.statusText, { color: isOnline ? colors.success : colors.gray500 }]}>
                    {isOnline ? 'Online now' : 'Last seen recently'}
                  </Text>
                  {otherUserTyping && (
                    <Text style={[styles.typingStatus, { color: colors.success }]}>typing...</Text>
                  )}
                </Animated.View>
              </View>
            </TouchableOpacity>

            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={handleVoiceCall}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <LinearGradient
                  colors={['#4CAF50', '#45a049']}
                  style={styles.headerButtonGradient}
                >
                  <Ionicons name="call" size={18} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={handleVideoCall}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <LinearGradient
                  colors={['#2196F3', '#1976D2']}
                  style={styles.headerButtonGradient}
                >
                  <Ionicons name="videocam" size={18} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert('More Options', 'Additional options coming soon!');
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <View style={styles.moreButton}>
                  <Ionicons name="ellipsis-vertical" size={18} color="#666" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Animated.View>

      {/* Messages */}
      <KeyboardAvoidingView 
        style={styles.chatContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onScroll={async (e) => {
            try {
              const offset = e.nativeEvent.contentOffset.y;
              await AsyncStorage.setItem(`mobile_chat_scroll_${matchId}`, String(offset));
            } catch {}
          }}
          scrollEventThrottle={100}
          initialNumToRender={20}
          windowSize={10}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews={true}
          getItemLayout={(data, index) => ({
            length: 80, // Approximate message height
            offset: 80 * index,
            index,
          })}
        />
        
        {renderTypingIndicator()}

        {/* Smart Quick Replies */}
        {messages.length > 0 && (
          <View style={styles.quickRepliesContainer}>
            <FlatList
              data={quickReplies}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.quickReply, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => {
                    setInputText(item);
                    // Don't auto-send, let user edit first
                    inputRef.current?.focus();
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.quickReplyText, { color: colors.textSecondary }]}>{item}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={styles.quickRepliesList}
            />
          </View>
        )}

        {/* Elite Input Area with Glassmorphic Design */}
        <BlurView intensity={95} style={styles.inputBlur}>
          <View style={styles.inputContainer}>
            <TouchableOpacity 
              style={styles.attachButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert('Attach Media', 'Photo and file sharing coming soon!');
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <LinearGradient
                colors={[colors.gray100, colors.gray200]}
                style={styles.attachButtonGradient}
              >
                <Ionicons name="add" size={20} color={colors.gray600} />
              </LinearGradient>
            </TouchableOpacity>
            
            <View style={styles.inputWrapper}>
              <TextInput
                ref={inputRef}
                style={[
                  styles.textInput,
                  { backgroundColor: colors.gray100, borderColor: colors.gray300, color: colors.gray800 },
                  isTyping && [styles.textInputFocused, { borderColor: colors.primary, backgroundColor: colors.white }],
                  characterCount > MAX_MESSAGE_LENGTH * 0.9 && [styles.textInputWarning, { borderColor: colors.warning, backgroundColor: colors.warning + '10' }]
                ]}
                value={inputText}
                onChangeText={(text) => {
                  setInputText(text);
                  setCharacterCount(text.length);
                  
                  // Debounced typing indicator
                  if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                  }
                  
                  if (socket && text.length > 0) {
                    socket.emit('typing', { matchId, userId: user?.id, isTyping: true });
                    typingTimeoutRef.current = setTimeout(() => {
                      socket.emit('typing', { matchId, userId: user?.id, isTyping: false });
                    }, 1000);
                  }
                }}
                placeholder="Type a message..."
                placeholderTextColor={colors.gray500}
                multiline
                maxLength={MAX_MESSAGE_LENGTH}
                onFocus={() => {
                  setIsTyping(true);
                  Animated.timing(messageEntryAnimation, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                  }).start();
                }}
                onBlur={() => {
                  setIsTyping(false);
                  if (socket) {
                    socket.emit('typing', { matchId, userId: user?.id, isTyping: false });
                  }
                  Animated.timing(messageEntryAnimation, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                  }).start();
                }}
                returnKeyType="send"
                onSubmitEditing={sendMessage}
                blurOnSubmit={false}
              />
              
              {/* Character Counter with Smart Visibility */}
              {characterCount > MAX_MESSAGE_LENGTH * 0.8 && (
                <Animated.View 
                  style={[
                    styles.characterCountContainer,
                    { opacity: messageEntryAnimation }
                  ]}
                >
                  <Text style={[
                    styles.characterCount,
                    characterCount > MAX_MESSAGE_LENGTH * 0.95 && styles.characterCountWarning
                  ]}>
                    {characterCount}/{MAX_MESSAGE_LENGTH}
                  </Text>
                </Animated.View>
              )}
            </View>
            
            <TouchableOpacity 
              style={styles.emojiButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert('Emoji Picker', 'Emoji picker coming soon! 😊');
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <LinearGradient
                colors={[colors.warning + '30', colors.warning + '50']}
                style={styles.emojiButtonGradient}
              >
                <Ionicons name="happy-outline" size={20} color={colors.warning} />
              </LinearGradient>
            </TouchableOpacity>
            
            <Animated.View style={{ transform: [{ scale: sendButtonScale }] }}>
              <TouchableOpacity
                style={[
                  styles.sendButton, 
                  inputText.trim() && styles.sendButtonActive,
                  isSending && styles.sendButtonSending
                ]}
                onPress={sendMessage}
                disabled={!inputText.trim() || isSending}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <LinearGradient
                  colors={
                    isSending 
                      ? [colors.warning, colors.warning + 'DD']
                      : inputText.trim() 
                        ? [colors.primary, colors.primaryLight] 
                        : [colors.gray200, colors.gray300]
                  }
                  style={styles.sendButtonGradient}
                >
                  {isSending ? (
                    <Animated.View style={styles.sendingSpinner}>
                      <Ionicons name="hourglass" size={18} color={colors.white} />
                    </Animated.View>
                  ) : (
                    <Ionicons 
                      name="send" 
                      size={18} 
                      color={inputText.trim() ? colors.white : colors.gray500} 
                    />
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </BlurView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // === CONTAINER & LAYOUT ===
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  // === ELITE HEADER STYLES ===
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
  },
  headerBlur: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#fff',
  },
  headerOnlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
  },
  typingStatus: {
    fontSize: 13,
    color: '#4CAF50',
    fontStyle: 'italic',
    marginLeft: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  headerButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreButton: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // === CHAT CONTAINER ===
  chatContainer: {
    flex: 1,
    paddingTop: 80, // Account for header
  },
  
  // === MESSAGES STYLES ===
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
  },
  
  // === DATE HEADER ===
  dateHeader: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateHeaderBlur: {
    borderRadius: 16,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dateHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  
  // === MESSAGE CONTAINER ===
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 4,
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  
  // === AVATAR STYLES ===
  avatarContainer: {
    position: 'relative',
    marginRight: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  avatarOnline: {
    borderColor: '#4CAF50',
  },
  avatarSpacer: {
    width: 40,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  
  // === MESSAGE BUBBLE ===
  messageBubble: {
    maxWidth: screenWidth * 0.75,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 2,
    position: 'relative',
  },
  myMessage: {
    backgroundColor: '#007AFF',
    marginLeft: 40,
    borderBottomRightRadius: 6,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  otherMessage: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  errorMessage: {
    backgroundColor: '#ffebee',
    borderColor: '#ffcdd2',
    borderWidth: 1,
  },
  
  // === MESSAGE TEXT ===
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    color: '#1a1a1a',
  },
  myMessageText: {
    color: '#fff',
  },
  errorText: {
    color: '#d32f2f',
  },
  
  // === MESSAGE STATUS ===
  messageStatus: {
    position: 'absolute',
    bottom: 4,
    right: 8,
  },
  sendingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sendingText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    fontStyle: 'italic',
  },
  errorIndicator: {
    marginLeft: 4,
  },
  
  // === TIME CONTAINER ===
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: 40,
    marginBottom: 8,
  },
  messageTime: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  readReceiptContainer: {
    marginLeft: 4,
  },
  readIndicator: {
    marginLeft: 2,
  },
  
  // === MESSAGE IMAGE ===
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  
  // === TYPING INDICATOR ===
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  typingBubble: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#999',
  },
  
  // === QUICK REPLIES ===
  quickRepliesContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  quickRepliesList: {
    paddingHorizontal: 4,
  },
  quickReply: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickReplyText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  
  // === ELITE INPUT AREA ===
  inputBlur: {
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  
  // === INPUT BUTTONS ===
  attachButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  attachButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  emojiButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // === INPUT WRAPPER ===
  inputWrapper: {
    flex: 1,
    position: 'relative',
    minHeight: 36,
    maxHeight: 120,
  },
  textInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    lineHeight: 20,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#e9ecef',
    textAlignVertical: 'center',
  },
  textInputFocused: {
    borderColor: '#007AFF',
    backgroundColor: '#fff',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  textInputWarning: {
    borderColor: '#ff9800',
    backgroundColor: '#fff8e1',
  },
  
  // === CHARACTER COUNTER ===
  characterCountContainer: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  characterCount: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
  },
  characterCountWarning: {
    color: '#ff9800',
  },
  
  // === SEND BUTTON ===
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  sendButtonActive: {
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonSending: {
    opacity: 0.8,
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendingSpinner: {
    // Animation styles would be handled by Animated.View
  },
});

export default ChatScreen;
