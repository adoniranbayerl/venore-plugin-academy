import type { OperationResult } from "@venore/plugin-sdk";

export type MarkLessonMaterialReadCommand = { materialId: string; actorId: string };
export type MarkLessonMaterialReadInput = Omit<MarkLessonMaterialReadCommand, "actorId">;
export type MarkLessonMaterialReadResult = OperationResult<{ materialId: string; completed: true }>;
