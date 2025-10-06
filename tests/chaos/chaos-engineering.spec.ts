/**
 * Chaos Engineering Tests for PawfectMatch
 * Tests system resilience under failure conditions
 */
import { test, expect } from '@playwright/test';

test.describe('Chaos Engineering Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@playwright.com');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should handle API server failure gracefully', async ({ page }) => {
    // Simulate API server failure
    await page.route('**/api/**', route => route.abort());
    
    await page.goto('/discover');
    
    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Unable to connect');
    
    // Should show retry button
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
    
    // Should allow user to continue using cached data
    await expect(page.locator('[data-testid="cached-content"]')).toBeVisible();
  });

  test('should handle database connection failure', async ({ page }) => {
    // Simulate database failure
    await page.route('**/api/pets/**', route => {
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Database connection failed',
          },
        }),
      });
    });
    
    await page.goto('/discover');
    
    // Should show service unavailable message
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Service temporarily unavailable');
    
    // Should show fallback content
    await expect(page.locator('[data-testid="fallback-content"]')).toBeVisible();
  });

  test('should handle slow API responses', async ({ page }) => {
    // Simulate slow API responses
    await page.route('**/api/pets/discover', route => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { pets: [] },
          }),
        });
      }, 5000);
    });
    
    await page.goto('/discover');
    
    // Should show loading state
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
    
    // Should show timeout message after 3 seconds
    await page.waitForTimeout(3000);
    await expect(page.locator('[data-testid="timeout-message"]')).toBeVisible();
    
    // Should show retry option
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });

  test('should handle partial API failures', async ({ page }) => {
    // Some endpoints work, others fail
    await page.route('**/api/pets/discover', route => route.abort());
    await page.route('**/api/matches', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { matches: [] },
        }),
      });
    });
    
    await page.goto('/dashboard');
    
    // Matches should load
    await expect(page.locator('[data-testid="matches-section"]')).toBeVisible();
    
    // Pet discovery should show error
    await page.click('[data-testid="discover-link"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('should handle memory leaks gracefully', async ({ page }) => {
    // Simulate memory pressure
    await page.evaluate(() => {
      // Create memory pressure
      const arrays = [];
      for (let i = 0; i < 1000; i++) {
        arrays.push(new Array(10000).fill('memory-pressure'));
      }
    });
    
    await page.goto('/discover');
    
    // Should still function normally
    await expect(page.locator('[data-testid="pet-card"]')).toBeVisible();
    
    // Should show performance warning
    await expect(page.locator('[data-testid="performance-warning"]')).toBeVisible();
  });

  test('should handle network timeouts', async ({ page }) => {
    // Simulate network timeout
    await page.route('**/api/**', route => {
      // Don't respond, let it timeout
    });
    
    await page.goto('/discover');
    
    // Should show timeout after 10 seconds
    await page.waitForTimeout(10000);
    await expect(page.locator('[data-testid="timeout-message"]')).toBeVisible();
    
    // Should allow retry
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });

  test('should handle malformed API responses', async ({ page }) => {
    // Simulate malformed JSON response
    await page.route('**/api/pets/discover', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{"malformed": json}', // Invalid JSON
      });
    });
    
    await page.goto('/discover');
    
    // Should show parsing error
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid response format');
    
    // Should show fallback content
    await expect(page.locator('[data-testid="fallback-content"]')).toBeVisible();
  });

  test('should handle authentication token expiration', async ({ page }) => {
    // Simulate token expiration
    await page.route('**/api/pets/**', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'Authentication token has expired',
          },
        }),
      });
    });
    
    await page.goto('/discover');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
    
    // Should show token expired message
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Session expired');
  });

  test('should handle rate limiting', async ({ page }) => {
    // Simulate rate limiting
    await page.route('**/api/pets/discover', route => {
      route.fulfill({
        status: 429,
        contentType: 'application/json',
        headers: {
          'Retry-After': '60',
        },
        body: JSON.stringify({
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many requests',
          },
        }),
      });
    });
    
    await page.goto('/discover');
    
    // Should show rate limit message
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Too many requests');
    
    // Should show retry timer
    await expect(page.locator('[data-testid="retry-timer"]')).toBeVisible();
  });

  test('should handle concurrent user actions', async ({ page }) => {
    // Simulate multiple rapid actions
    await page.goto('/discover');
    
    // Rapidly click like buttons
    for (let i = 0; i < 10; i++) {
      await page.click('[data-testid="like-button"]');
      await page.waitForTimeout(100);
    }
    
    // Should handle gracefully
    await expect(page.locator('[data-testid="pet-card"]')).toBeVisible();
    
    // Should show queued actions
    await expect(page.locator('[data-testid="queued-actions"]')).toBeVisible();
  });

  test('should handle browser storage corruption', async ({ page }) => {
    // Corrupt localStorage
    await page.evaluate(() => {
      localStorage.setItem('auth-token', 'corrupted-token');
      localStorage.setItem('user-data', 'invalid-json');
    });
    
    await page.goto('/dashboard');
    
    // Should clear corrupted data
    await expect(page).toHaveURL('/login');
    
    // Should show data corruption message
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Data corruption detected');
  });

  test('should handle WebSocket connection failure', async ({ page }) => {
    // Simulate WebSocket failure
    await page.evaluate(() => {
      window.WebSocket = class {
        constructor() {
          throw new Error('WebSocket connection failed');
        }
      };
    });
    
    await page.goto('/chat/test-match-id');
    
    // Should show WebSocket error
    await expect(page.locator('[data-testid="websocket-error"]')).toBeVisible();
    
    // Should fallback to polling
    await expect(page.locator('[data-testid="polling-mode"]')).toBeVisible();
  });

  test('should handle file upload failures', async ({ page }) => {
    // Simulate file upload failure
    await page.route('**/api/upload/**', route => {
      route.fulfill({
        status: 413,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message: 'File size exceeds limit',
          },
        }),
      });
    });
    
    await page.goto('/pets/new');
    
    // Upload a file
    await page.setInputFiles('[data-testid="photo-upload"]', 'tests/fixtures/large-image.jpg');
    
    // Should show file size error
    await expect(page.locator('[data-testid="error-message"]')).toContainText('File size exceeds limit');
    
    // Should allow retry with smaller file
    await expect(page.locator('[data-testid="retry-upload"]')).toBeVisible();
  });

  test('should handle system resource exhaustion', async ({ page }) => {
    // Simulate resource exhaustion
    await page.route('**/api/**', route => {
      route.fulfill({
        status: 507,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: {
            code: 'INSUFFICIENT_STORAGE',
            message: 'System resources exhausted',
          },
        }),
      });
    });
    
    await page.goto('/discover');
    
    // Should show resource exhaustion message
    await expect(page.locator('[data-testid="error-message"]')).toContainText('System resources exhausted');
    
    // Should show maintenance mode
    await expect(page.locator('[data-testid="maintenance-mode"]')).toBeVisible();
  });

  test('should handle cascading failures', async ({ page }) => {
    // Simulate cascading failures
    await page.route('**/api/pets/**', route => route.abort());
    await page.route('**/api/matches/**', route => route.abort());
    await page.route('**/api/users/**', route => route.abort());
    
    await page.goto('/dashboard');
    
    // Should show system-wide error
    await expect(page.locator('[data-testid="system-error"]')).toBeVisible();
    
    // Should show emergency contact
    await expect(page.locator('[data-testid="emergency-contact"]')).toBeVisible();
    
    // Should allow offline mode
    await expect(page.locator('[data-testid="offline-mode"]')).toBeVisible();
  });
});
