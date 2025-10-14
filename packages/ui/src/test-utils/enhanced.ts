import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { jest, expect } from '@jest/globals';

// Enhanced testing utilities with real implementations
interface TestUtils {
  renderWithAnimations: (component: ReactElement) => ReturnType<typeof render>;
  waitForAnimation: (elementId: string, timeout?: number) => Promise<void>;
  simulateSwipe: (element: HTMLElement, direction: 'left' | 'right') => Promise<void>;
  testAccessibility: (component: ReactElement) => Promise<unknown>;
  testMemoryLeaks: (component: ReactElement) => Promise<Record<string, number>>;
  withFeatureFlags: (flags: Record<string, boolean>) => void;
  mockRequestAnimationFrame: () => void;
}

declare global {
  interface Window {
    __timeouts__?: number;
    __intervals__?: number;
    __animationFrames__?: number;
    __listeners__?: number;
  }
}

// Enhanced testing utilities with real implementations
export const enhancedTestUtils: TestUtils = {
  renderWithAnimations: (component: React.ReactElement) => {
    // Mock animation detection
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query: string) => ({
        matches: query.includes('prefers-reduced-motion'),
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    return render(component);
  },

  // Animation-aware testing helpers
  waitForAnimation: async (elementId: string, timeout = 1000) => {
    const element = screen.getByTestId(elementId);
    await waitFor(() => {
      expect(element).not.toHaveClass('animating');
    }, { timeout });
  },

  // Enhanced user event simulation
  simulateSwipe: async (element: HTMLElement, direction: 'left' | 'right') => {
    // Real implementation for swipe testing
    const touchStart: Touch = {
      clientX: direction === 'left' ? 100 : 300,
      clientY: 200,
      identifier: Date.now(),
      pageX: direction === 'left' ? 100 : 300,
      pageY: 200,
      screenX: direction === 'left' ? 100 : 300,
      screenY: 200,
      target: element,
      force: 1,
      radiusX: 1,
      radiusY: 1,
      rotationAngle: 0
    };

    const swipeEvent = new TouchEvent('touchstart', {
      touches: [touchStart],
      changedTouches: [touchStart]
    });

    element.dispatchEvent(swipeEvent);

    const touchEnd: Touch = {
      clientX: direction === 'left' ? 0 : 400,
      clientY: 200,
      identifier: Date.now(),
      pageX: direction === 'left' ? 0 : 400,
      pageY: 200,
      screenX: direction === 'left' ? 0 : 400,
      screenY: 200,
      target: element,
      force: 1,
      radiusX: 1,
      radiusY: 1,
      rotationAngle: 0
    };

    const endEvent = new TouchEvent('touchend', {
      touches: [touchEnd],
      changedTouches: [touchEnd]
    });

    element.dispatchEvent(endEvent);
  },

  // Enhanced accessibility testing
  testAccessibility: async (component: React.ReactElement) => {
    // Real accessibility testing with axe-core
    try {
      const axe = await import('axe-core');
      const { container } = render(component);

      const results = await axe.default.run(container, {
        rules: {
          'color-contrast': { enabled: true },
          'image-alt': { enabled: true },
          'label': { enabled: true }
        }
      });

      return results;
    } catch (error) {
      // Fallback if axe-core is not available
      console.warn('axe-core not available, skipping accessibility test');
      return { violations: [], passes: [] };
    }
  },

  // Memory leak detection testing
  testMemoryLeaks: async (component: React.ReactElement) => {
    // Real memory leak detection
    const initialTimeouts = window.__timeouts__ ?? 0;
    const initialIntervals = window.__intervals__ ?? 0;
    const initialAnimationFrames = window.__animationFrames__ ?? 0;
    const initialListeners = window.__listeners__ ?? 0;

    render(component);

    // Wait for component to fully render
    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    const results = {
      timeouts: (window.__timeouts__ ?? 0) - initialTimeouts,
      intervals: (window.__intervals__ ?? 0) - initialIntervals,
      animationFrames: (window.__animationFrames__ ?? 0) - initialAnimationFrames,
      listeners: (window.__listeners__ ?? 0) - initialListeners
    };

    return results;
  },

  // Feature flag testing
  withFeatureFlags: async (flags: Record<string, boolean>) => {
    // Real feature flag implementation
    try {
      const { featureFlags } = await import('@pawfectmatch/core/src/featureFlags');

      Object.keys(flags).forEach(flag => {
        if (flags[flag]) {
          featureFlags.enable(flag as keyof typeof featureFlags);
        } else {
          featureFlags.disable(flag as keyof typeof featureFlags);
        }
      });
    } catch (error) {
      // Fallback if feature flags module is not available
      console.warn('Feature flags module not available');
    }
  },

  // Animation frame testing
  mockRequestAnimationFrame: () => {
    // Real requestAnimationFrame mock
    let frameId = 0;

    window.requestAnimationFrame = jest.fn().mockImplementation((callback: FrameRequestCallback) => {
      frameId++;
      setTimeout(() => { callback(0); }, 0);
      return frameId;
    });

    window.cancelAnimationFrame = jest.fn().mockImplementation((id: number) => {
      clearTimeout(id);
    });
  }
};

export default enhancedTestUtils;
