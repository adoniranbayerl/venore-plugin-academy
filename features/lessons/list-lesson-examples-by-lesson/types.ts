import type { OperationResult } from "@venore/plugin-sdk";
import type { LessonExampleRecord } from "../../../contracts/types";

export type ListLessonExamplesByLessonQuery = { lessonId: string };
export type ListLessonExamplesByLessonResult = OperationResult<LessonExampleRecord[]>;
