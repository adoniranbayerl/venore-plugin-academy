import type { OperationResult } from "@venore/plugin-sdk";
import type { LessonRequirementsRecord } from "../../../contracts/types";

export type GetLessonRequirementsQuery = { lessonId: string };
export type GetLessonRequirementsResult = OperationResult<LessonRequirementsRecord | null>;
