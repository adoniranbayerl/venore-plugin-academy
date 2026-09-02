import type { OperationResult } from "@venore/plugin-sdk";
import type { CourseRecord } from "../../../contracts/types";

export type ListCoursesResult = OperationResult<CourseRecord[]>;
