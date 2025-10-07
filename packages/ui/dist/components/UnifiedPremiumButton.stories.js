import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { HeartIcon, StarIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { UnifiedPremiumButton } from './UnifiedPremiumButton';
const meta = {
    title: 'Components/UnifiedPremiumButton',
    component: UnifiedPremiumButton,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: 'A unified premium button component with advanced animations, haptic feedback, and accessibility features.',
            },
        },
    },
    argTypes: {
        variant: {
            control: { type: 'select' },
            options: ['primary', 'secondary', 'tertiary', 'glass', 'outline', 'ghost', 'danger', 'success', 'warning', 'holographic', 'neon'],
            description: 'Visual style variant of the button',
        },
        size: {
            control: { type: 'select' },
            options: ['sm', 'md', 'lg', 'xl'],
            description: 'Size of the button',
        },
        disabled: {
            control: { type: 'boolean' },
            description: 'Whether the button is disabled',
        },
        loading: {
            control: { type: 'boolean' },
            description: 'Whether the button is in loading state',
        },
        fullWidth: {
            control: { type: 'boolean' },
            description: 'Whether the button should take full width',
        },
        glow: {
            control: { type: 'boolean' },
            description: 'Whether to show glow effect on hover',
        },
        magneticEffect: {
            control: { type: 'boolean' },
            description: 'Whether to enable magnetic mouse tracking effect',
        },
        haptic: {
            control: { type: 'boolean' },
            description: 'Whether to enable haptic feedback',
        },
        sound: {
            control: { type: 'boolean' },
            description: 'Whether to enable sound feedback',
        },
        iconPosition: {
            control: { type: 'select' },
            options: ['left', 'right'],
            description: 'Position of the icon relative to text',
        },
        onClick: { action: 'clicked' },
    },
    tags: ['autodocs'],
};
export default meta;
// Default story
export const Default = {
    args: {
        children: 'Click me',
        variant: 'primary',
        size: 'md',
    },
};
// Variant showcase
export const Variants = {
    render: () => (_jsxs("div", { className: "flex flex-wrap gap-4", children: [_jsx(UnifiedPremiumButton, { variant: "primary", children: "Primary" }), _jsx(UnifiedPremiumButton, { variant: "secondary", children: "Secondary" }), _jsx(UnifiedPremiumButton, { variant: "tertiary", children: "Tertiary" }), _jsx(UnifiedPremiumButton, { variant: "glass", children: "Glass" }), _jsx(UnifiedPremiumButton, { variant: "outline", children: "Outline" }), _jsx(UnifiedPremiumButton, { variant: "ghost", children: "Ghost" }), _jsx(UnifiedPremiumButton, { variant: "danger", children: "Danger" }), _jsx(UnifiedPremiumButton, { variant: "success", children: "Success" }), _jsx(UnifiedPremiumButton, { variant: "warning", children: "Warning" }), _jsx(UnifiedPremiumButton, { variant: "holographic", children: "Holographic" }), _jsx(UnifiedPremiumButton, { variant: "neon", children: "Neon" })] })),
    parameters: {
        docs: {
            description: {
                story: 'All available button variants with their unique styling.',
            },
        },
    },
};
// Size showcase
export const Sizes = {
    render: () => (_jsxs("div", { className: "flex items-center gap-4", children: [_jsx(UnifiedPremiumButton, { size: "sm", children: "Small" }), _jsx(UnifiedPremiumButton, { size: "md", children: "Medium" }), _jsx(UnifiedPremiumButton, { size: "lg", children: "Large" }), _jsx(UnifiedPremiumButton, { size: "xl", children: "Extra Large" })] })),
    parameters: {
        docs: {
            description: {
                story: 'Different button sizes from small to extra large.',
            },
        },
    },
};
// With icons
export const WithIcons = {
    render: () => (_jsxs("div", { className: "flex flex-wrap gap-4", children: [_jsx(UnifiedPremiumButton, { icon: _jsx(HeartIcon, { className: "w-5 h-5" }), iconPosition: "left", children: "Like" }), _jsx(UnifiedPremiumButton, { icon: _jsx(StarIcon, { className: "w-5 h-5" }), iconPosition: "right", children: "Favorite" }), _jsx(UnifiedPremiumButton, { icon: _jsx(SparklesIcon, { className: "w-5 h-5" }), variant: "holographic", children: "Magic" })] })),
    parameters: {
        docs: {
            description: {
                story: 'Buttons with icons positioned on the left or right.',
            },
        },
    },
};
// States
export const States = {
    render: () => (_jsxs("div", { className: "flex flex-wrap gap-4", children: [_jsx(UnifiedPremiumButton, { children: "Normal" }), _jsx(UnifiedPremiumButton, { disabled: true, children: "Disabled" }), _jsx(UnifiedPremiumButton, { loading: true, children: "Loading" }), _jsx(UnifiedPremiumButton, { isValid: false, children: "Invalid" }), _jsx(UnifiedPremiumButton, { isDirty: false, children: "Not Dirty" })] })),
    parameters: {
        docs: {
            description: {
                story: 'Different button states including disabled, loading, and validation states.',
            },
        },
    },
};
// Effects
export const Effects = {
    render: () => (_jsxs("div", { className: "flex flex-wrap gap-4", children: [_jsx(UnifiedPremiumButton, { glow: true, children: "Glow Effect" }), _jsx(UnifiedPremiumButton, { magneticEffect: true, children: "Magnetic Effect" }), _jsx(UnifiedPremiumButton, { glow: true, magneticEffect: true, children: "Both Effects" }), _jsx(UnifiedPremiumButton, { variant: "holographic", glow: true, children: "Holographic + Glow" })] })),
    parameters: {
        docs: {
            description: {
                story: 'Buttons with various visual effects like glow and magnetic tracking.',
            },
        },
    },
};
// Full width
export const FullWidth = {
    render: () => (_jsxs("div", { className: "w-96", children: [_jsx(UnifiedPremiumButton, { fullWidth: true, className: "mb-4", children: "Full Width Button" }), _jsx(UnifiedPremiumButton, { fullWidth: true, variant: "glass", children: "Full Width Glass" })] })),
    parameters: {
        docs: {
            description: {
                story: 'Buttons that take the full width of their container.',
            },
        },
    },
};
// Accessibility
export const Accessibility = {
    render: () => (_jsxs("div", { className: "flex flex-wrap gap-4", children: [_jsx(UnifiedPremiumButton, { "aria-label": "Like this post", children: _jsx(HeartIcon, { className: "w-5 h-5" }) }), _jsx(UnifiedPremiumButton, { "aria-describedby": "help-text", children: "Need Help?" }), _jsx(UnifiedPremiumButton, { "aria-pressed": true, children: "Toggle" })] })),
    parameters: {
        docs: {
            description: {
                story: 'Buttons with proper accessibility attributes for screen readers.',
            },
        },
    },
};
// Interactive playground
export const Playground = {
    args: {
        children: 'Playground Button',
        variant: 'primary',
        size: 'md',
        disabled: false,
        loading: false,
        fullWidth: false,
        glow: false,
        magneticEffect: false,
        haptic: true,
        sound: true,
        icon: _jsx(HeartIcon, { className: "w-5 h-5" }),
        iconPosition: 'left',
    },
    parameters: {
        docs: {
            description: {
                story: 'Interactive playground to test all button properties.',
            },
        },
    },
};
//# sourceMappingURL=UnifiedPremiumButton.stories.js.map