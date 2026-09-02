import type { OperationResult } from "@venore/plugin-sdk";

export type DeleteLessonExampleCommand = { id: string; actorId: string };
export type DeleteLessonExampleInput = Omit<DeleteLessonExampleCommand, "actorId">;
export type DeleteLessonExampleResult = OperationResult<{ id: string }>;
