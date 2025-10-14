import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { LoadingSpinner } from '../LoadingSpinner';

// Mock expo-linear-gradient if needed
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient'
}));

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toBeTruthy();
    expect(spinner.props.size).toBe(24);
    expect(spinner.props.color).toBe('var(--pm-primary)');
  });

  it('renders with custom size', () => {
    render(<LoadingSpinner size={48} />);

    const spinner = screen.getByRole('status');
    expect(spinner.props.size).toBe(48);
  });

  it('renders with custom color', () => {
    const customColor = '#FF6B6B';
    render(<LoadingSpinner color={customColor} />);

    const spinner = screen.getByRole('status');
    expect(spinner.props.color).toBe(customColor);
  });

  it('renders with custom aria-label', () => {
    const customLabel = 'Custom loading message';
    render(<LoadingSpinner aria-label={customLabel} />);

    const spinner = screen.getByLabelText(customLabel);
    expect(spinner).toBeTruthy();
  });

  it('applies custom className', () => {
    const customClass = 'custom-spinner';
    render(<LoadingSpinner className={customClass} />);

    const spinner = screen.getByRole('status');
    expect(spinner.props.className).toContain(customClass);
  });

  it('has accessible role and aria-label', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole('status');
    expect(spinner.props.accessibilityRole).toBe('status');
    expect(spinner.props['aria-label']).toBe('Loading...');
  });

  it('uses correct animation class', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole('status');
    expect(spinner.props.className).toContain('animate-spin');
  });
});
