import React from 'react';
import { motion } from 'framer-motion';
import { CheckIcon, MicrophoneIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckSolidIcon } from '@heroicons/react/24/solid';
import type { Message, User } from '@pawfectmatch/core';

type VoiceMessage = Message & { messageType: 'voice'; duration?: number };
type VideoMessage = Message & { messageType: 'video'; duration?: number };
type AudioMessage = Message & { messageType: 'audio'; duration?: number };
type GifMessage = Message & { messageType: 'gif' };
type StickerMessage = Message & { messageType: 'sticker' };

const isVoiceMessage = (m: Message): m is VoiceMessage => m.messageType === 'voice';
const isVideoMessage = (m: Message): m is VideoMessage => m.messageType === 'video';
const isAudioMessage = (m: Message): m is AudioMessage => m.messageType === 'audio';
const isGifMessage = (m: Message): m is GifMessage => m.messageType === 'gif';
const isStickerMessage = (m: Message): m is StickerMessage => m.messageType === 'sticker';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  currentUser: User;
  showAvatar?: boolean;
  showTimestamp?: boolean;
}

const MessageBubble = ({
  message,
  isOwnMessage,
  currentUser,
  showAvatar = true,
  showTimestamp = true,
}: MessageBubbleProps) => {
  // Sender is always a populated User object due to backend consistency fixes
  const sender = message.sender;
  const senderName = `${sender.firstName} ${sender.lastName}`;
  const senderAvatar = sender.avatar;

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const isRead = message.readBy.some((receipt) => receipt.user !== currentUser._id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex items-end space-x-2 mb-4 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}
    >
      {/* Avatar */}
      {showAvatar !== undefined && !isOwnMessage && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold overflow-hidden flex-shrink-0">
          {senderAvatar ? (
            <img
              src={senderAvatar}
              alt={senderName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{sender.firstName[0]}</span>
          )}
        </div>
      )}

      {/* Message Content */}
      <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'mr-2' : 'ml-2'}`}>
        {/* Sender name (for group chats or other user messages) */}
        {!isOwnMessage && showAvatar && (
          <p className="text-xs text-gray-500 mb-1 ml-3">{senderName}</p>
        )}

        <div
          className={`px-4 py-2 rounded-2xl ${
            isOwnMessage
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
              : 'bg-white text-gray-900 shadow-sm border border-gray-100'
          } ${isOwnMessage ? 'rounded-br-md' : 'rounded-bl-md'}`}
        >
          {/* Message content based on type */}
          {message.messageType === 'text' && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
          )}

          {message.messageType === 'image' && message.attachments && (
            <div className="space-y-2">
              {message.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="rounded-lg overflow-hidden"
                >
                  <img
                    src={attachment.url}
                    alt={attachment.fileName || 'Image'}
                    className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => {
                      // Could open image in modal
                      window.open(attachment.url, '_blank');
                    }}
                  />
                </div>
              ))}
              {message.content !== undefined && (
                <p className="text-sm leading-relaxed mt-2">{message.content}</p>
              )}
            </div>
          )}

          {message.messageType === 'location' && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">📍</span>
                <span className="text-sm font-medium">Location shared</span>
              </div>
              {message.content !== undefined && (
                <p className="text-sm opacity-90">{message.content}</p>
              )}
            </div>
          )}

          {message.messageType === 'system' && (
            <p className="text-sm italic opacity-75">{message.content}</p>
          )}

          {isVoiceMessage(message) && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <MicrophoneIcon className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {message.duration
                    ? `${Math.floor((message.duration || 0) / 60)}:${(((message.duration || 0) % 60)).toString().padStart(2, '0')}`
                    : 'Voice Message'}
                </span>
              </div>
              {message.content && <p className="text-sm opacity-90">{message.content}</p>}
            </div>
          )}

          {isVideoMessage(message) && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <VideoCameraIcon className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {message.duration
                    ? `${Math.floor((message.duration || 0) / 60)}:${(((message.duration || 0) % 60)).toString().padStart(2, '0')}`
                    : 'Video Message'}
                </span>
              </div>
              {message.content && <p className="text-sm opacity-90">{message.content}</p>}
            </div>
          )}

          {isAudioMessage(message) && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🎵</span>
                <span className="text-sm font-medium">
                  {message.duration
                    ? `${Math.floor((message.duration || 0) / 60)}:${(((message.duration || 0) % 60)).toString().padStart(2, '0')}`
                    : 'Audio Message'}
                </span>
              </div>
              {message.content && <p className="text-sm opacity-90">{message.content}</p>}
            </div>
          )}

          {isGifMessage(message) && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🎭</span>
                <span className="text-sm font-medium">GIF</span>
              </div>
              {message.content && <p className="text-sm opacity-90">{message.content}</p>}
            </div>
          )}

          {isStickerMessage(message) && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">😊</span>
                <span className="text-sm font-medium">Sticker</span>
              </div>
              {message.content && <p className="text-sm opacity-90">{message.content}</p>}
            </div>
          )}

          {/* Edited indicator */}
          {message.isEdited !== undefined && (
            <p
              className={`text-xs mt-1 opacity-60 ${isOwnMessage ? 'text-pink-100' : 'text-gray-500'}`}
            >
              edited
            </p>
          )}
        </div>

        {/* Timestamp and read status */}
        {showTimestamp !== undefined && (
          <div
            className={`flex items-center space-x-1 mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
          >
            <span className="text-xs text-gray-500">{formatTime(message.sentAt)}</span>

            {/* Read status for own messages */}
            {isOwnMessage !== undefined && (
              <div className="flex items-center">
                {isRead ? (
                  <CheckSolidIcon className="w-4 h-4 text-blue-500" />
                ) : (
                  <CheckIcon className="w-4 h-4 text-gray-400" />
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Spacer for own messages to maintain alignment */}
      {isOwnMessage !== undefined && <div className="w-8 flex-shrink-0" />}
    </motion.div>
  );
};

export default MessageBubble;
