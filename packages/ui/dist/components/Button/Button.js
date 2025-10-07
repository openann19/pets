import { jsx as _jsx } from "react/jsx-runtime";
import { useButton } from '@react-aria/button';
import { useFocusRing } from '@react-aria/focus';
import { useHover } from '@react-aria/interactions';
import { mergeProps } from '@react-aria/utils';
import React from 'react';
/**
 * A styled button component built with react-aria
 */
export const Button = React.forwardRef((props, forwardedRef) => {
    const { variant = 'primary', size = 'medium', className = '', children, isDisabled, ...otherProps } = props;
    const ref = React.useRef(null);
    const { buttonProps, isPressed } = useButton(otherProps, ref);
    const { focusProps, isFocused } = useFocusRing();
    const { hoverProps, isHovered } = useHover({});
    // Merge the refs
    React.useImperativeHandle(forwardedRef, () => ref.current);
    // Get variant styles
    const getVariantClasses = () => {
        const variants = {
            primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
            secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
            outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
            ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-blue-500',
        };
        return variants[variant];
    };
    // Get size styles
    const getSizeClasses = () => {
        const sizes = {
            small: 'px-3 py-2 text-sm',
            medium: 'px-4 py-3 text-base',
            large: 'px-5 py-4 text-lg',
        };
        return sizes[size];
    };
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    const variantClasses = getVariantClasses();
    const sizeClasses = getSizeClasses();
    return (_jsx("button", { ...mergeProps(buttonProps, focusProps, hoverProps), 
        // eslint-disable-next-line react/jsx-props-no-spreading
        ref: ref, disabled: isDisabled, "data-pressed": isPressed || undefined, "data-focused": isFocused || undefined, "data-hovered": isHovered || undefined, "data-variant": variant, "data-size": size, className: `${baseClasses} ${variantClasses} ${sizeClasses} ${className}`, children: children }));
});
Button.displayName = 'Button';
//# sourceMappingURL=Button.js.map