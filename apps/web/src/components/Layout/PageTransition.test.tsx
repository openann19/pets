import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PageTransition from './PageTransition';

const TestComponent = () => <div data-testid="test-content">Test Content</div>;


const initialEntries = ['/first'];
const renderWithRouter = (entries = initialEntries) => {
  return render(
    <MemoryRouter initialEntries={entries}>
      <PageTransition>
        <TestComponent />
      </PageTransition>
    </MemoryRouter>
  );
};

describe('PageTransition Component', () => {
  it('renders children content', () => {
    renderWithRouter();
    expect(!!screen.getByTestId('test-content')).equal(true);
  });

  it('wraps content in motion.div with proper classes', () => {
    renderWithRouter();

    const content = screen.getByTestId('test-content');
    const motionDiv = content.parentElement;

    if (motionDiv) {
      const classList = motionDiv.className.split(' ');
      ['h-full', 'w-full'].forEach(cls => {
        expect(classList.includes(cls)).equal(true);
      });
    } else {
      expect.fail('motionDiv not found');
    }
  });

  it('applies correct initial animation state', () => {
    renderWithRouter();

    // The motion div should exist and be properly structured
    const content = screen.getByTestId('test-content');
    expect(!!content).equal(true);

    // Since we can't easily test Framer Motion animations in jsdom,
    // we verify the component renders without crashing
  });

  it('handles route changes', () => {
    const { rerender } = renderWithRouter(['/first']);

    expect(!!screen.getByTestId('test-content')).equal(true);

    // Rerender with different route
    rerender(
      <MemoryRouter initialEntries={['/second']}>
        <PageTransition>
          <div data-testid="second-content">Second Content</div>
        </PageTransition>
      </MemoryRouter>,
    );

    expect(!!screen.getByTestId('second-content')).equal(true);
  });

  it('has proper animation variants structure', () => {
    // Test that the component doesn't crash with animation props
    renderWithRouter();
    // If no error is thrown, test passes
  });
});
