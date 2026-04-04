const CACHE_NAME = "mitra-v2-cache-v1";
const CACHE_TILES = "mitra-map-tiles-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/src/main.tsx",
  "/src/App.tsx",
  "/manifest.json",
  "/favicon.png"
];

// Install Event: Cache App Shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Caching app shell");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event: Cleanup old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[SW] Removing old cache", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Network-first for data, Cache-first for assets
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  const isTile = url.href.includes("basemaps.cartocdn.com") || url.href.includes("tiles.openseamap.org");

  if (isTile) {
    event.respondWith(
      caches.open(CACHE_TILES).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response) return response;
          return fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // Generic cache-first for other assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).catch(() => {
        if (event.request.mode === "navigate") {
          return caches.match("/");
        }
        return null;
      });
    })
  );
});
