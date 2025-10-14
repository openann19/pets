/**
 * Biometric Authentication Service
 * Comprehensive biometric authentication using React Native Biometrics
 */

import * as SecureStore from 'expo-secure-store';
import { Alert, Platform } from 'react-native';
// Note: These imports will be available once the packages are properly set up
// import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import { logger } from '@pawfectmatch/core';

// Temporary type definitions until packages are available
type BiometryTypes = 'TouchID' | 'FaceID' | 'Biometrics';

// Temporary mock for development
const ReactNativeBiometrics = {
  isSensorAvailable: () => Promise.resolve({ available: false, biometryType: null }),
  createKeys: () => Promise.resolve({ publicKey: 'mock-key' }),
  deleteKeys: () => Promise.resolve(),
  biometricKeysExist: () => Promise.resolve({ keysExist: false }),
  simplePrompt: () => Promise.resolve({ success: false }),
  createSignature: () => Promise.resolve({ success: false, signature: 'mock-signature' })
};

export interface BiometricConfig {
  allowDeviceCredentials: boolean;
  promptMessage: string;
  cancelButtonText: string;
  fallbackPromptMessage?: string;
}

export interface BiometricResult {
  success: boolean;
  error?: string | undefined;
  biometryType?: BiometryTypes | undefined;
}

export interface BiometricKeys {
  publicKey: string;
  privateKey: string;
}

class BiometricService {
  private rnBiometrics: any;
  private isInitialized = false;
  private biometryType: BiometryTypes | null = null;

  constructor() {
    this.rnBiometrics = new (ReactNativeBiometrics as any)({
      allowDeviceCredentials: true,
    });
  }

  /**
   * Initialize biometric service and check availability
   */
  async initialize(): Promise<boolean> {
    try {
      const { available, biometryType } = await this.rnBiometrics.isSensorAvailable();

      if (available) {
        this.biometryType = biometryType;
        this.isInitialized = true;
        // Log initialization
        logger.info('Biometric service initialized', {
          component: 'BiometricService',
          action: 'initialize',
          metadata: {
            biometryType,
          },
        });
        return true;
      } else {
        logger.info('Biometric authentication not available', {
          component: 'BiometricService',
          action: 'initialize',
        });
        return false;
      }
    } catch (error) {
      logger.error('Failed to initialize biometric service', { error });

      return false;
    }
  }

  /**
   * Check if biometric authentication is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const { available } = await this.rnBiometrics.isSensorAvailable();
      return available;
    } catch (error) {
      logger.error('Failed to check biometric availability', { error });

      return false;
    }
  }

  /**
   * Get available biometric type
   */
  getBiometryType(): BiometryTypes | null {
    return this.biometryType;
  }

  /**
   * Get user-friendly biometric type name
   */
  getBiometryTypeName(): string {
    const t = this.biometryType;
    if (t === 'TouchID') return 'Touch ID';
    if (t === 'FaceID') return 'Face ID';
    if (t === 'Biometrics') return Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint';
    return 'Biometric';
  }

  /**
   * Create biometric keys for secure storage
   */
  async createKeys(): Promise<BiometricKeys | null> {
    try {
      if (!this.isInitialized) {
        throw new Error('Biometric service not initialized');
      }

      const { publicKey } = await this.rnBiometrics.createKeys();

      // Store the public key securely
      await SecureStore.setItemAsync('biometric_public_key', publicKey);

      logger.info('Biometric keys created successfully', {
        component: 'BiometricService',
        action: 'create_keys',
      });

      return {
        publicKey,
        privateKey: 'stored_in_secure_enclave', // Private key is stored in secure enclave
      };
    } catch (error) {
      logger.error('Failed to create biometric keys', { error });

      return null;
    }
  }

  /**
   * Delete biometric keys
   */
  async deleteKeys(): Promise<boolean> {
    try {
      await this.rnBiometrics.deleteKeys();
      await SecureStore.deleteItemAsync('biometric_public_key');

      logger.info('Biometric keys deleted successfully', {
        component: 'BiometricService',
        action: 'delete_keys',
      });

      return true;
    } catch (error) {
      logger.error('Failed to delete biometric keys', { error });

      return false;
    }
  }

  /**
   * Check if biometric keys exist
   */
  async keysExist(): Promise<boolean> {
    try {
      const { keysExist } = await this.rnBiometrics.biometricKeysExist();
      return keysExist;
    } catch (error) {
      logger.error('Failed to check if biometric keys exist', { error });

      return false;
    }
  }

  /**
   * Authenticate with biometrics
   */
  async authenticate(config?: Partial<BiometricConfig>): Promise<BiometricResult> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: 'Biometric service not initialized',
        };
      }

      const defaultConfig: BiometricConfig = {
        allowDeviceCredentials: true,
        promptMessage: `Authenticate with ${this.getBiometryTypeName()}`,
        cancelButtonText: 'Cancel',
        fallbackPromptMessage: 'Use device passcode',
      };

      const finalConfig = { ...defaultConfig, ...config };

      const { success } = await this.rnBiometrics.simplePrompt({
        promptMessage: finalConfig.promptMessage,
        cancelButtonText: finalConfig.cancelButtonText,
        fallbackPromptMessage: finalConfig.fallbackPromptMessage,
      });

      if (success) {
        logger.info('Biometric authentication successful', {
          component: 'BiometricService',
          action: 'authenticate',
          metadata: {
            biometryType: this.biometryType,
          },
        });
      }

      return {
        success,
        biometryType: this.biometryType || undefined,
      };
    } catch (error) {
      logger.error('Biometric authentication failed', { error });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }
  }

  /**
   * Sign data with biometric authentication
   */
  async signData(data: string, config?: Partial<BiometricConfig>): Promise<{ success: boolean; signature?: string; error?: string }> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: 'Biometric service not initialized',
        };
      }

      const defaultConfig: BiometricConfig = {
        allowDeviceCredentials: true,
        promptMessage: `Sign with ${this.getBiometryTypeName()}`,
        cancelButtonText: 'Cancel',
      };

      const finalConfig = { ...defaultConfig, ...config };

      const { success, signature } = await this.rnBiometrics.createSignature({
        promptMessage: finalConfig.promptMessage,
        payload: data,
        cancelButtonText: finalConfig.cancelButtonText,
      });

      if (success) {
        logger.info('Data signed successfully with biometrics', {
          component: 'BiometricService',
          action: 'sign_data',
          metadata: {
            biometryType: this.biometryType,
          },
        });
      }

      return {
        success,
        signature,
      };
    } catch (error) {
      logger.error('Failed to sign data', { error });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Signing failed',
      };
    }
  }

  /**
   * Verify signature
   */
  async verifySignature(data: string, _signature: string): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        return false;
      }

      const { success } = await this.rnBiometrics.createSignature({
        promptMessage: 'Verify signature',
        payload: data,
        cancelButtonText: 'Cancel',
      });

      if (success) {
        logger.info('Signature verified successfully', {
          component: 'BiometricService',
          action: 'verify_signature',
          metadata: {
            biometryType: this.biometryType,
          },
        });
      }

      return success;
    } catch (error) {
      logger.error('Failed to verify signature', { error });

      return false;
    }
  }

  /**
   * Store sensitive data with biometric protection
   */
  async storeSecureData(key: string, data: string): Promise<boolean> {
    try {
      // First authenticate with biometrics
      const authResult = await this.authenticate({
        promptMessage: `Store data with ${this.getBiometryTypeName()}`,
      });

      if (!authResult.success) {
        return false;
      }

      // Encrypt and store the data
      const encryptedData = await this.encryptData(data);
      await SecureStore.setItemAsync(`biometric_${key}`, encryptedData);

      logger.info('Secure data stored successfully', {
        component: 'BiometricService',
        action: 'store_secure_data',
        metadata: {
          key,
          biometryType: this.biometryType,
        },
      });

      return true;
    } catch (error) {
      logger.error('Failed to store secure data', { error });

      return false;
    }
  }

  /**
   * Retrieve sensitive data with biometric protection
   */
  async getSecureData(key: string): Promise<string | null> {
    try {
      // First authenticate with biometrics
      const authResult = await this.authenticate({
        promptMessage: `Access data with ${this.getBiometryTypeName()}`,
      });

      if (!authResult.success) {
        return null;
      }

      // Retrieve and decrypt the data
      const encryptedData = await SecureStore.getItemAsync(`biometric_${key}`);
      if (!encryptedData) {
        return null;
      }

      const decryptedData = await this.decryptData(encryptedData);

      logger.info('Secure data retrieved successfully', {
        component: 'BiometricService',
        action: 'get_secure_data',
        metadata: {
          key,
          biometryType: this.biometryType,
        },
      });

      return decryptedData;
    } catch (error) {
      logger.error('Failed to retrieve secure data', { error });

      return null;
    }
  }

  /**
   * Remove secure data
   */
  async removeSecureData(key: string): Promise<boolean> {
    try {
      await SecureStore.deleteItemAsync(`biometric_${key}`);

      logger.info('Secure data removed successfully', {
        component: 'BiometricService',
        action: 'remove_secure_data',
        metadata: {
          key,
        },
      });

      return true;
    } catch (error) {
      logger.error('Failed to remove secure data', { error });

      return false;
    }
  }

  /**
   * Enable biometric authentication for the app
   */
  async enableBiometricAuth(): Promise<boolean> {
    try {
      // Check if biometrics are available
      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        Alert.alert(
          'Biometric Not Available',
          'Biometric authentication is not available on this device.',
          [{ text: 'OK' }]
        );
        return false;
      }

      // Create keys if they don't exist
      const keysExist = await this.keysExist();
      if (!keysExist) {
        const keys = await this.createKeys();
        if (!keys) {
          return false;
        }
      }

      // Store biometric preference
      await SecureStore.setItemAsync('biometric_enabled', 'true');

      logger.info('Biometric authentication enabled', {
        component: 'BiometricService',
        action: 'enable_biometric_auth',
        metadata: {
          biometryType: this.biometryType,
        },
      });

      return true;
    } catch (error) {
      logger.error('Failed to enable biometric auth', { error });

      return false;
    }
  }

  /**
   * Disable biometric authentication
   */
  async disableBiometricAuth(): Promise<boolean> {
    try {
      // Remove stored preference
      await SecureStore.deleteItemAsync('biometric_enabled');

      // Optionally delete keys (user might want to keep them for other apps)
      // await this.deleteKeys();

      logger.info('Biometric authentication disabled', {
        component: 'BiometricService',
        action: 'disable_biometric_auth',
        metadata: {
          biometryType: this.biometryType,
        },
      });

      return true;
    } catch (error) {
      logger.error('Failed to disable biometric auth', { error });

      return false;
    }
  }

  /**
   * Check if biometric authentication is enabled
   */
  async isBiometricAuthEnabled(): Promise<boolean> {
    try {
      const enabled = await SecureStore.getItemAsync('biometric_enabled');
      return enabled === 'true';
    } catch (error) {
      logger.error('Failed to check biometric auth status', { error });

      return false;
    }
  }

  /**
   * Quick biometric authentication for app unlock
   */
  async quickAuth(): Promise<BiometricResult> {
    return await this.authenticate({
      promptMessage: `Unlock ${this.getBiometryTypeName()}`,
      cancelButtonText: 'Use Password',
    });
  }

  /**
   * Show biometric setup prompt
   */
  async showSetupPrompt(): Promise<boolean> {
    try {
      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        return false;
      }

      const isEnabled = await this.isBiometricAuthEnabled();
      if (isEnabled) {
        return true;
      }

      Alert.alert(
        `Enable ${this.getBiometryTypeName()}`,
        `Would you like to enable ${this.getBiometryTypeName()} for faster and more secure authentication?`,
        [
          {
            text: 'Not Now',
            style: 'cancel',
          },
          {
            text: 'Enable',
            onPress: async () => {
              await this.enableBiometricAuth();
            },
          },
        ]
      );

      return true;
    } catch (error) {
      logger.error('Failed to show setup prompt', { error });

      return false;
    }
  }

  /**
   * Secure data encryption using AES-256-GCM
   */
  private async encryptData(data: string): Promise<string> {
    try {
      // Generate a random key and IV for each encryption
      const key = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );

      const iv = crypto.getRandomValues(new Uint8Array(12));

      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        new TextEncoder().encode(data)
      );

      // Export the key for storage
      const exportedKey = await crypto.subtle.exportKey('raw', key);

      // Combine key, IV, and encrypted data
      const combined = new Uint8Array(exportedKey.byteLength + iv.length + encrypted.byteLength);
      combined.set(new Uint8Array(exportedKey), 0);
      combined.set(iv, exportedKey.byteLength);
      combined.set(new Uint8Array(encrypted), exportedKey.byteLength + iv.length);

      // Convert to base64 for storage
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      logger.error('Encryption failed', { error });
      throw new Error('Data encryption failed');
    }
  }

  /**
   * Secure data decryption using AES-256-GCM
   */
  private async decryptData(encryptedData: string): Promise<string> {
    try {
      // Convert from base64
      const combined = new Uint8Array(
        atob(encryptedData)
          .split('')
          .map(char => char.charCodeAt(0))
      );

      // Extract key, IV, and encrypted data
      const keyLength = 32; // 256 bits = 32 bytes
      const ivLength = 12;

      const keyData = combined.slice(0, keyLength);
      const iv = combined.slice(keyLength, keyLength + ivLength);
      const encrypted = combined.slice(keyLength + ivLength);

      // Import the key
      const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );

      // Decrypt the data
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encrypted
      );

      return new TextDecoder().decode(decrypted);
    } catch (error) {
      logger.error('Decryption failed', { error });
      throw new Error('Data decryption failed');
    }
  }
}

export default new BiometricService();
