import { useToast } from '@/components/ui/toast';
import { fileUploadService } from '@/services/fileUpload';
import {
  FaceSmileIcon,
  MapPinIcon,
  MicrophoneIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import { logger } from '@pawfectmatch/core';
import { motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import { GifPicker } from './GifPicker';
import { StickerPicker } from './StickerPicker';
import { VoiceRecorder } from './VoiceRecorder';

interface MessageInputProps {
  onSendMessage: (
    content: string,
    type?: 'text' | 'image' | 'location' | 'gif' | 'sticker' | 'file' | 'voice',
  ) => void;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
}

const MessageInput = ({
  onSendMessage,
  onTyping,
  disabled = false,
  placeholder = 'Type a message...',
}: MessageInputProps) => {
  const toast = useToast();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showFileShare, setShowFileShare] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea !== null && textarea !== undefined) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [message]);

  // Handle typing indicators
  useEffect(() => {
    if (onTyping !== null && onTyping !== undefined) {
      onTyping(isTyping);
    }
  }, [isTyping, onTyping]);

  const handleInputChange = (value: string): void => {
    setMessage(value);

    // Handle typing indicator
    if (value.trim() && !isTyping) {
      setIsTyping(true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const handleSubmit = (e: unknown): void => {
    const event = e as React.FormEvent;
    event.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled) return;

    onSendMessage(trimmedMessage);
    setMessage('');
    setIsTyping(false);

    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    // Ctrl/Cmd + Enter to send (more intuitive for multi-line)
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit(e as unknown);
    }
    // Plain Enter without Shift to send (traditional)
    else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (file !== null && file !== undefined) {
      try {
        // Upload image to Cloudinary
        const uploadResult = await fileUploadService.uploadImage(file, { folder: 'pawfectmatch/chat/images' });

        // Send message with uploaded image URL
        onSendMessage(uploadResult.url, 'image');

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        logger.info('Image uploaded successfully', { url: uploadResult.url, fileName: file.name });
      } catch (error) {
        logger.error('Image upload failed', { error, fileName: file.name });
        toast.error('Failed to upload image', 'Please try again.');
      }
    }
  };

  const handleGifSelect = (gifUrl: string): void => {
    onSendMessage(gifUrl, 'gif');
  };

  const handleStickerSelect = (stickerUrl: string): void => {
    onSendMessage(stickerUrl, 'sticker');
  };

  const handleVoiceSelect = (audioBlob: Blob, duration: number): void => {
    // Handle voice message upload
    logger.info('Voice message recorded:', { audioBlob, duration });
    // You would typically upload the audio blob and send the URL
    // For now, we'll create a temporary URL for demo purposes
    const audioUrl = URL.createObjectURL(audioBlob);
    onSendMessage(audioUrl, 'voice');
  };

  const handleLocationShare = (): void => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          onSendMessage(`📍 Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`, 'location');
        },
        (error) => {
          logger.error('Error getting location', new Error(error.message), { code: error.code });
        },
      );
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <form
        onSubmit={handleSubmit}
        className="flex items-end space-x-3"
      >
        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowVoiceRecorder(true)}
            disabled={disabled}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Record Voice Message"
          >
            <MicrophoneIcon className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setShowFileShare(true)}
            disabled={disabled}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Share File"
          >
            <PaperClipIcon className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setShowGifPicker(true)}
            disabled={disabled}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send GIF"
            aria-label="Send GIF"
          >
            <PhotoIcon className="w-5 h-5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => setShowStickerPicker(true)}
            disabled={disabled}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send Sticker"
            aria-label="Send sticker"
          >
            <FaceSmileIcon className="w-5 h-5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={handleLocationShare}
            disabled={disabled}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Share Location"
            aria-label="Share location"
          >
            <MapPinIcon className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Message input */}
        <div className="flex-1">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
              onKeyPress={handleKeyPress}
              aria-label="Message input"
              aria-describedby="message-help-text"
            />
            <span id="message-help-text" className="sr-only">
              Press Ctrl+Enter or Cmd+Enter to send message. Press Shift+Enter for new line.
            </span>
          </div>
        </div>

        {/* Send button - 2025 Hyper-Interactive Style */}
        <motion.button
          type="submit"
          disabled={!message.trim() || disabled}
          aria-label="Send message"
          aria-keyshortcuts="Control+Enter"
          className={`
            relative p-3 rounded-full font-medium transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${message.trim() && !disabled
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-400'
            }
            overflow-hidden
          `}
          whileHover={{
            scale: message.trim() && !disabled ? 1.1 : 1,
            boxShadow:
              message.trim() && !disabled ? '0 15px 30px rgba(236, 72, 153, 0.4)' : undefined,
          }}
          whileTap={{
            scale: message.trim() && !disabled ? 0.9 : 1,
            transition: { duration: 0.1 },
          }}
          animate={{
            backgroundPosition:
              message.trim() && !disabled ? ['0% 50%', '100% 50%', '0% 50%'] : undefined,
          }}
          transition={{
            backgroundPosition: {
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            },
          }}
          style={{
            backgroundSize: message.trim() && !disabled ? '200% 200%' : undefined,
          }}
        >
          {/* Ripple effect on click */}
          <motion.div
            className="absolute inset-0 rounded-full"
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 0, opacity: 0 }}
            whileTap={{
              scale: [0, 2],
              opacity: [0.6, 0],
              transition: { duration: 0.4 },
            }}
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)',
            }}
          />

          <motion.div
            className="relative z-10"
            animate={{
              rotate: message.trim() && !disabled ? [0, -10, 10, 0] : 0,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </motion.div>
        </motion.button>
      </form>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Modals */}
      {showVoiceRecorder && (
        <VoiceRecorder
          onSend={(audioBlob, duration) => {
            handleVoiceSelect(audioBlob, duration);
            setShowVoiceRecorder(false);
          }}
          onCancel={() => setShowVoiceRecorder(false)}
        />
      )}

      <GifPicker
        isOpen={showGifPicker}
        onClose={() => setShowGifPicker(false)}
        onSelectGif={(gifUrl) => {
          handleGifSelect(gifUrl);
          setShowGifPicker(false);
        }}
      />

      <StickerPicker
        isOpen={showStickerPicker}
        onClose={() => setShowStickerPicker(false)}
        onSelectSticker={(stickerUrl) => {
          handleStickerSelect(stickerUrl);
          setShowStickerPicker(false);
        }}
      />

      {showFileShare && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">File Share</h3>
            <p className="text-gray-600 mb-4">File share component coming soon...</p>
            <button
              onClick={() => setShowFileShare(false)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageInput;
