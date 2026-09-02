import type { OperationResult } from "@venore/plugin-sdk";

export type DeleteLessonMaterialCommand = { id: string; actorId: string };
export type DeleteLessonMaterialInput = Omit<DeleteLessonMaterialCommand, "actorId">;
export type DeleteLessonMaterialResult = OperationResult<{ id: string }>;
