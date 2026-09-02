import { and, count, eq, max } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { exercisePractice } from "../database/schema";

// Contador de repetições por exercício — ver database/schema/index.ts exercisePractice.

export type ExercisePracticeStats = { count: number; bestScore: number | null };

export async function insertExercisePractice(actorId: string, exerciseKey: string, score: number | null): Promise<void> {
  await db.insert(exercisePractice).values({ actorId, exerciseKey, score });
}

export async function getExercisePracticeStats(actorId: string, exerciseKey: string): Promise<ExercisePracticeStats> {
  const [row] = await db
    .select({ total: count(), best: max(exercisePractice.score) })
    .from(exercisePractice)
    .where(and(eq(exercisePractice.actorId, actorId), eq(exercisePractice.exerciseKey, exerciseKey)));
  return { count: row?.total ?? 0, bestScore: row?.best ?? null };
}
