import type { OperationResult } from "@venore/plugin-sdk";
import type { LessonActivityRecord } from "../../../contracts/types";

export type ListLessonActivitiesByLessonQuery = { lessonId: string };
export type ListLessonActivitiesByLessonResult = OperationResult<LessonActivityRecord[]>;
