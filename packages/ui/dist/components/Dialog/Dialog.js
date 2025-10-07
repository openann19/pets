import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useDialog } from '@react-aria/dialog';
import { FocusScope } from '@react-aria/focus';
import { useModal, useOverlay, usePreventScroll } from '@react-aria/overlays';
import { mergeProps } from '@react-aria/utils';
import React from 'react';
/**
 * A dialog/modal component built with react-aria
 */
export const Dialog = ({ children, title, description, isOpen, onClose, size = 'medium', className = '', isDismissable = true, isKeyboardDismissDisabled = false }) => {
    const ref = React.useRef(null);
    const { dialogProps, titleProps } = useDialog({
        role: 'dialog'
    }, ref);
    const { overlayProps } = useOverlay({
        isOpen,
        onClose,
        isDismissable,
        isKeyboardDismissDisabled
    }, ref);
    usePreventScroll();
    useModal();
    const sizeClasses = {
        small: 'max-w-md',
        medium: 'max-w-lg',
        large: 'max-w-2xl',
        fullscreen: 'w-full h-full max-w-none'
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50", children: _jsx(FocusScope, { contain: true, restoreFocus: true, autoFocus: true, children: _jsxs("div", { ...mergeProps(overlayProps, dialogProps), 
                // eslint-disable-next-line react/jsx-props-no-spreading
                ref: ref, className: `
            bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-auto
            ${className}
          `, children: [((title != null && title !== '') ?? (description != null && description !== '')) && (_jsxs("div", { className: "px-6 py-4 border-b border-gray-200", children: [title != null && title !== '' && (_jsx("h2", { ...titleProps, 
                                // eslint-disable-next-line react/jsx-props-no-spreading
                                className: "text-lg font-semibold text-gray-900", children: title })), description != null && description !== '' && (_jsx("p", { className: "mt-1 text-sm text-gray-600", children: description }))] })), _jsx("div", { className: "p-6", children: children })] }) }) }));
};
//# sourceMappingURL=Dialog.js.map