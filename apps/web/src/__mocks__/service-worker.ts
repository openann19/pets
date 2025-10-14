/**
 * Service Worker Mocks for Testing
 */

// Mock ServiceWorker registration
export class MockServiceWorkerRegistration {
  scope: string;
  active: unknown;
  installing: unknown | null;
  waiting: unknown | null;
  pushManager: unknown;
  sync: unknown;
  navigationPreload: unknown;
  updateViaCache: string;

  constructor() {
    this.scope = 'https://example.com/';
    this.active = {
      state: 'activated',
      scriptURL: 'https://example.com/sw.js',
      onstatechange: null,
    };
    this.installing = null;
    this.waiting = null;
    this.pushManager = {
      subscribe: jest.fn().mockResolvedValue({
        endpoint: 'https://fcm.googleapis.com/fcm/send/example',
        keys: {
          auth: 'mock-auth-key',
          p256dh: 'mock-p256dh-key',
        },
        toJSON: () => ({
          endpoint: 'https://fcm.googleapis.com/fcm/send/example',
          keys: {
            auth: 'mock-auth-key',
            p256dh: 'mock-p256dh-key',
          },
        }),
      }),
      getSubscription: jest.fn().mockResolvedValue(null),
      permissionState: jest.fn().mockResolvedValue('granted'),
    };
    this.sync = {
      register: jest.fn().mockResolvedValue(undefined),
      getTags: jest.fn().mockResolvedValue([]),
    };
    this.navigationPreload = {
      enable: jest.fn().mockResolvedValue(undefined),
      disable: jest.fn().mockResolvedValue(undefined),
      getState: jest.fn().mockResolvedValue({}),
      setHeaderValue: jest.fn().mockResolvedValue(undefined),
    };
    this.updateViaCache = 'imports';
  }

  async update() {
    return this;
  }

  async unregister() {
    return true;
  }

  async showNotification(_title: string, _options?: NotificationOptions) {
    return;
  }

  async getNotifications(_options?: GetNotificationOptions) {
    return [];
  }
}

// Mock ServiceWorkerContainer
export class MockServiceWorkerContainer {
  controller: ServiceWorker | null;
  ready: Promise<ServiceWorkerRegistration>;
  oncontrollerchange: ((event: Event) => void) | null;
  onmessage: ((event: MessageEvent) => void) | null;
  onmessageerror: ((event: MessageEvent) => void) | null;

  constructor() {
    this.controller = null;
    this.ready = Promise.resolve(new MockServiceWorkerRegistration());
    this.oncontrollerchange = null;
    this.onmessage = null;
    this.onmessageerror = null;
  }

  async register(_scriptURL: string, _options?: RegistrationOptions) {
    return new MockServiceWorkerRegistration();
  }

  async getRegistration(_clientURL?: string) {
    return new MockServiceWorkerRegistration();
  }

  async getRegistrations() {
    return [new MockServiceWorkerRegistration()];
  }

  startMessages() {}
}

// Mock Notification API
export class MockNotification {
  static permission: 'default' | 'denied' | 'granted' = 'granted';

  static async requestPermission() {
    return MockNotification.permission;
  }

  static async get(_tag: string) {
    return null;
  }

  static async getNotifications() {
    return [];
  }

  constructor(_title: string, _options?: unknown) {
    // Constructor implementation
  }

  close() {}

  addEventListener(_type: string, _listener: EventListener) {}

  removeEventListener(_type: string, _listener: EventListener) {}

  dispatchEvent(_event: Event): boolean {
    return true;
  }
}

// Mock Push API
export class MockPushManager {
  supportedContentEncodings: string[];

  constructor() {
    this.supportedContentEncodings = ['aes128gcm'];
  }

  async subscribe(_options?: unknown) {
    return {
      endpoint: 'https://fcm.googleapis.com/fcm/send/example',
      expirationTime: null,
      options,
      getKey: (_name: string) => new Uint8Array([1, 2, 3, 4]),
      toJSON: () => ({
        endpoint: 'https://fcm.googleapis.com/fcm/send/example',
        keys: {
          auth: 'mock-auth-key',
          p256dh: 'mock-p256dh-key',
        },
      }),
    };
  }

  async getSubscription() {
    return null;
  }

  async permissionState(_options?: unknown) {
    return 'granted';
  }
}

// Setup global mocks
export function setupServiceWorkerMocks(): Promise<void> {
  Object.defineProperty(global, 'Notification', {
    value: MockNotification,
    writable: true,
  });

  Object.defineProperty(global.navigator, 'serviceWorker', {
    value: new MockServiceWorkerContainer(),
    writable: true,
  });
}

export default {
  MockServiceWorkerRegistration,
  MockServiceWorkerContainer,
  MockNotification,
  MockPushManager,
  setupServiceWorkerMocks,
};
