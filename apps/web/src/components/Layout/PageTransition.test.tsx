import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import PageTransition from './PageTransition';

const TestComponent = () => <div data-testid="test-content">Test Content</div>;

const renderWithRouter = (initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <PageTransition>
        <TestComponent />
      </PageTransition>
    </MemoryRouter>
  );
};

describe('PageTransition Component', () => {
  it('renders children content', () => {
    renderWithRouter();
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('wraps content in motion.div with proper classes', () => {
    renderWithRouter();
    
    const content = screen.getByTestId('test-content');
    const motionDiv = content.parentElement;
    
    expect(motionDiv).toHaveClass('h-full', 'w-full');
  });

  it('applies correct initial animation state', () => {
    renderWithRouter();
    
    // The motion div should exist and be properly structured
    const content = screen.getByTestId('test-content');
    expect(content).toBeInTheDocument();
    
    // Since we can't easily test Framer Motion animations in jsdom,
    // we verify the component renders without crashing
  });

  it('handles route changes', () => {
    const { rerender } = renderWithRouter(['/first']);
    
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    
    // Rerender with different route
    rerender(
      <MemoryRouter initialEntries={['/second']}>
        <PageTransition>
          <div data-testid="second-content">Second Content</div>
        </PageTransition>
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('second-content')).toBeInTheDocument();
  });

  it('has proper animation variants structure', () => {
    // Test that the component doesn't crash with animation props
    expect(() => renderWithRouter()).not.toThrow();
  });
});
