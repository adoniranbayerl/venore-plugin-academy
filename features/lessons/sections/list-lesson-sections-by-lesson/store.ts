import { asc, eq } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { lessonSections } from "../../../../database/schema";
import type { LessonSectionRecord } from "../../../../contracts/types";

export async function findSectionsByLesson(lessonId: string): Promise<LessonSectionRecord[]> {
  const rows = await db
    .select()
    .from(lessonSections)
    .where(eq(lessonSections.lessonId, lessonId))
    .orderBy(asc(lessonSections.position));
  return rows as LessonSectionRecord[];
}
