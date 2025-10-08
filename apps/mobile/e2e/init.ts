/**
 * E2E Test Initialization
 * Sets up the test environment for Detox E2E tests
 */

import { device, expect, element, by } from 'detox';

// Global test setup
beforeAll(async () => {
  // Wait for app to be ready
  await device.launchApp();
  
  // Grant necessary permissions
  await device.grantPermissions();
  
  // Set up any global test state
  console.log('🚀 E2E Tests Initialized');
});

// Global test teardown
afterAll(async () => {
  // Clean up any global test state
  console.log('🏁 E2E Tests Completed');
});

// Common test utilities
export const waitForElement = async (testID: string, timeout = 10000) => {
  await waitFor(element(by.id(testID)))
    .toBeVisible()
    .withTimeout(timeout);
};

export const waitForText = async (text: string, timeout = 10000) => {
  await waitFor(element(by.text(text)))
    .toBeVisible()
    .withTimeout(timeout);
};

export const tapElement = async (testID: string) => {
  await element(by.id(testID)).tap();
};

export const tapText = async (text: string) => {
  await element(by.text(text)).tap();
};

export const typeText = async (testID: string, text: string) => {
  await element(by.id(testID)).typeText(text);
};

export const clearText = async (testID: string) => {
  await element(by.id(testID)).clearText();
};

export const scrollToElement = async (testID: string, direction: 'up' | 'down' = 'down') => {
  await element(by.id(testID)).scroll(100, direction);
};

// AI-specific test utilities
export const fillAIBioForm = async (petName: string, breed: string, age: string, personality: string) => {
  await typeText('pet-name-input', petName);
  await typeText('pet-breed-input', breed);
  await typeText('pet-age-input', age);
  await typeText('pet-personality-input', personality);
};

export const selectPhotos = async (count: number = 1) => {
  await tapText('From Gallery');
  // In a real test, you would need to mock photo selection
  // For now, we'll assume photos are selected automatically
};

export const selectPets = async (pet1Name: string, pet2Name: string) => {
  await tapText(pet1Name);
  await tapText(pet2Name);
};

// Error handling utilities
export const expectError = async (errorText: string) => {
  await waitForText(errorText, 5000);
};

export const expectSuccess = async (successText: string) => {
  await waitForText(successText, 10000);
};

// Navigation utilities
export const navigateBack = async () => {
  await tapElement('back-button');
};

export const navigateToScreen = async (screenName: string) => {
  await tapText(screenName);
};

// Loading state utilities
export const waitForLoading = async (loadingText: string = 'Loading...') => {
  await waitForText(loadingText, 5000);
};

export const waitForLoadingComplete = async (loadingText: string = 'Loading...') => {
  await waitFor(element(by.text(loadingText)))
    .not.toBeVisible()
    .withTimeout(15000);
};
