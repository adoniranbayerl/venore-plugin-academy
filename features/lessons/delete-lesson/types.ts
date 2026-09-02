import type { OperationResult } from "@venore/plugin-sdk";

export type DeleteLessonCommand = { id: string; actorId: string };
export type DeleteLessonInput = Omit<DeleteLessonCommand, "actorId">;
export type DeleteLessonResult = OperationResult<{ id: string }>;
