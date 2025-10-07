import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { UserIcon, HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { UnifiedPremiumCard } from './UnifiedPremiumCard';
const meta = {
    title: 'Components/UnifiedPremiumCard',
    component: UnifiedPremiumCard,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: 'A unified premium card component with glass morphism, 3D effects, and advanced interactions.',
            },
        },
    },
    argTypes: {
        variant: {
            control: { type: 'select' },
            options: ['default', 'glass', 'elevated', 'gradient', 'neon', 'holographic'],
            description: 'Visual style variant of the card',
        },
        hover: {
            control: { type: 'boolean' },
            description: 'Whether to enable hover effects',
        },
        tilt: {
            control: { type: 'boolean' },
            description: 'Whether to enable 3D tilt effect',
        },
        glow: {
            control: { type: 'boolean' },
            description: 'Whether to show glow effect on hover',
        },
        blur: {
            control: { type: 'boolean' },
            description: 'Whether to add blur overlay',
        },
        shimmer: {
            control: { type: 'boolean' },
            description: 'Whether to show shimmer effect',
        },
        magnetic: {
            control: { type: 'boolean' },
            description: 'Whether to enable magnetic mouse tracking',
        },
        padding: {
            control: { type: 'select' },
            options: ['none', 'sm', 'md', 'lg', 'xl'],
            description: 'Internal padding of the card',
        },
        entrance: {
            control: { type: 'select' },
            options: ['fadeInUp', 'scaleIn', 'slideInLeft', 'slideInRight'],
            description: 'Entrance animation type',
        },
        delay: {
            control: { type: 'number', min: 0, max: 2, step: 0.1 },
            description: 'Delay before entrance animation starts',
        },
        disabled: {
            control: { type: 'boolean' },
            description: 'Whether the card is disabled',
        },
        onClick: { action: 'clicked' },
    },
    tags: ['autodocs'],
};
export default meta;
// Default story
export const Default = {
    args: {
        children: (_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Card Title" }), _jsx("p", { className: "text-gray-300", children: "This is a premium card with beautiful styling and smooth animations." })] })),
        variant: 'default',
        padding: 'md',
    },
};
// Variant showcase
export const Variants = {
    render: () => (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl", children: [_jsxs(UnifiedPremiumCard, { variant: "default", padding: "md", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Default Card" }), _jsx("p", { className: "text-gray-300", children: "Clean and minimal design with subtle glass effects." })] }), _jsxs(UnifiedPremiumCard, { variant: "glass", padding: "md", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Glass Card" }), _jsx("p", { className: "text-gray-300", children: "Enhanced glass morphism with backdrop blur effects." })] }), _jsxs(UnifiedPremiumCard, { variant: "elevated", padding: "md", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Elevated Card" }), _jsx("p", { className: "text-gray-300", children: "Floating design with enhanced shadows and depth." })] }), _jsxs(UnifiedPremiumCard, { variant: "gradient", padding: "md", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Gradient Card" }), _jsx("p", { className: "text-gray-300", children: "Beautiful gradient background with brand colors." })] }), _jsxs(UnifiedPremiumCard, { variant: "neon", padding: "md", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Neon Card" }), _jsx("p", { className: "text-gray-300", children: "Futuristic neon styling with glowing borders." })] }), _jsxs(UnifiedPremiumCard, { variant: "holographic", padding: "md", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Holographic Card" }), _jsx("p", { className: "text-gray-300", children: "Animated holographic effect with shifting colors." })] })] })),
    parameters: {
        docs: {
            description: {
                story: 'All available card variants showcasing different visual styles.',
            },
        },
    },
};
// Interactive effects
export const InteractiveEffects = {
    render: () => (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl", children: [_jsxs(UnifiedPremiumCard, { variant: "glass", hover: true, padding: "md", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Hover Effect" }), _jsx("p", { className: "text-gray-300", children: "Hover over this card to see the smooth scale and lift animation." })] }), _jsxs(UnifiedPremiumCard, { variant: "elevated", tilt: true, padding: "md", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "3D Tilt Effect" }), _jsx("p", { className: "text-gray-300", children: "Move your mouse over this card to see the 3D tilt effect." })] }), _jsxs(UnifiedPremiumCard, { variant: "gradient", glow: true, padding: "md", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Glow Effect" }), _jsx("p", { className: "text-gray-300", children: "Hover to see the beautiful glow effect around the card." })] }), _jsxs(UnifiedPremiumCard, { variant: "glass", magnetic: true, padding: "md", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Magnetic Effect" }), _jsx("p", { className: "text-gray-300", children: "Move your mouse around to see the magnetic tracking effect." })] })] })),
    parameters: {
        docs: {
            description: {
                story: 'Cards with various interactive effects and animations.',
            },
        },
    },
};
// Padding showcase
export const PaddingSizes = {
    render: () => (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl", children: [_jsx(UnifiedPremiumCard, { variant: "glass", padding: "none", children: _jsxs("div", { className: "p-4", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "No Padding" }), _jsx("p", { className: "text-gray-300", children: "Content with no internal padding." })] }) }), _jsxs(UnifiedPremiumCard, { variant: "glass", padding: "sm", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Small Padding" }), _jsx("p", { className: "text-gray-300", children: "Content with small internal padding." })] }), _jsxs(UnifiedPremiumCard, { variant: "glass", padding: "md", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Medium Padding" }), _jsx("p", { className: "text-gray-300", children: "Content with medium internal padding." })] }), _jsxs(UnifiedPremiumCard, { variant: "glass", padding: "lg", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Large Padding" }), _jsx("p", { className: "text-gray-300", children: "Content with large internal padding." })] })] })),
    parameters: {
        docs: {
            description: {
                story: 'Different padding sizes for card content.',
            },
        },
    },
};
// Entrance animations
export const EntranceAnimations = {
    render: () => (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl", children: [_jsxs(UnifiedPremiumCard, { variant: "glass", entrance: "fadeInUp", delay: 0, padding: "md", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Fade In Up" }), _jsx("p", { className: "text-gray-300", children: "Card fades in from below with upward motion." })] }), _jsxs(UnifiedPremiumCard, { variant: "glass", entrance: "scaleIn", delay: 0.2, padding: "md", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Scale In" }), _jsx("p", { className: "text-gray-300", children: "Card scales in from smaller size to full size." })] }), _jsxs(UnifiedPremiumCard, { variant: "glass", entrance: "slideInLeft", delay: 0.4, padding: "md", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Slide In Left" }), _jsx("p", { className: "text-gray-300", children: "Card slides in from the left side." })] }), _jsxs(UnifiedPremiumCard, { variant: "glass", entrance: "slideInRight", delay: 0.6, padding: "md", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Slide In Right" }), _jsx("p", { className: "text-gray-300", children: "Card slides in from the right side." })] })] })),
    parameters: {
        docs: {
            description: {
                story: 'Different entrance animations with staggered delays.',
            },
        },
    },
};
// Pet profile card example
export const PetProfileCard = {
    render: () => (_jsx("div", { className: "max-w-sm", children: _jsxs(UnifiedPremiumCard, { variant: "glass", hover: true, tilt: true, padding: "none", className: "overflow-hidden", children: [_jsxs("div", { className: "relative", children: [_jsx("img", { src: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop", alt: "Golden Retriever", className: "w-full h-48 object-cover" }), _jsx("div", { className: "absolute top-4 right-4", children: _jsx("button", { className: "bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors", children: _jsx(HeartIcon, { className: "w-5 h-5 text-white" }) }) })] }), _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h3", { className: "text-xl font-bold", children: "Buddy" }), _jsx("span", { className: "text-sm text-gray-300", children: "2 years old" })] }), _jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx(UserIcon, { className: "w-4 h-4 text-gray-300" }), _jsx("span", { className: "text-sm text-gray-300", children: "Golden Retriever" })] }), _jsx("p", { className: "text-gray-300 text-sm mb-4", children: "Friendly and energetic dog who loves playing fetch and going on long walks." }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { className: "flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-lg transition-colors", children: "Like" }), _jsxs("button", { className: "flex-1 bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2", children: [_jsx(ChatBubbleLeftIcon, { className: "w-4 h-4" }), "Chat"] })] })] })] }) })),
    parameters: {
        docs: {
            description: {
                story: 'A realistic pet profile card example showing how to use the card component in a real application.',
            },
        },
    },
};
// Clickable card
export const ClickableCard = {
    render: () => (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl", children: [_jsxs(UnifiedPremiumCard, { variant: "glass", hover: true, onClick: () => alert('Card clicked!'), padding: "md", className: "cursor-pointer", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Clickable Card" }), _jsx("p", { className: "text-gray-300", children: "This card is clickable and will show an alert when clicked." })] }), _jsxs(UnifiedPremiumCard, { variant: "elevated", hover: true, onClick: () => alert('Another card clicked!'), padding: "md", className: "cursor-pointer", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Another Clickable" }), _jsx("p", { className: "text-gray-300", children: "This card also responds to clicks with haptic and sound feedback." })] })] })),
    parameters: {
        docs: {
            description: {
                story: 'Cards that respond to click events with proper feedback.',
            },
        },
    },
};
// Accessibility
export const Accessibility = {
    render: () => (_jsx("div", { className: "max-w-md", children: _jsxs(UnifiedPremiumCard, { variant: "glass", padding: "md", "aria-label": "User profile information", "aria-describedby": "profile-description", role: "article", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Accessible Card" }), _jsx("p", { id: "profile-description", className: "text-gray-300 mb-4", children: "This card has proper ARIA attributes for screen readers and keyboard navigation." }), _jsx("button", { className: "bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-lg transition-colors", "aria-label": "Edit profile information", children: "Edit Profile" })] }) })),
    parameters: {
        docs: {
            description: {
                story: 'Card with proper accessibility attributes for screen readers and keyboard navigation.',
            },
        },
    },
};
// Interactive playground
export const Playground = {
    args: {
        children: (_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Playground Card" }), _jsx("p", { className: "text-gray-300", children: "This is a playground card where you can test all the properties and see how they affect the appearance and behavior." })] })),
        variant: 'glass',
        hover: true,
        tilt: false,
        glow: false,
        blur: false,
        shimmer: false,
        magnetic: false,
        padding: 'md',
        entrance: 'fadeInUp',
        delay: 0,
        disabled: false,
    },
    parameters: {
        docs: {
            description: {
                story: 'Interactive playground to test all card properties and effects.',
            },
        },
    },
};
//# sourceMappingURL=UnifiedPremiumCard.stories.js.map