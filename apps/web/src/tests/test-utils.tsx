import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function render(ui: React.ReactElement, options = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

export * from '@testing-library/react';
export { render };
