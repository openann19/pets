import { useCallback, useEffect, useRef } from 'react';

type KeyCode = string;
type KeyCombo = string | string[];
type KeyHandler = (event: KeyboardEvent) => void;

interface KeyboardShortcutOptions {
  preventDefault?: boolean;
  stopPropagation?: boolean;
  overrideSystemShortcuts?: boolean;
  ignoreInputFields?: boolean;
  ignoreContentEditable?: boolean;
  allowInModal?: boolean;
  enabled?: boolean;
  onActivate?: () => void;
}

const defaultOptions: KeyboardShortcutOptions = {
  preventDefault: true,
  stopPropagation: false,
  overrideSystemShortcuts: false,
  ignoreInputFields: true,
  ignoreContentEditable: true,
  allowInModal: false,
  enabled: true,
};

/**
 * Format key combo for consistent comparison
 */
const formatKeyCombo = (combo: KeyCombo): string[] => {
  if (typeof combo === 'string') {
    return [combo.toLowerCase()];
  }
  return combo.map(key => key.toLowerCase());
};

/**
 * Check if the event matches the key combo
 */
const matchesKeyCombo = (event: KeyboardEvent, combo: string[]): boolean => {
  // For single key shortcuts
  if (combo.length === 1) {
    return event.key.toLowerCase() === combo[0] &&
      !event.ctrlKey &&
      !event.altKey &&
      !event.shiftKey &&
      !event.metaKey;
  }
  
  // For key combinations
  const pressedKeys: string[] = [];
  
  if (event.ctrlKey) pressedKeys.push('ctrl');
  if (event.altKey) pressedKeys.push('alt');
  if (event.shiftKey) pressedKeys.push('shift');
  if (event.metaKey) pressedKeys.push('meta');
  
  pressedKeys.push(event.key.toLowerCase());
  
  // Check if all required keys are pressed
  return combo.every(key => pressedKeys.includes(key)) &&
    pressedKeys.length === combo.length;
};

/**
 * Check if the focus is in an input element
 */
const isFocusInInput = (): boolean => {
  const { activeElement } = document;
  if (!activeElement) return false;
  
  const tagName = activeElement.tagName.toLowerCase();
  const isInput = tagName === 'input' || tagName === 'textarea' || tagName === 'select';
  const isContentEditable = activeElement.hasAttribute('contenteditable') && 
    activeElement.getAttribute('contenteditable') !== 'false';
  
  return isInput || isContentEditable;
};

/**
 * Check if a modal is open (based on common modal attributes)
 */
const isModalOpen = (): boolean => {
  const modalElements = document.querySelectorAll('[role="dialog"], [aria-modal="true"], .modal[aria-hidden="false"]');
  return modalElements.length > 0;
};

/**
 * Hook for registering keyboard shortcuts
 * 
 * @param keyCombo Key or key combination (e.g., 'a', 'ctrl+s', ['ctrl', 's'])
 * @param handler Function to execute when shortcut is triggered
 * @param options Configuration options
 */
export function useKeyboardShortcut(
  keyCombo: KeyCombo,
  handler: KeyHandler,
  options: KeyboardShortcutOptions = {}
) {
  const formattedCombo = useRef(formatKeyCombo(keyCombo));
  const handlerRef = useRef(handler);
  const mergedOptions = { ...defaultOptions, ...options };
  
  // Update refs when props change
  useEffect(() => {
    handlerRef.current = handler;
    formattedCombo.current = formatKeyCombo(keyCombo);
  }, [keyCombo, handler]);
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!mergedOptions.enabled) return;
    
    // Skip if we should ignore input fields and focus is in an input
    if (mergedOptions.ignoreInputFields && isFocusInInput()) return;
    
    // Skip if we don't allow shortcuts in modals and a modal is open
    if (!mergedOptions.allowInModal && isModalOpen()) return;
    
    // Check if the key combo matches
    if (matchesKeyCombo(event, formattedCombo.current)) {
      if (mergedOptions.preventDefault) {
        event.preventDefault();
      }
      
      if (mergedOptions.stopPropagation) {
        event.stopPropagation();
      }
      
      // Trigger the handler
      handlerRef.current(event);
      
      // Optional callback for when shortcut is activated
      mergedOptions.onActivate?.();
    }
  }, [mergedOptions]);
  
  useEffect(() => {
    // Only attach listener if enabled
    if (!mergedOptions.enabled) return;
    
    // Determine the capture phase based on overrideSystemShortcuts
    const useCapture = mergedOptions.overrideSystemShortcuts;
    
    // Add event listener
    document.addEventListener('keydown', handleKeyDown, useCapture);
    
    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown, useCapture);
    };
  }, [handleKeyDown, mergedOptions.enabled, mergedOptions.overrideSystemShortcuts]);
  
  // Return a method to manually enable/disable the shortcut
  return {
    setEnabled: (enabled: boolean) => {
      mergedOptions.enabled = enabled;
    }
  };
}

export default useKeyboardShortcut;
