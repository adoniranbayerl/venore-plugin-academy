import { and, eq, gte } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { practiceDays } from "../database/schema";

// Ofensiva de prática — ver database/schema/index.ts practiceDays. `day` é "YYYY-MM-DD".

export async function recordPracticeDay(actorId: string, day: string): Promise<void> {
  await db
    .insert(practiceDays)
    .values({ actorId, day })
    .onConflictDoNothing({ target: [practiceDays.actorId, practiceDays.day] });
}

// Dias de prática do ator a partir de `since` (inclusive), em ordem crescente.
export async function findPracticeDays(actorId: string, since: string): Promise<string[]> {
  const rows = await db
    .select({ day: practiceDays.day })
    .from(practiceDays)
    .where(and(eq(practiceDays.actorId, actorId), gte(practiceDays.day, since)))
    .orderBy(practiceDays.day);
  return rows.map((row) => row.day);
}
