import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration - 2025 Standards
 * E2E Testing with Visual Regression and Accessibility
 */
export default defineConfig({
  // === Test Directory ===
  testDir: './e2e',

  // === Timeout ===
  timeout: 30000,
  expect: {
    timeout: 5000,
    // === Visual Regression Testing ===
    toHaveScreenshot: {
      // Maximum allowed pixel difference
      maxDiffPixels: 100,

      // Threshold for pixel difference (0-1)
      threshold: 0.2,

      // Animations
      animations: 'disabled',

      // Scale
      scale: 'css',
    },
  },

  // === Fullyparallel ===
  fullyParallel: true,

  // === Fail Fast ===
  forbidOnly: !!process.env['CI'],

  // === Retries ===
  retries: process.env['CI'] ? 2 : 0,

  // === Workers ===
  workers: process.env['CI'] ? 2 : undefined,

  // === Reporter ===
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    process.env['CI'] ? ['github'] : ['list'],
  ],

  // === Use Options ===
  use: {
    // Base URL
    baseURL: process.env['BASE_URL'] || 'http://localhost:3000',

    // Trace
    trace: 'on-first-retry',

    // Screenshot
    screenshot: 'only-on-failure',

    // Video
    video: 'retain-on-failure',

    // Action Timeout
    actionTimeout: 10000,

    // Navigation Timeout
    navigationTimeout: 30000,
  },

  // === Projects (Multiple Browsers & Devices) ===
  projects: [
    // === Desktop Browsers ===
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
      },
    },

    // === Mobile Devices ===
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
      },
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 13'],
      },
    },

    // === Tablet ===
    {
      name: 'tablet',
      use: {
        ...devices['iPad Pro'],
      },
    },
  ],

  // === Web Server ===
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env['CI'],
    timeout: 120000,
  },
});
