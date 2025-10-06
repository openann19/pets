/**
 * 🎨 UNIFIED DESIGN SYSTEM DEMO COMPONENT
 * Showcases all unified components and design tokens
 * Demonstrates visual consistency across variants and states
 */

'use client';

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
    } else {
      setEmailError('');
    }
    
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
    } else {
      setPasswordError('');
    }
    
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const isFormValid = email.includes('@') && password.length >= 6;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-red-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Unified Design System
          </h1>
          <p className="text-white/70 text-lg">
            Consistent, accessible, and beautiful components across web and mobile
          </p>
        </div>

        {/* Buttons Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Buttons</h2>
          
          {/* Primary Buttons */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white/80 mb-4">Primary Variants</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <UnifiedPremiumButton variant="primary" size="sm">
                Small
              </UnifiedPremiumButton>
              <UnifiedPremiumButton variant="primary" size="md">
                Medium
              </UnifiedPremiumButton>
              <UnifiedPremiumButton variant="primary" size="lg">
                Large
              </UnifiedPremiumButton>
              <UnifiedPremiumButton variant="primary" size="xl">
                Extra Large
              </UnifiedPremiumButton>
            </div>
          </div>

          {/* Button Variants */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white/80 mb-4">All Variants</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <UnifiedPremiumButton variant="primary">
                Primary
              </UnifiedPremiumButton>
              <UnifiedPremiumButton variant="secondary">
                Secondary
              </UnifiedPremiumButton>
              <UnifiedPremiumButton variant="glass">
                Glass
              </UnifiedPremiumButton>
              <UnifiedPremiumButton variant="outline">
                Outline
              </UnifiedPremiumButton>
            </div>
          </div>

          {/* Button States */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white/80 mb-4">Interactive States</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <UnifiedPremiumButton 
                variant="primary" 
                loading={isLoading}
                onClick={() => setIsLoading(!isLoading)}
              >
                {isLoading ? 'Loading...' : 'Toggle Loading'}
              </UnifiedPremiumButton>
              
              <UnifiedPremiumButton variant="primary" disabled>
                Disabled
              </UnifiedPremiumButton>
              
              <UnifiedPremiumButton variant="primary" glow>
                With Glow
              </UnifiedPremiumButton>
            </div>
          </div>

          {/* Validation States */}
          <div>
            <h3 className="text-lg font-semibold text-white/80 mb-4">Validation States</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UnifiedPremiumButton 
                variant="primary" 
                isValid={isFormValid}
                isDirty={email.length > 0 || password.length > 0}
              >
                Dynamic Validation
              </UnifiedPremiumButton>
              
              <UnifiedPremiumButton 
                variant="primary" 
                isValid={false}
                isDirty={true}
              >
                Invalid State
              </UnifiedPremiumButton>
            </div>
          </div>
        </div>

        {/* Inputs Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Inputs</h2>
          
          {/* Input Variants */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <UnifiedPremiumInput
              label="Default Input"
              placeholder="Enter text..."
              value={email}
              onChange={setEmail}
              variant="default"
            />
            
            <UnifiedPremiumInput
              label="Glass Input"
              placeholder="Enter text..."
              value={email}
              onChange={setEmail}
              variant="glass"
            />
            
            <UnifiedPremiumInput
              label="Outline Input"
              placeholder="Enter text..."
              value={email}
              onChange={setEmail}
              variant="outline"
            />
          </div>

          {/* Input Sizes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <UnifiedPremiumInput
              label="Small Input"
              placeholder="Small..."
              value={email}
              onChange={setEmail}
              size="sm"
            />
            
            <UnifiedPremiumInput
              label="Medium Input"
              placeholder="Medium..."
              value={email}
              onChange={setEmail}
              size="md"
            />
            
            <UnifiedPremiumInput
              label="Large Input"
              placeholder="Large..."
              value={email}
              onChange={setEmail}
              size="lg"
            />
          </div>

          {/* Validation States */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UnifiedPremiumInput
              label="Email with Error"
              placeholder="Enter your email"
              value={email}
              onChange={setEmail}
              type="email"
              error={emailError}
              required
            />
            
            <UnifiedPremiumInput
              label="Password with Success"
              placeholder="Enter your password"
              value={password}
              onChange={setPassword}
              type="password"
              success={password.length >= 6 && !passwordError}
              required
            />
          </div>
        </div>

        {/* Form Demo */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Complete Form Demo</h2>
          
          <div className="max-w-md mx-auto space-y-6">
            <UnifiedPremiumInput
              label="Email Address"
              placeholder="your@email.com"
              value={email}
              onChange={setEmail}
              type="email"
              error={emailError}
              required
            />
            
            <UnifiedPremiumInput
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={setPassword}
              type="password"
              error={passwordError}
              required
            />
            
            <UnifiedPremiumButton
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              isValid={isFormValid}
              isDirty={email.length > 0 || password.length > 0}
              glow
              onClick={handleSubmit}
            >
              Sign In
            </UnifiedPremiumButton>
          </div>
        </div>

        {/* Design Tokens Info */}
        <div className="mt-12 text-center">
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Design System Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white/70">
              <div>
                <h4 className="font-semibold text-white mb-2">Consistent</h4>
                <p>Unified styling across all platforms</p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Accessible</h4>
                <p>WCAG 2.1 AA compliant</p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Responsive</h4>
                <p>Mobile-first design approach</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
