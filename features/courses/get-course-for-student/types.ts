import type { OperationResult } from "@venore/plugin-sdk";
import type { CourseRecord } from "../../../contracts/types";

export type GetCourseForStudentQuery = { id: string } | { slug: string };
export type GetCourseForStudentResult = OperationResult<CourseRecord | null>;
