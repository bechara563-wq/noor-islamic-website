import { boolean, index, integer, pgTable, serial, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/* ============================= القرآن الكريم ============================= */

export const surahs = pgTable("surahs", {
  /** 1..114 — canonical surah number */
  id: integer("id").primaryKey(),
  /** Ornate name with full tashkeel, e.g. سُورَةُ ٱلْفَاتِحَةِ */
  name: varchar("name", { length: 140 }).notNull(),
  /** Simple normalized name without "سورة", e.g. الفاتحة */
  nameSimple: varchar("name_simple", { length: 120 }).notNull(),
  englishName: varchar("english_name", { length: 120 }).notNull(),
  englishMeaning: varchar("english_meaning", { length: 160 }),
  /** 'meccan' | 'medinan' */
  revelation: varchar("revelation", { length: 10 }).notNull(),
  ayahCount: integer("ayah_count").notNull(),
});

export const verses = pgTable(
  "verses",
  {
    id: serial("id").primaryKey(),
    surahId: integer("surah_id")
      .notNull()
      .references(() => surahs.id, { onDelete: "cascade" }),
    numberInSurah: integer("number_in_surah").notNull(),
    /** Uthmani script text (Tanzil) — immutable source of truth */
    text: text("text").notNull(),
    /** Diacritic-free normalized form, used ONLY for search */
    textNormalized: text("text_normalized").notNull(),
    juz: integer("juz").notNull(),
    page: integer("page").notNull(),
    sajda: boolean("sajda").notNull().default(false),
  },
  (t) => [
    uniqueIndex("verses_surah_num_uniq").on(t.surahId, t.numberInSurah),
    index("verses_normalized_idx").on(t.textNormalized),
    index("verses_juz_idx").on(t.juz),
  ]
);

/* ================================ الأذكار ================================ */

export const adhkarCategories = pgTable("adhkar_categories", {
  /** dataset chapter id (Hisn Al-Muslim ordering) */
  id: integer("id").primaryKey(),
  title: varchar("title", { length: 180 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const adhkar = pgTable(
  "adhkar",
  {
    id: serial("id").primaryKey(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => adhkarCategories.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    /** repetition count from the source book */
    repeat: integer("repeat").notNull().default(1),
    source: varchar("source", { length: 220 }).notNull().default("حصن المسلم"),
    sortOrder: integer("sort_order").notNull().default(0),
    /** نشر/إخفاء من لوحة الإدارة */
    isPublished: boolean("is_published").notNull().default(true),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("adhkar_category_idx").on(t.categoryId)]
);

/* ============================== Relations =============================== */

export const surahsRelations = relations(surahs, ({ many }) => ({
  verses: many(verses),
}));

export const versesRelations = relations(verses, ({ one }) => ({
  surah: one(surahs, { fields: [verses.surahId], references: [surahs.id] }),
}));

export const adhkarCategoriesRelations = relations(adhkarCategories, ({ many }) => ({
  items: many(adhkar),
}));

export const adhkarRelations = relations(adhkar, ({ one }) => ({
  category: one(adhkarCategories, {
    fields: [adhkar.categoryId],
    references: [adhkarCategories.id],
  }),
}));

/* ======================= المرحلة 4: نظام الإدارة ======================= */

export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 120 }).notNull().default("مشرف نور"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
});

export const ADMIN_ACTIONS = ["CREATE", "UPDATE", "DELETE", "LOGIN", "STATUS"] as const;

export const adminAuditLogs = pgTable(
  "admin_audit_logs",
  {
    id: serial("id").primaryKey(),
    adminId: integer("admin_id").references(() => admins.id, { onDelete: "set null" }),
    adminEmail: varchar("admin_email", { length: 255 }).notNull(),
    action: varchar("action", { length: 24 }).notNull(),
    entity: varchar("entity", { length: 60 }).notNull(),
    entityId: varchar("entity_id", { length: 80 }),
    details: text("details"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("audit_created_idx").on(t.createdAt)]
);

/** مركز إعدادات الموقع — key/value بدل الحقول المبعثرة في الكود */
export const settings = pgTable("settings", {
  key: varchar("key", { length: 80 }).primaryKey(),
  value: text("value").notNull().default(""),
  group: varchar("group", { length: 40 }).notNull().default("general"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const MESSAGE_STATUSES = ["NEW", "READ", "REPLIED", "ARCHIVED"] as const;
export type MessageStatus = (typeof MESSAGE_STATUSES)[number];

export const contactMessages = pgTable(
  "contact_messages",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    message: text("message").notNull(),
    status: varchar("status", { length: 16 }).notNull().default("NEW"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("messages_status_idx").on(t.status), index("messages_created_idx").on(t.createdAt)]
);

export const AD_PLACEMENTS = ["homepage", "tools", "content", "footer"] as const;
export type AdPlacement = (typeof AD_PLACEMENTS)[number];

export const advertisements = pgTable(
  "advertisements",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 180 }).notNull(),
    body: text("body").notNull().default(""),
    imageUrl: text("image_url").notNull().default(""),
    linkUrl: text("link_url").notNull().default(""),
    placement: varchar("placement", { length: 20 }).notNull().default("homepage"),
    isActive: boolean("is_active").notNull().default(false),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("ads_placement_idx").on(t.placement)]
);

export const AD_EVENT_TYPES = ["impression", "click"] as const;
export type AdEventType = (typeof AD_EVENT_TYPES)[number];

export const adEvents = pgTable(
  "ad_events",
  {
    id: serial("id").primaryKey(),
    adId: integer("ad_id")
      .notNull()
      .references(() => advertisements.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 12 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("ad_events_ad_idx").on(t.adId), index("ad_events_type_idx").on(t.type)]
);

/* ------------------------- relations (المرحلة 4) ------------------------- */

export const adminsRelations = relations(admins, ({ many }) => ({
  auditLogs: many(adminAuditLogs),
}));

export const adminAuditLogsRelations = relations(adminAuditLogs, ({ one }) => ({
  admin: one(admins, { fields: [adminAuditLogs.adminId], references: [admins.id] }),
}));

export const advertisementsRelations = relations(advertisements, ({ many }) => ({
  events: many(adEvents),
}));

export const adEventsRelations = relations(adEvents, ({ one }) => ({
  ad: one(advertisements, { fields: [adEvents.adId], references: [advertisements.id] }),
}));

/* ==================== المرحلة المتقدمة: التفسير والتلاوات واسأل نور ==================== */

export const tafsirs = pgTable(
  "tafsirs",
  {
    id: serial("id").primaryKey(),
    surahId: integer("surah_id").notNull().references(() => surahs.id, { onDelete: "cascade" }),
    numberInSurah: integer("number_in_surah").notNull(),
    text: text("text").notNull(),
  },
  (t) => [
    uniqueIndex("tafsirs_surah_num_uniq").on(t.surahId, t.numberInSurah),
    index("tafsirs_surah_idx").on(t.surahId),
  ]
);

export const reciters = pgTable("reciters", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  nameEn: varchar("name_en", { length: 160 }).notNull(),
  rewaya: varchar("rewaya", { length: 160 }).notNull().default("حفص عن عاصم"),
  style: varchar("style", { length: 80 }).notNull().default("مرتل"),
  serverUrl: text("server_url").notNull(),
  surahCount: integer("surah_count").notNull().default(114),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const askNoorQa = pgTable(
  "ask_noor_qa",
  {
    id: serial("id").primaryKey(),
    category: varchar("category", { length: 100 }).notNull(),
    question: text("question").notNull(),
    questionNormalized: text("question_normalized").notNull(),
    answer: text("answer").notNull(),
    source: varchar("source", { length: 255 }).notNull(),
    keywords: text("keywords").notNull().default(""),
    views: integer("views").notNull().default(0),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [
    index("qa_cat_idx").on(t.category),
    index("qa_norm_idx").on(t.questionNormalized),
  ]
);

export const tafsirsRelations = relations(tafsirs, ({ one }) => ({
  surah: one(surahs, { fields: [tafsirs.surahId], references: [surahs.id] }),
}));

/* =================== Google AdSense (BOOـLEAN حقيقي) =================== */

export const adsenseSettings = pgTable("adsense_settings", {
  /** صف وحيد ثابت id = 1 */
  id: integer("id").primaryKey().default(1),
  /** boolean حقيقي — ON/OFF */
  enabled: boolean("enabled").notNull().default(false),
  clientId: varchar("client_id", { length: 100 }).notNull().default(""),
  metaTag: text("meta_tag").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
