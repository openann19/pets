import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useFocusRing } from '@react-aria/focus';
import { mergeProps } from '@react-aria/utils';
import React from 'react';
/**
 * A headless input component
 */
export const Input = React.forwardRef((props, forwardedRef) => {
    const { type = 'text', variant = 'default', size = 'medium', leftIcon, rightIcon, className = '', error = false, success = false, errorMessage, label, value = '', onChange, placeholder, disabled = false, readOnly = false, ...otherProps } = props;
    const ref = React.useRef(null);
    const { focusProps } = useFocusRing();
    const inputId = React.useId();
    // Merge the refs
    React.useImperativeHandle(forwardedRef, () => ref.current);
    // Handle change events
    const handleChange = (e) => {
        onChange?.(e.target.value);
    };
    const baseClasses = 'w-full transition-colors duration-200';
    const variantClasses = {
        default: 'border-0 bg-transparent',
        outline: 'border border-gray-300 rounded-md bg-white',
        filled: 'border-0 bg-gray-50 rounded-md'
    };
    const sizeClasses = {
        small: 'px-3 py-2 text-sm',
        medium: 'px-4 py-3 text-base',
        large: 'px-5 py-4 text-lg'
    };
    const stateClasses = error
        ? 'border-red-500 focus:ring-red-500'
        : success
            ? 'border-green-500 focus:ring-green-500'
            : 'border-gray-300 focus:ring-blue-500';
    return (_jsxs("div", { className: "w-full", children: [Boolean(label) && (_jsx("label", { htmlFor: inputId, className: "block text-sm font-medium text-gray-700 mb-1", children: label })), _jsxs("div", { className: "relative", children: [leftIcon !== undefined && leftIcon !== null && (_jsx("div", { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400", children: leftIcon })), _jsx("input", { ...mergeProps(focusProps, otherProps), ref: ref, 
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        id: inputId, type: type, value: value, onChange: React.useCallback(handleChange, [onChange]), placeholder: placeholder, disabled: disabled, readOnly: readOnly, className: `
              ${baseClasses}
              ${variantClasses[variant]}
              ${sizeClasses[size]}
              ${leftIcon !== undefined && leftIcon !== null ? 'pl-10' : ''}
              ${rightIcon !== undefined && rightIcon !== null ? 'pr-10' : ''}
              ${stateClasses}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${className}
            ` }), rightIcon !== undefined && rightIcon !== null && (_jsx("div", { className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400", children: rightIcon }))] }), error && Boolean(errorMessage) && (_jsx("div", { className: "mt-1 text-sm text-red-600", children: errorMessage }))] }));
});
Input.displayName = 'Input';
//# sourceMappingURL=Input.js.map