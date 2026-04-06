import { openDB, IDBPDatabase } from "idb";

export interface FishListing {
  id: string;
  species: string;
  price: number;        // ₹ per kg
  quantity: number;     // kg available
  location: string;     // human readable
  lat: number;
  lon: number;
  sellerName: string;
  sellerPhone: string;
  category: "Fish" | "Prawn" | "Crab" | "Squid" | "Lobster" | "Other";
  description?: string;
  freshness: number;    // 0-100%
  timestamp: number;
  isDemo?: boolean;     // seeded demo data
}

export interface DeliveryRequest {
  id: string;
  listingId: string;
  species: string;
  quantity: number;
  totalPrice: number;
  deliveryFee: number;
  distance: number;
  customerPhone: string;
  customerAddress: string;
  status: "pending" | "confirmed" | "delivered";
  timestamp: number;
}

const DB_NAME = "mitra_market_db";
const STORE_NAME = "listings";
const DELIVERY_STORE = "delivery_requests";
const DB_VERSION = 3;

let dbPromise: Promise<IDBPDatabase<any>> | null = null;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
          store.createIndex("timestamp", "timestamp");
          store.createIndex("species", "species");
        }
        if (!db.objectStoreNames.contains(DELIVERY_STORE)) {
          const deliveryStore = db.createObjectStore(DELIVERY_STORE, { keyPath: "id" });
          deliveryStore.createIndex("timestamp", "timestamp");
          deliveryStore.createIndex("status", "status");
        }
      },
    });
  }
  return dbPromise;
};

export const saveListing = async (listing: Omit<FishListing, "id" | "timestamp">) => {
  const db = await getDB();
  const newListing: FishListing = {
    ...listing,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  await db.add(STORE_NAME, newListing);
  window.dispatchEvent(new Event("mitra-market-change"));
  return newListing;
};

export const saveDeliveryRequest = async (request: Omit<DeliveryRequest, "id" | "timestamp" | "status">) => {
  const db = await getDB();
  const newRequest: DeliveryRequest = {
    ...request,
    id: crypto.randomUUID(),
    status: "pending",
    timestamp: Date.now(),
  };
  await db.add(DELIVERY_STORE, newRequest);
  window.dispatchEvent(new Event("mitra-delivery-change"));
  return newRequest;
};

export const getAllDeliveryRequests = async (): Promise<DeliveryRequest[]> => {
  const db = await getDB();
  const requests = await db.getAllFromIndex(DELIVERY_STORE, "timestamp");
  return requests.reverse();
};

export const getAllListings = async (): Promise<FishListing[]> => {
  const db = await getDB();
  const listings = await db.getAllFromIndex(STORE_NAME, "timestamp");
  return listings.reverse();
};

export const deleteListing = async (id: string) => {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
  window.dispatchEvent(new Event("mitra-market-change"));
};

export const seedDemoListings = async () => {
  const db = await getDB();
  const existing = await db.getAllFromIndex(STORE_NAME, "timestamp");
  if (existing.length > 0) return; // Only seed if empty

  const demos: FishListing[] = [
    {
      id: "demo-1",
      species: "Mackerel (Bangda)",
      price: 180,
      quantity: 45,
      location: "Mangalore Fish Harbour",
      lat: 12.872,
      lon: 74.842,
      sellerName: "Rajan Kumar",
      sellerPhone: "+919876543210",
      category: "Fish",
      description: "Fresh catch, landed this morning. Grade A quality.",
      freshness: 97,
      timestamp: Date.now() - 1 * 60 * 60 * 1000,
      isDemo: true,
    },
    {
      id: "demo-2",
      species: "Tiger Prawn",
      price: 650,
      quantity: 20,
      location: "Udupi Malpe Port",
      lat: 13.351,
      lon: 74.703,
      sellerName: "Suresh Naik",
      sellerPhone: "+919765432109",
      category: "Prawn",
      description: "Wild-caught tiger prawns. 20-25 count size.",
      freshness: 95,
      timestamp: Date.now() - 2 * 60 * 60 * 1000,
      isDemo: true,
    },
    {
      id: "demo-3",
      species: "Mud Crab",
      price: 900,
      quantity: 10,
      location: "Kasargod Bekal Port",
      lat: 12.378,
      lon: 75.003,
      sellerName: "Ajith Fernandez",
      sellerPhone: "+918765432108",
      category: "Crab",
      description: "Live mud crabs. Minimum order 2kg. Export quality.",
      freshness: 99,
      timestamp: Date.now() - 30 * 60 * 1000,
      isDemo: true,
    },
    {
      id: "demo-4",
      species: "Indian Squid",
      price: 320,
      quantity: 30,
      location: "Karwar Port",
      lat: 14.811,
      lon: 74.129,
      sellerName: "Narayan Hegde",
      sellerPhone: "+917654321098",
      category: "Squid",
      description: "Cleaned and flash-frozen squid rings available.",
      freshness: 88,
      timestamp: Date.now() - 4 * 60 * 60 * 1000,
      isDemo: true,
    },
    {
      id: "demo-5",
      species: "Pomfret (Paplet)",
      price: 850,
      quantity: 8,
      location: "Mangalore New Port",
      lat: 12.9,
      lon: 74.86,
      sellerName: "David Pinto",
      sellerPhone: "+916543210987",
      category: "Fish",
      description: "Silver Pomfret — premium grade. Limited quantity.",
      freshness: 96,
      timestamp: Date.now() - 45 * 60 * 1000,
      isDemo: true,
    },
  ];

  for (const demo of demos) {
    await db.put(STORE_NAME, demo);
  }
};
