import { desc, eq } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { lessons } from "../../../database/schema";
import type { LessonRecord } from "../../../contracts/types";

export async function findNextPosition(courseId: string): Promise<number> {
  const [row] = await db
    .select({ position: lessons.position })
    .from(lessons)
    .where(eq(lessons.courseId, courseId))
    .orderBy(desc(lessons.position))
    .limit(1);

  return (row?.position ?? 0) + 1;
}

export async function insertLesson(input: {
  courseId: string;
  title: string;
  body?: string;
  videoUrl?: string;
  coverMediaId?: string;
  position: number;
}): Promise<LessonRecord> {
  const [row] = await db
    .insert(lessons)
    .values({
      courseId: input.courseId,
      title: input.title,
      body: input.body ?? null,
      videoUrl: input.videoUrl ?? null,
      position: input.position,
      ...(input.coverMediaId !== undefined && { coverMediaId: input.coverMediaId }),
    })
    .returning();

  return row as LessonRecord;
}
