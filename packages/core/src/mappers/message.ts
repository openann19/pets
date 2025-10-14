import { } from '../types';

/**
 * Legacy message shape from web API responses
 */
export interface LegacyWebMessage {
  id: string;
  _id?: string;
  senderId?: string;
  sender?: {
    id: string;
    _id?: string;
    name?: string;
    email?: string;
    avatar?: string;
    [key: string]: unknown;
  } | string;
  content: string;
  text?: string;
  message?: string;
  type?: string;
  messageType?: string;
  attachments?: Array<{
    type?: string;
    url: string;
    fileName?: string;
    fileType?: string;
  }>;
  readBy?: Array<{ user: string; readAt: string }>;
  timestamp?: string;
  sentAt?: string;
  createdAt?: string;
  editedAt?: string;
  isEdited?: boolean;
  isDeleted?: boolean;
  [key: string]: unknown;
}

/**
 * Convert legacy web message to core Message type
 */
import type { Message, User } from '../types';

export function toCoreMessage(legacy: LegacyWebMessage): Message {
  const messageId = legacy._id || legacy.id;
  const content = legacy.content || legacy.text || legacy.message || '';

  // Handle sender - could be string ID or object
  let sender: User;
  if (typeof legacy.sender === 'string' || !legacy.sender) {
    // Create minimal user object
    const senderId = typeof legacy.sender === 'string' ? legacy.sender : legacy.senderId || messageId;
    sender = {
      _id: senderId,
      id: senderId, // Alias for _id
      email: '',
      firstName: 'User',
      lastName: '',
      dateOfBirth: '',
      age: 0,
      location: {
        type: 'Point',
        coordinates: [0, 0],
      },
      preferences: {
        maxDistance: 50,
        ageRange: { min: 18, max: 100 },
        species: [],
        intents: [],
        notifications: {
          email: true,
          push: true,
          matches: true,
          messages: true,
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
        lastActive: new Date().toISOString(),
      },
      isEmailVerified: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } else {
    const senderObj = legacy.sender;
    const senderName = senderObj.name || 'User';
    const [firstName, ...lastNameParts] = senderName.split(' ');

    sender = {
      _id: senderObj._id || senderObj.id,
      id: (senderObj.id || senderObj._id) as string, // Alias for _id
      email: senderObj.email || '',
      firstName: firstName || 'User',
      lastName: lastNameParts.join(' ') || '',
      dateOfBirth: '',
      age: 0,
      ...(senderObj.avatar ? { avatar: senderObj.avatar } : {}),
      location: {
        type: 'Point',
        coordinates: [0, 0],
      },
      preferences: {
        maxDistance: 50,
        ageRange: { min: 18, max: 100 },
        species: [],
        intents: [],
        notifications: {
          email: true,
          push: true,
          matches: true,
          messages: true,
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
        lastActive: new Date().toISOString(),
      },
      isEmailVerified: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // Normalize message type
  const messageTypeMap: Record<string, Message['messageType']> = {
    'text': 'text',
    'image': 'image',
    'location': 'location',
    'system': 'system',
  };
  const rawType = legacy.messageType || legacy.type || 'text';
  const messageType = messageTypeMap[rawType.toLowerCase()] || 'text';

  // Convert attachments
  const attachments = (legacy.attachments || []).map(att => ({
    type: att.type || att.fileType || 'file',
    url: att.url,
    ...(att.fileName ? { fileName: att.fileName } : {}),
    ...(att.fileType || att.type ? { fileType: att.fileType || att.type } : {}),
  }));

  // Get timestamp
  const sentAt = legacy.sentAt || legacy.timestamp || legacy.createdAt || new Date().toISOString();

  return {
    _id: messageId,
    sender,
    content,
    messageType,
    ...(attachments.length > 0 ? { attachments } : {}),
    readBy: legacy.readBy || [],
    sentAt,
    ...(legacy.editedAt ? { editedAt: legacy.editedAt } : {}),
    isEdited: legacy.isEdited || false,
    isDeleted: legacy.isDeleted || false,
  };
}

/**
 * Convert array of legacy messages to core Message types
 */
export function toCoreMessages(legacyMessages: LegacyWebMessage[]): Message[] {
  return legacyMessages.map(toCoreMessage);
}
