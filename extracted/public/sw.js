/* Noor PWA Service Worker — Offline support for Quran, Adhkar, and Prayer Times */
const PRECACHE_NAME = 'noor-precache-v2';
const RUNTIME_NAME = 'noor-runtime-v2';

const PRECACHE_URLS = [
  '/',
  '/quran',
  '/adhkar',
  '/prayer-times',
  '/tasbeeh',
  '/library',
  '/tools',
  '/settings',
  '/search',
  '/ask',
  '/contact',
  '/about',
  '/privacy',
  '/icon.svg',
  '/og.jpg',
  '/manifest.webmanifest',
  '/sw-register.js'
];

// Cache API responses for Quran text, surahs, and prayer times
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PRECACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names.map((name) => {
          if (name !== PRECACHE_NAME && name !== RUNTIME_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Strategy: Network first for HTML, Cache first for assets, Stale-While-Revalidate for API
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API endpoints: Quran surah data, prayer times, adhkar lists
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache successful GET requests
          if (request.method === 'GET' && response.status === 200) {
            const clone = response.clone();
            caches.open(RUNTIME_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Static assets and images
  if (request.destination === 'image' || request.destination === 'font' || request.destination === 'script' || request.destination === 'style') {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(RUNTIME_NAME).then((cache) => cache.put(request, clone));
          return response;
        });
      })
    );
    return;
  }

  // HTML pages and navigation
  if (request.mode === 'navigate' || (request.method === 'GET' && request.headers.get('accept')?.includes('text/html'))) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(RUNTIME_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match('/'))
    );
    return;
  }

  // Everything else: cache first
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});
