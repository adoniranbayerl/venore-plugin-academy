import { getExercisePracticeStats as loadStats } from "../../../shared/exercise-practice-store";
import type { GetExercisePracticeStatsResult } from "./types";

export async function getExercisePracticeStats(query: { actorId: string; exerciseKey: string }): Promise<GetExercisePracticeStatsResult> {
  const stats = await loadStats(query.actorId, query.exerciseKey);
  return { success: true, data: stats };
}
