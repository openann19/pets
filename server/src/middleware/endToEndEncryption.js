const crypto = require('crypto');
const logger = require('../utils/logger');

/**
 * End-to-End Encryption Middleware
 * Provides encryption for sensitive data like chat messages
 */

// Encryption configuration
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const TAG_LENGTH = 16; // 128 bits

/**
 * Generate encryption key from user ID and secret
 */
function generateUserKey(userId, secret = process.env.ENCRYPTION_SECRET) {
  if (!secret) {
    throw new Error('ENCRYPTION_SECRET environment variable is required');
  }
  
  return crypto.pbkdf2Sync(userId, secret, 100000, KEY_LENGTH, 'sha256');
}

/**
 * Encrypt data for end-to-end encryption
 */
function encryptData(data, userId) {
  try {
    const key = generateUserKey(userId);
    const iv = crypto.randomBytes(IV_LENGTH);
    
    const cipher = crypto.createCipher(ENCRYPTION_ALGORITHM, key);
    cipher.setAAD(Buffer.from(userId, 'utf8'));
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
      algorithm: ENCRYPTION_ALGORITHM
    };
    
  } catch (error) {
    logger.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt data for end-to-end encryption
 */
function decryptData(encryptedData, userId) {
  try {
    const key = generateUserKey(userId);
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const tag = Buffer.from(encryptedData.tag, 'hex');
    
    const decipher = crypto.createDecipher(ENCRYPTION_ALGORITHM, key);
    decipher.setAAD(Buffer.from(userId, 'utf8'));
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
    
  } catch (error) {
    logger.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Encrypt message content
 */
function encryptMessage(message, senderId, recipientId) {
  try {
    // Create a shared key for the conversation
    const conversationKey = generateConversationKey(senderId, recipientId);
    
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipher(ENCRYPTION_ALGORITHM, conversationKey);
    
    // Use conversation ID as additional authenticated data
    const conversationId = [senderId, recipientId].sort().join('-');
    cipher.setAAD(Buffer.from(conversationId, 'utf8'));
    
    let encrypted = cipher.update(message, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
      algorithm: ENCRYPTION_ALGORITHM,
      conversationId
    };
    
  } catch (error) {
    logger.error('Message encryption failed:', error);
    throw new Error('Failed to encrypt message');
  }
}

/**
 * Decrypt message content
 */
function decryptMessage(encryptedMessage, userId, otherUserId) {
  try {
    const conversationKey = generateConversationKey(userId, otherUserId);
    const iv = Buffer.from(encryptedMessage.iv, 'hex');
    const tag = Buffer.from(encryptedMessage.tag, 'hex');
    
    const decipher = crypto.createDecipher(ENCRYPTION_ALGORITHM, conversationKey);
    
    // Use conversation ID as additional authenticated data
    const conversationId = [userId, otherUserId].sort().join('-');
    decipher.setAAD(Buffer.from(conversationId, 'utf8'));
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encryptedMessage.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
    
  } catch (error) {
    logger.error('Message decryption failed:', error);
    throw new Error('Failed to decrypt message');
  }
}

/**
 * Generate conversation key for two users
 */
function generateConversationKey(userId1, userId2) {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret) {
    throw new Error('ENCRYPTION_SECRET environment variable is required');
  }
  
  // Create a deterministic key based on both user IDs
  const sortedUsers = [userId1, userId2].sort();
  const conversationSeed = sortedUsers.join('-');
  
  return crypto.pbkdf2Sync(conversationSeed, secret, 100000, KEY_LENGTH, 'sha256');
}

/**
 * Middleware to encrypt sensitive data before saving
 */
function encryptSensitiveData(fields = ['content', 'message', 'description']) {
  return (req, res, next) => {
    try {
      // Only encrypt for premium users
      if (!req.user?.subscription?.plan || req.user.subscription.plan === 'basic') {
        return next();
      }
      
      // Encrypt specified fields in request body
      if (req.body) {
        fields.forEach(field => {
          if (req.body[field] && typeof req.body[field] === 'string') {
            const encrypted = encryptMessage(req.body[field], req.user.id, req.body.recipientId || 'system');
            req.body[field] = encrypted;
            req.body.isEncrypted = true;
          }
        });
      }
      
      next();
      
    } catch (error) {
      logger.error('Encryption middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Encryption failed'
      });
    }
  };
}

/**
 * Middleware to decrypt sensitive data before sending
 */
function decryptSensitiveData(fields = ['content', 'message', 'description']) {
  return (req, res, next) => {
    try {
      // Only decrypt for premium users
      if (!req.user?.subscription?.plan || req.user.subscription.plan === 'basic') {
        return next();
      }
      
      // Store original send method
      const originalSend = res.send;
      
      // Override send method to decrypt data
      res.send = function(data) {
        try {
          if (typeof data === 'string') {
            data = JSON.parse(data);
          }
          
          if (data && typeof data === 'object') {
            // Decrypt data in response
            if (Array.isArray(data)) {
              data = data.map(item => decryptItem(item, req.user.id));
            } else {
              data = decryptItem(data, req.user.id);
            }
          }
          
          originalSend.call(this, JSON.stringify(data));
          
        } catch (error) {
          logger.error('Decryption middleware error:', error);
          originalSend.call(this, data);
        }
      };
      
      next();
      
    } catch (error) {
      logger.error('Decryption middleware error:', error);
      next();
    }
  };
}

/**
 * Decrypt individual item
 */
function decryptItem(item, userId) {
  if (!item || typeof item !== 'object') {
    return item;
  }
  
  const fields = ['content', 'message', 'description'];
  
  fields.forEach(field => {
    if (item[field] && typeof item[field] === 'object' && item[field].encrypted) {
      try {
        // Find the other user ID for decryption
        const otherUserId = item.senderId === userId ? item.recipientId : item.senderId;
        item[field] = decryptMessage(item[field], userId, otherUserId);
        item.isEncrypted = false;
      } catch (error) {
        logger.warn('Failed to decrypt field:', field, error);
        // Keep encrypted if decryption fails
      }
    }
  });
  
  return item;
}

/**
 * Generate key pair for user (for advanced encryption)
 */
function generateKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });
  
  return { publicKey, privateKey };
}

/**
 * Encrypt with public key (asymmetric encryption)
 */
function encryptWithPublicKey(data, publicKey) {
  try {
    const encrypted = crypto.publicEncrypt(publicKey, Buffer.from(JSON.stringify(data)));
    return encrypted.toString('base64');
  } catch (error) {
    logger.error('Public key encryption failed:', error);
    throw new Error('Failed to encrypt with public key');
  }
}

/**
 * Decrypt with private key (asymmetric encryption)
 */
function decryptWithPrivateKey(encryptedData, privateKey) {
  try {
    const decrypted = crypto.privateDecrypt(privateKey, Buffer.from(encryptedData, 'base64'));
    return JSON.parse(decrypted.toString());
  } catch (error) {
    logger.error('Private key decryption failed:', error);
    throw new Error('Failed to decrypt with private key');
  }
}

/**
 * Verify data integrity
 */
function verifyIntegrity(data, signature, publicKey) {
  try {
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(JSON.stringify(data));
    return verify.verify(publicKey, signature, 'base64');
  } catch (error) {
    logger.error('Integrity verification failed:', error);
    return false;
  }
}

/**
 * Sign data for integrity verification
 */
function signData(data, privateKey) {
  try {
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(JSON.stringify(data));
    return sign.sign(privateKey, 'base64');
  } catch (error) {
    logger.error('Data signing failed:', error);
    throw new Error('Failed to sign data');
  }
}

/**
 * Generate secure random token
 */
function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash sensitive data (one-way)
 */
function hashSensitiveData(data, salt = null) {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(data, actualSalt, 100000, 64, 'sha512');
  return {
    hash: hash.toString('hex'),
    salt: actualSalt
  };
}

/**
 * Verify hashed data
 */
function verifyHashedData(data, hash, salt) {
  const verifyHash = crypto.pbkdf2Sync(data, salt, 100000, 64, 'sha512');
  return verifyHash.toString('hex') === hash;
}

module.exports = {
  encryptData,
  decryptData,
  encryptMessage,
  decryptMessage,
  encryptSensitiveData,
  decryptSensitiveData,
  generateKeyPair,
  encryptWithPublicKey,
  decryptWithPrivateKey,
  verifyIntegrity,
  signData,
  generateSecureToken,
  hashSensitiveData,
  verifyHashedData
};
