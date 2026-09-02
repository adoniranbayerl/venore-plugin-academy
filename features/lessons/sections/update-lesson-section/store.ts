import { and, eq, ne, sql } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { lessonSections } from "../../../../database/schema";
import type { LessonSectionRecord } from "../../../../contracts/types";

export async function findSectionById(id: string): Promise<LessonSectionRecord | null> {
  const [row] = await db.select().from(lessonSections).where(eq(lessonSections.id, id)).limit(1);
  return (row as LessonSectionRecord) ?? null;
}

export async function findSectionByCmsEntryId(
  cmsEntryId: string,
  excludeId: string,
): Promise<LessonSectionRecord | null> {
  const [row] = await db
    .select()
    .from(lessonSections)
    .where(and(eq(lessonSections.cmsEntryId, cmsEntryId), ne(lessonSections.id, excludeId)))
    .limit(1);
  return (row as LessonSectionRecord) ?? null;
}

export async function updateSection(
  id: string,
  input: { title?: string; cmsEntryId?: string; videoUrl?: string },
): Promise<LessonSectionRecord> {
  const [row] = await db
    .update(lessonSections)
    .set({ ...input, updatedAt: sql`now()` })
    .where(eq(lessonSections.id, id))
    .returning();

  return row as LessonSectionRecord;
}
