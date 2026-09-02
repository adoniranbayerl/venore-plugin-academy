import type { OperationResult } from "@venore/plugin-sdk";
import type { LessonSectionRecord } from "../../../../contracts/types";

export type ListLessonSectionsByLessonQuery = { lessonId: string };
export type ListLessonSectionsByLessonResult = OperationResult<LessonSectionRecord[]>;
