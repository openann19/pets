/**
 * 💎 UNIFIED MESSAGE LIST COMPONENT
 * Advanced message list with smooth animations and premium interactions
 * Features: Staggered animations, auto-scroll, and glass morphism styling
 */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useEffect, useState, useCallback } from 'react';
import { ANIMATIONS } from '../theme/design-tokens';
import { UnifiedMessageBubble } from './UnifiedMessageBubble';
import { UnifiedTypingIndicator } from './UnifiedTypingIndicator';
export function UnifiedMessageList({ messages, currentUserId, typingUsers = [], isLoading = false, hasMoreMessages = false, onLoadMore, onReaction, onImageClick, variant = 'glass', enableAnimations = true, enableReactions = true, autoScroll = true, className = '', }) {
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = useCallback(() => {
        if (autoScroll && isScrolledToBottom) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [autoScroll, isScrolledToBottom]);
    // Check if user is scrolled to bottom
    const handleScroll = useCallback(() => {
        if (!messagesContainerRef.current)
            return;
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
        setIsScrolledToBottom(isAtBottom);
    }, []);
    // Load more messages
    const handleLoadMore = useCallback(async () => {
        if (isLoadingMore || !onLoadMore)
            return;
        setIsLoadingMore(true);
        try {
            await onLoadMore();
        }
        finally {
            setIsLoadingMore(false);
        }
    }, [isLoadingMore, onLoadMore]);
    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);
    // Determine if avatar should be shown
    const shouldShowAvatar = (message, index) => {
        if (index === 0)
            return true;
        const previousMessage = messages[index - 1];
        return previousMessage.sender.id !== message.sender.id;
    };
    // Group consecutive messages from the same sender
    const groupedMessages = messages.reduce((groups, message, index) => {
        const isOwnMessage = message.sender.id === currentUserId;
        const showAvatar = shouldShowAvatar(message, index);
        groups.push({
            ...message,
            isOwnMessage,
            showAvatar,
        });
        return groups;
    }, []);
    return (_jsxs("div", { className: `flex flex-col h-full ${className}`, children: [hasMoreMessages && (_jsx(motion.div, { className: "flex justify-center p-4", initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, transition: ANIMATIONS.spring.smooth, children: _jsx("button", { onClick: handleLoadMore, disabled: isLoadingMore, className: "px-4 py-2 bg-white/80 backdrop-blur-xl rounded-full text-sm font-medium text-gray-700 border border-gray-200 hover:bg-white transition-colors disabled:opacity-50", children: isLoadingMore ? 'Loading...' : 'Load more messages' }) })), _jsxs("div", { ref: messagesContainerRef, className: "flex-1 overflow-y-auto px-4 py-2 space-y-4", onScroll: handleScroll, children: [_jsx(AnimatePresence, { initial: false, children: groupedMessages.map((message, index) => (_jsx(motion.div, { initial: enableAnimations ? { opacity: 0, y: 20 } : false, animate: { opacity: 1, y: 0 }, transition: {
                                ...ANIMATIONS.spring.smooth,
                                delay: enableAnimations ? index * 0.05 : 0,
                            }, layout: true, children: _jsx(UnifiedMessageBubble, { message: message, isOwnMessage: message.isOwnMessage, showAvatar: message.showAvatar, enableReactions: enableReactions, enableAnimations: enableAnimations, variant: variant, onReaction: onReaction, onImageClick: onImageClick }) }, message.id))) }), _jsx(UnifiedTypingIndicator, { isVisible: typingUsers.length > 0, users: typingUsers, variant: variant }), _jsx("div", { ref: messagesEndRef })] }), !isScrolledToBottom && (_jsx(motion.button, { className: "absolute bottom-20 right-6 w-12 h-12 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors", initial: { opacity: 0, scale: 0 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0 }, whileHover: { scale: 1.1 }, whileTap: { scale: 0.9 }, onClick: scrollToBottom, "aria-label": "Scroll to bottom", children: _jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 14l-7 7m0 0l-7-7m7 7V3" }) }) })), isLoading && (_jsx(motion.div, { className: "absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center", initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, children: _jsxs("div", { className: "flex flex-col items-center gap-3", children: [_jsx(motion.div, { className: "w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full", animate: { rotate: 360 }, transition: {
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                            } }), _jsx("p", { className: "text-gray-600 text-sm", children: "Loading messages..." })] }) }))] }));
}
export function EmptyMessageList({ variant = 'glass', className = '' }) {
    const getVariantStyles = () => {
        const variants = {
            default: 'text-gray-500',
            glass: 'text-gray-600',
            elevated: 'text-gray-600',
            gradient: 'text-gray-600',
        };
        return variants[variant];
    };
    return (_jsxs(motion.div, { className: `flex flex-col items-center justify-center h-full ${className}`, initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: ANIMATIONS.spring.smooth, children: [_jsx("div", { className: "w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary-100 to-secondary-100 flex items-center justify-center", children: _jsx("svg", { className: "w-8 h-8 text-primary-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" }) }) }), _jsx("h3", { className: "text-lg font-semibold mb-2", children: "No messages yet" }), _jsx("p", { className: `text-center max-w-sm ${getVariantStyles()}`, children: "Start the conversation! Send a message to begin chatting." })] }));
}
//# sourceMappingURL=UnifiedMessageList.js.map