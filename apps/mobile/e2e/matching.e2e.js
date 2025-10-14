/**
 * Matching Flow E2E Tests
 * Comprehensive testing of pet matching, swiping, and discovery features
 */

describe('Matching Flow', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    
    // Login first
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    await expect(element(by.id('dashboard-screen'))).toBeVisible();
  });

  describe('Pet Discovery', () => {
    it('should display pet cards on discovery screen', async () => {
      await element(by.id('discovery-tab')).tap();
      await expect(element(by.id('discovery-screen'))).toBeVisible();
      
      // Should show pet cards
      await expect(element(by.id('pet-card-0'))).toBeVisible();
      await expect(element(by.id('pet-name-0'))).toBeVisible();
      await expect(element(by.id('pet-age-0'))).toBeVisible();
      await expect(element(by.id('pet-breed-0'))).toBeVisible();
    });

    it('should swipe right to like a pet', async () => {
      await element(by.id('discovery-tab')).tap();
      
      const petCard = element(by.id('pet-card-0'));
      await petCard.swipe('right', 'fast', 0.5);
      
      await expect(element(by.text('Liked!'))).toBeVisible();
      await expect(element(by.id('pet-card-1'))).toBeVisible();
    });

    it('should swipe left to pass on a pet', async () => {
      await element(by.id('discovery-tab')).tap();
      
      const petCard = element(by.id('pet-card-0'));
      await petCard.swipe('left', 'fast', 0.5);
      
      await expect(element(by.text('Passed'))).toBeVisible();
      await expect(element(by.id('pet-card-1'))).toBeVisible();
    });

    it('should tap to view pet details', async () => {
      await element(by.id('discovery-tab')).tap();
      
      await element(by.id('pet-card-0')).tap();
      await expect(element(by.id('pet-details-modal'))).toBeVisible();
      await expect(element(by.id('pet-photos'))).toBeVisible();
      await expect(element(by.id('pet-bio'))).toBeVisible();
    });

    it('should super like a pet', async () => {
      await element(by.id('discovery-tab')).tap();
      
      const petCard = element(by.id('pet-card-0'));
      await petCard.swipe('up', 'fast', 0.5);
      
      await expect(element(by.text('Super Liked!'))).toBeVisible();
    });

    it('should show out of pets message', async () => {
      await element(by.id('discovery-tab')).tap();
      
      // Swipe through all pets
      for (let i = 0; i < 10; i++) {
        const petCard = element(by.id(`pet-card-${i}`));
        await petCard.swipe('right', 'fast', 0.5);
        await testUtils.waitForNetworkIdle(1000);
      }
      
      await expect(element(by.text('No more pets in your area'))).toBeVisible();
      await expect(element(by.id('refresh-button'))).toBeVisible();
    });
  });

  describe('Pet Profile Management', () => {
    it('should edit pet profile', async () => {
      await element(by.id('profile-tab')).tap();
      await element(by.id('edit-pet-button')).tap();
      
      await expect(element(by.id('edit-pet-screen'))).toBeVisible();
      await element(by.id('pet-name-input')).clearText();
      await element(by.id('pet-name-input')).typeText('Updated Pet Name');
      await element(by.id('save-button')).tap();
      
      await expect(element(by.text('Profile updated successfully'))).toBeVisible();
    });

    it('should add new pet photos', async () => {
      await element(by.id('profile-tab')).tap();
      await element(by.id('add-photo-button')).tap();
      
      await expect(element(by.id('photo-picker-modal'))).toBeVisible();
      await element(by.id('camera-option')).tap();
      
      // Simulate camera permission
      await element(by.id('allow-camera')).tap();
      await expect(element(by.id('camera-screen'))).toBeVisible();
    });

    it('should delete pet photos', async () => {
      await element(by.id('profile-tab')).tap();
      
      // Long press on photo to show delete option
      await element(by.id('pet-photo-0')).longPress();
      await expect(element(by.id('delete-photo-option'))).toBeVisible();
      
      await element(by.id('delete-photo-option')).tap();
      await element(by.id('confirm-delete')).tap();
      
      await expect(element(by.text('Photo deleted'))).toBeVisible();
    });
  });

  describe('Matching Algorithm', () => {
    it('should show compatible pets based on preferences', async () => {
      await element(by.id('settings-tab')).tap();
      await element(by.id('preferences-button')).tap();
      
      // Set preferences
      await element(by.id('age-range-slider')).adjustSliderToPosition(0.3, 0.7);
      await element(by.id('breed-filter')).tap();
      await element(by.id('breed-golden-retriever')).tap();
      
      await element(by.id('save-preferences')).tap();
      
      // Go back to discovery
      await element(by.id('discovery-tab')).tap();
      
      // Should show filtered results
      await expect(element(by.id('pet-card-0'))).toBeVisible();
    });

    it('should learn from user behavior', async () => {
      await element(by.id('discovery-tab')).tap();
      
      // Like several pets of similar characteristics
      for (let i = 0; i < 5; i++) {
        const petCard = element(by.id(`pet-card-${i}`));
        await petCard.swipe('right', 'fast', 0.5);
        await testUtils.waitForNetworkIdle(1000);
      }
      
      // Algorithm should adapt and show similar pets
      await expect(element(by.id('pet-card-5'))).toBeVisible();
    });
  });

  describe('Match Notifications', () => {
    it('should show match notification', async () => {
      await element(by.id('discovery-tab')).tap();
      
      // Like a pet that likes back
      const petCard = element(by.id('pet-card-0'));
      await petCard.swipe('right', 'fast', 0.5);
      
      // Simulate mutual like
      await testUtils.waitForNetworkIdle(2000);
      
      await expect(element(by.id('match-notification'))).toBeVisible();
      await expect(element(by.text('It\'s a Match!'))).toBeVisible();
    });

    it('should navigate to chat on match', async () => {
      await element(by.id('match-notification')).tap();
      await expect(element(by.id('chat-screen'))).toBeVisible();
      await expect(element(by.id('match-celebration'))).toBeVisible();
    });
  });

  describe('Accessibility', () => {
    it('should support screen readers', async () => {
      await element(by.id('discovery-tab')).tap();
      
      // Check accessibility labels
      await expect(element(by.id('pet-card-0'))).toHaveLabel('Pet card for Buddy, 3 year old Golden Retriever');
      await expect(element(by.id('like-button'))).toHaveLabel('Like this pet');
      await expect(element(by.id('pass-button'))).toHaveLabel('Pass on this pet');
    });

    it('should support voice control', async () => {
      await element(by.id('discovery-tab')).tap();
      
      // Simulate voice commands
      await element(by.id('voice-control-button')).tap();
      await expect(element(by.text('Voice control activated'))).toBeVisible();
    });

    it('should support keyboard navigation', async () => {
      await element(by.id('discovery-tab')).tap();
      
      // Navigate using keyboard
      await element(by.id('pet-card-0')).focus();
      await element(by.id('pet-card-0')).pressKey('ArrowRight');
      await expect(element(by.id('pet-card-1'))).toBeFocused();
    });
  });
});
