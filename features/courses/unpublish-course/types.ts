import type { OperationResult } from "@venore/plugin-sdk";
import type { CourseRecord } from "../../../contracts/types";

export type UnpublishCourseCommand = { id: string; actorId: string };
export type UnpublishCourseInput = Omit<UnpublishCourseCommand, "actorId">;
export type UnpublishCourseResult = OperationResult<CourseRecord>;
