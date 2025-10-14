import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import TypingIndicator from './TypingIndicator';

describe('TypingIndicator Component', () => {
  it('does not render when not visible', () => {
    const { container } = render(
      <TypingIndicator
        isVisible={false}
        userNames={['John']}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('does not render when no users are typing', () => {
    const { container } = render(
      <TypingIndicator
        isVisible={true}
        userNames={[]}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders single user typing', () => {
    render(
      <TypingIndicator
        isVisible={true}
        userNames={['John']}
      />,
    );

    expect(screen.getByText('John is typing...')).toBeInTheDocument();
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('renders two users typing', () => {
    render(
      <TypingIndicator
        isVisible={true}
        userNames={['John', 'Jane']}
      />,
    );

    expect(screen.getByText('John and Jane are typing...')).toBeInTheDocument();
  });

  it('renders multiple users typing', () => {
    render(
      <TypingIndicator
        isVisible={true}
        userNames={['John', 'Jane', 'Bob']}
      />,
    );

    expect(screen.getByText('John and 2 others are typing...')).toBeInTheDocument();
  });

  it('shows animated dots', () => {
    render(
      <TypingIndicator
        isVisible={true}
        userNames={['John']}
      />,
    );

    // Check that the animated dots are present
    const dots = screen.getAllByTestId('typing-dot');
    expect(dots).toHaveLength(3);
  });

  it('has correct styling classes', () => {
    render(
      <TypingIndicator
        isVisible={true}
        userNames={['John']}
      />,
    );

    const container = screen.getByText('John is typing...').closest('.flex');
    expect(container).toHaveClass('items-center', 'space-x-2', 'px-4', 'py-2');
  });
});
