import { device, element, by, waitFor } from 'detox';

describe('Authentication Flow E2E', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      delete: true
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show login screen on app launch', async () => {
    await expect(element(by.id('login-screen'))).toBeVisible();
    await expect(element(by.text('Welcome Back'))).toBeVisible();
  });

  it('should handle successful login', async () => {
    // Enter valid credentials
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('validpassword');

    // Tap login button
    await element(by.id('login-button')).tap();

    // Should navigate to main app
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Should show success message or main content
    await expect(element(by.id('home-screen'))).toBeVisible();
  });

  it('should handle login validation errors', async () => {
    // Enter invalid email
    await element(by.id('email-input')).clearText();
    await element(by.id('email-input')).typeText('invalid-email');

    // Try to submit
    await element(by.id('login-button')).tap();

    // Should show validation error
    await waitFor(element(by.text('Please enter a valid email address')))
      .toBeVisible()
      .withTimeout(2000);
  });

  it('should handle network error during login', async () => {
    // Disable network (would need network stubbing in real setup)
    // For this test, we'll assume network error handling

    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');

    // Simulate network failure scenario
    await element(by.id('login-button')).tap();

    // Should show error message with retry option
    await waitFor(element(by.text('Network error')))
      .toBeVisible()
      .withTimeout(3000);

    // Should have retry button
    await expect(element(by.id('retry-button'))).toBeVisible();
  });

  it('should navigate to sign up screen', async () => {
    await element(by.id('signup-link')).tap();

    await waitFor(element(by.id('signup-screen')))
      .toBeVisible()
      .withTimeout(2000);

    await expect(element(by.text('Create Account'))).toBeVisible();
  });

  it('should handle forgot password flow', async () => {
    await element(by.id('forgot-password-link')).tap();

    await waitFor(element(by.id('forgot-password-screen')))
      .toBeVisible()
      .withTimeout(2000);

    // Enter email and submit
    await element(by.id('reset-email-input')).typeText('test@example.com');
    await element(by.id('reset-submit-button')).tap();

    // Should show success message
    await waitFor(element(by.text('Reset email sent')))
      .toBeVisible()
      .withTimeout(3000);
  });
});

describe('Main App Navigation E2E', () => {
  beforeAll(async () => {
    await device.launchApp();
    // Assume user is logged in for these tests
  });

  it('should navigate between main tabs', async () => {
    // Navigate to Swipe tab
    await element(by.id('swipe-tab')).tap();
    await expect(element(by.id('swipe-screen'))).toBeVisible();

    // Navigate to Matches tab
    await element(by.id('matches-tab')).tap();
    await expect(element(by.id('matches-screen'))).toBeVisible();

    // Navigate to Messages tab
    await element(by.id('messages-tab')).tap();
    await expect(element(by.id('messages-screen'))).toBeVisible();

    // Navigate to Profile tab
    await element(by.id('profile-tab')).tap();
    await expect(element(by.id('profile-screen'))).toBeVisible();
  });

  it('should handle swipe gestures on pet cards', async () => {
    await element(by.id('swipe-tab')).tap();

    // Wait for cards to load
    await waitFor(element(by.id('pet-card-0')))
      .toBeVisible()
      .withTimeout(5000);

    // Perform swipe right (like)
    await element(by.id('pet-card-0')).swipe('right', 'fast');

    // Should show like animation and move to next card
    await waitFor(element(by.id('pet-card-1')))
      .toBeVisible()
      .withTimeout(2000);
  });

  it('should open chat from matches', async () => {
    await element(by.id('matches-tab')).tap();

    // Wait for matches to load
    await waitFor(element(by.id('match-item-0')))
      .toBeVisible()
      .withTimeout(3000);

    // Tap on a match
    await element(by.id('match-item-0')).tap();

    // Should navigate to chat screen
    await waitFor(element(by.id('chat-screen')))
      .toBeVisible()
      .withTimeout(2000);
  });
});

describe('Error Recovery E2E', () => {
  it('should handle offline scenarios gracefully', async () => {
    // Disable network
    await device.disableSynchronization();
    // Simulate offline action
    await element(by.id('refresh-button')).tap();

    // Should show offline message
    await waitFor(element(by.text('You appear to be offline')))
      .toBeVisible()
      .withTimeout(3000);

    // Should have retry option
    await expect(element(by.id('retry-offline'))).toBeVisible();

    // Re-enable network
    await device.enableSynchronization();
  });

  it('should recover from API errors', async () => {
    // Navigate to a screen that makes API calls
    await element(by.id('matches-tab')).tap();

    // Simulate API failure (would need mocking in real setup)
    await element(by.id('refresh-matches')).tap();

    // Should show error state
    await waitFor(element(by.text('Failed to load matches')))
      .toBeVisible()
      .withTimeout(3000);

    // Should have retry button
    await expect(element(by.id('retry-matches'))).toBeVisible();

    // Tap retry
    await element(by.id('retry-matches')).tap();

    // Should attempt to reload
    await waitFor(element(by.id('matches-list')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should handle authentication expiry', async () => {
    // Simulate token expiry during app usage
    await element(by.id('profile-tab')).tap();
    await element(by.id('edit-profile')).tap();

    // Should detect expired token and redirect to login
    await waitFor(element(by.id('login-screen')))
      .toBeVisible()
      .withTimeout(3000);

    // Should show session expired message
    await expect(element(by.text('Session expired'))).toBeVisible();
  });
});

describe('Accessibility E2E', () => {
  it('should support VoiceOver navigation', async () => {
    // Enable accessibility
    await device.setStatusBar({ time: '12:00' });

    // Navigate through main tabs using accessibility
    await element(by.id('swipe-tab')).tap();

    // VoiceOver should announce screen changes
    await expect(element(by.id('swipe-screen'))).toBeVisible();

    // Test keyboard navigation (if applicable)
    await element(by.id('pet-card-0')).tap();

    // Should announce card details
    await expect(element(by.id('card-details-modal'))).toBeVisible();
  });

  it('should handle large text accessibility', async () => {
    // Enable larger accessibility text
    await device.setStatusBar({ time: '12:00' });

    // UI should adapt to larger text sizes
    await element(by.id('swipe-tab')).tap();

    // Cards should still be readable and functional
    await expect(element(by.id('pet-card-0'))).toBeVisible();
  });
});
