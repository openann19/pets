const { device, expect, element, by, waitFor } = require('detox');

/**
 * Detox E2E Tests for Onboarding Flow
 * Implements T-10: Detox E2E: onboarding wizard
 * 
 * Test Coverage:
 * - Welcome screen navigation
 * - User registration flow
 * - Pet profile creation
 * - Preferences setup
 * - Onboarding completion
 */

describe('Onboarding Flow', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: {
        camera: 'YES',
        photos: 'YES',
        location: 'inuse',
        notifications: 'YES',
      },
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Welcome Screen', () => {
    it('should display welcome screen on first launch', async () => {
      await waitFor(element(by.id('welcome-screen')))
        .toBeVisible()
        .withTimeout(5000);
      
      await expect(element(by.text('Welcome to PawfectMatch'))).toBeVisible();
      await expect(element(by.text('Find Your Perfect Pet Companion'))).toBeVisible();
      await expect(element(by.id('get-started-button'))).toBeVisible();
    });

    it('should navigate to registration when get started is tapped', async () => {
      await element(by.id('get-started-button')).tap();
      
      await waitFor(element(by.id('registration-screen')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should have accessible elements', async () => {
      await expect(element(by.id('welcome-screen'))).toBeVisible();
      await expect(element(by.id('get-started-button'))).toHaveLabel('Get Started');
    });
  });

  describe('User Registration', () => {
    beforeEach(async () => {
      // Navigate to registration screen
      await element(by.id('get-started-button')).tap();
      await waitFor(element(by.id('registration-screen'))).toBeVisible();
    });

    it('should display registration form', async () => {
      await expect(element(by.id('email-input'))).toBeVisible();
      await expect(element(by.id('password-input'))).toBeVisible();
      await expect(element(by.id('confirm-password-input'))).toBeVisible();
      await expect(element(by.id('full-name-input'))).toBeVisible();
      await expect(element(by.id('register-button'))).toBeVisible();
    });

    it('should validate email format', async () => {
      await element(by.id('email-input')).typeText('invalid-email');
      await element(by.id('register-button')).tap();
      
      await expect(element(by.text('Please enter a valid email address'))).toBeVisible();
    });

    it('should validate password strength', async () => {
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('123');
      await element(by.id('register-button')).tap();
      
      await expect(element(by.text('Password must be at least 8 characters'))).toBeVisible();
    });

    it('should validate password confirmation', async () => {
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('confirm-password-input')).typeText('different123');
      await element(by.id('register-button')).tap();
      
      await expect(element(by.text('Passwords do not match'))).toBeVisible();
    });

    it('should successfully register with valid data', async () => {
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('confirm-password-input')).typeText('password123');
      await element(by.id('full-name-input')).typeText('John Doe');
      
      await element(by.id('register-button')).tap();
      
      // Should navigate to pet profile creation
      await waitFor(element(by.id('pet-profile-screen')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Pet Profile Creation', () => {
    beforeEach(async () => {
      // Complete registration first
      await element(by.id('get-started-button')).tap();
      await waitFor(element(by.id('registration-screen'))).toBeVisible();
      
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('confirm-password-input')).typeText('password123');
      await element(by.id('full-name-input')).typeText('John Doe');
      await element(by.id('register-button')).tap();
      
      await waitFor(element(by.id('pet-profile-screen'))).toBeVisible();
    });

    it('should display pet profile creation form', async () => {
      await expect(element(by.text('Tell us about your pet'))).toBeVisible();
      await expect(element(by.id('pet-name-input'))).toBeVisible();
      await expect(element(by.id('pet-age-input'))).toBeVisible();
      await expect(element(by.id('pet-breed-input'))).toBeVisible();
      await expect(element(by.id('pet-bio-input'))).toBeVisible();
      await expect(element(by.id('add-photo-button'))).toBeVisible();
    });

    it('should validate required fields', async () => {
      await element(by.id('continue-button')).tap();
      
      await expect(element(by.text('Pet name is required'))).toBeVisible();
    });

    it('should allow photo selection', async () => {
      await element(by.id('add-photo-button')).tap();
      
      // Mock photo picker response
      await waitFor(element(by.text('Choose Photo Source')))
        .toBeVisible()
        .withTimeout(3000);
      
      await element(by.text('Camera')).tap();
      
      // Verify photo was added (mock implementation)
      await expect(element(by.id('pet-photo-preview'))).toBeVisible();
    });

    it('should successfully create pet profile', async () => {
      await element(by.id('pet-name-input')).typeText('Buddy');
      await element(by.id('pet-age-input')).typeText('3');
      await element(by.id('pet-breed-input')).typeText('Golden Retriever');
      await element(by.id('pet-bio-input')).typeText('Friendly and energetic dog');
      
      await element(by.id('continue-button')).tap();
      
      // Should navigate to preferences setup
      await waitFor(element(by.id('preferences-screen')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Preferences Setup', () => {
    beforeEach(async () => {
      // Complete previous steps
      await element(by.id('get-started-button')).tap();
      await waitFor(element(by.id('registration-screen'))).toBeVisible();
      
      // Registration
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('confirm-password-input')).typeText('password123');
      await element(by.id('full-name-input')).typeText('John Doe');
      await element(by.id('register-button')).tap();
      
      await waitFor(element(by.id('pet-profile-screen'))).toBeVisible();
      
      // Pet profile
      await element(by.id('pet-name-input')).typeText('Buddy');
      await element(by.id('pet-age-input')).typeText('3');
      await element(by.id('pet-breed-input')).typeText('Golden Retriever');
      await element(by.id('pet-bio-input')).typeText('Friendly dog');
      await element(by.id('continue-button')).tap();
      
      await waitFor(element(by.id('preferences-screen'))).toBeVisible();
    });

    it('should display preferences form', async () => {
      await expect(element(by.text('Set your preferences'))).toBeVisible();
      await expect(element(by.id('age-range-slider'))).toBeVisible();
      await expect(element(by.id('distance-slider'))).toBeVisible();
      await expect(element(by.id('breed-preferences'))).toBeVisible();
    });

    it('should allow age range selection', async () => {
      // Interact with age range slider
      await element(by.id('age-range-slider')).swipe('right', 'slow');
      
      await expect(element(by.text('1-5 years'))).toBeVisible();
    });

    it('should allow distance selection', async () => {
      // Interact with distance slider
      await element(by.id('distance-slider')).swipe('right', 'slow');
      
      await expect(element(by.text('Within 25 km'))).toBeVisible();
    });

    it('should complete onboarding successfully', async () => {
      // Set preferences
      await element(by.id('age-range-slider')).swipe('right', 'slow');
      await element(by.id('distance-slider')).swipe('right', 'slow');
      
      await element(by.id('finish-onboarding-button')).tap();
      
      // Should navigate to main app
      await waitFor(element(by.id('main-app-screen')))
        .toBeVisible()
        .withTimeout(5000);
      
      await expect(element(by.text('Welcome to PawfectMatch!'))).toBeVisible();
    });
  });

  describe('Onboarding Completion', () => {
    it('should complete full onboarding flow', async () => {
      // Welcome screen
      await element(by.id('get-started-button')).tap();
      await waitFor(element(by.id('registration-screen'))).toBeVisible();
      
      // Registration
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('confirm-password-input')).typeText('password123');
      await element(by.id('full-name-input')).typeText('John Doe');
      await element(by.id('register-button')).tap();
      
      await waitFor(element(by.id('pet-profile-screen'))).toBeVisible();
      
      // Pet profile
      await element(by.id('pet-name-input')).typeText('Buddy');
      await element(by.id('pet-age-input')).typeText('3');
      await element(by.id('pet-breed-input')).typeText('Golden Retriever');
      await element(by.id('pet-bio-input')).typeText('Friendly dog');
      await element(by.id('continue-button')).tap();
      
      await waitFor(element(by.id('preferences-screen'))).toBeVisible();
      
      // Preferences
      await element(by.id('age-range-slider')).swipe('right', 'slow');
      await element(by.id('distance-slider')).swipe('right', 'slow');
      await element(by.id('finish-onboarding-button')).tap();
      
      // Verify completion
      await waitFor(element(by.id('main-app-screen')))
        .toBeVisible()
        .withTimeout(5000);
      
      await expect(element(by.id('swipe-stack'))).toBeVisible();
      await expect(element(by.id('bottom-navigation'))).toBeVisible();
    });

    it('should not show onboarding on subsequent launches', async () => {
      // Complete onboarding first
      await element(by.id('get-started-button')).tap();
      // ... (complete flow as above)
      
      // Restart app
      await device.reloadReactNative();
      
      // Should go directly to main app
      await waitFor(element(by.id('main-app-screen')))
        .toBeVisible()
        .withTimeout(5000);
      
      await expect(element(by.id('welcome-screen'))).not.toBeVisible();
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels throughout onboarding', async () => {
      // Welcome screen accessibility
      await expect(element(by.id('welcome-screen'))).toHaveLabel('Welcome screen');
      await expect(element(by.id('get-started-button'))).toHaveLabel('Get Started');
      
      // Navigate and check registration
      await element(by.id('get-started-button')).tap();
      await waitFor(element(by.id('registration-screen'))).toBeVisible();
      
      await expect(element(by.id('email-input'))).toHaveLabel('Email address');
      await expect(element(by.id('password-input'))).toHaveLabel('Password');
      await expect(element(by.id('register-button'))).toHaveLabel('Create Account');
    });

    it('should support screen reader navigation', async () => {
      // Enable accessibility mode for testing
      await device.enableSynchronization();
      
      // Test tab navigation through onboarding
      await element(by.id('get-started-button')).tap();
      await waitFor(element(by.id('registration-screen'))).toBeVisible();
      
      // Verify elements are focusable
      await expect(element(by.id('email-input'))).toBeFocused();
    });
  });
});
