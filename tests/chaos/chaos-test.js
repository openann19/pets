import { test, expect } from '@playwright/test';

// Chaos Engineering Test Suite
// Tests system resilience under various failure conditions

test.describe('Chaos Engineering - System Resilience', () => {
  test.beforeEach(async ({ page }) => {
    // Set up test environment
    await page.goto('/');
  });

  test('Network latency simulation', async ({ page }) => {
    // Simulate network latency
    await page.route('**/*', async (route) => {
      // Add random delay between 100ms and 2000ms
      const delay = Math.random() * 1900 + 100;
      await new Promise(resolve => setTimeout(resolve, delay));
      await route.continue();
    });

    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;

    // Verify page still loads despite latency
    await expect(page).toHaveTitle(/PawfectMatch/);
    console.log(`Page loaded in ${loadTime}ms with simulated latency`);
  });

  test('Partial network failure simulation', async ({ page }) => {
    let requestCount = 0;
    
    // Simulate 30% of requests failing
    await page.route('**/*', async (route) => {
      requestCount++;
      if (requestCount % 10 < 3) { // 30% failure rate
        await route.abort('failed');
      } else {
        await route.continue();
      }
    });

    // Try to navigate and interact
    await page.goto('/');
    
    // Verify graceful degradation
    const title = await page.title();
    expect(title).toContain('PawfectMatch');
    
    // Check for error handling
    const errorElements = await page.locator('[data-testid="error"]').count();
    console.log(`Found ${errorElements} error elements during partial network failure`);
  });

  test('Memory pressure simulation', async ({ page }) => {
    // Simulate memory pressure by creating many DOM elements
    await page.evaluate(() => {
      // Create memory pressure
      const elements = [];
      for (let i = 0; i < 10000; i++) {
        const div = document.createElement('div');
        div.textContent = `Memory pressure element ${i}`;
        div.style.display = 'none';
        document.body.appendChild(div);
        elements.push(div);
      }
      
      // Clean up after a delay
      setTimeout(() => {
        elements.forEach(el => el.remove());
      }, 1000);
    });

    // Verify application still functions
    await page.goto('/');
    await expect(page).toHaveTitle(/PawfectMatch/);
    
    // Check performance metrics
    const performanceEntries = await page.evaluate(() => {
      return performance.getEntriesByType('navigation')[0];
    });
    
    console.log(`Page load time under memory pressure: ${performanceEntries.loadEventEnd - performanceEntries.loadEventStart}ms`);
  });

  test('CPU intensive operation simulation', async ({ page }) => {
    // Simulate CPU intensive operations
    await page.evaluate(() => {
      // Block main thread for a short period
      const start = Date.now();
      while (Date.now() - start < 100) {
        // CPU intensive loop
        Math.random() * Math.random();
      }
    });

    // Verify UI remains responsive
    await page.goto('/');
    await expect(page).toHaveTitle(/PawfectMatch/);
    
    // Test interaction responsiveness
    const button = page.locator('button').first();
    if (await button.isVisible()) {
      const clickStart = Date.now();
      await button.click();
      const clickTime = Date.now() - clickStart;
      console.log(`Button click response time: ${clickTime}ms`);
      expect(clickTime).toBeLessThan(1000); // Should respond within 1s
    }
  });

  test('Storage quota exceeded simulation', async ({ page }) => {
    // Simulate storage quota exceeded
    await page.evaluate(() => {
      try {
        // Try to fill localStorage
        const data = 'x'.repeat(1024 * 1024); // 1MB
        for (let i = 0; i < 10; i++) {
          localStorage.setItem(`chaos-test-${i}`, data);
        }
      } catch (error) {
        console.log('Storage quota exceeded (expected in chaos test)');
      }
    });

    // Verify application handles storage errors gracefully
    await page.goto('/');
    await expect(page).toHaveTitle(/PawfectMatch/);
    
    // Check for error handling
    const errorMessages = await page.locator('[data-testid="storage-error"]').count();
    console.log(`Storage error handling elements: ${errorMessages}`);
  });

  test('Concurrent user simulation', async ({ browser }) => {
    // Simulate multiple concurrent users
    const contexts = [];
    const pages = [];
    
    try {
      // Create multiple browser contexts
      for (let i = 0; i < 5; i++) {
        const context = await browser.newContext();
        const page = await context.newPage();
        contexts.push(context);
        pages.push(page);
      }

      // Navigate all pages simultaneously
      const navigationPromises = pages.map(page => page.goto('/'));
      await Promise.all(navigationPromises);

      // Verify all pages loaded successfully
      for (let i = 0; i < pages.length; i++) {
        const title = await pages[i].title();
        expect(title).toContain('PawfectMatch');
        console.log(`Concurrent user ${i + 1} loaded successfully`);
      }

      // Test concurrent interactions
      const interactionPromises = pages.map(async (page, index) => {
        const button = page.locator('button').first();
        if (await button.isVisible()) {
          await button.click();
          console.log(`Concurrent user ${index + 1} clicked button`);
        }
      });

      await Promise.all(interactionPromises);

    } finally {
      // Clean up contexts
      for (const context of contexts) {
        await context.close();
      }
    }
  });

  test('Service worker failure simulation', async ({ page }) => {
    // Disable service worker
    await page.addInitScript(() => {
      // Override service worker registration
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register = () => Promise.reject(new Error('Service worker disabled for chaos test'));
      }
    });

    // Verify application works without service worker
    await page.goto('/');
    await expect(page).toHaveTitle(/PawfectMatch/);
    
    // Check for offline functionality
    const offlineElements = await page.locator('[data-testid="offline"]').count();
    console.log(`Offline functionality elements: ${offlineElements}`);
  });

  test('Third-party service failure simulation', async ({ page }) => {
    // Block third-party requests
    await page.route('**/api/external/**', route => route.abort());
    await page.route('**/analytics/**', route => route.abort());
    await page.route('**/cdn/**', route => route.abort());

    // Verify core functionality still works
    await page.goto('/');
    await expect(page).toHaveTitle(/PawfectMatch/);
    
    // Check for graceful degradation
    const fallbackElements = await page.locator('[data-testid="fallback"]').count();
    console.log(`Fallback elements for third-party failures: ${fallbackElements}`);
  });

  test('Database connection failure simulation', async ({ page }) => {
    // Simulate database connection issues
    await page.route('**/api/**', async (route) => {
      const url = route.request().url();
      if (url.includes('/api/pets') || url.includes('/api/users')) {
        // Simulate database timeout
        await new Promise(resolve => setTimeout(resolve, 5000));
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Database connection timeout' })
        });
      } else {
        await route.continue();
      }
    });

    // Verify error handling
    await page.goto('/');
    await expect(page).toHaveTitle(/PawfectMatch/);
    
    // Check for error messages
    const errorElements = await page.locator('[data-testid="database-error"]').count();
    console.log(`Database error handling elements: ${errorElements}`);
  });
});
