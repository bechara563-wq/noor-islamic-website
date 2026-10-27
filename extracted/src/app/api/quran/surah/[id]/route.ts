import { db } from "@/db";
import { verses } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1 || id > 114) {
    return Response.json({ ok: false, error: "سورة غير صالحة" }, { status: 404 });
  }

  const data = await db
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

  return Response.json({ ok: true, verses: data });
}
