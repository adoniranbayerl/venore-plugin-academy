import { eq } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { lessonExamples, lessons } from "../../../database/schema";
import type { LessonExampleRecord, LessonRecord } from "../../../contracts/types";

export async function findLessonById(id: string): Promise<LessonRecord | null> {
  const [row] = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  return (row as LessonRecord) ?? null;
}

export async function findLessonExamplesByLesson(lessonId: string): Promise<LessonExampleRecord[]> {
  const rows = await db
    .select()
    .from(lessonExamples)
    .where(eq(lessonExamples.lessonId, lessonId))
    .orderBy(lessonExamples.position);
  return rows as LessonExampleRecord[];
}
