import React, { useEffect, useRef, useState, type JSX } from 'react';

export interface GestureInteractionProps {
  /**
   * Element to apply gesture detection to
   */
  children: React.ReactNode;

  /**
   * Callback for swipe left gesture
   */
  onSwipeLeft?: () => void;

  /**
   * Callback for swipe right gesture
   */
  onSwipeRight?: () => void;

  /**
   * Callback for swipe up gesture
   */
  onSwipeUp?: () => void;

  /**
   * Callback for swipe down gesture
   */
  onSwipeDown?: () => void;

  /**
   * Callback for pinch in gesture
   */
  onPinchIn?: () => void;

  /**
   * Callback for pinch out gesture
   */
  onPinchOut?: () => void;

  /**
   * Callback for rotation gesture
   */
  onRotate?: (angle: number) => void;

  /**
   * Callback for tap gesture
   */
  onTap?: () => void;

  /**
   * Callback for double tap gesture
   */
  onDoubleTap?: () => void;

  /**
   * Callback for long press gesture
   */
  onLongPress?: () => void;

  /**
   * Minimum swipe distance to trigger callback (in pixels)
   */
  swipeThreshold?: number;

  /**
   * Minimum pinch distance to trigger callback (in pixels)
   */
  pinchThreshold?: number;

  /**
   * Minimum rotation angle to trigger callback (in degrees)
   */
  rotateThreshold?: number;

  /**
   * Duration for long press (in milliseconds)
   */
  longPressDuration?: number;

  /**
   * Show visual feedback for gestures
   */
  showVisualFeedback?: boolean;

  /**
   * Whether to disable all gestures
   */
  disabled?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Whether to prevent default browser behavior
   */
  preventDefault?: boolean;
}

interface TouchData {
  identifier: number;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  startTime: number;
}

interface GestureState {
  touches: TouchData[];
  pinchDistance: number | null;
  rotation: number | null;
  longPressTimer: ReturnType<typeof setTimeout> | null;
  lastTapTime: number | null;
}

/**
 * A component that enables modern gesture-based interactions
 * Implements the latest 2025 UI/UX trend for touchless interfaces
 */
export const GestureInteraction: React.FC<GestureInteractionProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinchIn,
  onPinchOut,
  onRotate,
  onTap,
  onDoubleTap,
  onLongPress,
  swipeThreshold = 50,
  pinchThreshold = 30,
  rotateThreshold = 15,
  longPressDuration = 500,
  showVisualFeedback = true,
  disabled = false,
  className = '',
  preventDefault = true
}) => {
  // For now, default to light mode until theme hook is available
  const isDarkMode = false;
  const containerRef = useRef<HTMLDivElement>(null);
  const [gestureState, setGestureState] = useState<GestureState>({
    touches: [],
    pinchDistance: null,
    rotation: null,
    longPressTimer: null,
    lastTapTime: null
  });

  // Visual feedback states
  const [feedbackVisible, setFeedbackVisible] = useState<boolean>(false);
  const [feedbackType, setFeedbackType] = useState<string>('');
  const [feedbackPosition, setFeedbackPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [feedbackAngle, setFeedbackAngle] = useState<number>(0);

  // Calculate distance between two touch points
  const getDistance = (touch1: TouchData, touch2: TouchData): number => {
    const dx = touch1.lastX - touch2.lastX;
    const dy = touch1.lastY - touch2.lastY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Calculate angle between two touch points
  const getAngle = (touch1: TouchData, touch2: TouchData): number => {
    const dx = touch2.lastX - touch1.lastX;
    const dy = touch2.lastY - touch1.lastY;
    return Math.atan2(dy, dx) * 180 / Math.PI;
  };

  // Show visual feedback
  const showFeedback = (type: string, x: number, y: number, angle = 0): void => {
    if (!showVisualFeedback) return;

    setFeedbackType(type);
    setFeedbackPosition({ x, y });
    setFeedbackAngle(angle);
    setFeedbackVisible(true);

    // Hide feedback after animation
    setTimeout(() => {
      setFeedbackVisible(false);
    }, 500);
  };

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent): void => {
    if (disabled) return;
    if (preventDefault) e.preventDefault();

    const newTouches = Array.from(e.touches).map(touch => ({
      identifier: touch.identifier,
      startX: touch.clientX,
      startY: touch.clientY,
      lastX: touch.clientX,
      lastY: touch.clientY,
      startTime: Date.now()
    }));

    // Clear existing long press timer
    if (gestureState.longPressTimer) {
      clearTimeout(gestureState.longPressTimer);
    }

    // Set long press timer for single touch
    let longPressTimer: ReturnType<typeof setTimeout> | null = null;
    if (newTouches.length === 1 && onLongPress) {
      const firstTouch = newTouches[0];
      if (firstTouch) {
        longPressTimer = setTimeout(() => {
          onLongPress();
          showFeedback('longpress', firstTouch.startX, firstTouch.startY);
        }, longPressDuration);
      }
    }

    // Set initial pinch distance for two touches
    let pinchDistance = null;
    if (newTouches.length === 2) {
      const touch1 = newTouches[0];
      const touch2 = newTouches[1];
      if (touch1 && touch2) {
        pinchDistance = getDistance(touch1, touch2);
      }
    }

    // Set initial rotation for two touches
    let rotation = null;
    if (newTouches.length === 2) {
      const touch1 = newTouches[0];
      const touch2 = newTouches[1];
      if (touch1 && touch2) {
        rotation = getAngle(touch1, touch2);
      }
    }

    setGestureState({
      ...gestureState,
      touches: newTouches,
      pinchDistance,
      rotation,
      longPressTimer
    });
  };

  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent): void => {
    if (disabled || gestureState.touches.length === 0) return;
    if (preventDefault) e.preventDefault();

    // Update touch positions
    const updatedTouches = gestureState.touches.map(touch => {
      const activeTouch = Array.from(e.touches).find(t => t.identifier === touch.identifier);
      if (activeTouch) {
        return {
          ...touch,
          lastX: activeTouch.clientX,
          lastY: activeTouch.clientY
        };
      }
      return touch;
    });

    // Process pinch gesture
    if (updatedTouches.length === 2 && gestureState.pinchDistance !== null) {
      const touch1 = updatedTouches[0];
      const touch2 = updatedTouches[1];
      if (!touch1 || !touch2) return;

      const currentDistance = getDistance(touch1, touch2);
      const pinchDiff = currentDistance - gestureState.pinchDistance;

      // Detect pinch in/out beyond threshold
      if (Math.abs(pinchDiff) > pinchThreshold) {
        if (pinchDiff < 0 && onPinchIn) {
          onPinchIn();
          const centerX = (touch1.lastX + touch2.lastX) / 2;
          const centerY = (touch1.lastY + touch2.lastY) / 2;
          showFeedback('pinchin', centerX, centerY);
        } else if (pinchDiff > 0 && onPinchOut) {
          onPinchOut();
          const centerX = (touch1.lastX + touch2.lastX) / 2;
          const centerY = (touch1.lastY + touch2.lastY) / 2;
          showFeedback('pinchout', centerX, centerY);
        }

        // Update pinch distance
        setGestureState(prev => ({
          ...prev,
          pinchDistance: currentDistance,
          touches: updatedTouches
        }));
        return;
      }
    }

    // Process rotation gesture
    if (updatedTouches.length === 2 && gestureState.rotation !== null && onRotate) {
      const touch1 = updatedTouches[0];
      const touch2 = updatedTouches[1];
      if (!touch1 || !touch2) return;

      const currentRotation = getAngle(touch1, touch2);
      let rotationDiff = currentRotation - gestureState.rotation;

      // Normalize rotation difference
      if (rotationDiff > 180) rotationDiff -= 360;
      if (rotationDiff < -180) rotationDiff += 360;

      // Detect rotation beyond threshold
      if (Math.abs(rotationDiff) > rotateThreshold) {
        onRotate(rotationDiff);
        const centerX = (touch1.lastX + touch2.lastX) / 2;
        const centerY = (touch1.lastY + touch2.lastY) / 2;
        showFeedback('rotate', centerX, centerY, rotationDiff);

        // Update rotation value
        setGestureState(prev => ({
          ...prev,
          rotation: currentRotation,
          touches: updatedTouches
        }));
        return;
      }
    }

    // Cancel long press if moved too much
    if (gestureState.longPressTimer && updatedTouches.length === 1) {
      const touch = updatedTouches[0];
      if (!touch) return;
      const moveDistance = Math.sqrt(
        Math.pow(touch.lastX - touch.startX, 2) +
        Math.pow(touch.lastY - touch.startY, 2)
      );

      if (moveDistance > 10) {
        clearTimeout(gestureState.longPressTimer);
        setGestureState(prev => ({
          ...prev,
          longPressTimer: null,
          touches: updatedTouches
        }));
      }
    }

    setGestureState(prev => ({
      ...prev,
      touches: updatedTouches
    }));
  };

  // Handle touch end
  const handleTouchEnd = (e: React.TouchEvent): void => {
    if (disabled || gestureState.touches.length === 0) return;
    if (preventDefault) e.preventDefault();

    // Clear long press timer
    if (gestureState.longPressTimer) {
      clearTimeout(gestureState.longPressTimer);
    }

    const endedTouches = gestureState.touches.filter(touch => Array.from(e.touches).some(t => t.identifier === touch.identifier));

    // Handle swipe gestures
    const firstTouch = gestureState.touches[0];
    if (gestureState.touches.length === 1 && firstTouch?.startTime) {
      const touch = firstTouch;
      const touchDuration = Date.now() - touch.startTime;
      const dx = touch.lastX - touch.startX;
      const dy = touch.lastY - touch.startY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Only process if it's a quick movement (swipe)
      if (touchDuration < 300 && distance > swipeThreshold) {
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);

        // Horizontal swipe
        if (absX > absY) {
          if (dx > 0 && onSwipeRight) {
            onSwipeRight();
            showFeedback('swiperight', touch.lastX, touch.lastY);
          } else if (dx < 0 && onSwipeLeft) {
            onSwipeLeft();
            showFeedback('swipeleft', touch.lastX, touch.lastY);
          }
        }
        // Vertical swipe
        else {
          if (dy > 0 && onSwipeDown) {
            onSwipeDown();
            showFeedback('swipedown', touch.lastX, touch.lastY);
          } else if (dy < 0 && onSwipeUp) {
            onSwipeUp();
            showFeedback('swipeup', touch.lastX, touch.lastY);
          }
        }
      }
      // Handle tap
      else if (distance < 10) {
        // Double tap detection
        const now = Date.now();
        if (gestureState.lastTapTime && (now - gestureState.lastTapTime) < 300) {
          if (onDoubleTap) {
            onDoubleTap();
            showFeedback('doubletap', touch.lastX, touch.lastY);
          }
          setGestureState(prev => ({
            ...prev,
            lastTapTime: null
          }));
        } else {
          // Single tap
          if (onTap) {
            onTap();
            showFeedback('tap', touch.lastX, touch.lastY);
          }
          setGestureState(prev => ({
            ...prev,
            lastTapTime: now
          }));
        }
      }
    }

    setGestureState(prev => ({
      ...prev,
      touches: endedTouches,
      longPressTimer: null,
      pinchDistance: null,
      rotation: null
    }));
  };

  // Clean up timers
  useEffect(() => () => {
    if (gestureState.longPressTimer) {
      clearTimeout(gestureState.longPressTimer);
    }
  }, [gestureState.longPressTimer]);

  // Render visual feedback
  const renderFeedback = (): JSX.Element | null => {
    if (!showVisualFeedback || !feedbackVisible) {
      return null;
    }

    const getFeedbackStyle = (): React.CSSProperties => {
      const baseStyle: React.CSSProperties = {
        position: 'fixed',
        pointerEvents: 'none',
        transform: 'translate(-50%, -50%)',
        left: `${feedbackPosition.x}px`,
        top: `${feedbackPosition.y}px`,
        transition: 'opacity 0.5s ease, transform 0.5s ease',
        opacity: feedbackVisible ? 0.7 : 0,
      };

      switch (feedbackType) {
        case 'swipeleft':
          return {
            ...baseStyle,
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: isDarkMode ? 'rgba(37, 99, 235, 0.3)' : 'rgba(59, 130, 246, 0.3)',
            animation: 'slide-left 0.5s ease-out forwards',
          };

        case 'swiperight':
          return {
            ...baseStyle,
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: isDarkMode ? 'rgba(37, 99, 235, 0.3)' : 'rgba(59, 130, 246, 0.3)',
            animation: 'slide-right 0.5s ease-out forwards',
          };

        case 'swipeup':
          return {
            ...baseStyle,
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: isDarkMode ? 'rgba(37, 99, 235, 0.3)' : 'rgba(59, 130, 246, 0.3)',
            animation: 'slide-up 0.5s ease-out forwards',
          };

        case 'swipedown':
          return {
            ...baseStyle,
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: isDarkMode ? 'rgba(37, 99, 235, 0.3)' : 'rgba(59, 130, 246, 0.3)',
            animation: 'slide-down 0.5s ease-out forwards',
          };

        case 'tap':
          return {
            ...baseStyle,
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: isDarkMode ? 'rgba(37, 99, 235, 0.3)' : 'rgba(59, 130, 246, 0.3)',
            animation: 'pulse 0.5s ease-out',
          };

        case 'doubletap':
          return {
            ...baseStyle,
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: isDarkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(5, 150, 105, 0.3)',
            animation: 'double-pulse 0.5s ease-out',
          };

        case 'longpress':
          return {
            ...baseStyle,
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            background: isDarkMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(217, 119, 6, 0.3)',
            animation: 'grow-fade 0.5s ease-out',
          };

        case 'pinchin':
          return {
            ...baseStyle,
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'transparent',
            border: `2px solid ${isDarkMode ? 'rgba(37, 99, 235, 0.5)' : 'rgba(59, 130, 246, 0.5)'}`,
            animation: 'shrink 0.5s ease-out forwards',
          };

        case 'pinchout':
          return {
            ...baseStyle,
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'transparent',
            border: `2px solid ${isDarkMode ? 'rgba(37, 99, 235, 0.5)' : 'rgba(59, 130, 246, 0.5)'}`,
            animation: 'expand 0.5s ease-out forwards',
          };

        case 'rotate':
          return {
            ...baseStyle,
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'transparent',
            border: `2px dashed ${isDarkMode ? 'rgba(139, 92, 246, 0.5)' : 'rgba(124, 58, 237, 0.5)'}`,
            animation: 'rotate-feedback 0.5s ease-out',
            transform: `translate(-50%, -50%) rotate(${feedbackAngle}deg)`,
          };

        default:
          return baseStyle;
      }
    };

    return <div style={getFeedbackStyle()} />;
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className={`gesture-interaction ${className}`}
    >
      {children}
      {renderFeedback()}
      <style>{`
        @keyframes slide-left {
          0% { transform: translate(-50%, -50%) translateX(0); opacity: 0.7; }
          100% { transform: translate(-50%, -50%) translateX(-50px); opacity: 0; }
        }
        @keyframes slide-right {
          0% { transform: translate(-50%, -50%) translateX(0); opacity: 0.7; }
          100% { transform: translate(-50%, -50%) translateX(50px); opacity: 0; }
        }
        @keyframes slide-up {
          0% { transform: translate(-50%, -50%) translateY(0); opacity: 0.7; }
          100% { transform: translate(-50%, -50%) translateY(-50px); opacity: 0; }
        }
        @keyframes slide-down {
          0% { transform: translate(-50%, -50%) translateY(0); opacity: 0.7; }
          100% { transform: translate(-50%, -50%) translateY(50px); opacity: 0; }
        }
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0.7; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.5; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }
        @keyframes double-pulse {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0.7; }
          30% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
          60% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.7; }
          100% { transform: translate(-50%, -50%) scale(1.2); opacity: 0; }
        }
        @keyframes grow-fade {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.3; }
          50% { transform: translate(-50%, -50%) scale(1); opacity: 0.7; }
          100% { transform: translate(-50%, -50%) scale(1.2); opacity: 0; }
        }
        @keyframes shrink {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.7; }
          100% { transform: translate(-50%, -50%) scale(0.3); opacity: 0; }
        }
        @keyframes expand {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.7; }
          100% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
        }
        @keyframes rotate-feedback {
          0% { transform: translate(-50%, -50%) rotate(${feedbackAngle - 30}deg); opacity: 0.7; }
          100% { transform: translate(-50%, -50%) rotate(${feedbackAngle + 30}deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default GestureInteraction;
