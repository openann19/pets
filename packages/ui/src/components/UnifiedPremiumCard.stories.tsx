import type { Meta, StoryObj } from '@storybook/react';
import { UserIcon, HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { UnifiedPremiumCard } from './UnifiedPremiumCard';

const meta: Meta<typeof UnifiedPremiumCard> = {
  title: 'Components/UnifiedPremiumCard',
  component: UnifiedPremiumCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A unified premium card component with glass morphism, 3D effects, and advanced interactions.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'glass', 'elevated', 'gradient', 'neon', 'holographic'],
      description: 'Visual style variant of the card',
    },
    hover: {
      control: { type: 'boolean' },
      description: 'Whether to enable hover effects',
    },
    tilt: {
      control: { type: 'boolean' },
      description: 'Whether to enable 3D tilt effect',
    },
    glow: {
      control: { type: 'boolean' },
      description: 'Whether to show glow effect on hover',
    },
    blur: {
      control: { type: 'boolean' },
      description: 'Whether to add blur overlay',
    },
    shimmer: {
      control: { type: 'boolean' },
      description: 'Whether to show shimmer effect',
    },
    magnetic: {
      control: { type: 'boolean' },
      description: 'Whether to enable magnetic mouse tracking',
    },
    padding: {
      control: { type: 'select' },
      options: ['none', 'sm', 'md', 'lg', 'xl'],
      description: 'Internal padding of the card',
    },
    entrance: {
      control: { type: 'select' },
      options: ['fadeInUp', 'scaleIn', 'slideInLeft', 'slideInRight'],
      description: 'Entrance animation type',
    },
    delay: {
      control: { type: 'number', min: 0, max: 2, step: 0.1 },
      description: 'Delay before entrance animation starts',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the card is disabled',
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
    children: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Card Title</h3>
        <p className="text-gray-300">This is a premium card with beautiful styling and smooth animations.</p>
      </div>
    ),
    variant: 'default',
    padding: 'md',
  },
};

// Variant showcase
export const Variants: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
      <UnifiedPremiumCard variant="default" padding="md">
        <h3 className="text-lg font-semibold mb-2">Default Card</h3>
        <p className="text-gray-300">Clean and minimal design with subtle glass effects.</p>
      </UnifiedPremiumCard>
      
      <UnifiedPremiumCard variant="glass" padding="md">
        <h3 className="text-lg font-semibold mb-2">Glass Card</h3>
        <p className="text-gray-300">Enhanced glass morphism with backdrop blur effects.</p>
      </UnifiedPremiumCard>
      
      <UnifiedPremiumCard variant="elevated" padding="md">
        <h3 className="text-lg font-semibold mb-2">Elevated Card</h3>
        <p className="text-gray-300">Floating design with enhanced shadows and depth.</p>
      </UnifiedPremiumCard>
      
      <UnifiedPremiumCard variant="gradient" padding="md">
        <h3 className="text-lg font-semibold mb-2">Gradient Card</h3>
        <p className="text-gray-300">Beautiful gradient background with brand colors.</p>
      </UnifiedPremiumCard>
      
      <UnifiedPremiumCard variant="neon" padding="md">
        <h3 className="text-lg font-semibold mb-2">Neon Card</h3>
        <p className="text-gray-300">Futuristic neon styling with glowing borders.</p>
      </UnifiedPremiumCard>
      
      <UnifiedPremiumCard variant="holographic" padding="md">
        <h3 className="text-lg font-semibold mb-2">Holographic Card</h3>
        <p className="text-gray-300">Animated holographic effect with shifting colors.</p>
      </UnifiedPremiumCard>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available card variants showcasing different visual styles.',
      },
    },
  },
};

// Interactive effects
export const InteractiveEffects: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
      <UnifiedPremiumCard variant="glass" hover padding="md">
        <h3 className="text-lg font-semibold mb-2">Hover Effect</h3>
        <p className="text-gray-300">Hover over this card to see the smooth scale and lift animation.</p>
      </UnifiedPremiumCard>
      
      <UnifiedPremiumCard variant="elevated" tilt padding="md">
        <h3 className="text-lg font-semibold mb-2">3D Tilt Effect</h3>
        <p className="text-gray-300">Move your mouse over this card to see the 3D tilt effect.</p>
      </UnifiedPremiumCard>
      
      <UnifiedPremiumCard variant="gradient" glow padding="md">
        <h3 className="text-lg font-semibold mb-2">Glow Effect</h3>
        <p className="text-gray-300">Hover to see the beautiful glow effect around the card.</p>
      </UnifiedPremiumCard>
      
      <UnifiedPremiumCard variant="glass" magnetic padding="md">
        <h3 className="text-lg font-semibold mb-2">Magnetic Effect</h3>
        <p className="text-gray-300">Move your mouse around to see the magnetic tracking effect.</p>
      </UnifiedPremiumCard>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Cards with various interactive effects and animations.',
      },
    },
  },
};

// Padding showcase
export const PaddingSizes: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl">
      <UnifiedPremiumCard variant="glass" padding="none">
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">No Padding</h3>
          <p className="text-gray-300">Content with no internal padding.</p>
        </div>
      </UnifiedPremiumCard>
      
      <UnifiedPremiumCard variant="glass" padding="sm">
        <h3 className="text-lg font-semibold mb-2">Small Padding</h3>
        <p className="text-gray-300">Content with small internal padding.</p>
      </UnifiedPremiumCard>
      
      <UnifiedPremiumCard variant="glass" padding="md">
        <h3 className="text-lg font-semibold mb-2">Medium Padding</h3>
        <p className="text-gray-300">Content with medium internal padding.</p>
      </UnifiedPremiumCard>
      
      <UnifiedPremiumCard variant="glass" padding="lg">
        <h3 className="text-lg font-semibold mb-2">Large Padding</h3>
        <p className="text-gray-300">Content with large internal padding.</p>
      </UnifiedPremiumCard>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different padding sizes for card content.',
      },
    },
  },
};

// Entrance animations
export const EntranceAnimations: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
      <UnifiedPremiumCard variant="glass" entrance="fadeInUp" delay={0} padding="md">
        <h3 className="text-lg font-semibold mb-2">Fade In Up</h3>
        <p className="text-gray-300">Card fades in from below with upward motion.</p>
      </UnifiedPremiumCard>
      
      <UnifiedPremiumCard variant="glass" entrance="scaleIn" delay={0.2} padding="md">
        <h3 className="text-lg font-semibold mb-2">Scale In</h3>
        <p className="text-gray-300">Card scales in from smaller size to full size.</p>
      </UnifiedPremiumCard>
      
      <UnifiedPremiumCard variant="glass" entrance="slideInLeft" delay={0.4} padding="md">
        <h3 className="text-lg font-semibold mb-2">Slide In Left</h3>
        <p className="text-gray-300">Card slides in from the left side.</p>
      </UnifiedPremiumCard>
      
      <UnifiedPremiumCard variant="glass" entrance="slideInRight" delay={0.6} padding="md">
        <h3 className="text-lg font-semibold mb-2">Slide In Right</h3>
        <p className="text-gray-300">Card slides in from the right side.</p>
      </UnifiedPremiumCard>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different entrance animations with staggered delays.',
      },
    },
  },
};

// Pet profile card example
export const PetProfileCard: Story = {
  render: () => (
    <div className="max-w-sm">
      <UnifiedPremiumCard variant="glass" hover tilt padding="none" className="overflow-hidden">
        <div className="relative">
          <img 
            src="https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop" 
            alt="Golden Retriever"
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-4 right-4">
            <button className="bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors">
              <HeartIcon className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-bold">Buddy</h3>
            <span className="text-sm text-gray-300">2 years old</span>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <UserIcon className="w-4 h-4 text-gray-300" />
            <span className="text-sm text-gray-300">Golden Retriever</span>
          </div>
          
          <p className="text-gray-300 text-sm mb-4">
            Friendly and energetic dog who loves playing fetch and going on long walks.
          </p>
          
          <div className="flex gap-2">
            <button className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-lg transition-colors">
              Like
            </button>
            <button className="flex-1 bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
              <ChatBubbleLeftIcon className="w-4 h-4" />
              Chat
            </button>
          </div>
        </div>
      </UnifiedPremiumCard>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A realistic pet profile card example showing how to use the card component in a real application.',
      },
    },
  },
};

// Clickable card
export const ClickableCard: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
      <UnifiedPremiumCard 
        variant="glass" 
        hover 
        onClick={() => alert('Card clicked!')}
        padding="md"
        className="cursor-pointer"
      >
        <h3 className="text-lg font-semibold mb-2">Clickable Card</h3>
        <p className="text-gray-300">This card is clickable and will show an alert when clicked.</p>
      </UnifiedPremiumCard>
      
      <UnifiedPremiumCard 
        variant="elevated" 
        hover 
        onClick={() => alert('Another card clicked!')}
        padding="md"
        className="cursor-pointer"
      >
        <h3 className="text-lg font-semibold mb-2">Another Clickable</h3>
        <p className="text-gray-300">This card also responds to clicks with haptic and sound feedback.</p>
      </UnifiedPremiumCard>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Cards that respond to click events with proper feedback.',
      },
    },
  },
};

// Accessibility
export const Accessibility: Story = {
  render: () => (
    <div className="max-w-md">
      <UnifiedPremiumCard 
        variant="glass" 
        padding="md"
        aria-label="User profile information"
        aria-describedby="profile-description"
        role="article"
      >
        <h3 className="text-lg font-semibold mb-2">Accessible Card</h3>
        <p id="profile-description" className="text-gray-300 mb-4">
          This card has proper ARIA attributes for screen readers and keyboard navigation.
        </p>
        <button 
          className="bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-lg transition-colors"
          aria-label="Edit profile information"
        >
          Edit Profile
        </button>
      </UnifiedPremiumCard>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Card with proper accessibility attributes for screen readers and keyboard navigation.',
      },
    },
  },
};

// Interactive playground
export const Playground: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Playground Card</h3>
        <p className="text-gray-300">This is a playground card where you can test all the properties and see how they affect the appearance and behavior.</p>
      </div>
    ),
    variant: 'glass',
    hover: true,
    tilt: false,
    glow: false,
    blur: false,
    shimmer: false,
    magnetic: false,
    padding: 'md',
    entrance: 'fadeInUp',
    delay: 0,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground to test all card properties and effects.',
      },
    },
  },
};
