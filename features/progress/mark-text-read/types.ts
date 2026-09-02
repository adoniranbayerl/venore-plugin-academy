import type { OperationResult } from "@venore/plugin-sdk";

export type MarkTextReadCommand = { lessonId: string; actorId: string };
export type MarkTextReadInput = Omit<MarkTextReadCommand, "actorId">;
export type MarkTextReadResult = OperationResult<{ lessonId: string; completed: true }>;
