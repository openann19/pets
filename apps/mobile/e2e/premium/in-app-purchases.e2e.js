/**
 * Mobile In-App Purchases E2E Tests
 * Comprehensive testing of premium features and in-app purchases
 */

describe('Mobile In-App Purchases', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    
    // Login first
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    await expect(element(by.id('dashboard-screen'))).toBeVisible();
  });

  describe('Premium Features Display', () => {
    it('should display premium features for free users', async () => {
      await element(by.id('premium-tab')).tap();
      await expect(element(by.id('premium-screen'))).toBeVisible();
      
      await expect(element(by.id('feature-unlimited-likes'))).toBeVisible();
      await expect(element(by.id('feature-super-likes'))).toBeVisible();
      await expect(element(by.id('feature-boost'))).toBeVisible();
      await expect(element(by.id('feature-advanced-filters'))).toBeVisible();
    });

    it('should show premium badge for premium users', async () => {
      // Login as premium user
      await element(by.id('email-input')).clearText();
      await element(by.id('email-input')).typeText('premium@example.com');
      await element(by.id('password-input')).clearText();
      await element(by.id('password-input')).typeText('premium123');
      await element(by.id('login-button')).tap();
      
      await element(by.id('profile-tab')).tap();
      await expect(element(by.id('premium-badge'))).toBeVisible();
      await expect(element(by.id('premium-badge')).toHaveText('Premium'));
    });

    it('should hide premium features for premium users', async () => {
      // Login as premium user
      await element(by.id('email-input')).clearText();
      await element(by.id('email-input')).typeText('premium@example.com');
      await element(by.id('password-input')).clearText();
      await element(by.id('password-input')).typeText('premium123');
      await element(by.id('login-button')).tap();
      
      await element(by.id('premium-tab')).tap();
      await expect(element(by.id('premium-features'))).toBeNotVisible();
      await expect(element(by.id('premium-status')).toHaveText('Active'));
    });
  });

  describe('Subscription Plans', () => {
    it('should display subscription plans', async () => {
      await element(by.id('premium-tab')).tap();
      
      await expect(element(by.id('subscription-plans'))).toBeVisible();
      await expect(element(by.id('plan-monthly'))).toBeVisible();
      await expect(element(by.id('plan-yearly'))).toBeVisible();
      await expect(element(by.id('plan-lifetime'))).toBeVisible();
    });

    it('should show plan pricing', async () => {
      await element(by.id('premium-tab')).tap();
      
      await expect(element(by.id('plan-monthly')).toHaveText('$9.99'));
      await expect(element(by.id('plan-yearly')).toHaveText('$99.99'));
      await expect(element(by.id('plan-lifetime')).toHaveText('$299.99'));
    });

    it('should highlight recommended plan', async () => {
      await element(by.id('premium-tab')).tap();
      
      await expect(element(by.id('plan-yearly')).toHaveLabel('Recommended'));
      await expect(element(by.id('recommended-badge'))).toBeVisible();
    });

    it('should show plan benefits', async () => {
      await element(by.id('premium-tab')).tap();
      
      await expect(element(by.id('plan-benefits'))).toBeVisible();
      await expect(element(by.id('benefit-unlimited-likes'))).toBeVisible();
      await expect(element(by.id('benefit-super-likes'))).toBeVisible();
      await expect(element(by.id('benefit-boost'))).toBeVisible();
      await expect(element(by.id('benefit-advanced-filters'))).toBeVisible();
    });
  });

  describe('In-App Purchase Flow', () => {
    it('should select monthly plan', async () => {
      await element(by.id('premium-tab')).tap();
      
      await element(by.id('plan-monthly')).tap();
      await expect(element(by.id('selected-plan')).toHaveText('Monthly'));
      await expect(element(by.id('purchase-button'))).toBeVisible();
    });

    it('should select yearly plan', async () => {
      await element(by.id('premium-tab')).tap();
      
      await element(by.id('plan-yearly')).tap();
      await expect(element(by.id('selected-plan')).toHaveText('Yearly'));
      await expect(element(by.id('purchase-button'))).toBeVisible();
    });

    it('should show savings for yearly plan', async () => {
      await element(by.id('premium-tab')).tap();
      
      await element(by.id('plan-yearly')).tap();
      await expect(element(by.id('savings-amount')).toBeVisible());
      await expect(element(by.id('savings-amount')).toHaveText('Save'));
    });

    it('should proceed to purchase', async () => {
      await element(by.id('premium-tab')).tap();
      
      await element(by.id('plan-monthly')).tap();
      await element(by.id('purchase-button')).tap();
      
      await expect(element(by.id('purchase-modal'))).toBeVisible();
      await expect(element(by.id('purchase-confirmation'))).toBeVisible();
    });
  });

  describe('Purchase Confirmation', () => {
    beforeEach(async () => {
      await element(by.id('premium-tab')).tap();
      await element(by.id('plan-monthly')).tap();
      await element(by.id('purchase-button')).tap();
    });

    it('should display purchase confirmation', async () => {
      await expect(element(by.id('purchase-modal'))).toBeVisible();
      await expect(element(by.id('plan-summary'))).toBeVisible();
      await expect(element(by.id('price-display'))).toBeVisible();
      await expect(element(by.id('confirm-purchase-button'))).toBeVisible();
    });

    it('should show terms and conditions', async () => {
      await element(by.id('terms-link')).tap();
      await expect(element(by.id('terms-modal'))).toBeVisible();
      await expect(element(by.text('Terms and Conditions'))).toBeVisible();
      
      await element(by.id('close-terms')).tap();
      await expect(element(by.id('terms-modal'))).toBeNotVisible();
    });

    it('should show privacy policy', async () => {
      await element(by.id('privacy-link')).tap();
      await expect(element(by.id('privacy-modal'))).toBeVisible();
      await expect(element(by.text('Privacy Policy'))).toBeVisible();
      
      await element(by.id('close-privacy')).tap();
      await expect(element(by.id('privacy-modal'))).toBeNotVisible();
    });

    it('should confirm purchase', async () => {
      await element(by.id('confirm-purchase-button')).tap();
      
      // Should show purchase processing
      await expect(element(by.id('purchase-processing'))).toBeVisible();
      await expect(element(by.text('Processing purchase...'))).toBeVisible();
    });

    it('should cancel purchase', async () => {
      await element(by.id('cancel-purchase-button')).tap();
      
      await expect(element(by.id('purchase-modal'))).toBeNotVisible();
      await expect(element(by.id('premium-screen'))).toBeVisible();
    });
  });

  describe('Purchase Processing', () => {
    it('should process successful purchase', async () => {
      await element(by.id('premium-tab')).tap();
      await element(by.id('plan-monthly')).tap();
      await element(by.id('purchase-button')).tap();
      await element(by.id('confirm-purchase-button')).tap();
      
      // Simulate successful purchase
      await testUtils.waitForNetworkIdle(3000);
      
      await expect(element(by.text('Purchase successful!'))).toBeVisible();
      await expect(element(by.text('Welcome to Premium!'))).toBeVisible();
    });

    it('should handle purchase failure', async () => {
      await element(by.id('premium-tab')).tap();
      await element(by.id('plan-monthly')).tap();
      await element(by.id('purchase-button')).tap();
      await element(by.id('confirm-purchase-button')).tap();
      
      // Simulate purchase failure
      await testUtils.mockApiResponse('/purchase/process', { error: 'Payment failed' }, 0, 400);
      
      await expect(element(by.text('Purchase failed'))).toBeVisible();
      await expect(element(by.text('Please try again'))).toBeVisible();
    });

    it('should handle network error during purchase', async () => {
      await element(by.id('premium-tab')).tap();
      await element(by.id('plan-monthly')).tap();
      await element(by.id('purchase-button')).tap();
      await element(by.id('confirm-purchase-button')).tap();
      
      // Simulate network error
      await testUtils.simulateNetworkCondition('offline');
      
      await expect(element(by.text('Network error'))).toBeVisible();
      await expect(element(by.text('Please check your connection'))).toBeVisible();
    });
  });

  describe('Premium Features Usage', () => {
    it('should allow unlimited likes for premium users', async () => {
      // Login as premium user
      await element(by.id('email-input')).clearText();
      await element(by.id('email-input')).typeText('premium@example.com');
      await element(by.id('password-input')).clearText();
      await element(by.id('password-input')).typeText('premium123');
      await element(by.id('login-button')).tap();
      
      await element(by.id('discovery-tab')).tap();
      
      // Like multiple pets without restriction
      for (let i = 0; i < 10; i++) {
        await element(by.id('like-button')).tap();
        await testUtils.waitForNetworkIdle(100);
      }
      
      await expect(element(by.id('rate-limit-message'))).toBeNotVisible();
    });

    it('should show super like count for premium users', async () => {
      // Login as premium user
      await element(by.id('email-input')).clearText();
      await element(by.id('email-input')).typeText('premium@example.com');
      await element(by.id('password-input')).clearText();
      await element(by.id('password-input')).typeText('premium123');
      await element(by.id('login-button')).tap();
      
      await element(by.id('discovery-tab')).tap();
      
      await expect(element(by.id('superlike-count')).toBeVisible());
      await expect(element(by.id('superlike-count')).toHaveText('5'));
    });

    it('should allow super like usage', async () => {
      // Login as premium user
      await element(by.id('email-input')).clearText();
      await element(by.id('email-input')).typeText('premium@example.com');
      await element(by.id('password-input')).clearText();
      await element(by.id('password-input')).typeText('premium123');
      await element(by.id('login-button')).tap();
      
      await element(by.id('discovery-tab')).tap();
      
      await element(by.id('superlike-button')).tap();
      await expect(element(by.id('superlike-count')).toHaveText('4'));
    });

    it('should show boost feature for premium users', async () => {
      // Login as premium user
      await element(by.id('email-input')).clearText();
      await element(by.id('email-input')).typeText('premium@example.com');
      await element(by.id('password-input')).clearText();
      await element(by.id('password-input')).typeText('premium123');
      await element(by.id('login-button')).tap();
      
      await element(by.id('profile-tab')).tap();
      
      await expect(element(by.id('boost-button')).toBeVisible());
      await expect(element(by.id('boost-count')).toHaveText('1'));
    });

    it('should allow boost usage', async () => {
      // Login as premium user
      await element(by.id('email-input')).clearText();
      await element(by.id('email-input')).typeText('premium@example.com');
      await element(by.id('password-input')).clearText();
      await element(by.id('password-input')).typeText('premium123');
      await element(by.id('login-button')).tap();
      
      await element(by.id('profile-tab')).tap();
      
      await element(by.id('boost-button')).tap();
      await element(by.id('confirm-boost')).tap();
      
      await expect(element(by.text('Profile boosted')).toBeVisible());
    });

    it('should show advanced filters for premium users', async () => {
      // Login as premium user
      await element(by.id('email-input')).clearText();
      await element(by.id('email-input')).typeText('premium@example.com');
      await element(by.id('password-input')).clearText();
      await element(by.id('password-input')).typeText('premium123');
      await element(by.id('login-button')).tap();
      
      await element(by.id('discovery-tab')).tap();
      
      await element(by.id('filter-button')).tap();
      await expect(element(by.id('advanced-filters')).toBeVisible());
      await expect(element(by.id('filter-temperament')).toBeVisible());
      await expect(element(by.id('filter-vaccination')).toBeVisible());
      await expect(element(by.id('filter-neutered')).toBeVisible());
    });
  });

  describe('Free User Limitations', () => {
    it('should limit likes for free users', async () => {
      await element(by.id('discovery-tab')).tap();
      
      // Like pets up to the limit
      for (let i = 0; i < 5; i++) {
        await element(by.id('like-button')).tap();
        await testUtils.waitForNetworkIdle(100);
      }
      
      await expect(element(by.id('rate-limit-message')).toBeVisible());
      await expect(element(by.text('You\'ve reached your daily like limit')).toBeVisible());
    });

    it('should show upgrade prompt for free users', async () => {
      await element(by.id('discovery-tab')).tap();
      
      // Try to use premium feature
      await element(by.id('superlike-button')).tap();
      await expect(element(by.id('upgrade-prompt')).toBeVisible());
      await expect(element(by.text('Upgrade to Premium')).toBeVisible());
    });

    it('should hide advanced filters for free users', async () => {
      await element(by.id('discovery-tab')).tap();
      
      await element(by.id('filter-button')).tap();
      await expect(element(by.id('advanced-filters')).toBeNotVisible());
      await expect(element(by.id('premium-filter-badge')).toBeVisible());
    });
  });

  describe('Subscription Management', () => {
    it('should display current subscription for premium users', async () => {
      // Login as premium user
      await element(by.id('email-input')).clearText();
      await element(by.id('email-input')).typeText('premium@example.com');
      await element(by.id('password-input')).clearText();
      await element(by.id('password-input')).typeText('premium123');
      await element(by.id('login-button')).tap();
      
      await element(by.id('premium-tab')).tap();
      
      await expect(element(by.id('current-subscription')).toBeVisible());
      await expect(element(by.id('subscription-status')).toHaveText('Active'));
      await expect(element(by.id('subscription-plan')).toHaveText('Premium'));
      await expect(element(by.id('next-billing-date')).toBeVisible());
    });

    it('should show subscription history', async () => {
      // Login as premium user
      await element(by.id('email-input')).clearText();
      await element(by.id('email-input')).typeText('premium@example.com');
      await element(by.id('password-input')).clearText();
      await element(by.id('password-input')).typeText('premium123');
      await element(by.id('login-button')).tap();
      
      await element(by.id('premium-tab')).tap();
      
      await expect(element(by.id('subscription-history')).toBeVisible());
      await expect(element(by.id('history-item')).toBeVisible());
    });

    it('should allow subscription cancellation', async () => {
      // Login as premium user
      await element(by.id('email-input')).clearText();
      await element(by.id('email-input')).typeText('premium@example.com');
      await element(by.id('password-input')).clearText();
      await element(by.id('password-input')).typeText('premium123');
      await element(by.id('login-button')).tap();
      
      await element(by.id('premium-tab')).tap();
      
      await element(by.id('cancel-subscription-button')).tap();
      await element(by.id('confirm-cancel')).tap();
      
      await expect(element(by.text('Subscription cancelled')).toBeVisible());
    });

    it('should allow subscription reactivation', async () => {
      // Login as premium user
      await element(by.id('email-input')).clearText();
      await element(by.id('email-input')).typeText('premium@example.com');
      await element(by.id('password-input')).clearText();
      await element(by.id('password-input')).typeText('premium123');
      await element(by.id('login-button')).tap();
      
      await element(by.id('premium-tab')).tap();
      
      await element(by.id('reactivate-subscription-button')).tap();
      await element(by.id('confirm-reactivate')).tap();
      
      await expect(element(by.text('Subscription reactivated')).toBeVisible());
    });
  });

  describe('Error Handling', () => {
    it('should handle purchase API error', async () => {
      await element(by.id('premium-tab')).tap();
      await element(by.id('plan-monthly')).tap();
      await element(by.id('purchase-button')).tap();
      await element(by.id('confirm-purchase-button')).tap();
      
      // Simulate API error
      await testUtils.mockApiResponse('/purchase/process', { error: 'Internal server error' }, 0, 500);
      
      await expect(element(by.text('Something went wrong')).toBeVisible());
      await expect(element(by.text('Please try again later')).toBeVisible());
    });

    it('should handle subscription status error', async () => {
      // Login as premium user
      await element(by.id('email-input')).clearText();
      await element(by.id('email-input')).typeText('premium@example.com');
      await element(by.id('password-input')).clearText();
      await element(by.id('password-input')).typeText('premium123');
      await element(by.id('login-button')).tap();
      
      // Simulate subscription status error
      await testUtils.mockApiResponse('/subscription/status', { error: 'Failed to load' }, 0, 500);
      
      await element(by.id('premium-tab')).tap();
      await expect(element(by.text('Failed to load subscription')).toBeVisible());
    });
  });

  describe('Accessibility', () => {
    it('should be accessible with screen readers', async () => {
      await element(by.id('premium-tab')).tap();
      
      await expect(element(by.id('plan-monthly')).toHaveLabel('Monthly subscription plan'));
      await expect(element(by.id('plan-yearly')).toHaveLabel('Yearly subscription plan'));
      await expect(element(by.id('purchase-button')).toHaveLabel('Purchase subscription'));
    });

    it('should support voice control', async () => {
      await element(by.id('premium-tab')).tap();
      
      await element(by.id('voice-control-button')).tap();
      await expect(element(by.text('Voice control activated')).toBeVisible());
    });
  });

  describe('Performance', () => {
    it('should load premium screen quickly', async () => {
      const startTime = Date.now();
      
      await element(by.id('premium-tab')).tap();
      await expect(element(by.id('premium-screen')).toBeVisible());
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Premium screen should load quickly
      expect(duration).toBeLessThan(3000);
    });

    it('should handle purchase processing efficiently', async () => {
      const startTime = Date.now();
      
      await element(by.id('premium-tab')).tap();
      await element(by.id('plan-monthly')).tap();
      await element(by.id('purchase-button')).tap();
      await element(by.id('confirm-purchase-button')).tap();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Purchase processing should be efficient
      expect(duration).toBeLessThan(2000);
    });
  });
});
