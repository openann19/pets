import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { InformationCircleIcon, ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon, QuestionMarkCircleIcon, } from '@heroicons/react/24/outline';
// Simple Tooltip Components
const Tooltip = ({ content, children, trigger = 'hover', position = 'top', maxWidth = 200, className = '', showArrow = true }) => (_jsxs("div", { className: "relative inline-block", children: [children, _jsx("div", { className: `absolute z-10 px-2 py-1 text-sm text-white bg-gray-900 rounded shadow-lg ${className}`, style: { maxWidth }, children: content })] }));
const HelpTooltip = ({ helpText, children }) => (_jsx(Tooltip, { content: helpText, children: children }));
const InfoTooltip = ({ info, children }) => (_jsx(Tooltip, { content: info, children: children }));
const WarningTooltip = ({ warning, children }) => (_jsx(Tooltip, { content: warning, className: "bg-yellow-600", children: children }));
const ErrorTooltip = ({ error, children }) => (_jsx(Tooltip, { content: error, className: "bg-red-600", children: children }));
const SuccessTooltip = ({ success, children }) => (_jsx(Tooltip, { content: success, className: "bg-green-600", children: children }));
const meta = {
    title: 'Design System/Tooltips',
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: `
# Tooltip Components

A comprehensive tooltip system with contextual variants:

- **Tooltip**: Base tooltip component with customizable positioning
- **HelpTooltip**: Specialized help tooltips
- **InfoTooltip**: Information tooltips with info icon
- **WarningTooltip**: Warning tooltips with warning styling
- **ErrorTooltip**: Error tooltips with error styling
- **SuccessTooltip**: Success tooltips with success styling

## Features

- Multiple trigger types (hover, click, focus)
- Auto-positioning with collision detection
- Accessibility support with ARIA attributes
- Contextual styling for different message types
- Smooth animations with Framer Motion
        `,
            },
        },
    },
};
export default meta;
// ====== BASIC TOOLTIP ======
export const BasicTooltip = {
    render: () => (_jsxs("div", { className: "flex items-center gap-8", children: [_jsx(Tooltip, { content: "This is a basic tooltip", children: _jsx("button", { className: "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600", children: "Hover me" }) }), _jsx(Tooltip, { content: "This tooltip appears on click", trigger: "click", children: _jsx("button", { className: "px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600", children: "Click me" }) }), _jsx(Tooltip, { content: "This tooltip appears on focus", trigger: "focus", children: _jsx("button", { className: "px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600", children: "Focus me" }) })] })),
};
// ====== POSITIONING ======
export const Positioning = {
    render: () => (_jsxs("div", { className: "grid grid-cols-3 gap-8 place-items-center h-64", children: [_jsx(Tooltip, { content: "Top tooltip", position: "top", children: _jsx("button", { className: "px-4 py-2 bg-blue-500 text-white rounded", children: "Top" }) }), _jsx(Tooltip, { content: "Bottom tooltip", position: "bottom", children: _jsx("button", { className: "px-4 py-2 bg-green-500 text-white rounded", children: "Bottom" }) }), _jsx(Tooltip, { content: "Left tooltip", position: "left", children: _jsx("button", { className: "px-4 py-2 bg-purple-500 text-white rounded", children: "Left" }) }), _jsx(Tooltip, { content: "Right tooltip", position: "right", children: _jsx("button", { className: "px-4 py-2 bg-orange-500 text-white rounded", children: "Right" }) }), _jsx(Tooltip, { content: "Auto-positioning tooltip", position: "auto", children: _jsx("button", { className: "px-4 py-2 bg-pink-500 text-white rounded", children: "Auto" }) })] })),
};
// ====== CONTEXTUAL TOOLTIPS ======
export const ContextualTooltips = {
    render: () => (_jsxs("div", { className: "flex flex-col gap-6", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx(HelpTooltip, { helpText: "This button will save your current progress", children: _jsxs("button", { className: "px-4 py-2 bg-blue-500 text-white rounded flex items-center gap-2", children: [_jsx(CheckCircleIcon, { className: "w-4 h-4" }), "Save"] }) }), _jsx(InfoTooltip, { info: "This feature is currently in beta", children: _jsxs("button", { className: "px-4 py-2 bg-gray-500 text-white rounded flex items-center gap-2", children: [_jsx(InformationCircleIcon, { className: "w-4 h-4" }), "Beta Feature"] }) })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx(WarningTooltip, { warning: "This action cannot be undone", children: _jsxs("button", { className: "px-4 py-2 bg-yellow-500 text-white rounded flex items-center gap-2", children: [_jsx(ExclamationTriangleIcon, { className: "w-4 h-4" }), "Warning Action"] }) }), _jsx(ErrorTooltip, { error: "Something went wrong. Please try again.", children: _jsxs("button", { className: "px-4 py-2 bg-red-500 text-white rounded flex items-center gap-2", children: [_jsx(XCircleIcon, { className: "w-4 h-4" }), "Error State"] }) })] }), _jsx("div", { className: "flex items-center gap-4", children: _jsx(SuccessTooltip, { success: "Operation completed successfully", children: _jsxs("button", { className: "px-4 py-2 bg-green-500 text-white rounded flex items-center gap-2", children: [_jsx(CheckCircleIcon, { className: "w-4 h-4" }), "Success"] }) }) })] })),
};
// ====== RICH CONTENT ======
export const RichContent = {
    render: () => (_jsxs("div", { className: "flex items-center gap-8", children: [_jsx(Tooltip, { content: _jsxs("div", { className: "text-sm", children: [_jsx("div", { className: "font-semibold mb-2", children: "Advanced Settings" }), _jsxs("div", { className: "space-y-1", children: [_jsx("div", { children: "\u2022 Enable notifications" }), _jsx("div", { children: "\u2022 Auto-save drafts" }), _jsx("div", { children: "\u2022 Dark mode preference" })] })] }), maxWidth: 200, children: _jsx("button", { className: "px-4 py-2 bg-indigo-500 text-white rounded", children: "Settings" }) }), _jsx(Tooltip, { content: _jsxs("div", { className: "text-sm", children: [_jsx("div", { className: "font-semibold mb-2", children: "Pet Profile" }), _jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("div", { className: "w-8 h-8 bg-pink-200 rounded-full" }), _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: "Bella" }), _jsx("div", { className: "text-xs text-gray-500", children: "Golden Retriever" })] })] }), _jsx("div", { className: "text-xs text-gray-600", children: "Age: 3 years \u2022 Location: Sofia" })] }), maxWidth: 250, children: _jsx("button", { className: "px-4 py-2 bg-pink-500 text-white rounded", children: "View Profile" }) })] })),
};
// ====== FORM TOOLTIPS ======
export const FormTooltips = {
    render: () => (_jsxs("div", { className: "w-80 space-y-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: ["Email Address", _jsx(InfoTooltip, { info: "We'll use this to send you important updates about your pet matches", children: _jsx(QuestionMarkCircleIcon, { className: "w-4 h-4 inline ml-1 text-gray-400" }) })] }), _jsx("input", { type: "email", className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "Enter your email" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: ["Password", _jsx(HelpTooltip, { helpText: "Password must be at least 8 characters long and contain at least one number", children: _jsx(QuestionMarkCircleIcon, { className: "w-4 h-4 inline ml-1 text-gray-400" }) })] }), _jsx("input", { type: "password", className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "Enter your password" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: ["Pet Name", _jsx(WarningTooltip, { warning: "This name will be visible to other users", children: _jsx(ExclamationTriangleIcon, { className: "w-4 h-4 inline ml-1 text-yellow-500" }) })] }), _jsx("input", { type: "text", className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "Enter your pet's name" })] })] })),
};
// ====== ACCESSIBILITY ======
export const Accessibility = {
    render: () => (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Keyboard Navigation" }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx(Tooltip, { content: "This tooltip appears on focus for keyboard users", trigger: "focus", children: _jsx("button", { className: "px-4 py-2 bg-blue-500 text-white rounded", children: "Focus me (Tab)" }) }), _jsx(Tooltip, { content: "This tooltip can be triggered with Enter or Space", trigger: "click", children: _jsx("button", { className: "px-4 py-2 bg-green-500 text-white rounded", children: "Click me (Enter/Space)" }) })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Screen Reader Support" }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("button", { className: "px-4 py-2 bg-purple-500 text-white rounded", "aria-describedby": "help-text", children: "Button with ARIA" }), _jsx("div", { id: "help-text", className: "sr-only", children: "This button will open the help dialog" }), _jsx(Tooltip, { content: "This tooltip is announced by screen readers", children: _jsx("button", { className: "px-4 py-2 bg-orange-500 text-white rounded", children: "Accessible Tooltip" }) })] })] })] })),
};
// ====== CUSTOMIZATION ======
export const Customization = {
    render: () => (_jsxs("div", { className: "flex items-center gap-8", children: [_jsx(Tooltip, { content: "Custom styled tooltip", className: "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0", showArrow: false, children: _jsx("button", { className: "px-4 py-2 bg-purple-500 text-white rounded", children: "Gradient Tooltip" }) }), _jsx(Tooltip, { content: "Tooltip without arrow", showArrow: false, className: "bg-gray-800 text-white", children: _jsx("button", { className: "px-4 py-2 bg-gray-500 text-white rounded", children: "No Arrow" }) }), _jsx(Tooltip, { content: "Wide tooltip with more content", maxWidth: 400, className: "bg-blue-900 text-white", children: _jsx("button", { className: "px-4 py-2 bg-blue-500 text-white rounded", children: "Wide Tooltip" }) })] })),
};
//# sourceMappingURL=Tooltips.stories.js.map