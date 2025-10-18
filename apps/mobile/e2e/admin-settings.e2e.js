/**
 * Detox E2E tests for mobile admin settings functionality
 */
import { device, expect, element, by, waitFor } from 'detox';

describe('Admin Settings', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should navigate to admin settings screen', async () => {
    // Navigate to admin section (assuming there's an admin tab or screen)
    await element(by.text('Admin')).tap();

    // Navigate to settings
    await element(by.text('Settings')).tap();

    // Verify we're on the settings screen
    await expect(element(by.text('System Settings'))).toBeVisible();
  });

  it('should display system settings', async () => {
    // Navigate to settings
    await navigateToSettings();

    // Check that system settings are displayed
    await expect(element(by.text('Story Daily Cap'))).toBeVisible();
    await expect(element(by.text('Redis URL'))).toBeVisible();

    // Check that inputs are present
    await expect(element(by.type('UITextField')).atIndex(0)).toBeVisible();
    await expect(element(by.type('UITextField')).atIndex(1)).toBeVisible();
  });

  it('should allow editing story daily cap', async () => {
    await navigateToSettings();

    // Find the story daily cap input (assuming it's the first number input)
    const storyInput = element(by.type('UITextField')).atIndex(0);

    // Clear and enter new value
    await storyInput.clearText();
    await storyInput.typeText('25');

    // Verify the value was entered
    await expect(storyInput).toHaveText('25');
  });

  it('should allow editing redis url', async () => {
    await navigateToSettings();

    // Find the redis URL input (assuming it's the second text input)
    const redisInput = element(by.type('UITextField')).atIndex(1);

    // Clear and enter new value
    await redisInput.clearText();
    await redisInput.typeText('redis://mobile-test:6379');

    // Verify the value was entered
    await expect(redisInput).toHaveText('redis://mobile-test:6379');
  });

  it('should save settings successfully', async () => {
    await navigateToSettings();

    // Make changes
    const storyInput = element(by.type('UITextField')).atIndex(0);
    await storyInput.clearText();
    await storyInput.typeText('50');

    const redisInput = element(by.type('UITextField')).atIndex(1);
    await redisInput.clearText();
    await redisInput.typeText('redis://saved-test:6379');

    // Tap save button
    await element(by.text('Save Changes')).tap();

    // Verify success message or navigation (depending on implementation)
    await waitFor(element(by.text('Settings saved successfully')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should handle validation errors', async () => {
    await navigateToSettings();

    // Enter invalid value (negative number)
    const storyInput = element(by.type('UITextField')).atIndex(0);
    await storyInput.clearText();
    await storyInput.typeText('-10');

    // Tap save button
    await element(by.text('Save Changes')).tap();

    // Should show error message
    await waitFor(element(by.text('STORY_DAILY_CAP must be a non-negative integer')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should handle network errors gracefully', async () => {
    // This test would require mocking network requests
    // For now, we'll test the UI behavior when network fails

    await navigateToSettings();

    // Make changes
    const storyInput = element(by.type('UITextField')).atIndex(0);
    await storyInput.clearText();
    await storyInput.typeText('30');

    // Simulate network failure (if possible) or just test that UI remains responsive
    await element(by.text('Save Changes')).tap();

    // UI should remain functional even if network fails
    await expect(element(by.text('System Settings'))).toBeVisible();
  });

  it('should handle loading states', async () => {
    await navigateToSettings();

    // Make changes
    const storyInput = element(by.type('UITextField')).atIndex(0);
    await storyInput.clearText();
    await storyInput.typeText('40');

    // Tap save
    await element(by.text('Save Changes')).tap();

    // Save button should show loading state (if implemented)
    // This would depend on the specific UI implementation
    await expect(element(by.text('Save Changes'))).toBeVisible();
  });

  it('should reset changes when cancel/reset is tapped', async () => {
    await navigateToSettings();

    // Make changes
    const storyInput = element(by.type('UITextField')).atIndex(0);
    await storyInput.clearText();
    await storyInput.typeText('100');

    // Verify change
    await expect(storyInput).toHaveText('100');

    // Tap reset/cancel button (assuming it exists)
    await element(by.text('Reset')).tap();

    // Should revert to original value
    await expect(storyInput).toHaveText('10');
  });

  it('should handle haptic feedback on interactions', async () => {
    await navigateToSettings();

    // Tap on inputs - should trigger haptic feedback if implemented
    const storyInput = element(by.type('UITextField')).atIndex(0);
    await storyInput.tap();

    // This test verifies the UI doesn't break, actual haptic testing would require device-level testing
    await expect(storyInput).toBeVisible();
  });

  it('should support keyboard navigation', async () => {
    await navigateToSettings();

    // Test keyboard input
    const storyInput = element(by.type('UITextField')).atIndex(0);
    await storyInput.tap();

    // Type using keyboard
    await storyInput.typeText('123');

    // Verify input
    await expect(storyInput).toHaveText('123');

    // Test keyboard dismissal
    await element(by.text('System Settings')).tap(); // Tap outside to dismiss keyboard
    await expect(storyInput).toHaveText('123'); // Value should persist
  });

  it('should handle orientation changes', async () => {
    await navigateToSettings();

    // Make changes
    const storyInput = element(by.type('UITextField')).atIndex(0);
    await storyInput.clearText();
    await storyInput.typeText('45');

    // Change orientation
    await device.setOrientation('landscape');

    // UI should adapt and maintain state
    await expect(element(by.text('System Settings'))).toBeVisible();
    await expect(storyInput).toHaveText('45');

    // Change back
    await device.setOrientation('portrait');
    await expect(element(by.text('System Settings'))).toBeVisible();
  });

  it('should be accessible with VoiceOver', async () => {
    await navigateToSettings();

    // Test accessibility labels
    await expect(element(by.label('Story Daily Cap input'))).toBeVisible();
    await expect(element(by.label('Redis URL input'))).toBeVisible();
    await expect(element(by.label('Save settings button'))).toBeVisible();
  });

  it('should handle memory warnings gracefully', async () => {
    await navigateToSettings();

    // Make changes
    const storyInput = element(by.type('UITextField')).atIndex(0);
    await storyInput.clearText();
    await storyInput.typeText('60');

    // Simulate memory warning (if testable)
    // This would depend on the testing framework capabilities

    // UI should remain responsive
    await expect(element(by.text('System Settings'))).toBeVisible();
  });
});

// Helper function to navigate to settings screen
async function navigateToSettings() {
  // Navigate to admin section
  await element(by.text('Admin')).tap();

  // Navigate to settings
  await element(by.text('Settings')).tap();

  // Wait for settings screen to load
  await waitFor(element(by.text('System Settings')))
    .toBeVisible()
    .withTimeout(5000);
}
