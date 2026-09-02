import type { OperationResult } from "@venore/plugin-sdk";

export type ResetQuizAttemptsCommand = { lessonId: string; studentActorId: string; actorId: string };
export type ResetQuizAttemptsInput = Omit<ResetQuizAttemptsCommand, "actorId">;

export type ResetQuizAttemptsResult = OperationResult<{ invalidatedCount: number }>;
