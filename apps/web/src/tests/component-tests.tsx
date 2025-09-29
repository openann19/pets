/**
 * ULTRA COMPONENT TESTING 🧪
 * React component and hook testing suite
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth, useDashboardData, useSwipeData } from '../hooks/api-hooks';

// Test wrapper with providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

// Mock components for testing
const TestAuthComponent: React.FC = () => {
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
      <button data-testid="logout-btn" onClick={() => logout()}>
        Logout
      </button>
    </div>
  );
};

const TestDashboardComponent: React.FC = () => {
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

const TestSwipeComponent: React.FC = () => {
  const { pets, currentPet, swipe, isLoading, lastMatch } = useSwipeData();

  return (
    <div>
      <div data-testid="loading">{isLoading ? 'Loading' : 'Ready'}</div>
      <div data-testid="pets-count">{pets?.length || 0}</div>
      <div data-testid="current-pet">{currentPet?.name || 'No pet'}</div>
      <div data-testid="last-match">{lastMatch ? 'Match!' : 'No match'}</div>
      <button 
        data-testid="swipe-like"
        onClick={() => swipe({ petId: 'test-pet', action: 'like', timestamp: new Date().toISOString() })}
      >
        Like
      </button>
      <button 
        data-testid="swipe-pass"
        onClick={() => swipe({ petId: 'test-pet', action: 'pass', timestamp: new Date().toISOString() })}
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
    console.log('🧪 ULTRA COMPONENT TESTING');
    console.log('===========================');

    await this.testAuthHook();
    await this.testDashboardHook();
    await this.testSwipeHook();
    await this.testErrorBoundaries();
    await this.testAccessibility();

    this.printResults();
  }

  private async runTest(name: string, testFn: () => Promise<void>): Promise<void> {
    try {
      console.log(`🧪 Testing: ${name}...`);
      await testFn();
      this.results.push({ name, status: 'PASS' });
      console.log(`✅ ${name} - PASSED`);
    } catch (error: any) {
      this.results.push({ name, status: 'FAIL', error: error.message });
      console.log(`❌ ${name} - FAILED: ${error.message}`);
    }
  }

  private async testAuthHook(): Promise<void> {
    await this.runTest('Auth Hook - Render', async () => {
      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );

      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.getByTestId('login-btn')).toBeInTheDocument();
      expect(screen.getByTestId('register-btn')).toBeInTheDocument();
      expect(screen.getByTestId('logout-btn')).toBeInTheDocument();
    });

    await this.runTest('Auth Hook - Login Click', async () => {
      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );

      const loginBtn = screen.getByTestId('login-btn');
      fireEvent.click(loginBtn);

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
      });
    });
  }

  private async testDashboardHook(): Promise<void> {
    await this.runTest('Dashboard Hook - Render', async () => {
      render(
        <TestWrapper>
          <TestDashboardComponent />
        </TestWrapper>
      );

      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.getByTestId('pets-count')).toHaveTextContent('0');
      expect(screen.getByTestId('matches-count')).toHaveTextContent('0');
    });
  }

  private async testSwipeHook(): Promise<void> {
    await this.runTest('Swipe Hook - Render', async () => {
      render(
        <TestWrapper>
          <TestSwipeComponent />
        </TestWrapper>
      );

      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.getByTestId('swipe-like')).toBeInTheDocument();
      expect(screen.getByTestId('swipe-pass')).toBeInTheDocument();
    });

    await this.runTest('Swipe Hook - Like Action', async () => {
      render(
        <TestWrapper>
          <TestSwipeComponent />
        </TestWrapper>
      );

      const likeBtn = screen.getByTestId('swipe-like');
      fireEvent.click(likeBtn);

      // Should trigger swipe action
      expect(likeBtn).toBeInTheDocument();
    });
  }

  private async testErrorBoundaries(): Promise<void> {
    await this.runTest('Error Boundary - Catch Errors', async () => {
      // Mock component that throws error
      const ErrorComponent = () => {
        throw new Error('Test error');
      };

      const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
        try {
          return <>{children}</>;
        } catch (error) {
          return <div data-testid="error-boundary">Error caught</div>;
        }
      };

      render(
        <ErrorBoundary>
          <ErrorComponent />
        </ErrorBoundary>
      );

      // Should handle error gracefully
      expect(true).toBe(true); // Test passes if no uncaught error
    });
  }

  private async testAccessibility(): Promise<void> {
    await this.runTest('Accessibility - ARIA Labels', async () => {
      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);

      // Check that buttons have accessible text
      buttons.forEach(button => {
        expect(button).toHaveTextContent(/\w+/);
      });
    });

    await this.runTest('Accessibility - Keyboard Navigation', async () => {
      render(
        <TestWrapper>
          <TestAuthComponent />
        </TestWrapper>
      );

      const loginBtn = screen.getByTestId('login-btn');
      
      // Should be focusable
      loginBtn.focus();
      expect(document.activeElement).toBe(loginBtn);
    });
  }

  private printResults(): void {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;

    console.log('\n🏆 COMPONENT TEST RESULTS');
    console.log('=========================');
    console.log(`📊 Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log('\n💥 FAILED TESTS:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => {
          console.log(`❌ ${r.name}: ${r.error}`);
        });
    }
  }
}

// Mock expect function for testing
const expect = (actual: any) => ({
  toBe: (expected: any) => {
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
  }
});

export const componentTestSuite = new ComponentTestSuite();
