---
trigger: model_decision
description: Backend API patterns and common configuration issues
globs: server/**/*.js,apps/web/src/services/**/*.ts
---

# Backend & API Best Practices

## Backend Configuration

### Environment Variables (server/.env)

**Required variables with correct values**:
```bash
PORT=5001                                              # NOT 5000!
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/pawfectmatch   # IPv4, NOT localhost!
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

### MongoDB Connection

❌ **BAD** (causes IPv6 errors):
```javascript
mongoose.connect('mongodb://localhost:27017/pawfectmatch', {
  useNewUrlParser: true,        // Deprecated!
  useUnifiedTopology: true,     // Deprecated!
});
```

✅ **GOOD**:
```javascript
mongoose.connect('mongodb://127.0.0.1:27017/pawfectmatch');
// No options needed for Mongoose 6+
```

### Port Handling

Always check if port is in use before starting:

```javascript
const DEFAULT_PORT = 5001;

async function startServer(port = DEFAULT_PORT) {
  try {
    await httpServer.listen(port);
    logger.info(`🌟 Server running on port ${port}`);
  } catch (error) {
    if (error.code === 'EADDRINUSE') {
      logger.warn(`⚠️  Port ${port} in use`);
      // Don't retry automatically - exit and let user fix it
      process.exit(1);
    }
  }
}
```

**DON'T automatically try different ports!** This leads to:
- Multiple server instances
- Port confusion
- Memory leaks
- MaxListeners warnings

### CORS Configuration

```javascript
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    if (process.env.NODE_ENV === 'development') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }
    
    // Production: whitelist specific origins
    const allowedOrigins = [process.env.CLIENT_URL];
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
```

## Frontend API Client

### API Base URL

Always use environment variable with correct default:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
//                                                                           ^^^^^ Port 5001!
```

### API Client Methods

If a method is called but doesn't exist, add a stub:

```typescript
const apiClient = {
  ...api,
  // Stub for unimplemented features
  connectWebSocket: (userId: string) => {
    console.warn('[WebSocket] Not yet implemented - userId:', userId);
    return null;
  },
  disconnectWebSocket: () => {
    console.warn('[WebSocket] Not yet implemented');
  },
};
```

**Don't let missing methods crash the app!**

### Error Handling

All API calls should handle errors gracefully:

```typescript
async request<T>(endpoint: string, options: RequestOptions = {}) {
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      // Handle 401 with token refresh
      if (response.status === 401) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          return this.request<T>(endpoint, options);
        }
        // Redirect to login
        this.clearToken();
        window.location.href = '/login';
        throw new Error('Session expired');
      }
      
      // Parse error message
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    logger.error('API request failed:', error);
    throw error;
  }
}
```

## Process Management

### Starting Backend

**Always clean up first**:
```bash
# Kill old processes
pkill -9 -f "node.*server"
pkill -9 -f "nodemon"

# Wait for cleanup
sleep 3

# Start fresh
npm start
```

### Graceful Shutdown

```javascript
process.on('SIGTERM', async () => {
  logger.info('👋 SIGTERM received, shutting down gracefully');
  
  // Close server
  httpServer.close(() => {
    logger.info('✅ HTTP server closed');
  });
  
  // Close MongoDB
  await mongoose.connection.close();
  logger.info('✅ MongoDB connection closed');
  
  process.exit(0);
});
```

## Common Backend Issues

### 1. Multiple Instances Running
**Symptoms**: Port conflicts, memory leaks
**Solution**: Kill all instances before starting

### 2. Winston Logger Errors
**Symptoms**: "write after end"
**Cause**: Multiple instances trying to write to same log files
**Solution**: Ensure only one instance runs

### 3. MongoDB Connection Refused
**Symptoms**: `ECONNREFUSED ::1:27017`
**Solution**: Use IPv4 (`127.0.0.1`) not `localhost`

### 4. JWT Token Issues
**Symptoms**: 401 errors on all API calls
**Solution**: Check token expiry, implement refresh logic

## Testing

Before deploying:
- [ ] Backend starts on correct port (5001)
- [ ] MongoDB connects successfully
- [ ] CORS allows frontend origin
- [ ] JWT tokens work
- [ ] Error responses are JSON formatted
- [ ] Graceful shutdown works
- [ ] No port conflicts
- [ ] Logs are written correctly
