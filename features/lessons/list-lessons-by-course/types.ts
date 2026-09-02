import type { OperationResult } from "@venore/plugin-sdk";
import type { LessonRecord } from "../../../contracts/types";

export type ListLessonsByCourseQuery = { courseId: string };
export type ListLessonsByCourseResult = OperationResult<LessonRecord[]>;
