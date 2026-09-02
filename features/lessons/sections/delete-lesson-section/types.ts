import type { OperationResult } from "@venore/plugin-sdk";

export type DeleteLessonSectionCommand = { id: string; actorId: string };
export type DeleteLessonSectionInput = Omit<DeleteLessonSectionCommand, "actorId">;
export type DeleteLessonSectionResult = OperationResult<{ id: string }>;
