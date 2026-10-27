CREATE TABLE "ad_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"ad_id" integer NOT NULL,
	"type" varchar(12) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "adhkar" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"text" text NOT NULL,
	"repeat" integer DEFAULT 1 NOT NULL,
	"source" varchar(220) DEFAULT 'حصن المسلم' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "adhkar_categories" (
	"id" integer PRIMARY KEY NOT NULL,
	"title" varchar(180) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"admin_id" integer,
	"admin_email" varchar(255) NOT NULL,
	"action" varchar(24) NOT NULL,
	"entity" varchar(60) NOT NULL,
	"entity_id" varchar(80),
	"details" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admins" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"name" varchar(120) DEFAULT 'مشرف نور' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login_at" timestamp with time zone,
	CONSTRAINT "admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "adsense_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"client_id" varchar(100) DEFAULT '' NOT NULL,
	"meta_tag" text DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "advertisements" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(180) NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"image_url" text DEFAULT '' NOT NULL,
	"link_url" text DEFAULT '' NOT NULL,
	"placement" varchar(20) DEFAULT 'homepage' NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ask_noor_qa" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" varchar(100) NOT NULL,
	"question" text NOT NULL,
	"question_normalized" text NOT NULL,
	"answer" text NOT NULL,
	"source" varchar(255) NOT NULL,
	"keywords" text DEFAULT '' NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"email" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"status" varchar(16) DEFAULT 'NEW' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reciters" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(80) NOT NULL,
	"name" varchar(160) NOT NULL,
	"name_en" varchar(160) NOT NULL,
	"rewaya" varchar(160) DEFAULT 'حفص عن عاصم' NOT NULL,
	"style" varchar(80) DEFAULT 'مرتل' NOT NULL,
	"server_url" text NOT NULL,
	"surah_count" integer DEFAULT 114 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "reciters_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" varchar(80) PRIMARY KEY NOT NULL,
	"value" text DEFAULT '' NOT NULL,
	"group" varchar(40) DEFAULT 'general' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "surahs" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" varchar(140) NOT NULL,
	"name_simple" varchar(120) NOT NULL,
	"english_name" varchar(120) NOT NULL,
	"english_meaning" varchar(160),
	"revelation" varchar(10) NOT NULL,
	"ayah_count" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tafsirs" (
	"id" serial PRIMARY KEY NOT NULL,
	"surah_id" integer NOT NULL,
	"number_in_surah" integer NOT NULL,
	"text" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verses" (
	"id" serial PRIMARY KEY NOT NULL,
	"surah_id" integer NOT NULL,
	"number_in_surah" integer NOT NULL,
	"text" text NOT NULL,
	"text_normalized" text NOT NULL,
	"juz" integer NOT NULL,
	"page" integer NOT NULL,
	"sajda" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ad_events" ADD CONSTRAINT "ad_events_ad_id_advertisements_id_fk" FOREIGN KEY ("ad_id") REFERENCES "public"."advertisements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adhkar" ADD CONSTRAINT "adhkar_category_id_adhkar_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."adhkar_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_admin_id_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tafsirs" ADD CONSTRAINT "tafsirs_surah_id_surahs_id_fk" FOREIGN KEY ("surah_id") REFERENCES "public"."surahs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verses" ADD CONSTRAINT "verses_surah_id_surahs_id_fk" FOREIGN KEY ("surah_id") REFERENCES "public"."surahs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ad_events_ad_idx" ON "ad_events" USING btree ("ad_id");--> statement-breakpoint
CREATE INDEX "ad_events_type_idx" ON "ad_events" USING btree ("type");--> statement-breakpoint
CREATE INDEX "adhkar_category_idx" ON "adhkar" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "audit_created_idx" ON "admin_audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ads_placement_idx" ON "advertisements" USING btree ("placement");--> statement-breakpoint
CREATE INDEX "qa_cat_idx" ON "ask_noor_qa" USING btree ("category");--> statement-breakpoint
CREATE INDEX "qa_norm_idx" ON "ask_noor_qa" USING btree ("question_normalized");--> statement-breakpoint
CREATE INDEX "messages_status_idx" ON "contact_messages" USING btree ("status");--> statement-breakpoint
CREATE INDEX "messages_created_idx" ON "contact_messages" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "tafsirs_surah_num_uniq" ON "tafsirs" USING btree ("surah_id","number_in_surah");--> statement-breakpoint
CREATE INDEX "tafsirs_surah_idx" ON "tafsirs" USING btree ("surah_id");--> statement-breakpoint
CREATE UNIQUE INDEX "verses_surah_num_uniq" ON "verses" USING btree ("surah_id","number_in_surah");--> statement-breakpoint
CREATE INDEX "verses_normalized_idx" ON "verses" USING btree ("text_normalized");--> statement-breakpoint
CREATE INDEX "verses_juz_idx" ON "verses" USING btree ("juz");