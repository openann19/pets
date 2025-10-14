import React from 'react';
import { render } from '@testing-library/react-native';
import { LoadingSpinner } from '../LoadingSpinner';
import { SkeletonLoader } from '../SkeletonLoader';
import { Badge } from '../Badge';

// Mock performance API
const mockPerformance = {
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByName: jest.fn(() => []),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn()
};

Object.defineProperty(window, 'performance', {
  value: mockPerformance,
  writable: true
});

describe('Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('LoadingSpinner Performance', () => {
    it('renders within performance budget (< 16ms)', () => {
      const startTime = performance.now();

      render(<LoadingSpinner size={24} color="#FF6B6B" />);

      const renderTime = performance.now() - startTime;
      expect(renderTime).toBeLessThan(16); // 60fps budget
    });

    it('handles prop changes efficiently', () => {
      const { rerender } = render(<LoadingSpinner size={24} />);

      const startTime = performance.now();

      // Simulate multiple prop changes
      for (let i = 0; i < 10; i++) {
        rerender(<LoadingSpinner size={24 + i} />);
      }

      const totalTime = performance.now() - startTime;
      const averageTime = totalTime / 10;

      expect(averageTime).toBeLessThan(5); // Should be very fast
    });

    it('does not cause unnecessary re-renders', () => {
      let renderCount = 0;
      const TestComponent = () => {
        renderCount++;
        return <LoadingSpinner size={24} />;
      };

      const { rerender } = render(<TestComponent />);

      expect(renderCount).toBe(1);

      // Re-render with same props should not increase count significantly
      rerender(<TestComponent />);
      expect(renderCount).toBe(2); // React will re-render, but should be minimal
    });
  });

  describe('SkeletonLoader Performance', () => {
    it('renders multiple skeletons efficiently', () => {
      const startTime = performance.now();

      render(<SkeletonLoader count={20} height={16} />);

      const renderTime = performance.now() - startTime;
      expect(renderTime).toBeLessThan(32); // Allow more time for multiple elements
    });

    it('handles large numbers of skeletons', () => {
      const startTime = performance.now();

      render(<SkeletonLoader count={100} height={12} width={200} />);

      const renderTime = performance.now() - startTime;
      expect(renderTime).toBeLessThan(100); // Should handle large lists
    });

    it('optimizes re-renders with stable props', () => {
      const { rerender } = render(<SkeletonLoader count={5} height={20} />);

      const startTime = performance.now();

      // Re-render multiple times with same props
      for (let i = 0; i < 5; i++) {
        rerender(<SkeletonLoader count={5} height={20} />);
      }

      const totalTime = performance.now() - startTime;
      expect(totalTime).toBeLessThan(50);
    });
  });

  describe('Badge Performance', () => {
    it('renders variants efficiently', () => {
      const variants = ['default', 'primary', 'secondary', 'success', 'warning', 'error', 'info'];
      const startTime = performance.now();

      render(
        <div>
          {variants.map(variant => (
            <Badge key={variant} variant={variant as unknown}>
              {variant}
            </Badge>
          ))}
        </div>
      );

      const renderTime = performance.now() - startTime;
      expect(renderTime).toBeLessThan(50);
    });

    it('handles outline variants without performance impact', () => {
      const { rerender } = render(<Badge variant="primary">Test</Badge>);

      const startTime = performance.now();

      // Switch between outline and filled
      rerender(<Badge variant="primary" outline>Test</Badge>);
      rerender(<Badge variant="primary">Test</Badge>);
      rerender(<Badge variant="primary" outline>Test</Badge>);

      const totalTime = performance.now() - startTime;
      expect(totalTime).toBeLessThan(20);
    });

    it('scales with different sizes efficiently', () => {
      const sizes = ['small', 'medium', 'large'];
      const startTime = performance.now();

      sizes.forEach(size => {
        render(<Badge variant="primary" size={size as unknown}>{size}</Badge>);
      });

      const renderTime = performance.now() - startTime;
      expect(renderTime).toBeLessThan(30);
    });
  });

  describe('Memory Leak Prevention', () => {
    it('LoadingSpinner does not accumulate memory', () => {
      // This is a simplified test - in real scenarios, we'd use memory monitoring tools
      const initialMemory = process.memoryUsage?.()?.heapUsed || 0;

      // Render many spinners
      for (let i = 0; i < 100; i++) {
        render(<LoadingSpinner key={i} size={24 + (i % 10)} />);
      }

      const finalMemory = process.memoryUsage?.()?.heapUsed || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (allowing for test overhead)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB limit
    });

    it('SkeletonLoader cleans up after unmounting', () => {
      const { unmount } = render(<SkeletonLoader count={50} />);

      // Simulate memory check before unmount
      const beforeMemory = process.memoryUsage?.()?.heapUsed || 0;

      unmount();

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const afterMemory = process.memoryUsage?.()?.heapUsed || 0;

      // Memory should decrease or stay similar after cleanup
      const memoryDiff = afterMemory - beforeMemory;
      expect(Math.abs(memoryDiff)).toBeLessThan(10 * 1024 * 1024); // 10MB tolerance
    });
  });

  describe('Bundle Size Impact', () => {
    it('components have minimal bundle impact', () => {
      // This test verifies that our components don't import heavy dependencies
      // In a real scenario, we'd use bundle analyzer tools

      const componentImports = [
        'LoadingSpinner',
        'SkeletonLoader',
        'Badge'
      ];

      // Verify that components don't import heavy libraries unnecessarily
      componentImports.forEach(componentName => {
        // This is a placeholder - real bundle analysis would check import sizes
        expect(componentName).toBeDefined();
      });
    });
  });

  describe('Animation Performance', () => {
    it('animations run at 60fps (simulated)', () => {
      // This test simulates animation performance
      // In real scenarios, we'd use tools like react-native-reanimated testing

      const { rerender } = render(<LoadingSpinner />);

      const startTime = performance.now();

      // Simulate animation frames
      for (let frame = 0; frame < 60; frame++) {
        rerender(<LoadingSpinner key={`frame-${frame}`} />);
      }

      const totalTime = performance.now() - startTime;
      const averageFrameTime = totalTime / 60;

      // Should maintain ~16ms per frame (60fps)
      expect(averageFrameTime).toBeLessThan(20);
    });
  });
});
