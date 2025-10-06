import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type ToastType = 'success' | 'error' | 'info' | 'warning';
export type ModalType = 'match' | 'petProfile' | 'settings' | 'premium' | 'petForm' | 'filter';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export interface ModalState {
  type: ModalType | null;
  props?: Record<string, unknown>;
}

export interface UIState {
  // Toast notifications
  toasts: Toast[];

  // Modal state
  modal: ModalState;

  // Theme settings
  darkMode: boolean;

  // Loading indicators
  isPageLoading: boolean;
  loadingStates: Record<string, boolean>;

  // Actions
  showToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  openModal: (type: ModalType, props?: Record<string, unknown>) => void;
  closeModal: () => void;
  setDarkMode: (enabled: boolean) => void;
  setIsPageLoading: (isLoading: boolean) => void;
  setLoadingState: (key: string, isLoading: boolean) => void;
}

/**
 * Global UI store for managing UI state like modals, toasts, and theme
 */
export const useUIStore = create<UIState>()(
  immer((set) => ({
    toasts: [],
    modal: { type: null },
    darkMode: false,
    isPageLoading: false,
    loadingStates: {},

    // Add a new toast notification
    showToast: (toast: Omit<Toast, 'id'>) => set((state) => {
      const id = Date.now().toString();
      state.toasts.push({ ...toast, id });
      return state;
    }),

    // Remove a toast by id
    removeToast: (id: string) => set((state) => {
      state.toasts = state.toasts.filter(toast => toast.id !== id);
      return state;
    }),

    // Clear all toasts
    clearToasts: () => set((state) => {
      state.toasts = [];
      return state;
    }),

    // Open a modal with optional props
    openModal: (type: ModalType, props: Record<string, unknown> = {}) => set((state) => {
      state.modal = { type, props };
      return state;
    }),

    // Close the current modal
    closeModal: () => set((state) => {
      state.modal = { type: null };
      return state;
    }),

    // Toggle dark mode
    setDarkMode: (enabled: boolean) => set((state) => {
      state.darkMode = enabled;
      return state;
    }),

    // Set global page loading state
    setIsPageLoading: (isLoading: boolean) => set((state) => {
      state.isPageLoading = isLoading;
      return state;
    }),

    // Set named loading state for specific operations
    setLoadingState: (key: string, isLoading: boolean) => set((state) => {
      state.loadingStates[key] = isLoading;
      return state;
    }),
  }))
);
