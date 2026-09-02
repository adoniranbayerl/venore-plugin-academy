import type { OperationResult } from "@venore/plugin-sdk";
import type { ExercisePracticeStats } from "../../../shared/exercise-practice-store";

export type RecordExercisePracticeCommand = { actorId: string; exerciseKey: string; score: number | null };
export type RecordExercisePracticeInput = Omit<RecordExercisePracticeCommand, "actorId">;
export type RecordExercisePracticeResult = OperationResult<ExercisePracticeStats>;
