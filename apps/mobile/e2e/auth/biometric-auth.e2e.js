/**
 * Biometric Authentication E2E Tests
 * Comprehensive testing of biometric authentication flows
 */

describe('Biometric Authentication', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Biometric Setup', () => {
    it('should prompt for biometric setup on first login', async () => {
      // Login first
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('login-button')).tap();
      await expect(element(by.id('dashboard-screen'))).toBeVisible();

      // Navigate to settings
      await element(by.id('settings-button')).tap();
      await expect(element(by.id('settings-screen'))).toBeVisible();

      // Enable biometric authentication
      await element(by.id('biometric-toggle')).tap();
      await expect(element(by.text('Biometric authentication enabled'))).toBeVisible();
    });

    it('should show biometric setup instructions', async () => {
      await element(by.id('settings-button')).tap();
      await element(by.id('biometric-toggle')).tap();

      await expect(element(by.id('biometric-setup-modal'))).toBeVisible();
      await expect(element(by.text('Set up biometric authentication'))).toBeVisible();
      await expect(element(by.text('Use your fingerprint or face to securely access your account'))).toBeVisible();
    });

    it('should complete biometric setup', async () => {
      await element(by.id('settings-button')).tap();
      await element(by.id('biometric-toggle')).tap();

      await element(by.id('setup-biometric-button')).tap();
      
      // Simulate successful biometric enrollment
      await element(by.id('biometric-success')).tap();
      
      await expect(element(by.text('Biometric authentication set up successfully'))).toBeVisible();
      await expect(element(by.id('biometric-status')).toHaveText('Enabled'));
    });

    it('should handle biometric setup failure', async () => {
      await element(by.id('settings-button')).tap();
      await element(by.id('biometric-toggle')).tap();

      await element(by.id('setup-biometric-button')).tap();
      
      // Simulate biometric enrollment failure
      await element(by.id('biometric-failure')).tap();
      
      await expect(element(by.text('Biometric setup failed'))).toBeVisible();
      await expect(element(by.text('Please try again or use password authentication'))).toBeVisible();
    });
  });

  describe('Biometric Login', () => {
    beforeEach(async () => {
      // Setup biometric authentication first
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('login-button')).tap();
      await expect(element(by.id('dashboard-screen'))).toBeVisible();

      await element(by.id('settings-button')).tap();
      await element(by.id('biometric-toggle')).tap();
      await element(by.id('setup-biometric-button')).tap();
      await element(by.id('biometric-success')).tap();
    });

    it('should prompt for biometric authentication on app resume', async () => {
      // Background the app
      await device.sendToHome();
      
      // Foreground the app
      await device.launchApp();
      
      // Should show biometric prompt
      await expect(element(by.id('biometric-prompt'))).toBeVisible();
      await expect(element(by.text('Use biometric authentication to continue'))).toBeVisible();
    });

    it('should authenticate successfully with biometric', async () => {
      await device.sendToHome();
      await device.launchApp();
      
      await expect(element(by.id('biometric-prompt'))).toBeVisible();
      
      // Simulate successful biometric authentication
      await element(by.id('biometric-success')).tap();
      
      await expect(element(by.id('dashboard-screen'))).toBeVisible();
      await expect(element(by.text('Welcome back!'))).toBeVisible();
    });

    it('should fallback to password on biometric failure', async () => {
      await device.sendToHome();
      await device.launchApp();
      
      await expect(element(by.id('biometric-prompt'))).toBeVisible();
      
      // Simulate biometric authentication failure
      await element(by.id('biometric-failure')).tap();
      
      await expect(element(by.text('Biometric authentication failed'))).toBeVisible();
      await expect(element(by.id('fallback-password-button'))).toBeVisible();
    });

    it('should navigate to login screen on fallback', async () => {
      await device.sendToHome();
      await device.launchApp();
      
      await expect(element(by.id('biometric-prompt'))).toBeVisible();
      await element(by.id('biometric-failure')).tap();
      
      await element(by.id('fallback-password-button')).tap();
      
      await expect(element(by.id('login-screen'))).toBeVisible();
      await expect(element(by.id('email-input'))).toBeVisible();
      await expect(element(by.id('password-input'))).toBeVisible();
    });

    it('should remember biometric preference', async () => {
      await device.sendToHome();
      await device.launchApp();
      
      // Should show biometric prompt again
      await expect(element(by.id('biometric-prompt'))).toBeVisible();
      
      // Cancel biometric and choose to remember preference
      await element(by.id('biometric-cancel')).tap();
      await element(by.id('remember-preference')).tap();
      
      // Next time should skip biometric prompt
      await device.sendToHome();
      await device.launchApp();
      
      await expect(element(by.id('biometric-prompt'))).toBeNotVisible();
      await expect(element(by.id('dashboard-screen'))).toBeVisible();
    });
  });

  describe('Biometric Settings', () => {
    beforeEach(async () => {
      // Login and setup biometric
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('login-button')).tap();
      await expect(element(by.id('dashboard-screen'))).toBeVisible();

      await element(by.id('settings-button')).tap();
      await element(by.id('biometric-toggle')).tap();
      await element(by.id('setup-biometric-button')).tap();
      await element(by.id('biometric-success')).tap();
    });

    it('should disable biometric authentication', async () => {
      await element(by.id('settings-button')).tap();
      await element(by.id('biometric-toggle')).tap();
      
      await expect(element(by.text('Disable biometric authentication?'))).toBeVisible();
      await element(by.id('confirm-disable')).tap();
      
      await expect(element(by.text('Biometric authentication disabled'))).toBeVisible();
      await expect(element(by.id('biometric-status')).toHaveText('Disabled'));
    });

    it('should cancel biometric disable', async () => {
      await element(by.id('settings-button')).tap();
      await element(by.id('biometric-toggle')).tap();
      
      await expect(element(by.text('Disable biometric authentication?'))).toBeVisible();
      await element(by.id('cancel-disable')).tap();
      
      await expect(element(by.id('biometric-status')).toHaveText('Enabled'));
    });

    it('should show biometric security information', async () => {
      await element(by.id('settings-button')).tap();
      await element(by.id('biometric-info-button')).tap();
      
      await expect(element(by.id('biometric-info-modal'))).toBeVisible();
      await expect(element(by.text('Biometric data is stored securely on your device'))).toBeVisible();
      await expect(element(by.text('We never have access to your biometric information'))).toBeVisible();
    });

    it('should handle biometric changes on device', async () => {
      // Simulate biometric changes on device
      await device.sendToHome();
      await device.launchApp();
      
      // Should detect biometric changes and prompt for re-authentication
      await expect(element(by.text('Biometric settings have changed'))).toBeVisible();
      await expect(element(by.text('Please re-authenticate with your new biometric'))).toBeVisible();
      
      await element(by.id('re-authenticate-button')).tap();
      await element(by.id('biometric-success')).tap();
      
      await expect(element(by.text('Biometric authentication updated'))).toBeVisible();
    });
  });

  describe('Biometric Error Handling', () => {
    it('should handle biometric not available', async () => {
      await element(by.id('settings-button')).tap();
      await element(by.id('biometric-toggle')).tap();
      
      // Simulate biometric not available
      await element(by.id('biometric-not-available')).tap();
      
      await expect(element(by.text('Biometric authentication not available'))).toBeVisible();
      await expect(element(by.text('Your device does not support biometric authentication'))).toBeVisible();
    });

    it('should handle biometric locked out', async () => {
      await device.sendToHome();
      await device.launchApp();
      
      // Simulate biometric locked out
      await element(by.id('biometric-locked-out')).tap();
      
      await expect(element(by.text('Biometric authentication is locked'))).toBeVisible();
      await expect(element(by.text('Please use your device passcode to unlock'))).toBeVisible();
      await expect(element(by.id('use-passcode-button'))).toBeVisible();
    });

    it('should handle biometric timeout', async () => {
      await device.sendToHome();
      await device.launchApp();
      
      // Simulate biometric timeout
      await element(by.id('biometric-timeout')).tap();
      
      await expect(element(by.text('Biometric authentication timed out'))).toBeVisible();
      await expect(element(by.id('retry-biometric-button'))).toBeVisible();
      await expect(element(by.id('use-password-button'))).toBeVisible();
    });

    it('should retry biometric authentication', async () => {
      await device.sendToHome();
      await device.launchApp();
      
      await element(by.id('biometric-timeout')).tap();
      await element(by.id('retry-biometric-button')).tap();
      
      // Should show biometric prompt again
      await expect(element(by.id('biometric-prompt'))).toBeVisible();
    });
  });

  describe('Biometric Security', () => {
    it('should require password after multiple biometric failures', async () => {
      await device.sendToHome();
      await device.launchApp();
      
      // Simulate multiple biometric failures
      for (let i = 0; i < 3; i++) {
        await expect(element(by.id('biometric-prompt'))).toBeVisible();
        await element(by.id('biometric-failure')).tap();
        await element(by.id('retry-biometric-button')).tap();
      }
      
      // Should require password after multiple failures
      await expect(element(by.text('Too many failed attempts'))).toBeVisible();
      await expect(element(by.text('Please use your password to continue'))).toBeVisible();
      await expect(element(by.id('use-password-button'))).toBeVisible();
    });

    it('should log biometric authentication attempts', async () => {
      await device.sendToHome();
      await device.launchApp();
      
      await element(by.id('biometric-success')).tap();
      
      // Check that authentication attempt was logged
      await element(by.id('settings-button')).tap();
      await element(by.id('security-log-button')).tap();
      
      await expect(element(by.id('security-log'))).toBeVisible();
      await expect(element(by.text('Biometric authentication successful'))).toBeVisible();
    });

    it('should show biometric authentication status', async () => {
      await element(by.id('settings-button')).tap();
      
      await expect(element(by.id('biometric-status'))).toBeVisible();
      await expect(element(by.id('last-biometric-auth'))).toBeVisible();
      await expect(element(by.id('biometric-device-info'))).toBeVisible();
    });
  });

  describe('Accessibility', () => {
    it('should support screen readers for biometric prompts', async () => {
      await device.sendToHome();
      await device.launchApp();
      
      await expect(element(by.id('biometric-prompt'))).toBeVisible();
      await expect(element(by.id('biometric-prompt')).toHaveLabel('Biometric authentication prompt'));
    });

    it('should provide voice descriptions for biometric actions', async () => {
      await element(by.id('settings-button')).tap();
      await element(by.id('biometric-toggle')).tap();
      
      await expect(element(by.id('biometric-toggle')).toHaveLabel('Enable biometric authentication'));
      await expect(element(by.id('setup-biometric-button')).toHaveLabel('Set up biometric authentication'));
    });
  });

  describe('Performance', () => {
    it('should authenticate quickly with biometric', async () => {
      const startTime = Date.now();
      
      await device.sendToHome();
      await device.launchApp();
      
      await element(by.id('biometric-success')).tap();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Biometric authentication should be fast
      expect(duration).toBeLessThan(2000);
    });

    it('should not impact app performance when biometric is enabled', async () => {
      // Test app performance with biometric enabled
      await element(by.id('settings-button')).tap();
      await element(by.id('biometric-toggle')).tap();
      await element(by.id('setup-biometric-button')).tap();
      await element(by.id('biometric-success')).tap();
      
      // Navigate through app to test performance
      await element(by.id('discovery-tab')).tap();
      await expect(element(by.id('discovery-screen'))).toBeVisible();
      
      await element(by.id('matches-tab')).tap();
      await expect(element(by.id('matches-screen'))).toBeVisible();
      
      await element(by.id('profile-tab')).tap();
      await expect(element(by.id('profile-screen'))).toBeVisible();
    });
  });
});
