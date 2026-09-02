import type { OperationResult } from "@venore/plugin-sdk";
import type { LessonRecord } from "../../../contracts/types";

export type ReorderLessonsCommand = { courseId: string; lessonIds: string[]; actorId: string };
export type ReorderLessonsInput = Omit<ReorderLessonsCommand, "actorId">;
export type ReorderLessonsResult = OperationResult<LessonRecord[]>;
