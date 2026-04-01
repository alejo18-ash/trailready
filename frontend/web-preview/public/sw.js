const CACHE_NAME = 'trailready-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
];

function isImmutableStatic(url) {
  const p = url.pathname;
  if (p === '/manifest.json' || p.endsWith('/manifest.json')) return true;
  if (p.startsWith('/icons/')) return true;
  if (p === '/favicon.svg' || p === '/icons.svg') return true;
  return false;
}

function isAssetPath(url) {
  return url.pathname.startsWith('/assets/');
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (e) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw e;
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (isImmutableStatic(url)) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  if (isAssetPath(url)) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith(networkFirst(event.request));
});
