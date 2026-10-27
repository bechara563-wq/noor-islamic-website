"use client";

/**
 * Noor Offline Storage Engine
 * Dexie-inspired IndexedDB wrapper for offline Quran, Adhkar, and Prayer Times.
 * Works seamlessly online/offline and auto-syncs when connection returns.
 */

export interface OfflineVerse {
  surahId: number;
  numberInSurah: number;
  text: string;
  juz: number;
  page: number;
  sajda: boolean;
}

export interface OfflineAdhkar {
  id: number;
  categoryId: number;
  text: string;
  repeat: number;
  source: string;
}

export interface OfflinePrayerTimes {
  cityName: string;
  date: string;
  timings: Record<string, string>;
  hijriDate: string;
}

const DB_NAME = "noor-offline-db";
const DB_VERSION = 1;
const STORE_VERSES = "quran_verses";
const STORE_ADHKAR = "adhkar_items";
const STORE_PRAYERS = "prayer_times_cache";

class NoorOfflineDB {
  private db: IDBDatabase | null = null;

  async open(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_VERSES)) {
          const store = db.createObjectStore(STORE_VERSES, { keyPath: ["surahId", "numberInSurah"] });
          store.createIndex("surahId", "surahId", { unique: false });
        }
        if (!db.objectStoreNames.contains(STORE_ADHKAR)) {
          const store = db.createObjectStore(STORE_ADHKAR, { keyPath: "id" });
          store.createIndex("categoryId", "categoryId", { unique: false });
        }
        if (!db.objectStoreNames.contains(STORE_PRAYERS)) {
          const store = db.createObjectStore(STORE_PRAYERS, { keyPath: "date" });
        }
      };
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };
    });
  }

  async saveVerses(verses: OfflineVerse[]): Promise<void> {
    const db = await this.open();
    const tx = db.transaction(STORE_VERSES, "readwrite");
    const store = tx.objectStore(STORE_VERSES);
    for (const v of verses) {
      store.put(v);
    }
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve();
    });
  }

  async getVerses(surahId: number): Promise<OfflineVerse[]> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_VERSES, "readonly");
      const store = tx.objectStore(STORE_VERSES);
      const index = store.index("surahId");
      const request = index.getAll(surahId);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async saveAdhkar(items: OfflineAdhkar[]): Promise<void> {
    const db = await this.open();
    const tx = db.transaction(STORE_ADHKAR, "readwrite");
    const store = tx.objectStore(STORE_ADHKAR);
    for (const item of items) {
      store.put(item);
    }
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve();
    });
  }

  async getAdhkarByCategory(categoryId: number): Promise<OfflineAdhkar[]> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_ADHKAR, "readonly");
      const store = tx.objectStore(STORE_ADHKAR);
      const index = store.index("categoryId");
      const request = index.getAll(categoryId);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async savePrayerTimes(entry: OfflinePrayerTimes): Promise<void> {
    const db = await this.open();
    const tx = db.transaction(STORE_PRAYERS, "readwrite");
    const store = tx.objectStore(STORE_PRAYERS);
    store.put(entry);
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve();
    });
  }

  async getPrayerTimes(date: string): Promise<OfflinePrayerTimes | null> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PRAYERS, "readonly");
      const store = tx.objectStore(STORE_PRAYERS);
      const request = store.get(date);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  get isOffline(): boolean {
    return typeof navigator !== "undefined" && !navigator.onLine;
  }

  onOnlineStatusChange(callback: (online: boolean) => void) {
    const handler = () => callback(navigator.onLine);
    window.addEventListener("online", handler);
    window.addEventListener("offline", handler);
    return () => {
      window.removeEventListener("online", handler);
      window.removeEventListener("offline", handler);
    };
  }
}

export const noorOffline = new NoorOfflineDB();
export default noorOffline;
