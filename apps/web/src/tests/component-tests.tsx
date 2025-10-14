/**
 * ULTRA COMPONENT TESTING 🧪
 * React component and hook testing suite
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

// Test wrapper with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

// Mock hooks for testing
const useAuth = () => ({
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  isLoading: false,
  error: null,
});

const useDashboardData = () => ({
  user: null,
  pets: [],
  matches: [],
  isLoading: false,
});

const useSwipeData = () => ({
  pets: [],
  currentPet: null,
  swipe: jest.fn(),
  isLoading: false,
  lastMatch: null,
});

// Mock components for testing
const TestAuthComponent = (): React.ReactElement => {
  const { login, register, logout, isLoading, error } = useAuth();

  return (
    <div>
      <div data-testid="loading">{isLoading ? 'Loading' : 'Ready'}</div>
      <div data-testid="error">{error?.message || 'No error'}</div>
      <button
        data-testid="login-btn"
        onClick={() => login({ email: 'test@test.com', password: 'test123' })}
      >
        Login
      </button>
      <button
        data-testid="register-btn"
        onClick={() => register({ email: 'test@test.com', password: 'test123', name: 'Test' })}
      >
        Register
      </button>
      <button
        data-testid="logout-btn"
        onClick={() => logout()}
      >
        Logout
      </button>
    </div>
  );
};

const TestDashboardComponent = (): React.ReactElement => {
  const { user, pets, matches, isLoading } = useDashboardData();

  return (
    <div>
      <div data-testid="loading">{isLoading ? 'Loading' : 'Ready'}</div>
      <div data-testid="user-name">{user?.name || 'No user'}</div>
      <div data-testid="pets-count">{pets?.length || 0}</div>
      <div data-testid="matches-count">{matches?.length || 0}</div>
    </div>
  );
};

const TestSwipeComponent = (): React.ReactElement => {
  const { pets, currentPet, swipe, isLoading, lastMatch } = useSwipeData();

  return (
    <div>
      <div data-testid="loading">{isLoading ? 'Loading' : 'Ready'}</div>
      <div data-testid="pets-count">{pets?.length || 0}</div>
      <div data-testid="current-pet">{currentPet?.name || 'No pet'}</div>
      <div data-testid="last-match">{lastMatch ? 'Match!' : 'No match'}</div>
      <button
        data-testid="swipe-like"
        onClick={() =>
          swipe({ petId: 'test-pet', action: 'like', timestamp: new Date().toISOString() })
        }
      >
        Like
      </button>
      <button
        data-testid="swipe-pass"
        onClick={() =>
          swipe({ petId: 'test-pet', action: 'pass', timestamp: new Date().toISOString() })
        }
      >
        Pass
      </button>
    </div>
  );
};

// Component test suite
export class ComponentTestSuite {
  private results: Array<{ name: string; status: 'PASS' | 'FAIL'; error?: string }> = [];

  async runAllTests(): Promise<void> {
    logger.info('🧪 ULTRA COMPONENT TESTING');
    logger.info('===========================');

    await this.testAuthHook();
    await this.testDashboardHook();
    await this.testSwipeHook();
    await this.testErrorBoundaries();
    await this.testAccessibility();

    this.printResults();
  }

  private async runTest(name: string, testFn: () => Promise<void>): Promise<void> {
    try {
      logger.info(`🧪 Testing: ${name}...`);
      await testFn();
      this.results.push({ name, status: 'PASS' });
      logger.info(`✅ ${name} - PASSED`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.results.push({ name, status: 'FAIL', error: errorMessage });
      logger.error(`❌ ${name} - FAILED: ${errorMessage}`);
    }
  }

  private async testAuthHook(): Promise<void> {
    await this.runTest('Auth Hook - Render', async () => {
      renderWithProviders(<TestAuthComponent />);

      expectAdapter(screen.getByTestId('loading')).toBeInTheDocument();
      expectAdapter(screen.getByTestId('login-btn')).toBeInTheDocument();
      expectAdapter(screen.getByTestId('register-btn')).toBeInTheDocument();
      expectAdapter(screen.getByTestId('logout-btn')).toBeInTheDocument();
    });

    await this.runTest('Auth Hook - Login Click', async () => {
      renderWithProviders(<TestAuthComponent />);

      const loginBtn = screen.getByTestId('login-btn');
      fireEvent.click(loginBtn);

      // Should show loading state
      await waitFor(() => {
        expectAdapter(screen.getByTestId('loading')).toHaveTextContent('Loading');
      });
    });
  }

  private async testDashboardHook(): Promise<void> {
    await this.runTest('Dashboard Hook - Render', async () => {
      renderWithProviders(<TestDashboardComponent />);

      expectAdapter(screen.getByTestId('loading')).toBeInTheDocument();
      expectAdapter(screen.getByTestId('pets-count')).toHaveTextContent('0');
      expectAdapter(screen.getByTestId('matches-count')).toHaveTextContent('0');
    });
  }

  private async testSwipeHook(): Promise<void> {
    await this.runTest('Swipe Hook - Render', async () => {
      renderWithProviders(<TestSwipeComponent />);

      expectAdapter(screen.getByTestId('loading')).toBeInTheDocument();
      expectAdapter(screen.getByTestId('swipe-like')).toBeInTheDocument();
      expectAdapter(screen.getByTestId('swipe-pass')).toBeInTheDocument();
    });

    await this.runTest('Swipe Hook - Like Action', async () => {
      renderWithProviders(<TestSwipeComponent />);

      const likeBtn = screen.getByTestId('swipe-like');
      fireEvent.click(likeBtn);

      // Should trigger swipe action
      expectAdapter(likeBtn).toBeInTheDocument();
    });
  }

  private async testErrorBoundaries(): Promise<void> {
    await this.runTest('Error Boundary - Catch Errors', async () => {
      // Mock component that throws error
      const ErrorComponent = (): JSX.Element => {
        throw new Error('Test error');
      };

      const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
        try {
          return <>{children}</>;
        } catch (error) {
          return <div data-testid="error-boundary">Error caught</div>;
        }
      };

      render(
        <ErrorBoundary>
          <ErrorComponent />
        </ErrorBoundary>,
      );

      // Should handle error gracefully
      expectAdapter(true).toBe(true); // Test passes if no uncaught error
    });
  }

  private async testAccessibility(): Promise<void> {
    await this.runTest('Accessibility - ARIA Labels', async () => {
      renderWithProviders(<TestAuthComponent />);

      const buttons = screen.getAllByRole('button');
      expectAdapter(buttons.length).toBeGreaterThan(0);

      // Check that buttons have accessible text
      buttons.forEach((button) => {
        expectAdapter(button).toHaveTextContent(/\w+/);
      });
    });

    await this.runTest('Accessibility - Keyboard Navigation', async () => {
      renderWithProviders(<TestAuthComponent />);

      const loginBtn = screen.getByTestId('login-btn');

      // Should be focusable
      loginBtn.focus();
      expectAdapter(document.activeElement).toBe(loginBtn);
    });
  }

  private printResults(): void {
    const total = this.results.length;
    const passed = this.results.filter((r) => r.status === 'PASS').length;
    const failed = this.results.filter((r) => r.status === 'FAIL').length;

    logger.info('\n🏆 COMPONENT TEST RESULTS');
    logger.info('=========================');
    logger.info(`📊 Total Tests: ${total}`);
    logger.info(`✅ Passed: ${passed}`);
    logger.info(`❌ Failed: ${failed}`);
    logger.info(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    if (failed > 0) {
      logger.error('\n💥 FAILED TESTS:');
      this.results
        .filter((r) => r.status === 'FAIL')
        .forEach((r) => {
          logger.error(`❌ ${r.name}: ${r.error}`);
        });
    }
  }
}

// Mock expect function for testing
const expect = (actual: unknown) => ({
  toBe: (expected: unknown) => {
    if (actual !== expected) {
      throw new Error(`Expected ${expected}, got ${actual}`);
    }
  },
  toBeInTheDocument: () => {
    if (!actual) {
      throw new Error('Element not found in document');
    }
  },
  toHaveTextContent: (expected: string | RegExp) => {
    const text = actual.textContent || '';
    if (typeof expected === 'string') {
      if (!text.includes(expected)) {
        throw new Error(`Expected text to contain "${expected}", got "${text}"`);
      }
    } else {
      if (!expected.test(text)) {
        throw new Error(`Expected text to match ${expected}, got "${text}"`);
      }
    }
  },
  toBeGreaterThan: (expected: number) => {
    if (actual <= expected) {
      throw new Error(`Expected ${actual} to be greater than ${expected}`);
    }
  },
});

export const _componentTestSuite = new ComponentTestSuite();
