/**
 * Mobile Swipe Gestures E2E Tests
 * Comprehensive testing of swipe gestures and pet matching
 */

describe('Mobile Swipe Gestures', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    
    // Login first
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    await expect(element(by.id('dashboard-screen'))).toBeVisible();
  });

  describe('Swipe Interface', () => {
    it('should display swipe stack with pet cards', async () => {
      await element(by.id('discovery-tab')).tap();
      await expect(element(by.id('discovery-screen'))).toBeVisible();
      
      await expect(element(by.id('swipe-stack'))).toBeVisible();
      await expect(element(by.id('pet-card-0'))).toBeVisible();
      await expect(element(by.id('pet-card-1'))).toBeVisible();
    });

    it('should show pet information on cards', async () => {
      await element(by.id('discovery-tab')).tap();
      
      await expect(element(by.id('pet-name-0'))).toBeVisible();
      await expect(element(by.id('pet-age-0'))).toBeVisible();
      await expect(element(by.id('pet-breed-0'))).toBeVisible();
      await expect(element(by.id('pet-photo-0'))).toBeVisible();
    });

    it('should display action buttons', async () => {
      await element(by.id('discovery-tab')).tap();
      
      await expect(element(by.id('pass-button'))).toBeVisible();
      await expect(element(by.id('like-button'))).toBeVisible();
      await expect(element(by.id('superlike-button'))).toBeVisible();
    });

    it('should show pet count indicator', async () => {
      await element(by.id('discovery-tab')).tap();
      
      await expect(element(by.id('pet-count'))).toBeVisible();
      await expect(element(by.id('pet-count')).toHaveText('pets'));
    });
  });

  describe('Swipe Gestures', () => {
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

    it('should swipe up to super like a pet', async () => {
      await element(by.id('discovery-tab')).tap();
      
      const petCard = element(by.id('pet-card-0'));
      await petCard.swipe('up', 'fast', 0.5);
      
      await expect(element(by.text('Super Liked!'))).toBeVisible();
    });

    it('should handle partial swipe gestures', async () => {
      await element(by.id('discovery-tab')).tap();
      
      const petCard = element(by.id('pet-card-0'));
      
      // Partial right swipe
      await petCard.swipe('right', 'slow', 0.3);
      await expect(element(by.id('like-indicator'))).toBeVisible();
      
      // Release without completing swipe
      await petCard.tap();
      await expect(element(by.id('pet-card-0'))).toBeVisible();
    });

    it('should show swipe feedback during gesture', async () => {
      await element(by.id('discovery-tab')).tap();
      
      const petCard = element(by.id('pet-card-0'));
      
      // Start right swipe
      await petCard.swipe('right', 'slow', 0.2);
      await expect(element(by.id('like-indicator'))).toBeVisible();
      
      // Continue swipe
      await petCard.swipe('right', 'slow', 0.4);
      await expect(element(by.id('like-indicator')).toHaveText('Like'));
      
      // Complete swipe
      await petCard.swipe('right', 'fast', 0.8);
      await expect(element(by.text('Liked!'))).toBeVisible();
    });
  });

  describe('Button Actions', () => {
    it('should like pet using button', async () => {
      await element(by.id('discovery-tab')).tap();
      
      await element(by.id('like-button')).tap();
      
      await expect(element(by.text('Liked!'))).toBeVisible();
      await expect(element(by.id('pet-card-1'))).toBeVisible();
    });

    it('should pass pet using button', async () => {
      await element(by.id('discovery-tab')).tap();
      
      await element(by.id('pass-button')).tap();
      
      await expect(element(by.text('Passed'))).toBeVisible();
      await expect(element(by.id('pet-card-1'))).toBeVisible();
    });

    it('should super like pet using button', async () => {
      await element(by.id('discovery-tab')).tap();
      
      await element(by.id('superlike-button')).tap();
      
      await expect(element(by.text('Super Liked!'))).toBeVisible();
    });

    it('should disable buttons during swipe animation', async () => {
      await element(by.id('discovery-tab')).tap();
      
      const petCard = element(by.id('pet-card-0'));
      await petCard.swipe('right', 'slow', 0.5);
      
      // Buttons should be disabled during animation
      await expect(element(by.id('like-button')).toBeDisabled());
      await expect(element(by.id('pass-button')).toBeDisabled());
      await expect(element(by.id('superlike-button')).toBeDisabled());
    });
  });

  describe('Match Detection', () => {
    it('should show match modal on mutual like', async () => {
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
      await element(by.id('discovery-tab')).tap();
      
      const petCard = element(by.id('pet-card-0'));
      await petCard.swipe('right', 'fast', 0.5);
      
      await testUtils.waitForNetworkIdle(2000);
      await expect(element(by.id('match-notification'))).toBeVisible();
      
      await element(by.id('match-notification')).tap();
      await expect(element(by.id('chat-screen'))).toBeVisible();
      await expect(element(by.id('match-celebration'))).toBeVisible();
    });

    it('should continue swiping after match', async () => {
      await element(by.id('discovery-tab')).tap();
      
      const petCard = element(by.id('pet-card-0'));
      await petCard.swipe('right', 'fast', 0.5);
      
      await testUtils.waitForNetworkIdle(2000);
      await expect(element(by.id('match-notification'))).toBeVisible();
      
      await element(by.id('keep-swiping-button')).tap();
      await expect(element(by.id('match-notification'))).toBeNotVisible();
      await expect(element(by.id('pet-card-1'))).toBeVisible();
    });
  });

  describe('Pet Details', () => {
    it('should show pet details on card tap', async () => {
      await element(by.id('discovery-tab')).tap();
      
      await element(by.id('pet-card-0')).tap();
      await expect(element(by.id('pet-details-modal'))).toBeVisible();
      await expect(element(by.id('pet-photos'))).toBeVisible();
      await expect(element(by.id('pet-bio'))).toBeVisible();
    });

    it('should navigate through pet photos', async () => {
      await element(by.id('discovery-tab')).tap();
      await element(by.id('pet-card-0')).tap();
      
      await expect(element(by.id('pet-details-modal'))).toBeVisible();
      
      // Check if multiple photos exist
      await expect(element(by.id('pet-photo-0'))).toBeVisible();
      
      // Swipe to next photo
      await element(by.id('pet-photo-0')).swipe('left', 'fast', 0.5);
      await expect(element(by.id('pet-photo-1'))).toBeVisible();
    });

    it('should close pet details modal', async () => {
      await element(by.id('discovery-tab')).tap();
      await element(by.id('pet-card-0')).tap();
      
      await expect(element(by.id('pet-details-modal'))).toBeVisible();
      
      await element(by.id('close-details-button')).tap();
      await expect(element(by.id('pet-details-modal'))).toBeNotVisible();
    });

    it('should swipe from pet details modal', async () => {
      await element(by.id('discovery-tab')).tap();
      await element(by.id('pet-card-0')).tap();
      
      await expect(element(by.id('pet-details-modal'))).toBeVisible();
      
      await element(by.id('like-button')).tap();
      
      await expect(element(by.id('pet-details-modal'))).toBeNotVisible();
      await expect(element(by.text('Liked!'))).toBeVisible();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no pets available', async () => {
      // Simulate no pets available
      await testUtils.mockApiResponse('/pets/discovery', { pets: [] });
      
      await element(by.id('discovery-tab')).tap();
      
      await expect(element(by.id('empty-state'))).toBeVisible();
      await expect(element(by.text('No pets to discover'))).toBeVisible();
      await expect(element(by.id('refresh-button'))).toBeVisible();
    });

    it('should refresh pets when clicking refresh button', async () => {
      // Simulate no pets available
      await testUtils.mockApiResponse('/pets/discovery', { pets: [] });
      
      await element(by.id('discovery-tab')).tap();
      await expect(element(by.id('empty-state'))).toBeVisible();
      
      // Mock refreshed pets
      await testUtils.mockApiResponse('/pets/discovery', { 
        pets: [{ id: 'pet-1', name: 'Buddy' }] 
      });
      
      await element(by.id('refresh-button')).tap();
      
      await expect(element(by.id('pet-card-0'))).toBeVisible();
    });
  });

  describe('Loading States', () => {
    it('should show skeleton loader while loading pets', async () => {
      // Simulate slow loading
      await testUtils.mockApiResponse('/pets/discovery', { pets: [] }, 3000);
      
      await element(by.id('discovery-tab')).tap();
      await expect(element(by.id('skeleton-loader'))).toBeVisible();
      
      await testUtils.waitForNetworkIdle(3000);
      await expect(element(by.id('skeleton-loader'))).toBeNotVisible();
    });

    it('should show loading state during swipe action', async () => {
      await element(by.id('discovery-tab')).tap();
      
      // Simulate slow swipe response
      await testUtils.mockApiResponse('/pets/swipe', { success: true }, 2000);
      
      await element(by.id('like-button')).tap();
      await expect(element(by.id('swipe-loading'))).toBeVisible();
      
      await testUtils.waitForNetworkIdle(2000);
      await expect(element(by.id('swipe-loading'))).toBeNotVisible();
    });
  });

  describe('Error Handling', () => {
    it('should handle swipe API error gracefully', async () => {
      await element(by.id('discovery-tab')).tap();
      
      // Simulate API error
      await testUtils.mockApiResponse('/pets/swipe', { error: 'Internal server error' }, 0, 500);
      
      await element(by.id('like-button')).tap();
      
      await expect(element(by.id('error-message'))).toBeVisible();
      await expect(element(by.text('Something went wrong'))).toBeVisible();
    });

    it('should retry failed swipe action', async () => {
      await element(by.id('discovery-tab')).tap();
      
      // Simulate API error
      await testUtils.mockApiResponse('/pets/swipe', { error: 'Internal server error' }, 0, 500);
      
      await element(by.id('like-button')).tap();
      await expect(element(by.id('error-message'))).toBeVisible();
      
      // Mock successful retry
      await testUtils.mockApiResponse('/pets/swipe', { success: true });
      
      await element(by.id('retry-button')).tap();
      await expect(element(by.text('Liked!'))).toBeVisible();
    });

    it('should handle network error during swipe', async () => {
      await element(by.id('discovery-tab')).tap();
      
      // Simulate network error
      await testUtils.simulateNetworkCondition('offline');
      
      await element(by.id('like-button')).tap();
      
      await expect(element(by.id('error-message'))).toBeVisible();
      await expect(element(by.text('Network error'))).toBeVisible();
    });
  });

  describe('Rate Limiting', () => {
    it('should handle rate limiting gracefully', async () => {
      await element(by.id('discovery-tab')).tap();
      
      // Rapidly tap like button
      for (let i = 0; i < 10; i++) {
        await element(by.id('like-button')).tap();
        await testUtils.waitForNetworkIdle(100);
      }
      
      await expect(element(by.id('rate-limit-message'))).toBeVisible();
      await expect(element(by.text('slow down')).toBeVisible());
    });

    it('should disable buttons during rate limit', async () => {
      await element(by.id('discovery-tab')).tap();
      
      // Trigger rate limit
      for (let i = 0; i < 15; i++) {
        await element(by.id('like-button')).tap();
        await testUtils.waitForNetworkIdle(50);
      }
      
      await expect(element(by.id('like-button')).toBeDisabled());
      await expect(element(by.id('pass-button')).toBeDisabled());
      await expect(element(by.id('superlike-button')).toBeDisabled());
    });
  });

  describe('Accessibility', () => {
    it('should be accessible with screen readers', async () => {
      await element(by.id('discovery-tab')).tap();
      
      await expect(element(by.id('pet-card-0')).toHaveLabel('Pet card for Buddy, 3 year old Golden Retriever'));
      await expect(element(by.id('like-button')).toHaveLabel('Like this pet'));
      await expect(element(by.id('pass-button')).toHaveLabel('Pass on this pet'));
    });

    it('should support voice control', async () => {
      await element(by.id('discovery-tab')).tap();
      
      await element(by.id('voice-control-button')).tap();
      await expect(element(by.text('Voice control activated'))).toBeVisible();
    });

    it('should support keyboard navigation', async () => {
      await element(by.id('discovery-tab')).tap();
      
      await element(by.id('pet-card-0')).focus();
      await element(by.id('pet-card-0')).pressKey('ArrowRight');
      await expect(element(by.id('like-button')).toBeFocused());
    });
  });

  describe('Performance', () => {
    it('should handle rapid swiping efficiently', async () => {
      await element(by.id('discovery-tab')).tap();
      
      const startTime = Date.now();
      
      // Perform rapid swipes
      for (let i = 0; i < 5; i++) {
        const petCard = element(by.id(`pet-card-${i}`));
        await petCard.swipe('right', 'fast', 0.5);
        await testUtils.waitForNetworkIdle(200);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Rapid swiping should be efficient
      expect(duration).toBeLessThan(5000);
    });

    it('should not cause memory leaks during swiping', async () => {
      await element(by.id('discovery-tab')).tap();
      
      // Perform multiple swipes
      for (let i = 0; i < 20; i++) {
        const petCard = element(by.id(`pet-card-${i % 5}`));
        await petCard.swipe('right', 'fast', 0.5);
        await testUtils.waitForNetworkIdle(100);
      }
      
      // App should still be responsive
      await expect(element(by.id('discovery-screen'))).toBeVisible();
    });
  });
});
