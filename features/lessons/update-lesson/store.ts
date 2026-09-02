import { eq, sql } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { lessons } from "../../../database/schema";
import type { LessonRecord } from "../../../contracts/types";

export async function findLessonById(id: string): Promise<LessonRecord | null> {
  const [row] = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  return (row as LessonRecord) ?? null;
}

export async function updateLesson(
  id: string,
  input: { title?: string; body?: string | null; videoUrl?: string | null; coverMediaId?: string | null },
): Promise<LessonRecord> {
  const { coverMediaId, body, videoUrl, ...rest } = input;
  const [row] = await db
    .update(lessons)
    .set({
      ...rest,
      ...(body !== undefined && { body }),
      ...(videoUrl !== undefined && { videoUrl }),
      ...(coverMediaId !== undefined && { coverMediaId }),
      updatedAt: sql`now()`,
    })
    .where(eq(lessons.id, id))
    .returning();

  return row as LessonRecord;
}
