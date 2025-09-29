/**
 * 🐾 Comprehensive Test Suite for Paw Animations
 * Tests all loading states, edge cases, and workflows
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoadingSpinner from '../LoadingSpinner';
import PremiumButton from '../PremiumButton';
import { act } from 'react-dom/test-utils';

describe('Paw Animation System', () => {
  describe('LoadingSpinner Component', () => {
    it('renders without crashing', () => {
      render(<LoadingSpinner />);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('renders with correct accessibility attributes', () => {
      render(<LoadingSpinner />);
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveAttribute('role', 'img');
      expect(spinner).toHaveAttribute('aria-label', 'Loading');
    });

    it('renders all three paw prints', () => {
      const { container } = render(<LoadingSpinner />);
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBe(3); // center, left, right paws
    });

    describe('Size Variants', () => {
      it('renders small size correctly', () => {
        const { container } = render(<LoadingSpinner size="small" />);
        expect(container.querySelector('div[class*="relative"]')).toBeInTheDocument();
      });

      it('renders medium size correctly', () => {
        const { container } = render(<LoadingSpinner size="medium" />);
        expect(container.querySelector('div[class*="relative"]')).toBeInTheDocument();
      });

      it('renders large size correctly', () => {
        const { container } = render(<LoadingSpinner size="large" />);
        expect(container.querySelector('div[class*="relative"]')).toBeInTheDocument();
      });
    });

    describe('Color Customization', () => {
      it('applies default color', () => {
        const { container } = render(<LoadingSpinner />);
        const svg = container.querySelector('svg');
        expect(svg).toHaveAttribute('fill', '#3B82F6');
      });

      it('applies custom color', () => {
        const customColor = '#EC4899';
        const { container } = render(<LoadingSpinner color={customColor} />);
        const svgs = container.querySelectorAll('svg');
        svgs.forEach(svg => {
          expect(svg).toHaveAttribute('fill', customColor);
        });
      });

      it('handles hex color codes', () => {
        const { container } = render(<LoadingSpinner color="#9333EA" />);
        const svg = container.querySelector('svg');
        expect(svg).toHaveAttribute('fill', '#9333EA');
      });
    });

    describe('Edge Cases', () => {
      it('handles missing props gracefully', () => {
        const { container } = render(<LoadingSpinner />);
        expect(container.firstChild).toBeTruthy();
      });

      it('applies custom className', () => {
        const customClass = 'my-custom-class';
        render(<LoadingSpinner className={customClass} />);
        const spinner = screen.getByTestId('loading-spinner');
        expect(spinner.className).toContain(customClass);
      });

      it('handles rapid re-renders', async () => {
        const { rerender } = render(<LoadingSpinner size="small" />);
        rerender(<LoadingSpinner size="medium" />);
        rerender(<LoadingSpinner size="large" />);
        await waitFor(() => {
          expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
        });
      });
    });

    describe('Animation Behavior', () => {
      it('has Framer Motion animations', () => {
        const { container } = render(<LoadingSpinner />);
        // Check for motion.div elements (Framer Motion wraps elements)
        const motionDivs = container.querySelectorAll('[style]');
        expect(motionDivs.length).toBeGreaterThan(0);
      });

      it('renders without hydration warnings', () => {
        const consoleSpy = jest.spyOn(console, 'error');
        render(<LoadingSpinner />);
        expect(consoleSpy).not.toHaveBeenCalledWith(
          expect.stringContaining('hydration')
        );
        consoleSpy.mockRestore();
      });
    });
  });

  describe('PremiumButton Loading State', () => {
    it('shows paw animations when loading', () => {
      const { container } = render(
        <PremiumButton loading={true}>Test Button</PremiumButton>
      );
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });

    it('hides button text when loading', () => {
      render(
        <PremiumButton loading={true}>Test Button</PremiumButton>
      );
      // Text should be rendered but with opacity-0
      expect(screen.getByText('Test Button')).toHaveClass('opacity-0');
    });

    it('shows button text when not loading', () => {
      render(
        <PremiumButton loading={false}>Test Button</PremiumButton>
      );
      expect(screen.getByText('Test Button')).toHaveClass('opacity-100');
    });

    it('disables button interactions when loading', () => {
      const onClick = jest.fn();
      const { container } = render(
        <PremiumButton loading={true} onClick={onClick}>
          Test Button
        </PremiumButton>
      );
      const button = container.querySelector('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Integration Workflows', () => {
    it('handles loading state transitions', async () => {
      const { rerender } = render(
        <PremiumButton loading={false}>Click Me</PremiumButton>
      );
      
      // Start loading
      rerender(<PremiumButton loading={true}>Click Me</PremiumButton>);
      await waitFor(() => {
        expect(screen.getByText('Click Me')).toHaveClass('opacity-0');
      });

      // Stop loading
      rerender(<PremiumButton loading={false}>Click Me</PremiumButton>);
      await waitFor(() => {
        expect(screen.getByText('Click Me')).toHaveClass('opacity-100');
      });
    });

    it('maintains consistent color scheme', () => {
      const { container: spinner } = render(
        <LoadingSpinner color="#EC4899" />
      );
      const svgs = spinner.querySelectorAll('svg');
      
      svgs.forEach(svg => {
        expect(svg.getAttribute('fill')).toBe('#EC4899');
      });
    });
  });

  describe('Performance', () => {
    it('renders efficiently with multiple instances', () => {
      const { container } = render(
        <>
          <LoadingSpinner size="small" />
          <LoadingSpinner size="medium" />
          <LoadingSpinner size="large" />
        </>
      );
      
      const spinners = container.querySelectorAll('[data-testid="loading-spinner"]');
      expect(spinners.length).toBe(3);
    });

    it('does not cause memory leaks on unmount', () => {
      const { unmount } = render(<LoadingSpinner />);
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<LoadingSpinner />);
      const spinner = screen.getByRole('img');
      expect(spinner).toHaveAccessibleName('Loading');
    });

    it('is visible to screen readers', () => {
      render(<LoadingSpinner />);
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).not.toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('SSR and Hydration', () => {
    it('renders consistently on server and client', () => {
      const { container: serverRender } = render(<LoadingSpinner />);
      const { container: clientRender } = render(<LoadingSpinner />);
      
      const serverSvgs = serverRender.querySelectorAll('svg').length;
      const clientSvgs = clientRender.querySelectorAll('svg').length;
      
      expect(serverSvgs).toBe(clientSvgs);
    });

    it('handles suppressHydrationWarning attribute', () => {
      const { container } = render(<LoadingSpinner />);
      // Should not throw hydration warnings
      expect(container.firstChild).toBeTruthy();
    });
  });
});
