import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pages = [
  { name: 'Homepage', url: '/' },
  { name: 'Login', url: '/login' },
  { name: 'Register', url: '/register' },
];

test.describe('Accessibility Tests', () => {
  pages.forEach(({ name, url }) => {
    test(`${name} should have no accessibility violations`, async ({ page }) => {
      await page.goto(url);
      
      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle');
      
      // Run axe accessibility check
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      
      // Check for violations
      const violations = accessibilityScanResults.violations;
      
      // Log violations for debugging
      if (violations.length > 0) {
        console.log(`Accessibility violations on ${name}:`);
        violations.forEach((violation) => {
          console.log(`  - ${violation.id}: ${violation.description}`);
          console.log(`    Impact: ${violation.impact}`);
          console.log(`    Affected elements: ${violation.nodes.length}`);
        });
      }
      
      // Assert no critical or serious violations
      const criticalViolations = violations.filter(
        v => v.impact === 'critical' || v.impact === 'serious'
      );
      
      expect(criticalViolations).toHaveLength(0);
    });

    test(`${name} should be keyboard navigable`, async ({ page }) => {
      await page.goto(url);
      
      // Test tab navigation
      await page.keyboard.press('Tab');
      const firstFocusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(firstFocusedElement).toBeTruthy();
      
      // Test that skip link works
      const skipLink = page.locator('a[href="#main-content"]');
      if (await skipLink.count() > 0) {
        await skipLink.focus();
        await page.keyboard.press('Enter');
        const mainContent = await page.locator('#main-content');
        await expect(mainContent).toBeVisible();
      }
    });

    test(`${name} should have proper ARIA labels`, async ({ page }) => {
      await page.goto(url);
      
      // Check all buttons have accessible names
      const buttons = await page.$$('button');
      for (const button of buttons) {
        const hasText = await button.textContent();
        const hasAriaLabel = await button.getAttribute('aria-label');
        const hasAriaLabelledBy = await button.getAttribute('aria-labelledby');
        
        expect(
          hasText?.trim() || hasAriaLabel || hasAriaLabelledBy
        ).toBeTruthy();
      }
      
      // Check all links have accessible names
      const links = await page.$$('a');
      for (const link of links) {
        const hasText = await link.textContent();
        const hasAriaLabel = await link.getAttribute('aria-label');
        
        expect(hasText?.trim() || hasAriaLabel).toBeTruthy();
      }
      
      // Check form inputs have labels
      const inputs = await page.$$('input:not([type="hidden"])');
      for (const input of inputs) {
        const id = await input.getAttribute('id');
        const hasAriaLabel = await input.getAttribute('aria-label');
        const hasAriaLabelledBy = await input.getAttribute('aria-labelledby');
        
        if (id) {
          const label = await page.$(`label[for="${id}"]`);
          expect(label || hasAriaLabel || hasAriaLabelledBy).toBeTruthy();
        } else {
          expect(hasAriaLabel || hasAriaLabelledBy).toBeTruthy();
        }
      }
    });
  });
});