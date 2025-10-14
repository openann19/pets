/**
 * Custom Cypress Commands
 * Reusable commands for E2E testing
 */

interface PetData {
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed: string;
  age: number;
  size: 'small' | 'medium' | 'large';
  description: string;
  photos: string[];
}

interface UserData {
  name: string;
  email: string;
  password: string;
  location: {
    city: string;
    country: string;
    coordinates: { lat: number; lng: number };
  };
}

interface MatchData {
  petId: string;
  matchedPetId: string;
  userId: string;
  matchedUserId: string;
}

interface Preferences {
  maxDistance: number;
  ageRange: { min: number; max: number };
  sizePreference: ('small' | 'medium' | 'large')[];
  breedPreference: string[];
  temperamentPreference: string[];
}

interface Location {
  city: string;
  country: string;
  coordinates: { lat: number; lng: number };
}

interface PetFilters {
  species?: ('dog' | 'cat' | 'other')[];
  ageRange?: { min: number; max: number };
  size?: ('small' | 'medium' | 'large')[];
  breed?: string[];
  distance?: number;
}

// Authentication commands
Cypress.Commands.add('loginAsTestUser', () => {
  cy.session('testUser', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type(Cypress.env('testUser').email);
    cy.get('input[name="password"]').type(Cypress.env('testUser').password);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/swipe');
  });
});

Cypress.Commands.add('loginAsPremiumUser', () => {
  cy.session('premiumUser', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type(Cypress.env('premiumUser').email);
    cy.get('input[name="password"]').type(Cypress.env('premiumUser').password);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/swipe');
  });
});

// Navigation commands
Cypress.Commands.add('navigateToSwipe', () => {
  cy.visit('/swipe');
  cy.get('[data-testid="swipe-stack"]').should('be.visible');
});

Cypress.Commands.add('navigateToMatches', () => {
  cy.visit('/matches');
  cy.get('[data-testid="matches-list"]').should('be.visible');
});

Cypress.Commands.add('navigateToChat', (matchId: string) => {
  cy.visit(`/chat/${matchId}`);
  cy.get('[data-testid="chat-screen"]').should('be.visible');
});

Cypress.Commands.add('navigateToProfile', () => {
  cy.visit('/profile');
  cy.get('[data-testid="profile-screen"]').should('be.visible');
});

// Pet interaction commands
Cypress.Commands.add('swipePet', (direction: 'left' | 'right' | 'up') => {
  const petCard = cy.get('[data-testid="pet-card"]').first();

  switch (direction) {
    case 'left':
      petCard
        .trigger('mousedown', { which: 1 })
        .trigger('mousemove', { clientX: -200 })
        .trigger('mouseup');
      break;
    case 'right':
      petCard
        .trigger('mousedown', { which: 1 })
        .trigger('mousemove', { clientX: 200 })
        .trigger('mouseup');
      break;
    case 'up':
      petCard
        .trigger('mousedown', { which: 1 })
        .trigger('mousemove', { clientY: -200 })
        .trigger('mouseup');
      break;
  }
});

Cypress.Commands.add('likePet', () => {
  cy.get('[data-testid="like-button"]').click();
});

Cypress.Commands.add('passPet', () => {
  cy.get('[data-testid="pass-button"]').click();
});

Cypress.Commands.add('superLikePet', () => {
  cy.get('[data-testid="superlike-button"]').click();
});

// Chat commands
Cypress.Commands.add('sendMessage', (message: string) => {
  cy.get('[data-testid="message-input"]').type(message);
  cy.get('[data-testid="send-button"]').click();
});

Cypress.Commands.add('sendImage', (imagePath: string) => {
  cy.get('[data-testid="image-button"]').click();
  cy.get('[data-testid="image-input"]').selectFile(imagePath, { force: true });
  cy.get('[data-testid="send-button"]').click();
});

Cypress.Commands.add('sendLocation', () => {
  cy.get('[data-testid="location-button"]').click();
  cy.get('[data-testid="confirm-location"]').click();
});

// Profile commands
Cypress.Commands.add('createPet', (petData: PetData) => {
  cy.get('[data-testid="add-pet-button"]').click();
  cy.get('[data-testid="pet-name-input"]').type(petData.name);
  cy.get('[data-testid="pet-species-select"]').select(petData.species);
  cy.get('[data-testid="pet-breed-input"]').type(petData.breed);
  cy.get('[data-testid="pet-age-input"]').type(petData.age.toString());
  cy.get('[data-testid="save-pet-button"]').click();
});

Cypress.Commands.add('editPet', (petId: string, updates: Partial<PetData>) => {
  cy.get(`[data-testid="pet-${petId}"]`).click();
  cy.get('[data-testid="edit-pet-button"]').click();

  Object.keys(updates).forEach((key) => {
    cy.get(`[data-testid="pet-${key}-input"]`).clear().type(updates[key]);
  });

  cy.get('[data-testid="save-pet-button"]').click();
});

Cypress.Commands.add('uploadPetPhoto', (petId: string, imagePath: string) => {
  cy.get(`[data-testid="pet-${petId}"]`).click();
  cy.get('[data-testid="add-photo-button"]').click();
  cy.get('[data-testid="photo-input"]').selectFile(imagePath, { force: true });
  cy.get('[data-testid="upload-button"]').click();
});

// Premium feature commands
Cypress.Commands.add('upgradeToPremium', () => {
  cy.get('[data-testid="upgrade-button"]').click();
  cy.get('[data-testid="premium-plan"]').click();
  cy.get('[data-testid="checkout-button"]').click();
});

Cypress.Commands.add('useSuperLike', () => {
  cy.get('[data-testid="superlike-button"]').click();
  cy.get('[data-testid="confirm-superlike"]').click();
});

Cypress.Commands.add('boostProfile', () => {
  cy.get('[data-testid="boost-button"]').click();
  cy.get('[data-testid="confirm-boost"]').click();
});

// Settings commands
Cypress.Commands.add('updatePreferences', (preferences: Preferences) => {
  cy.get('[data-testid="settings-button"]').click();
  cy.get('[data-testid="preferences-tab"]').click();

  Object.keys(preferences).forEach((key) => {
    cy.get(`[data-testid="preference-${key}"]`).clear().type(preferences[key]);
  });

  cy.get('[data-testid="save-preferences"]').click();
});

Cypress.Commands.add('updateLocation', (location: Location) => {
  cy.get('[data-testid="settings-button"]').click();
  cy.get('[data-testid="location-tab"]').click();
  cy.get('[data-testid="update-location-button"]').click();
  cy.get('[data-testid="location-input"]').type(location);
  cy.get('[data-testid="save-location"]').click();
});

// Notification commands
Cypress.Commands.add('enableNotifications', () => {
  cy.get('[data-testid="settings-button"]').click();
  cy.get('[data-testid="notifications-tab"]').click();
  cy.get('[data-testid="enable-notifications"]').click();
});

Cypress.Commands.add('disableNotifications', () => {
  cy.get('[data-testid="settings-button"]').click();
  cy.get('[data-testid="notifications-tab"]').click();
  cy.get('[data-testid="disable-notifications"]').click();
});

// Search commands
Cypress.Commands.add('searchPets', (query: string) => {
  cy.get('[data-testid="search-input"]').type(query);
  cy.get('[data-testid="search-button"]').click();
});

Cypress.Commands.add('filterPets', (filters: PetFilters) => {
  cy.get('[data-testid="filter-button"]').click();

  Object.keys(filters).forEach((key) => {
    cy.get(`[data-testid="filter-${key}"]`).select(filters[key]);
  });

  cy.get('[data-testid="apply-filters"]').click();
});

// Error handling commands
Cypress.Commands.add('handleNetworkError', () => {
  cy.get('[data-testid="retry-button"]').click();
});

Cypress.Commands.add('handleAuthError', () => {
  cy.url().should('include', '/login');
  cy.get('[data-testid="login-form"]').should('be.visible');
});

// Performance commands
Cypress.Commands.add('measurePageLoad', (page: string) => {
  cy.visit(page);
  cy.window().then((win) => {
    const { performance } = win;
    const navigation = performance.getEntriesByType('navigation')[0]!;

    cy.log(`Page load time for ${page}:`, {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      totalTime: navigation.loadEventEnd - navigation.fetchStart,
    });
  });
});

// Accessibility commands
Cypress.Commands.add('checkPageA11y', () => {
  cy.injectAxe();
  cy.checkA11y();
});

Cypress.Commands.add('checkComponentA11y', (selector: string) => {
  cy.injectAxe();
  cy.get(selector).checkA11y();
});

// Mock commands
Cypress.Commands.add('mockStripe', () => {
  cy.intercept('POST', '**/stripe/**', { fixture: 'stripe-success.json' }).as('stripe');
});

Cypress.Commands.add('mockPayment', (success = true) => {
  const response = success
    ? { fixture: 'payment-success.json' }
    : { fixture: 'payment-failure.json' };

  cy.intercept('POST', '**/payment/**', response).as('payment');
});

Cypress.Commands.add('mockGeolocation', (lat = 40.7128, lng = -74.006) => {
  cy.window().then((win) => {
    cy.stub(win.navigator.geolocation, 'getCurrentPosition').callsFake((success) => {
      success({
        coords: {
          latitude: lat,
          longitude: lng,
          accuracy: 100,
        },
      });
    });
  });
});

// Database commands
Cypress.Commands.add('createTestUser', (userData: UserData) => {
  cy.task('db:createUser', userData);
});

Cypress.Commands.add('createTestPet', (petData: PetData) => {
  cy.task('db:createPet', petData);
});

Cypress.Commands.add('createTestMatch', (matchData: MatchData) => {
  cy.task('db:createMatch', matchData);
});

// Real-time commands
Cypress.Commands.add('waitForMatch', () => {
  cy.get('[data-testid="match-notification"]', { timeout: 10000 }).should('be.visible');
});

Cypress.Commands.add('waitForMessage', () => {
  cy.get('[data-testid="new-message"]', { timeout: 5000 }).should('be.visible');
});

declare global {
  namespace Cypress {
    interface Chainable {
      loginAsTestUser(): Chainable<void>;
      loginAsPremiumUser(): Chainable<void>;
      navigateToSwipe(): Chainable<void>;
      navigateToMatches(): Chainable<void>;
      navigateToChat(matchId: string): Chainable<void>;
      navigateToProfile(): Chainable<void>;
      swipePet(direction: 'left' | 'right' | 'up'): Chainable<void>;
      likePet(): Chainable<void>;
      passPet(): Chainable<void>;
      superLikePet(): Chainable<void>;
      sendMessage(message: string): Chainable<void>;
      sendImage(imagePath: string): Chainable<void>;
      sendLocation(): Chainable<void>;
      createPet(petData: PetData): Chainable<void>;
      editPet(petId: string, updates: Partial<PetData>): Chainable<void>;
      uploadPetPhoto(petId: string, imagePath: string): Chainable<void>;
      upgradeToPremium(): Chainable<void>;
      useSuperLike(): Chainable<void>;
      boostProfile(): Chainable<void>;
      updatePreferences(preferences: Preferences): Chainable<void>;
      updateLocation(location: Location): Chainable<void>;
      enableNotifications(): Chainable<void>;
      disableNotifications(): Chainable<void>;
      searchPets(query: string): Chainable<void>;
      filterPets(filters: PetFilters): Chainable<void>;
      handleNetworkError(): Chainable<void>;
      handleAuthError(): Chainable<void>;
      measurePageLoad(page: string): Chainable<void>;
      checkPageA11y(): Chainable<void>;
      checkComponentA11y(selector: string): Chainable<void>;
      mockStripe(): Chainable<void>;
      mockPayment(success?: boolean): Chainable<void>;
      mockGeolocation(lat?: number, lng?: number): Chainable<void>;
      createTestUser(userData: UserData): Chainable<void>;
      createTestPet(petData: PetData): Chainable<void>;
      createTestMatch(matchData: MatchData): Chainable<void>;
      waitForMatch(): Chainable<void>;
      waitForMessage(): Chainable<void>;
    }
  }
}
