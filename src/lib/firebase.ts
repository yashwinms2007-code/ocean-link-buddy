import { initializeApp, FirebaseApp } from "firebase/app";
import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Guard: only initialize if real credentials are provided
const isConfigured =
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== "YOUR_API_KEY" &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== "YOUR_PROJECT_ID";

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
  } catch (err) {
    console.warn("[Firebase] Initialization failed:", err);
  }
}

/**
 * Request permission and get FCM token
 */
export const requestForToken = async (): Promise<string | null> => {
  if (!messaging) {
    console.warn("[Firebase] Messaging not initialized — skipping FCM token request.");
    return null;
  }
  try {
    const currentToken = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });
    if (currentToken) {
      console.log("FCM Token acquired:", currentToken);
      localStorage.setItem("mitra_fcm_token", currentToken);
      return currentToken;
    } else {
      console.warn("No FCM registration token available.");
      return null;
    }
  } catch (err) {
    console.error("Error retrieving FCM token:", err);
    return null;
  }
};

/**
 * Listen for foreground messages
 */
export const onMessageListener = (): Promise<unknown> => {
  if (!messaging) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    onMessage(messaging!, (payload) => {
      console.log("Foreground message received:", payload);
      resolve(payload);
    });
  });
};

export { messaging };
