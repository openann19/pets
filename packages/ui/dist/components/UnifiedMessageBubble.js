/**
 * 💎 UNIFIED MESSAGE BUBBLE COMPONENT
 * Advanced message bubble with animations, reactions, and premium styling
 * Features: Smooth animations, message reactions, and glass morphism effects
 */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';
import { HeartIcon, FaceSmileIcon, HandThumbUpIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, HandThumbUpIcon as HandThumbUpSolidIcon } from '@heroicons/react/24/solid';
import { ANIMATIONS } from '../theme/design-tokens';
const reactionEmojis = [
    { emoji: '❤️', icon: HeartIcon, solidIcon: HeartSolidIcon },
    { emoji: '👍', icon: HandThumbUpIcon, solidIcon: HandThumbUpSolidIcon },
    { emoji: '😊', icon: FaceSmileIcon, solidIcon: FaceSmileIcon },
];
export function UnifiedMessageBubble({ message, isOwnMessage, showAvatar = true, showTimestamp = true, enableReactions = true, enableAnimations = true, variant = 'default', onReaction, onImageClick, className = '', }) {
    const [showReactions, setShowReactions] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    // Get variant styles
    const getVariantStyles = () => {
        const variants = {
            default: {
                own: 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white',
                other: 'bg-white text-gray-900 shadow-sm border border-gray-100',
            },
            glass: {
                own: 'bg-gradient-to-r from-primary-500/80 to-secondary-500/80 backdrop-blur-xl text-white border border-white/20',
                other: 'bg-white/80 backdrop-blur-xl text-gray-900 border border-white/30',
            },
            elevated: {
                own: 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg',
                other: 'bg-white text-gray-900 shadow-lg border border-gray-100',
            },
            gradient: {
                own: 'bg-gradient-to-r from-primary-500 to-tertiary-500 text-white',
                other: 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900 border border-gray-200',
            },
        };
        return variants[variant];
    };
    const variantStyles = getVariantStyles();
    const bubbleStyle = isOwnMessage ? variantStyles.own : variantStyles.other;
    // Handle reaction
    const handleReaction = useCallback((emoji) => {
        onReaction?.(message.id, emoji);
        setShowReactions(false);
    }, [message.id, onReaction]);
    // Format timestamp
    const formatTimestamp = (timestamp) => {
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        }).format(timestamp);
    };
    // Check if user has reacted
    const hasUserReacted = (emoji) => {
        return message.reactions?.some(reaction => reaction.emoji === emoji && reaction.users.includes(message.sender.id));
    };
    return (_jsxs(motion.div, { className: `flex items-end gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} ${className}`, initial: enableAnimations ? { opacity: 0, y: 20 } : false, animate: { opacity: 1, y: 0 }, transition: ANIMATIONS.spring.smooth, onHoverStart: () => setIsHovered(true), onHoverEnd: () => setIsHovered(false), children: [showAvatar && !isOwnMessage && (_jsx(motion.div, { className: "w-8 h-8 rounded-full bg-gradient-to-r from-primary-400 to-secondary-400 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0", initial: enableAnimations ? { scale: 0 } : false, animate: { scale: 1 }, transition: { ...ANIMATIONS.spring.bouncy, delay: 0.1 }, children: message.sender.avatar ? (_jsx("img", { src: message.sender.avatar, alt: message.sender.name, className: "w-full h-full rounded-full object-cover" })) : (message.sender.name.charAt(0).toUpperCase()) })), _jsxs("div", { className: `max-w-xs lg:max-w-md ${isOwnMessage ? 'mr-2' : 'ml-2'}`, children: [!isOwnMessage && showAvatar && (_jsx(motion.p, { className: "text-xs text-gray-500 mb-1 ml-3", initial: enableAnimations ? { opacity: 0, x: -10 } : false, animate: { opacity: 1, x: 0 }, transition: { ...ANIMATIONS.spring.smooth, delay: 0.1 }, children: message.sender.name })), _jsxs(motion.div, { className: `relative px-4 py-2 rounded-2xl ${bubbleStyle} ${isOwnMessage ? 'rounded-br-md' : 'rounded-bl-md'}`, initial: enableAnimations ? { scale: 0.8, opacity: 0 } : false, animate: { scale: 1, opacity: 1 }, transition: ANIMATIONS.spring.bouncy, whileHover: enableAnimations ? { scale: 1.02 } : {}, children: [message.messageType === 'text' && (_jsx("p", { className: "text-sm leading-relaxed whitespace-pre-wrap break-words", children: message.content })), message.messageType === 'image' && message.attachments && (_jsxs("div", { className: "space-y-2", children: [message.attachments.map((attachment, index) => (_jsx(motion.div, { className: "rounded-lg overflow-hidden", initial: enableAnimations ? { scale: 0.9, opacity: 0 } : false, animate: { scale: 1, opacity: 1 }, transition: { ...ANIMATIONS.spring.smooth, delay: index * 0.1 }, children: _jsx("img", { src: attachment.url, alt: attachment.fileName || 'Image', className: "max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity", onClick: () => onImageClick?.(attachment.url) }) }, index))), message.content && (_jsx("p", { className: "text-sm leading-relaxed mt-2", children: message.content }))] })), message.messageType === 'location' && (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "bg-black/10 rounded-lg p-3 text-center", children: [_jsx("p", { className: "text-sm", children: "\uD83D\uDCCD Location shared" }), _jsx("p", { className: "text-xs opacity-80 mt-1", children: "Tap to view in maps" })] }), message.content && (_jsx("p", { className: "text-sm leading-relaxed", children: message.content }))] })), message.messageType === 'system' && (_jsx("div", { className: "text-center", children: _jsx("p", { className: "text-xs opacity-80 italic", children: message.content }) })), _jsxs("div", { className: `flex items-center gap-1 mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`, children: [showTimestamp && (_jsx("span", { className: "text-xs opacity-60", children: formatTimestamp(message.timestamp) })), isOwnMessage && (_jsxs("div", { className: "flex items-center gap-1", children: [message.isDelivered && (_jsx(motion.div, { className: "w-3 h-3 rounded-full bg-white/20 flex items-center justify-center", initial: { scale: 0 }, animate: { scale: 1 }, transition: ANIMATIONS.spring.micro, children: _jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-white" }) })), message.isRead && (_jsx(motion.div, { className: "w-3 h-3 rounded-full bg-white/20 flex items-center justify-center", initial: { scale: 0 }, animate: { scale: 1 }, transition: { ...ANIMATIONS.spring.micro, delay: 0.1 }, children: _jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-white" }) }))] }))] })] }), message.reactions && message.reactions.length > 0 && (_jsx(motion.div, { className: `flex flex-wrap gap-1 mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`, initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: ANIMATIONS.spring.smooth, children: message.reactions.map((reaction, index) => (_jsxs(motion.button, { className: "flex items-center gap-1 px-2 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs border border-gray-200 hover:bg-white transition-colors", initial: { scale: 0 }, animate: { scale: 1 }, transition: { ...ANIMATIONS.spring.bouncy, delay: index * 0.05 }, whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, onClick: () => handleReaction(reaction.emoji), children: [_jsx("span", { children: reaction.emoji }), _jsx("span", { className: "text-gray-600", children: reaction.users.length })] }, index))) })), _jsx(AnimatePresence, { children: showReactions && enableReactions && (_jsx(motion.div, { className: `absolute ${isOwnMessage ? 'left-0' : 'right-0'} -top-12 bg-white/90 backdrop-blur-xl rounded-full px-3 py-2 shadow-lg border border-gray-200 flex items-center gap-2`, initial: { opacity: 0, scale: 0.8, y: 10 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.8, y: 10 }, transition: ANIMATIONS.spring.micro, children: reactionEmojis.map((reaction, index) => {
                                const IconComponent = hasUserReacted(reaction.emoji) ? reaction.solidIcon : reaction.icon;
                                return (_jsx(motion.button, { className: "p-1 hover:bg-gray-100 rounded-full transition-colors", whileHover: { scale: 1.1 }, whileTap: { scale: 0.9 }, onClick: () => handleReaction(reaction.emoji), initial: { scale: 0 }, animate: { scale: 1 }, transition: { ...ANIMATIONS.spring.bouncy, delay: index * 0.05 }, children: _jsx(IconComponent, { className: "w-5 h-5 text-gray-600" }) }, index));
                            }) })) })] }), enableReactions && isHovered && (_jsx(motion.button, { className: "opacity-0 hover:opacity-100 transition-opacity p-1", onClick: () => setShowReactions(!showReactions), initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.8 }, whileHover: { scale: 1.1 }, whileTap: { scale: 0.9 }, children: _jsx(FaceSmileIcon, { className: "w-4 h-4 text-gray-400" }) }))] }));
}
//# sourceMappingURL=UnifiedMessageBubble.js.map