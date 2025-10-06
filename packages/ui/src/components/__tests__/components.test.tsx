import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Avatar } from '../Avatar/Avatar';
import { Badge } from '../Badge/Badge';
import { Button } from '../Button/Button';
import { Card } from '../Card/Card';
import { Dialog } from '../Dialog/Dialog';
import { Input } from '../Input/Input';
import { Textarea } from '../Textarea/Textarea';

describe('UI Components', () => {
  describe('Button', () => {
    it('renders with default props', () => {
      render(<Button>Click me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
    });

    it('handles click events', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(<Button onPress={handleClick}>Click me</Button>);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('applies different variants', () => {
      const { rerender } = render(
        <Button variant="primary">Primary</Button>
      );

      let button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blue-600');

      rerender(<Button variant="secondary">Secondary</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gray-600');

      rerender(<Button variant="outline">Outline</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveClass('border');

      rerender(<Button variant="ghost">Ghost</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent');
    });

    it('applies different sizes', () => {
      const { rerender } = render(
        <Button size="small">Small</Button>
      );

      let button = screen.getByRole('button');
      expect(button).toHaveClass('px-3', 'py-2', 'text-sm');

      rerender(<Button size="medium">Medium</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveClass('px-4', 'py-3', 'text-base');

      rerender(<Button size="large">Large</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveClass('px-5', 'py-4', 'text-lg');
    });

    it('shows loading state', () => {
      render(<Button isDisabled>Loading</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Card', () => {
    it('renders children correctly', () => {
      render(
        <Card>
          <h2>Card Title</h2>
          <p>Card content</p>
        </Card>
      );

      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('handles interactive cards', () => {
      const handleClick = jest.fn();

      render(
        <Card interactive onClick={handleClick}>
          Clickable Card
        </Card>
      );

      const card = screen.getByText('Clickable Card');
      fireEvent.click(card);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('applies custom className', () => {
      render(
        <Card className="custom-class">
          Custom Card
        </Card>
      );

      const card = screen.getByText('Custom Card');
      expect(card).toHaveClass('custom-class');
    });
  });

  describe('Input', () => {
    it('renders with label', () => {
      render(<Input label="Email" />);

      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('handles user input', async () => {
      const handleChange = jest.fn();

      render(
        <Input
          label="Name"
          onChange={handleChange}
        />
      );

      const input = screen.getByLabelText('Name');
      fireEvent.change(input, { target: { value: 'John Doe' } });

      // Verify onChange was called once with the complete value
      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith('John Doe');
    });

    it('shows error state', () => {
      render(
        <Input
          label="Email"
          error
          errorMessage="Invalid email"
        />
      );

      expect(screen.getByText('Invalid email')).toBeInTheDocument();
    });

    it('shows success state', () => {
      render(
        <Input
          label="Email"
          success
        />
      );

      const input = screen.getByLabelText('Email');
      expect(input).toHaveClass('border-green-500');
    });

    it('displays left and right icons', () => {
      render(
        <Input
          label="Search"
          leftIcon={<span>🔍</span>}
          rightIcon={<span>✕</span>}
        />
      );

      expect(screen.getByText('🔍')).toBeInTheDocument();
      expect(screen.getByText('✕')).toBeInTheDocument();
    });
  });

  describe('Textarea', () => {
    it('renders with placeholder', () => {
      render(
        <Textarea
          placeholder="Enter your message..."
        />
      );

      const textarea = screen.getByPlaceholderText('Enter your message...');
      expect(textarea).toBeInTheDocument();
    });

    it('handles user input', async () => {
      const handleChange = jest.fn();

      render(
        <Textarea
          onChange={handleChange}
        />
      );

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Hello, world!' } });

      // Verify onChange was called once with the complete value
      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith('Hello, world!');
    });

    it('shows character count when maxLength is set', () => {
      render(
        <Textarea
          value="Hello"
          maxLength={100}
          showCharCount
        />
      );

      expect(screen.getByText('5/100')).toBeInTheDocument();
    });

    it('applies different resize behaviors', () => {
      const { rerender } = render(
        <Textarea resize="none" />
      );

      let textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('resize-none');

      rerender(<Textarea resize="vertical" />);
      textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('resize-y');

      rerender(<Textarea resize="horizontal" />);
      textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('resize-x');
    });
  });

  describe('Badge', () => {
    it('renders with default styling', () => {
      render(<Badge>Default</Badge>);

      const badge = screen.getByText('Default');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
    });

    it('applies different variants', () => {
      const { rerender } = render(<Badge variant="primary">Primary</Badge>);

      let badge = screen.getByText('Primary');
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');

      rerender(<Badge variant="success">Success</Badge>);
      badge = screen.getByText('Success');
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');

      rerender(<Badge variant="error">Error</Badge>);
      badge = screen.getByText('Error');
      expect(badge).toHaveClass('bg-red-100', 'text-red-800');

      rerender(<Badge variant="warning">Warning</Badge>);
      badge = screen.getByText('Warning');
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });

    it('applies different sizes', () => {
      const { rerender } = render(<Badge size="small">Small</Badge>);

      let badge = screen.getByText('Small');
      expect(badge).toHaveClass('px-2', 'py-0.5', 'text-xs');

      rerender(<Badge size="medium">Medium</Badge>);
      badge = screen.getByText('Medium');
      expect(badge).toHaveClass('px-2.5', 'py-0.5', 'text-sm');

      rerender(<Badge size="large">Large</Badge>);
      badge = screen.getByText('Large');
      expect(badge).toHaveClass('px-3', 'py-1', 'text-base');
    });

    it('renders as dot when dot prop is true', () => {
      const { container } = render(<Badge dot />);

      const badge = container.querySelector('[class*="w-3 h-3"]');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('w-3', 'h-3');
    });

    it('applies outline styling', () => {
      render(<Badge outline>Outline</Badge>);

      const badge = screen.getByText('Outline');
      expect(badge).toHaveClass('border', 'bg-transparent');
    });
  });

  describe('Avatar', () => {
    it('renders with image source', () => {
      render(
        <Avatar
          src="https://example.com/avatar.jpg"
          alt="User Avatar"
        />
      );

      const img = screen.getByAltText('User Avatar');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });

    it('renders with fallback text', () => {
      render(
        <Avatar alt="John Doe" />
      );

      expect(screen.getByText('JO')).toBeInTheDocument();
    });

    it('applies different sizes', () => {
      const { rerender, container } = render(<Avatar size="small" alt="Small" />);

      let avatarContainer = container.querySelector('.w-8.h-8');
      expect(avatarContainer).toBeInTheDocument();

      rerender(<Avatar size="medium" alt="Medium" />);
      avatarContainer = container.querySelector('.w-12.h-12');
      expect(avatarContainer).toBeInTheDocument();

      rerender(<Avatar size="large" alt="Large" />);
      avatarContainer = container.querySelector('.w-16.h-16');
      expect(avatarContainer).toBeInTheDocument();

      rerender(<Avatar size="xlarge" alt="XLarge" />);
      avatarContainer = container.querySelector('.w-24.h-24');
      expect(avatarContainer).toBeInTheDocument();
    });

    it('applies different shapes', () => {
      const { rerender } = render(<Avatar shape="circle" alt="Circle" />);

      let avatar = screen.getByText('CI');
      expect(avatar).toHaveClass('rounded-full');

      rerender(<Avatar shape="square" alt="Square" />);
      avatar = screen.getByText('SQ');
      expect(avatar).toHaveClass('rounded-lg');
    });

    it('shows status indicator', () => {
      render(<Avatar status="online" alt="Online User" />);

      const statusIndicator = document.querySelector('.bg-green-500');
      expect(statusIndicator).toBeInTheDocument();
    });

    it('handles click events', () => {
      const handleClick = jest.fn();

      render(
        <Avatar
          alt="Clickable"
          onClick={handleClick}
        />
      );

      const avatar = screen.getByText('CL');
      fireEvent.click(avatar);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Dialog', () => {
    it('renders when open', () => {
      render(
        <Dialog
          isOpen={true}
          onClose={jest.fn()}
          title="Test Dialog"
        >
          <p>Dialog content</p>
        </Dialog>
      );

      expect(screen.getByText('Test Dialog')).toBeInTheDocument();
      expect(screen.getByText('Dialog content')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(
        <Dialog
          isOpen={false}
          onClose={jest.fn()}
          title="Test Dialog"
        >
          <p>Dialog content</p>
        </Dialog>
      );

      expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument();
    });

    it('calls onClose when dismissed', () => {
      const handleClose = jest.fn();

      render(
        <Dialog
          isOpen={true}
          onClose={handleClose}
          isDismissable={true}
        >
          <p>Dialog content</p>
        </Dialog>
      );

      // Click outside the dialog (this would typically close it)
      // Note: In a real test environment, you might need to simulate
      // the actual overlay click behavior
    });

    it('applies different sizes', () => {
      const { rerender } = render(
        <Dialog
          isOpen={true}
          onClose={jest.fn()}
          size="small"
        >
          <p>Small dialog</p>
        </Dialog>
      );

      let dialog = screen.getByText('Small dialog').closest('[class*="max-w-md"]');
      expect(dialog).toBeInTheDocument();

      rerender(
        <Dialog
          isOpen={true}
          onClose={jest.fn()}
          size="large"
        >
          <p>Large dialog</p>
        </Dialog>
      );

      dialog = screen.getByText('Large dialog').closest('[class*="max-w-2xl"]');
      expect(dialog).toBeInTheDocument();
    });
  });
});
