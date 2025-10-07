/**
 * 🎨 UNIFIED DESIGN SYSTEM DEMO COMPONENT
 * Showcases all unified components and design tokens
 * Demonstrates visual consistency across variants and states
 */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { UnifiedPremiumButton } from './UnifiedPremiumButton';
import { UnifiedPremiumInput } from './UnifiedPremiumInput';
export function UnifiedDesignSystemDemo() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const handleSubmit = () => {
        setIsLoading(true);
        // Simulate validation
        if (!email.includes('@')) {
            setEmailError('Please enter a valid email address');
        }
        else {
            setEmailError('');
        }
        if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters');
        }
        else {
            setPasswordError('');
        }
        setTimeout(() => {
            setIsLoading(false);
        }, 2000);
    };
    const isFormValid = email.includes('@') && password.length >= 6;
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-red-900 p-8", children: _jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("h1", { className: "text-4xl font-bold text-white mb-4", children: "Unified Design System" }), _jsx("p", { className: "text-white/70 text-lg", children: "Consistent, accessible, and beautiful components across web and mobile" })] }), _jsxs("div", { className: "bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8", children: [_jsx("h2", { className: "text-2xl font-bold text-white mb-6", children: "Buttons" }), _jsxs("div", { className: "mb-8", children: [_jsx("h3", { className: "text-lg font-semibold text-white/80 mb-4", children: "Primary Variants" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx(UnifiedPremiumButton, { variant: "primary", size: "sm", children: "Small" }), _jsx(UnifiedPremiumButton, { variant: "primary", size: "md", children: "Medium" }), _jsx(UnifiedPremiumButton, { variant: "primary", size: "lg", children: "Large" }), _jsx(UnifiedPremiumButton, { variant: "primary", size: "xl", children: "Extra Large" })] })] }), _jsxs("div", { className: "mb-8", children: [_jsx("h3", { className: "text-lg font-semibold text-white/80 mb-4", children: "All Variants" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx(UnifiedPremiumButton, { variant: "primary", children: "Primary" }), _jsx(UnifiedPremiumButton, { variant: "secondary", children: "Secondary" }), _jsx(UnifiedPremiumButton, { variant: "glass", children: "Glass" }), _jsx(UnifiedPremiumButton, { variant: "outline", children: "Outline" })] })] }), _jsxs("div", { className: "mb-8", children: [_jsx("h3", { className: "text-lg font-semibold text-white/80 mb-4", children: "Interactive States" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [_jsx(UnifiedPremiumButton, { variant: "primary", loading: isLoading, onClick: () => setIsLoading(!isLoading), children: isLoading ? 'Loading...' : 'Toggle Loading' }), _jsx(UnifiedPremiumButton, { variant: "primary", disabled: true, children: "Disabled" }), _jsx(UnifiedPremiumButton, { variant: "primary", glow: true, children: "With Glow" })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-white/80 mb-4", children: "Validation States" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx(UnifiedPremiumButton, { variant: "primary", isValid: isFormValid, isDirty: email.length > 0 || password.length > 0, children: "Dynamic Validation" }), _jsx(UnifiedPremiumButton, { variant: "primary", isValid: false, isDirty: true, children: "Invalid State" })] })] })] }), _jsxs("div", { className: "bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8", children: [_jsx("h2", { className: "text-2xl font-bold text-white mb-6", children: "Inputs" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8", children: [_jsx(UnifiedPremiumInput, { label: "Default Input", placeholder: "Enter text...", value: email, onChange: setEmail, variant: "default" }), _jsx(UnifiedPremiumInput, { label: "Glass Input", placeholder: "Enter text...", value: email, onChange: setEmail, variant: "glass" }), _jsx(UnifiedPremiumInput, { label: "Outline Input", placeholder: "Enter text...", value: email, onChange: setEmail, variant: "outline" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-8", children: [_jsx(UnifiedPremiumInput, { label: "Small Input", placeholder: "Small...", value: email, onChange: setEmail, size: "sm" }), _jsx(UnifiedPremiumInput, { label: "Medium Input", placeholder: "Medium...", value: email, onChange: setEmail, size: "md" }), _jsx(UnifiedPremiumInput, { label: "Large Input", placeholder: "Large...", value: email, onChange: setEmail, size: "lg" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsx(UnifiedPremiumInput, { label: "Email with Error", placeholder: "Enter your email", value: email, onChange: setEmail, type: "email", error: emailError, required: true }), _jsx(UnifiedPremiumInput, { label: "Password with Success", placeholder: "Enter your password", value: password, onChange: setPassword, type: "password", success: password.length >= 6 && !passwordError, required: true })] })] }), _jsxs("div", { className: "bg-white/10 backdrop-blur-lg rounded-2xl p-8", children: [_jsx("h2", { className: "text-2xl font-bold text-white mb-6", children: "Complete Form Demo" }), _jsxs("div", { className: "max-w-md mx-auto space-y-6", children: [_jsx(UnifiedPremiumInput, { label: "Email Address", placeholder: "your@email.com", value: email, onChange: setEmail, type: "email", error: emailError, required: true }), _jsx(UnifiedPremiumInput, { label: "Password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", value: password, onChange: setPassword, type: "password", error: passwordError, required: true }), _jsx(UnifiedPremiumButton, { variant: "primary", size: "lg", fullWidth: true, loading: isLoading, isValid: isFormValid, isDirty: email.length > 0 || password.length > 0, glow: true, onClick: handleSubmit, children: "Sign In" })] })] }), _jsx("div", { className: "mt-12 text-center", children: _jsxs("div", { className: "bg-white/5 backdrop-blur-md rounded-xl p-6", children: [_jsx("h3", { className: "text-xl font-bold text-white mb-4", children: "Design System Features" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 text-white/70", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-white mb-2", children: "Consistent" }), _jsx("p", { children: "Unified styling across all platforms" })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-white mb-2", children: "Accessible" }), _jsx("p", { children: "WCAG 2.1 AA compliant" })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-white mb-2", children: "Responsive" }), _jsx("p", { children: "Mobile-first design approach" })] })] })] }) })] }) }));
}
//# sourceMappingURL=UnifiedDesignSystemDemo.js.map