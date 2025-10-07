import { jsx as _jsx } from "react/jsx-runtime";
import { useFocusRing } from '@react-aria/focus';
import { useHover } from '@react-aria/interactions';
import { mergeProps } from '@react-aria/utils';
import React from 'react';
/**
 * A headless card component that can be styled in the consuming application
 */
export const Card = React.forwardRef((props, forwardedRef) => {
    const { children, interactive = false, className = '', onClick, ...otherProps } = props;
    const ref = React.useRef(null);
    const { focusProps, isFocused } = useFocusRing();
    const { hoverProps, isHovered } = useHover({});
    // Merge the refs
    React.useImperativeHandle(forwardedRef, () => ref.current);
    return (_jsx("div", { ...(interactive ? mergeProps(focusProps, hoverProps, otherProps) : otherProps), 
        // eslint-disable-next-line react/jsx-props-no-spreading
        ref: ref, tabIndex: interactive ? 0 : undefined, role: interactive ? 'button' : undefined, "data-focused": interactive && isFocused ? true : undefined, "data-hovered": interactive && isHovered ? true : undefined, "data-interactive": interactive || undefined, className: className, onClick: interactive ? onClick : undefined, children: children }));
});
Card.displayName = 'Card';
//# sourceMappingURL=Card.js.map