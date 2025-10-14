import { Ionicons } from '@expo/vector-icons';
import { logger, useAuthStore } from '@pawfectmatch/core';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, Easing, FlatList, Image, InteractionManager, KeyboardAvoidingView, LayoutAnimation, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, UIManager, View } from 'react-native';
import { useCallManager } from '../components/calling/CallManager';
import { useTheme } from '../contexts/ThemeContext';
import { useSocket } from '../hooks/useSocket';
import { _chatAPI as chatAPI } from '../services/api';

// Define Message interface locally to match API usage in this screen
interface Message {
  _id: string;
  // Server may return either `content` or `text`
  content?: string;
  text?: string;
  // Sender identifier from API could be `senderId`, `sender`, or `userId`
  senderId: string;
  timestamp: string; // ISO string
  type?: 'text' | 'image' | 'location' | 'system';
  attachments?: Array<{
    type: string;
    fileType: string;
    fileName: string;
    url: string;
  }>;
  // Client-side delivery fields (optional)
  read?: boolean;
  status?: 'sending' | 'sent' | 'failed';
  error?: boolean;
}

// Normalize various backend message shapes into our local Message shape
const normalizeMessage = (m: any): Message => ({
  _id: m._id ?? m.id ?? `${Date.now()}`,
  content: m.content ?? m.text ?? '',
  text: m.text,
  senderId: m.senderId ?? m.sender ?? m.userId ?? 'unknown',
  timestamp: m.timestamp ?? m.createdAt ?? new Date().toISOString(),
  type: m.type === 'text' || m.type === 'image' || m.type === 'system' ? m.type : 'text',
  read: m.read ?? false,
  status: (m.status as Message['status']) ?? 'sent',
  error: m.error ?? false,
});

// Import chat components

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: screenWidth } = Dimensions.get('window');

// Remove duplicate Message interface - it's imported from MessageBubble

type RootStackParamList = {
  Chat: { matchId: string; petName: string };
};

type ChatScreenProps = NativeStackScreenProps<RootStackParamList, 'Chat'>;

const ChatScreen: React.FC<ChatScreenProps> = ({ navigation, route }) => {
  const { matchId, petName } = route.params;
  const { user } = useAuthStore();
  const { startCall } = useCallManager();
  const { isDark, colors } = useTheme();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [characterCount, setCharacterCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isOnline] = useState(true);
  const [showSafetyMenu, setShowSafetyMenu] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const socket = useSocket();

  // Refs
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Animations
  const typingAnimation = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const messageEntryAnimation = useRef(new Animated.Value(0)).current;
  const sendButtonScale = useRef(new Animated.Value(1)).current;

  // Constants
  const MAX_MESSAGE_LENGTH = 500;
  const PET_AVATAR = 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=100';
  const TYPING_TIMEOUT = 2000;

  // Safety functions
  const handleReport = () => {
    setShowSafetyMenu(false);
    Alert.alert(
      'Report User',
      'Why are you reporting this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Spam', onPress: () => reportUser('spam') },
        { text: 'Harassment', onPress: () => reportUser('harassment') },
        { text: 'Fake Profile', onPress: () => reportUser('fake_profile') },
        { text: 'Inappropriate Content', onPress: () => reportUser('inappropriate_content') },
        { text: 'Other', onPress: () => reportUser('other') },
      ]
    );
  };

  const handleBlock = () => {
    setShowSafetyMenu(false);
    Alert.alert(
      'Block User',
      `Are you sure you want to block ${petName}? You won't be able to see each other anymore.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: () => blockUser()
        },
      ]
    );
  };

  const handleUnmatch = () => {
    setShowSafetyMenu(false);
    Alert.alert(
      'Unmatch',
      `Are you sure you want to unmatch with ${petName}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unmatch',
          style: 'destructive',
          onPress: () => unmatchUser()
        },
      ]
    );
  };

  const reportUser = async (reason: string) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // TODO: Implement actual API call to report user
      Alert.alert('Report Sent', 'Thank you for keeping PawfectMatch safe. We will review this report.');
      logger.info('User reported', { matchId, reason });
    } catch (error) {
      logger.error('Failed to report user', { error });
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    }
  };

  const blockUser = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      // TODO: Implement actual API call to block user
      Alert.alert('User Blocked', `${petName} has been blocked.`);
      navigation.goBack();
      logger.info('User blocked', { matchId });
    } catch (error) {
      logger.error('Failed to block user', { error });
      Alert.alert('Error', 'Failed to block user. Please try again.');
    }
  };

  const unmatchUser = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      // TODO: Implement actual API call to unmatch
      Alert.alert('Unmatched', `You have unmatched with ${petName}.`);
      navigation.goBack();
      logger.info('User unmatched', { matchId });
    } catch (error) {
      logger.error('Failed to unmatch user', { error });
      Alert.alert('Error', 'Failed to unmatch. Please try again.');
    }
  };

  // Initialize component with smooth animations
  useEffect(() => {
    StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content');

    // Staggered initialization for smooth UX
    InteractionManager.runAfterInteractions(() => {
      loadMessages();
      setupSocketListeners();
      startTypingAnimation();
    });

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Optimized typing animation with staggered dots
  const startTypingAnimation = useCallback(() => {
    const createDotAnimation = (delay: number) => {
      return Animated.sequence([
        // Animated.delay type is incomplete in RN types, cast to any for TS compatibility
        (Animated as any).delay(delay),
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
      ]);
    };

    Animated.loop(
      Animated.sequence([
        createDotAnimation(0),
        createDotAnimation(200),
        createDotAnimation(400),
      ])
    ).start();
  }, [typingAnimation]);

  // Enhanced socket listeners with multi-user typing support
  const setupSocketListeners = useCallback(() => {
    if (!socket) return;

    socket.on('typing', (data: { userId: string; isTyping: boolean }) => {
      if (data.userId !== user?._id) {
        setTypingUsers((prev: string[]) => {
          if (data.isTyping) {
            return prev.includes(data.userId) ? prev : [...prev, data.userId];
          } else {
            return prev.filter(id => id !== data.userId);
          }
        });

        // Animate header opacity based on typing state
        Animated.timing(headerOpacity, {
          toValue: data.isTyping ? 0.7 : 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    });

    socket.on('new_message', (message: Message) => {
      if (message.senderId !== user?._id) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setMessages(prev => [...prev, message]);

        // Auto-scroll to bottom for new messages
        InteractionManager.runAfterInteractions(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        });
      }
    });

    socket.on('message_read', (data: { messageId: string }) => {
      setMessages(prev =>
        prev.map(msg =>
          msg._id === data.messageId ? { ...msg, read: true } : msg
        )
      );
    });
  }, [socket, user?._id, headerOpacity]);

  // Optimized message loading with error handling
  const loadMessages = useCallback(async () => {
    try {
      setIsLoading(true);

      // Call API to load messages
      const response = await chatAPI.getMessages(matchId);

      if (response && Array.isArray(response)) {
        setMessages(response.map(normalizeMessage));
      } else if (
        response &&
        typeof response === 'object' &&
        'messages' in (response as any) &&
        Array.isArray((response as any).messages)
      ) {
        setMessages((response as any).messages.map(normalizeMessage));
      } else {
        setMessages([]);
      }

      // Track message view for analytics
      // analyticsAPI.trackMatchEvent(matchId, 'view_messages');
    } catch (error) {
      logger.error('Failed to load messages', { error });
      Alert.alert(
        'Connection Error',
        'Failed to load messages. Please check your connection and try again.',
        [{ text: 'Retry', onPress: loadMessages }]
      );

      // Set empty array instead of mock messages
      setMessages([]);
    } finally {
      setIsLoading(false);

      // Smooth scroll to bottom after loading
      InteractionManager.runAfterInteractions(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      });
    }
  }, [matchId]);

  // Enhanced message sending with optimistic updates
  const sendMessage = useCallback(async () => {
    const messageContent = inputText.trim();
    if (!messageContent || isSending) return;

    const tempId = `temp_${Date.now()}`;
    const optimisticMessage: Message = {
      _id: tempId,
      content: messageContent,
      senderId: user?._id || 'me',
      timestamp: new Date().toISOString(),
      read: false,
      type: 'text',
      status: 'sending',
    };

    // Haptic feedback for send action
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Animate send button
    Animated.sequence([
      Animated.timing(sendButtonScale, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.timing(sendButtonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    // Clear input and update state
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
      const normalizedSent = normalizeMessage(sentMessage);

      // Replace optimistic message with server response
      setMessages(prev => prev.map(msg =>
        msg._id === tempId ? { ...normalizedSent, _id: normalizedSent._id || tempId, status: 'sent' } : msg
      ));

      // Track message sent event
      // analyticsAPI.trackMatchEvent(
      //   matchId,
      //   'message_send',
      //   {
      //     messageLength: messageContent.length,
      //     messageType: 'text'
      //   }
      // ).catch(err => logger.error('Failed to track message event', { error: err }));

      // Emit to socket for real-time updates
      if (socket) {
        socket.emit('send_message', sentMessage);
        socket.emit('typing', { matchId, userId: user?._id, isTyping: false });
      }
    } catch (error) {
      logger.error('Failed to send message', { error });

      // Show error state with retry option
      setMessages(prev => prev.map(msg =>
        msg._id === tempId ? { ...msg, status: 'failed', error: true } : msg
      ));


    } finally {
      setIsSending(false);
    }
  }, [inputText, isSending, user?._id, matchId, socket, sendButtonScale]);

  // Intelligent response generator for demo
  // Removed unused demo helper

  // Enhanced typing handler with debouncing
  const handleTyping = useCallback((text: string) => {
    setInputText(text);
    setCharacterCount(text.length);

    // Emit typing status to socket
    if (socket && !isTyping) {
      setIsTyping(true);
      socket.emit('typing', { matchId, userId: user?._id, isTyping: true });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (socket) {
        socket.emit('typing', { matchId, userId: user?._id, isTyping: false });
      }
    }, TYPING_TIMEOUT);
  }, [socket, matchId, user?._id, isTyping]);

  // Retry failed message
  const retryMessage = useCallback((messageId: string) => {
    const failedMessage = messages.find(msg => msg._id === messageId);
    if (failedMessage) {
      setInputText(failedMessage.content ?? failedMessage.text ?? '');
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    }
  }, [messages]);

  const sendImageMessage = useCallback(async (asset: ImagePicker.ImagePickerAsset) => {
    if (isSending) return;

    const tempId = `temp_${Date.now()}`;
    const optimisticMessage: Message = {
      _id: tempId,
      content: '',
      senderId: user?._id || 'me',
      timestamp: new Date().toISOString(),
      read: false,
      type: 'image',
      status: 'sending',
    };

    // Haptic feedback for send action
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setIsSending(true);

    // Add message with animation
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMessages(prev => [...prev, optimisticMessage]);

    // Scroll to bottom
    InteractionManager.runAfterInteractions(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    });

    try {
      // TODO: Upload image to server first, then send message
      // For now, simulate with base64
      const sentMessage = await chatAPI.sendMessage(matchId, asset.uri, 'image');

      const normalizedSent = normalizeMessage(sentMessage);

      // Replace optimistic message with server response
      setMessages(prev => prev.map(msg =>
        msg._id === tempId ? { ...normalizedSent, _id: normalizedSent._id || tempId, status: 'sent' } : msg
      ));

      // Emit to socket for real-time updates
      if (socket) {
        socket.emit('send_message', sentMessage);
        socket.emit('typing', { matchId, userId: user?._id, isTyping: false });
      }
    } catch (error) {
      logger.error('Failed to send image message', { error });

      // Show error state with retry option
      setMessages(prev => prev.map(msg =>
        msg._id === tempId ? { ...msg, status: 'failed', error: true } : msg
      ));
    } finally {
      setIsSending(false);
    }
  }, [isSending, user?._id, matchId, socket]);

  // Image picker functions with enhanced compression
  const pickImage = useCallback(async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera roll permissions are required to send photos.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7, // Reduced for better performance
        base64: false, // We'll handle compression separately
        exif: false, // Reduce metadata
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset) {
          await processAndSendImage(asset);
        }
      }
    } catch (error) {
      logger.error('Image picker error:', { error });
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  }, []);

  const takePhoto = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera permissions are required to take photos.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7, // Reduced for better performance
        base64: false,
        exif: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset) {
          await processAndSendImage(asset);
        }
      }
    } catch (error) {
      logger.error('Camera error:', { error });
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  }, []);

  const processAndSendImage = useCallback(async (asset: ImagePicker.ImagePickerAsset) => {
    try {
      // Compress image if it's too large
      let processedAsset = asset;

      if (asset.fileSize && asset.fileSize > 2 * 1024 * 1024) { // If > 2MB
        // Create compressed version
        const compressedResult = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.5, // Further compression for large files
          base64: false,
        });

        if (!compressedResult.canceled && compressedResult.assets && compressedResult.assets.length > 0) {
          const asset = compressedResult.assets[0];
          if (asset) {
            processedAsset = asset;
          }
        }
      }

      if (processedAsset) {
        await sendImageMessage(processedAsset);
      }
    } catch (error) {
      logger.error('Image processing error:', { error });
      Alert.alert('Error', 'Failed to process image. Please try again.');
    }
  }, [sendImageMessage]);

  // Enhanced message renderer with animations
  const renderMessage = useCallback(({ item, index }: { item: Message; index: number }) => {
    const isMe = item.senderId === user?._id || item.senderId === 'me';
    const isLastMessage = index === messages.length - 1;
    const showAvatar = !isMe && (isLastMessage || messages[index + 1]?.senderId !== item.senderId);

    return (
      <Animated.View
        style={[
          styles.messageContainer,
          isMe ? styles.myMessageContainer : styles.otherMessageContainer,
          // Animated style typing workaround
          { opacity: messageEntryAnimation as any }
        ]}
      >
        {showAvatar ? <Image source={{ uri: PET_AVATAR }} style={styles.avatar} /> : null}

        <View style={[
          styles.messageBubble,
          isMe ? [styles.myMessage, { backgroundColor: colors.primary }] : [styles.otherMessage, { backgroundColor: colors.gray100 }],
          item.error && styles.errorMessage,
        ]}>
          {item.type === 'image' ? (
            <View style={styles.imageMessageContainer}>
              <Image
                source={{ uri: item.attachments?.[0]?.url || item.content }}
                style={styles.messageImage}
                resizeMode="cover"
              />
              {item.content && item.content.trim() && (
                <Text style={[
                  styles.messageText,
                  isMe ? styles.myMessageText : [styles.otherMessageText, { color: colors.gray800 }]
                ]}>
                  {item.content}
                </Text>
              )}
            </View>
          ) : (
            <Text style={[
              styles.messageText,
              isMe ? styles.myMessageText : [styles.otherMessageText, { color: colors.gray800 }]
            ]}>
              {item.content ?? item.text}
            </Text>
          )}

          <View style={styles.messageFooter}>
            <Text style={[
              styles.timestamp,
              isMe ? styles.myTimestamp : [styles.otherTimestamp, { color: colors.gray500 }]
            ]}>
              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>

            {isMe ? <View style={styles.messageStatus}>
              {item.status === 'sending' && (
                <Animated.View style={styles.sendingSpinner}>
                  <Text style={styles.statusText}>●</Text>
                </Animated.View>
              )}
              {item.status === 'sent' && (
                <Ionicons name="checkmark" size={12} color={colors.white} />
              )}
              {item.status === 'failed' && (
                <TouchableOpacity onPress={() => retryMessage(item._id)} style={styles.retryButton}>
                  <Ionicons name="refresh" size={12} color={colors.error} />
                </TouchableOpacity>
              )}
              {item.read ? <Ionicons name="checkmark-done" size={12} color={colors.white} /> : null}
            </View> : null}
          </View>

          {item.error ? <TouchableOpacity onPress={() => retryMessage(item._id)} style={styles.retryButton}>
            <Text style={[styles.retryText, { color: colors.error }]}>Tap to retry</Text>
          </TouchableOpacity> : null}
        </View>
      </Animated.View>
    );
  }, [messages, user?._id, colors, messageEntryAnimation, retryMessage]);

  // Typing indicator component
  const TypingIndicator = (): React.ReactElement | null => {
    if (typingUsers.length === 0) return null;

    return (
      <Animated.View style={[
        styles.typingContainer,
        { alignItems: 'center', marginVertical: 8 }
      ]}>
        <View style={[styles.typingBubble, { backgroundColor: colors.gray100 }]}>
          <View style={styles.typingDots}>
            {[0, 1, 2].map((index) => (
              <Animated.View
                key={index}
                style={[
                  styles.typingDot,
                  { backgroundColor: colors.gray400 },
                  {
                    opacity: (typingAnimation as any).interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 1],
                    }),
                    transform: [
                      {
                        scale: (typingAnimation as any).interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1.2],
                        }) as any,
                      }
                    ]
                  }
                ]}
              />
            ))}
          </View>
          <Text style={[styles.typingText, { color: colors.gray500 }]}>
            {petName} is typing...
          </Text>
        </View>
      </Animated.View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.gray50 }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.gray500 }]}>Loading messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.gray50 }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <Animated.View style={[
          styles.header,
          // Animated typings workaround
          { opacity: headerOpacity as any, backgroundColor: colors.white }
        ]}>
          <BlurView intensity={80} style={styles.headerBlur}>
            <View style={styles.headerContent}>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.goBack();
                }}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color={colors.gray800} />
              </TouchableOpacity>

              <View style={styles.headerInfo}>
                <Image source={{ uri: PET_AVATAR }} style={styles.headerAvatar} />
                <View>
                  <Text style={[styles.headerTitle, { color: colors.gray800 }]}>{petName}</Text>
                  <Text style={[styles.headerSubtitle, { color: colors.gray500 }]}>
                    {isOnline ? 'Online' : 'Last seen recently'}
                  </Text>
                </View>
              </View>

              <View style={styles.headerActions}>
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    startCall(matchId, 'video');
                  }}
                  style={styles.callButton}
                >
                  <Ionicons name="videocam" size={24} color={colors.primary} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowSafetyMenu(true);
                  }}
                  style={styles.safetyButton}
                >
                  <Ionicons name="ellipsis-vertical" size={24} color={colors.gray600} />
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </Animated.View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            InteractionManager.runAfterInteractions(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            });
          }}
          ListFooterComponent={<TypingIndicator />}
        />

        {/* Input Area */}
        <View style={[styles.inputContainer, { backgroundColor: colors.white }]}>
          {/* Safety Menu Modal */}
          {showSafetyMenu && (
            <View style={styles.safetyMenuOverlay}>
              <TouchableOpacity
                style={styles.safetyMenuBackdrop}
                onPress={() => setShowSafetyMenu(false)}
              />
              <View style={[styles.safetyMenu, { backgroundColor: colors.white }]}>
                <View style={styles.safetyMenuHeader}>
                  <Text style={[styles.safetyMenuTitle, { color: colors.gray800 }]}>
                    Safety Options
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.safetyMenuItem}
                  onPress={handleReport}
                >
                  <Ionicons name="flag" size={20} color="#f59e0b" />
                  <Text style={[styles.safetyMenuText, { color: colors.gray700 }]}>
                    Report User
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.safetyMenuItem}
                  onPress={handleBlock}
                >
                  <Ionicons name="ban" size={20} color="#ef4444" />
                  <Text style={[styles.safetyMenuText, { color: colors.gray700 }]}>
                    Block User
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.safetyMenuItem}
                  onPress={handleUnmatch}
                >
                  <Ionicons name="heart-dislike" size={20} color="#ef4444" />
                  <Text style={[styles.safetyMenuText, { color: colors.gray700 }]}>
                    Unmatch
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.safetyMenuItem, styles.safetyMenuCancel]}
                  onPress={() => setShowSafetyMenu(false)}
                >
                  <Text style={[styles.safetyMenuText, { color: colors.primary }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <LinearGradient
            colors={[colors.gray50, colors.white]}
            style={styles.inputGradient}
          >
            <View style={styles.inputContent}>
              <View style={[styles.textInputContainer, { backgroundColor: colors.gray100 }]}>
                <TextInput
                  ref={inputRef}
                  style={[styles.textInput, { color: colors.gray800 }]}
                  value={inputText}
                  onChangeText={handleTyping}
                  placeholder={`Message ${petName}...`}
                  placeholderTextColor={colors.gray400}
                  multiline
                  maxLength={MAX_MESSAGE_LENGTH}
                  returnKeyType="send"
                  onSubmitEditing={sendMessage}
                  blurOnSubmit={false}
                />

                <View style={styles.inputActions}>
                  <Text style={[styles.characterCount, { color: colors.gray400 }]}>
                    {characterCount}/{MAX_MESSAGE_LENGTH}
                  </Text>
                </View>
              </View>

              {/* Image Picker Buttons */}
              <View style={styles.imagePickerContainer}>
                <TouchableOpacity
                  onPress={pickImage}
                  style={styles.imagePickerButton}
                  disabled={isSending}
                >
                  <Ionicons name="images" size={20} color={isSending ? colors.gray400 : colors.primary} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={takePhoto}
                  style={styles.imagePickerButton}
                  disabled={isSending}
                >
                  <Ionicons name="camera" size={20} color={isSending ? colors.gray400 : colors.primary} />
                </TouchableOpacity>
              </View>

              <Animated.View style={{ transform: [{ scale: sendButtonScale as any }] } as any}>
                <TouchableOpacity
                  onPress={sendMessage}
                  style={[
                    styles.sendButton,
                    { backgroundColor: inputText.trim() ? colors.primary : colors.gray300 },
                    inputText.trim() ? styles.sendButtonActive : {}
                  ]}
                  disabled={!inputText.trim() || isSending}
                >
                  <Ionicons
                    name="send"
                    size={20}
                    color={inputText.trim() ? colors.white : colors.gray500}
                  />
                </TouchableOpacity>
              </Animated.View>
            </View>
          </LinearGradient>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: Platform.OS === 'ios' ? 0 : 24,
  },
  headerBlur: {
    borderBottomWidth: 1,
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
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  callButton: {
    padding: 8,
  },
  messagesList: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 100 : 124,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  messageBubble: {
    maxWidth: screenWidth * 0.75,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  myMessage: {
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    borderBottomLeftRadius: 4,
  },
  errorMessage: {
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#ffffff',
  },
  otherMessageText: {
    color: '#1f2937',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.7,
  },
  myTimestamp: {
    color: '#ffffff',
  },
  otherTimestamp: {
    color: '#6b7280',
  },
  messageStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 8,
  },
  sendingSpinner: {},
  retryButton: {
    marginLeft: 4,
  },
  retryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingBubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDots: {
    flexDirection: 'row',
    marginRight: 8,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 1,
  },
  typingText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  inputGradient: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInputContainer: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    minHeight: 40,
    maxHeight: 100,
  },
  textInput: {
    fontSize: 16,
    lineHeight: 20,
    maxHeight: 80,
  },
  inputActions: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  characterCount: {
    fontSize: 12,
  },
  imagePickerContainer: {
    flexDirection: 'row',
    gap: 8,
    marginRight: 12,
  },
  imagePickerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageMessageContainer: {
    alignItems: 'center',
    maxWidth: screenWidth * 0.6,
  },
  messageImage: {
    width: screenWidth * 0.5,
    height: screenWidth * 0.4,
    borderRadius: 12,
    marginBottom: 4,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonActive: {
    shadowColor: '#7c3aed',
    shadowOpacity: 0.3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  safetyButton: {
    padding: 8,
  },
  safetyMenuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  safetyMenuBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  safetyMenu: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 0,
    minWidth: 280,
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  safetyMenuHeader: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  safetyMenuTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  safetyMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  safetyMenuText: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
  safetyMenuCancel: {
    borderBottomWidth: 0,
    justifyContent: 'center',
    paddingVertical: 18,
  },
});

export default ChatScreen;
