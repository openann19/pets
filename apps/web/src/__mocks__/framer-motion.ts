/*
 * FRAMER MOTION MOCK - Testing Stub
 * Simplified mock for framer-motion in test environment
 * Provides basic component stubs for animation testing
 */

import React from 'react';

// Basic props used by our tests when mocking motion components
export interface MotionComponentProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  initial?: Record<string, unknown>;
  animate?: Record<string, unknown>;
  exit?: Record<string, unknown>;
  transition?: Record<string, unknown>;
  whileHover?: Record<string, unknown>;
  whileTap?: Record<string, unknown>;
  drag?: boolean;
  dragConstraints?: unknown;
  dragElastic?: number;
  onDragEnd?: (event: unknown, info: unknown) => void;
  onClick?: () => void;
  [key: string]: unknown;
}

// Mock motion components
type ProxyTarget = Record<string, React.ComponentType<MotionComponentProps>>;

export const motion = new Proxy({} as ProxyTarget, {
  get: (_target, prop) => {
    return React.forwardRef<HTMLElement, MotionComponentProps>((props, ref) =>
      React.createElement(prop as string, { ...props, ref })
    );
  },
}) as ProxyTarget;

// Mock AnimatePresence
export const AnimatePresence: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return React.createElement(React.Fragment, null, children);
};

// Mock useAnimation
export const useAnimation = () => ({
  start: jest.fn(),
  stop: jest.fn(),
  set: jest.fn(),
});

// Mock useMotionValue
export const useMotionValue = (initial: number) => ({
  get: () => initial,
  set: jest.fn(),
  onChange: jest.fn(),
});

// Mock useTransform
export const useTransform = () => ({ get: () => 0, set: jest.fn() });

// Mock useSpring (generic)
export const useSpring = <T,>(value: T): T => value;

// Mock useScroll
export const useScroll = () => ({
  scrollX: { get: () => 0 },
  scrollY: { get: () => 0 },
  scrollXProgress: { get: () => 0 },
  scrollYProgress: { get: () => 0 },
});

// Mock useReducedMotion
export const useReducedMotion = () => false;

// Mock useDragControls
export const useDragControls = () => ({
  start: jest.fn(),
});

export default motion;
