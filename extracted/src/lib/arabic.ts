/**
 * Arabic text utilities — pure functions, safe on server & client.
 * Used for Quran/adhkar search normalization (strips diacritics,
 * waqf marks and unifies letter forms). Never mutates stored text.
 */
export function normalizeArabic(input: string): string {
  return input
    .replace(/[ً-ٰـ]/g, "") // tashkeel + superscript alef + tatweel
    .replace(/[ؐ-ؕۖ-ۭ۞﴿﴾]/g, "") // waqf signs & ornate parens
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/\s+/g, " ")
    .trim();
}

/** Display ayah numbers with Arabic-Indic digits */
export function toArabicDigits(n: number | string): string {
  return String(n).replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
}

/** Remove tashkeel/marks ONLY — keeps ة ى ء أ letterforms for clean display */
export function stripDiacritics(input: string): string {
  return input
    .replace(/[ً-ٰـ]/g, "")
    .replace(/[ؐ-ؕۖ-ۭ۞]/g, "")
    .replace(/ٱ/g, "ا")
    .trim();
}

/**
 * Human-friendly surah name derived from the ornate DB name.
 * »سُورَةُ ٱلْفَاتِحَةِ« → »الفاتحة« (correct ة/ى/ء, no tashkeel)
 */
export function surahDisplayName(ornate: string): string {
  return stripDiacritics(ornate).replace(/^سورة\s*/, "").trim();
}

const AR_MONTHS: Record<string, string> = {
  "Muharram": "محرّم",
  "Safar": "صفر",
  "Rabi' al-awwal": "ربيع الأول",
  "Rabi' al-thani": "ربيع الآخر",
  "Jumada al-awwal": "جمادى الأولى",
  "Jumada al-thani": "جمادى الآخرة",
  "Rajab": "رجب",
  "Sha'ban": "شعبان",
  "Ramadan": "رمضان",
  "Shawwal": "شوّال",
  "Dhu al-Qi'dah": "ذو القعدة",
  "Dhu al-Hijjah": "ذو الحجّة",
};

export function hijriMonthAr(en: string): string {
  return AR_MONTHS[en] ?? en;
}
