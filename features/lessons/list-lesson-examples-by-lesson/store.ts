import { eq } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { lessonExamples } from "../../../database/schema";
import type { LessonExampleRecord } from "../../../contracts/types";

export async function findLessonExamplesByLesson(lessonId: string): Promise<LessonExampleRecord[]> {
  const rows = await db
    .select()
    .from(lessonExamples)
    .where(eq(lessonExamples.lessonId, lessonId))
    .orderBy(lessonExamples.position);
  return rows as LessonExampleRecord[];
}
