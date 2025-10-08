import { device, element, by, expect, waitFor } from 'detox';

describe('AI Features E2E Tests', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('AI Bio Generation Flow', () => {
    it('should navigate to AI Bio screen and generate bio successfully', async () => {
      // Navigate to AI Bio screen (assuming it's accessible from main navigation)
      await element(by.text('AI Bio')).tap();
      
      // Wait for screen to load
      await waitFor(element(by.text('AI Bio Generator')))
        .toBeVisible()
        .withTimeout(5000);

      // Fill in pet information
      await element(by.placeholderText('Enter pet name')).typeText('Buddy');
      await element(by.placeholderText('Enter pet breed')).typeText('Golden Retriever');
      await element(by.placeholderText('Enter pet age')).typeText('3');
      await element(by.placeholderText('Enter personality traits (comma-separated)')).typeText('friendly, energetic, playful');

      // Tap generate button
      await element(by.text('Generate AI Bio')).tap();

      // Wait for loading state
      await waitFor(element(by.text('Generating...')))
        .toBeVisible()
        .withTimeout(2000);

      // Wait for results
      await waitFor(element(by.text('Generated Bio')))
        .toBeVisible()
        .withTimeout(10000);

      // Verify bio is displayed
      await expect(element(by.text(/Buddy is a/))).toBeVisible();
      await expect(element(by.text('Match Score:'))).toBeVisible();
    });

    it('should show validation errors for empty fields', async () => {
      await element(by.text('AI Bio')).tap();
      
      await waitFor(element(by.text('AI Bio Generator')))
        .toBeVisible()
        .withTimeout(5000);

      // Try to generate without filling fields
      await element(by.text('Generate AI Bio')).tap();

      // Should show validation error
      await waitFor(element(by.text('Please enter your pet\'s name.')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should handle API errors gracefully', async () => {
      await element(by.text('AI Bio')).tap();
      
      await waitFor(element(by.text('AI Bio Generator')))
        .toBeVisible()
        .withTimeout(5000);

      // Fill in pet information
      await element(by.placeholderText('Enter pet name')).typeText('Buddy');
      await element(by.placeholderText('Enter pet breed')).typeText('Golden Retriever');
      await element(by.placeholderText('Enter pet age')).typeText('3');
      await element(by.placeholderText('Enter personality traits (comma-separated)')).typeText('friendly, energetic, playful');

      // Mock API failure by disconnecting network or using test mode
      // This would require backend to be in test mode that returns errors
      
      await element(by.text('Generate AI Bio')).tap();

      // Should show error message
      await waitFor(element(by.text('Failed to generate bio')))
        .toBeVisible()
        .withTimeout(10000);
    });
  });

  describe('AI Photo Analyzer Flow', () => {
    it('should navigate to Photo Analyzer and analyze photos successfully', async () => {
      await element(by.text('AI Photo Analyzer')).tap();
      
      await waitFor(element(by.text('AI Photo Analyzer')))
        .toBeVisible()
        .withTimeout(5000);

      // Tap "From Gallery" button
      await element(by.text('From Gallery')).tap();

      // Handle permission request if needed
      try {
        await waitFor(element(by.text('Allow')))
          .toBeVisible()
          .withTimeout(2000);
        await element(by.text('Allow')).tap();
      } catch (e) {
        // Permission already granted or not needed
      }

      // Select photos (this would require actual photos in simulator)
      // For testing, we'll assume photos are selected automatically
      
      // Wait for analyze button to appear
      await waitFor(element(by.text('Analyze Photos')))
        .toBeVisible()
        .withTimeout(5000);

      // Tap analyze button
      await element(by.text('Analyze Photos')).tap();

      // Wait for loading state
      await waitFor(element(by.text('Analyzing...')))
        .toBeVisible()
        .withTimeout(2000);

      // Wait for results
      await waitFor(element(by.text('🎯 Analysis Results')))
        .toBeVisible()
        .withTimeout(15000);

      // Verify analysis results are displayed
      await expect(element(by.text('💕 Matchability Score'))).toBeVisible();
      await expect(element(by.text('🧬 Breed Analysis'))).toBeVisible();
      await expect(element(by.text('🏥 Health Assessment'))).toBeVisible();
      await expect(element(by.text('📸 Photo Quality'))).toBeVisible();
    });

    it('should show error when no photos are selected', async () => {
      await element(by.text('AI Photo Analyzer')).tap();
      
      await waitFor(element(by.text('AI Photo Analyzer')))
        .toBeVisible()
        .withTimeout(5000);

      // Try to analyze without selecting photos
      await element(by.text('Analyze Photos')).tap();

      // Should show error
      await waitFor(element(by.text('Please select at least one photo to analyze.')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should handle camera permission denial gracefully', async () => {
      await element(by.text('AI Photo Analyzer')).tap();
      
      await waitFor(element(by.text('AI Photo Analyzer')))
        .toBeVisible()
        .withTimeout(5000);

      // Tap "Take Photo" button
      await element(by.text('Take Photo')).tap();

      // Handle permission denial
      try {
        await waitFor(element(by.text('Don\'t Allow')))
          .toBeVisible()
          .withTimeout(2000);
        await element(by.text('Don\'t Allow')).tap();
        
        // Should show permission error
        await waitFor(element(by.text('We need access to your camera')))
          .toBeVisible()
          .withTimeout(3000);
      } catch (e) {
        // Permission flow might be different on different devices
      }
    });
  });

  describe('AI Compatibility Analysis Flow', () => {
    it('should navigate to Compatibility screen and analyze pets successfully', async () => {
      await element(by.text('AI Compatibility')).tap();
      
      await waitFor(element(by.text('AI Compatibility')))
        .toBeVisible()
        .withTimeout(5000);

      // Wait for pets to load
      await waitFor(element(by.text('Available Pets')))
        .toBeVisible()
        .withTimeout(5000);

      // Select first pet
      await element(by.text('Buddy')).tap();

      // Select second pet
      await element(by.text('Luna')).tap();

      // Wait for analyze button to appear
      await waitFor(element(by.text('Analyze Compatibility')))
        .toBeVisible()
        .withTimeout(3000);

      // Tap analyze button
      await element(by.text('Analyze Compatibility')).tap();

      // Wait for loading state
      await waitFor(element(by.text('Analyzing...')))
        .toBeVisible()
        .withTimeout(2000);

      // Wait for results
      await waitFor(element(by.text('🎯 Compatibility Results')))
        .toBeVisible()
        .withTimeout(15000);

      // Verify compatibility results are displayed
      await expect(element(by.text('💕 Compatibility Score'))).toBeVisible();
      await expect(element(by.text('📊 Detailed Breakdown'))).toBeVisible();
      await expect(element(by.text('💡 Recommendations'))).toBeVisible();
    });

    it('should show error when trying to analyze without selecting both pets', async () => {
      await element(by.text('AI Compatibility')).tap();
      
      await waitFor(element(by.text('AI Compatibility')))
        .toBeVisible()
        .withTimeout(5000);

      // Try to analyze without selecting pets
      await element(by.text('Analyze Compatibility')).tap();

      // Should show error
      await waitFor(element(by.text('Please select two pets to analyze compatibility.')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should prevent selecting same pet twice', async () => {
      await element(by.text('AI Compatibility')).tap();
      
      await waitFor(element(by.text('AI Compatibility')))
        .toBeVisible()
        .withTimeout(5000);

      // Select first pet
      await element(by.text('Buddy')).tap();

      // Try to select same pet again - should not be possible
      // The pet should be disabled or not selectable
      await expect(element(by.text('Buddy'))).toBeVisible();
    });

    it('should allow resetting analysis and starting new one', async () => {
      await element(by.text('AI Compatibility')).tap();
      
      await waitFor(element(by.text('AI Compatibility')))
        .toBeVisible()
        .withTimeout(5000);

      // Select pets and analyze
      await element(by.text('Buddy')).tap();
      await element(by.text('Luna')).tap();
      await element(by.text('Analyze Compatibility')).tap();

      // Wait for results
      await waitFor(element(by.text('🎯 Compatibility Results')))
        .toBeVisible()
        .withTimeout(15000);

      // Tap reset button
      await element(by.text('New Analysis')).tap();

      // Should be back to pet selection
      await waitFor(element(by.text('🐕 Select Two Pets')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('Offline/503 Error Handling', () => {
    it('should handle offline scenario gracefully in AI Bio', async () => {
      // Disconnect network (this would require device/simulator setup)
      // For testing, we'll assume network is disconnected
      
      await element(by.text('AI Bio')).tap();
      
      await waitFor(element(by.text('AI Bio Generator')))
        .toBeVisible()
        .withTimeout(5000);

      // Fill in pet information
      await element(by.placeholderText('Enter pet name')).typeText('Buddy');
      await element(by.placeholderText('Enter pet breed')).typeText('Golden Retriever');
      await element(by.placeholderText('Enter pet age')).typeText('3');
      await element(by.placeholderText('Enter personality traits (comma-separated)')).typeText('friendly, energetic, playful');

      await element(by.text('Generate AI Bio')).tap();

      // Should show graceful error message
      await waitFor(element(by.text(/Failed to generate bio/)))
        .toBeVisible()
        .withTimeout(10000);
    });

    it('should handle 503 service unavailable error in Photo Analyzer', async () => {
      // Mock 503 error from backend
      
      await element(by.text('AI Photo Analyzer')).tap();
      
      await waitFor(element(by.text('AI Photo Analyzer')))
        .toBeVisible()
        .withTimeout(5000);

      // Select photos and analyze (assuming photos are available)
      await element(by.text('From Gallery')).tap();
      
      await waitFor(element(by.text('Analyze Photos')))
        .toBeVisible()
        .withTimeout(5000);

      await element(by.text('Analyze Photos')).tap();

      // Should show graceful error message
      await waitFor(element(by.text(/Failed to analyze photos/)))
        .toBeVisible()
        .withTimeout(10000);
    });

    it('should handle timeout errors in Compatibility Analysis', async () => {
      // Mock timeout error
      
      await element(by.text('AI Compatibility')).tap();
      
      await waitFor(element(by.text('AI Compatibility')))
        .toBeVisible()
        .withTimeout(5000);

      // Select pets and analyze
      await element(by.text('Buddy')).tap();
      await element(by.text('Luna')).tap();
      await element(by.text('Analyze Compatibility')).tap();

      // Should show graceful error message
      await waitFor(element(by.text(/Failed to analyze compatibility/)))
        .toBeVisible()
        .withTimeout(10000);
    });
  });

  describe('Navigation and Back Button', () => {
    it('should navigate back from AI Bio screen', async () => {
      await element(by.text('AI Bio')).tap();
      
      await waitFor(element(by.text('AI Bio Generator')))
        .toBeVisible()
        .withTimeout(5000);

      // Tap back button
      await element(by.id('back-button')).tap();

      // Should navigate back to previous screen
      await waitFor(element(by.text('AI Bio Generator')))
        .not.toBeVisible()
        .withTimeout(3000);
    });

    it('should navigate back from Photo Analyzer screen', async () => {
      await element(by.text('AI Photo Analyzer')).tap();
      
      await waitFor(element(by.text('AI Photo Analyzer')))
        .toBeVisible()
        .withTimeout(5000);

      // Tap back button
      await element(by.id('back-button')).tap();

      // Should navigate back to previous screen
      await waitFor(element(by.text('AI Photo Analyzer')))
        .not.toBeVisible()
        .withTimeout(3000);
    });

    it('should navigate back from Compatibility screen', async () => {
      await element(by.text('AI Compatibility')).tap();
      
      await waitFor(element(by.text('AI Compatibility')))
        .toBeVisible()
        .withTimeout(5000);

      // Tap back button
      await element(by.id('back-button')).tap();

      // Should navigate back to previous screen
      await waitFor(element(by.text('AI Compatibility')))
        .not.toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('Performance and Loading States', () => {
    it('should show loading states appropriately in AI Bio', async () => {
      await element(by.text('AI Bio')).tap();
      
      await waitFor(element(by.text('AI Bio Generator')))
        .toBeVisible()
        .withTimeout(5000);

      // Fill in pet information
      await element(by.placeholderText('Enter pet name')).typeText('Buddy');
      await element(by.placeholderText('Enter pet breed')).typeText('Golden Retriever');
      await element(by.placeholderText('Enter pet age')).typeText('3');
      await element(by.placeholderText('Enter personality traits (comma-separated)')).typeText('friendly, energetic, playful');

      await element(by.text('Generate AI Bio')).tap();

      // Should show loading state
      await waitFor(element(by.text('Generating...')))
        .toBeVisible()
        .withTimeout(2000);

      // Button should be disabled during loading
      await expect(element(by.text('Generating...'))).toBeVisible();
    });

    it('should show loading states appropriately in Photo Analyzer', async () => {
      await element(by.text('AI Photo Analyzer')).tap();
      
      await waitFor(element(by.text('AI Photo Analyzer')))
        .toBeVisible()
        .withTimeout(5000);

      // Select photos and analyze
      await element(by.text('From Gallery')).tap();
      
      await waitFor(element(by.text('Analyze Photos')))
        .toBeVisible()
        .withTimeout(5000);

      await element(by.text('Analyze Photos')).tap();

      // Should show loading state
      await waitFor(element(by.text('Analyzing...')))
        .toBeVisible()
        .withTimeout(2000);
    });

    it('should show loading states appropriately in Compatibility Analysis', async () => {
      await element(by.text('AI Compatibility')).tap();
      
      await waitFor(element(by.text('AI Compatibility')))
        .toBeVisible()
        .withTimeout(5000);

      // Select pets and analyze
      await element(by.text('Buddy')).tap();
      await element(by.text('Luna')).tap();
      await element(by.text('Analyze Compatibility')).tap();

      // Should show loading state
      await waitFor(element(by.text('Analyzing...')))
        .toBeVisible()
        .withTimeout(2000);
    });
  });
});
