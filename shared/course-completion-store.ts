import { and, eq } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { courseCompletions } from "../database/schema";

// Marco "trilha concluída" (sticky) — ver database/schema/index.ts courseCompletions e
// shared/progress-hooks.ts.

export async function findCourseCompletion(courseId: string, actorId: string): Promise<{ completedAt: Date } | null> {
  const [row] = await db
    .select({ completedAt: courseCompletions.completedAt })
    .from(courseCompletions)
    .where(and(eq(courseCompletions.courseId, courseId), eq(courseCompletions.actorId, actorId)))
    .limit(1);
  return row ?? null;
}

export async function insertCourseCompletionIfMissing(courseId: string, actorId: string): Promise<void> {
  await db
    .insert(courseCompletions)
    .values({ courseId, actorId })
    .onConflictDoNothing({ target: [courseCompletions.courseId, courseCompletions.actorId] });
}
