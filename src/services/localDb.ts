import { openDB, IDBPDatabase } from "idb";
import { SOSSignal } from "./sosService"; // We'll move the interface here or import it.

const DB_NAME = "mitra_local_db";
const STORE_PROFILES = "profiles";
const STORE_ALERTS = "sos_alerts";
const DB_VERSION = 1;

interface UserProfile {
  id: string; // The email acts as ID or we generate a UUID
  email: string;
  full_name?: string;
  vessel_name?: string;
  phone_number?: string;
}

let dbPromise: Promise<IDBPDatabase<any>> | null = null;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_PROFILES)) {
          db.createObjectStore(STORE_PROFILES, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(STORE_ALERTS)) {
          const store = db.createObjectStore(STORE_ALERTS, { keyPath: "id" });
          store.createIndex("timestamp", "timestamp");
        }
      },
    });
  }
  return dbPromise;
};

// ─── Profiles ────────────────────────────────────────────────────────
export const getProfile = async (id: string): Promise<UserProfile | undefined> => {
  const db = await getDB();
  return db.get(STORE_PROFILES, id);
};

export const saveProfile = async (profile: UserProfile): Promise<void> => {
  const db = await getDB();
  await db.put(STORE_PROFILES, profile);
};

// ─── Session Management ───────────────────────────────────────────────
export const getLocalSession = () => {
  const sessionUser = localStorage.getItem("mitra-user");
  return sessionUser ? JSON.parse(sessionUser) : null;
};

export const setLocalSession = (user: UserProfile) => {
  localStorage.setItem("mitra-user", JSON.stringify(user));
};

export const clearLocalSession = () => {
  localStorage.removeItem("mitra-user");
};

// ─── Alerts ───────────────────────────────────────────────────────────
export const saveAlert = async (alert: any): Promise<void> => {
  const db = await getDB();
  await db.put(STORE_ALERTS, alert);
};

export const getAlerts = async (): Promise<any[]> => {
  const db = await getDB();
  const alerts = await db.getAllFromIndex(STORE_ALERTS, "timestamp");
  return alerts.reverse(); // Newest first
};
