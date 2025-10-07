import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { HeartIcon, StarIcon, SparklesIcon, ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon, } from '@heroicons/react/24/outline';
import { action } from '@storybook/addon-actions';
import { UnifiedPremiumButton } from '../Premium/UnifiedPremiumButton';
const meta = {
    title: 'Design System/Buttons/UnifiedPremiumButton',
    component: UnifiedPremiumButton,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: `
# UnifiedPremiumButton

A premium button component with advanced features including:

- **10+ Variants**: primary, secondary, glass, outline, ghost, text, danger, success, warning, holographic, neon
- **Magnetic Effect**: Buttons attract cursor on hover
- **Haptic Feedback**: Vibration on mobile devices
- **Sound Feedback**: Audio cues on interaction
- **Ripple Animations**: Material Design-style touch feedback
- **WCAG AA Compliant**: Full accessibility support
- **Mobile-First Responsive**: Perfect touch targets

## Usage

\`\`\`tsx
<UnifiedPremiumButton variant="primary" onClick={handleClick}>
  Click me
</UnifiedPremiumButton>
\`\`\`
        `,
            },
        },
    },
    argTypes: {
        variant: {
            control: { type: 'select' },
            options: [
                'primary',
                'secondary',
                'glass',
                'outline',
                'ghost',
                'text',
                'danger',
                'success',
                'warning',
                'holographic',
                'neon',
            ],
            description: 'Button variant style',
        },
        size: {
            control: { type: 'select' },
            options: ['sm', 'md', 'lg', 'xl'],
            description: 'Button size',
        },
        disabled: {
            control: { type: 'boolean' },
            description: 'Disable the button',
        },
        loading: {
            control: { type: 'boolean' },
            description: 'Show loading state',
        },
        fullWidth: {
            control: { type: 'boolean' },
            description: 'Make button full width',
        },
        glow: {
            control: { type: 'boolean' },
            description: 'Enable glow effect',
        },
        haptic: {
            control: { type: 'boolean' },
            description: 'Enable haptic feedback',
        },
        sound: {
            control: { type: 'boolean' },
            description: 'Enable sound feedback',
        },
        particles: {
            control: { type: 'boolean' },
            description: 'Enable particle effects',
        },
        magneticEffect: {
            control: { type: 'boolean' },
            description: 'Enable magnetic cursor effect',
        },
        iconPosition: {
            control: { type: 'select' },
            options: ['left', 'right'],
            description: 'Icon position',
        },
    },
    args: {
        onClick: action('clicked'),
        children: 'Button',
    },
};
export default meta;
// ====== BASIC VARIANTS ======
export const Primary = {
    args: {
        variant: 'primary',
        children: 'Primary Button',
    },
};
export const Secondary = {
    args: {
        variant: 'secondary',
        children: 'Secondary Button',
    },
};
export const Glass = {
    args: {
        variant: 'glass',
        children: 'Glass Button',
    },
    parameters: {
        backgrounds: { default: 'dark' },
    },
};
export const Outline = {
    args: {
        variant: 'outline',
        children: 'Outline Button',
    },
};
export const Ghost = {
    args: {
        variant: 'ghost',
        children: 'Ghost Button',
    },
};
export const Text = {
    args: {
        variant: 'text',
        children: 'Text Button',
    },
};
// ====== STATUS VARIANTS ======
export const Danger = {
    args: {
        variant: 'danger',
        children: 'Danger Button',
    },
};
export const Success = {
    args: {
        variant: 'success',
        children: 'Success Button',
    },
};
export const Warning = {
    args: {
        variant: 'warning',
        children: 'Warning Button',
    },
};
// ====== PREMIUM VARIANTS ======
export const Holographic = {
    args: {
        variant: 'holographic',
        children: 'Holographic Button',
        glow: true,
    },
    parameters: {
        backgrounds: { default: 'dark' },
    },
};
export const Neon = {
    args: {
        variant: 'neon',
        children: 'Neon Button',
        glow: true,
    },
    parameters: {
        backgrounds: { default: 'dark' },
    },
};
// ====== SIZES ======
export const Sizes = {
    render: () => (_jsxs("div", { className: "flex items-center gap-4", children: [_jsx(UnifiedPremiumButton, { size: "sm", children: "Small" }), _jsx(UnifiedPremiumButton, { size: "md", children: "Medium" }), _jsx(UnifiedPremiumButton, { size: "lg", children: "Large" }), _jsx(UnifiedPremiumButton, { size: "xl", children: "Extra Large" })] })),
};
// ====== STATES ======
export const States = {
    render: () => (_jsxs("div", { className: "flex items-center gap-4", children: [_jsx(UnifiedPremiumButton, { children: "Normal" }), _jsx(UnifiedPremiumButton, { disabled: true, children: "Disabled" }), _jsx(UnifiedPremiumButton, { loading: true, children: "Loading" })] })),
};
// ====== WITH ICONS ======
export const WithIcons = {
    render: () => (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx(UnifiedPremiumButton, { icon: _jsx(HeartIcon, { className: "w-5 h-5" }), children: "Like" }), _jsx(UnifiedPremiumButton, { variant: "secondary", icon: _jsx(StarIcon, { className: "w-5 h-5" }), iconPosition: "right", children: "Favorite" })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx(UnifiedPremiumButton, { variant: "success", icon: _jsx(CheckCircleIcon, { className: "w-5 h-5" }), children: "Success" }), _jsx(UnifiedPremiumButton, { variant: "danger", icon: _jsx(XCircleIcon, { className: "w-5 h-5" }), children: "Delete" }), _jsx(UnifiedPremiumButton, { variant: "warning", icon: _jsx(ExclamationTriangleIcon, { className: "w-5 h-5" }), children: "Warning" })] })] })),
};
// ====== PREMIUM FEATURES ======
export const PremiumFeatures = {
    render: () => (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx(UnifiedPremiumButton, { glow: true, children: "With Glow" }), _jsx(UnifiedPremiumButton, { particles: true, children: "With Particles" }), _jsx(UnifiedPremiumButton, { magneticEffect: true, children: "Magnetic Effect" })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx(UnifiedPremiumButton, { haptic: true, children: "Haptic Feedback" }), _jsx(UnifiedPremiumButton, { sound: true, children: "Sound Feedback" }), _jsx(UnifiedPremiumButton, { glow: true, particles: true, magneticEffect: true, haptic: true, sound: true, children: "All Features" })] })] })),
};
// ====== FULL WIDTH ======
export const FullWidth = {
    render: () => (_jsxs("div", { className: "w-96 space-y-4", children: [_jsx(UnifiedPremiumButton, { fullWidth: true, children: "Full Width Button" }), _jsx(UnifiedPremiumButton, { variant: "outline", fullWidth: true, children: "Full Width Outline" })] })),
};
// ====== ACCESSIBILITY ======
export const Accessibility = {
    render: () => (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsx(UnifiedPremiumButton, { "aria-label": "Like this pet", "aria-describedby": "like-help", children: "Like" }), _jsx("div", { id: "like-help", className: "text-sm text-gray-600", children: "Click to like this pet profile" }), _jsx(UnifiedPremiumButton, { variant: "danger", "aria-label": "Delete pet profile", "aria-describedby": "delete-warning", children: "Delete" }), _jsx("div", { id: "delete-warning", className: "text-sm text-red-600", children: "This action cannot be undone" })] })),
};
// ====== INTERACTIVE PLAYGROUND ======
export const Playground = {
    args: {
        variant: 'primary',
        size: 'md',
        children: 'Playground Button',
        disabled: false,
        loading: false,
        fullWidth: false,
        glow: false,
        haptic: true,
        sound: true,
        particles: false,
        magneticEffect: false,
        icon: _jsx(SparklesIcon, { className: "w-5 h-5" }),
        iconPosition: 'left',
    },
};
//# sourceMappingURL=Button.stories.js.map