/**
 * Toast Notification Utility
 * Wrapper around sonner for consistent toast notifications
 */

import { toast as sonnerToast } from 'sonner';

interface ToastOptions {
    description?: string;
    duration?: number;
}

export const toast = {
    success: (message: string, options?: ToastOptions) => {
        sonnerToast.success(message, {
            description: options?.description,
            duration: options?.duration || 3000,
        });
    },

    error: (message: string, options?: ToastOptions) => {
        sonnerToast.error(message, {
            description: options?.description,
            duration: options?.duration || 5000,
        });
    },

    info: (message: string, options?: ToastOptions) => {
        sonnerToast.info(message, {
            description: options?.description,
            duration: options?.duration || 3000,
        });
    },

    warning: (message: string, options?: ToastOptions) => {
        sonnerToast.warning(message, {
            description: options?.description,
            duration: options?.duration || 4000,
        });
    },

    loading: (message: string) => {
        return sonnerToast.loading(message);
    },

    dismiss: (toastId?: string | number) => {
        sonnerToast.dismiss(toastId);
    },

    promise: <T,>(
        promise: Promise<T>,
        messages: {
            loading: string;
            success: string | ((data: T) => string);
            error: string | ((error: Error) => string);
        }
    ) => {
        return sonnerToast.promise(promise, messages);
    },
};

// Predefined moderation toasts
export const moderationToasts = {
    reportSuccess: () => toast.success('Report submitted', {
        description: 'Thank you for helping keep our community safe',
    }),

    reportError: () => toast.error('Failed to submit report', {
        description: 'Please try again later',
    }),

    blockSuccess: (userName?: string) => toast.success('User blocked', {
        description: userName ? `${userName} has been blocked` : 'You will no longer see content from this user',
    }),

    blockError: () => toast.error('Failed to block user', {
        description: 'Please try again',
    }),

    unblockSuccess: (userName?: string) => toast.success('User unblocked', {
        description: userName ? `${userName} has been unblocked` : 'User has been unblocked',
    }),

    unblockError: () => toast.error('Failed to unblock user'),

    muteSuccess: (duration: number) => {
        const hours = Math.floor(duration / 60);
        const mins = duration % 60;
        const durationText = hours > 0
            ? `${hours}h ${mins}m`
            : `${mins} minutes`;

        toast.success('User muted', {
            description: `Muted for ${durationText}`,
        });
    },

    muteError: () => toast.error('Failed to mute user'),

    unmuteSuccess: () => toast.success('User unmuted'),

    unmuteError: () => toast.error('Failed to unmute user'),
};
