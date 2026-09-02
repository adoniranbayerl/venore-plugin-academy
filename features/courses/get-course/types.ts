import type { OperationResult } from "@venore/plugin-sdk";
import type { CourseRecord } from "../../../contracts/types";

export type GetCourseQuery = { id: string };
export type GetCourseResult = OperationResult<CourseRecord | null>;
