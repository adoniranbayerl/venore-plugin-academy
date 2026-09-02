import { eq, sql } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { courses } from "../../../database/schema";
import type { CourseRecord } from "../../../contracts/types";

export async function findCourseById(id: string): Promise<CourseRecord | null> {
  const [row] = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  return (row as CourseRecord) ?? null;
}

export async function markCourseUnpublished(id: string): Promise<CourseRecord> {
  const [row] = await db
    .update(courses)
    .set({ status: "draft", updatedAt: sql`now()` })
    .where(eq(courses.id, id))
    .returning();

  return row as CourseRecord;
}
