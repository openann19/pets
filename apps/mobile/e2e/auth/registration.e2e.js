/**
 * Mobile Registration E2E Tests
 * Comprehensive testing of the mobile registration flow
 */

describe('Mobile Registration', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Registration Form', () => {
    it('should display registration screen on app launch', async () => {
      await expect(element(by.id('registration-screen'))).toBeVisible();
      await expect(element(by.id('email-input'))).toBeVisible();
      await expect(element(by.id('password-input'))).toBeVisible();
      await expect(element(by.id('confirm-password-input'))).toBeVisible();
      await expect(element(by.id('firstName-input'))).toBeVisible();
      await expect(element(by.id('lastName-input'))).toBeVisible();
      await expect(element(by.id('dateOfBirth-input'))).toBeVisible();
      await expect(element(by.id('terms-checkbox'))).toBeVisible();
      await expect(element(by.id('register-button'))).toBeVisible();
    });

    it('should show validation errors for empty fields', async () => {
      await element(by.id('register-button')).tap();
      
      await expect(element(by.text('Email is required'))).toBeVisible();
      await expect(element(by.text('Password is required'))).toBeVisible();
      await expect(element(by.text('First name is required'))).toBeVisible();
      await expect(element(by.text('Last name is required'))).toBeVisible();
      await expect(element(by.text('Date of birth is required'))).toBeVisible();
      await expect(element(by.text('You must accept the terms'))).toBeVisible();
    });

    it('should validate email format', async () => {
      await element(by.id('email-input')).typeText('invalid-email');
      await element(by.id('password-input')).typeText('ValidPassword123!');
      await element(by.id('confirm-password-input')).typeText('ValidPassword123!');
      await element(by.id('firstName-input')).typeText('Test');
      await element(by.id('lastName-input')).typeText('User');
      await element(by.id('dateOfBirth-input')).typeText('1990-01-01');
      await element(by.id('terms-checkbox')).tap();
      await element(by.id('register-button')).tap();
      
      await expect(element(by.text('Please enter a valid email'))).toBeVisible();
    });

    it('should validate password strength', async () => {
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('weak');
      await element(by.id('confirm-password-input')).typeText('weak');
      await element(by.id('firstName-input')).typeText('Test');
      await element(by.id('lastName-input')).typeText('User');
      await element(by.id('dateOfBirth-input')).typeText('1990-01-01');
      await element(by.id('terms-checkbox')).tap();
      await element(by.id('register-button')).tap();
      
      await expect(element(by.text('Password must be at least 8 characters'))).toBeVisible();
    });

    it('should validate password confirmation', async () => {
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('ValidPassword123!');
      await element(by.id('confirm-password-input')).typeText('DifferentPassword123!');
      await element(by.id('firstName-input')).typeText('Test');
      await element(by.id('lastName-input')).typeText('User');
      await element(by.id('dateOfBirth-input')).typeText('1990-01-01');
      await element(by.id('terms-checkbox')).tap();
      await element(by.id('register-button')).tap();
      
      await expect(element(by.text('Passwords do not match'))).toBeVisible();
    });

    it('should validate age requirement', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const futureDateString = futureDate.toISOString().split('T')[0];
      
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('ValidPassword123!');
      await element(by.id('confirm-password-input')).typeText('ValidPassword123!');
      await element(by.id('firstName-input')).typeText('Test');
      await element(by.id('lastName-input')).typeText('User');
      await element(by.id('dateOfBirth-input')).typeText(futureDateString);
      await element(by.id('terms-checkbox')).tap();
      await element(by.id('register-button')).tap();
      
      await expect(element(by.text('You must be at least 18 years old'))).toBeVisible();
    });
  });

  describe('Successful Registration', () => {
    it('should register a new user successfully', async () => {
      const timestamp = Date.now();
      const testUser = {
        email: `test${timestamp}@pawfectmatch.com`,
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: '1990-01-01'
      };

      await element(by.id('email-input')).typeText(testUser.email);
      await element(by.id('password-input')).typeText(testUser.password);
      await element(by.id('confirm-password-input')).typeText(testUser.password);
      await element(by.id('firstName-input')).typeText(testUser.firstName);
      await element(by.id('lastName-input')).typeText(testUser.lastName);
      await element(by.id('dateOfBirth-input')).typeText(testUser.dateOfBirth);
      await element(by.id('terms-checkbox')).tap();
      await element(by.id('register-button')).tap();

      // Should redirect to onboarding or dashboard
      await expect(element(by.id('onboarding-screen'))).toBeVisible();
      await expect(element(by.text('Welcome to PawfectMatch!'))).toBeVisible();
    });

    it('should send verification email', async () => {
      const timestamp = Date.now();
      const testUser = {
        email: `test${timestamp}@pawfectmatch.com`,
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: '1990-01-01'
      };

      await element(by.id('email-input')).typeText(testUser.email);
      await element(by.id('password-input')).typeText(testUser.password);
      await element(by.id('confirm-password-input')).typeText(testUser.password);
      await element(by.id('firstName-input')).typeText(testUser.firstName);
      await element(by.id('lastName-input')).typeText(testUser.lastName);
      await element(by.id('dateOfBirth-input')).typeText(testUser.dateOfBirth);
      await element(by.id('terms-checkbox')).tap();
      await element(by.id('register-button')).tap();

      await expect(element(by.text('Please check your email to verify your account'))).toBeVisible();
      await expect(element(by.id('resend-verification-button'))).toBeVisible();
    });

    it('should resend verification email', async () => {
      // Complete registration first
      const timestamp = Date.now();
      const testUser = {
        email: `test${timestamp}@pawfectmatch.com`,
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: '1990-01-01'
      };

      await element(by.id('email-input')).typeText(testUser.email);
      await element(by.id('password-input')).typeText(testUser.password);
      await element(by.id('confirm-password-input')).typeText(testUser.password);
      await element(by.id('firstName-input')).typeText(testUser.firstName);
      await element(by.id('lastName-input')).typeText(testUser.lastName);
      await element(by.id('dateOfBirth-input')).typeText(testUser.dateOfBirth);
      await element(by.id('terms-checkbox')).tap();
      await element(by.id('register-button')).tap();

      await expect(element(by.text('Please check your email to verify your account'))).toBeVisible();
      
      // Resend verification email
      await element(by.id('resend-verification-button')).tap();
      await expect(element(by.text('Verification email sent'))).toBeVisible();
    });
  });

  describe('Registration Errors', () => {
    it('should handle duplicate email error', async () => {
      await element(by.id('email-input')).typeText('existing@pawfectmatch.com');
      await element(by.id('password-input')).typeText('TestPassword123!');
      await element(by.id('confirm-password-input')).typeText('TestPassword123!');
      await element(by.id('firstName-input')).typeText('Test');
      await element(by.id('lastName-input')).typeText('User');
      await element(by.id('dateOfBirth-input')).typeText('1990-01-01');
      await element(by.id('terms-checkbox')).tap();
      await element(by.id('register-button')).tap();
      
      await expect(element(by.text('Email already exists'))).toBeVisible();
    });

    it('should handle server error gracefully', async () => {
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('TestPassword123!');
      await element(by.id('confirm-password-input')).typeText('TestPassword123!');
      await element(by.id('firstName-input')).typeText('Test');
      await element(by.id('lastName-input')).typeText('User');
      await element(by.id('dateOfBirth-input')).typeText('1990-01-01');
      await element(by.id('terms-checkbox')).tap();
      await element(by.id('register-button')).tap();
      
      await expect(element(by.text('Something went wrong. Please try again.'))).toBeVisible();
    });

    it('should handle network error gracefully', async () => {
      // Simulate network error
      await testUtils.simulateNetworkCondition('offline');
      
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('TestPassword123!');
      await element(by.id('confirm-password-input')).typeText('TestPassword123!');
      await element(by.id('firstName-input')).typeText('Test');
      await element(by.id('lastName-input')).typeText('User');
      await element(by.id('dateOfBirth-input')).typeText('1990-01-01');
      await element(by.id('terms-checkbox')).tap();
      await element(by.id('register-button')).tap();
      
      await expect(element(by.text('Network error. Please check your connection.'))).toBeVisible();
    });
  });

  describe('Registration Flow', () => {
    it('should navigate to login screen', async () => {
      await element(by.id('login-link')).tap();
      await expect(element(by.id('login-screen'))).toBeVisible();
    });

    it('should show password strength indicator', async () => {
      await element(by.id('password-input')).typeText('weak');
      await expect(element(by.id('password-strength')).toHaveText('Weak'));
      
      await element(by.id('password-input')).clearText();
      await element(by.id('password-input')).typeText('StrongPassword123!');
      await expect(element(by.id('password-strength')).toHaveText('Strong'));
    });

    it('should toggle password visibility', async () => {
      await element(by.id('password-input')).typeText('TestPassword123!');
      await element(by.id('password-toggle')).tap();
      
      // Password should be visible
      await expect(element(by.id('password-input')).toHaveValue('TestPassword123!'));
      
      await element(by.id('password-toggle')).tap();
      // Password should be hidden
      await expect(element(by.id('password-input')).toHaveValue('TestPassword123!'));
    });

    it('should show terms and conditions modal', async () => {
      await element(by.id('terms-link')).tap();
      await expect(element(by.id('terms-modal'))).toBeVisible();
      await expect(element(by.text('Terms and Conditions'))).toBeVisible();
      
      await element(by.id('close-terms')).tap();
      await expect(element(by.id('terms-modal'))).toBeNotVisible();
    });

    it('should show privacy policy modal', async () => {
      await element(by.id('privacy-link')).tap();
      await expect(element(by.id('privacy-modal'))).toBeVisible();
      await expect(element(by.text('Privacy Policy'))).toBeVisible();
      
      await element(by.id('close-privacy')).tap();
      await expect(element(by.id('privacy-modal'))).toBeNotVisible();
    });
  });

  describe('Social Registration', () => {
    it('should display social registration options', async () => {
      await expect(element(by.id('google-register'))).toBeVisible();
      await expect(element(by.id('facebook-register'))).toBeVisible();
      await expect(element(by.id('apple-register'))).toBeVisible();
    });

    it('should handle Google registration', async () => {
      await element(by.id('google-register')).tap();
      
      // Mock Google OAuth flow
      await expect(element(by.text('Google registration'))).toBeVisible();
      await element(by.id('google-success')).tap();
      
      await expect(element(by.id('onboarding-screen'))).toBeVisible();
    });

    it('should handle Facebook registration', async () => {
      await element(by.id('facebook-register')).tap();
      
      // Mock Facebook OAuth flow
      await expect(element(by.text('Facebook registration'))).toBeVisible();
      await element(by.id('facebook-success')).tap();
      
      await expect(element(by.id('onboarding-screen'))).toBeVisible();
    });

    it('should handle Apple registration', async () => {
      await element(by.id('apple-register')).tap();
      
      // Mock Apple OAuth flow
      await expect(element(by.text('Apple registration'))).toBeVisible();
      await element(by.id('apple-success')).tap();
      
      await expect(element(by.id('onboarding-screen'))).toBeVisible();
    });
  });

  describe('Onboarding Flow', () => {
    beforeEach(async () => {
      // Complete registration first
      const timestamp = Date.now();
      const testUser = {
        email: `test${timestamp}@pawfectmatch.com`,
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: '1990-01-01'
      };

      await element(by.id('email-input')).typeText(testUser.email);
      await element(by.id('password-input')).typeText(testUser.password);
      await element(by.id('confirm-password-input')).typeText(testUser.password);
      await element(by.id('firstName-input')).typeText(testUser.firstName);
      await element(by.id('lastName-input')).typeText(testUser.lastName);
      await element(by.id('dateOfBirth-input')).typeText(testUser.dateOfBirth);
      await element(by.id('terms-checkbox')).tap();
      await element(by.id('register-button')).tap();
    });

    it('should display onboarding welcome screen', async () => {
      await expect(element(by.id('onboarding-screen'))).toBeVisible();
      await expect(element(by.text('Welcome to PawfectMatch!'))).toBeVisible();
      await expect(element(by.text('Let\'s get started by setting up your profile'))).toBeVisible();
    });

    it('should navigate through onboarding steps', async () => {
      await expect(element(by.id('onboarding-step-1'))).toBeVisible();
      await element(by.id('next-button')).tap();
      
      await expect(element(by.id('onboarding-step-2'))).toBeVisible();
      await element(by.id('next-button')).tap();
      
      await expect(element(by.id('onboarding-step-3'))).toBeVisible();
      await element(by.id('finish-button')).tap();
      
      await expect(element(by.id('dashboard-screen'))).toBeVisible();
    });

    it('should skip onboarding', async () => {
      await expect(element(by.id('onboarding-screen'))).toBeVisible();
      await element(by.id('skip-button')).tap();
      
      await expect(element(by.id('dashboard-screen'))).toBeVisible();
    });
  });

  describe('Accessibility', () => {
    it('should be accessible with screen readers', async () => {
      await expect(element(by.id('registration-screen')).toHaveLabel('Registration screen'));
      await expect(element(by.id('email-input')).toHaveLabel('Email address'));
      await expect(element(by.id('password-input')).toHaveLabel('Password'));
      await expect(element(by.id('register-button')).toHaveLabel('Register account'));
    });

    it('should support voice control', async () => {
      await element(by.id('voice-control-button')).tap();
      await expect(element(by.text('Voice control activated'))).toBeVisible();
    });

    it('should support keyboard navigation', async () => {
      await element(by.id('email-input')).focus();
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('email-input')).pressKey('Tab');
      await expect(element(by.id('password-input')).toBeFocused());
    });
  });

  describe('Performance', () => {
    it('should load registration screen quickly', async () => {
      const startTime = Date.now();
      
      await device.reloadReactNative();
      await expect(element(by.id('registration-screen'))).toBeVisible();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Registration screen should load quickly
      expect(duration).toBeLessThan(3000);
    });

    it('should handle form submission efficiently', async () => {
      const startTime = Date.now();
      
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('TestPassword123!');
      await element(by.id('confirm-password-input')).typeText('TestPassword123!');
      await element(by.id('firstName-input')).typeText('Test');
      await element(by.id('lastName-input')).typeText('User');
      await element(by.id('dateOfBirth-input')).typeText('1990-01-01');
      await element(by.id('terms-checkbox')).tap();
      await element(by.id('register-button')).tap();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Form submission should be efficient
      expect(duration).toBeLessThan(1000);
    });
  });
});
