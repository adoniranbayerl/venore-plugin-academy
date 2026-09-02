import type { OperationResult } from "@venore/plugin-sdk";
import type { LessonRecord } from "../../../contracts/types";

export type GetLessonQuery = { id: string };
export type GetLessonResult = OperationResult<LessonRecord | null>;
