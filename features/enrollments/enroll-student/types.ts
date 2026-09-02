import type { OperationResult } from "@venore/plugin-sdk";
import type { EnrollmentRecord } from "../../../contracts/types";

export type EnrollStudentCommand = { courseId: string; studentActorId: string; actorId: string };
export type EnrollStudentInput = Omit<EnrollStudentCommand, "actorId">;
export type EnrollStudentResult = OperationResult<EnrollmentRecord>;
