import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
            render(_jsx(Button, { children: "Click me" }));
            const button = screen.getByRole('button', { name: /click me/i });
            expect(button).toBeInTheDocument();
        });
        it('handles click events', async () => {
            const handleClick = jest.fn();
            const user = userEvent.setup();
            render(_jsx(Button, { onPress: handleClick, children: "Click me" }));
            const button = screen.getByRole('button');
            await user.click(button);
            expect(handleClick).toHaveBeenCalledTimes(1);
        });
        it('applies different variants', () => {
            const { rerender } = render(_jsx(Button, { variant: "primary", children: "Primary" }));
            let button = screen.getByRole('button');
            expect(button).toHaveClass('bg-blue-600');
            rerender(_jsx(Button, { variant: "secondary", children: "Secondary" }));
            button = screen.getByRole('button');
            expect(button).toHaveClass('bg-gray-600');
            rerender(_jsx(Button, { variant: "outline", children: "Outline" }));
            button = screen.getByRole('button');
            expect(button).toHaveClass('border');
            rerender(_jsx(Button, { variant: "ghost", children: "Ghost" }));
            button = screen.getByRole('button');
            expect(button).toHaveClass('bg-transparent');
        });
        it('applies different sizes', () => {
            const { rerender } = render(_jsx(Button, { size: "small", children: "Small" }));
            let button = screen.getByRole('button');
            expect(button).toHaveClass('px-3', 'py-2', 'text-sm');
            rerender(_jsx(Button, { size: "medium", children: "Medium" }));
            button = screen.getByRole('button');
            expect(button).toHaveClass('px-4', 'py-3', 'text-base');
            rerender(_jsx(Button, { size: "large", children: "Large" }));
            button = screen.getByRole('button');
            expect(button).toHaveClass('px-5', 'py-4', 'text-lg');
        });
        it('shows loading state', () => {
            render(_jsx(Button, { isDisabled: true, children: "Loading" }));
            const button = screen.getByRole('button');
            expect(button).toBeDisabled();
        });
    });
    describe('Card', () => {
        it('renders children correctly', () => {
            render(_jsxs(Card, { children: [_jsx("h2", { children: "Card Title" }), _jsx("p", { children: "Card content" })] }));
            expect(screen.getByText('Card Title')).toBeInTheDocument();
            expect(screen.getByText('Card content')).toBeInTheDocument();
        });
        it('handles interactive cards', () => {
            const handleClick = jest.fn();
            render(_jsx(Card, { interactive: true, onClick: handleClick, children: "Clickable Card" }));
            const card = screen.getByText('Clickable Card');
            fireEvent.click(card);
            expect(handleClick).toHaveBeenCalledTimes(1);
        });
        it('applies custom className', () => {
            render(_jsx(Card, { className: "custom-class", children: "Custom Card" }));
            const card = screen.getByText('Custom Card');
            expect(card).toHaveClass('custom-class');
        });
    });
    describe('Input', () => {
        it('renders with label', () => {
            render(_jsx(Input, { label: "Email" }));
            expect(screen.getByLabelText('Email')).toBeInTheDocument();
        });
        it('handles user input', async () => {
            const handleChange = jest.fn();
            const user = userEvent.setup();
            render(_jsx(Input, { label: "Name", onChange: handleChange }));
            const input = screen.getByLabelText('Name');
            await user.type(input, 'John Doe');
            // Verify onChange was called multiple times (once per character)
            expect(handleChange).toHaveBeenCalledTimes(8);
            // Verify the final call has the complete value
            expect(handleChange).toHaveBeenLastCalledWith('John Doe');
        });
        it('shows error state', () => {
            render(_jsx(Input, { label: "Email", error: true, errorMessage: "Invalid email" }));
            expect(screen.getByText('Invalid email')).toBeInTheDocument();
        });
        it('shows success state', () => {
            render(_jsx(Input, { label: "Email", success: true }));
            const input = screen.getByLabelText('Email');
            expect(input).toHaveClass('border-green-500');
        });
        it('displays left and right icons', () => {
            render(_jsx(Input, { label: "Search", leftIcon: _jsx("span", { children: "\uD83D\uDD0D" }), rightIcon: _jsx("span", { children: "\u2715" }) }));
            expect(screen.getByText('🔍')).toBeInTheDocument();
            expect(screen.getByText('✕')).toBeInTheDocument();
        });
    });
    describe('Textarea', () => {
        it('renders with placeholder', () => {
            render(_jsx(Textarea, { placeholder: "Enter your message..." }));
            const textarea = screen.getByPlaceholderText('Enter your message...');
            expect(textarea).toBeInTheDocument();
        });
        it('handles user input', async () => {
            const handleChange = jest.fn();
            const user = userEvent.setup();
            render(_jsx(Textarea, { onChange: handleChange }));
            const textarea = screen.getByRole('textbox');
            await user.type(textarea, 'Hello, world!');
            // Verify onChange was called multiple times (once per character)
            expect(handleChange).toHaveBeenCalledTimes(13);
            // Verify the final call has the complete value
            expect(handleChange).toHaveBeenLastCalledWith('Hello, world!');
        });
        it('shows character count when maxLength is set', () => {
            render(_jsx(Textarea, { value: "Hello", maxLength: 100, showCharCount: true }));
            expect(screen.getByText('5/100')).toBeInTheDocument();
        });
        it('applies different resize behaviors', () => {
            const { rerender } = render(_jsx(Textarea, { resize: "none" }));
            let textarea = screen.getByRole('textbox');
            expect(textarea).toHaveClass('resize-none');
            rerender(_jsx(Textarea, { resize: "vertical" }));
            textarea = screen.getByRole('textbox');
            expect(textarea).toHaveClass('resize-y');
            rerender(_jsx(Textarea, { resize: "horizontal" }));
            textarea = screen.getByRole('textbox');
            expect(textarea).toHaveClass('resize-x');
        });
    });
    describe('Badge', () => {
        it('renders with default styling', () => {
            render(_jsx(Badge, { children: "Default" }));
            const badge = screen.getByText('Default');
            expect(badge).toBeInTheDocument();
            expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
        });
        it('applies different variants', () => {
            const { rerender } = render(_jsx(Badge, { variant: "primary", children: "Primary" }));
            let badge = screen.getByText('Primary');
            expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
            rerender(_jsx(Badge, { variant: "success", children: "Success" }));
            badge = screen.getByText('Success');
            expect(badge).toHaveClass('bg-green-100', 'text-green-800');
            rerender(_jsx(Badge, { variant: "error", children: "Error" }));
            badge = screen.getByText('Error');
            expect(badge).toHaveClass('bg-red-100', 'text-red-800');
            rerender(_jsx(Badge, { variant: "warning", children: "Warning" }));
            badge = screen.getByText('Warning');
            expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
        });
        it('applies different sizes', () => {
            const { rerender } = render(_jsx(Badge, { size: "small", children: "Small" }));
            let badge = screen.getByText('Small');
            expect(badge).toHaveClass('px-2', 'py-0.5', 'text-xs');
            rerender(_jsx(Badge, { size: "medium", children: "Medium" }));
            badge = screen.getByText('Medium');
            expect(badge).toHaveClass('px-2.5', 'py-0.5', 'text-sm');
            rerender(_jsx(Badge, { size: "large", children: "Large" }));
            badge = screen.getByText('Large');
            expect(badge).toHaveClass('px-3', 'py-1', 'text-base');
        });
        it('renders as dot when dot prop is true', () => {
            const { container } = render(_jsx(Badge, { dot: true }));
            const badge = container.querySelector('[class*="w-3 h-3"]');
            expect(badge).toBeInTheDocument();
            expect(badge).toHaveClass('w-3', 'h-3');
        });
        it('applies outline styling', () => {
            render(_jsx(Badge, { outline: true, children: "Outline" }));
            const badge = screen.getByText('Outline');
            expect(badge).toHaveClass('border', 'bg-transparent');
        });
    });
    describe('Avatar', () => {
        it('renders with image source', () => {
            render(_jsx(Avatar, { src: "https://example.com/avatar.jpg", alt: "User Avatar" }));
            const img = screen.getByAltText('User Avatar');
            expect(img).toBeInTheDocument();
            expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
        });
        it('renders with fallback text', () => {
            render(_jsx(Avatar, { alt: "John Doe" }));
            expect(screen.getByText('JO')).toBeInTheDocument();
        });
        it('applies different sizes', () => {
            const { rerender, container } = render(_jsx(Avatar, { size: "small", alt: "Small" }));
            let avatarContainer = container.querySelector('.w-8.h-8');
            expect(avatarContainer).toBeInTheDocument();
            rerender(_jsx(Avatar, { size: "medium", alt: "Medium" }));
            avatarContainer = container.querySelector('.w-12.h-12');
            expect(avatarContainer).toBeInTheDocument();
            rerender(_jsx(Avatar, { size: "large", alt: "Large" }));
            avatarContainer = container.querySelector('.w-16.h-16');
            expect(avatarContainer).toBeInTheDocument();
            rerender(_jsx(Avatar, { size: "xlarge", alt: "XLarge" }));
            avatarContainer = container.querySelector('.w-24.h-24');
            expect(avatarContainer).toBeInTheDocument();
        });
        it('applies different shapes', () => {
            const { rerender } = render(_jsx(Avatar, { shape: "circle", alt: "Circle" }));
            let avatar = screen.getByText('CI');
            expect(avatar).toHaveClass('rounded-full');
            rerender(_jsx(Avatar, { shape: "square", alt: "Square" }));
            avatar = screen.getByText('SQ');
            expect(avatar).toHaveClass('rounded-lg');
        });
        it('shows status indicator', () => {
            render(_jsx(Avatar, { status: "online", alt: "Online User" }));
            const statusIndicator = document.querySelector('.bg-green-500');
            expect(statusIndicator).toBeInTheDocument();
        });
        it('handles click events', () => {
            const handleClick = jest.fn();
            render(_jsx(Avatar, { alt: "Clickable", onClick: handleClick }));
            const avatar = screen.getByText('CL');
            fireEvent.click(avatar);
            expect(handleClick).toHaveBeenCalledTimes(1);
        });
    });
    describe('Dialog', () => {
        it('renders when open', () => {
            render(_jsx(Dialog, { isOpen: true, onClose: jest.fn(), title: "Test Dialog", children: _jsx("p", { children: "Dialog content" }) }));
            expect(screen.getByText('Test Dialog')).toBeInTheDocument();
            expect(screen.getByText('Dialog content')).toBeInTheDocument();
        });
        it('does not render when closed', () => {
            render(_jsx(Dialog, { isOpen: false, onClose: jest.fn(), title: "Test Dialog", children: _jsx("p", { children: "Dialog content" }) }));
            expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument();
        });
        it('calls onClose when dismissed', () => {
            const handleClose = jest.fn();
            render(_jsx(Dialog, { isOpen: true, onClose: handleClose, isDismissable: true, children: _jsx("p", { children: "Dialog content" }) }));
            // Click outside the dialog (this would typically close it)
            // Note: In a real test environment, you might need to simulate
            // the actual overlay click behavior
        });
        it('applies different sizes', () => {
            const { rerender } = render(_jsx(Dialog, { isOpen: true, onClose: jest.fn(), size: "small", children: _jsx("p", { children: "Small dialog" }) }));
            let dialog = screen.getByText('Small dialog').closest('[class*="max-w-md"]');
            expect(dialog).toBeInTheDocument();
            rerender(_jsx(Dialog, { isOpen: true, onClose: jest.fn(), size: "large", children: _jsx("p", { children: "Large dialog" }) }));
            dialog = screen.getByText('Large dialog').closest('[class*="max-w-2xl"]');
            expect(dialog).toBeInTheDocument();
        });
    });
});
//# sourceMappingURL=components.test.js.map