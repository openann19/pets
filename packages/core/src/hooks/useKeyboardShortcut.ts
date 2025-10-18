import { useEffect, useRef } from 'react';

// KeyCode type removed as it was unused

interface KeyCombo {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
}

export function useKeyboardShortcut(
  keyCombo: KeyCombo,
  handler: () => void
) {
  const formattedCombo = useRef(formatKeyCombo(keyCombo));
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  // Keep the formatted combo in sync when keyCombo changes without re-subscribing listeners
  useEffect(() => {
    formattedCombo.current = formatKeyCombo(keyCombo);
  }, [keyCombo]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const pressedCombo = formatPressedKeys(event);
      if (pressedCombo === formattedCombo.current) {
        event.preventDefault();
        handlerRef.current();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [keyCombo, handler]);

  return formattedCombo.current;
}

function formatKeyCombo(combo: KeyCombo): string {
  const modifiers = [];
  if (combo.ctrl) modifiers.push('Ctrl');
  if (combo.shift) modifiers.push('Shift');
  if (combo.alt) modifiers.push('Alt');
  if (combo.meta) modifiers.push('Meta');

  return [...modifiers, combo.key].join('+');
}

function formatPressedKeys(event: KeyboardEvent): string {
  const modifiers = [];
  if (event.ctrlKey) modifiers.push('Ctrl');
  if (event.shiftKey) modifiers.push('Shift');
  if (event.altKey) modifiers.push('Alt');
  if (event.metaKey) modifiers.push('Meta');

  return [...modifiers, event.key].join('+');
}
