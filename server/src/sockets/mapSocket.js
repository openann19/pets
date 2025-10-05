const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

class MapSocketServer {
  constructor(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      path: '/socket.io/',
      transports: ['websocket', 'polling']
    });

    this.activePins = new Map(); // Store active pet locations
    this.userSessions = new Map(); // Track connected users
    this.setupSocketHandlers();
    this.startLocationSimulation();
  }

  setupSocketHandlers() {
    // Standardized authentication middleware
    this.io.use((socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          // Allow connection but require authentication via 'authenticate' event
          return next();
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.userId;
        socket.userEmail = decoded.email;
        next();
      } catch (err) {
        console.error('Map socket authentication error:', err);
        next();
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`🗺️ Map client connected: ${socket.id}`);

      // Authenticate user (fallback for clients not using handshake auth)
      socket.on('authenticate', async (token) => {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          socket.userId = decoded.userId;
          socket.userEmail = decoded.email;
          
          this.userSessions.set(socket.userId, {
            socketId: socket.id,
            lastSeen: new Date(),
            location: null
          });

          socket.emit('authenticated', { success: true });
          console.log(`✅ User authenticated: ${socket.userEmail}`);
        } catch (error) {
          console.error('Map socket authenticate event error:', error);
          socket.emit('auth_error', { message: 'Invalid token' });
        }
      });

      // Handle location updates from users
      socket.on('location:update', (data) => {
        if (!socket.userId) return;

        const { latitude, longitude, activity, message } = data;
        
        const pin = {
          _id: `${socket.userId}-${Date.now()}`,
          petId: data.petId || `pet-${socket.userId}`,
          ownerId: socket.userId,
          coordinates: [longitude, latitude],
          activity: activity || 'other',
          message: message || null,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
        };

        this.activePins.set(pin._id, pin);
        
        // Broadcast to all connected clients
        this.io.emit('pin:update', pin);
        
        console.log(`📍 Location update from ${socket.userEmail}: ${activity} at [${latitude}, ${longitude}]`);
      });

      // Send initial pins when requested
      socket.on('request:initial-pins', (data) => {
        const { radius = 5 } = data;
        const pins = Array.from(this.activePins.values())
          .filter(pin => new Date(pin.expiresAt) > new Date())
          .slice(-50); // Last 50 active pins

        socket.emit('pins:initial', pins);
        console.log(`📊 Sent ${pins.length} initial pins to ${socket.id}`);
      });

      // Handle pet activity updates
      socket.on('activity:start', (data) => {
        if (!socket.userId) return;

        const { petId, activity, location, message } = data;
        
        const pin = {
          _id: `activity-${petId}-${Date.now()}`,
          petId,
          ownerId: socket.userId,
          coordinates: [location.longitude, location.latitude],
          activity,
          message: message || `Started ${activity}`,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
        };

        this.activePins.set(pin._id, pin);
        this.io.emit('pin:update', pin);
        
        console.log(`🎾 Activity started: ${activity} for pet ${petId}`);
      });

      socket.on('activity:end', (data) => {
        const { pinId } = data;
        
        if (this.activePins.has(pinId)) {
          this.activePins.delete(pinId);
          this.io.emit('pin:remove', pinId);
          console.log(`🏁 Activity ended: ${pinId}`);
        }
      });

      // Handle nearby pet requests
      socket.on('nearby:request', (data) => {
        const { latitude, longitude, radius = 5 } = data;
        
        const nearbyPins = Array.from(this.activePins.values())
          .filter(pin => {
            const distance = this.calculateDistance(
              latitude, longitude,
              pin.coordinates[1], pin.coordinates[0]
            );
            return distance <= radius && new Date(pin.expiresAt) > new Date();
          })
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        socket.emit('nearby:response', nearbyPins);
        console.log(`🔍 Found ${nearbyPins.length} nearby pets within ${radius}km`);
      });

      // Handle match notifications on map
      socket.on('match:notify', (data) => {
        const { matchId, targetUserId, location } = data;
        
        const targetSession = this.userSessions.get(targetUserId);
        if (targetSession) {
          this.io.to(targetSession.socketId).emit('match:map-notification', {
            matchId,
            location,
            message: 'You have a new match nearby!',
            timestamp: new Date().toISOString()
          });
        }
      });

      // Cleanup on disconnect
      socket.on('disconnect', () => {
        if (socket.userId) {
          this.userSessions.delete(socket.userId);
          
          // Remove user's pins after 5 minutes
          setTimeout(() => {
            const userPins = Array.from(this.activePins.entries())
              .filter(([_, pin]) => pin.ownerId === socket.userId);
            
            userPins.forEach(([pinId]) => {
              this.activePins.delete(pinId);
              this.io.emit('pin:remove', pinId);
            });
          }, 5 * 60 * 1000);
        }
        
        console.log(`🚪 Map client disconnected: ${socket.id}`);
      });
    });
  }

  startLocationSimulation() {
    // Simulate pet activities for demo purposes
    setInterval(() => {
      if (this.userSessions.size === 0) return;

      const activities = ['walking', 'playing', 'grooming', 'vet', 'park', 'other'];
      const messages = [
        'Having a great time!',
        'Beautiful weather today',
        'Made a new friend',
        'Feeling energetic',
        'Love this spot!',
        'Perfect day for a walk',
        'Playing with new friends',
        'Enjoying the sunshine'
      ];

      // Create random activity pins
      for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) {
        const activity = activities[Math.floor(Math.random() * activities.length)];
        const message = Math.random() > 0.4 ? messages[Math.floor(Math.random() * messages.length)] : null;
        
        // Random location around NYC (demo area)
        const baseLat = 40.7589 + (Math.random() - 0.5) * 0.1;
        const baseLng = -73.9851 + (Math.random() - 0.5) * 0.1;
        
        const pin = {
          _id: `demo-${Date.now()}-${i}`,
          petId: `demo-pet-${Math.floor(Math.random() * 100)}`,
          ownerId: `demo-user-${Math.floor(Math.random() * 50)}`,
          coordinates: [baseLng, baseLat],
          activity,
          message,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 20 * 60 * 1000).toISOString() // 20 minutes
        };

        this.activePins.set(pin._id, pin);
        this.io.emit('pin:update', pin);
      }

      // Clean up expired pins
      const now = new Date();
      const expiredPins = Array.from(this.activePins.entries())
        .filter(([_, pin]) => new Date(pin.expiresAt) <= now);

      expiredPins.forEach(([pinId]) => {
        this.activePins.delete(pinId);
        this.io.emit('pin:remove', pinId);
      });

      if (expiredPins.length > 0) {
        console.log(`🧹 Cleaned up ${expiredPins.length} expired pins`);
      }

    }, 8000); // Every 8 seconds

    // Send heatmap data every 30 seconds
    setInterval(() => {
      const heatmapData = this.generateHeatmapData();
      this.io.emit('heatmap:update', heatmapData);
    }, 30000);
  }

  generateHeatmapData() {
    const heatmap = [];
    const pins = Array.from(this.activePins.values())
      .filter(pin => new Date(pin.expiresAt) > new Date());

    // Group pins by proximity and create heat points
    const gridSize = 0.01; // ~1km grid
    const heatGrid = new Map();

    pins.forEach(pin => {
      const gridX = Math.floor(pin.coordinates[0] / gridSize);
      const gridY = Math.floor(pin.coordinates[1] / gridSize);
      const key = `${gridX},${gridY}`;

      if (!heatGrid.has(key)) {
        heatGrid.set(key, { count: 0, lat: 0, lng: 0 });
      }

      const cell = heatGrid.get(key);
      cell.count++;
      cell.lat += pin.coordinates[1];
      cell.lng += pin.coordinates[0];
    });

    // Convert to heatmap format [lat, lng, intensity]
    heatGrid.forEach((cell, key) => {
      if (cell.count >= 2) { // Only show areas with multiple activities
        heatmap.push([
          cell.lat / cell.count,
          cell.lng / cell.count,
          Math.min(cell.count / 5, 1) // Normalize intensity
        ]);
      }
    });

    return heatmap;
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  getStats() {
    const now = new Date();
    const activePins = Array.from(this.activePins.values())
      .filter(pin => new Date(pin.expiresAt) > now);

    return {
      connectedUsers: this.userSessions.size,
      activePins: activePins.length,
      totalPinsToday: this.activePins.size,
      activitiesByType: this.getActivityCounts(activePins)
    };
  }

  getActivityCounts(pins) {
    const counts = {};
    pins.forEach(pin => {
      counts[pin.activity] = (counts[pin.activity] || 0) + 1;
    });
    return counts;
  }
}

module.exports = MapSocketServer;
