/**
 * Noor — database seed
 * Sources (all public & trusted):
 *  - Quran Uthmani text (Tanzil) via AlQuran Cloud API  https://api.alquran.cloud
 *  - Adhkar dataset from Hisn Al-Muslim book            github.com/rn0x/Adhkar-json
 *
 * Run: npx tsx src/db/seed.ts
 */
import { config } from "dotenv";
config();

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { normalizeArabic } from "../lib/arabic";
import { adhkar, adhkarCategories, surahs, verses } from "./schema";

const QURAN_URL = "https://api.alquran.cloud/v1/quran/quran-uthmani";
const ADHKAR_URL = "https://raw.githubusercontent.com/rn0x/Adhkar-json/main/adhkar.json";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

type QuranCloudAyah = {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  page: number;
  sajda: boolean | { id: number; recommended: boolean; obligatory: boolean };
};
type QuranCloudSurah = {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: "Meccan" | "Medinan";
  ayahs: QuranCloudAyah[];
};
type AdhkarCategory = {
  id: number;
  category: string;
  array: { id: number; text: string; count: number }[];
};

async function fetchJson<T>(url: string, label: string): Promise<T> {
  console.log(`→ fetching ${label}…`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${label}: HTTP ${res.status}`);
  return (await res.json()) as T;
}

function simpleSurahName(ornate: string): string {
  return normalizeArabic(ornate).replace(/^سورة\s*/, "");
}

async function main() {
  /* ------------------------------ Quran ------------------------------ */
  const quranRes = await fetchJson<{ data: { surahs: QuranCloudSurah[] } }>(QURAN_URL, "Quran (Uthmani/Tanzil)");
  const quranSurahs = quranRes.data.surahs;
  if (quranSurahs.length !== 114) throw new Error(`expected 114 surahs, got ${quranSurahs.length}`);

  console.log("→ clearing existing quran tables…");
  await db.delete(verses);
  await db.delete(surahs);

  console.log("→ inserting 114 surahs…");
  await db.insert(surahs).values(
    quranSurahs.map((s) => ({
      id: s.number,
      name: s.name,
      nameSimple: simpleSurahName(s.name),
      englishName: s.englishName,
      englishMeaning: s.englishNameTranslation,
      revelation: s.revelationType.toLowerCase(),
      ayahCount: s.ayahs.length,
    }))
  );

  console.log("→ inserting verses…");
  let totalVerses = 0;
  const CHUNK = 800;
  // AlQuran Cloud prepends the Basmala to ayah 1 of every surah (except 1 & 9).
  // We render a dedicated Basmala header instead, so remove the inline copy.
  const basmala = quranSurahs[0].ayahs[0].text.replace(/﻿/g, "");
  for (const s of quranSurahs) {
    const rows = s.ayahs.map((a) => {
      let text = a.text.replace(/﻿/g, "");
      if (s.number !== 1 && s.number !== 9 && a.numberInSurah === 1 && text.startsWith(basmala)) {
        text = text.slice(basmala.length).trim();
      }
      return {
        surahId: s.number,
        numberInSurah: a.numberInSurah,
        text,
        textNormalized: normalizeArabic(text),
        juz: a.juz,
        page: a.page,
        sajda: a.sajda !== false && !!a.sajda,
      };
    });
    totalVerses += rows.length;
    for (let i = 0; i < rows.length; i += CHUNK) {
      await db.insert(verses).values(rows.slice(i, i + CHUNK));
    }
  }
  console.log(`✓ inserted ${totalVerses} verses`);

  /* ------------------------------ Adhkar ----------------------------- */
  const adhkarData = await fetchJson<AdhkarCategory[]>(ADHKAR_URL, "Adhkar (Hisn Al-Muslim)");

  console.log("→ clearing existing adhkar tables…");
  await db.delete(adhkar);
  await db.delete(adhkarCategories);

  console.log(`→ inserting ${adhkarData.length} adhkar categories…`);
  await db.insert(adhkarCategories).values(
    adhkarData.map((c, i) => ({ id: c.id, title: c.category, sortOrder: i }))
  );

  let totalAdhkar = 0;
  for (const c of adhkarData) {
    const rows = c.array.map((a, i) => ({
      categoryId: c.id,
      text: a.text.trim(),
      repeat: Math.max(1, Number(a.count) || 1),
      source: "حصن المسلم — سعيد بن علي القحطاني",
      sortOrder: a.id ?? i,
    }));
    totalAdhkar += rows.length;
    if (rows.length) await db.insert(adhkar).values(rows);
  }
  console.log(`✓ inserted ${totalAdhkar} adhkar`);

  console.log("Seed complete.");
  await pool.end();
}

main().catch(async (err) => {
  console.error("Seed failed:", err);
  await pool.end();
  process.exit(1);
});
