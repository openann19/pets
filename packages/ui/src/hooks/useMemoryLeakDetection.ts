import { useEffect, useRef } from 'react';

const debugLog = (message: string, details?: Record<string, unknown>) => {
  const isDev =
    typeof globalThis !== 'undefined' &&
    (globalThis as unknown as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV ===
      'development';
  if (isDev) {
    console.debug(message, details);
  }
};

declare global {
  namespace NodeJS {
    interface Timeout {
      [Symbol.toPrimitive](): number;
    }
  }

  interface Window {
    __timeouts__?: number;
    __intervals__?: number;
    __animationFrames__?: number;
    __listeners__?: number;
  }
}

export function useMemoryLeakDetection(componentName: string) {
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const intervalsRef = useRef<NodeJS.Timeout[]>([]);
  const animationFramesRef = useRef<number[]>([]);
  const listenersRef = useRef<{ element: EventTarget, event: string, handler: EventListener }[]>([]);

  // Clear all tracked items on unmount
  useEffect(() => () => {
    // Clear timeouts
    timeoutsRef.current.forEach(timeout => { clearTimeout(timeout as unknown as number); });

    // Clear intervals
    intervalsRef.current.forEach(interval => { clearInterval(interval as unknown as number); });

    // Cancel animation frames
    animationFramesRef.current.forEach(frame => { cancelAnimationFrame(frame); });

    // Remove event listeners
    listenersRef.current.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });

    debugLog(`Cleaned up for ${componentName}`, {
      timeouts: timeoutsRef.current.length,
      intervals: intervalsRef.current.length,
      animationFrames: animationFramesRef.current.length,
      listeners: listenersRef.current.length
    });
  }, [componentName]);

  // Track timeout creation
  const trackTimeout = (timeout: NodeJS.Timeout) => {
    timeoutsRef.current.push(timeout);
  };

  // Track interval creation
  const trackInterval = (interval: NodeJS.Timeout) => {
    intervalsRef.current.push(interval);
  };

  // Track animation frame requests
  const trackAnimationFrame = (frameId: number) => {
    animationFramesRef.current.push(frameId);
  };

  // Track event listeners
  const trackListener = (element: EventTarget, event: string, handler: EventListener) => {
    listenersRef.current.push({ element, event, handler });
  };

  // Remove event listener from tracking
  const removeListener = (element: EventTarget, event: string, handler: EventListener) => {
    listenersRef.current = listenersRef.current.filter(
      listener => !(listener.element === element && listener.event === event && listener.handler === handler)
    );
  };

  return {
    trackTimeout,
    trackInterval,
    trackAnimationFrame,
    trackListener,
    removeListener
  };
}

export default useMemoryLeakDetection;
