import type { OperationResult } from "@venore/plugin-sdk";
import type { EnrollmentRecord } from "../../../contracts/types";

export type UnenrollStudentCommand = { courseId: string; studentActorId: string; actorId: string };
export type UnenrollStudentInput = Omit<UnenrollStudentCommand, "actorId">;
export type UnenrollStudentResult = OperationResult<EnrollmentRecord>;
