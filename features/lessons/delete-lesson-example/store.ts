import { eq } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { lessonExamples } from "../../../database/schema";
import type { LessonExampleRecord } from "../../../contracts/types";

export async function findLessonExampleById(id: string): Promise<LessonExampleRecord | null> {
  const [row] = await db.select().from(lessonExamples).where(eq(lessonExamples.id, id)).limit(1);
  return (row as LessonExampleRecord) ?? null;
}

export async function deleteLessonExample(id: string): Promise<void> {
  await db.delete(lessonExamples).where(eq(lessonExamples.id, id));
}
