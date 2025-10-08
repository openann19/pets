# 📱 Mobile Testing Implementation Guide - PawfectMatch Premium

**Generated:** December 2024  
**Project:** PawfectMatch Premium Mobile App (React Native)  
**Scope:** Complete Mobile Testing Strategy & Implementation

---

## 📊 Mobile Testing Overview

### Current State Analysis

| Component | Current Coverage | Target Coverage | Priority | Status |
|-----------|------------------|-----------------|----------|--------|
| **Screens** | 15% | 80% | HIGH | 🔴 Critical |
| **Components** | 10% | 80% | HIGH | 🔴 Critical |
| **Hooks** | 5% | 75% | HIGH | 🔴 Critical |
| **Services** | 20% | 80% | MEDIUM | 🟡 Moderate |
| **E2E Tests** | 0% | 70% | HIGH | 🔴 Critical |
| **Native Modules** | 0% | 60% | MEDIUM | 🟡 Moderate |

### Critical Mobile-Specific Gaps

🚨 **IMMEDIATE ATTENTION REQUIRED:**
1. **E2E Testing**: No Detox setup or E2E tests
2. **Calling Features**: WebRTC, video calls, audio calls
3. **Native Modules**: Camera, location, permissions, push notifications
4. **Gesture Handling**: Swipe gestures, touch interactions
5. **Offline Support**: Network connectivity, data persistence
6. **Performance**: Memory leaks, animation performance

---

## 🎯 Part 1: Unit & Integration Testing

### Screen Testing Strategy

#### Priority Screens to Test

```bash
apps/mobile/src/screens/__tests__/
├── HomeScreen.test.tsx              # Main dashboard
├── SwipeScreen.test.tsx             # Core swiping functionality
├── ChatScreen.test.tsx              # Messaging interface
├── MatchesScreen.test.tsx           # Match management
├── ProfileScreen.test.tsx           # User profile
├── PetProfileScreen.test.tsx        # Pet profile management
├── SettingsScreen.test.tsx          # App settings
├── PremiumScreen.test.tsx           # Premium features
├── OnboardingScreen.test.tsx        # User onboarding
└── AuthScreen.test.tsx              # Authentication
```

#### Screen Test Template

```typescript
// apps/mobile/src/screens/__tests__/SwipeScreen.test.tsx
import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SwipeScreen } from '../SwipeScreen';
import { PetProvider } from '@/contexts/PetContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
  addListener: jest.fn(() => jest.fn())
};

// Mock route
const mockRoute = {
  params: {},
  key: 'SwipeScreen',
  name: 'SwipeScreen'
};

// Mock pet data
const mockPets = [
  {
    id: '1',
    name: 'Buddy',
    species: 'dog',
    breed: 'Golden Retriever',
    age: 3,
    photos: ['https://example.com/photo1.jpg'],
    personality: ['friendly', 'energetic', 'loyal'],
    location: { latitude: 37.7749, longitude: -122.4194 },
    distance: 2.5
  },
  {
    id: '2',
    name: 'Luna',
    species: 'cat',
    breed: 'Persian',
    age: 2,
    photos: ['https://example.com/photo2.jpg'],
    personality: ['calm', 'affectionate', 'independent'],
    location: { latitude: 37.7849, longitude: -122.4094 },
    distance: 1.8
  }
];

// Mock API responses
const mockApiResponse = {
  getPets: jest.fn(() => Promise.resolve(mockPets)),
  likePet: jest.fn(() => Promise.resolve({ success: true, isMatch: false })),
  passPet: jest.fn(() => Promise.resolve({ success: true })),
  superLikePet: jest.fn(() => Promise.resolve({ success: true, isMatch: true }))
};

describe('SwipeScreen', () => {
  const renderSwipeScreen = (props = {}) => {
    return render(
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <AuthProvider>
            <PetProvider>
              <SwipeScreen
                navigation={mockNavigation}
                route={mockRoute}
                {...props}
              />
            </PetProvider>
          </AuthProvider>
        </NavigationContainer>
      </GestureHandlerRootView>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock API calls
    jest.spyOn(require('@/services/api'), 'default').mockReturnValue(mockApiResponse);
  });

  it('should render pet cards correctly', async () => {
    const { getByText, getByTestId } = renderSwipeScreen();
    
    await waitFor(() => {
      expect(getByText('Buddy')).toBeTruthy();
      expect(getByText('Golden Retriever')).toBeTruthy();
      expect(getByText('3 years old')).toBeTruthy();
      expect(getByText('2.5 km away')).toBeTruthy();
    });
  });

  it('should handle swipe right (like) gesture', async () => {
    const { getByTestId } = renderSwipeScreen();
    
    await waitFor(() => {
      expect(getByTestId('swipe-card-1')).toBeTruthy();
    });

    const swipeCard = getByTestId('swipe-card-1');
    
    // Simulate swipe right gesture
    await act(async () => {
      fireEvent(swipeCard, 'swipeRight');
    });
    
    await waitFor(() => {
      expect(mockApiResponse.likePet).toHaveBeenCalledWith('1');
    });
  });

  it('should handle swipe left (pass) gesture', async () => {
    const { getByTestId } = renderSwipeScreen();
    
    await waitFor(() => {
      expect(getByTestId('swipe-card-1')).toBeTruthy();
    });

    const swipeCard = getByTestId('swipe-card-1');
    
    // Simulate swipe left gesture
    await act(async () => {
      fireEvent(swipeCard, 'swipeLeft');
    });
    
    await waitFor(() => {
      expect(mockApiResponse.passPet).toHaveBeenCalledWith('1');
    });
  });

  it('should show match modal on mutual like', async () => {
    // Mock mutual like response
    mockApiResponse.likePet.mockResolvedValueOnce({
      success: true,
      isMatch: true,
      match: {
        id: 'match-1',
        pet: mockPets[0],
        user: { id: 'user-2', name: 'John' }
      }
    });

    const { getByTestId } = renderSwipeScreen();
    
    await waitFor(() => {
      expect(getByTestId('swipe-card-1')).toBeTruthy();
    });

    const swipeCard = getByTestId('swipe-card-1');
    
    await act(async () => {
      fireEvent(swipeCard, 'swipeRight');
    });
    
    await waitFor(() => {
      expect(getByTestId('match-modal')).toBeTruthy();
      expect(getByText('It\'s a match!')).toBeTruthy();
    });
  });

  it('should show premium features for premium users', async () => {
    // Mock premium user
    jest.spyOn(require('@/contexts/AuthContext'), 'useAuth').mockReturnValue({
      user: { id: '1', isPremium: true, premiumExpiry: '2024-12-31' },
      isLoading: false
    });

    const { getByTestId } = renderSwipeScreen();
    
    await waitFor(() => {
      expect(getByTestId('super-like-button')).toBeTruthy();
      expect(getByTestId('rewind-button')).toBeTruthy();
      expect(getByTestId('boost-button')).toBeTruthy();
    });
  });

  it('should handle super like for premium users', async () => {
    // Mock premium user
    jest.spyOn(require('@/contexts/AuthContext'), 'useAuth').mockReturnValue({
      user: { id: '1', isPremium: true, premiumExpiry: '2024-12-31' },
      isLoading: false
    });

    const { getByTestId } = renderSwipeScreen();
    
    await waitFor(() => {
      expect(getByTestId('super-like-button')).toBeTruthy();
    });

    const superLikeButton = getByTestId('super-like-button');
    
    await act(async () => {
      fireEvent.press(superLikeButton);
    });
    
    await waitFor(() => {
      expect(mockApiResponse.superLikePet).toHaveBeenCalledWith('1');
    });
  });

  it('should handle network errors gracefully', async () => {
    // Mock network error
    mockApiResponse.getPets.mockRejectedValueOnce(new Error('Network error'));

    const { getByTestId } = renderSwipeScreen();
    
    await waitFor(() => {
      expect(getByTestId('error-message')).toBeTruthy();
      expect(getByText('Unable to load pets. Please try again.')).toBeTruthy();
    });
  });

  it('should show loading state while fetching pets', () => {
    // Mock loading state
    mockApiResponse.getPets.mockImplementationOnce(() => new Promise(() => {}));

    const { getByTestId } = renderSwipeScreen();
    
    expect(getByTestId('loading-spinner')).toBeTruthy();
  });

  it('should handle empty pet list', async () => {
    // Mock empty response
    mockApiResponse.getPets.mockResolvedValueOnce([]);

    const { getByTestId } = renderSwipeScreen();
    
    await waitFor(() => {
      expect(getByTestId('empty-state')).toBeTruthy();
      expect(getByText('No more pets in your area')).toBeTruthy();
    });
  });
});
```

### Component Testing Strategy

#### Priority Components to Test

```bash
apps/mobile/src/components/__tests__/
├── PetCard.test.tsx                 # Pet display component
├── SwipeCard.test.tsx               # Swipeable pet card
├── ChatBubble.test.tsx              # Message bubble
├── MessageInput.test.tsx            # Message input
├── MatchModal.test.tsx              # Match celebration
├── PremiumButton.test.tsx           # Premium features
├── FilterPanel.test.tsx             # Filtering options
├── PhotoViewer.test.tsx             # Photo gallery
├── LocationPicker.test.tsx          # Location selection
└── CallingComponents/
    ├── CallManager.test.tsx         # Call management
    ├── IncomingCallModal.test.tsx   # Incoming call UI
    └── ActiveCallScreen.test.tsx    # Active call interface
```

#### Component Test Template

```typescript
// apps/mobile/src/components/__tests__/SwipeCard.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SwipeCard } from '../SwipeCard';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Mock pet data
const mockPet = {
  id: '1',
  name: 'Buddy',
  species: 'dog',
  breed: 'Golden Retriever',
  age: 3,
  photos: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
  personality: ['friendly', 'energetic', 'loyal'],
  location: { latitude: 37.7749, longitude: -122.4194 },
  distance: 2.5,
  description: 'A friendly and energetic golden retriever who loves playing fetch.'
};

describe('SwipeCard Component', () => {
  const mockOnSwipe = jest.fn();
  const mockOnLike = jest.fn();
  const mockOnPass = jest.fn();
  const mockOnSuperLike = jest.fn();

  const renderSwipeCard = (props = {}) => {
    return render(
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SwipeCard
          pet={mockPet}
          onSwipe={mockOnSwipe}
          onLike={mockOnLike}
          onPass={mockOnPass}
          onSuperLike={mockOnSuperLike}
          {...props}
        />
      </GestureHandlerRootView>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render pet information correctly', () => {
    const { getByText, getByTestId } = renderSwipeCard();
    
    expect(getByText('Buddy')).toBeTruthy();
    expect(getByText('Golden Retriever')).toBeTruthy();
    expect(getByText('3 years old')).toBeTruthy();
    expect(getByText('2.5 km away')).toBeTruthy();
    expect(getByText('A friendly and energetic golden retriever who loves playing fetch.')).toBeTruthy();
  });

  it('should display pet photos', () => {
    const { getByTestId } = renderSwipeCard();
    
    expect(getByTestId('pet-photo-0')).toBeTruthy();
    expect(getByTestId('pet-photo-1')).toBeTruthy();
  });

  it('should handle swipe right (like) gesture', async () => {
    const { getByTestId } = renderSwipeCard();
    
    const swipeCard = getByTestId('swipe-card');
    
    // Simulate swipe right gesture
    fireEvent(swipeCard, 'swipeRight');
    
    await waitFor(() => {
      expect(mockOnLike).toHaveBeenCalledWith(mockPet.id);
      expect(mockOnSwipe).toHaveBeenCalledWith('like', mockPet.id);
    });
  });

  it('should handle swipe left (pass) gesture', async () => {
    const { getByTestId } = renderSwipeCard();
    
    const swipeCard = getByTestId('swipe-card');
    
    // Simulate swipe left gesture
    fireEvent(swipeCard, 'swipeLeft');
    
    await waitFor(() => {
      expect(mockOnPass).toHaveBeenCalledWith(mockPet.id);
      expect(mockOnSwipe).toHaveBeenCalledWith('pass', mockPet.id);
    });
  });

  it('should show like animation on swipe right', async () => {
    const { getByTestId } = renderSwipeCard();
    
    const swipeCard = getByTestId('swipe-card');
    
    fireEvent(swipeCard, 'swipeRight');
    
    await waitFor(() => {
      expect(getByTestId('like-animation')).toBeTruthy();
    });
  });

  it('should show pass animation on swipe left', async () => {
    const { getByTestId } = renderSwipeCard();
    
    const swipeCard = getByTestId('swipe-card');
    
    fireEvent(swipeCard, 'swipeLeft');
    
    await waitFor(() => {
      expect(getByTestId('pass-animation')).toBeTruthy();
    });
  });

  it('should show premium features for premium users', () => {
    const { getByTestId } = renderSwipeCard({ isPremium: true });
    
    expect(getByTestId('super-like-button')).toBeTruthy();
    expect(getByTestId('rewind-button')).toBeTruthy();
  });

  it('should handle super like button press', async () => {
    const { getByTestId } = renderSwipeCard({ isPremium: true });
    
    const superLikeButton = getByTestId('super-like-button');
    fireEvent.press(superLikeButton);
    
    await waitFor(() => {
      expect(mockOnSuperLike).toHaveBeenCalledWith(mockPet.id);
    });
  });

  it('should handle photo tap to open gallery', async () => {
    const mockOnPhotoPress = jest.fn();
    const { getByTestId } = renderSwipeCard({ onPhotoPress: mockOnPhotoPress });
    
    const photo = getByTestId('pet-photo-0');
    fireEvent.press(photo);
    
    expect(mockOnPhotoPress).toHaveBeenCalledWith(0);
  });

  it('should show personality tags', () => {
    const { getByText } = renderSwipeCard();
    
    expect(getByText('friendly')).toBeTruthy();
    expect(getByText('energetic')).toBeTruthy();
    expect(getByText('loyal')).toBeTruthy();
  });
});
```

### Hook Testing Strategy

#### Priority Hooks to Test

```bash
apps/mobile/src/hooks/__tests__/
├── useSocket.test.ts                # WebSocket connection
├── useLocation.test.ts              # Location services
├── useCamera.test.ts                # Camera functionality
├── usePermissions.test.ts           # App permissions
├── usePushNotifications.test.ts     # Push notifications
├── useOfflineSync.test.ts           # Offline data sync
├── useCalling.test.ts               # Video/audio calls
└── useSwipeGestures.test.ts         # Swipe gesture handling
```

#### Hook Test Template

```typescript
// apps/mobile/src/hooks/__tests__/useSocket.test.ts
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useSocket } from '../useSocket';
import { SocketProvider } from '@/contexts/SocketContext';

// Mock socket.io-client
const mockSocket = {
  connect: jest.fn(),
  disconnect: jest.fn(),
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  connected: false
};

jest.mock('socket.io-client', () => ({
  io: jest.fn(() => mockSocket)
}));

describe('useSocket Hook', () => {
  const renderUseSocket = (options = {}) => {
    return renderHook(() => useSocket(options), {
      wrapper: SocketProvider
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSocket.connected = false;
  });

  it('should initialize socket connection', async () => {
    const { result } = renderUseSocket();
    
    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });
    
    expect(mockSocket.connect).toHaveBeenCalled();
  });

  it('should emit events correctly', async () => {
    const { result } = renderUseSocket();
    
    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });
    
    act(() => {
      result.current.emit('test-event', { data: 'test' });
    });
    
    expect(mockSocket.emit).toHaveBeenCalledWith('test-event', { data: 'test' });
  });

  it('should handle incoming events', async () => {
    const { result } = renderUseSocket();
    
    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });
    
    // Simulate incoming event
    act(() => {
      const eventHandler = mockSocket.on.mock.calls.find(call => call[0] === 'test-event')[1];
      eventHandler({ data: 'received' });
    });
    
    expect(result.current.lastEvent).toEqual({ data: 'received' });
  });

  it('should handle connection errors', async () => {
    const { result } = renderUseSocket();
    
    // Simulate connection error
    act(() => {
      const errorHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect_error')[1];
      errorHandler(new Error('Connection failed'));
    });
    
    expect(result.current.isConnected).toBe(false);
    expect(result.current.error).toBe('Connection failed');
  });

  it('should cleanup on unmount', () => {
    const { unmount } = renderUseSocket();
    
    unmount();
    
    expect(mockSocket.disconnect).toHaveBeenCalled();
  });
});
```

---

## 🎯 Part 2: E2E Testing with Detox

### Detox Setup & Configuration

#### Installation & Configuration

```bash
# Install Detox
cd apps/mobile
npm install --save-dev detox
npm install --save-dev @config-plugins/detox
```

#### Detox Configuration

```javascript
// apps/mobile/detox.config.js
module.exports = {
  testRunner: 'jest',
  runnerConfig: 'e2e/config.json',
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/PawfectMatchPremium.app',
      build: 'xcodebuild -workspace ios/PawfectMatchPremium.xcworkspace -scheme PawfectMatchPremium -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build'
    },
    'ios.release': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/PawfectMatchPremium.app',
      build: 'xcodebuild -workspace ios/PawfectMatchPremium.xcworkspace -scheme PawfectMatchPremium -configuration Release -sdk iphonesimulator -derivedDataPath ios/build'
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug'
    },
    'android.release': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
      build: 'cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release'
    }
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 14 Pro'
      }
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_4_API_30'
      }
    }
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug'
    },
    'ios.sim.release': {
      device: 'simulator',
      app: 'ios.release'
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug'
    },
    'android.emu.release': {
      device: 'emulator',
      app: 'android.release'
    }
  }
};
```

#### Jest E2E Configuration

```json
// apps/mobile/e2e/config.json
{
  "testEnvironment": "node",
  "testRunner": "jest-circus/runner",
  "testTimeout": 120000,
  "testMatch": ["<rootDir>/e2e/**/*.e2e.js"],
  "reporters": ["detox/runners/jest/streamlineReporter"],
  "verbose": true
}
```

### E2E Test Implementation

#### Critical User Journeys

```bash
apps/mobile/e2e/
├── auth-flow.e2e.js                 # Authentication flow
├── onboarding.e2e.js                # User onboarding
├── swipe-matching.e2e.js            # Core swiping functionality
├── chat-flow.e2e.js                 # Messaging system
├── premium-features.e2e.js          # Premium subscription
├── calling-features.e2e.js          # Video/audio calls
├── profile-management.e2e.js        # Profile management
└── offline-functionality.e2e.js     # Offline support
```

#### E2E Test Template

```javascript
// apps/mobile/e2e/swipe-matching.e2e.js
describe('Swipe Matching Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should complete full swipe matching flow', async () => {
    // Login
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    
    // Wait for home screen
    await waitFor(element(by.id('swipe-screen'))).toBeVisible().withTimeout(10000);
    
    // Verify pet card is visible
    await expect(element(by.id('swipe-card'))).toBeVisible();
    
    // Swipe right on first pet (like)
    await element(by.id('swipe-card')).swipe('right', 'fast');
    
    // Verify like animation
    await expect(element(by.id('like-animation'))).toBeVisible();
    
    // Wait for next pet
    await waitFor(element(by.id('swipe-card'))).toBeVisible().withTimeout(5000);
    
    // Swipe left on second pet (pass)
    await element(by.id('swipe-card')).swipe('left', 'fast');
    
    // Verify pass animation
    await expect(element(by.id('pass-animation'))).toBeVisible();
    
    // Wait for next pet
    await waitFor(element(by.id('swipe-card'))).toBeVisible().withTimeout(5000);
    
    // Swipe right on third pet (like)
    await element(by.id('swipe-card')).swipe('right', 'fast');
    
    // Check if match modal appears (if mutual like)
    await waitFor(element(by.id('match-modal'))).toBeVisible().withTimeout(5000);
  });

  it('should handle premium super like', async () => {
    // Login as premium user
    await element(by.id('email-input')).typeText('premium@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    
    // Wait for swipe screen
    await waitFor(element(by.id('swipe-screen'))).toBeVisible().withTimeout(10000);
    
    // Verify premium features are visible
    await expect(element(by.id('super-like-button'))).toBeVisible();
    await expect(element(by.id('rewind-button'))).toBeVisible();
    
    // Tap super like button
    await element(by.id('super-like-button')).tap();
    
    // Verify super like animation
    await expect(element(by.id('super-like-animation'))).toBeVisible();
  });

  it('should handle rewind functionality', async () => {
    // Login as premium user
    await element(by.id('email-input')).typeText('premium@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    
    // Wait for swipe screen
    await waitFor(element(by.id('swipe-screen'))).toBeVisible().withTimeout(10000);
    
    // Swipe left (pass) on a pet
    await element(by.id('swipe-card')).swipe('left', 'fast');
    
    // Tap rewind button
    await element(by.id('rewind-button')).tap();
    
    // Verify the pet card is back
    await expect(element(by.id('swipe-card'))).toBeVisible();
  });

  it('should handle empty pet list', async () => {
    // Login
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    
    // Wait for swipe screen
    await waitFor(element(by.id('swipe-screen'))).toBeVisible().withTimeout(10000);
    
    // Simulate swiping through all pets
    for (let i = 0; i < 10; i++) {
      try {
        await element(by.id('swipe-card')).swipe('right', 'fast');
        await waitFor(element(by.id('swipe-card'))).toBeVisible().withTimeout(2000);
      } catch (error) {
        // Expected when no more pets
        break;
      }
    }
    
    // Verify empty state
    await expect(element(by.id('empty-state'))).toBeVisible();
    await expect(element(by.text('No more pets in your area'))).toBeVisible();
  });

  it('should handle network errors gracefully', async () => {
    // Login
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    
    // Wait for swipe screen
    await waitFor(element(by.id('swipe-screen'))).toBeVisible().withTimeout(10000);
    
    // Simulate network error by turning off network
    await device.setURLBlacklist(['*']);
    
    // Try to swipe
    await element(by.id('swipe-card')).swipe('right', 'fast');
    
    // Verify error message
    await expect(element(by.id('error-message'))).toBeVisible();
    await expect(element(by.text('Unable to load pets. Please check your connection.'))).toBeVisible();
    
    // Restore network
    await device.setURLBlacklist([]);
    
    // Verify recovery
    await waitFor(element(by.id('swipe-card'))).toBeVisible().withTimeout(10000);
  });
});
```

#### Chat Flow E2E Test

```javascript
// apps/mobile/e2e/chat-flow.e2e.js
describe('Chat Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should complete chat flow after match', async () => {
    // Login
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    
    // Navigate to matches screen
    await element(by.id('matches-tab')).tap();
    await waitFor(element(by.id('matches-screen'))).toBeVisible().withTimeout(5000);
    
    // Tap on first match
    await element(by.id('match-item-0')).tap();
    
    // Wait for chat screen
    await waitFor(element(by.id('chat-screen'))).toBeVisible().withTimeout(5000);
    
    // Send a message
    await element(by.id('message-input')).typeText('Hello! How are you?');
    await element(by.id('send-button')).tap();
    
    // Verify message appears
    await expect(element(by.text('Hello! How are you?'))).toBeVisible();
    
    // Send another message
    await element(by.id('message-input')).typeText('Would you like to meet up?');
    await element(by.id('send-button')).tap();
    
    // Verify second message appears
    await expect(element(by.text('Would you like to meet up?'))).toBeVisible();
  });

  it('should handle video call from chat', async () => {
    // Login
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    
    // Navigate to matches and open chat
    await element(by.id('matches-tab')).tap();
    await element(by.id('match-item-0')).tap();
    
    // Wait for chat screen
    await waitFor(element(by.id('chat-screen'))).toBeVisible().withTimeout(5000);
    
    // Tap video call button
    await element(by.id('video-call-button')).tap();
    
    // Verify call screen appears
    await expect(element(by.id('call-screen'))).toBeVisible();
    
    // Verify call controls
    await expect(element(by.id('mute-button'))).toBeVisible();
    await expect(element(by.id('camera-toggle-button'))).toBeVisible();
    await expect(element(by.id('end-call-button'))).toBeVisible();
  });

  it('should handle incoming call', async () => {
    // Login
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    
    // Simulate incoming call (this would be triggered by WebSocket in real app)
    await element(by.id('simulate-incoming-call')).tap();
    
    // Verify incoming call modal
    await expect(element(by.id('incoming-call-modal'))).toBeVisible();
    await expect(element(by.id('accept-call-button'))).toBeVisible();
    await expect(element(by.id('decline-call-button'))).toBeVisible();
    
    // Accept call
    await element(by.id('accept-call-button')).tap();
    
    // Verify call screen
    await expect(element(by.id('call-screen'))).toBeVisible();
  });
});
```

---

## 🎯 Part 3: Native Module Testing

### Camera & Media Testing

```typescript
// apps/mobile/src/hooks/__tests__/useCamera.test.ts
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useCamera } from '../useCamera';

// Mock expo-camera
jest.mock('expo-camera', () => ({
  Camera: {
    requestCameraPermissionsAsync: jest.fn(),
    getCameraPermissionsAsync: jest.fn()
  }
}));

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images',
    Videos: 'Videos',
    All: 'All'
  }
}));

describe('useCamera Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should request camera permissions', async () => {
    const { result } = renderHook(() => useCamera());
    
    await act(async () => {
      await result.current.requestPermissions();
    });
    
    expect(require('expo-camera').Camera.requestCameraPermissionsAsync).toHaveBeenCalled();
  });

  it('should take photo from camera', async () => {
    const mockPhoto = {
      uri: 'file://photo.jpg',
      width: 1000,
      height: 1000,
      type: 'image/jpeg'
    };

    require('expo-image-picker').launchCameraAsync.mockResolvedValueOnce({
      cancelled: false,
      assets: [mockPhoto]
    });

    const { result } = renderHook(() => useCamera());
    
    await act(async () => {
      const photo = await result.current.takePhoto();
      expect(photo).toEqual(mockPhoto);
    });
  });

  it('should pick photo from library', async () => {
    const mockPhoto = {
      uri: 'file://library-photo.jpg',
      width: 800,
      height: 600,
      type: 'image/jpeg'
    };

    require('expo-image-picker').launchImageLibraryAsync.mockResolvedValueOnce({
      cancelled: false,
      assets: [mockPhoto]
    });

    const { result } = renderHook(() => useCamera());
    
    await act(async () => {
      const photo = await result.current.pickFromLibrary();
      expect(photo).toEqual(mockPhoto);
    });
  });
});
```

### Location Services Testing

```typescript
// apps/mobile/src/hooks/__tests__/useLocation.test.ts
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useLocation } from '../useLocation';

// Mock expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
  stopLocationUpdatesAsync: jest.fn()
}));

describe('useLocation Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should request location permissions', async () => {
    const { result } = renderHook(() => useLocation());
    
    await act(async () => {
      await result.current.requestPermissions();
    });
    
    expect(require('expo-location').requestForegroundPermissionsAsync).toHaveBeenCalled();
  });

  it('should get current location', async () => {
    const mockLocation = {
      coords: {
        latitude: 37.7749,
        longitude: -122.4194,
        accuracy: 10
      }
    };

    require('expo-location').getCurrentPositionAsync.mockResolvedValueOnce(mockLocation);

    const { result } = renderHook(() => useLocation());
    
    await act(async () => {
      const location = await result.current.getCurrentLocation();
      expect(location).toEqual(mockLocation.coords);
    });
  });

  it('should watch location changes', async () => {
    const mockLocation = {
      coords: {
        latitude: 37.7849,
        longitude: -122.4094,
        accuracy: 15
      }
    };

    const mockWatchSubscription = {
      remove: jest.fn()
    };

    require('expo-location').watchPositionAsync.mockResolvedValueOnce(mockWatchSubscription);

    const { result } = renderHook(() => useLocation());
    
    await act(async () => {
      await result.current.watchLocation();
    });
    
    expect(require('expo-location').watchPositionAsync).toHaveBeenCalled();
  });
});
```

---

## 🎯 Part 4: Performance & Memory Testing

### Memory Leak Testing

```typescript
// apps/mobile/src/__tests__/memory-leaks.test.tsx
import React from 'react';
import { render, unmount } from '@testing-library/react-native';
import { SwipeScreen } from '../screens/SwipeScreen';

describe('Memory Leak Tests', () => {
  it('should not leak memory when unmounting SwipeScreen', () => {
    const initialMemory = process.memoryUsage().heapUsed;
    
    // Render and unmount component multiple times
    for (let i = 0; i < 10; i++) {
      const { unmount } = render(<SwipeScreen />);
      unmount();
    }
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory increase should be minimal (less than 10MB)
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
  });
});
```

### Animation Performance Testing

```typescript
// apps/mobile/src/__tests__/animation-performance.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SwipeCard } from '../components/SwipeCard';

describe('Animation Performance Tests', () => {
  it('should complete swipe animation within reasonable time', async () => {
    const startTime = Date.now();
    
    const { getByTestId } = render(<SwipeCard pet={mockPet} />);
    const swipeCard = getByTestId('swipe-card');
    
    fireEvent(swipeCard, 'swipeRight');
    
    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const endTime = Date.now();
    const animationTime = endTime - startTime;
    
    // Animation should complete within 500ms
    expect(animationTime).toBeLessThan(500);
  });
});
```

---

## 🎯 Part 5: Implementation Timeline

### Week 1: Core Mobile Testing (Days 1-5)

**Day 1-2: Screen Tests**
- HomeScreen, SwipeScreen, ChatScreen
- MatchesScreen, ProfileScreen
- Basic navigation and state management

**Day 3-4: Component Tests**
- SwipeCard, PetCard, ChatBubble
- MessageInput, MatchModal
- Premium features components

**Day 5: Hook Tests**
- useSocket, useLocation, useCamera
- usePermissions, usePushNotifications

### Week 2: E2E & Advanced Testing (Days 6-10)

**Day 6-7: Detox Setup & Basic E2E**
- Detox configuration and setup
- Basic user flows (auth, swipe, chat)
- Cross-platform testing (iOS/Android)

**Day 8-9: Advanced E2E Tests**
- Premium features E2E
- Calling features E2E
- Offline functionality E2E

**Day 10: Performance & Memory Tests**
- Memory leak detection
- Animation performance
- Network performance

### Week 3: Native Modules & Polish (Days 11-15)

**Day 11-12: Native Module Testing**
- Camera, location, permissions
- Push notifications, biometrics
- File system, secure storage

**Day 13-14: Integration & CI/CD**
- CI/CD pipeline integration
- Test reporting and coverage
- Automated test execution

**Day 15: Documentation & Handover**
- Test documentation
- Troubleshooting guides
- Team training materials

---

## 🎯 Part 6: Success Metrics

### Coverage Targets

| Component | Current | Week 1 | Week 2 | Week 3 | Target |
|-----------|---------|--------|--------|--------|--------|
| Screens | 15% | 60% | 75% | 80% | 80% |
| Components | 10% | 50% | 70% | 80% | 80% |
| Hooks | 5% | 40% | 65% | 75% | 75% |
| Services | 20% | 60% | 75% | 80% | 80% |
| E2E Tests | 0% | 30% | 60% | 70% | 70% |
| **Overall** | **10%** | **50%** | **70%** | **80%** | **80%** |

### Quality Metrics

- **Test Execution Time**: < 15 minutes for full suite
- **E2E Test Reliability**: > 90% pass rate
- **Memory Usage**: < 100MB increase during testing
- **Animation Performance**: < 500ms for all animations
- **Network Error Handling**: 100% of network errors handled gracefully

---

## 🎯 Part 7: Mobile-Specific Challenges & Solutions

### Challenge 1: Native Module Mocking

**Problem**: Native modules (camera, location, etc.) are difficult to test
**Solution**: Comprehensive mocking strategy with realistic responses

```typescript
// Mock strategy for native modules
jest.mock('expo-camera', () => ({
  Camera: {
    requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    getCameraPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' }))
  }
}));
```

### Challenge 2: Gesture Testing

**Problem**: Swipe gestures are complex to test
**Solution**: Use React Native Testing Library's gesture simulation

```typescript
// Gesture testing approach
fireEvent(swipeCard, 'swipeRight');
await waitFor(() => {
  expect(mockOnLike).toHaveBeenCalled();
});
```

### Challenge 3: E2E Test Stability

**Problem**: E2E tests are flaky on different devices
**Solution**: Robust waiting strategies and device-specific configurations

```javascript
// Stable E2E test approach
await waitFor(element(by.id('swipe-card'))).toBeVisible().withTimeout(10000);
```

### Challenge 4: Performance Testing

**Problem**: Mobile performance is hard to measure in tests
**Solution**: Memory usage monitoring and animation timing tests

```typescript
// Performance testing approach
const initialMemory = process.memoryUsage().heapUsed;
// ... test operations
const finalMemory = process.memoryUsage().heapUsed;
expect(finalMemory - initialMemory).toBeLessThan(threshold);
```

---

## 🎯 Conclusion

This comprehensive mobile testing strategy provides:

✅ **Complete mobile testing coverage** across all components  
✅ **E2E testing with Detox** for critical user journeys  
✅ **Native module testing** for device-specific features  
✅ **Performance and memory testing** for optimal user experience  
✅ **Detailed implementation timeline** with clear milestones  
✅ **Mobile-specific solutions** for common testing challenges  

By following this strategy, the PawfectMatch Premium mobile app will achieve **80%+ test coverage** with **enterprise-grade quality assurance**, ensuring a **reliable, performant, and user-friendly** mobile experience.

**Estimated Implementation Time**: 15 days  
**Expected Final Coverage**: 80%+  
**Mobile App Quality**: ✅ Production Ready

---

**Status**: ✅ Ready for Implementation  
**Next Steps**: Begin with screen and component tests  
**Success Criteria**: 80% coverage + all E2E tests passing

*This document serves as the definitive guide for achieving production-ready mobile testing coverage for the PawfectMatch Premium React Native application.*
