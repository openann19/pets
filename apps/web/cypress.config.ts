import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    fixturesFolder: 'cypress/fixtures',
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    downloadsFolder: 'cypress/downloads',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    experimentalStudio: true,
    experimentalMemoryManagement: true,
    chromeWebSecurity: false,
    blockHosts: [
      '*.google-analytics.com',
      '*.googletagmanager.com',
      '*.facebook.com',
      '*.doubleclick.net',
    ],
    env: {
      apiUrl: 'http://localhost:5000/api',
      testUser: {
        email: 'test@pawfectmatch.com',
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
      },
      premiumUser: {
        email: 'premium@pawfectmatch.com',
        password: 'PremiumPassword123!',
        firstName: 'Premium',
        lastName: 'User',
      },
    },
    setupNodeEvents(on, config) {
      // Task for database operations
      on('task', {
        'db:seed': () =>
          // Seed test database
          null,
        'db:clean': () =>
          // Clean test database
          null,
        'db:reset': () =>
          // Reset test database
          null,
      });

      // Browser launch options
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'chrome') {
          launchOptions.args.push('--disable-web-security');
          launchOptions.args.push('--disable-features=VizDisplayCompositor');
          launchOptions.args.push('--disable-dev-shm-usage');
          launchOptions.args.push('--no-sandbox');
        }
        return launchOptions;
      });

      return config;
    },
  },
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.ts',
    indexHtmlFile: 'cypress/support/component-index.html',
  },
});
