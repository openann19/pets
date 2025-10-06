---
trigger: manual
description:
globs:
---

## 👆 Touch Interface Design

### Touch Target Standards
```css
/* Minimum touch targets - 44px (iOS) / 48dp (Android) */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  padding: 12px; /* Ensures comfortable touch area */
  margin: 8px;   /* Prevents accidental touches */
}

/* Gesture-friendly spacing */
.gesture-area {
  padding: 16px;
  margin: 8px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

/* Button touch optimization */
.touch-button {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 16px; /* Prevents zoom on iOS */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}
```

### Touch Feedback
```typescript
// Haptic feedback implementation
import * as Haptics from 'expo-haptics';

const useHapticFeedback = () => {
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy') => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle[type]);
    } else if (Platform.OS === 'android') {
      // Android haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle[type]);
    }
  }, []);

  return { triggerHaptic };
};

// Usage in components
const TouchButton = () => {
  const { triggerHaptic } = useHapticFeedback();
  
  const handlePress = () => {
    triggerHaptic('medium');
    // Handle button press
  };
  
  return (
    <button
      onTouchStart={handlePress}
      className="touch-button"
    >
      Press me
    </button>
  );
};
```

### Touch Gestures
```typescript
// Comprehensive touch gesture handling
const TouchGestureHandler = () => {
  const [gestureState, setGestureState] = useState({
    isPressed: false,
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });

  const handleTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0];
    setGestureState(prev => ({
      ...prev,
      isPressed: true,
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
    }));
  };

  const handleTouchMove = (event: TouchEvent) => {
    const touch = event.touches[0];
    const deltaX = touch.clientX - gestureState.startX;
    const deltaY = touch.clientY - gestureState.startY;
    
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      setGestureState(prev => ({
        ...prev,
        isDragging: true,
        currentX: touch.clientX,
        currentY: touch.clientY,
      }));
    }
  };

  const handleTouchEnd = () => {
    if (!gestureState.isDragging) {
      // Handle tap
      handleTap();
    } else {
      // Handle drag end
      handleDragEnd();
    }
    
    setGestureState({
      isPressed: false,
      isDragging: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
    });
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="touch-gesture-area"
    >
      Content
    </div>
  );
};
```

---

## ⚡ Performance Optimization

### Mobile Performance Budget
```typescript
// Mobile performance targets
const MOBILE_PERFORMANCE_BUDGET = {
  // Loading performance
  firstContentfulPaint: 1500, // 1.5s
  largestContentfulPaint: 2500, // 2.5s
  firstInputDelay: 100, // 100ms
  
  // Bundle size
  javascript: 200, // 200KB
  css: 50, // 50KB
  images: 500, // 500KB total
  
  // Runtime performance
  frameRate: 60, // 60fps
  memoryUsage: 50, // 50MB
  batteryDrain: 'low', // Minimal battery impact
};
```

### Image Optimization
```typescript
// Mobile-optimized image component
const MobileOptimizedImage = ({ src, alt, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative">
      {/* Placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
      )}
      
      {/* Optimized image */}
      <Image
        src={src}
        alt={alt}
        loading="lazy"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
        sizes="(max-width: 768px) 100vw, 50vw"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`
          transition-opacity duration-300
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
        `}
        {...props}
      />
      
      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <span className="text-gray-500 text-sm">Failed to load</span>
        </div>
      )}
    </div>
  );
};
```

### Lazy Loading
```typescript
// Intersection Observer for lazy loading
const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [hasIntersected, options]);

  return { elementRef, isIntersecting, hasIntersected };
};

// Usage
const LazyComponent = () => {
  const { elementRef, hasIntersected } = useIntersectionObserver();
  
  return (
    <div ref={elementRef}>
      {hasIntersected ? <ExpensiveComponent /> : <Placeholder />}
    </div>
  );
};
```

### Bundle Optimization
```typescript
// Code splitting for mobile
const LazySwipeCard = lazy(() => import('./SwipeCard'));
const LazyChatInterface = lazy(() => import('./ChatInterface'));
const LazyVideoCall = lazy(() => import('./VideoCall'));

// Route-based code splitting
const MobileApp = () => (
  <Router>
    <Suspense fallback={<MobileLoadingSpinner />}>
      <Routes>
        <Route path="/swipe" element={<LazySwipeCard />} />
        <Route path="/chat" element={<LazyChatInterface />} />
        <Route path="/call" element={<LazyVideoCall />} />
      </Routes>
    </Suspense>
  </Router>
);
```

---

## 🤏 Gesture Implementation

### Swipe Gestures
```typescript
// Advanced swipe gesture handler
const useSwipeGesture = (onSwipeLeft?: () => void, onSwipeRight?: () => void) => {
  const [swipeState, setSwipeState] = useState({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    isSwiping: false,
  });

  const handleTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0];
    setSwipeState({
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      isSwiping: false,
    });
  };

  const handleTouchMove = (event: TouchEvent) => {
    const touch = event.touches[0];
    const deltaX = touch.clientX - swipeState.startX;
    const deltaY = touch.clientY - swipeState.startY;
    
    // Determine if this is a swipe (more horizontal than vertical)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      setSwipeState(prev => ({
        ...prev,
        currentX: touch.clientX,
        currentY: touch.clientY,
        isSwiping: true,
      }));
    }
  };

  const handleTouchEnd = () => {
    const deltaX = swipeState.currentX - swipeState.startX;
    const deltaY = swipeState.currentY - swipeState.startY;
    const swipeThreshold = 50;
    
    if (Math.abs(deltaX) > swipeThreshold && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    }
    
    setSwipeState({
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      isSwiping: false,
    });
  };

  return {
    swipeState,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};
```

### Pinch to Zoom
```typescript
// Pinch to zoom gesture
const usePinchGesture = (onZoom?: (scale: number) => void) => {
  const [pinchState, setPinchState] = useState({
    initialDistance: 0,
    currentScale: 1,
    isPinching: false,
  });

  const getDistance = (touches: TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (event: TouchEvent) => {
    if (event.touches.length === 2) {
      const distance = getDistance(event.touches);
      setPinchState({
        initialDistance: distance,
        currentScale: 1,
        isPinching: true,
      });
    }
  };

  const handleTouchMove = (event: TouchEvent) => {
    if (event.touches.length === 2 && pinchState.isPinching) {
      const distance = getDistance(event.touches);
      const scale = distance / pinchState.initialDistance;
      
      setPinchState(prev => ({
        ...prev,
        currentScale: scale,
      }));
      
      onZoom?.(scale);
    }
  };

  const handleTouchEnd = () => {
    setPinchState({
      initialDistance: 0,
      currentScale: 1,
      isPinching: false,
    });
  };

  return {
    pinchState,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};
```

### Pull to Refresh
```typescript
// Pull to refresh implementation
const usePullToRefresh = (onRefresh: () => Promise<void>) => {
  const [refreshState, setRefreshState] = useState({
    isRefreshing: false,
    pullDistance: 0,
    isPulling: false,
  });

  const handleTouchStart = (event: TouchEvent) => {
    if (window.scrollY === 0) {
      setRefreshState(prev => ({
        ...prev,
        isPulling: true,
      }));
    }
  };

  const handleTouchMove = (event: TouchEvent) => {
    if (refreshState.isPulling && window.scrollY === 0) {
      const pullDistance = event.touches[0].clientY;
      setRefreshState(prev => ({
        ...prev,
        pullDistance: Math.min(pullDistance, 100),
      }));
    }
  };

  const handleTouchEnd = async () => {
    if (refreshState.pullDistance > 50) {
      setRefreshState(prev => ({
        ...prev,
        isRefreshing: true,
        isPulling: false,
      }));
      
      await onRefresh();
      
      setRefreshState({
        isRefreshing: false,
        pullDistance: 0,
        isPulling: false,
      });
    } else {
      setRefreshState({
        isRefreshing: false,
        pullDistance: 0,
        isPulling: false,
      });
    }
  };

  return {
    refreshState,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};
```

---

## 📐 Responsive Design Patterns

### Mobile Navigation
```typescript
// Mobile-first navigation component
const MobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      {/* Mobile menu button */}
      <button
        className="md:hidden p-2 rounded-lg"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation menu"
      >
        <MenuIcon className="w-6 h-6" />
      </button>
      
      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu content */}
            <motion.nav
              className="absolute top-0 right-0 w-64 h-full bg-white shadow-xl"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="p-4">
                <button
                  className="mb-4 p-2 rounded-lg"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close navigation menu"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
                
                <nav className="space-y-2">
                  <a href="/swipe" className="block p-3 rounded-lg hover:bg-gray-100">
                    Swipe
                  </a>
                  <a href="/matches" className="block p-3 rounded-lg hover:bg-gray-100">
                    Matches
                  </a>
                  <a href="/chat" className="block p-3 rounded-lg hover:bg-gray-100">
                    Chat
                  </a>
                </nav>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
```

### Bottom Navigation
```typescript
// Mobile bottom navigation
const BottomNavigation = () => {
  const [activeTab, setActiveTab] = useState('swipe');
  
  const tabs = [
    { id: 'swipe', label: 'Swipe', icon: HeartIcon },
    { id: 'matches', label: 'Matches', icon: UserGroupIcon },
    { id: 'chat', label: 'Chat', icon: ChatBubbleLeftRightIcon },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              className={`
                flex-1 flex flex-col items-center justify-center p-2 min-h-[60px]
                ${isActive ? 'text-purple-600' : 'text-gray-500'}
              `}
              onClick={() => setActiveTab(tab.id)}
              aria-label={tab.label}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
```

### Responsive Grid
```css
/* Mobile-first responsive grid */
.responsive-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  padding: 1rem;
}

/* Small phones */
@media (min-width: 375px) {
  .responsive-grid {
    gap: 1.25rem;
    padding: 1.25rem;
  }
}

/* Large phones */
@media (min-width: 414px) {
  .responsive-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    padding: 1.5rem;
  }
}

/* Tablets */
@media (min-width: 768px) {
  .responsive-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    padding: 2rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .responsive-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 2.5rem;
    padding: 2.5rem;
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

---

## 📱 Mobile-Specific Components

### Mobile SwipeCard
```typescript
// Optimized mobile swipe card
const MobileSwipeCard = ({ pet, onSwipeLeft, onSwipeRight, onSwipeUp }) => {
  const { swipeState, handleTouchStart, handleTouchMove, handleTouchEnd } = useSwipeGesture(
    onSwipeLeft,
    onSwipeRight
  );
  
  const { triggerHaptic } = useHapticFeedback();
  
  const handleSwipeUp = () => {
    triggerHaptic('heavy');
    onSwipeUp();
  };
  
  return (
    <div
      className="relative w-full max-w-sm mx-auto bg-white rounded-2xl shadow-lg overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateX(${swipeState.currentX - swipeState.startX}px)`,
        opacity: swipeState.isSwiping ? 0.8 : 1,
      }}
    >
      {/* Pet image */}
      <div className="relative h-96">
        <Image
          src={pet.photos[0]}
          alt={`${pet.name} profile photo`}
          fill
          className="object-cover"
        />
        
        {/* Swipe overlays */}
        {swipeState.isSwiping && (
          <>
            {swipeState.currentX - swipeState.startX > 50 && (
              <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                <span className="text-4xl font-bold text-white">LIKE</span>
              </div>
            )}
            
            {swipeState.currentX - swipeState.startX < -50 && (
              <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                <span className="text-4xl font-bold text-white">PASS</span>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Pet info */}
      <div className="p-4">
        <h3 className="text-xl font-bold">{pet.name}</h3>
        <p className="text-gray-600">{pet.breed}</p>
        <p className="text-sm text-gray-500">{pet.age} years old</p>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-center gap-4 p-4">
        <button
          className="p-3 bg-red-500 text-white rounded-full"
          onClick={() => onSwipeLeft(pet)}
          aria-label="Pass on this pet"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        
        <button
          className="p-3 bg-blue-500 text-white rounded-full"
          onClick={handleSwipeUp}
          aria-label="Super like this pet"
        >
          <StarIcon className="w-6 h-6" />
        </button>
        
        <button
          className="p-3 bg-green-500 text-white rounded-full"
          onClick={() => onSwipeRight(pet)}
          aria-label="Like this pet"
        >
          <HeartIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
```

### Mobile Chat Interface
```typescript
// Mobile-optimized chat interface
const MobileChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Chat header */}
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center">
          <button className="mr-3 p-2 rounded-full hover:bg-gray-100">
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-semibold">Chat with Match</h1>
            <p className="text-sm text-gray-500">Online</p>
          </div>
          <button className="p-2 rounded-full hover:bg-gray-100">
            <PhoneIcon className="w-5 h-5" />
          </button>
        </div>
      </header>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`
                max-w-xs px-4 py-2 rounded-2xl
                ${message.isOwn 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white text-gray-900'
                }
              `}
            >
              {message.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            className="p-2 bg-purple-600 text-white rounded-full"
            disabled={!inputMessage.trim()}
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

## 🧪 Testing & Quality Assurance

### Mobile Testing Checklist
```typescript
// Mobile testing checklist
const MOBILE_TESTING_CHECKLIST = {
  functionality: [
    'All buttons are tappable',
    'Forms work correctly',
    'Navigation functions properly',
    'Gestures work as expected',
    'Offline functionality works',
  ],
  performance: [
    'Page loads within 3 seconds',
    'Animations run at 60fps',
    'Memory usage is reasonable',
    'Battery drain is minimal',
    'Network requests are optimized',
  ],
  usability: [
    'Touch targets are 44px minimum',
    'Text is readable without zoom',
    'Navigation is thumb-friendly',
    'Error states are clear',
    'Loading states provide feedback',
  ],
  accessibility: [
    'Screen reader compatibility',
    'Keyboard navigation works',
    'Color contrast meets standards',
    'Focus indicators are visible',
    'Voice control works',
  ],
};
```

### Mobile-Specific Tests
```typescript
// Mobile-specific test cases
describe('Mobile SwipeCard', () => {
  it('should handle swipe gestures correctly', () => {
    cy.viewport('iphone-x');
    cy.get('[data-testid="swipe-card"]')
      .trigger('touchstart', { touches: [{ clientX: 100, clientY: 100 }] })
      .trigger('touchmove', { touches: [{ clientX: 200, clientY: 100 }] })
      .trigger('touchend');
    
    cy.get('[data-testid="swipe-overlay"]')
      .should('contain', 'LIKE');
  });
  
  it('should have proper touch targets', () => {
    cy.viewport('iphone-x');
    cy.get('[data-testid="action-button"]')
      .should('have.css', 'min-height', '44px')
      .and('have.css', 'min-width', '44px');
  });
  
  it('should work in portrait and landscape', () => {
    // Portrait
    cy.viewport('iphone-x', 'portrait');
    cy.get('[data-testid="swipe-card"]').should('be.visible');
    
    // Landscape
    cy.viewport('iphone-x', 'landscape');
    cy.get('[data-testid="swipe-card"]').should('be.visible');
  });
});
```

### Performance Testing
```typescript
// Mobile performance testing
describe('Mobile Performance', () => {
  it('should load within performance budget', () => {
    cy.viewport('iphone-x');
    cy.lighthouse({
      performance: 80,
      accessibility: 90,
      'best-practices': 85,
      seo: 80,
    });
  });
  
  it('should maintain 60fps during animations', () => {
    cy.viewport('iphone-x');
    cy.get('[data-testid="animated-element"]')
      .trigger('touchstart')
      .should('have.css', 'transform');
  });
  
  it('should handle low network conditions', () => {
    cy.viewport('iphone-x');
    cy.intercept('GET', '/api/**', { delay: 2000 }).as('slowApi');
    cy.visit('/');
    cy.get('[data-testid="loading-spinner"]').should('be.visible');
  });
});
```

---

## 📱 Platform-Specific Optimizations

### iOS Optimizations
```css
/* iOS-specific optimizations */
.ios-optimized {
  /* Prevent text size adjustment */
  -webkit-text-size-adjust: 100%;
  
  /* Smooth scrolling */
  -webkit-overflow-scrolling: touch;
  
  /* Prevent zoom on input focus */
  font-size: 16px;
  
  /* Safe area handling */
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

/* iOS-specific button styles */
.ios-button {
  -webkit-appearance: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
```

### Android Optimizations
```css
/* Android-specific optimizations */
.android-optimized {
  /* Prevent text selection */
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  
  /* Optimize for Android Chrome */
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  
  /* Handle status bar */
  padding-top: var(--status-bar-height);
}

/* Android-specific touch feedback */
.android-touch-feedback {
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
  touch-action: manipulation;
}
```

### PWA Optimizations
```typescript
// Progressive Web App optimizations
const PWA_CONFIG = {
  // Service worker registration
  registerServiceWorker: () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
  },
  
  // Install prompt
  handleInstallPrompt: () => {
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      // Show install button
    });
    
    const installApp = async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        deferredPrompt = null;
      }
    };
    
    return { installApp };
  },
  
  // Offline functionality
  handleOfflineStatus: () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    
    useEffect(() => {
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }, []);
    
    return { isOnline };
  },
};
```

---

*This mobile optimization guide provides comprehensive strategies and implementations for creating world-class mobile experiences. Use these patterns and techniques to ensure your PawfectMatch Premium app delivers exceptional performance and usability across all mobile devices and platforms.*
