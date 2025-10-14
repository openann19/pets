/**
 * E2E Test Support File
 * Global commands and configurations for Cypress tests
 */

import 'cypress-real-events/support';
import './commands';

// Global error handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // Don't fail tests on uncaught exceptions from the app
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  if (err.message.includes('Non-Error promise rejection')) {
    return false;
  }
  return true;
});

// Global before hook
beforeEach(() => {
  // Clear all storage before each test
  cy.clearAllStorage();

  // Clear cookies
  cy.clearCookies();

  // Mock external services
  cy.intercept('GET', '**/analytics/**', { fixture: 'analytics.json' }).as('analytics');
  cy.intercept('POST', '**/analytics/**', { statusCode: 200 }).as('analyticsPost');

  // Mock geolocation
  cy.window().then((win) => {
    cy.stub(win.navigator.geolocation, 'getCurrentPosition').callsFake((success) => {
      success({
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
          accuracy: 100,
        },
      });
    });
  });
});

// Global after hook
afterEach(() => {
  // Clean up any test data
  cy.task('db:clean');
});

// Custom viewport presets
Cypress.Commands.add('setViewport', (size: 'mobile' | 'tablet' | 'desktop') => {
  const viewports = {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1280, height: 720 },
  };

  cy.viewport(viewports[size].width, viewports[size].height);
});

// Authentication helpers
Cypress.Commands.add('login', (user = 'testUser') => {
  const users = {
    testUser: Cypress.env('testUser'),
    premiumUser: Cypress.env('premiumUser'),
  };

  const userData = users[user];

  cy.session([userData.email, userData.password], () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type(userData.email);
    cy.get('input[name="password"]').type(userData.password);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/swipe');
  });
});

Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="logout-button"]').click();
  cy.get('[data-testid="confirm-logout"]').click();
  cy.url().should('include', '/login');
});

// API helpers
Cypress.Commands.add(
  'apiRequest',
  (method: string, endpoint: string, body?: Record<string, unknown>) =>
    cy.request({
      method,
      url: `${Cypress.env('apiUrl')}${endpoint}`,
      body,
      headers: {
        'Content-Type': 'application/json',
      },
    }),
);

// File upload helpers
Cypress.Commands.add('uploadFile', (selector: string, fileName: string) => {
  cy.get(selector).selectFile(`cypress/fixtures/${fileName}`, { force: true });
});

// Wait for network idle
Cypress.Commands.add('waitForNetworkIdle', (timeout = 2000) => {
  cy.window().then(
    (win) =>
      new Cypress.Promise((resolve) => {
        let timeoutId: NodeJS.Timeout;

        const checkIdle = () => {
          if (win.performance && win.performance.getEntriesByType) {
            const entries = win.performance.getEntriesByType('navigation');
            if (entries.length > 0) {
              clearTimeout(timeoutId);
              timeoutId = setTimeout(resolve, timeout);
            }
          }
        };

        checkIdle();
      }),
  );
});

// Accessibility helpers
Cypress.Commands.add('checkA11y', () => {
  cy.injectAxe();
  cy.checkA11y();
});

// Performance helpers
Cypress.Commands.add('measurePerformance', (name: string) => {
  cy.window().then((win) => {
    const { performance } = win;
    const navigation = performance.getEntriesByType('navigation')[0]!;

    cy.log(`Performance metrics for ${name}:`, {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      totalTime: navigation.loadEventEnd - navigation.fetchStart,
    });
  });
});

// Database helpers
Cypress.Commands.add('seedDatabase', (fixture: string) => {
  cy.task('db:seed', fixture);
});

Cypress.Commands.add('cleanDatabase', () => {
  cy.task('db:clean');
});

Cypress.Commands.add('resetDatabase', () => {
  cy.task('db:reset');
});

// Mock helpers
Cypress.Commands.add(
  'mockApi',
  (method: string, url: string, response: Record<string, unknown> | string) => {
    cy.intercept(method, url, response).as(`mock${method}${url.replace(/[^a-zA-Z0-9]/g, '')}`);
  },
);

// Real-time helpers
Cypress.Commands.add('waitForWebSocket', (event: string) => {
  cy.window().then(
    (win) =>
      new Cypress.Promise((resolve) => {
        if (win.io) {
          win.io.on(event, resolve);
        } else {
          resolve();
        }
      }),
  );
});

// Error boundary helpers
Cypress.Commands.add('triggerError', () => {
  cy.window().then((win) => {
    win.dispatchEvent(new Event('error'));
  });
});

// Memory helpers
Cypress.Commands.add('checkMemoryUsage', () => {
  cy.window().then((win) => {
    if (win.performance?.memory) {
      const { memory } = win.performance;
      cy.log('Memory usage:', {
        used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)} MB`,
        total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)} MB`,
        limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)} MB`,
      });
    }
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      setViewport(size: 'mobile' | 'tablet' | 'desktop'): Chainable<void>;
      login(user?: 'testUser' | 'premiumUser'): Chainable<void>;
      logout(): Chainable<void>;
      apiRequest(method: string, endpoint: string, body?: Record<string, unknown>): Chainable;
      uploadFile(selector: string, fileName: string): Chainable<void>;
      waitForNetworkIdle(timeout?: number): Chainable<void>;
      checkA11y(): Chainable<void>;
      measurePerformance(name: string): Chainable<void>;
      seedDatabase(fixture: string): Chainable<void>;
      cleanDatabase(): Chainable<void>;
      resetDatabase(): Chainable<void>;
      mockApi(
        method: string,
        url: string,
        response: Record<string, unknown> | string,
      ): Chainable<void>;
      waitForWebSocket(event: string): Chainable<void>;
      triggerError(): Chainable<void>;
      checkMemoryUsage(): Chainable<void>;
    }
  }
}
