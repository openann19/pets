import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  showCharacterCount?: boolean;
}

/**
 * Optimized Message Input Component
 * Handles text input, character counting, and send functionality
 */
export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  placeholder = 'Type a message...',
  disabled = false,
  maxLength = 500,
  showCharacterCount = false
}) => {
  const { isDark } = useTheme();
  const [inputText, setInputText] = useState('');
  const [characterCount, setCharacterCount] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const sendButtonScale = useRef(new Animated.Value(1)).current;

  const handleTextChange = useCallback((text: string) => {
    setInputText(text);
    setCharacterCount(text.length);
  }, []);

  const handleSend = useCallback(() => {
    const trimmedText = inputText.trim();
    if (!trimmedText || disabled) return;

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Animate send button
    Animated.sequence([
      Animated.timing(sendButtonScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(sendButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      }),
    ]).start();

    // Send message
    onSendMessage(trimmedText);

    // Clear input
    setInputText('');
    setCharacterCount(0);
    inputRef.current?.blur();
  }, [inputText, disabled, onSendMessage, sendButtonScale]);

  const canSend = inputText.trim().length > 0 && !disabled;
  const isNearLimit = characterCount > maxLength * 0.9;

  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <View style={[styles.inputContainer, isFocused && styles.inputContainerFocused]}>
        <TextInput
          ref={inputRef}
          style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
          value={inputText}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor={isDark ? '#666' : '#999'}
          multiline
          maxLength={maxLength}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!disabled}
          returnKeyType="send"
          onSubmitEditing={canSend ? handleSend : undefined}
          blurOnSubmit={false}
        />

        {showCharacterCount ? <Text style={[
          styles.characterCount,
          isNearLimit && styles.characterCountWarning
        ]}>
          {characterCount}/{maxLength}
        </Text> : null}
      </View>

      <Animated.View style={{ transform: [{ scale: sendButtonScale as any }] }}>
        <TouchableOpacity
          style={[
            styles.sendButton,
            canSend ? styles.sendButtonActive : styles.sendButtonDisabled
          ]}
          onPress={handleSend}
          disabled={!canSend}
          accessibilityLabel="Send message"
          accessibilityRole="button"
        >
          <Ionicons
            name="send"
            size={20}
            color={canSend ? '#FFFFFF' : (isDark ? '#666' : '#CCC')}
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  containerLight: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E0E0E0',
  },
  containerDark: {
    backgroundColor: '#1E1E1E',
    borderTopColor: '#333333',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    marginRight: 12,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  inputContainerFocused: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    minHeight: 24,
    maxHeight: 72,
    paddingTop: 0,
    paddingBottom: 0,
  },
  inputLight: {
    color: '#1A1A1A',
  },
  inputDark: {
    color: '#E0E0E0',
    backgroundColor: '#2A2A2A',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
    alignSelf: 'flex-end',
  },
  characterCountWarning: {
    color: '#FF6B6B',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  sendButtonDisabled: {
    backgroundColor: '#F0F0F0',
  },
});

export default MessageInput;
