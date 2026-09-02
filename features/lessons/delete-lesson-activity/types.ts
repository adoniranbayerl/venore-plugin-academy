import type { OperationResult } from "@venore/plugin-sdk";

export type DeleteLessonActivityCommand = { id: string; actorId: string };
export type DeleteLessonActivityInput = Omit<DeleteLessonActivityCommand, "actorId">;
export type DeleteLessonActivityResult = OperationResult<{ id: string }>;
