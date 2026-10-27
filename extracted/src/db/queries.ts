import "server-only";
import { unstable_cache } from "next/cache";
import { and, asc, eq, gte, ilike, isNull, lte, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { adhkar, adhkarCategories, advertisements, askNoorQa, reciters, surahs, tafsirs, verses } from "@/db/schema";
import { normalizeArabic } from "@/lib/arabic";

const DAY = 60 * 60 * 24;

/* ------------------------------ Quran ------------------------------ */

export type SurahListItem = {
  id: number;
  name: string;
  nameSimple: string;
  englishName: string;
  englishMeaning: string | null;
  revelation: string;
  ayahCount: number;
  juzStart: number | null;
};

export const getSurahs = unstable_cache(
  async (): Promise<SurahListItem[]> => {
    const allSurahs = await db.select().from(surahs).orderBy(asc(surahs.id));
    const firstVerses = await db
      .select({ surahId: verses.surahId, juz: verses.juz })
      .from(verses)
      .where(eq(verses.numberInSurah, 1));
    const juzMap = new Map(firstVerses.map((v) => [v.surahId, v.juz]));
    return allSurahs.map((s) => ({ ...s, juzStart: juzMap.get(s.id) ?? null }));
  },
  ["quran-surahs"],
  { revalidate: DAY * 7, tags: ["quran"] }
);

export const getSurahWithVerses = unstable_cache(
  async (id: number) => {
    const [surah] = await db.select().from(surahs).where(eq(surahs.id, id)).limit(1);
    if (!surah) return null;
    const surahVerses = await db
      .select({
        surahId: verses.surahId,
        numberInSurah: verses.numberInSurah,
        text: verses.text,
        juz: verses.juz,
        page: verses.page,
        sajda: verses.sajda,
      })
      .from(verses)
      .where(eq(verses.surahId, id))
      .orderBy(asc(verses.numberInSurah));
    return { surah, verses: surahVerses };
  },
  ["quran-surah-verses"],
  { revalidate: DAY * 7, tags: ["quran"] }
);

export const getBasmala = unstable_cache(
  async (): Promise<string> => {
    const [row] = await db
      .select({ text: verses.text })
      .from(verses)
      .where(sql`${verses.surahId} = 1 AND ${verses.numberInSurah} = 1`)
      .limit(1);
    return row?.text ?? "";
  },
  ["quran-basmala"],
  { revalidate: DAY * 7, tags: ["quran"] }
);

export type QuranSearchVerse = {
  surahId: number;
  numberInSurah: number;
  text: string;
  surahName: string;
};

export async function searchQuran(query: string, limit = 30) {
  const q = normalizeArabic(query);
  if (q.length < 2) return { surahs: [] as SurahListItem[], verseHits: [] as QuranSearchVerse[], totalVerses: 0 };

  const allSurahs = await getSurahs();
  const surahHits = allSurahs.filter(
    (s) => s.nameSimple.includes(q) || s.englishName.toLowerCase().includes(q.toLowerCase())
  );

  const pattern = `%${q.replace(/[%_]/g, "")}%`;
  const verseHits = await db
    .select({
      surahId: verses.surahId,
      numberInSurah: verses.numberInSurah,
      text: verses.text,
      surahName: surahs.name,
    })
    .from(verses)
    .innerJoin(surahs, eq(verses.surahId, surahs.id))
    .where(ilike(verses.textNormalized, pattern))
    .orderBy(asc(verses.surahId), asc(verses.numberInSurah))
    .limit(limit);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(verses)
    .where(ilike(verses.textNormalized, pattern));

  return { surahs: surahHits, verseHits, totalVerses: count };
}

/* ------------------------------ Adhkar ------------------------------ */

export const getAdhkarCategories = unstable_cache(
  async () => {
    return await db
      .select({
        id: adhkarCategories.id,
        title: adhkarCategories.title,
        count: sql<number>`count(${adhkar.id})::int`,
      })
      .from(adhkarCategories)
      .leftJoin(
        adhkar,
        and(eq(adhkar.categoryId, adhkarCategories.id), eq(adhkar.isPublished, true))
      )
      .groupBy(adhkarCategories.id)
      .orderBy(asc(adhkarCategories.sortOrder));
  },
  ["adhkar-categories"],
  { revalidate: DAY, tags: ["adhkar"] }
);

export const getAdhkarByCategory = unstable_cache(
  async (categoryId: number) => {
    const [category] = await db
      .select()
      .from(adhkarCategories)
      .where(eq(adhkarCategories.id, categoryId))
      .limit(1);
    if (!category) return null;
    const items = await db
      .select({ id: adhkar.id, text: adhkar.text, repeat: adhkar.repeat, source: adhkar.source })
      .from(adhkar)
      .where(and(eq(adhkar.categoryId, categoryId), eq(adhkar.isPublished, true)))
      .orderBy(asc(adhkar.sortOrder));
    return { category, items };
  },
  ["adhkar-category-items"],
  { revalidate: DAY, tags: ["adhkar"] }
);

/* ------------------------------ Tafsir ------------------------------ */

export const getSurahTafsir = unstable_cache(
  async (surahId: number) => {
    return await db
      .select({
        numberInSurah: tafsirs.numberInSurah,
        text: tafsirs.text,
      })
      .from(tafsirs)
      .where(eq(tafsirs.surahId, surahId))
      .orderBy(asc(tafsirs.numberInSurah));
  },
  ["quran-surah-tafsir"],
  { revalidate: DAY * 7, tags: ["tafsir"] }
);

/* ----------------------------- Reciters ----------------------------- */

export type ReciterItem = {
  id: number;
  slug: string;
  name: string;
  nameEn: string;
  rewaya: string;
  style: string;
  serverUrl: string;
  surahCount: number;
  sortOrder: number;
};

export const getReciters = unstable_cache(
  async (): Promise<ReciterItem[]> => {
    return await db.select().from(reciters).orderBy(asc(reciters.sortOrder));
  },
  ["quran-reciters"],
  { revalidate: DAY * 7, tags: ["reciters"] }
);

/* ---------------------------- Ask Noor QA --------------------------- */

export type AskNoorItem = {
  id: number;
  category: string;
  question: string;
  answer: string;
  source: string;
  keywords: string;
  views: number;
};

export const getAskNoorCategories = unstable_cache(
  async (): Promise<string[]> => {
    const rows = await db
      .select({ category: askNoorQa.category })
      .from(askNoorQa)
      .groupBy(askNoorQa.category)
      .orderBy(asc(askNoorQa.category));
    return rows.map((r) => r.category);
  },
  ["ask-noor-categories"],
  { revalidate: DAY, tags: ["qa"] }
);

export async function searchAskNoor(query?: string, category?: string): Promise<AskNoorItem[]> {
  const whereConditions = [];
  if (category && category !== "الكل") {
    whereConditions.push(eq(askNoorQa.category, category));
  }
  if (query && query.trim().length > 1) {
    const norm = normalizeArabic(query);
    const pattern = `%${norm.replace(/[%_]/g, "")}%`;
    whereConditions.push(
      or(
        ilike(askNoorQa.questionNormalized, pattern),
        ilike(askNoorQa.keywords, `%${query.trim()}%`),
        ilike(askNoorQa.answer, `%${query.trim()}%`)
      )
    );
  }

  const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

  return await db
    .select({
      id: askNoorQa.id,
      category: askNoorQa.category,
      question: askNoorQa.question,
      answer: askNoorQa.answer,
      source: askNoorQa.source,
      keywords: askNoorQa.keywords,
      views: askNoorQa.views,
    })
    .from(askNoorQa)
    .where(whereClause)
    .orderBy(asc(askNoorQa.sortOrder), asc(askNoorQa.id));
}

/* --------------------------- Juz & Pages --------------------------- */

export type JuzMeta = {
  juz: number;
  surahId: number;
  surahName: string;
  ayahNumber: number;
  verseText: string;
};

export const getJuzList = unstable_cache(
  async (): Promise<JuzMeta[]> => {
    const rows = await db.execute(sql`
      SELECT DISTINCT ON (v.juz)
        v.juz,
        v.surah_id AS "surahId",
        s.name_simple AS "surahName",
        v.number_in_surah AS "ayahNumber",
        v.text AS "verseText"
      FROM verses v
      JOIN surahs s ON s.id = v.surah_id
      ORDER BY v.juz, v.surah_id, v.number_in_surah
    `);
    return rows.rows as unknown as JuzMeta[];
  },
  ["quran-juz-list"],
  { revalidate: DAY * 7, tags: ["quran"] }
);

/* --------------------------- Ads (public) --------------------------- */

export type PublicAd = {
  id: number;
  title: string;
  body: string;
  imageUrl: string;
  linkUrl: string;
  placement: string;
};

export const getActiveAds = unstable_cache(
  async (placement: string): Promise<PublicAd[]> => {
    const now = new Date();
    return await db
      .select({
        id: advertisements.id,
        title: advertisements.title,
        body: advertisements.body,
        imageUrl: advertisements.imageUrl,
        linkUrl: advertisements.linkUrl,
        placement: advertisements.placement,
      })
      .from(advertisements)
      .where(
        and(
          eq(advertisements.placement, placement),
          eq(advertisements.isActive, true),
          or(isNull(advertisements.startsAt), lte(advertisements.startsAt, now)),
          or(isNull(advertisements.endsAt), gte(advertisements.endsAt, now))
        )
      )
      .orderBy(asc(advertisements.sortOrder), asc(advertisements.id))
      .limit(2);
  },
  ["active-ads"],
  { revalidate: 300, tags: ["ads"] }
);
