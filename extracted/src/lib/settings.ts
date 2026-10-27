import "server-only";
import { unstable_cache } from "next/cache";
import { db } from "@/db";
import { settings } from "@/db/schema";

export type SettingMap = Record<string, string>;

/** All settings as a cached key→value map; admin writes revalidate the "settings" tag. */
export const getSettings = unstable_cache(
  async (): Promise<SettingMap> => {
    const rows = await db.select().from(settings);
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  },
  ["all-settings"],
  { revalidate: 60, tags: ["settings"] }
);

export async function getSetting(key: string, fallback = ""): Promise<string> {
  const map = await getSettings();
  return map[key] ?? fallback;
}

export async function upsertSetting(key: string, value: string, group = "general") {
  await db
    .insert(settings)
    .values({ key, value, group })
    .onConflictDoUpdate({ target: settings.key, set: { value, group, updatedAt: new Date() } });
}

export async function upsertMany(entries: Array<{ key: string; value: string; group: string }>) {
  for (const e of entries) {
    await db
      .insert(settings)
      .values(e)
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: e.value, group: e.group, updatedAt: new Date() },
      });
  }
}

/** Build a wa.me link from settings; returns null when no number configured. */
export function whatsappLink(map: SettingMap): string | null {
  const raw = (map.whatsapp_number ?? "").replace(/[^0-9]/g, "");
  if (raw.length < 8) return null;
  const msg = encodeURIComponent(map.whatsapp_message || "السلام عليكم، أريد التواصل مع إدارة نور.");
  return `https://wa.me/${raw}?text=${msg}`;
}