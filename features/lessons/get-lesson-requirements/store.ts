import { eq } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { lessonRequirements } from "../../../database/schema";
import type { LessonRequirementsRecord } from "../../../contracts/types";

export async function findLessonRequirements(lessonId: string): Promise<LessonRequirementsRecord | null> {
  const [row] = await db.select().from(lessonRequirements).where(eq(lessonRequirements.lessonId, lessonId)).limit(1);
  return (row as LessonRequirementsRecord) ?? null;
}
