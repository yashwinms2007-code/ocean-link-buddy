import { openDB, IDBPDatabase } from "idb";

export interface DBNotification {
  id: string;
  title: string;
  body: string;
  timestamp: number;
  type: "danger" | "warning" | "info" | "success";
  read: boolean;
  data?: any;
}

const DB_NAME = "mitra_notifications_db";
const STORE_NAME = "notifications";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<any>> | null = null;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: "id",
          });
          store.createIndex("timestamp", "timestamp");
        }
      },
    });
  }
  return dbPromise;
};

/**
 * Add a new notification to IndexedDB
 */
export const saveNotification = async (notif: Omit<DBNotification, "id" | "read" | "timestamp">) => {
  const db = await getDB();
  const newNotif: DBNotification = {
    ...notif,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    read: false,
  };
  await db.add(STORE_NAME, newNotif);
  return newNotif;
};

/**
 * Get all notifications sorted by timestamp (newest first)
 */
export const getAllNotifications = async (): Promise<DBNotification[]> => {
  const db = await getDB();
  const notifs = await db.getAllFromIndex(STORE_NAME, "timestamp");
  return notifs.reverse(); // Newest first
};

/**
 * Mark a notification as read
 */
export const markAsRead = async (id: string) => {
  const db = await getDB();
  const notif = await db.get(STORE_NAME, id);
  if (notif) {
    notif.read = true;
    await db.put(STORE_NAME, notif);
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsReadSync = async () => {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  const notifs = await store.getAll();
  for (const notif of notifs) {
    if (!notif.read) {
      notif.read = true;
      await store.put(notif);
    }
  }
  await tx.done;
};

/**
 * Delete a notification
 */
export const deleteNotification = async (id: string) => {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
};

/**
 * Clear old notifications (e.g., older than 30 days)
 */
export const clearOldNotifications = async (days = 30) => {
  const db = await getDB();
  const threshold = Date.now() - days * 24 * 60 * 60 * 1000;
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  const index = store.index("timestamp");
  let cursor = await index.openCursor(IDBKeyRange.upperBound(threshold));
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
};
