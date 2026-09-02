import { and, eq, gt, sql } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { lessonSections } from "../../../../database/schema";
import type { LessonSectionRecord } from "../../../../contracts/types";

export async function findSectionById(id: string): Promise<LessonSectionRecord | null> {
  const [row] = await db.select().from(lessonSections).where(eq(lessonSections.id, id)).limit(1);
  return (row as LessonSectionRecord) ?? null;
}

export async function deleteSectionAndRenumber(lessonId: string, position: number, id: string): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(lessonSections).where(eq(lessonSections.id, id));
    await tx
      .update(lessonSections)
      .set({ position: sql`${lessonSections.position} - 1`, updatedAt: sql`now()` })
      .where(and(eq(lessonSections.lessonId, lessonId), gt(lessonSections.position, position)));
  });
}
