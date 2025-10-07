import type { Meta, StoryObj } from '@storybook/react';
import { HeartIcon, StarIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { UnifiedPremiumButton } from './UnifiedPremiumButton';

const meta: Meta<typeof UnifiedPremiumButton> = {
  title: 'Components/UnifiedPremiumButton',
  component: UnifiedPremiumButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A unified premium button component with advanced animations, haptic feedback, and accessibility features.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'tertiary', 'glass', 'outline', 'ghost', 'danger', 'success', 'warning', 'holographic', 'neon'],
      description: 'Visual style variant of the button',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Size of the button',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the button is disabled',
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Whether the button is in loading state',
    },
    fullWidth: {
      control: { type: 'boolean' },
      description: 'Whether the button should take full width',
    },
    glow: {
      control: { type: 'boolean' },
      description: 'Whether to show glow effect on hover',
    },
    magneticEffect: {
      control: { type: 'boolean' },
      description: 'Whether to enable magnetic mouse tracking effect',
    },
    haptic: {
      control: { type: 'boolean' },
      description: 'Whether to enable haptic feedback',
    },
    sound: {
      control: { type: 'boolean' },
      description: 'Whether to enable sound feedback',
    },
    iconPosition: {
      control: { type: 'select' },
      options: ['left', 'right'],
      description: 'Position of the icon relative to text',
    },
    onClick: { action: 'clicked' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    children: 'Click me',
    variant: 'primary',
    size: 'md',
  },
};

// Variant showcase
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <UnifiedPremiumButton variant="primary">Primary</UnifiedPremiumButton>
      <UnifiedPremiumButton variant="secondary">Secondary</UnifiedPremiumButton>
      <UnifiedPremiumButton variant="tertiary">Tertiary</UnifiedPremiumButton>
      <UnifiedPremiumButton variant="glass">Glass</UnifiedPremiumButton>
      <UnifiedPremiumButton variant="outline">Outline</UnifiedPremiumButton>
      <UnifiedPremiumButton variant="ghost">Ghost</UnifiedPremiumButton>
      <UnifiedPremiumButton variant="danger">Danger</UnifiedPremiumButton>
      <UnifiedPremiumButton variant="success">Success</UnifiedPremiumButton>
      <UnifiedPremiumButton variant="warning">Warning</UnifiedPremiumButton>
      <UnifiedPremiumButton variant="holographic">Holographic</UnifiedPremiumButton>
      <UnifiedPremiumButton variant="neon">Neon</UnifiedPremiumButton>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available button variants with their unique styling.',
      },
    },
  },
};

// Size showcase
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <UnifiedPremiumButton size="sm">Small</UnifiedPremiumButton>
      <UnifiedPremiumButton size="md">Medium</UnifiedPremiumButton>
      <UnifiedPremiumButton size="lg">Large</UnifiedPremiumButton>
      <UnifiedPremiumButton size="xl">Extra Large</UnifiedPremiumButton>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different button sizes from small to extra large.',
      },
    },
  },
};

// With icons
export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <UnifiedPremiumButton icon={<HeartIcon className="w-5 h-5" />} iconPosition="left">
        Like
      </UnifiedPremiumButton>
      <UnifiedPremiumButton icon={<StarIcon className="w-5 h-5" />} iconPosition="right">
        Favorite
      </UnifiedPremiumButton>
      <UnifiedPremiumButton icon={<SparklesIcon className="w-5 h-5" />} variant="holographic">
        Magic
      </UnifiedPremiumButton>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Buttons with icons positioned on the left or right.',
      },
    },
  },
};

// States
export const States: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <UnifiedPremiumButton>Normal</UnifiedPremiumButton>
      <UnifiedPremiumButton disabled>Disabled</UnifiedPremiumButton>
      <UnifiedPremiumButton loading>Loading</UnifiedPremiumButton>
      <UnifiedPremiumButton isValid={false}>Invalid</UnifiedPremiumButton>
      <UnifiedPremiumButton isDirty={false}>Not Dirty</UnifiedPremiumButton>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different button states including disabled, loading, and validation states.',
      },
    },
  },
};

// Effects
export const Effects: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <UnifiedPremiumButton glow>Glow Effect</UnifiedPremiumButton>
      <UnifiedPremiumButton magneticEffect>Magnetic Effect</UnifiedPremiumButton>
      <UnifiedPremiumButton glow magneticEffect>Both Effects</UnifiedPremiumButton>
      <UnifiedPremiumButton variant="holographic" glow>Holographic + Glow</UnifiedPremiumButton>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Buttons with various visual effects like glow and magnetic tracking.',
      },
    },
  },
};

// Full width
export const FullWidth: Story = {
  render: () => (
    <div className="w-96">
      <UnifiedPremiumButton fullWidth className="mb-4">
        Full Width Button
      </UnifiedPremiumButton>
      <UnifiedPremiumButton fullWidth variant="glass">
        Full Width Glass
      </UnifiedPremiumButton>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Buttons that take the full width of their container.',
      },
    },
  },
};

// Accessibility
export const Accessibility: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <UnifiedPremiumButton aria-label="Like this post">
        <HeartIcon className="w-5 h-5" />
      </UnifiedPremiumButton>
      <UnifiedPremiumButton aria-describedby="help-text">
        Need Help?
      </UnifiedPremiumButton>
      <UnifiedPremiumButton aria-pressed={true}>
        Toggle
      </UnifiedPremiumButton>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Buttons with proper accessibility attributes for screen readers.',
      },
    },
  },
};

// Interactive playground
export const Playground: Story = {
  args: {
    children: 'Playground Button',
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    fullWidth: false,
    glow: false,
    magneticEffect: false,
    haptic: true,
    sound: true,
    icon: <HeartIcon className="w-5 h-5" />,
    iconPosition: 'left',
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground to test all button properties.',
      },
    },
  },
};
