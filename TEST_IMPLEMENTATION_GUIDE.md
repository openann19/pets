# 🧪 Test Implementation Guide - Quick Start Templates

**Purpose:** Ready-to-use test templates for implementing missing test coverage  
**Generated:** October 8, 2025

---

## 📋 Table of Contents

1. [Backend API Tests](#backend-api-tests)
2. [Frontend Component Tests](#frontend-component-tests)
3. [Hook Tests](#hook-tests)
4. [E2E Tests](#e2e-tests)
5. [Test Data Factories](#test-data-factories)

---

## 🔧 Backend API Tests

### Template 1: AI Endpoints Test Suite

Create: `server/tests/integration/ai-endpoints.test.js`

```javascript
/**
 * AI Endpoints Integration Tests
 * Tests all AI-powered features including bio generation, photo analysis, and compatibility
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app, httpServer } = require('../../server');
const User = require('../../src/models/User');
const Pet = require('../../src/models/Pet');

let mongoServer;
let testUser;
let testToken;
let testPet;

// Mock AI service responses
jest.mock('axios', () => ({
  post: jest.fn().mockImplementation((url, data) => {
    if (url.includes('generate-bio')) {
      return Promise.resolve({
        data: {
          bio: 'A friendly and energetic dog who loves to play!',
          tone: data.tone || 'friendly',
          length: data.length || 'medium',
          generated_at: new Date().toISOString(),
          ai_confidence: 0.95
        }
      });
    }
    if (url.includes('analyze-photo')) {
      return Promise.resolve({
        data: {
          analysis: 'Great photo quality with good lighting',
          detected_traits: ['Friendly', 'Energetic'],
          confidence: 0.88,
          breed_indicators: ['Golden Retriever characteristics'],
          health_assessment: 'Appears healthy and well-groomed'
        }
      });
    }
    if (url.includes('enhanced-compatibility')) {
      return Promise.resolve({
        data: {
          compatibility_score: 85,
          confidence: 0.92,
          breakdown: {
            species_match: 1.0,
            age_compatibility: 0.8,
            size_compatibility: 0.9,
            personality_match: 0.75
          },
          insights: ['Great match for playdates', 'Similar energy levels'],
          recommendations: ['Supervise first meeting', 'Introduce in neutral space'],
          risk_factors: [],
          interaction_suitability: 'Highly suitable'
        }
      });
    }
    return Promise.reject(new Error('Unknown endpoint'));
  })
}));

describe('AI Endpoints Integration Tests', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  }, 30000);

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongoServer) await mongoServer.stop();
    if (httpServer && httpServer.listening) {
      httpServer.close();
    }
  }, 30000);

  beforeEach(async () => {
    await User.deleteMany({});
    await Pet.deleteMany({});

    // Create test user
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: `test${Date.now()}@example.com`,
        password: 'Test123!@#',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: '1990-01-01'
      });

    testUser = res.body.data.user;
    testToken = res.body.data.accessToken;

    // Create test pet
    const petRes = await request(app)
      .post('/api/pets')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        name: 'Buddy',
        species: 'dog',
        breed: 'Golden Retriever',
        age: 3,
        gender: 'male',
        size: 'large',
        intent: 'playdate'
      });

    testPet = petRes.body.data.pet;
  });

  describe('POST /api/ai/generate-bio', () => {
    it('should generate bio with default settings (200)', async () => {
      const res = await request(app)
        .post('/api/ai/generate-bio')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          keywords: ['friendly', 'playful'],
          petName: 'Buddy',
          species: 'dog'
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.bio).toBeDefined();
      expect(typeof res.body.bio).toBe('string');
      expect(res.body.metadata).toHaveProperty('tone');
      expect(res.body.metadata).toHaveProperty('length');
    });

    it('should accept tone parameter (200)', async () => {
      const res = await request(app)
        .post('/api/ai/generate-bio')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          keywords: ['energetic'],
          petName: 'Max',
          tone: 'playful',
          length: 'short'
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.metadata.tone).toBe('playful');
    });

    it('should reject without keywords (400)', async () => {
      const res = await request(app)
        .post('/api/ai/generate-bio')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          petName: 'Buddy'
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should reject without authentication (401)', async () => {
      await request(app)
        .post('/api/ai/generate-bio')
        .send({
          keywords: ['friendly'],
          petName: 'Buddy'
        })
        .expect(401);
    });
  });

  describe('POST /api/ai/analyze-photos', () => {
    it('should analyze single photo (200)', async () => {
      const res = await request(app)
        .post('/api/ai/analyze-photos')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          photoUrls: ['https://example.com/photo1.jpg'],
          petName: 'Buddy'
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0]).toHaveProperty('analysis');
      expect(res.body.results[0]).toHaveProperty('confidence');
      expect(res.body.results[0]).toHaveProperty('scores');
    });

    it('should analyze multiple photos (200)', async () => {
      const res = await request(app)
        .post('/api/ai/analyze-photos')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          photoUrls: [
            'https://example.com/photo1.jpg',
            'https://example.com/photo2.jpg',
            'https://example.com/photo3.jpg'
          ],
          petName: 'Buddy'
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.results).toHaveLength(3);
      expect(res.body.bestPhoto).toBeDefined();
      expect(res.body.summary).toHaveProperty('total_photos', 3);
    });

    it('should reject invalid URLs (400)', async () => {
      const res = await request(app)
        .post('/api/ai/analyze-photos')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          photoUrls: ['not-a-valid-url']
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should reject without authentication (401)', async () => {
      await request(app)
        .post('/api/ai/analyze-photos')
        .send({
          photoUrls: ['https://example.com/photo.jpg']
        })
        .expect(401);
    });
  });

  describe('POST /api/ai/enhanced-compatibility', () => {
    it('should analyze pet compatibility (200)', async () => {
      const res = await request(app)
        .post('/api/ai/enhanced-compatibility')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          pet1: {
            id: testPet._id,
            name: 'Buddy',
            species: 'dog',
            breed: 'Golden Retriever',
            age: 3,
            size: 'large',
            personality_tags: ['friendly', 'energetic']
          },
          pet2: {
            id: 'other-pet-id',
            name: 'Max',
            species: 'dog',
            breed: 'Labrador',
            age: 4,
            size: 'large',
            personality_tags: ['playful', 'gentle']
          },
          interaction_type: 'playdate'
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.compatibility_score).toBeGreaterThanOrEqual(0);
      expect(res.body.compatibility_score).toBeLessThanOrEqual(100);
      expect(res.body.breakdown).toBeDefined();
      expect(res.body.insights).toBeInstanceOf(Array);
      expect(res.body.recommendations).toBeInstanceOf(Array);
    });

    it('should reject invalid pet data (400)', async () => {
      const res = await request(app)
        .post('/api/ai/enhanced-compatibility')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          pet1: { name: 'Buddy' }, // Missing required fields
          pet2: { name: 'Max' }
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/ai/health', () => {
    it('should return health status (200)', async () => {
      const res = await request(app)
        .get('/api/ai/health')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.status).toBe('healthy');
      expect(res.body.cache).toBeDefined();
      expect(res.body.endpoints).toBeDefined();
    });
  });
});
```

### Template 2: GDPR Endpoints Test Suite

Create: `server/tests/integration/gdpr-endpoints.test.js`

```javascript
/**
 * GDPR Compliance Integration Tests
 * Tests data export, deletion, and privacy settings
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app, httpServer } = require('../../server');
const User = require('../../src/models/User');
const Pet = require('../../src/models/Pet');
const Match = require('../../src/models/Match');
const Message = require('../../src/models/Message');

let mongoServer;
let testUser;
let testToken;

describe('GDPR Endpoints Integration Tests', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  }, 30000);

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongoServer) await mongoServer.stop();
    if (httpServer && httpServer.listening) {
      httpServer.close();
    }
  }, 30000);

  beforeEach(async () => {
    await User.deleteMany({});
    await Pet.deleteMany({});
    await Match.deleteMany({});
    await Message.deleteMany({});

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: `gdpr${Date.now()}@example.com`,
        password: 'Test123!@#',
        firstName: 'GDPR',
        lastName: 'Test',
        dateOfBirth: '1990-01-01'
      });

    testUser = res.body.data.user;
    testToken = res.body.data.accessToken;

    // Create test data
    await request(app)
      .post('/api/pets')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        name: 'TestPet',
        species: 'dog',
        breed: 'Labrador',
        age: 2,
        gender: 'male',
        size: 'large',
        intent: 'playdate'
      });
  });

  describe('POST /api/gdpr/export', () => {
    it('should export user data (200)', async () => {
      const res = await request(app)
        .post('/api/gdpr/export')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('exportDate');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data).toHaveProperty('pets');
      expect(res.body.data).toHaveProperty('matches');
      expect(res.body.data).toHaveProperty('messages');
      expect(res.body.data).toHaveProperty('metadata');
    });

    it('should include all user information', async () => {
      const res = await request(app)
        .post('/api/gdpr/export')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res.body.data.user).toHaveProperty('email');
      expect(res.body.data.user).toHaveProperty('name');
      expect(res.body.data.user).toHaveProperty('preferences');
    });

    it('should reject without authentication (401)', async () => {
      await request(app)
        .post('/api/gdpr/export')
        .expect(401);
    });
  });

  describe('POST /api/gdpr/delete', () => {
    it('should require confirmation text (400)', async () => {
      const res = await request(app)
        .post('/api/gdpr/delete')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          confirmation: 'WRONG_TEXT'
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should delete user account with correct confirmation (200)', async () => {
      const res = await request(app)
        .post('/api/gdpr/delete')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          confirmation: 'DELETE_MY_DATA',
          reason: 'Testing deletion'
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.deletedData).toBeDefined();

      // Verify user is deleted
      const user = await User.findById(testUser._id);
      expect(user).toBeNull();
    });

    it('should delete all user pets', async () => {
      await request(app)
        .post('/api/gdpr/delete')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          confirmation: 'DELETE_MY_DATA'
        })
        .expect(200);

      const pets = await Pet.find({ owner: testUser._id });
      expect(pets).toHaveLength(0);
    });
  });

  describe('GET /api/gdpr/status', () => {
    it('should return GDPR status (200)', async () => {
      const res = await request(app)
        .get('/api/gdpr/status')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('dataSummary');
      expect(res.body.data).toHaveProperty('rights');
      expect(res.body.data).toHaveProperty('privacySettings');
    });
  });

  describe('PUT /api/gdpr/privacy-settings', () => {
    it('should update privacy settings (200)', async () => {
      const res = await request(app)
        .put('/api/gdpr/privacy-settings')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          dataProcessing: true,
          marketing: false,
          analytics: true
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.privacySettings).toHaveProperty('dataProcessing', true);
      expect(res.body.data.privacySettings).toHaveProperty('marketing', false);
    });

    it('should reject invalid data (400)', async () => {
      const res = await request(app)
        .put('/api/gdpr/privacy-settings')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          dataProcessing: 'not-a-boolean'
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });
});
```

---

## 🎨 Frontend Component Tests

### Template 3: SwipeCard Component Test

Create: `apps/web/src/components/Pet/__tests__/SwipeCard.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SwipeCard } from '../SwipeCard';

const mockPet = {
  _id: 'pet-123',
  name: 'Buddy',
  species: 'dog',
  breed: 'Golden Retriever',
  age: 3,
  gender: 'male',
  size: 'large',
  photos: ['https://example.com/photo1.jpg'],
  description: 'Friendly and energetic dog',
  location: {
    coordinates: [-74.006, 40.7128],
    address: { city: 'New York', state: 'NY' }
  },
  owner: {
    _id: 'owner-123',
    name: 'John Doe'
  }
};

const mockOnSwipe = jest.fn();
const mockOnLike = jest.fn();
const mockOnPass = jest.fn();

describe('SwipeCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render pet information', () => {
    render(
      <SwipeCard
        pet={mockPet}
        onSwipe={mockOnSwipe}
        onLike={mockOnLike}
        onPass={mockOnPass}
      />
    );

    expect(screen.getByText('Buddy')).toBeInTheDocument();
    expect(screen.getByText(/Golden Retriever/i)).toBeInTheDocument();
    expect(screen.getByText(/3 years old/i)).toBeInTheDocument();
  });

  it('should display pet photo', () => {
    render(<SwipeCard pet={mockPet} onSwipe={mockOnSwipe} />);

    const image = screen.getByRole('img', { name: /Buddy/i });
    expect(image).toHaveAttribute('src', mockPet.photos[0]);
  });

  it('should handle like button click', async () => {
    const user = userEvent.setup();
    render(<SwipeCard pet={mockPet} onLike={mockOnLike} />);

    const likeButton = screen.getByRole('button', { name: /like/i });
    await user.click(likeButton);

    expect(mockOnLike).toHaveBeenCalledWith(mockPet);
  });

  it('should handle pass button click', async () => {
    const user = userEvent.setup();
    render(<SwipeCard pet={mockPet} onPass={mockOnPass} />);

    const passButton = screen.getByRole('button', { name: /pass/i });
    await user.click(passButton);

    expect(mockOnPass).toHaveBeenCalledWith(mockPet);
  });

  it('should handle swipe gestures', async () => {
    render(<SwipeCard pet={mockPet} onSwipe={mockOnSwipe} />);

    const card = screen.getByTestId('swipe-card');
    
    // Simulate swipe right
    fireEvent.touchStart(card, { touches: [{ clientX: 100, clientY: 100 }] });
    fireEvent.touchMove(card, { touches: [{ clientX: 300, clientY: 100 }] });
    fireEvent.touchEnd(card);

    await waitFor(() => {
      expect(mockOnSwipe).toHaveBeenCalledWith('like', mockPet);
    });
  });

  it('should show distance information', () => {
    render(<SwipeCard pet={mockPet} onSwipe={mockOnSwipe} />);

    expect(screen.getByText(/New York, NY/i)).toBeInTheDocument();
  });

  it('should handle keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<SwipeCard pet={mockPet} onLike={mockOnLike} onPass={mockOnPass} />);

    const card = screen.getByTestId('swipe-card');
    card.focus();

    // Press right arrow for like
    await user.keyboard('{ArrowRight}');
    expect(mockOnLike).toHaveBeenCalled();

    // Press left arrow for pass
    await user.keyboard('{ArrowLeft}');
    expect(mockOnPass).toHaveBeenCalled();
  });

  it('should display compatibility score if provided', () => {
    const petWithScore = { ...mockPet, compatibilityScore: 85 };
    render(<SwipeCard pet={petWithScore} onSwipe={mockOnSwipe} />);

    expect(screen.getByText(/85% match/i)).toBeInTheDocument();
  });
});
```

### Template 4: ChatHeader Component Test

Create: `apps/web/src/components/Chat/__tests__/ChatHeader.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatHeader } from '../ChatHeader';

const mockMatch = {
  _id: 'match-123',
  pet1: {
    _id: 'pet-1',
    name: 'Buddy',
    photos: ['https://example.com/buddy.jpg']
  },
  pet2: {
    _id: 'pet-2',
    name: 'Max',
    photos: ['https://example.com/max.jpg']
  },
  user1: {
    _id: 'user-1',
    name: 'John'
  },
  user2: {
    _id: 'user-2',
    name: 'Jane',
    isOnline: true
  }
};

const mockOnBack = jest.fn();
const mockOnBlock = jest.fn();
const mockOnReport = jest.fn();

describe('ChatHeader Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display match information', () => {
    render(
      <ChatHeader
        match={mockMatch}
        currentUserId="user-1"
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText('Max')).toBeInTheDocument();
    expect(screen.getByText('Jane')).toBeInTheDocument();
  });

  it('should show online status', () => {
    render(
      <ChatHeader
        match={mockMatch}
        currentUserId="user-1"
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText(/online/i)).toBeInTheDocument();
  });

  it('should handle back navigation', async () => {
    const user = userEvent.setup();
    render(
      <ChatHeader
        match={mockMatch}
        currentUserId="user-1"
        onBack={mockOnBack}
      />
    );

    const backButton = screen.getByRole('button', { name: /back/i });
    await user.click(backButton);

    expect(mockOnBack).toHaveBeenCalled();
  });

  it('should show action menu', async () => {
    const user = userEvent.setup();
    render(
      <ChatHeader
        match={mockMatch}
        currentUserId="user-1"
        onBlock={mockOnBlock}
        onReport={mockOnReport}
      />
    );

    const menuButton = screen.getByRole('button', { name: /menu/i });
    await user.click(menuButton);

    expect(screen.getByText(/block/i)).toBeInTheDocument();
    expect(screen.getByText(/report/i)).toBeInTheDocument();
  });

  it('should handle block action', async () => {
    const user = userEvent.setup();
    render(
      <ChatHeader
        match={mockMatch}
        currentUserId="user-1"
        onBlock={mockOnBlock}
      />
    );

    const menuButton = screen.getByRole('button', { name: /menu/i });
    await user.click(menuButton);

    const blockButton = screen.getByText(/block/i);
    await user.click(blockButton);

    expect(mockOnBlock).toHaveBeenCalledWith(mockMatch._id);
  });
});
```

---

## 🪝 Hook Tests

### Template 5: useChat Hook Test

Create: `apps/web/src/hooks/__tests__/useChat.test.tsx`

```typescript
import { renderHook, act, waitFor } from '@testing-library/react';
import { useChat } from '../useChat';

// Mock WebSocket
const mockWebSocket = {
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

global.WebSocket = jest.fn(() => mockWebSocket) as any;

describe('useChat Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with empty messages', () => {
    const { result } = renderHook(() => useChat('match-123'));

    expect(result.current.messages).toEqual([]);
    expect(result.current.isConnected).toBe(false);
  });

  it('should connect to WebSocket', async () => {
    const { result } = renderHook(() => useChat('match-123'));

    await waitFor(() => {
      expect(global.WebSocket).toHaveBeenCalled();
    });
  });

  it('should send messages', async () => {
    const { result } = renderHook(() => useChat('match-123'));

    act(() => {
      result.current.sendMessage('Hello!');
    });

    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: 'message',
        content: 'Hello!',
        matchId: 'match-123'
      })
    );
  });

  it('should receive messages', async () => {
    const { result } = renderHook(() => useChat('match-123'));

    const messageEvent = new MessageEvent('message', {
      data: JSON.stringify({
        type: 'message',
        content: 'Hi there!',
        sender: 'user-2'
      })
    });

    act(() => {
      const onMessage = mockWebSocket.addEventListener.mock.calls.find(
        call => call[0] === 'message'
      )?.[1];
      onMessage?.(messageEvent);
    });

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].content).toBe('Hi there!');
    });
  });

  it('should handle typing indicators', async () => {
    const { result } = renderHook(() => useChat('match-123'));

    act(() => {
      result.current.sendTypingIndicator();
    });

    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: 'typing',
        matchId: 'match-123'
      })
    );
  });

  it('should clean up on unmount', () => {
    const { unmount } = renderHook(() => useChat('match-123'));

    unmount();

    expect(mockWebSocket.close).toHaveBeenCalled();
  });
});
```

---

## 🎭 E2E Tests

### Template 6: Premium Subscription Flow

Create: `apps/web/tests/playwright/premium-subscription.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Premium Subscription Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should display premium features', async ({ page }) => {
    await page.goto('/premium');

    await expect(page.locator('h1')).toContainText('Premium');
    await expect(page.locator('[data-testid="feature-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="pricing-cards"]')).toBeVisible();
  });

  test('should initiate Stripe checkout', async ({ page }) => {
    await page.goto('/premium');

    // Click on monthly plan
    await page.click('[data-testid="subscribe-monthly"]');

    // Should redirect to Stripe (or show modal)
    await page.waitForURL(/checkout\.stripe\.com|\/checkout/);
  });

  test('should show premium badge after activation', async ({ page }) => {
    // Assume user has premium
    await page.goto('/dashboard');

    await expect(page.locator('[data-testid="premium-badge"]')).toBeVisible();
    await expect(page.locator('[data-testid="premium-badge"]')).toContainText('Premium');
  });

  test('should unlock advanced filters', async ({ page }) => {
    await page.goto('/discover');

    await page.click('[data-testid="filter-button"]');

    // Premium users should see advanced filters
    await expect(page.locator('[data-testid="breed-filter"]')).toBeVisible();
    await expect(page.locator('[data-testid="personality-filter"]')).toBeVisible();
  });
});
```

---

## 🏭 Test Data Factories

### Template 7: Test Data Factory

Create: `server/tests/factories/testDataFactory.js`

```javascript
const mongoose = require('mongoose');

class TestDataFactory {
  static createUser(overrides = {}) {
    return {
      email: `test${Date.now()}@example.com`,
      password: 'Test123!@#',
      firstName: 'Test',
      lastName: 'User',
      dateOfBirth: '1990-01-01',
      ...overrides
    };
  }

  static createPet(ownerId, overrides = {}) {
    return {
      owner: ownerId,
      name: 'TestPet',
      species: 'dog',
      breed: 'Labrador',
      age: 3,
      gender: 'male',
      size: 'large',
      intent: 'playdate',
      location: {
        type: 'Point',
        coordinates: [-74.006, 40.7128]
      },
      ...overrides
    };
  }

  static createMatch(pet1Id, pet2Id, user1Id, user2Id, overrides = {}) {
    return {
      pet1: pet1Id,
      pet2: pet2Id,
      user1: user1Id,
      user2: user2Id,
      matchType: 'playdate',
      compatibilityScore: 75,
      status: 'active',
      ...overrides
    };
  }

  static createMessage(senderId, receiverId, matchId, overrides = {}) {
    return {
      sender: senderId,
      receiver: receiverId,
      match: matchId,
      content: 'Test message',
      messageType: 'text',
      ...overrides
    };
  }
}

module.exports = TestDataFactory;
```

---

## 🚀 Quick Implementation Checklist

### Day 1-2: Backend Critical Tests
- [ ] Create `ai-endpoints.test.js`
- [ ] Create `gdpr-endpoints.test.js`
- [ ] Create `password-reset.test.js`
- [ ] Create `token-refresh.test.js`
- [ ] Run tests: `cd server && npm test`

### Day 3-4: Frontend Component Tests
- [ ] Create `SwipeCard.test.tsx`
- [ ] Create `ChatHeader.test.tsx`
- [ ] Create `PetCard.test.tsx`
- [ ] Create `MessageInput.test.tsx`
- [ ] Run tests: `cd apps/web && pnpm test`

### Day 5-6: Hook & E2E Tests
- [ ] Create `useChat.test.tsx`
- [ ] Create `useWebSocket.test.tsx`
- [ ] Create `premium-subscription.spec.ts`
- [ ] Create `chat-flow.spec.ts`
- [ ] Run E2E: `cd apps/web && pnpm playwright test`

### Day 7-8: Coverage & Quality
- [ ] Run coverage report: `pnpm test:coverage`
- [ ] Fix failing tests
- [ ] Add missing assertions
- [ ] Document test patterns

---

## 📊 Success Metrics

After implementing these tests, you should achieve:

- ✅ Backend API coverage: 90%+
- ✅ Frontend component coverage: 80%+
- ✅ Hook coverage: 80%+
- ✅ E2E coverage: 80%+
- ✅ Overall coverage: 85%+

---

**Last Updated:** October 8, 2025  
**Next Steps:** Start with Day 1-2 backend tests for immediate impact
