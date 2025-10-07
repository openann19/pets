import { jsx as _jsx } from "react/jsx-runtime";
/**
 * A badge component for displaying status, labels, or counts
 */
export const Badge = ({ children, variant = 'default', size = 'medium', className = '', dot = false, outline = false }) => {
    const baseClasses = 'inline-flex items-center font-medium rounded-full';
    const variantClasses = {
        default: outline
            ? 'border border-gray-300 text-gray-700 bg-transparent'
            : 'bg-gray-100 text-gray-800',
        primary: outline
            ? 'border border-blue-500 text-blue-700 bg-transparent'
            : 'bg-blue-100 text-blue-800',
        secondary: outline
            ? 'border border-gray-500 text-gray-700 bg-transparent'
            : 'bg-gray-100 text-gray-800',
        success: outline
            ? 'border border-green-500 text-green-700 bg-transparent'
            : 'bg-green-100 text-green-800',
        warning: outline
            ? 'border border-yellow-500 text-yellow-700 bg-transparent'
            : 'bg-yellow-100 text-yellow-800',
        error: outline
            ? 'border border-red-500 text-red-700 bg-transparent'
            : 'bg-red-100 text-red-800',
        info: outline
            ? 'border border-cyan-500 text-cyan-700 bg-transparent'
            : 'bg-cyan-100 text-cyan-800'
    };
    const sizeClasses = {
        small: dot ? 'w-2 h-2' : 'px-2 py-0.5 text-xs',
        medium: dot ? 'w-3 h-3' : 'px-2.5 py-0.5 text-sm',
        large: dot ? 'w-4 h-4' : 'px-3 py-1 text-base'
    };
    return (_jsx("span", { className: `
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `, children: !dot && children }));
};
//# sourceMappingURL=Badge.js.map