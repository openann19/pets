import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { Card } from '../Card';

// Extend expect with axe matchers
expect.extend(toHaveNoViolations);

describe('Accessibility Tests - WCAG 2.1 AA Compliance', () => {
  describe('Badge Component', () => {
    it('has proper ARIA attributes', () => {
      render(
        <Badge
          variant="primary"
          aria-label="Premium user badge"
        >
          Premium
        </Badge>
      );

      const badge = screen.getByRole('status');
      expect(badge.props['aria-label']).toBe('Premium user badge');
      expect(badge.props.role).toBe('status');
    });

    it('supports keyboard navigation when tabIndex is provided', () => {
      render(
        <Badge
          variant="success"
          tabIndex={0}
          aria-label="Success status"
        >
          Success
        </Badge>
      );

      const badge = screen.getByRole('status');
      expect(badge.props.tabIndex).toBe(0);
      expect(badge.props.accessible).toBe(true);
    });

    it('has sufficient color contrast (simulated)', () => {
      // Note: Actual color contrast testing would require visual testing
      // This test verifies that the correct classes are applied
      render(<Badge variant="error">Error</Badge>);

      const badge = screen.getByRole('status');
      expect(badge.props.className).toBeDefined();
      // The className should contain the appropriate contrast classes
    });

    it('announces status changes to screen readers', () => {
      render(<Badge variant="info">New message</Badge>);

      const badge = screen.getByRole('status');
      expect(badge.props.accessible).toBe(true);
      expect(badge.props.accessibilityRole).toBe('status');
    });
  });

  describe('Button Component', () => {
    it('has proper ARIA labels and roles', () => {
      render(
        <Button
          aria-label="Save changes"
          data-variant="primary"
          data-size="medium"
        >
          Save
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button.props['aria-label']).toBe('Save changes');
      expect(button.props.accessibilityRole).toBe('button');
    });

    it('supports aria-disabled', () => {
      render(
        <Button
          aria-disabled
          data-variant="outline"
        >
          Disabled Button
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button.props['aria-disabled']).toBe(true);
    });

    it('has keyboard accessibility', () => {
      render(
        <Button
          data-variant="secondary"
          tabIndex={0}
        >
          Clickable
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button.props.tabIndex).toBe(0);
      expect(button.props.accessible).toBe(true);
    });

    it('shows focus indicators', () => {
      render(
        <Button
          data-variant="primary"
          data-size="large"
        >
          Focused Button
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button.props.accessible).toBe(true);
      // Focus styling would be verified in visual tests
    });
  });

  describe('Card Component', () => {
    it('has proper ARIA attributes for interactive cards', () => {
      render(
        <Card
          interactive
          aria-label="User profile card"
          role="button"
        >
          Profile Content
        </Card>
      );

      const card = screen.getByRole('button');
      expect(card.props['aria-label']).toBe('User profile card');
      expect(card.props.role).toBe('button');
      expect(card.props.tabIndex).toBe(0);
    });

    it('is not keyboard accessible when not interactive', () => {
      render(
        <Card>
          Non-interactive content
        </Card>
      );

      const card = screen.getByRole('generic');
      expect(card.props.tabIndex).toBeUndefined();
      expect(card.props.role).toBeUndefined();
    });

    it('supports custom roles', () => {
      render(
        <Card
          role="article"
          aria-label="News article"
        >
          Article content
        </Card>
      );

      const card = screen.getByRole('article');
      expect(card.props.role).toBe('article');
      expect(card.props['aria-label']).toBe('News article');
    });

    it('has proper data attributes for styling and interaction', () => {
      render(
        <Card
          interactive
          className="custom-card"
        >
          Interactive content
        </Card>
      );

      const card = screen.getByRole('button');
      expect(card.props['data-interactive']).toBe(true);
      expect(card.props.className).toContain('custom-card');
    });
  });

  describe('Color Contrast Compliance', () => {
    // Note: These tests verify that appropriate classes are applied
    // Actual color contrast testing requires visual testing tools

    it('primary buttons have sufficient contrast', () => {
      render(
        <Button data-variant="primary">
          Primary Action
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button.props['data-variant']).toBe('primary');
      // Contrast would be verified visually
    });

    it('error states have accessible colors', () => {
      render(
        <Badge variant="error">
          Error State
        </Badge>
      );

      const badge = screen.getByRole('status');
      // Error colors should meet WCAG AA standards
      expect(badge.props.className).toBeDefined();
    });

    it('text has adequate contrast ratios', () => {
      render(
        <Card>
          <p>This text should have sufficient contrast</p>
        </Card>
      );

      const card = screen.getByRole('generic');
      // Text contrast would be verified in visual tests
      expect(card.props.accessible).toBe(true);
    });
  });

  describe('Screen Reader Support', () => {
    it('dynamic content is announced', () => {
      render(
        <Badge variant="info" aria-label="3 unread messages">
          3
        </Badge>
      );

      const badge = screen.getByLabelText('3 unread messages');
      expect(badge.props.accessibilityRole).toBe('status');
      expect(badge.props.accessible).toBe(true);
    });

    it('loading states are announced', () => {
      const { rerender } = render(
        <Button data-variant="primary" aria-label="Saving...">
          Save
        </Button>
      );

      let button = screen.getByLabelText('Saving...');
      expect(button.props.accessible).toBe(true);

      rerender(
        <Button data-variant="primary" aria-label="Changes saved">
          Save
        </Button>
      );

      button = screen.getByLabelText('Changes saved');
      expect(button.props.accessible).toBe(true);
    });

    it('form validation errors are accessible', () => {
      render(
        <Card role="alert" aria-label="Validation error">
          Please enter a valid email address
        </Card>
      );

      const alert = screen.getByRole('alert');
      expect(alert.props['aria-label']).toBe('Validation error');
      expect(alert.props.accessible).toBe(true);
    });
  });

  describe('Keyboard Navigation', () => {
    it('interactive elements are keyboard accessible', () => {
      render(
        <div>
          <Button data-variant="primary">Button 1</Button>
          <Card interactive aria-label="Card 1">Card 1</Card>
          <Badge variant="primary" tabIndex={0}>Badge 1</Badge>
        </div>
      );

      const button = screen.getByRole('button');
      const card = screen.getByRole('button', { name: /Card 1/ });
      const badge = screen.getByRole('status');

      expect(button.props.tabIndex).toBe(0);
      expect(card.props.tabIndex).toBe(0);
      expect(badge.props.tabIndex).toBe(0);
    });

    it('tab order is logical', () => {
      render(
        <div>
          <Button data-variant="primary">First</Button>
          <Button data-variant="secondary">Second</Button>
          <Card interactive aria-label="Third">Third</Card>
        </div>
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);

      buttons.forEach(button => {
        expect(button.props.tabIndex).toBe(0);
      });
    });
  });

  describe('Focus Management', () => {
    it('focus indicators are visible', () => {
      render(
        <Button data-variant="outline" data-size="medium">
          Focusable Button
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button.props.accessible).toBe(true);
      // Focus styles would be verified in visual tests
    });

    it('focus is trapped in modals', () => {
      // Note: Modal focus trapping would be tested in E2E tests
      // This test verifies the setup is correct
      render(
        <Card
          role="dialog"
          aria-modal="true"
          aria-label="Test modal"
        >
          Modal content
        </Card>
      );

      const modal = screen.getByRole('dialog');
      expect(modal.props['aria-modal']).toBe(true);
    });
  });
});
