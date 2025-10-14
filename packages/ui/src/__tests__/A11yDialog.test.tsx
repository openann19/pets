import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { A11yDialog } from '../components/Dialog/A11yDialog';

// Add jest-axe custom matchers
expect.extend(toHaveNoViolations);

describe('A11yDialog Component', () => {
  // Basic rendering
  test('renders when isOpen is true', () => {
    render(
      <A11yDialog 
        isOpen 
        onClose={() => {}} 
        title="Test Dialog"
      >
        Dialog Content
      </A11yDialog>
    );
    
    expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    expect(screen.getByText('Dialog Content')).toBeInTheDocument();
  });

  test('does not render when isOpen is false', () => {
    render(
      <A11yDialog 
        isOpen={false} 
        onClose={() => {}} 
        title="Test Dialog"
      >
        Dialog Content
      </A11yDialog>
    );
    
    expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument();
  });

  // Accessibility tests
  test('passes basic accessibility checks', async () => {
    const { container } = render(
      <A11yDialog 
        isOpen 
        onClose={() => {}} 
        title="Test Dialog" 
        description="This is a test dialog"
      >
        <p>Dialog content here</p>
        <button>Action Button</button>
      </A11yDialog>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('has proper ARIA attributes', () => {
    render(
      <A11yDialog 
        isOpen 
        onClose={() => {}} 
        title="Test Dialog" 
        description="Dialog description"
      >
        Dialog Content
      </A11yDialog>
    );
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog).toHaveAttribute('aria-describedby');
    
    const labelId = dialog.getAttribute('aria-labelledby');
    const describeId = dialog.getAttribute('aria-describedby');
    
    expect(screen.getByText('Test Dialog')).toHaveAttribute('id', labelId);
    expect(screen.getByText('Dialog description')).toHaveAttribute('id', describeId);
  });

  // Event handling
  test('calls onClose when close button is clicked', async () => {
    const onCloseMock = jest.fn();
    render(
      <A11yDialog 
        isOpen 
        onClose={onCloseMock} 
        title="Test Dialog"
      >
        Dialog Content
      </A11yDialog>
    );
    
    const closeButton = screen.getByLabelText('Close dialog');
    await userEvent.click(closeButton);
    
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  test('calls onClose when Escape key is pressed', () => {
    const onCloseMock = jest.fn();
    render(
      <A11yDialog 
        isOpen 
        onClose={onCloseMock} 
        title="Test Dialog"
        closeOnEsc
      >
        Dialog Content
      </A11yDialog>
    );
    
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
  
  test('does not call onClose when Escape key is pressed and closeOnEsc is false', () => {
    const onCloseMock = jest.fn();
    render(
      <A11yDialog 
        isOpen 
        onClose={onCloseMock} 
        title="Test Dialog"
        closeOnEsc={false}
      >
        Dialog Content
      </A11yDialog>
    );
    
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    expect(onCloseMock).not.toHaveBeenCalled();
  });

  test('calls onClose when clicking outside if closeOnClickOutside is true', () => {
    const onCloseMock = jest.fn();
    render(
      <A11yDialog 
        isOpen 
        onClose={onCloseMock} 
        title="Test Dialog"
        closeOnClickOutside
      >
        Dialog Content
      </A11yDialog>
    );
    
    // Find the overlay element
    const overlay = screen.getByRole('presentation');
    
    // Click on the overlay (outside the dialog)
    fireEvent.click(overlay);
    
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  // Focus management
  test('focuses the close button on open', () => {
    render(
      <A11yDialog 
        isOpen 
        onClose={() => {}} 
        title="Test Dialog"
      >
        Dialog Content
      </A11yDialog>
    );
    
    expect(document.activeElement).toBe(screen.getByLabelText('Close dialog'));
  });

  test('focus trap keeps focus inside dialog when tabbing', async () => {
    render(
      <A11yDialog 
        isOpen 
        onClose={() => {}} 
        title="Test Dialog"
      >
        <button>Button 1</button>
        <button>Button 2</button>
      </A11yDialog>
    );
    
    // Get all focusable elements in dialog
    const closeButton = screen.getByLabelText('Close dialog');
    const button1 = screen.getByText('Button 1');
    const button2 = screen.getByText('Button 2');
    
    // Verify initial focus is on close button
    expect(document.activeElement).toBe(closeButton);
    
    // Tab to button 1
    await userEvent.tab();
    expect(document.activeElement).toBe(button1);
    
    // Tab to button 2
    await userEvent.tab();
    expect(document.activeElement).toBe(button2);
    
    // Tab should loop back to close button
    await userEvent.tab();
    expect(document.activeElement).toBe(closeButton);
    
    // Shift+Tab should go to button 2
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(button2);
  });
});
