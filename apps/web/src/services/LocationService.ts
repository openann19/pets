/**
 * Real Location Service
 * Handles actual location tracking, geocoding, and location-based features
 */

import type { LogMetadata } from './logger';
import { logger } from './logger';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
  address?: string;
  city?: string;
  country?: string;
}

export interface LocationSettings {
  trackingEnabled: boolean;
  updateInterval: number; // milliseconds
  accuracyThreshold: number; // meters
  backgroundTracking: boolean;
}

class LocationService {
  private watchId: number | null = null;
  private currentLocation: LocationData | null = null;
  private subscribers: Set<(location: LocationData) => void> = new Set();
  private settings: LocationSettings = {
    trackingEnabled: false,
    updateInterval: 30000, // 30 seconds
    accuracyThreshold: 100, // 100 meters
    backgroundTracking: false,
  };

  /**
   * Initialize location service
   */
  async initialize(): Promise<boolean> {
    if (!navigator.geolocation) {
      logger.error('Geolocation is not supported by this browser');
      return false;
    }

    try {
      // Get initial location
      const location = await this.getCurrentLocation();
      if (location) {
        this.currentLocation = location;
        logger.info('Location service initialized', { location });
        return true;
      }
    } catch (error) {
      logger.error('Failed to initialize location service', error as unknown as LogMetadata);
    }

    return false;
  }

  /**
   * Get current location
   */
  async getCurrentLocation(): Promise<LocationData | null> {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now(),
          };

          // Reverse geocode to get address
          try {
            const address = await this.reverseGeocode(location.latitude, location.longitude);
            location.address = address.address;
            location.city = address.city;
            location.country = address.country;
          } catch (error) {
            logger.warn('Reverse geocoding failed', error as unknown as LogMetadata);
          }

          this.currentLocation = location;
          resolve(location);
        },
        (error) => {
          logger.error('Failed to get current location', error as unknown as LogMetadata);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        },
      );
    });
  }

  /**
   * Start location tracking
   */
  startTracking(settings?: Partial<LocationSettings>): void {
    if (this.watchId) {
      logger.warn('Location tracking already started');
      return;
    }

    this.settings = { ...this.settings, ...settings };

    if (!this.settings.trackingEnabled) {
      logger.info('Location tracking disabled in settings');
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const location: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now(),
        };

        // Check accuracy threshold
        if (
          position.coords.accuracy &&
          position.coords.accuracy > this.settings.accuracyThreshold
        ) {
          logger.warn('Location accuracy below threshold', {
            accuracy: position.coords.accuracy,
            threshold: this.settings.accuracyThreshold,
          });
          return;
        }

        // Reverse geocode
        try {
          const address = await this.reverseGeocode(location.latitude, location.longitude);
          location.address = address.address;
          location.city = address.city;
          location.country = address.country;
        } catch (error) {
          logger.warn('Reverse geocoding failed', error as unknown as LogMetadata);
        }

        this.currentLocation = location;
        this.notifySubscribers(location);
      },
      (error) => {
        logger.error('Location tracking error', error as unknown as LogMetadata);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: this.settings.updateInterval,
      },
    );

    logger.info('Location tracking started', this.settings as unknown as LogMetadata);
  }

  /**
   * Stop location tracking
   */
  stopTracking(): void {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      logger.info('Location tracking stopped');
    }
  }

  /**
   * Subscribe to location updates
   */
  subscribe(callback: (location: LocationData) => void): () => void {
    this.subscribers.add(callback);

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Notify all subscribers of location update
   */
  private notifySubscribers(location: LocationData): void {
    this.subscribers.forEach((callback) => {
      try {
        callback(location);
      } catch (error) {
        logger.error('Error in location subscriber', error as unknown as LogMetadata);
      }
    });
  }

  /**
   * Reverse geocode coordinates to address
   */
  private async reverseGeocode(
    lat: number,
    lng: number,
  ): Promise<{
    address: string;
    city: string;
    country: string;
  }> {
    try {
      // Use a real geocoding service (Google Maps, Mapbox, etc.)
      // For now, we'll use a mock implementation
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      );

      if (!response.ok) {
        throw new Error('Geocoding API failed');
      }

      const data = await response.json();

      return {
        address: data.locality || 'Unknown Address',
        city: data.city || data.locality || 'Unknown City',
        country: data.countryName || 'Unknown Country',
      };
    } catch (error) {
      logger.error('Reverse geocoding failed', error as unknown as LogMetadata);
      return {
        address: 'Unknown Address',
        city: 'Unknown City',
        country: 'Unknown Country',
      };
    }
  }

  /**
   * Get nearby pets based on location
   */
  async getNearbyPets(location: LocationData, radius: number = 5): Promise<unknown[]> {
    try {
      const response = await fetch('/api/pets/nearby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          radius: radius * 1000, // Convert to meters
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch nearby pets');
      }

      const data = await response.json();
      return data.pets || [];
    } catch (error) {
      logger.error('Failed to get nearby pets', error as unknown as LogMetadata);
      return [];
    }
  }

  /**
   * Calculate distance between two points
   */
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
      Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get current location data
   */
  getCurrentLocationData(): LocationData | null {
    return this.currentLocation;
  }

  /**
   * Update settings
   */
  updateSettings(settings: Partial<LocationSettings>): void {
    this.settings = { ...this.settings, ...settings };

    // Restart tracking if settings changed
    if (this.watchId) {
      this.stopTracking();
      this.startTracking();
    }
  }

  /**
   * Get settings
   */
  getSettings(): LocationSettings {
    return { ...this.settings };
  }
}

// Export singleton instance
export const locationService = new LocationService();
export default locationService;
