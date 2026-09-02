import { eq, sql } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { lessonActivities } from "../../../database/schema";
import type { LessonActivityRecord } from "../../../contracts/types";

export async function findLessonActivityById(id: string): Promise<LessonActivityRecord | null> {
  const [row] = await db.select().from(lessonActivities).where(eq(lessonActivities.id, id)).limit(1);
  return (row as LessonActivityRecord) ?? null;
}

export async function updateLessonActivity(
  id: string,
  input: { title?: string; instructionsText?: string; deliverableFormat?: string },
): Promise<LessonActivityRecord> {
  const [row] = await db
    .update(lessonActivities)
    .set({ ...input, updatedAt: sql`now()` })
    .where(eq(lessonActivities.id, id))
    .returning();

  return row as LessonActivityRecord;
}
