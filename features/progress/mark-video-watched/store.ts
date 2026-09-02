import { eq } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { lessonVideoCompletions, lessons } from "../../../database/schema";
import type { LessonRecord } from "../../../contracts/types";

export async function findLessonById(id: string): Promise<LessonRecord | null> {
  const [row] = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  return (row as LessonRecord) ?? null;
}

export async function insertVideoCompletionIfMissing(lessonId: string, actorId: string): Promise<void> {
  await db.insert(lessonVideoCompletions).values({ lessonId, actorId }).onConflictDoNothing();
}
