interface GeofenceZone {
  id: string;
  name: string;
  center: { lat: number; lng: number };
  radius: number; // in meters
  type: 'safe' | 'popular' | 'restricted' | 'emergency';
  notifications: boolean;
  createdAt: string;
  userId: string;
}

interface LocationEvent {
  id: string;
  userId: string;
  petId?: string;
  location: { lat: number; lng: number };
  timestamp: string;
  type: 'enter' | 'exit' | 'dwell';
  zoneId?: string;
  accuracy: number;
}

interface GeofenceNotification {
  id: string;
  type: 'zone_enter' | 'zone_exit' | 'safety_alert' | 'match_nearby';
  title: string;
  message: string;
  zoneId?: string;
  location: { lat: number; lng: number };
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

class GeofencingService {
  private zones: Map<string, GeofenceZone> = new Map();
  private watchId: number | null = null;
  private lastLocation: { lat: number; lng: number } | null = null;
  private callbacks: Map<string, Function> = new Map();
  private notificationQueue: GeofenceNotification[] = [];
  private isTracking = false;

  constructor() {
    this.loadStoredZones();
    this.setupDefaultZones();
  }

  // Initialize geofencing with user permission
  async initialize(): Promise<boolean> {
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported');
      return false;
    }

    try {
      // Request permission
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      
      if (permission.state === 'denied') {
        console.warn('Geolocation permission denied');
        return false;
      }

      // Start tracking
      this.startTracking();
      return true;
    } catch (error) {
      console.error('Failed to initialize geofencing:', error);
      return false;
    }
  }

  // Start location tracking
  startTracking(): void {
    if (this.isTracking) return;

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        this.handleLocationUpdate(location, position.coords.accuracy);
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );

    this.isTracking = true;
    console.log('🗺️ Geofencing tracking started');
  }

  // Stop location tracking
  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isTracking = false;
    console.log('🗺️ Geofencing tracking stopped');
  }

  // Handle location updates
  private handleLocationUpdate(location: { lat: number; lng: number }, accuracy: number): void {
    const previousLocation = this.lastLocation;
    this.lastLocation = location;

    // Check all zones for entry/exit events
    this.zones.forEach((zone) => {
      const wasInside = previousLocation ? this.isInsideZone(previousLocation, zone) : false;
      const isInside = this.isInsideZone(location, zone);

      if (!wasInside && isInside) {
        // Entered zone
        this.handleZoneEntry(zone, location);
      } else if (wasInside && !isInside) {
        // Exited zone
        this.handleZoneExit(zone, location);
      }
    });

    // Trigger location update callbacks
    this.callbacks.forEach((callback) => {
      callback({ location, accuracy, zones: Array.from(this.zones.values()) });
    });
  }

  // Check if location is inside a zone
  private isInsideZone(location: { lat: number; lng: number }, zone: GeofenceZone): boolean {
    const distance = this.calculateDistance(
      location.lat,
      location.lng,
      zone.center.lat,
      zone.center.lng
    );
    return distance <= zone.radius;
  }

  // Calculate distance between two points
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Handle zone entry
  private handleZoneEntry(zone: GeofenceZone, location: { lat: number; lng: number }): void {
    console.log(`📍 Entered zone: ${zone.name}`);

    if (zone.notifications) {
      const notification: GeofenceNotification = {
        id: `entry-${zone.id}-${Date.now()}`,
        type: 'zone_enter',
        title: `Entered ${zone.name}`,
        message: this.getZoneEntryMessage(zone),
        zoneId: zone.id,
        location,
        timestamp: new Date().toISOString(),
        read: false,
        priority: zone.type === 'emergency' ? 'high' : 'medium'
      };

      this.addNotification(notification);
    }

    // Trigger zone-specific actions
    this.triggerZoneActions(zone, 'enter', location);
  }

  // Handle zone exit
  private handleZoneExit(zone: GeofenceZone, location: { lat: number; lng: number }): void {
    console.log(`📍 Exited zone: ${zone.name}`);

    if (zone.notifications) {
      const notification: GeofenceNotification = {
        id: `exit-${zone.id}-${Date.now()}`,
        type: 'zone_exit',
        title: `Left ${zone.name}`,
        message: this.getZoneExitMessage(zone),
        zoneId: zone.id,
        location,
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'low'
      };

      this.addNotification(notification);
    }

    this.triggerZoneActions(zone, 'exit', location);
  }

  // Get zone entry message
  private getZoneEntryMessage(zone: GeofenceZone): string {
    const messages = {
      safe: 'You\'re in a safe area for pets. Enjoy your time here!',
      popular: 'This is a popular spot for pet activities. Look out for potential matches!',
      restricted: 'Please be aware of local restrictions in this area.',
      emergency: 'Emergency services are nearby if needed.'
    };
    return messages[zone.type] || 'You\'ve entered a marked area.';
  }

  // Get zone exit message
  private getZoneExitMessage(zone: GeofenceZone): string {
    const messages = {
      safe: 'You\'ve left the safe zone. Stay alert!',
      popular: 'Thanks for visiting this popular pet area!',
      restricted: 'You\'ve left the restricted area.',
      emergency: 'You\'ve left the emergency services area.'
    };
    return messages[zone.type] || 'You\'ve left the marked area.';
  }

  // Trigger zone-specific actions
  private triggerZoneActions(zone: GeofenceZone, action: 'enter' | 'exit', location: { lat: number; lng: number }): void {
    // Emit events for other services to handle
    window.dispatchEvent(new CustomEvent('geofence-event', {
      detail: { zone, action, location }
    }));

    // Zone-specific logic
    if (zone.type === 'popular' && action === 'enter') {
      // Check for nearby matches
      this.checkNearbyMatches(location);
    }

    if (zone.type === 'emergency' && action === 'enter') {
      // Log emergency zone entry for safety
      this.logEmergencyZoneEntry(zone, location);
    }
  }

  // Check for nearby matches
  private async checkNearbyMatches(location: { lat: number; lng: number }): Promise<void> {
    try {
      // Simulate API call to check nearby matches
      const nearbyMatches = await this.fetchNearbyMatches(location);
      
      if (nearbyMatches.length > 0) {
        const notification: GeofenceNotification = {
          id: `matches-${Date.now()}`,
          type: 'match_nearby',
          title: 'Potential Matches Nearby!',
          message: `${nearbyMatches.length} compatible pets are in this area.`,
          location,
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'high'
        };

        this.addNotification(notification);
      }
    } catch (error) {
      console.error('Failed to check nearby matches:', error);
    }
  }

  // Simulate fetching nearby matches
  private async fetchNearbyMatches(location: { lat: number; lng: number }): Promise<Array<{
    id: string;
    name: string;
    distance: number;
    photo?: string;
    lastSeen: string;
  }>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock data
    return Math.random() > 0.7 ? [
      { id: '1', name: 'Buddy', distance: 150 },
      { id: '2', name: 'Luna', distance: 230 }
    ] : [];
  }

  // Log emergency zone entry
  private logEmergencyZoneEntry(zone: GeofenceZone, location: { lat: number; lng: number }): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      zoneId: zone.id,
      zoneName: zone.name,
      location,
      type: 'emergency_zone_entry'
    };

    // Store in local storage for safety
    const logs = JSON.parse(localStorage.getItem('emergency_logs') || '[]');
    logs.push(logEntry);
    localStorage.setItem('emergency_logs', JSON.stringify(logs.slice(-50))); // Keep last 50 entries
  }

  // Add a new geofence zone
  addZone(zone: Omit<GeofenceZone, 'id' | 'createdAt'>): string {
    const id = `zone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newZone: GeofenceZone = {
      ...zone,
      id,
      createdAt: new Date().toISOString()
    };

    this.zones.set(id, newZone);
    this.saveZones();
    
    console.log(`✅ Added geofence zone: ${zone.name}`);
    return id;
  }

  // Remove a geofence zone
  removeZone(zoneId: string): boolean {
    const removed = this.zones.delete(zoneId);
    if (removed) {
      this.saveZones();
      console.log(`🗑️ Removed geofence zone: ${zoneId}`);
    }
    return removed;
  }

  // Get all zones
  getZones(): GeofenceZone[] {
    return Array.from(this.zones.values());
  }

  // Get zone by ID
  getZone(zoneId: string): GeofenceZone | undefined {
    return this.zones.get(zoneId);
  }

  // Add notification
  private addNotification(notification: GeofenceNotification): void {
    this.notificationQueue.push(notification);
    
    // Show browser notification if permitted
    this.showBrowserNotification(notification);
    
    // Trigger custom event
    window.dispatchEvent(new CustomEvent('geofence-notification', {
      detail: notification
    }));
  }

  // Show browser notification
  private async showBrowserNotification(notification: GeofenceNotification): Promise<void> {
    if (!('Notification' in window)) return;

    let permission = Notification.permission;
    
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icons/paw-icon.png',
        badge: '/icons/paw-badge.png',
        tag: notification.type,
        requireInteraction: notification.priority === 'high'
      });
    }
  }

  // Get notifications
  getNotifications(): GeofenceNotification[] {
    return this.notificationQueue.slice().reverse(); // Most recent first
  }

  // Mark notification as read
  markNotificationRead(notificationId: string): void {
    const notification = this.notificationQueue.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  // Clear all notifications
  clearNotifications(): void {
    this.notificationQueue = [];
  }

  // Subscribe to location updates
  subscribe(callbackId: string, callback: Function): void {
    this.callbacks.set(callbackId, callback);
  }

  // Unsubscribe from location updates
  unsubscribe(callbackId: string): void {
    this.callbacks.delete(callbackId);
  }

  // Setup default zones (popular pet areas, emergency services, etc.)
  private setupDefaultZones(): void {
    // Example default zones - these would typically come from a backend service
    const defaultZones = [
      {
        name: 'Central Park Dog Run',
        center: { lat: 40.7829, lng: -73.9654 },
        radius: 200,
        type: 'popular' as const,
        notifications: true,
        userId: 'system'
      },
      {
        name: 'Emergency Vet Clinic',
        center: { lat: 40.7505, lng: -73.9934 },
        radius: 100,
        type: 'emergency' as const,
        notifications: true,
        userId: 'system'
      }
    ];

    defaultZones.forEach(zone => {
      if (!Array.from(this.zones.values()).some(z => z.name === zone.name)) {
        this.addZone(zone);
      }
    });
  }

  // Save zones to localStorage
  private saveZones(): void {
    const zonesArray = Array.from(this.zones.values());
    localStorage.setItem('geofence_zones', JSON.stringify(zonesArray));
  }

  // Load zones from localStorage
  private loadStoredZones(): void {
    try {
      const stored = localStorage.getItem('geofence_zones');
      if (stored) {
        const zonesArray: GeofenceZone[] = JSON.parse(stored);
        zonesArray.forEach(zone => {
          this.zones.set(zone.id, zone);
        });
        console.log(`📍 Loaded ${zonesArray.length} stored geofence zones`);
      }
    } catch (error) {
      console.error('Failed to load stored zones:', error);
    }
  }

  // Get current location
  async getCurrentLocation(): Promise<{ lat: number; lng: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Failed to get current location:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }

  // Check if currently inside any zones
  getCurrentZones(): GeofenceZone[] {
    if (!this.lastLocation) return [];

    return Array.from(this.zones.values()).filter(zone => 
      this.isInsideZone(this.lastLocation!, zone)
    );
  }

  // Get distance to nearest zone
  getDistanceToNearestZone(): { zone: GeofenceZone; distance: number } | null {
    if (!this.lastLocation || this.zones.size === 0) return null;

    let nearest: { zone: GeofenceZone; distance: number } | null = null;

    this.zones.forEach(zone => {
      const distance = this.calculateDistance(
        this.lastLocation!.lat,
        this.lastLocation!.lng,
        zone.center.lat,
        zone.center.lng
      );

      if (!nearest || distance < nearest.distance) {
        nearest = { zone, distance };
      }
    });

    return nearest;
  }

  // Cleanup
  destroy(): void {
    this.stopTracking();
    this.callbacks.clear();
    this.zones.clear();
    this.notificationQueue = [];
  }
}

// Export singleton instance
export const geofencingService = new GeofencingService();
export default GeofencingService;
