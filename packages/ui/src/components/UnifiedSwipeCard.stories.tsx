import type { Meta, StoryObj } from '@storybook/react';
import { UnifiedSwipeCard } from './UnifiedSwipeCard';

const meta: Meta<typeof UnifiedSwipeCard> = {
  title: 'Components/UnifiedSwipeCard',
  component: UnifiedSwipeCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'An advanced swipe card component with 3D effects, fluid animations, and premium interactions.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'glass', 'elevated', 'gradient', 'neon', 'holographic'],
      description: 'Visual style variant of the card',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Size of the card',
    },
    enable3DTilt: {
      control: { type: 'boolean' },
      description: 'Whether to enable 3D tilt effect',
    },
    enableMagnetic: {
      control: { type: 'boolean' },
      description: 'Whether to enable magnetic mouse tracking',
    },
    enableHaptic: {
      control: { type: 'boolean' },
      description: 'Whether to enable haptic feedback',
    },
    enableSound: {
      control: { type: 'boolean' },
      description: 'Whether to enable sound feedback',
    },
    enableGlow: {
      control: { type: 'boolean' },
      description: 'Whether to show glow effect on hover',
    },
    swipeThreshold: {
      control: { type: 'number', min: 50, max: 200, step: 10 },
      description: 'Distance threshold for swipe detection',
    },
    velocityThreshold: {
      control: { type: 'number', min: 100, max: 1000, step: 50 },
      description: 'Velocity threshold for swipe detection',
    },
    isCurrentCard: {
      control: { type: 'boolean' },
      description: 'Whether this is the current active card',
    },
    onSwipeLeft: { action: 'swiped left' },
    onSwipeRight: { action: 'swiped right' },
    onSwipeUp: { action: 'swiped up' },
    onSwipeDown: { action: 'swiped down' },
    onCardClick: { action: 'card clicked' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample pet data
const samplePetData = {
  id: '1',
  name: 'Buddy',
  age: 3,
  breed: 'Golden Retriever',
  images: ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=600&fit=crop'],
  description: 'Friendly and energetic dog who loves playing fetch and going on long walks.',
  distance: 2.5,
};

// Default story
export const Default: Story = {
  args: {
    data: samplePetData,
    variant: 'glass',
    size: 'md',
    enable3DTilt: true,
    enableMagnetic: true,
    enableHaptic: true,
    enableSound: true,
    enableGlow: true,
    isCurrentCard: true,
  },
};

// Variant showcase
export const Variants: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4">Default</h3>
        <UnifiedSwipeCard
          data={samplePetData}
          variant="default"
          size="sm"
          isCurrentCard={true}
        />
      </div>
      
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4">Glass</h3>
        <UnifiedSwipeCard
          data={samplePetData}
          variant="glass"
          size="sm"
          isCurrentCard={true}
        />
      </div>
      
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4">Elevated</h3>
        <UnifiedSwipeCard
          data={samplePetData}
          variant="elevated"
          size="sm"
          isCurrentCard={true}
        />
      </div>
      
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4">Gradient</h3>
        <UnifiedSwipeCard
          data={samplePetData}
          variant="gradient"
          size="sm"
          isCurrentCard={true}
        />
      </div>
      
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4">Neon</h3>
        <UnifiedSwipeCard
          data={samplePetData}
          variant="neon"
          size="sm"
          isCurrentCard={true}
        />
      </div>
      
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4">Holographic</h3>
        <UnifiedSwipeCard
          data={samplePetData}
          variant="holographic"
          size="sm"
          isCurrentCard={true}
        />
      </div>
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

// Size showcase
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center justify-center gap-8">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4">Small</h3>
        <UnifiedSwipeCard
          data={samplePetData}
          size="sm"
          isCurrentCard={true}
        />
      </div>
      
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4">Medium</h3>
        <UnifiedSwipeCard
          data={samplePetData}
          size="md"
          isCurrentCard={true}
        />
      </div>
      
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4">Large</h3>
        <UnifiedSwipeCard
          data={samplePetData}
          size="lg"
          isCurrentCard={true}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different card sizes from small to large.',
      },
    },
  },
};

// Interactive features
export const InteractiveFeatures: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4">3D Tilt + Magnetic</h3>
        <UnifiedSwipeCard
          data={samplePetData}
          enable3DTilt={true}
          enableMagnetic={true}
          enableGlow={true}
          isCurrentCard={true}
        />
      </div>
      
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4">Haptic + Sound</h3>
        <UnifiedSwipeCard
          data={samplePetData}
          enableHaptic={true}
          enableSound={true}
          enableGlow={true}
          isCurrentCard={true}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Cards with various interactive features enabled.',
      },
    },
  },
};

// Stack behavior
export const StackBehavior: Story = {
  render: () => (
    <div className="relative w-80 h-96 mx-auto">
      <UnifiedSwipeCard
        data={samplePetData}
        stackIndex={2}
        isCurrentCard={false}
      />
      <UnifiedSwipeCard
        data={{ ...samplePetData, id: '2', name: 'Luna', breed: 'Border Collie' }}
        stackIndex={1}
        isCurrentCard={false}
      />
      <UnifiedSwipeCard
        data={{ ...samplePetData, id: '3', name: 'Max', breed: 'German Shepherd' }}
        stackIndex={0}
        isCurrentCard={true}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'How cards appear in a stack with different z-indexes and scaling.',
      },
    },
  },
};

// Swipe indicators
export const SwipeIndicators: Story = {
  render: () => (
    <div className="text-center">
      <p className="text-sm text-gray-600 mb-4">
        Drag the card to see swipe indicators appear
      </p>
      <UnifiedSwipeCard
        data={samplePetData}
        isCurrentCard={true}
        swipeThreshold={50}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Swipe indicators that appear when dragging the card in different directions.',
      },
    },
  },
};

// Different pet data
export const DifferentPets: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
      <UnifiedSwipeCard
        data={{
          id: '1',
          name: 'Whiskers',
          age: 2,
          breed: 'Persian Cat',
          images: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=600&fit=crop'],
          description: 'Calm and elegant cat who loves to lounge in sunny spots.',
          distance: 1.2,
        }}
        isCurrentCard={true}
      />
      
      <UnifiedSwipeCard
        data={{
          id: '2',
          name: 'Charlie',
          age: 5,
          breed: 'Labrador Mix',
          images: ['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=600&fit=crop'],
          description: 'Playful and loyal companion who enjoys swimming and fetch.',
          distance: 3.8,
        }}
        isCurrentCard={true}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Cards with different pet data showing variety in the component.',
      },
    },
  },
};

// Accessibility
export const Accessibility: Story = {
  render: () => (
    <div className="text-center">
      <UnifiedSwipeCard
        data={samplePetData}
        isCurrentCard={true}
        aria-label="Buddy's profile card - Golden Retriever, 3 years old"
        aria-describedby="pet-description"
      />
      <p id="pet-description" className="sr-only">
        Friendly and energetic dog who loves playing fetch and going on long walks. Located 2.5 miles away.
      </p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Card with proper accessibility attributes for screen readers.',
      },
    },
  },
};

// Interactive playground
export const Playground: Story = {
  args: {
    data: samplePetData,
    variant: 'glass',
    size: 'md',
    enable3DTilt: true,
    enableMagnetic: true,
    enableHaptic: true,
    enableSound: true,
    enableGlow: true,
    swipeThreshold: 100,
    velocityThreshold: 500,
    isCurrentCard: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground to test all card properties and effects.',
      },
    },
  },
};
