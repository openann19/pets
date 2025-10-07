import React from 'react';
export interface DialogProps {
    /**
     * Dialog content
     */
    children: React.ReactNode;
    /**
     * Dialog title
     */
    title?: string;
    /**
     * Dialog description
     */
    description?: string;
    /**
     * Whether the dialog is open
     */
    isOpen: boolean;
    /**
     * Close handler
     */
    onClose: () => void;
    /**
     * Dialog size
     */
    size?: 'small' | 'medium' | 'large' | 'fullscreen';
    /**
     * Additional CSS classes
     */
    className?: string;
    /**
     * Whether to close on outside click
     */
    isDismissable?: boolean;
    /**
     * Whether to close on escape key
     */
    isKeyboardDismissDisabled?: boolean;
}
/**
 * A dialog/modal component built with react-aria
 */
export declare const Dialog: React.FC<DialogProps>;
//# sourceMappingURL=Dialog.d.ts.map