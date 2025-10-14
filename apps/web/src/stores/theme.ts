import { create } from 'zustand';

// Define the available UI themes
export type UITheme = 'glass' | 'vibrant';

interface ThemeState {
  theme: UITheme;
  toggle: () => void;
}

/**
 * A tiny zustand store that keeps the currently-selected visual theme
 * (`'glass' | 'vibrant'`).
 *
 * – Persists the choice in `localStorage` so the preference survives refreshes.
 * – Mutates `document.body.classList` so global styles are applied instantly.
 */
export const _useThemeStore = create<ThemeState>((set: (fn: (state: ThemeState) => Partial<ThemeState>) => void) => {
  let initialTheme: UITheme = 'glass';
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('theme') as UITheme | null;
    if (saved === 'vibrant' || saved === 'glass') {
      initialTheme = saved;
    }
    // Ensure the body has the correct class once on load
    document.body.classList.add(initialTheme);
  }

  return {
    theme: initialTheme,
    toggle: () =>
      set((state: ThemeState) => {
        const next: UITheme = state.theme === 'glass' ? 'vibrant' : 'glass';

        // Persist + mutate the DOM
        if (typeof window !== 'undefined') {
          localStorage.setItem('theme', next);
          document.body.classList.remove(state.theme);
          document.body.classList.add(next);
        }
        return { theme: next };
      }),
  };
});
