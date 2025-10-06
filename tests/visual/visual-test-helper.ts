/**
 * Percy Visual Regression Testing Configuration
 * Captures and compares visual changes across deployments
 */
import { percySnapshot } from '@percy/playwright';

export class VisualTestHelper {
  /**
   * Capture full page snapshot
   */
  static async capturePage(page: any, name: string, options = {}) {
    await percySnapshot(page, name, {
      widths: [375, 768, 1280, 1920],
      minHeight: 600,
      ...options,
    });
  }

  /**
   * Capture component snapshot
   */
  static async captureComponent(page: any, selector: string, name: string, options = {}) {
    const element = page.locator(selector);
    await percySnapshot(page, name, {
      element,
      widths: [375, 768, 1280],
      ...options,
    });
  }

  /**
   * Capture mobile viewport
   */
  static async captureMobile(page: any, name: string, options = {}) {
    await page.setViewportSize({ width: 375, height: 667 });
    await percySnapshot(page, name, {
      widths: [375],
      ...options,
    });
  }

  /**
   * Capture desktop viewport
   */
  static async captureDesktop(page: any, name: string, options = {}) {
    await page.setViewportSize({ width: 1280, height: 720 });
    await percySnapshot(page, name, {
      widths: [1280],
      ...options,
    });
  }

  /**
   * Capture tablet viewport
   */
  static async captureTablet(page: any, name: string, options = {}) {
    await page.setViewportSize({ width: 768, height: 1024 });
    await percySnapshot(page, name, {
      widths: [768],
      ...options,
    });
  }

  /**
   * Capture with different themes
   */
  static async captureThemes(page: any, name: string, options = {}) {
    // Light theme
    await page.emulateMedia({ colorScheme: 'light' });
    await percySnapshot(page, `${name} - Light Theme`, options);
    
    // Dark theme
    await page.emulateMedia({ colorScheme: 'dark' });
    await percySnapshot(page, `${name} - Dark Theme`, options);
  }

  /**
   * Capture with different states
   */
  static async captureStates(page: any, name: string, states: string[], options = {}) {
    for (const state of states) {
      await page.evaluate((stateName) => {
        document.body.setAttribute('data-state', stateName);
      }, state);
      
      await percySnapshot(page, `${name} - ${state}`, options);
    }
  }

  /**
   * Capture with loading states
   */
  static async captureLoadingStates(page: any, name: string, options = {}) {
    // Loading state
    await page.evaluate(() => {
      document.body.classList.add('loading');
    });
    await percySnapshot(page, `${name} - Loading`, options);
    
    // Error state
    await page.evaluate(() => {
      document.body.classList.remove('loading');
      document.body.classList.add('error');
    });
    await percySnapshot(page, `${name} - Error`, options);
    
    // Success state
    await page.evaluate(() => {
      document.body.classList.remove('error');
      document.body.classList.add('success');
    });
    await percySnapshot(page, `${name} - Success`, options);
    
    // Reset
    await page.evaluate(() => {
      document.body.className = '';
    });
  }

  /**
   * Capture with different user types
   */
  static async captureUserTypes(page: any, name: string, options = {}) {
    // Free user
    await page.evaluate(() => {
      window.user = { isPremium: false };
    });
    await percySnapshot(page, `${name} - Free User`, options);
    
    // Premium user
    await page.evaluate(() => {
      window.user = { isPremium: true };
    });
    await percySnapshot(page, `${name} - Premium User`, options);
  }

  /**
   * Capture with different data states
   */
  static async captureDataStates(page: any, name: string, options = {}) {
    // Empty state
    await page.evaluate(() => {
      window.mockData = { pets: [], matches: [] };
    });
    await percySnapshot(page, `${name} - Empty State`, options);
    
    // Populated state
    await page.evaluate(() => {
      window.mockData = {
        pets: [
          { id: 1, name: 'Buddy', species: 'dog' },
          { id: 2, name: 'Luna', species: 'cat' },
        ],
        matches: [
          { id: 1, pets: ['Buddy', 'Max'] },
        ],
      };
    });
    await percySnapshot(page, `${name} - Populated State`, options);
  }
}

export default VisualTestHelper;
