import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { ErrorFallback } from '../../components/ErrorFallback';

// Mock dependencies
jest.mock('../../services/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
  }
}));

jest.mock('../../contexts/ThemeContext', () => ({
  useTheme: () => ({
    isDark: false,
    colors: {
      surface: '#FFFFFF',
      surfaceElevated: '#F8F9FA'
    }
  })
}));

describe('Loading and Error States Integration', () => {
  describe('LoadingSpinner Integration', () => {
    it('renders correctly in loading state', () => {
      render(<LoadingSpinner size={32} color="#FF6B6B" aria-label="Loading data..." />);

      const spinner = screen.getByLabelText('Loading data...');
      expect(spinner).toBeTruthy();
      expect(spinner.props.size).toBe(32);
      expect(spinner.props.color).toBe('#FF6B6B');
    });

    it('has proper accessibility attributes', () => {
      render(<LoadingSpinner />);

      const spinner = screen.getByRole('status');
      expect(spinner.props.accessibilityRole).toBe('status');
      expect(spinner.props['aria-label']).toBe('Loading...');
    });
  });

  describe('SkeletonLoader Integration', () => {
    it('renders skeleton placeholders', () => {
      render(
        <SkeletonLoader
          width="80%"
          height={20}
          count={3}
          className="mb-2"
        />
      );

      const skeletons = screen.getAllByRole('generic');
      expect(skeletons).toHaveLength(3);

      skeletons.forEach(skeleton => {
        expect(skeleton.props.style.width).toBe('80%');
        expect(skeleton.props.style.height).toBe(20);
        expect(skeleton.props.className).toContain('mb-2');
        expect(skeleton.props['aria-busy']).toBe(true);
      });
    });

    it('handles different size configurations', () => {
      const { rerender } = render(<SkeletonLoader width={100} height={50} />);

      let skeleton = screen.getByRole('generic');
      expect(skeleton.props.style.width).toBe(100);
      expect(skeleton.props.style.height).toBe(50);

      rerender(<SkeletonLoader width="50%" height={30} />);
      skeleton = screen.getByRole('generic');
      expect(skeleton.props.style.width).toBe('50%');
      expect(skeleton.props.style.height).toBe(30);
    });
  });

  describe('ErrorFallback Integration', () => {
    it('renders error fallback with retry functionality', () => {
      const mockReset = jest.fn();
      const testError = new Error('Test error occurred');

      render(
        <ErrorFallback
          error={testError}
          resetError={mockReset}
        />
      );

      expect(screen.getByText('Something went wrong')).toBeTruthy();
      expect(screen.getByText('Please try again or contact support if the issue persists.')).toBeTruthy();

      const retryButton = screen.getByText('Try Again');
      fireEvent.press(retryButton);
      expect(mockReset).toHaveBeenCalled();
    });

    it('shows error details in development', () => {
      // Mock process.env.NODE_ENV
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const testError = new Error('Detailed error message');
      const mockReset = jest.fn();

      render(
        <ErrorFallback
          error={testError}
          resetError={mockReset}
        />
      );

      // In development, error details should be shown
      expect(screen.getByText('Detailed error message')).toBeTruthy();

      // Restore original env
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Complete Loading Flow', () => {
    it('transitions from loading to content correctly', async () => {
      const { rerender } = render(
        <div>
          <SkeletonLoader testID="skeleton" />
        </div>
      );

      expect(screen.getByTestId('skeleton')).toBeTruthy();

      // Simulate loading completion
      rerender(
        <div>
          <p testID="content">Loaded content</p>
        </div>
      );

      await waitFor(() => {
        expect(screen.getByTestId('content')).toBeTruthy();
        expect(screen.queryByTestId('skeleton')).toBeNull();
      });
    });

    it('handles error states with retry', async () => {
      const mockRetry = jest.fn();
      const { rerender } = render(
        <ErrorFallback
          error={new Error('Network error')}
          resetError={mockRetry}
        />
      );

      expect(screen.getByText('Something went wrong')).toBeTruthy();

      const retryButton = screen.getByText('Try Again');
      fireEvent.press(retryButton);

      expect(mockRetry).toHaveBeenCalled();

      // Simulate successful retry
      rerender(<div testID="success">Content loaded successfully</div>);

      await waitFor(() => {
        expect(screen.getByTestId('success')).toBeTruthy();
      });
    });
  });

  describe('Accessibility Integration', () => {
    it('all loading states are accessible', () => {
      render(
        <div>
          <LoadingSpinner aria-label="Loading messages..." />
          <SkeletonLoader count={2} />
        </div>
      );

      const spinner = screen.getByLabelText('Loading messages...');
      expect(spinner).toBeTruthy();

      const skeletons = screen.getAllByRole('generic');
      skeletons.forEach(skeleton => {
        expect(skeleton.props['aria-busy']).toBe(true);
        expect(skeleton.props['aria-label']).toBe('Loading...');
      });
    });

    it('error states provide clear feedback', () => {
      render(
        <ErrorFallback
          error={new Error('Test error')}
          resetError={() => {}}
        />
      );

      expect(screen.getByText('Something went wrong')).toBeTruthy();
      expect(screen.getByText('Try Again')).toBeTruthy();
      expect(screen.getByRole('button')).toBeTruthy();
    });
  });
});
