import type { OperationResult } from "@venore/plugin-sdk";
import type { CourseRecord } from "../../../contracts/types";

export type ListCoursesForStudentQuery = { actorId: string };

export type CourseForStudentView = CourseRecord & { enrolled: boolean };

export type ListCoursesForStudentResult = OperationResult<CourseForStudentView[]>;
