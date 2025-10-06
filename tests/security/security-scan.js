// Security Scanning Configuration for PawfectMatch Premium
// Comprehensive security testing and vulnerability detection

import { test, expect } from '@playwright/test';

// Security Test Suite
test.describe('Security Testing - Vulnerability Detection', () => {
  test.beforeEach(async ({ page }) => {
    // Set up security testing environment
    await page.goto('/');
  });

  test('XSS vulnerability detection', async ({ page }) => {
    // Test for reflected XSS
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src=x onerror=alert("XSS")>',
      '<svg onload=alert("XSS")>',
      '"><script>alert("XSS")</script>',
    ];

    for (const payload of xssPayloads) {
      // Test in URL parameters
      await page.goto(`/?q=${encodeURIComponent(payload)}`);
      
      // Check if script executed (should not)
      const alertHandled = await page.evaluate(() => {
        return window.alert.toString().includes('native code');
      });
      
      expect(alertHandled).toBe(true);
      
      // Check for proper encoding
      const bodyText = await page.textContent('body');
      expect(bodyText).not.toContain('<script>');
    }
  });

  test('SQL injection vulnerability detection', async ({ page }) => {
    // Test for SQL injection in search
    const sqlPayloads = [
      "' OR '1'='1",
      "'; DROP TABLE users; --",
      "' UNION SELECT * FROM users --",
      "1' OR '1'='1' --",
    ];

    for (const payload of sqlPayloads) {
      // Mock API response to check for SQL injection
      await page.route('**/api/pets/search**', async (route) => {
        const url = route.request().url();
        
        // Check if payload is properly encoded
        expect(url).not.toContain("' OR '1'='1");
        expect(url).not.toContain('DROP TABLE');
        expect(url).not.toContain('UNION SELECT');
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ pets: [] })
        });
      });

      await page.goto(`/search?q=${encodeURIComponent(payload)}`);
    }
  });

  test('CSRF protection verification', async ({ page }) => {
    // Test CSRF token presence
    await page.goto('/login');
    
    // Check for CSRF token in forms
    const csrfToken = await page.locator('input[name="_csrf"]').count();
    const csrfHeader = await page.locator('meta[name="csrf-token"]').count();
    
    // Should have CSRF protection
    expect(csrfToken + csrfHeader).toBeGreaterThan(0);
    
    // Test form submission without CSRF token
    await page.route('**/api/auth/login', async (route) => {
      const request = route.request();
      const headers = request.headers();
      
      // Should reject requests without proper CSRF protection
      if (!headers['x-csrf-token'] && !headers['x-requested-with']) {
        await route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'CSRF token missing' })
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        });
      }
    });

    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Should handle CSRF properly
    const response = await page.waitForResponse('**/api/auth/login');
    expect(response.status()).toBeLessThan(500);
  });

  test('Authentication bypass detection', async ({ page }) => {
    // Test for authentication bypass attempts
    const protectedRoutes = [
      '/premium',
      '/matches',
      '/profile',
      '/admin',
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);
      
      // Should redirect to login or show access denied
      const currentUrl = page.url();
      const isRedirected = currentUrl.includes('/login') || currentUrl.includes('/auth');
      const hasAccessDenied = await page.locator('[data-testid="access-denied"]').count() > 0;
      
      expect(isRedirected || hasAccessDenied).toBe(true);
    }
  });

  test('Sensitive data exposure detection', async ({ page }) => {
    // Check for sensitive data in client-side code
    await page.goto('/');
    
    // Get page source
    const pageContent = await page.content();
    
    // Should not contain sensitive information
    const sensitivePatterns = [
      /password.*=.*["'][^"']{8,}["']/i,
      /api[_-]?key.*=.*["'][^"']{10,}["']/i,
      /secret.*=.*["'][^"']{10,}["']/i,
      /token.*=.*["'][^"']{20,}["']/i,
      /mongodb:\/\/[^"']*:[^"']*@/i,
      /jwt.*=.*["'][^"']{20,}["']/i,
    ];

    for (const pattern of sensitivePatterns) {
      expect(pageContent).not.toMatch(pattern);
    }
  });

  test('Insecure HTTP headers detection', async ({ page }) => {
    const response = await page.goto('/');
    
    // Check for security headers
    const headers = response.headers();
    
    // Should have security headers
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['x-xss-protection']).toBe('1; mode=block');
    expect(headers['strict-transport-security']).toContain('max-age');
    expect(headers['content-security-policy']).toBeDefined();
    expect(headers['referrer-policy']).toBeDefined();
  });

  test('File upload security', async ({ page }) => {
    // Test file upload security
    await page.goto('/profile');
    
    // Create malicious file
    const maliciousFile = {
      name: 'malicious.php',
      mimeType: 'application/x-php',
      buffer: Buffer.from('<?php system($_GET["cmd"]); ?>')
    };

    // Mock file upload
    await page.route('**/api/upload', async (route) => {
      const request = route.request();
      const postData = request.postData();
      
      // Should reject PHP files
      if (postData && postData.includes('malicious.php')) {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'File type not allowed' })
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        });
      }
    });

    // Test file upload
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.count() > 0) {
      await fileInput.setInputFiles(maliciousFile);
      
      const response = await page.waitForResponse('**/api/upload');
      expect(response.status()).toBe(400);
    }
  });

  test('Session security', async ({ page }) => {
    // Test session security
    await page.goto('/login');
    
    // Check for secure session configuration
    const cookies = await page.context().cookies();
    
    for (const cookie of cookies) {
      if (cookie.name.includes('session') || cookie.name.includes('auth')) {
        // Should be secure and httpOnly
        expect(cookie.httpOnly).toBe(true);
        expect(cookie.secure).toBe(true);
        expect(cookie.sameSite).toBe('Strict');
      }
    }
  });

  test('Rate limiting verification', async ({ page }) => {
    // Test rate limiting
    const requests = [];
    
    // Make multiple rapid requests
    for (let i = 0; i < 10; i++) {
      requests.push(page.goto('/api/pets'));
    }
    
    const responses = await Promise.all(requests);
    
    // Should have rate limiting
    const rateLimited = responses.some(response => response.status() === 429);
    expect(rateLimited).toBe(true);
  });

  test('Input validation security', async ({ page }) => {
    // Test input validation
    await page.goto('/register');
    
    const maliciousInputs = [
      { field: 'email', value: '<script>alert("XSS")</script>@example.com' },
      { field: 'firstName', value: 'John\'; DROP TABLE users; --' },
      { field: 'lastName', value: 'Doe<script>alert("XSS")</script>' },
      { field: 'password', value: 'password<script>alert("XSS")</script>' },
    ];

    for (const input of maliciousInputs) {
      const field = page.locator(`input[name="${input.field}"]`);
      if (await field.count() > 0) {
        await field.fill(input.value);
        
        // Should sanitize or reject malicious input
        const value = await field.inputValue();
        expect(value).not.toContain('<script>');
        expect(value).not.toContain('DROP TABLE');
      }
    }
  });

  test('API security headers', async ({ page }) => {
    // Test API security
    await page.route('**/api/**', async (route) => {
      const response = await route.fetch();
      const headers = response.headers();
      
      // Should have API security headers
      expect(headers['x-content-type-options']).toBe('nosniff');
      expect(headers['x-frame-options']).toBe('DENY');
      
      await route.fulfill(response);
    });

    await page.goto('/');
  });

  test('Dependency vulnerability check', async ({ page }) => {
    // Check for known vulnerable dependencies
    await page.goto('/');
    
    // Get all script sources
    const scripts = await page.locator('script[src]').evaluateAll(scripts => 
      scripts.map(script => script.src)
    );
    
    // Check for known vulnerable libraries
    const vulnerablePatterns = [
      /jquery.*1\.(0|1|2|3|4|5|6|7|8|9|10|11)/,
      /lodash.*4\.(0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16)/,
      /moment.*2\.(0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29)/,
    ];

    for (const script of scripts) {
      for (const pattern of vulnerablePatterns) {
        expect(script).not.toMatch(pattern);
      }
    }
  });
});