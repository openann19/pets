import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
// Simple Loading Spinner Component
const LoadingSpinner = ({ size = 'md', message }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };
    return (_jsxs("div", { className: "flex flex-col items-center gap-2", children: [_jsx("div", { className: `${sizeClasses[size]} border-2 border-blue-500 border-t-transparent rounded-full animate-spin` }), message != null && message !== '' && _jsx("span", { className: "text-sm text-gray-600", children: message })] }));
};
// Simple Skeleton Component
const PremiumSkeleton = ({ variant = 'text', width = '100%', height = 20, animation = 'pulse' }) => {
    const baseClasses = 'bg-gray-200 animate-pulse';
    const variantClasses = {
        text: 'rounded',
        rectangular: 'rounded',
        circular: 'rounded-full',
        button: 'rounded-lg'
    };
    return (_jsx("div", { className: `${baseClasses} ${variantClasses[variant]}`, style: { width, height } }));
};
const meta = {
    title: 'Design System/Loading',
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: `
# Loading Components

A comprehensive loading system with multiple components:

- **LoadingSpinner**: Animated spinner with customizable sizes
- **PremiumSkeleton**: Content-shape-matching skeleton loaders

## Features

- Multiple loading types (spinner, skeleton)
- Smooth animations
- Accessibility support
- Mobile-optimized performance
        `,
            },
        },
    },
};
export default meta;
// ====== LOADING SPINNER ======
export const LoadingSpinnerStory = {
    render: () => (_jsxs("div", { className: "flex flex-col gap-8 items-center", children: [_jsxs("div", { className: "text-center", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Loading Spinner Sizes" }), _jsxs("div", { className: "flex items-center gap-8", children: [_jsxs("div", { className: "text-center", children: [_jsx(LoadingSpinner, { size: "sm" }), _jsx("div", { className: "text-sm text-gray-600 mt-2", children: "Small" })] }), _jsxs("div", { className: "text-center", children: [_jsx(LoadingSpinner, { size: "md" }), _jsx("div", { className: "text-sm text-gray-600 mt-2", children: "Medium" })] }), _jsxs("div", { className: "text-center", children: [_jsx(LoadingSpinner, { size: "lg" }), _jsx("div", { className: "text-sm text-gray-600 mt-2", children: "Large" })] })] })] }), _jsxs("div", { className: "text-center", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "With Messages" }), _jsxs("div", { className: "space-y-4", children: [_jsx(LoadingSpinner, { size: "md", message: "Loading pets..." }), _jsx(LoadingSpinner, { size: "md", message: "Processing match..." }), _jsx(LoadingSpinner, { size: "md", message: "Uploading photo..." })] })] })] })),
};
// ====== PREMIUM SKELETON ======
export const PremiumSkeletonStory = {
    render: () => (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Skeleton Variants" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium", children: "Text" }), _jsx(PremiumSkeleton, { variant: "text", width: "100%", height: 20 }), _jsx(PremiumSkeleton, { variant: "text", width: "80%", height: 16 }), _jsx(PremiumSkeleton, { variant: "text", width: "60%", height: 16 })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium", children: "Rectangular" }), _jsx(PremiumSkeleton, { variant: "rectangular", width: 200, height: 120 }), _jsx(PremiumSkeleton, { variant: "rectangular", width: 150, height: 80 })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium", children: "Circular" }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx(PremiumSkeleton, { variant: "circular", width: 40, height: 40 }), _jsx(PremiumSkeleton, { variant: "circular", width: 60, height: 60 }), _jsx(PremiumSkeleton, { variant: "circular", width: 80, height: 80 })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium", children: "Button" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(PremiumSkeleton, { variant: "button", width: 100, height: 40 }), _jsx(PremiumSkeleton, { variant: "button", width: 120, height: 40 })] })] })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Animations" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium", children: "Pulse" }), _jsx(PremiumSkeleton, { variant: "text", width: "100%", height: 20, animation: "pulse" }), _jsx(PremiumSkeleton, { variant: "rectangular", width: 200, height: 100, animation: "pulse" })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium", children: "Wave" }), _jsx(PremiumSkeleton, { variant: "text", width: "100%", height: 20, animation: "wave" }), _jsx(PremiumSkeleton, { variant: "rectangular", width: 200, height: 100, animation: "wave" })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium", children: "Shimmer" }), _jsx(PremiumSkeleton, { variant: "text", width: "100%", height: 20, animation: "shimmer" }), _jsx(PremiumSkeleton, { variant: "rectangular", width: 200, height: 100, animation: "shimmer" })] })] })] })] })),
};
// ====== ENHANCED LOADING ======
const LoadingDemo = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingType, setLoadingType] = useState('spinner');
    const startLoading = () => {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 3000);
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-wrap gap-4", children: [_jsx("button", { onClick: startLoading, className: "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600", children: "Start Loading" }), _jsxs("select", { value: loadingType, onChange: (e) => setLoadingType(e.target.value), className: "px-3 py-2 border rounded", children: [_jsx("option", { value: "spinner", children: "Spinner" }), _jsx("option", { value: "skeleton", children: "Skeleton" })] })] }), _jsx("div", { className: "w-96", children: isLoading ? (loadingType === 'spinner' ? (_jsx("div", { className: "flex items-center justify-center p-8", children: _jsx(LoadingSpinner, { size: "lg", message: "Loading content..." }) })) : (_jsxs("div", { className: "p-6 bg-white border rounded-lg shadow space-y-4", children: [_jsx(PremiumSkeleton, { variant: "text", height: 24 }), _jsx(PremiumSkeleton, { variant: "text", width: "80%", height: 16 }), _jsx(PremiumSkeleton, { variant: "text", width: "60%", height: 16 }), _jsxs("div", { className: "flex gap-2 mt-4", children: [_jsx(PremiumSkeleton, { variant: "circular", width: 48, height: 48 }), _jsxs("div", { className: "flex-1 space-y-2", children: [_jsx(PremiumSkeleton, { variant: "text", height: 16 }), _jsx(PremiumSkeleton, { variant: "text", width: "75%", height: 12 })] })] })] }))) : (_jsxs("div", { className: "p-6 bg-white border rounded-lg shadow", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Loaded Content" }), _jsx("p", { className: "text-gray-600", children: "This content appears after loading is complete. The loading state shows different types of skeletons and spinners based on the selected options." }), _jsxs("div", { className: "mt-4 flex gap-2", children: [_jsx("div", { className: "w-12 h-12 bg-blue-500 rounded-full" }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "h-4 bg-gray-200 rounded mb-2" }), _jsx("div", { className: "h-3 bg-gray-200 rounded w-3/4" })] })] })] })) })] }));
};
export const EnhancedLoadingStory = {
    render: () => _jsx(LoadingDemo, {}),
};
// ====== SPECIALIZED SKELETONS ======
export const SpecializedSkeletons = {
    render: () => (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Pet Card Skeleton" }), _jsx("div", { className: "w-80", children: _jsxs("div", { className: "bg-white rounded-xl p-6 border shadow", children: [_jsxs("div", { className: "flex gap-4", children: [_jsx("div", { className: "w-20 h-20 bg-gray-200 rounded-xl animate-pulse" }), _jsxs("div", { className: "flex-1 space-y-3", children: [_jsx("div", { className: "h-5 bg-gray-200 rounded animate-pulse" }), _jsx("div", { className: "h-4 bg-gray-200 rounded w-3/4 animate-pulse" }), _jsx("div", { className: "h-3 bg-gray-200 rounded w-1/2 animate-pulse" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("div", { className: "h-6 bg-gray-200 rounded-full w-16 animate-pulse" }), _jsx("div", { className: "h-6 bg-gray-200 rounded-full w-20 animate-pulse" })] })] })] }), _jsxs("div", { className: "flex gap-3 mt-4 pt-4 border-t", children: [_jsx("div", { className: "h-10 bg-gray-200 rounded-lg flex-1 animate-pulse" }), _jsx("div", { className: "h-10 bg-gray-200 rounded-lg flex-1 animate-pulse" })] })] }) })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Chat List Skeleton" }), _jsx("div", { className: "w-96", children: _jsx("div", { className: "space-y-3", children: [1, 2, 3].map((i) => (_jsxs("div", { className: "flex items-center gap-3 p-3 bg-white rounded-lg border", children: [_jsx("div", { className: "w-12 h-12 bg-gray-200 rounded-full animate-pulse" }), _jsxs("div", { className: "flex-1 space-y-2", children: [_jsx("div", { className: "h-4 bg-gray-200 rounded w-3/4 animate-pulse" }), _jsx("div", { className: "h-3 bg-gray-200 rounded w-1/2 animate-pulse" })] }), _jsx("div", { className: "h-3 bg-gray-200 rounded w-12 animate-pulse" })] }, i))) }) })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Profile Skeleton" }), _jsx("div", { className: "w-80", children: _jsxs("div", { className: "bg-white rounded-xl p-6 border shadow", children: [_jsxs("div", { className: "text-center mb-6", children: [_jsx("div", { className: "w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse" }), _jsx("div", { className: "h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2 animate-pulse" }), _jsx("div", { className: "h-4 bg-gray-200 rounded w-1/2 mx-auto animate-pulse" })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "h-4 bg-gray-200 rounded animate-pulse" }), _jsx("div", { className: "h-4 bg-gray-200 rounded w-5/6 animate-pulse" }), _jsx("div", { className: "h-4 bg-gray-200 rounded w-4/6 animate-pulse" })] })] }) })] })] })),
};
// ====== LOADING STATES ======
export const LoadingStates = {
    render: () => (_jsx("div", { className: "space-y-6", children: _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Different Loading States" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "p-4 border rounded-lg", children: [_jsx("h4", { className: "font-medium mb-2", children: "API Loading" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" }), _jsx("span", { className: "text-sm text-gray-600", children: "Fetching data..." })] })] }), _jsxs("div", { className: "p-4 border rounded-lg", children: [_jsx("h4", { className: "font-medium mb-2", children: "Form Processing" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" }), _jsx("span", { className: "text-sm text-gray-600", children: "Saving changes..." })] })] }), _jsxs("div", { className: "p-4 border rounded-lg", children: [_jsx("h4", { className: "font-medium mb-2", children: "Image Upload" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" }), _jsx("span", { className: "text-sm text-gray-600", children: "Uploading image..." })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-purple-500 h-2 rounded-full w-3/4 animate-pulse" }) })] })] }), _jsxs("div", { className: "p-4 border rounded-lg", children: [_jsx("h4", { className: "font-medium mb-2", children: "Page Navigation" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" }), _jsx("span", { className: "text-sm text-gray-600", children: "Loading page..." })] })] })] })] }) })),
};
//# sourceMappingURL=Loading.stories.js.map