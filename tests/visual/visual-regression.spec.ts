import { test, expect } from '@playwright/test';
import { percySnapshot } from '@percy/playwright';

// Visual Regression Test Suite
// Ensures UI consistency across different browsers and screen sizes

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set consistent viewport for visual tests
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('Homepage visual consistency', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take Percy snapshot
    await percySnapshot(page, 'Homepage');
    
    // Verify critical elements are visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
  });

  test('Login page visual consistency', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    await percySnapshot(page, 'Login Page');
    
    // Verify form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('Registration page visual consistency', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    
    await percySnapshot(page, 'Registration Page');
    
    // Verify form elements
    await expect(page.locator('input[name="firstName"]')).toBeVisible();
    await expect(page.locator('input[name="lastName"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('Premium page visual consistency', async ({ page }) => {
    await page.goto('/premium');
    await page.waitForLoadState('networkidle');
    
    await percySnapshot(page, 'Premium Page');
    
    // Verify premium features are displayed
    await expect(page.locator('[data-testid="premium-features"]')).toBeVisible();
  });

  test('Pet matching interface visual consistency', async ({ page }) => {
    // Mock authentication for protected routes
    await page.addInitScript(() => {
      localStorage.setItem('auth-token', 'mock-token');
    });
    
    await page.goto('/matches');
    await page.waitForLoadState('networkidle');
    
    await percySnapshot(page, 'Pet Matching Interface');
    
    // Verify matching elements
    await expect(page.locator('[data-testid="pet-card"]')).toBeVisible();
  });

  test('Mobile responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await percySnapshot(page, 'Mobile Homepage');
    
    // Verify mobile navigation
    const mobileMenu = page.locator('[data-testid="mobile-menu"]');
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
      await percySnapshot(page, 'Mobile Menu Open');
    }
  });

  test('Tablet responsive design', async ({ page }) => {
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await percySnapshot(page, 'Tablet Homepage');
  });

  test('Dark mode visual consistency', async ({ page }) => {
    // Enable dark mode
    await page.addInitScript(() => {
      document.documentElement.classList.add('dark');
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await percySnapshot(page, 'Dark Mode Homepage');
    
    // Verify dark mode is applied
    const isDarkMode = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });
    expect(isDarkMode).toBe(true);
  });

  test('Loading states visual consistency', async ({ page }) => {
    // Simulate slow network
    await page.route('**/*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });
    
    await page.goto('/');
    
    // Capture loading state
    await percySnapshot(page, 'Loading State');
    
    // Wait for full load
    await page.waitForLoadState('networkidle');
    await percySnapshot(page, 'Loaded State');
  });

  test('Error states visual consistency', async ({ page }) => {
    // Simulate 404 error
    await page.goto('/non-existent-page');
    await page.waitForLoadState('networkidle');
    
    await percySnapshot(page, '404 Error Page');
    
    // Verify error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('Form validation visual consistency', async ({ page }) => {
    await page.goto('/login');
    
    // Submit form without filling fields
    await page.locator('button[type="submit"]').click();
    
    // Wait for validation messages
    await page.waitForTimeout(500);
    
    await percySnapshot(page, 'Form Validation Errors');
    
    // Verify validation messages
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
  });

  test('Success states visual consistency', async ({ page }) => {
    // Mock successful form submission
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, token: 'mock-token' })
      });
    });
    
    await page.goto('/login');
    
    // Fill and submit form
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.locator('button[type="submit"]').click();
    
    // Wait for success state
    await page.waitForTimeout(1000);
    
    await percySnapshot(page, 'Success State');
  });

  test('Accessibility visual indicators', async ({ page }) => {
    await page.goto('/');
    
    // Focus on interactive elements
    await page.locator('button').first().focus();
    await percySnapshot(page, 'Focus State');
    
    // Hover over elements
    await page.locator('a').first().hover();
    await percySnapshot(page, 'Hover State');
  });

  test('Cross-browser consistency', async ({ page, browserName }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take browser-specific snapshot
    await percySnapshot(page, `Homepage - ${browserName}`);
    
    // Verify consistent layout
    const headerHeight = await page.locator('header').evaluate(el => el.offsetHeight);
    expect(headerHeight).toBeGreaterThan(0);
  });

  test('Print styles visual consistency', async ({ page }) => {
    await page.goto('/');
    
    // Simulate print media
    await page.emulateMedia({ media: 'print' });
    
    await percySnapshot(page, 'Print Styles');
    
    // Verify print-specific elements
    const printElements = await page.locator('[data-testid="print-only"]').count();
    console.log(`Print-specific elements: ${printElements}`);
  });

  test('High contrast mode visual consistency', async ({ page }) => {
    // Enable high contrast mode
    await page.addInitScript(() => {
      document.documentElement.style.filter = 'contrast(200%)';
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await percySnapshot(page, 'High Contrast Mode');
    
    // Verify high contrast is applied
    const contrast = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).filter;
    });
    expect(contrast).toContain('contrast(200%)');
  });
});