const CACHE_NAME = 'todo-webapp-cache-v1';
const URLS_TO_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Otwarto cache');
                return cache.addAll(URLS_TO_CACHE);
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
                          .map(cacheName => caches.delete(cacheName))
            );
        })
    );
});


self.addEventListener('fetch', event => {
    if (URLS_TO_CACHE.some(url => event.request.url.endsWith(url))) {
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    return response || fetch(event.request);
                })
        );
        return;
    }

    if (event.request.url.includes('/api/')) {
        event.respondWith(
            fetch(event.request).catch(() => {
            })
        );
        return;
    }

    event.respondWith(fetch(event.request));
});
