import type { OperationResult } from "@venore/plugin-sdk";

export type MarkLessonSectionReadCommand = { sectionId: string; actorId: string };
export type MarkLessonSectionReadInput = Omit<MarkLessonSectionReadCommand, "actorId">;
export type MarkLessonSectionReadResult = OperationResult<{ sectionId: string; completed: true }>;
