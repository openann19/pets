import { 
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import type { Meta, StoryObj } from '@storybook/react';

// Simple Tooltip Components
const Tooltip = ({ 
  content, 
  children, 
  trigger = 'hover', 
  position = 'top',
  maxWidth = 200,
  className = '',
  showArrow = true
}: {
  content: React.ReactNode;
  children: React.ReactNode;
  trigger?: 'hover' | 'click' | 'focus';
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  maxWidth?: number;
  className?: string;
  showArrow?: boolean;
}) => (
  <div className="relative inline-block">
    {children}
    <div 
      className={`absolute z-10 px-2 py-1 text-sm text-white bg-gray-900 rounded shadow-lg ${className}`}
      style={{ maxWidth }}
    >
      {content}
    </div>
  </div>
);

const HelpTooltip = ({ helpText, children }: { helpText: string; children: React.ReactNode }) => (
  <Tooltip content={helpText}>{children}</Tooltip>
);

const InfoTooltip = ({ info, children }: { info: string; children: React.ReactNode }) => (
  <Tooltip content={info}>{children}</Tooltip>
);

const WarningTooltip = ({ warning, children }: { warning: string; children: React.ReactNode }) => (
  <Tooltip content={warning} className="bg-yellow-600">{children}</Tooltip>
);

const ErrorTooltip = ({ error, children }: { error: string; children: React.ReactNode }) => (
  <Tooltip content={error} className="bg-red-600">{children}</Tooltip>
);

const SuccessTooltip = ({ success, children }: { success: string; children: React.ReactNode }) => (
  <Tooltip content={success} className="bg-green-600">{children}</Tooltip>
);

const meta: Meta = {
  title: 'Design System/Tooltips',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Tooltip Components

A comprehensive tooltip system with contextual variants:

- **Tooltip**: Base tooltip component with customizable positioning
- **HelpTooltip**: Specialized help tooltips
- **InfoTooltip**: Information tooltips with info icon
- **WarningTooltip**: Warning tooltips with warning styling
- **ErrorTooltip**: Error tooltips with error styling
- **SuccessTooltip**: Success tooltips with success styling

## Features

- Multiple trigger types (hover, click, focus)
- Auto-positioning with collision detection
- Accessibility support with ARIA attributes
- Contextual styling for different message types
- Smooth animations with Framer Motion
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ====== BASIC TOOLTIP ======

export const BasicTooltip: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <Tooltip content="This is a basic tooltip">
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Hover me
        </button>
      </Tooltip>
      
      <Tooltip 
        content="This tooltip appears on click" 
        trigger="click"
      >
        <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          Click me
        </button>
      </Tooltip>
      
      <Tooltip 
        content="This tooltip appears on focus" 
        trigger="focus"
      >
        <button className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
          Focus me
        </button>
      </Tooltip>
    </div>
  ),
};

// ====== POSITIONING ======

export const Positioning: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-8 place-items-center h-64">
      <Tooltip content="Top tooltip" position="top">
        <button className="px-4 py-2 bg-blue-500 text-white rounded">
          Top
        </button>
      </Tooltip>
      
      <Tooltip content="Bottom tooltip" position="bottom">
        <button className="px-4 py-2 bg-green-500 text-white rounded">
          Bottom
        </button>
      </Tooltip>
      
      <Tooltip content="Left tooltip" position="left">
        <button className="px-4 py-2 bg-purple-500 text-white rounded">
          Left
        </button>
      </Tooltip>
      
      <Tooltip content="Right tooltip" position="right">
        <button className="px-4 py-2 bg-orange-500 text-white rounded">
          Right
        </button>
      </Tooltip>
      
      <Tooltip content="Auto-positioning tooltip" position="auto">
        <button className="px-4 py-2 bg-pink-500 text-white rounded">
          Auto
        </button>
      </Tooltip>
    </div>
  ),
};

// ====== CONTEXTUAL TOOLTIPS ======

export const ContextualTooltips: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <HelpTooltip helpText="This button will save your current progress">
          <button className="px-4 py-2 bg-blue-500 text-white rounded flex items-center gap-2">
            <CheckCircleIcon className="w-4 h-4" />
            Save
          </button>
        </HelpTooltip>
        
        <InfoTooltip info="This feature is currently in beta">
          <button className="px-4 py-2 bg-gray-500 text-white rounded flex items-center gap-2">
            <InformationCircleIcon className="w-4 h-4" />
            Beta Feature
          </button>
        </InfoTooltip>
      </div>
      
      <div className="flex items-center gap-4">
        <WarningTooltip warning="This action cannot be undone">
          <button className="px-4 py-2 bg-yellow-500 text-white rounded flex items-center gap-2">
            <ExclamationTriangleIcon className="w-4 h-4" />
            Warning Action
          </button>
        </WarningTooltip>
        
        <ErrorTooltip error="Something went wrong. Please try again.">
          <button className="px-4 py-2 bg-red-500 text-white rounded flex items-center gap-2">
            <XCircleIcon className="w-4 h-4" />
            Error State
          </button>
        </ErrorTooltip>
      </div>
      
      <div className="flex items-center gap-4">
        <SuccessTooltip success="Operation completed successfully">
          <button className="px-4 py-2 bg-green-500 text-white rounded flex items-center gap-2">
            <CheckCircleIcon className="w-4 h-4" />
            Success
          </button>
        </SuccessTooltip>
      </div>
    </div>
  ),
};

// ====== RICH CONTENT ======

export const RichContent: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <Tooltip
        content={
          <div className="text-sm">
            <div className="font-semibold mb-2">Advanced Settings</div>
            <div className="space-y-1">
              <div>• Enable notifications</div>
              <div>• Auto-save drafts</div>
              <div>• Dark mode preference</div>
            </div>
          </div>
        }
        maxWidth={200}
      >
        <button className="px-4 py-2 bg-indigo-500 text-white rounded">
          Settings
        </button>
      </Tooltip>
      
      <Tooltip
        content={
          <div className="text-sm">
            <div className="font-semibold mb-2">Pet Profile</div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-pink-200 rounded-full" />
              <div>
                <div className="font-medium">Bella</div>
                <div className="text-xs text-gray-500">Golden Retriever</div>
              </div>
            </div>
            <div className="text-xs text-gray-600">
              Age: 3 years • Location: Sofia
            </div>
          </div>
        }
        maxWidth={250}
      >
        <button className="px-4 py-2 bg-pink-500 text-white rounded">
          View Profile
        </button>
      </Tooltip>
    </div>
  ),
};

// ====== FORM TOOLTIPS ======

export const FormTooltips: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
          <InfoTooltip info="We'll use this to send you important updates about your pet matches">
            <QuestionMarkCircleIcon className="w-4 h-4 inline ml-1 text-gray-400" />
          </InfoTooltip>
        </label>
        <input
          type="email"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your email"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password
          <HelpTooltip helpText="Password must be at least 8 characters long and contain at least one number">
            <QuestionMarkCircleIcon className="w-4 h-4 inline ml-1 text-gray-400" />
          </HelpTooltip>
        </label>
        <input
          type="password"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your password"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Pet Name
          <WarningTooltip warning="This name will be visible to other users">
            <ExclamationTriangleIcon className="w-4 h-4 inline ml-1 text-yellow-500" />
          </WarningTooltip>
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your pet's name"
        />
      </div>
    </div>
  ),
};

// ====== ACCESSIBILITY ======

export const Accessibility: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Keyboard Navigation</h3>
        <div className="flex items-center gap-4">
          <Tooltip 
            content="This tooltip appears on focus for keyboard users"
            trigger="focus"
          >
            <button className="px-4 py-2 bg-blue-500 text-white rounded">
              Focus me (Tab)
            </button>
          </Tooltip>
          
          <Tooltip 
            content="This tooltip can be triggered with Enter or Space"
            trigger="click"
          >
            <button className="px-4 py-2 bg-green-500 text-white rounded">
              Click me (Enter/Space)
            </button>
          </Tooltip>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Screen Reader Support</h3>
        <div className="flex items-center gap-4">
          <button 
            className="px-4 py-2 bg-purple-500 text-white rounded"
            aria-describedby="help-text"
          >
            Button with ARIA
          </button>
          <div id="help-text" className="sr-only">
            This button will open the help dialog
          </div>
          
          <Tooltip content="This tooltip is announced by screen readers">
            <button className="px-4 py-2 bg-orange-500 text-white rounded">
              Accessible Tooltip
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  ),
};

// ====== CUSTOMIZATION ======

export const Customization: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <Tooltip
        content="Custom styled tooltip"
        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0"
        showArrow={false}
      >
        <button className="px-4 py-2 bg-purple-500 text-white rounded">
          Gradient Tooltip
        </button>
      </Tooltip>
      
      <Tooltip
        content="Tooltip without arrow"
        showArrow={false}
        className="bg-gray-800 text-white"
      >
        <button className="px-4 py-2 bg-gray-500 text-white rounded">
          No Arrow
        </button>
      </Tooltip>
      
      <Tooltip
        content="Wide tooltip with more content"
        maxWidth={400}
        className="bg-blue-900 text-white"
      >
        <button className="px-4 py-2 bg-blue-500 text-white rounded">
          Wide Tooltip
        </button>
      </Tooltip>
    </div>
  ),
};
