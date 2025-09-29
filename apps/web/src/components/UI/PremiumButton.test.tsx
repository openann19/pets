import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PremiumButton from './PremiumButton';

describe('PremiumButton Component', () => {
  it('renders children correctly', () => {
    render(<PremiumButton>Click me</PremiumButton>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<PremiumButton onClick={handleClick}>Click me</PremiumButton>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies correct variant classes', () => {
    const { rerender } = render(<PremiumButton variant="primary">Primary</PremiumButton>);
    expect(screen.getByText('Primary')).toHaveClass('from-pink-500', 'to-purple-600');

    rerender(<PremiumButton variant="secondary">Secondary</PremiumButton>);
    expect(screen.getByText('Secondary')).toHaveClass('bg-white', 'border-gray-300');

    rerender(<PremiumButton variant="danger">Danger</PremiumButton>);
    expect(screen.getByText('Danger')).toHaveClass('from-red-500', 'to-red-600');
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<PremiumButton size="sm">Small</PremiumButton>);
    expect(screen.getByText('Small')).toHaveClass('px-3', 'py-1.5');

    rerender(<PremiumButton size="md">Medium</PremiumButton>);
    expect(screen.getByText('Medium')).toHaveClass('px-4', 'py-2');

    rerender(<PremiumButton size="lg">Large</PremiumButton>);
    expect(screen.getByText('Large')).toHaveClass('px-6', 'py-3');
  });

  it('shows loading state correctly', () => {
    render(<PremiumButton loading>Loading</PremiumButton>);
    expect(screen.getByText('Loading')).toHaveClass('opacity-0');
  });

  it('is disabled when loading', () => {
    const handleClick = jest.fn();
    render(<PremiumButton loading onClick={handleClick}>Loading</PremiumButton>);

    fireEvent.click(screen.getByText('Loading'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('is disabled when disabled prop is true', () => {
    const handleClick = jest.fn();
    render(<PremiumButton disabled onClick={handleClick}>Disabled</PremiumButton>);

    fireEvent.click(screen.getByText('Disabled'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
