import type { OperationResult } from "@venore/plugin-sdk";

export type DeleteQuizQuestionCommand = { id: string; actorId: string };
export type DeleteQuizQuestionInput = Omit<DeleteQuizQuestionCommand, "actorId">;
export type DeleteQuizQuestionResult = OperationResult<{ id: string }>;
