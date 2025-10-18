"use strict";
// Removed empty import statement
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCoreMessage = toCoreMessage;
exports.toCoreMessages = toCoreMessages;
function toCoreMessage(legacy) {
    const messageId = legacy._id || legacy.id;
    const content = legacy.content || legacy.text || legacy.message || '';
    // Handle sender - could be string ID or object
    let sender;
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
    }
    else {
        const senderObj = legacy.sender;
        const senderName = senderObj.name || 'User';
        const [firstName, ...lastNameParts] = senderName.split(' ');
        sender = {
            _id: senderObj._id || senderObj.id,
            id: (senderObj.id || senderObj._id), // Alias for _id
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
    const messageTypeMap = {
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
function toCoreMessages(legacyMessages) {
    return legacyMessages.map(toCoreMessage);
}
