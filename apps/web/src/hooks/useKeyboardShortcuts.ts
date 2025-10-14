import { useEffect, useCallback } from 'react';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  callback: () => void;
  description?: string;
}

export const useKeyboardShortcuts = (shortcuts: ShortcutConfig[]) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatches = shortcut.alt ? event.altKey : !event.altKey;
        const metaMatches = shortcut.meta ? event.metaKey : !event.metaKey;

        if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
          event.preventDefault();
          shortcut.callback();
          break;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

// Moderation dashboard shortcuts
export const useModerationShortcuts = (actions: {
  approve?: () => void;
  reject?: () => void;
  next?: () => void;
  previous?: () => void;
  bulkSelect?: () => void;
  search?: () => void;
}) => {
  useKeyboardShortcuts([
    {
      key: 'a',
      callback: () => actions.approve?.(),
      description: 'Approve selected item',
    },
    {
      key: 'r',
      callback: () => actions.reject?.(),
      description: 'Reject selected item',
    },
    {
      key: 'ArrowRight',
      callback: () => actions.next?.(),
      description: 'Next item',
    },
    {
      key: 'ArrowLeft',
      callback: () => actions.previous?.(),
      description: 'Previous item',
    },
    {
      key: 'a',
      ctrl: true,
      callback: () => actions.bulkSelect?.(),
      description: 'Select all',
    },
    {
      key: 'f',
      ctrl: true,
      callback: () => actions.search?.(),
      description: 'Focus search',
    },
  ]);
};
