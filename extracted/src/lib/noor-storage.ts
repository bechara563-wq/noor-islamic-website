"use client";

/**
 * Noor local storage layer — single source of truth for anonymous user data.
 * Shapes are versioned so they can later be synced to PostgreSQL
 * (favorites / reading_progress tables) once auth exists, without migration pain.
 */

export type LastReading = {
  v: 1;
  surahId: number;
  surahName: string;
  ayah: number;
  at: number; // epoch ms
};

export type FavoriteVerse = { surahId: number; ayah: number; surahName: string };

export type TasbeehState = {
  v: 1;
  count: number;
  total: number;
  phraseIndex: number;
  goal: number;
};

const KEYS = {
  lastReading: "noor:last-reading",
  favSurahs: "noor:fav:surahs",
  favVerses: "noor:fav:verses",
  fontScale: "noor:quran:font-scale",
  tasbeeh: "noor:tasbeeh",
  prayerCity: "noor:prayer:city",
  prayerMethod: "noor:prayer:method",
} as const;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event("noor:store"));
  } catch {
    /* private mode / quota — fail silently */
  }
}

/* ------------------------- Reading position ------------------------- */

export const getLastReading = () => read<LastReading | null>(KEYS.lastReading, null);

export function setLastReading(p: { surahId: number; surahName: string; ayah: number }) {
  const value: LastReading = { v: 1, ...p, at: Date.now() };
  write(KEYS.lastReading, value);
  return value;
}

/* ---------------------------- Favorites ----------------------------- */

export const getFavoriteSurahs = () => read<number[]>(KEYS.favSurahs, []);

export function toggleFavoriteSurah(id: number): boolean {
  const list = getFavoriteSurahs();
  const next = list.includes(id) ? list.filter((s) => s !== id) : [...list, id];
  write(KEYS.favSurahs, next);
  return next.includes(id);
}

export const getFavoriteVerses = () => read<FavoriteVerse[]>(KEYS.favVerses, []);

export function toggleFavoriteVerse(verse: FavoriteVerse): boolean {
  const list = getFavoriteVerses();
  const exists = list.some((f) => f.surahId === verse.surahId && f.ayah === verse.ayah);
  const next = exists
    ? list.filter((f) => !(f.surahId === verse.surahId && f.ayah === verse.ayah))
    : [...list, verse];
  write(KEYS.favVerses, next);
  return !exists;
}

/* --------------------------- Quran font ----------------------------- */

export const getFontScale = () => read<number>(KEYS.fontScale, 2);
export const setFontScale = (i: number) => write(KEYS.fontScale, i);

/* ----------------------------- Tasbeeh ------------------------------ */

export const getTasbeeh = () =>
  read<TasbeehState>(KEYS.tasbeeh, { v: 1, count: 0, total: 0, phraseIndex: 0, goal: 33 });
export const setTasbeeh = (s: TasbeehState) => write(KEYS.tasbeeh, s);

/* ------------------------------ Prayer ------------------------------ */

export type SavedCity = { name: string; lat: number; lng: number };
export const getPrayerCity = () => read<SavedCity | null>(KEYS.prayerCity, null);
export const setPrayerCity = (c: SavedCity | null) => {
  if (c) write(KEYS.prayerCity, c);
  else {
    try {
      window.localStorage.removeItem(KEYS.prayerCity);
      window.dispatchEvent(new Event("noor:store"));
    } catch {}
  }
};
export const getPrayerMethod = () => read<number>(KEYS.prayerMethod, 4);
export const setPrayerMethod = (m: number) => write(KEYS.prayerMethod, m);

/** Re-read storage across components whenever any part of the app writes */
export function subscribeNoorStore(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("noor:store", cb);
  return () => window.removeEventListener("noor:store", cb);
}
