import { asc, eq } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { lessonSections, lessons } from "../../../../database/schema";
import type { LessonRecord, LessonSectionRecord } from "../../../../contracts/types";

export async function findLessonById(id: string): Promise<LessonRecord | null> {
  const [row] = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  return (row as LessonRecord) ?? null;
}

export async function findSectionsByLesson(lessonId: string): Promise<LessonSectionRecord[]> {
  const rows = await db
    .select()
    .from(lessonSections)
    .where(eq(lessonSections.lessonId, lessonId))
    .orderBy(asc(lessonSections.position));
  return rows as LessonSectionRecord[];
}
