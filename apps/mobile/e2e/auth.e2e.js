/**
 * Authentication E2E Tests
 * Comprehensive testing of login, signup, and authentication flows
 */

describe('Authentication Flow', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Login Flow', () => {
    it('should display login screen on app launch', async () => {
      await expect(element(by.id('login-screen'))).toBeVisible();
      await expect(element(by.id('email-input'))).toBeVisible();
      await expect(element(by.id('password-input'))).toBeVisible();
      await expect(element(by.id('login-button'))).toBeVisible();
    });

    it('should show validation errors for empty fields', async () => {
      await element(by.id('login-button')).tap();
      
      await expect(element(by.text('Email is required'))).toBeVisible();
      await expect(element(by.text('Password is required'))).toBeVisible();
    });

    it('should show validation error for invalid email', async () => {
      await element(by.id('email-input')).typeText('invalid-email');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('login-button')).tap();
      
      await expect(element(by.text('Please enter a valid email'))).toBeVisible();
    });

    it('should successfully login with valid credentials', async () => {
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('login-button')).tap();
      
      // Wait for navigation to dashboard
      await expect(element(by.id('dashboard-screen'))).toBeVisible();
      await expect(element(by.id('welcome-message'))).toBeVisible();
    });

    it('should show error for invalid credentials', async () => {
      await element(by.id('email-input')).typeText('wrong@example.com');
      await element(by.id('password-input')).typeText('wrongpassword');
      await element(by.id('login-button')).tap();
      
      await expect(element(by.text('Invalid email or password'))).toBeVisible();
    });

    it('should navigate to signup screen', async () => {
      await element(by.id('signup-link')).tap();
      await expect(element(by.id('signup-screen'))).toBeVisible();
    });

    it('should toggle password visibility', async () => {
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('password-toggle')).tap();
      
      // Password should be visible
      await expect(element(by.id('password-input'))).toHaveValue('password123');
    });
  });

  describe('Signup Flow', () => {
    beforeEach(async () => {
      await element(by.id('signup-link')).tap();
    });

    it('should display signup form', async () => {
      await expect(element(by.id('signup-screen'))).toBeVisible();
      await expect(element(by.id('name-input'))).toBeVisible();
      await expect(element(by.id('email-input'))).toBeVisible();
      await expect(element(by.id('password-input'))).toBeVisible();
      await expect(element(by.id('confirm-password-input'))).toBeVisible();
      await expect(element(by.id('signup-button'))).toBeVisible();
    });

    it('should validate password confirmation', async () => {
      await element(by.id('name-input')).typeText('Test User');
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('confirm-password-input')).typeText('different123');
      await element(by.id('signup-button')).tap();
      
      await expect(element(by.text('Passwords do not match'))).toBeVisible();
    });

    it('should successfully create account', async () => {
      await element(by.id('name-input')).typeText('Test User');
      await element(by.id('email-input')).typeText('newuser@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('confirm-password-input')).typeText('password123');
      await element(by.id('signup-button')).tap();
      
      // Wait for navigation to onboarding
      await expect(element(by.id('onboarding-screen'))).toBeVisible();
    });

    it('should show error for existing email', async () => {
      await element(by.id('name-input')).typeText('Test User');
      await element(by.id('email-input')).typeText('existing@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('confirm-password-input')).typeText('password123');
      await element(by.id('signup-button')).tap();
      
      await expect(element(by.text('Email already exists'))).toBeVisible();
    });
  });

  describe('Biometric Authentication', () => {
    beforeEach(async () => {
      // Login first
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('login-button')).tap();
      await expect(element(by.id('dashboard-screen'))).toBeVisible();
    });

    it('should enable biometric authentication', async () => {
      await element(by.id('settings-button')).tap();
      await expect(element(by.id('settings-screen'))).toBeVisible();
      
      await element(by.id('biometric-toggle')).tap();
      await expect(element(by.text('Biometric authentication enabled'))).toBeVisible();
    });

    it('should authenticate with biometric on app resume', async () => {
      // Enable biometric first
      await element(by.id('settings-button')).tap();
      await element(by.id('biometric-toggle')).tap();
      
      // Background and foreground app
      await device.sendToHome();
      await device.launchApp();
      
      // Should show biometric prompt
      await expect(element(by.id('biometric-prompt'))).toBeVisible();
      
      // Simulate successful biometric authentication
      await element(by.id('biometric-success')).tap();
      await expect(element(by.id('dashboard-screen'))).toBeVisible();
    });

    it('should fallback to password on biometric failure', async () => {
      await device.sendToHome();
      await device.launchApp();
      
      await expect(element(by.id('biometric-prompt'))).toBeVisible();
      await element(by.id('biometric-fallback')).tap();
      
      await expect(element(by.id('login-screen'))).toBeVisible();
    });
  });

  describe('Logout Flow', () => {
    beforeEach(async () => {
      // Login first
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('login-button')).tap();
      await expect(element(by.id('dashboard-screen'))).toBeVisible();
    });

    it('should logout successfully', async () => {
      await element(by.id('profile-button')).tap();
      await element(by.id('logout-button')).tap();
      
      // Confirm logout
      await element(by.id('confirm-logout')).tap();
      
      await expect(element(by.id('login-screen'))).toBeVisible();
    });

    it('should cancel logout', async () => {
      await element(by.id('profile-button')).tap();
      await element(by.id('logout-button')).tap();
      
      // Cancel logout
      await element(by.id('cancel-logout')).tap();
      
      await expect(element(by.id('dashboard-screen'))).toBeVisible();
    });
  });
});
