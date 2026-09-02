import { eq, sql } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { lessons } from "../../../database/schema";
import type { LessonRecord, LessonStatus } from "../../../contracts/types";

export async function findLessonById(id: string): Promise<LessonRecord | null> {
  const [row] = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  return (row as LessonRecord) ?? null;
}

export async function updateLessonStatus(id: string, status: LessonStatus): Promise<LessonRecord> {
  const [row] = await db
    .update(lessons)
    .set({ status, updatedAt: sql`now()` })
    .where(eq(lessons.id, id))
    .returning();

  return row as LessonRecord;
}
