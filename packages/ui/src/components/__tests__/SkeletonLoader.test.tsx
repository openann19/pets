import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { SkeletonLoader } from '../SkeletonLoader';

describe('SkeletonLoader', () => {
  it('renders single skeleton with default props', () => {
    render(<SkeletonLoader />);

    const skeletons = screen.getAllByRole('generic');
    expect(skeletons).toHaveLength(1);

    const skeleton = skeletons[0];
    expect(skeleton.props.style.width).toBe('100%');
    expect(skeleton.props.style.height).toBe(16);
    expect(skeleton.props.style.borderRadius).toBe(8);
  });

  it('renders multiple skeletons with count prop', () => {
    render(<SkeletonLoader count={3} />);

    const skeletons = screen.getAllByRole('generic');
    expect(skeletons).toHaveLength(3);
  });

  it('renders with custom width and height', () => {
    const customWidth = 200;
    const customHeight = 24;
    render(<SkeletonLoader width={customWidth} height={customHeight} />);

    const skeleton = screen.getByRole('generic');
    expect(skeleton.props.style.width).toBe(customWidth);
    expect(skeleton.props.style.height).toBe(customHeight);
  });

  it('renders with custom border radius', () => {
    const customRadius = 12;
    render(<SkeletonLoader radius={customRadius} />);

    const skeleton = screen.getByRole('generic');
    expect(skeleton.props.style.borderRadius).toBe(customRadius);
  });

  it('applies custom className', () => {
    const customClass = 'custom-skeleton';
    render(<SkeletonLoader className={customClass} />);

    const skeleton = screen.getByRole('generic');
    expect(skeleton.props.className).toContain(customClass);
  });

  it('has correct accessibility attributes', () => {
    render(<SkeletonLoader />);

    const skeleton = screen.getByRole('generic');
    expect(skeleton.props.accessibilityRole).toBe('generic');
    expect(skeleton.props['aria-busy']).toBe(true);
    expect(skeleton.props['aria-label']).toBe('Loading...');
  });

  it('applies pulse animation', () => {
    render(<SkeletonLoader />);

    const skeleton = screen.getByRole('generic');
    expect(skeleton.props.className).toContain('animate-pulse');
  });

  it('renders with dark mode compatible colors', () => {
    render(<SkeletonLoader />);

    const skeleton = screen.getByRole('generic');
    expect(skeleton.props.className).toContain('bg-[var(--pm-surface)]');
    expect(skeleton.props.className).toContain('dark:bg-[var(--pm-surface-dark)]');
  });

  it('handles string width values', () => {
    render(<SkeletonLoader width="50%" />);

    const skeleton = screen.getByRole('generic');
    expect(skeleton.props.style.width).toBe('50%');
  });

  it('handles number width values', () => {
    render(<SkeletonLoader width={100} />);

    const skeleton = screen.getByRole('generic');
    expect(skeleton.props.style.width).toBe(100);
  });
});
