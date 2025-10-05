#!/bin/bash

echo "🔧 Fixing all identified issues in PawfectMatch Premium..."

# Fix TypeScript configuration for mobile app
echo "📱 Fixing mobile app TypeScript configuration..."
cd /workspace/apps/mobile
# Remove problematic type references
sed -i '/"types": \["@types\/node", "@types\/react-native"\]/d' tsconfig.json

# Fix missing WebSocket connection in web app
echo "🌐 Implementing missing WebSocket connection..."
cat > /workspace/apps/web/src/services/socket.ts << 'EOF'
import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect(token: string) {
    if (this.socket?.connected) return this.socket;
    
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5001';
    
    this.socket = io(wsUrl, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.emit('connected', true);
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      this.emit('connected', false);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: Function) {
    if (callback) {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) callbacks.splice(index, 1);
      }
      this.socket?.off(event, callback);
    } else {
      this.listeners.delete(event);
      this.socket?.off(event);
    }
  }

  emit(event: string, data?: any) {
    const callbacks = this.listeners.get(event);
    callbacks?.forEach(cb => cb(data));
    this.socket?.emit(event, data);
  }

  getSocket() {
    return this.socket;
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
export default socketService;
EOF

# Add missing API client methods
echo "🔌 Adding missing API client methods..."
cat >> /workspace/apps/web/src/services/api.ts << 'EOF'

// Additional API methods for complete feature coverage
export const extendedAPI = {
  // Video calling
  async initiateVideoCall(matchId: string) {
    return apiInstance.request(`/matches/${matchId}/video-call`, {
      method: 'POST',
    });
  },
  
  // Voice notes
  async sendVoiceNote(matchId: string, audioBlob: Blob) {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    return apiInstance.request(`/matches/${matchId}/voice-note`, {
      method: 'POST',
      body: formData,
    });
  },
  
  // Advanced search
  async searchPets(filters: any) {
    return apiInstance.request('/pets/search', {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  },
  
  // Analytics
  async getAnalytics(period: string = '7d') {
    return apiInstance.request(`/analytics?period=${period}`);
  },
  
  // Notifications
  async getNotifications() {
    return apiInstance.request('/notifications');
  },
  
  async markNotificationRead(id: string) {
    return apiInstance.request(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },
};

// Merge extended API into main export
Object.assign(api, extendedAPI);
EOF

# Create missing database indexes
echo "🗄️ Creating database indexes..."
cat > /workspace/server/src/scripts/ensure-indexes.js << 'EOF'
const mongoose = require('mongoose');
const Pet = require('../models/Pet');
const User = require('../models/User');
const Match = require('../models/Match');

async function ensureIndexes() {
  // Pet indexes for fast discovery
  await Pet.collection.createIndex({ location: '2dsphere' });
  await Pet.collection.createIndex({ breed: 1, age: 1 });
  await Pet.collection.createIndex({ 'preferences.activityLevel': 1 });
  await Pet.collection.createIndex({ createdAt: -1 });
  
  // User indexes
  await User.collection.createIndex({ email: 1 }, { unique: true });
  await User.collection.createIndex({ 'premium.tier': 1 });
  
  // Match indexes for chat
  await Match.collection.createIndex({ users: 1, status: 1 });
  await Match.collection.createIndex({ 'lastMessage.timestamp': -1 });
  
  console.log('✅ All database indexes created');
}

module.exports = ensureIndexes;
EOF

# Fix missing LoadingSpinner variant in web app
echo "🎨 Fixing LoadingSpinner component..."
cat > /workspace/apps/web/src/components/UI/LoadingSpinner.tsx << 'EOF'
'use client';
import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'gradient' | 'neon' | 'holographic';
  color?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  color,
  className = '',
}) => {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const variantStyles = {
    default: {
      borderColor: color || '#e5e7eb',
      borderTopColor: color || '#3b82f6',
    },
    gradient: {
      background: 'conic-gradient(from 180deg at 50% 50%, #667eea 0deg, #ec4899 180deg, #667eea 360deg)',
    },
    neon: {
      borderColor: '#3b82f6',
      borderTopColor: '#60a5fa',
      boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
    },
    holographic: {
      background: 'conic-gradient(from 0deg at 50% 50%, #ff6b6b, #4ecdc4, #45b7b8, #96ceb4, #ffeaa7, #ff6b6b)',
    },
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} ${className} border-2 border-solid rounded-full animate-spin`}
      style={variantStyles[variant]}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );
};

export default LoadingSpinner;
EOF

# Add missing pet creation validation
echo "✅ Adding pet creation validation..."
cat > /workspace/server/src/middleware/petValidation.js << 'EOF'
const { body, validationResult } = require('express-validator');

const createPetValidation = [
  body('name').trim().notEmpty().withMessage('Pet name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('species').isIn(['dog', 'cat', 'bird', 'rabbit', 'other'])
    .withMessage('Invalid species'),
  body('breed').optional().trim(),
  body('age').isInt({ min: 0, max: 30 }).withMessage('Age must be 0-30'),
  body('gender').isIn(['male', 'female']).withMessage('Invalid gender'),
  body('size').isIn(['small', 'medium', 'large']).withMessage('Invalid size'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio max 500 characters'),
  body('temperament').optional().isArray(),
  body('preferences.activityLevel').optional()
    .isIn(['low', 'medium', 'high']).withMessage('Invalid activity level'),
];

const updatePetValidation = [
  body('name').optional().trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('age').optional().isInt({ min: 0, max: 30 }).withMessage('Age must be 0-30'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio max 500 characters'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  createPetValidation,
  updatePetValidation,
  validate,
};
EOF

# Fix environment variables for production
echo "🔐 Setting up production environment..."
cat > /workspace/.env.production << 'EOF'
# Production Environment Variables
NODE_ENV=production
PORT=5001

# Database
MONGODB_URI=mongodb://localhost:27017/pawfectmatch_prod

# JWT
JWT_SECRET=production-secret-change-this-in-deployment
JWT_ACCESS_EXPIRY=1h
JWT_REFRESH_EXPIRY=30d

# Client
CLIENT_URL=https://pawfectmatch.com
NEXT_PUBLIC_API_URL=https://api.pawfectmatch.com
NEXT_PUBLIC_WS_URL=wss://api.pawfectmatch.com

# Email
EMAIL_FROM=noreply@pawfectmatch.com
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_live_your_key
STRIPE_SECRET_KEY=sk_live_your_key

# Redis
REDIS_URL=redis://localhost:6379

# Sentry
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project

# Security
ALLOWED_ORIGINS=https://pawfectmatch.com,https://www.pawfectmatch.com
RATE_LIMIT_MAX_REQUESTS=100
SESSION_SECRET=production-session-secret
EOF

# Create health check endpoint
echo "🏥 Adding health check endpoint..."
cat > /workspace/server/src/routes/health.js << 'EOF'
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: Date.now(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    memory: process.memoryUsage(),
  };
  
  try {
    // Check database connectivity
    await mongoose.connection.db.admin().ping();
    res.status(200).json(health);
  } catch (error) {
    health.status = 'error';
    health.database = 'error';
    health.error = error.message;
    res.status(503).json(health);
  }
});

module.exports = router;
EOF

# Add the health route to server.js
echo "🔧 Integrating health check..."
sed -i "/\/\/ API Routes/a app.use('/health', require('./src/routes/health'));" /workspace/server/server.js

# Create missing test utilities
echo "🧪 Creating test utilities..."
cat > /workspace/apps/web/src/tests/test-utils.tsx << 'EOF'
import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function render(ui: React.ReactElement, options = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

export * from '@testing-library/react';
export { render };
EOF

# Fix mobile navigation types
echo "📱 Fixing mobile navigation types..."
cat > /workspace/apps/mobile/src/types/navigation.ts << 'EOF'
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Profile: { userId?: string };
  Swipe: undefined;
  Matches: undefined;
  Chat: { matchId: string };
  Settings: undefined;
  Premium: undefined;
  PetProfile: { petId: string };
  CreatePet: undefined;
  VideoCall: { matchId: string };
  Map: undefined;
};

export type TabParamList = {
  Home: undefined;
  Swipe: undefined;
  Matches: undefined;
  Profile: undefined;
};
EOF

echo "✅ All critical issues fixed!"
echo ""
echo "📊 Summary of fixes:"
echo "- Fixed TypeScript configurations"
echo "- Implemented WebSocket service"
echo "- Added missing API methods"
echo "- Created database indexes"
echo "- Fixed UI component variants"
echo "- Added validation middleware"
echo "- Set up production environment"
echo "- Added health check endpoint"
echo "- Created test utilities"
echo "- Fixed mobile navigation types"