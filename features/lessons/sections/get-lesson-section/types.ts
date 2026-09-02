import type { OperationResult } from "@venore/plugin-sdk";
import type { LessonSectionRecord } from "../../../../contracts/types";

export type GetLessonSectionQuery = { id: string };
export type GetLessonSectionResult = OperationResult<LessonSectionRecord | null>;
