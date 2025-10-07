import { 
  HeartIcon, 
  StarIcon, 
  SparklesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';

import { UnifiedPremiumButton } from '../Premium/UnifiedPremiumButton';

const meta: Meta<typeof UnifiedPremiumButton> = {
  title: 'Design System/Buttons/UnifiedPremiumButton',
  component: UnifiedPremiumButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# UnifiedPremiumButton

A premium button component with advanced features including:

- **10+ Variants**: primary, secondary, glass, outline, ghost, text, danger, success, warning, holographic, neon
- **Magnetic Effect**: Buttons attract cursor on hover
- **Haptic Feedback**: Vibration on mobile devices
- **Sound Feedback**: Audio cues on interaction
- **Ripple Animations**: Material Design-style touch feedback
- **WCAG AA Compliant**: Full accessibility support
- **Mobile-First Responsive**: Perfect touch targets

## Usage

\`\`\`tsx
<UnifiedPremiumButton variant="primary" onClick={handleClick}>
  Click me
</UnifiedPremiumButton>
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: [
        'primary',
        'secondary', 
        'glass',
        'outline',
        'ghost',
        'text',
        'danger',
        'success',
        'warning',
        'holographic',
        'neon',
      ],
      description: 'Button variant style',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Button size',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disable the button',
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Show loading state',
    },
    fullWidth: {
      control: { type: 'boolean' },
      description: 'Make button full width',
    },
    glow: {
      control: { type: 'boolean' },
      description: 'Enable glow effect',
    },
    haptic: {
      control: { type: 'boolean' },
      description: 'Enable haptic feedback',
    },
    sound: {
      control: { type: 'boolean' },
      description: 'Enable sound feedback',
    },
    particles: {
      control: { type: 'boolean' },
      description: 'Enable particle effects',
    },
    magneticEffect: {
      control: { type: 'boolean' },
      description: 'Enable magnetic cursor effect',
    },
    iconPosition: {
      control: { type: 'select' },
      options: ['left', 'right'],
      description: 'Icon position',
    },
  },
  args: {
    onClick: action('clicked') as () => void,
    children: 'Button',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ====== BASIC VARIANTS ======

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const Glass: Story = {
  args: {
    variant: 'glass',
    children: 'Glass Button',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Button',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
};

export const Text: Story = {
  args: {
    variant: 'text',
    children: 'Text Button',
  },
};

// ====== STATUS VARIANTS ======

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Danger Button',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Success Button',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Warning Button',
  },
};

// ====== PREMIUM VARIANTS ======

export const Holographic: Story = {
  args: {
    variant: 'holographic',
    children: 'Holographic Button',
    glow: true,
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

export const Neon: Story = {
  args: {
    variant: 'neon',
    children: 'Neon Button',
    glow: true,
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

// ====== SIZES ======

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <UnifiedPremiumButton size="sm">Small</UnifiedPremiumButton>
      <UnifiedPremiumButton size="md">Medium</UnifiedPremiumButton>
      <UnifiedPremiumButton size="lg">Large</UnifiedPremiumButton>
      <UnifiedPremiumButton size="xl">Extra Large</UnifiedPremiumButton>
    </div>
  ),
};

// ====== STATES ======

export const States: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <UnifiedPremiumButton>Normal</UnifiedPremiumButton>
      <UnifiedPremiumButton disabled>Disabled</UnifiedPremiumButton>
      <UnifiedPremiumButton loading>Loading</UnifiedPremiumButton>
    </div>
  ),
};

// ====== WITH ICONS ======

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <UnifiedPremiumButton icon={<HeartIcon className="w-5 h-5" />}>
          Like
        </UnifiedPremiumButton>
        <UnifiedPremiumButton 
          variant="secondary" 
          icon={<StarIcon className="w-5 h-5" />}
          iconPosition="right"
        >
          Favorite
        </UnifiedPremiumButton>
      </div>
      <div className="flex items-center gap-4">
        <UnifiedPremiumButton 
          variant="success" 
          icon={<CheckCircleIcon className="w-5 h-5" />}
        >
          Success
        </UnifiedPremiumButton>
        <UnifiedPremiumButton 
          variant="danger" 
          icon={<XCircleIcon className="w-5 h-5" />}
        >
          Delete
        </UnifiedPremiumButton>
        <UnifiedPremiumButton 
          variant="warning" 
          icon={<ExclamationTriangleIcon className="w-5 h-5" />}
        >
          Warning
        </UnifiedPremiumButton>
      </div>
    </div>
  ),
};

// ====== PREMIUM FEATURES ======

export const PremiumFeatures: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <UnifiedPremiumButton glow>
          With Glow
        </UnifiedPremiumButton>
        <UnifiedPremiumButton particles>
          With Particles
        </UnifiedPremiumButton>
        <UnifiedPremiumButton magneticEffect>
          Magnetic Effect
        </UnifiedPremiumButton>
      </div>
      <div className="flex items-center gap-4">
        <UnifiedPremiumButton haptic>
          Haptic Feedback
        </UnifiedPremiumButton>
        <UnifiedPremiumButton sound>
          Sound Feedback
        </UnifiedPremiumButton>
        <UnifiedPremiumButton 
          glow 
          particles 
          magneticEffect 
          haptic 
          sound
        >
          All Features
        </UnifiedPremiumButton>
      </div>
    </div>
  ),
};

// ====== FULL WIDTH ======

export const FullWidth: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <UnifiedPremiumButton fullWidth>
        Full Width Button
      </UnifiedPremiumButton>
      <UnifiedPremiumButton variant="outline" fullWidth>
        Full Width Outline
      </UnifiedPremiumButton>
    </div>
  ),
};

// ====== ACCESSIBILITY ======

export const Accessibility: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <UnifiedPremiumButton
        aria-label="Like this pet"
        aria-describedby="like-help"
      >
        Like
      </UnifiedPremiumButton>
      <div id="like-help" className="text-sm text-gray-600">
        Click to like this pet profile
      </div>
      
      <UnifiedPremiumButton
        variant="danger"
        aria-label="Delete pet profile"
        aria-describedby="delete-warning"
      >
        Delete
      </UnifiedPremiumButton>
      <div id="delete-warning" className="text-sm text-red-600">
        This action cannot be undone
      </div>
    </div>
  ),
};

// ====== INTERACTIVE PLAYGROUND ======

export const Playground: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Playground Button',
    disabled: false,
    loading: false,
    fullWidth: false,
    glow: false,
    haptic: true,
    sound: true,
    particles: false,
    magneticEffect: false,
    icon: <SparklesIcon className="w-5 h-5" />,
    iconPosition: 'left',
  },
};
