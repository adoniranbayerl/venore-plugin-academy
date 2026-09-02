import type { OperationResult } from "@venore/plugin-sdk";
import type { LessonMaterialRecord } from "../../../contracts/types";

export type ListLessonMaterialsByLessonQuery = { lessonId: string };
export type ListLessonMaterialsByLessonResult = OperationResult<LessonMaterialRecord[]>;
