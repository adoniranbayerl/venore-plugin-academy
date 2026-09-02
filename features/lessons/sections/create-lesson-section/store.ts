import { desc, eq } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { lessonSections, lessons } from "../../../../database/schema";
import type { LessonSectionRecord } from "../../../../contracts/types";

export async function findLessonById(id: string): Promise<{ id: string } | null> {
  const [row] = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.id, id)).limit(1);
  return row ?? null;
}

export async function findSectionByCmsEntryId(cmsEntryId: string): Promise<LessonSectionRecord | null> {
  const [row] = await db.select().from(lessonSections).where(eq(lessonSections.cmsEntryId, cmsEntryId)).limit(1);
  return (row as LessonSectionRecord) ?? null;
}

export async function findNextPosition(lessonId: string): Promise<number> {
  const [row] = await db
    .select({ position: lessonSections.position })
    .from(lessonSections)
    .where(eq(lessonSections.lessonId, lessonId))
    .orderBy(desc(lessonSections.position))
    .limit(1);

  return (row?.position ?? 0) + 1;
}

export async function insertSection(input: {
  lessonId: string;
  title: string;
  cmsEntryId?: string;
  videoUrl?: string;
  position: number;
}): Promise<LessonSectionRecord> {
  const [row] = await db
    .insert(lessonSections)
    .values({
      lessonId: input.lessonId,
      title: input.title,
      cmsEntryId: input.cmsEntryId ?? null,
      videoUrl: input.videoUrl ?? null,
      position: input.position,
    })
    .returning();

  return row as LessonSectionRecord;
}
