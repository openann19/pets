// PawfectMatch Service Worker
// Version: 1.0.0

const CACHE_NAME = 'pawfectmatch-v1';
const urlsToCache = [
  '/',
  '/offline.html',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/favicon.ico'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip API requests (let them go to network)
  if (event.request.url.includes('/api/')) return;
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response
          const responseToCache = response.clone();
          
          // Cache successful responses
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          
          return response;
        });
      })
      .catch(() => {
        // Return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push received');
  
  let data = {
    title: 'PawfectMatch',
    body: 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'notification',
    requireInteraction: false,
    data: {
      url: '/',
      timestamp: new Date().toISOString()
    }
  };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error('[ServiceWorker] Error parsing push data:', e);
    }
  }
  
  const options = {
    body: data.body || data.message,
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/badge-72x72.png',
    tag: data.tag || 'notification',
    requireInteraction: data.requireInteraction || false,
    data: data.data || { url: '/' },
    actions: data.actions || [],
    image: data.image,
    vibrate: data.vibrate || [200, 100, 200],
    sound: data.sound || '/notification.mp3',
    silent: data.silent || false,
    renotify: data.renotify || false,
    timestamp: data.timestamp || Date.now()
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification clicked');
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((windowClients) => {
      // Check if there's already a window/tab open
      for (let client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window if not found
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('[ServiceWorker] Notification closed', event.notification.tag);
  
  // Track notification dismissal
  if (event.notification.data?.trackingId) {
    fetch('/api/notifications/dismissed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        notificationId: event.notification.data.trackingId,
        timestamp: new Date().toISOString()
      })
    }).catch(err => console.error('[ServiceWorker] Error tracking dismissal:', err));
  }
});

// Background sync event (for offline message sending)
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background sync:', event.tag);
  
  if (event.tag === 'send-messages') {
    event.waitUntil(sendQueuedMessages());
  }
});

// Function to send queued messages when back online
async function sendQueuedMessages() {
  try {
    // Get queued messages from IndexedDB
    const db = await openDB();
    const tx = db.transaction('outbox', 'readwrite');
    const store = tx.objectStore('outbox');
    const messages = await store.getAll();
    
    for (const message of messages) {
      try {
        const response = await fetch('/api/chat/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${message.token}`
          },
          body: JSON.stringify(message.data)
        });
        
        if (response.ok) {
          // Remove from outbox on success
          await store.delete(message.id);
          
          // Notify the client
          const allClients = await clients.matchAll();
          allClients.forEach(client => {
            client.postMessage({
              type: 'message-sent',
              messageId: message.id
            });
          });
        }
      } catch (error) {
        console.error('[ServiceWorker] Error sending queued message:', error);
      }
    }
  } catch (error) {
    console.error('[ServiceWorker] Error in sendQueuedMessages:', error);
  }
}

// Helper function to open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PawfectMatchDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('outbox')) {
        db.createObjectStore('outbox', { keyPath: 'id' });
      }
    };
  });
}

// Message event - communicate with clients
self.addEventListener('message', (event) => {
  console.log('[ServiceWorker] Message received:', event.data);
  
  if (event.data.type === 'skip-waiting') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'queue-message') {
    // Queue message for background sync
    queueMessage(event.data.message);
  }
  
  if (event.data.type === 'check-updates') {
    checkForUpdates();
  }
});

// Queue message for offline sending
async function queueMessage(message) {
  try {
    const db = await openDB();
    const tx = db.transaction('outbox', 'readwrite');
    const store = tx.objectStore('outbox');
    
    await store.add({
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      data: message,
      timestamp: new Date().toISOString(),
      token: message.token // Store auth token with message
    });
    
    // Register background sync
    await self.registration.sync.register('send-messages');
    
    console.log('[ServiceWorker] Message queued for sync');
  } catch (error) {
    console.error('[ServiceWorker] Error queueing message:', error);
  }
}

// Check for app updates
async function checkForUpdates() {
  try {
    const response = await fetch('/api/version');
    const data = await response.json();
    
    if (data.version !== CACHE_NAME) {
      // New version available
      const allClients = await clients.matchAll();
      allClients.forEach(client => {
        client.postMessage({
          type: 'update-available',
          version: data.version
        });
      });
    }
  } catch (error) {
    console.error('[ServiceWorker] Error checking for updates:', error);
  }
}

// Periodic background sync (Chrome only)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-notifications') {
    event.waitUntil(checkNewNotifications());
  }
});

// Check for new notifications periodically
async function checkNewNotifications() {
  try {
    // Get stored auth token
    const cache = await caches.open(CACHE_NAME);
    const tokenResponse = await cache.match('auth-token');
    
    if (!tokenResponse) return;
    
    const token = await tokenResponse.text();
    
    const response = await fetch('/api/notifications/unread', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const notifications = await response.json();
      
      if (notifications.length > 0) {
        // Show notification for unread messages
        const options = {
          body: `You have ${notifications.length} unread notifications`,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          tag: 'unread-summary',
          data: {
            url: '/notifications'
          }
        };
        
        await self.registration.showNotification('PawfectMatch', options);
      }
    }
  } catch (error) {
    console.error('[ServiceWorker] Error checking notifications:', error);
  }
}

console.log('[ServiceWorker] Loaded successfully');