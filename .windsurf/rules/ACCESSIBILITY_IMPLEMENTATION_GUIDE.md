---
trigger: manual
description:
globs:
---

## 📢 Screen Reader Optimization

### Semantic HTML Structure
```typescript
// Proper semantic structure
const SemanticLayout = () => (
  <main>
    <header>
      <nav aria-label="Main navigation">
        <ul>
          <li><a href="/swipe">Swipe</a></li>
          <li><a href="/matches">Matches</a></li>
          <li><a href="/chat">Chat</a></li>
        </ul>
      </nav>
    </header>
    
    <section aria-labelledby="pet-profiles-heading">
      <h1 id="pet-profiles-heading">Pet Profiles</h1>
      <div role="region" aria-label="Pet cards">
        {/* Pet cards */}
      </div>
    </section>
    
    <aside aria-label="User actions">
      <button aria-label="Like this pet">❤️</button>
      <button aria-label="Pass on this pet">❌</button>
    </aside>
  </main>
);
```

### Screen Reader Content
```typescript
// Screen reader optimized content
const ScreenReaderOptimizedCard = ({ pet }) => (
  <article>
    {/* Visible content */}
    <div className="pet-card">
      <img 
        src={pet.photo} 
        alt={`${pet.name}, a ${pet.age}-year-old ${pet.breed}`}
      />
      <h2>{pet.name}</h2>
      <p>{pet.breed}</p>
    </div>
    
    {/* Screen reader only content */}
    <div className="sr-only">
      <p>Pet name: {pet.name}</p>
      <p>Age: {pet.age} years old</p>
      <p>Breed: {pet.breed}</p>
      <p>Distance: {pet.distance} kilometers away</p>
      <p>Compatibility: {pet.compatibility}% match</p>
      <p>Personality traits: {pet.traits.join(', ')}</p>
      <p>Health status: {pet.healthStatus}</p>
    </div>
  </article>
);
```

### Live Regions
```typescript
// Live region for dynamic content
const LiveRegion = () => {
  const [announcement, setAnnouncement] = useState('');
  
  const announceMatch = () => {
    setAnnouncement('It\'s a match! You and Fluffy are now connected.');
  };
  
  return (
    <>
      <button onClick={announceMatch}>
        Like Pet
      </button>
      
      {/* Live region for announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
    </>
  );
};
```

---

## ⌨️ Keyboard Navigation

### Focus Management
```typescript
// Custom hook for focus management
const useFocusManagement = () => {
  const focusRef = useRef<HTMLElement>(null);
  
  const focusElement = useCallback(() => {
    focusRef.current?.focus();
  }, []);
  
  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };
    
    container.addEventListener('keydown', handleTabKey);
    
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, []);
  
  return { focusRef, focusElement, trapFocus };
};
```

### Keyboard Event Handling
```typescript
// Comprehensive keyboard navigation
const KeyboardNavigableComponent = () => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        handleClick();
        break;
      case 'Escape':
        event.preventDefault();
        handleClose();
        break;
      case 'ArrowUp':
        event.preventDefault();
        handlePrevious();
        break;
      case 'ArrowDown':
        event.preventDefault();
        handleNext();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        handlePrevious();
        break;
      case 'ArrowRight':
        event.preventDefault();
        handleNext();
        break;
      case 'Home':
        event.preventDefault();
        handleFirst();
        break;
      case 'End':
        event.preventDefault();
        handleLast();
        break;
    }
  };
  
  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      aria-label="Interactive element"
    >
      Content
    </div>
  );
};
```

### Skip Links
```typescript
// Skip navigation links
const SkipLinks = () => (
  <div className="skip-links">
    <a 
      href="#main-content" 
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded"
    >
      Skip to main content
    </a>
    <a 
      href="#navigation" 
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded"
    >
      Skip to navigation
    </a>
  </div>
);
```

---

## 🎨 Color & Contrast

### Color Contrast Validation
```typescript
// Color contrast utility
const useColorContrast = () => {
  const getContrastRatio = (color1: string, color2: string): number => {
    const getLuminance = (color: string): number => {
      const rgb = hexToRgb(color);
      if (!rgb) return 0;
      
      const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  };
  
  const meetsWCAG = (ratio: number, level: 'AA' | 'AAA' = 'AA'): boolean => {
    const requirements = {
      AA: { normal: 4.5, large: 3 },
      AAA: { normal: 7, large: 4.5 }
    };
    
    return ratio >= requirements[level].normal;
  };
  
  return { getContrastRatio, meetsWCAG };
};
```

### Accessible Color Palette
```typescript
// WCAG AA compliant color palette
const ACCESSIBLE_COLORS = {
  // Primary colors with sufficient contrast
  primary: {
    50: '#fdf2f8',   // Contrast: 21:1 with black
    100: '#fce7f3',  // Contrast: 19:1 with black
    500: '#ec4899',  // Contrast: 4.8:1 with white
    600: '#db2777',  // Contrast: 5.2:1 with white
    700: '#be185d',  // Contrast: 6.1:1 with white
  },
  
  // Neutral colors
  neutral: {
    0: '#ffffff',    // Pure white
    100: '#f5f5f5',  // Contrast: 18:1 with black
    500: '#737373',  // Contrast: 4.6:1 with white
    900: '#171717',  // Contrast: 16:1 with white
  },
  
  // Status colors
  success: '#22c55e', // Contrast: 4.8:1 with white
  warning: '#f59e0b', // Contrast: 4.9:1 with white
  error: '#ef4444',   // Contrast: 4.8:1 with white
};
```

### Color Blindness Considerations
```typescript
// Color-blind friendly design
const ColorBlindFriendlyComponent = () => (
  <div className="status-indicators">
    {/* Don't rely solely on color */}
    <div className="status-item">
      <span className="status-icon" aria-label="Success">
        ✅ {/* Green checkmark */}
      </span>
      <span className="status-text">Success</span>
    </div>
    
    <div className="status-item">
      <span className="status-icon" aria-label="Warning">
        ⚠️ {/* Yellow warning */}
      </span>
      <span className="status-text">Warning</span>
    </div>
    
    <div className="status-item">
      <span className="status-icon" aria-label="Error">
        ❌ {/* Red X */}
      </span>
      <span className="status-text">Error</span>
    </div>
  </div>
);
```

---

## 🎯 Focus Management

### Focus Indicators
```css
/* Comprehensive focus styles */
.focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 4px;
}

/* High contrast focus for better visibility */
.high-contrast-focus {
  outline: 3px solid #000000;
  outline-offset: 2px;
  background-color: #ffff00;
  color: #000000;
}

/* Custom focus styles for different elements */
button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
}

input:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-color: #3b82f6;
}

/* Remove default focus for mouse users */
*:focus:not(:focus-visible) {
  outline: none;
}
```

### Focus Trap Implementation
```typescript
// Focus trap hook
const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    
    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };
    
    // Focus first element when trap activates
    firstElement?.focus();
    
    container.addEventListener('keydown', handleTabKey);
    
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);
  
  return containerRef;
};
```

### Focus Restoration
```typescript
// Focus restoration hook
const useFocusRestoration = () => {
  const previousFocusRef = useRef<HTMLElement | null>(null);
  
  const saveFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  }, []);
  
  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, []);
  
  return { saveFocus, restoreFocus };
};
```

---

## 🏷️ ARIA Implementation

### ARIA Labels and Descriptions
```typescript
// Comprehensive ARIA implementation
const AriaOptimizedComponent = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  
  return (
    <div>
      {/* Button with proper ARIA */}
      <button
        aria-expanded={isExpanded}
        aria-controls="dropdown-menu"
        aria-haspopup="true"
        aria-label="Open user menu"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        Menu
      </button>
      
      {/* Dropdown menu */}
      <ul
        id="dropdown-menu"
        role="menu"
        aria-label="User actions"
        aria-hidden={!isExpanded}
      >
        <li role="none">
          <button
            role="menuitem"
            aria-selected={selectedOption === 'profile'}
            onClick={() => setSelectedOption('profile')}
          >
            Profile
          </button>
        </li>
        <li role="none">
          <button
            role="menuitem"
            aria-selected={selectedOption === 'settings'}
            onClick={() => setSelectedOption('settings')}
          >
            Settings
          </button>
        </li>
      </ul>
      
      {/* Form with proper labeling */}
      <form>
        <label htmlFor="email-input">
          Email Address
          <span aria-label="required">*</span>
        </label>
        <input
          id="email-input"
          type="email"
          required
          aria-describedby="email-error email-help"
          aria-invalid={false}
        />
        <div id="email-help" className="help-text">
          We'll never share your email with anyone else.
        </div>
        <div id="email-error" className="error-text" role="alert" aria-live="polite">
          {/* Error messages appear here */}
        </div>
      </form>
    </div>
  );
};
```

### ARIA Live Regions
```typescript
// Live region management
const useLiveRegion = () => {
  const [announcements, setAnnouncements] = useState<string[]>([]);
  
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncements(prev => [...prev, message]);
    
    // Clear announcement after screen reader has time to read it
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(msg => msg !== message));
    }, 1000);
  }, []);
  
  return { announce, announcements };
};

// Usage
const LiveRegionComponent = () => {
  const { announce, announcements } = useLiveRegion();
  
  const handleMatch = () => {
    announce('It\'s a match! You and Fluffy are now connected.', 'assertive');
  };
  
  return (
    <>
      <button onClick={handleMatch}>Like Pet</button>
      
      {/* Live region */}
      <div
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {announcements.map((announcement, index) => (
          <div key={index}>{announcement}</div>
        ))}
      </div>
    </>
  );
};
```

### ARIA States and Properties
```typescript
// Comprehensive ARIA states
const AriaStatesComponent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [value, setValue] = useState(50);
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div>
      {/* Loading state */}
      <button
        aria-busy={isLoading}
        aria-disabled={isLoading}
        onClick={() => setIsLoading(!isLoading)}
      >
        {isLoading ? 'Loading...' : 'Submit'}
      </button>
      
      {/* Checkbox state */}
      <input
        type="checkbox"
        checked={isChecked}
        onChange={(e) => setIsChecked(e.target.checked)}
        aria-checked={isChecked}
        aria-describedby="checkbox-description"
      />
      <div id="checkbox-description">Receive email notifications</div>
      
      {/* Disabled state */}
      <button
        disabled={isDisabled}
        aria-disabled={isDisabled}
        onClick={() => setIsDisabled(!isDisabled)}
      >
        Toggle Disabled
      </button>
      
      {/* Slider with value */}
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-label="Volume level"
        aria-describedby="volume-description"
      />
      <div id="volume-description">Current volume: {value}%</div>
      
      {/* Expandable content */}
      <button
        aria-expanded={isExpanded}
        aria-controls="expandable-content"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? 'Collapse' : 'Expand'} Details
      </button>
      <div
        id="expandable-content"
        aria-hidden={!isExpanded}
        style={{ display: isExpanded ? 'block' : 'none' }}
      >
        Additional content here
      </div>
    </div>
  );
};
```

---

## 📱 Mobile Accessibility

### Touch Accessibility
```typescript
// Touch-accessible component
const TouchAccessibleComponent = () => (
  <div className="touch-accessible-container">
    {/* Minimum 44px touch targets */}
    <button className="touch-target min-h-[44px] min-w-[44px] px-4 py-2">
      Touch me
    </button>
    
    {/* Gesture support with keyboard alternative */}
    <div
      className="swipe-area"
      role="button"
      tabIndex={0}
      aria-label="Swipe left to pass, right to like, or use arrow keys"
      onKeyDown={(e) => {
        switch (e.key) {
          case 'ArrowLeft':
            handlePass();
            break;
          case 'ArrowRight':
            handleLike();
            break;
        }
      }}
    >
      Swipe or use arrow keys
    </div>
    
    {/* Voice control support */}
    <button
      className="voice-accessible"
      aria-label="Like this pet profile"
      onClick={handleLike}
    >
      ❤️ Like
    </button>
  </div>
);
```

### Mobile Screen Reader Optimization
```typescript
// Mobile-optimized screen reader content
const MobileScreenReaderOptimized = ({ pet }) => (
  <div className="mobile-pet-card">
    {/* Visible content */}
    <div className="pet-visual">
      <img 
        src={pet.photo} 
        alt=""
        role="presentation"
      />
      <h2>{pet.name}</h2>
    </div>
    
    {/* Mobile-optimized screen reader content */}
    <div className="sr-only">
      <h3>Pet Profile: {pet.name}</h3>
      <p>This is {pet.name}, a {pet.age}-year-old {pet.breed}.</p>
      <p>Located {pet.distance} kilometers away.</p>
      <p>Compatibility score: {pet.compatibility}% match.</p>
      <p>Personality: {pet.personality.join(', ')}.</p>
      <p>Health status: {pet.healthStatus}.</p>
      <p>Use the like button to express interest, or the pass button to skip.</p>
    </div>
    
    {/* Action buttons with clear labels */}
    <div className="actions" role="group" aria-label="Pet actions">
      <button
        aria-label="Pass on this pet"
        onClick={() => handlePass(pet)}
      >
        ❌ Pass
      </button>
      <button
        aria-label="Super like this pet"
        onClick={() => handleSuperLike(pet)}
      >
        ⭐ Super Like
      </button>
      <button
        aria-label="Like this pet"
        onClick={() => handleLike(pet)}
      >
        ❤️ Like
      </button>
    </div>
  </div>
);
```

---

## 🧪 Testing & Validation

### Accessibility Testing Suite
```typescript
// Comprehensive accessibility tests
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import userEvent from '@testing-library/user-event';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<MyComponent />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('should be keyboard navigable', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    
    const button = screen.getByRole('button', { name: /click me/i });
    await user.tab();
    expect(button).toHaveFocus();
    
    await user.keyboard('{Enter}');
    expect(mockHandler).toHaveBeenCalled();
  });
  
  it('should have proper ARIA labels', () => {
    render(<MyComponent />);
    
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit form/i })).toBeInTheDocument();
  });
  
  it('should announce changes to screen readers', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveTextContent('');
    
    await user.click(screen.getByRole('button', { name: /submit/i }));
    expect(liveRegion).toHaveTextContent('Form submitted successfully');
  });
});
```

### Color Contrast Testing
```typescript
// Color contrast validation
const testColorContrast = () => {
  const testCases = [
    { foreground: '#000000', background: '#ffffff', expected: 21 },
    { foreground: '#333333', background: '#ffffff', expected: 12.63 },
    { foreground: '#666666', background: '#ffffff', expected: 7 },
    { foreground: '#999999', background: '#ffffff', expected: 4.5 },
  ];
  
  testCases.forEach(({ foreground, background, expected }) => {
    const ratio = getContrastRatio(foreground, background);
    expect(ratio).toBeGreaterThanOrEqual(expected);
  });
};
```

### Screen Reader Testing
```typescript
// Screen reader simulation
const testScreenReaderExperience = async () => {
  const { container } = render(<MyComponent />);
  
  // Test that all interactive elements are accessible
  const interactiveElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  interactiveElements.forEach(element => {
    expect(element).toHaveAttribute('aria-label');
  });
  
  // Test that all images have alt text
  const images = container.querySelectorAll('img');
  images.forEach(img => {
    expect(img).toHaveAttribute('alt');
  });
};
```

---

## 🎣 Custom Hooks & Utilities

### useHaptics Hook
```typescript
// Custom haptic feedback hook
const useHaptics = () => {
  const triggerHaptic = useCallback((intensity: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (typeof window === 'undefined') return;
    
    if ('vibrate' in navigator) {
      const patterns = {
        light: [8],
        medium: [15],
        heavy: [25, 10, 15],
      };
      navigator.vibrate(patterns[intensity]);
    }
  }, []);
  
  return { triggerHaptic };
};
```

### useSoundFeedback Hook
```typescript
// Custom sound feedback hook
const useSoundFeedback = () => {
  const triggerSound = useCallback((type: 'hover' | 'press' | 'success' | 'error' = 'press') => {
    if (typeof window === 'undefined') return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      const frequencies = { 
        hover: 800, 
        press: 600, 
        success: 1000, 
        error: 300 
      };
      
      oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.debug('Audio feedback not available');
    }
  }, []);
  
  return { triggerSound };
};
```

### useAccessibility Hook
```typescript
// Comprehensive accessibility hook
const useAccessibility = () => {
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isScreenReader, setIsScreenReader] = useState(false);
  
  useEffect(() => {
    // Check for reduced motion preference
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(reducedMotionQuery.matches);
    
    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };
    
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
    
    // Check for high contrast preference
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(highContrastQuery.matches);
    
    const handleHighContrastChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches);
    };
    
    highContrastQuery.addEventListener('change', handleHighContrastChange);
    
    // Detect screen reader usage (basic detection)
    const isScreenReaderActive = window.navigator.userAgent.includes('NVDA') ||
                                window.navigator.userAgent.includes('JAWS') ||
                                window.navigator.userAgent.includes('VoiceOver');
    setIsScreenReader(isScreenReaderActive);
    
    return () => {
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
      highContrastQuery.removeEventListener('change', handleHighContrastChange);
    };
  }, []);
  
  return {
    isReducedMotion,
    isHighContrast,
    isScreenReader,
  };
};
```

---

## ✅ Implementation Checklist

### Pre-Development Checklist
- [ ] Define accessibility requirements for the component
- [ ] Choose appropriate semantic HTML elements
- [ ] Plan keyboard navigation flow
- [ ] Design focus indicators
- [ ] Plan screen reader announcements
- [ ] Verify color contrast ratios

### Development Checklist
- [ ] Use semantic HTML elements
- [ ] Add proper ARIA labels and descriptions
- [ ] Implement keyboard navigation
- [ ] Add focus management
- [ ] Include screen reader content
- [ ] Test with keyboard only
- [ ] Verify color contrast
- [ ] Add loading and error states
- [ ] Implement live regions for dynamic content

### Testing Checklist
- [ ] Run automated accessibility tests
- [ ] Test with keyboard navigation
- [ ] Test with screen reader
- [ ] Verify color contrast ratios
- [ ] Test with reduced motion preference
- [ ] Test with high contrast preference
- [ ] Test on mobile devices
- [ ] Test with voice control

### Post-Development Checklist
- [ ] Document accessibility features
- [ ] Update component documentation
- [ ] Add accessibility examples
- [ ] Review with accessibility team
- [ ] Conduct user testing with disabled users
- [ ] Monitor accessibility metrics

---

*This accessibility implementation guide ensures that all PawfectMatch Premium components meet WCAG 2.1 AA standards and provide an inclusive experience for all users, regardless of their abilities or the devices they use.*
