import { eq } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { lessonSections, lessons } from "../../../database/schema";
import type { LessonRecord, LessonSectionRecord } from "../../../contracts/types";

export async function findSectionById(id: string): Promise<LessonSectionRecord | null> {
  const [row] = await db.select().from(lessonSections).where(eq(lessonSections.id, id)).limit(1);
  return (row as LessonSectionRecord) ?? null;
}

export async function findLessonById(id: string): Promise<LessonRecord | null> {
  const [row] = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  return (row as LessonRecord) ?? null;
}

export async function findSectionIdsByLesson(lessonId: string): Promise<string[]> {
  const rows = await db.select({ id: lessonSections.id }).from(lessonSections).where(eq(lessonSections.lessonId, lessonId));
  return rows.map((row) => row.id);
}
