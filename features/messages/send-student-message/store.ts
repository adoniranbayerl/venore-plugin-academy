import { eq } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { lessons } from "../../../database/schema";
import type { LessonRecord } from "../../../contracts/types";

export async function findLessonById(id: string): Promise<LessonRecord | null> {
  const [row] = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  return (row as LessonRecord) ?? null;
}

export { isValidStepKey, findOrCreateThread, insertMessage } from "../../../shared/lesson-messages-store";
