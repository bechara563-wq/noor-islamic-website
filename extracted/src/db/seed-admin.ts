/**
 * Seed admin account + default settings (idempotent).
 * ADMIN_EMAIL is fixed by product owner; password comes from env ADMIN_PASSWORD.
 * Run: npx tsx src/db/seed-admin.ts
 */
import { config } from "dotenv";
config();

import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { admins, settings } from "./schema";

const ADMIN_EMAIL = "bechara563@gmail.com";

const DEFAULT_SETTINGS: Array<{ key: string; value: string; group: string }> = [
  // General
  { key: "site_name", value: "نور | Noor", group: "general" },
  { key: "site_tagline", value: "رفيقك اليومي إلى القرآن والذكر", group: "general" },
  {
    key: "site_description",
    value: "منصة إسلامية حديثة مجانية تجمع القرآن الكريم والأذكار ومواقيت الصلاة والقبلة والأدوات الإسلامية في مكان واحد.",
    group: "general",
  },
  { key: "maintenance_mode", value: "false", group: "general" },
  { key: "default_language", value: "ar", group: "general" },
  { key: "default_theme", value: "system", group: "appearance" },
  // Contact
  { key: "contact_email", value: ADMIN_EMAIL, group: "contact" },
  { key: "whatsapp_number", value: "", group: "contact" },
  { key: "whatsapp_message", value: "السلام عليكم، أريد التواصل مع إدارة نور.", group: "contact" },
  // Social
  { key: "social_twitter", value: "", group: "social" },
  { key: "social_instagram", value: "", group: "social" },
  { key: "social_youtube", value: "", group: "social" },
  // SEO
  { key: "seo_title", value: "نور | Noor — رفيقك اليومي إلى القرآن والذكر", group: "seo" },
  { key: "seo_description", value: "منصة إسلامية حديثة مجانية تجمع القرآن الكريم والأذكار ومواقيت الصلاة والقبلة في مكان واحد.", group: "seo" },
  { key: "seo_keywords", value: "القرآن الكريم,الأذكار,مواقيت الصلاة,القبلة,المسبحة,نور", group: "seo" },
  { key: "og_image", value: "/og.jpg", group: "seo" },
  // Attribution (Quran source)
  {
    key: "quran_source",
    value: "Tanzil Quran Text — Uthmani (tanzil.net)، عبر واجهة AlQuran Cloud. خط العرض: Amiri Quran (SIL OFL).",
    group: "general",
  },
];

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  const password = process.env.ADMIN_PASSWORD || "Noor-Admin-2026!";

  const hash = await bcrypt.hash(password, 12);
  await db
    .insert(admins)
    .values({ email: ADMIN_EMAIL, passwordHash: hash, name: "مشرف نور" })
    .onConflictDoUpdate({
      target: admins.email,
      set: { passwordHash: hash },
    });
  console.log(`✓ admin ready: ${ADMIN_EMAIL}`);

  for (const s of DEFAULT_SETTINGS) {
    await db
      .insert(settings)
      .values(s)
      .onConflictDoNothing({ target: settings.key });
  }
  console.log(`✓ settings ensured (${DEFAULT_SETTINGS.length} keys)`);

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
