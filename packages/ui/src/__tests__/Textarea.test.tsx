import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Textarea } from '../components/Textarea/Textarea';

// Add jest-axe custom matchers
expect.extend(toHaveNoViolations);

describe('Textarea Component', () => {
  // Basic rendering
  test('renders correctly with default props', () => {
    render(<Textarea value="" onChange={() => {}} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
  });

  // Value and onChange behavior
  test('updates value when typing', async () => {
    const handleChange = jest.fn();
    render(<Textarea value="" onChange={handleChange} />);
    
    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, 'Hello, world!');
    
    expect(handleChange).toHaveBeenCalledTimes(13); // One call per character
  });

  // Label rendering
  test('displays label when provided', () => {
    render(<Textarea value="" onChange={() => {}} label="Message" />);
    expect(screen.getByText('Message')).toBeInTheDocument();
  });

  // Accessibility tests
  test('passes basic accessibility checks', async () => {
    const { container } = render(
      <Textarea 
        value="Test content" 
        onChange={() => {}} 
        label="Message" 
        helperText="Please enter your message"
      />
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('links label to textarea with matching id', () => {
    render(<Textarea value="" onChange={() => {}} label="Message" />);
    const label = screen.getByText('Message');
    const textarea = screen.getByRole('textbox');
    
    expect(label).toHaveAttribute('for', expect.any(String));
    expect(textarea).toHaveAttribute('id', label.getAttribute('for'));
  });

  test('shows error state correctly', () => {
    render(
      <Textarea 
        value="" 
        onChange={() => {}} 
        label="Message" 
        error 
        errorText="This field is required"
      />
    );
    
    const errorMessage = screen.getByText('This field is required');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveAttribute('role', 'alert');
    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
    expect(textarea).toHaveAttribute('aria-describedby', expect.stringContaining('textarea-error'));
  });

  // Test character count functionality
  test('displays character count when showCharCount is true', () => {
    render(
      <Textarea 
        value="Hello" 
        onChange={() => {}} 
        maxLength={10} 
        showCharCount
      />
    );
    
    expect(screen.getByText(/5\/10/)).toBeInTheDocument();
  });

  // Test word count functionality
  test('displays word count when showWordCount is true', () => {
    render(
      <Textarea 
        value="Hello world" 
        onChange={() => {}} 
        showWordCount
      />
    );
    
    expect(screen.getByText('2 words')).toBeInTheDocument();
  });

  // Test autoGrow functionality
  test('adjusts height when autoGrow is true', async () => {
    const { rerender } = render(
      <Textarea 
        value="" 
        onChange={() => {}} 
        autoGrow 
      />
    );
    
    const textarea = screen.getByRole('textbox');
    const initialHeight = textarea.style.height;
    
    // Re-render with more content
    rerender(
      <Textarea 
        value="Line 1\nLine 2\nLine 3\nLine 4\nLine 5" 
        onChange={() => {}} 
        autoGrow 
      />
    );
    
    // Wait for the debounced resize to occur
    await waitFor(() => {
      expect(textarea.style.height).not.toBe(initialHeight);
    });
  });

  // Test disabled state
  test('has correct attributes when disabled', () => {
    render(<Textarea value="" onChange={() => {}} disabled />);
    const textarea = screen.getByRole('textbox');
    
    expect(textarea).toBeDisabled();
    expect(textarea).toHaveAttribute('aria-disabled', 'true');
  });

  // Test keyboard interaction
  test('can be navigated to with keyboard', async () => {
    render(
      <>
        <button>Before</button>
        <Textarea value="" onChange={() => {}} />
        <button>After</button>
      </>
    );
    
    // Start with focus on the first button
    const beforeButton = screen.getByText('Before');
    beforeButton.focus();
    expect(beforeButton).toHaveFocus();
    
    // Press Tab to move focus to the textarea
    await userEvent.tab();
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveFocus();
    
    // Press Tab again to move focus to the next button
    await userEvent.tab();
    const afterButton = screen.getByText('After');
    expect(afterButton).toHaveFocus();
  });
});
