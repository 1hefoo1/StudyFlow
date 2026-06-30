// StudyFlow Service Worker for offline functionality
const CACHE_NAME = 'studyflow-v1.0.0';
const STATIC_CACHE = 'studyflow-static-v1';
const DYNAMIC_CACHE = 'studyflow-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/reset.css',
    '/css/variables.css',
    '/css/themes.css',
    '/css/layout.css',
    '/css/sidebar.css',
    '/css/dashboard.css',
    '/css/components.css',
    '/css/animations.css',
    '/css/responsive.css',
    '/js/app.js',
    '/js/router.js',
    '/js/database.js',
    '/js/core/storage.js',
    '/js/utils/date.js',
    '/js/utils/dom.js',
    '/js/utils/helpers.js',
    '/js/ui/modal.js',
    '/js/ui/toast.js',
    '/js/ui/commandPalette.js',
    '/js/pages/dashboard.js',
    '/js/pages/notes.js',
    '/js/pages/tasks.js',
    '/js/pages/calendar.js',
    '/js/pages/focus.js',
    '/js/pages/flashcards.js',
    '/js/pages/settings.js',
    '/js/modules/notes.js',
    '/js/modules/tasks.js',
    '/js/modules/calendar.js',
    '/js/modules/focus.js',
    '/js/modules/flashcards.js',
    '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('Static assets cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Error caching static assets:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => {
                            return cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE;
                        })
                        .map((cacheName) => {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => {
                console.log('Service worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip external requests
    if (!url.origin.includes(self.location.origin) && !url.href.includes('fonts.googleapis.com') && !url.href.includes('fonts.gstatic.com')) {
        return;
    }

    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // Return cached version
                    return cachedResponse;
                }

                // Fetch from network
                return fetch(request)
                    .then((response) => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        // Cache the response
                        caches.open(DYNAMIC_CACHE)
                            .then((cache) => {
                                cache.put(request, responseToCache);
                            });

                        return response;
                    })
                    .catch((error) => {
                        console.error('Fetch failed:', error);
                        
                        // Return offline page for navigation requests
                        if (request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                        
                        throw error;
                    });
            })
    );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

// Push notifications
self.addEventListener('push', (event) => {
    if (!event.data) {
        return;
    }

    const data = event.data.json();
    const options = {
        body: data.body || 'New notification',
        icon: '/assets/images/icon-192.png',
        badge: '/assets/images/icon-192.png',
        vibrate: [100, 50, 100],
        data: data.data || {},
        actions: data.actions || []
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'StudyFlow', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window' })
            .then((clientList) => {
                // If a window is already open, focus it
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Otherwise, open a new window
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
    );
});

// Sync data function
async function syncData() {
    try {
        // This would sync data with a server when online
        console.log('Syncing data...');
        
        // Get all clients
        const clients = await self.clients.matchAll();
        
        // Notify clients to sync
        clients.forEach(client => {
            client.postMessage({ type: 'SYNC_DATA' });
        });
    } catch (error) {
        console.error('Sync failed:', error);
    }
}

// Message handler
self.addEventListener('message', (event) => {
    const { type, data } = event.data;

    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'CACHE_URLS':
            caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                    return cache.addAll(data.urls);
                });
            break;
            
        case 'CLEAR_CACHE':
            caches.delete(data.cacheName);
            break;
            
        default:
            break;
    }
});

// Periodic background sync
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'periodic-backup') {
        event.waitUntil(createBackup());
    }
});

// Create backup function
async function createBackup() {
    try {
        console.log('Creating backup...');
        
        // Notify the app to create a backup
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({ type: 'CREATE_BACKUP' });
        });
    } catch (error) {
        console.error('Backup failed:', error);
    }
}

// Handle app updates
self.addEventListener('appinstalled', (event) => {
    console.log('StudyFlow installed successfully');
    
    // Notify the app
    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage({ type: 'APP_INSTALLED' });
        });
    });
});

// Log service worker lifecycle
console.log('Service Worker registered');