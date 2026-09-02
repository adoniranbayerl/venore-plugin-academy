import { eq } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { lessonSections } from "../../../../database/schema";
import type { LessonSectionRecord } from "../../../../contracts/types";

export async function findSectionById(id: string): Promise<LessonSectionRecord | null> {
  const [row] = await db.select().from(lessonSections).where(eq(lessonSections.id, id)).limit(1);
  return (row as LessonSectionRecord) ?? null;
}
