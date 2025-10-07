import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

// Simple Loading Spinner Component
const LoadingSpinner = ({ size = 'md', message }: { size?: 'sm' | 'md' | 'lg'; message?: string }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`${sizeClasses[size]} border-2 border-blue-500 border-t-transparent rounded-full animate-spin`} />
      {message != null && message !== '' && <span className="text-sm text-gray-600">{message}</span>}
    </div>
  );
};

// Simple Skeleton Component
const PremiumSkeleton = ({ 
  variant = 'text', 
  width = '100%', 
  height = 20, 
  animation = 'pulse' 
}: { 
  variant?: 'text' | 'rectangular' | 'circular' | 'button';
  width?: string | number;
  height?: number;
  animation?: 'pulse' | 'wave' | 'shimmer';
}) => {
  const baseClasses = 'bg-gray-200 animate-pulse';
  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded',
    circular: 'rounded-full',
    button: 'rounded-lg'
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]}`}
      style={{ width, height }}
    />
  );
};

const meta: Meta = {
  title: 'Design System/Loading',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Loading Components

A comprehensive loading system with multiple components:

- **LoadingSpinner**: Animated spinner with customizable sizes
- **PremiumSkeleton**: Content-shape-matching skeleton loaders

## Features

- Multiple loading types (spinner, skeleton)
- Smooth animations
- Accessibility support
- Mobile-optimized performance
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ====== LOADING SPINNER ======

export const LoadingSpinnerStory: Story = {
  render: () => (
    <div className="flex flex-col gap-8 items-center">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4">Loading Spinner Sizes</h3>
        <div className="flex items-center gap-8">
          <div className="text-center">
            <LoadingSpinner size="sm" />
            <div className="text-sm text-gray-600 mt-2">Small</div>
          </div>
          <div className="text-center">
            <LoadingSpinner size="md" />
            <div className="text-sm text-gray-600 mt-2">Medium</div>
          </div>
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <div className="text-sm text-gray-600 mt-2">Large</div>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4">With Messages</h3>
        <div className="space-y-4">
          <LoadingSpinner size="md" message="Loading pets..." />
          <LoadingSpinner size="md" message="Processing match..." />
          <LoadingSpinner size="md" message="Uploading photo..." />
        </div>
      </div>
    </div>
  ),
};

// ====== PREMIUM SKELETON ======

export const PremiumSkeletonStory: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Skeleton Variants</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium">Text</h4>
            <PremiumSkeleton variant="text" width="100%" height={20} />
            <PremiumSkeleton variant="text" width="80%" height={16} />
            <PremiumSkeleton variant="text" width="60%" height={16} />
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium">Rectangular</h4>
            <PremiumSkeleton variant="rectangular" width={200} height={120} />
            <PremiumSkeleton variant="rectangular" width={150} height={80} />
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium">Circular</h4>
            <div className="flex items-center gap-4">
              <PremiumSkeleton variant="circular" width={40} height={40} />
              <PremiumSkeleton variant="circular" width={60} height={60} />
              <PremiumSkeleton variant="circular" width={80} height={80} />
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium">Button</h4>
            <div className="flex gap-2">
              <PremiumSkeleton variant="button" width={100} height={40} />
              <PremiumSkeleton variant="button" width={120} height={40} />
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Animations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium">Pulse</h4>
            <PremiumSkeleton variant="text" width="100%" height={20} animation="pulse" />
            <PremiumSkeleton variant="rectangular" width={200} height={100} animation="pulse" />
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium">Wave</h4>
            <PremiumSkeleton variant="text" width="100%" height={20} animation="wave" />
            <PremiumSkeleton variant="rectangular" width={200} height={100} animation="wave" />
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium">Shimmer</h4>
            <PremiumSkeleton variant="text" width="100%" height={20} animation="shimmer" />
            <PremiumSkeleton variant="rectangular" width={200} height={100} animation="shimmer" />
          </div>
        </div>
      </div>
    </div>
  ),
};

// ====== ENHANCED LOADING ======

const LoadingDemo = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<'spinner' | 'skeleton'>('spinner');

  const startLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <button
          onClick={startLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Start Loading
        </button>
        
        <select
          value={loadingType}
          onChange={(e) => setLoadingType(e.target.value as 'spinner' | 'skeleton')}
          className="px-3 py-2 border rounded"
        >
          <option value="spinner">Spinner</option>
          <option value="skeleton">Skeleton</option>
        </select>
      </div>
      
      <div className="w-96">
        {isLoading ? (
          loadingType === 'spinner' ? (
            <div className="flex items-center justify-center p-8">
              <LoadingSpinner size="lg" message="Loading content..." />
            </div>
          ) : (
            <div className="p-6 bg-white border rounded-lg shadow space-y-4">
              <PremiumSkeleton variant="text" height={24} />
              <PremiumSkeleton variant="text" width="80%" height={16} />
              <PremiumSkeleton variant="text" width="60%" height={16} />
              <div className="flex gap-2 mt-4">
                <PremiumSkeleton variant="circular" width={48} height={48} />
                <div className="flex-1 space-y-2">
                  <PremiumSkeleton variant="text" height={16} />
                  <PremiumSkeleton variant="text" width="75%" height={12} />
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="p-6 bg-white border rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Loaded Content</h3>
            <p className="text-gray-600">
              This content appears after loading is complete. The loading state
              shows different types of skeletons and spinners based on the selected options.
            </p>
            <div className="mt-4 flex gap-2">
              <div className="w-12 h-12 bg-blue-500 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const EnhancedLoadingStory: Story = {
  render: () => <LoadingDemo />,
};

// ====== SPECIALIZED SKELETONS ======

export const SpecializedSkeletons: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Pet Card Skeleton</h3>
        <div className="w-80">
          <div className="bg-white rounded-xl p-6 border shadow">
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-gray-200 rounded-xl animate-pulse" />
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse" />
                  <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-4 pt-4 border-t">
              <div className="h-10 bg-gray-200 rounded-lg flex-1 animate-pulse" />
              <div className="h-10 bg-gray-200 rounded-lg flex-1 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Chat List Skeleton</h3>
        <div className="w-96">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                </div>
                <div className="h-3 bg-gray-200 rounded w-12 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Profile Skeleton</h3>
        <div className="w-80">
          <div className="bg-white rounded-xl p-6 border shadow">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse" />
              <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto animate-pulse" />
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

// ====== LOADING STATES ======

export const LoadingStates: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Different Loading States</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">API Loading</h4>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-600">Fetching data...</span>
            </div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Form Processing</h4>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-600">Saving changes...</span>
            </div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Image Upload</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-600">Uploading image...</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full w-3/4 animate-pulse" />
              </div>
            </div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Page Navigation</h4>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-600">Loading page...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};
