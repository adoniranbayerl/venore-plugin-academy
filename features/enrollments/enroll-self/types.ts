import type { OperationResult } from "@venore/plugin-sdk";
import type { EnrollmentRecord } from "../../../contracts/types";

export type EnrollSelfCommand = { courseId: string; actorId: string };
export type EnrollSelfInput = Omit<EnrollSelfCommand, "actorId">;
export type EnrollSelfResult = OperationResult<EnrollmentRecord>;
