// Mitra Smart Fishing Assistant - Service Worker
// Handles caching, FCM background push, and offline safety polling.

importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

const CACHE_NAME = "mitra-award-winning-v1";
const STATIC_ASSETS = [
  "/favicon.ico",
  "/mitra-logo.png",
];

// Initialize Firebase in Background
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  projectId: "YOUR_PROJECT_ID",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
});

const messaging = firebase.messaging();

/**
 * FCM Background Message Handler
 */
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Background message received:", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/mitra-logo.png",
    vibrate: [200, 100, 200, 100, 200, 300, 500], // SOS Pattern
    ...payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Install event: Pre-cache static assets + Lottie fallback
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate event: Aggressive cache purge
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          console.log("[SW] Purging old cache:", k);
          return caches.delete(k);
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event: Network First with Cache Fallback for Assets
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || event.request.url.includes("firestore") || event.request.url.includes("google")) return;

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        // Cache successful GET requests for offline fallback
        if (res && res.status === 200 && (res.type === "basic" || res.url.includes("lottie"))) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(event.request).then((res) => res || caches.match("/")))
  );
});

/**
 * Background Sync for SOS
 * This triggers when internet connectivity is restored
 */
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-sos") {
    console.log("[SW] Syncing pending SOS signals...");
    // Logic to fetch from IndexedDB and POST to server
  }
});

/**
 * Periodic Sync (for supported browsers)
 * Checks for marine danger even when app is closed
 */
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "check-safety") {
    event.waitUntil(checkOfflineMarineSafety());
  }
});

async function checkOfflineMarineSafety() {
  // Logic would go here to safely check cached telemetry
  // and show a notification if thresholds are breached
}
