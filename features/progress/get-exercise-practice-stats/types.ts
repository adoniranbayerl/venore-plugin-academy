import type { OperationResult } from "@venore/plugin-sdk";
import type { ExercisePracticeStats } from "../../../shared/exercise-practice-store";

export type GetExercisePracticeStatsInput = { exerciseKey: string };
export type GetExercisePracticeStatsResult = OperationResult<ExercisePracticeStats>;
