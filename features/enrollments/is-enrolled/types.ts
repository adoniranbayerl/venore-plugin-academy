import type { OperationResult } from "@venore/plugin-sdk";

export type IsEnrolledQuery = { courseId: string; actorId: string };
export type IsEnrolledInput = Omit<IsEnrolledQuery, "actorId">;
export type IsEnrolledResult = OperationResult<boolean>;
