import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useFocusRing } from '@react-aria/focus';
import { mergeProps } from '@react-aria/utils';
import React from 'react';
/**
 * A headless textarea component built with react-aria
 */
export const Textarea = React.forwardRef((props, forwardedRef) => {
    const { value = '', onChange, placeholder, variant = 'outline', size = 'medium', rows = 4, resize = 'vertical', className = '', error = false, success = false, disabled = false, readOnly = false, maxLength, showCharCount = false, ...otherProps } = props;
    const ref = React.useRef(null);
    const { focusProps } = useFocusRing();
    // Merge the refs
    React.useImperativeHandle(forwardedRef, () => ref.current);
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
    const resizeClasses = {
        none: 'resize-none',
        vertical: 'resize-y',
        horizontal: 'resize-x',
        both: 'resize'
    };
    return (_jsxs("div", { className: "relative", children: [_jsx("textarea", { ...mergeProps(focusProps, otherProps), 
                // eslint-disable-next-line react/jsx-props-no-spreading
                ref: ref, value: value, onChange: React.useCallback(handleChange, [onChange]), placeholder: placeholder, rows: rows, maxLength: maxLength, disabled: disabled, readOnly: readOnly, className: `
            ${baseClasses}
            ${variantClasses[variant]}
            ${sizeClasses[size]}
            ${stateClasses}
            ${resizeClasses[resize]}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${className}
          ` }), showCharCount && Boolean(maxLength) && (_jsxs("div", { className: "absolute bottom-2 right-2 text-xs text-gray-500", children: [value.length, "/", maxLength] }))] }));
});
Textarea.displayName = 'Textarea';
//# sourceMappingURL=Textarea.js.map