import type { OperationResult } from "@venore/plugin-sdk";
import type { LessonRecord, LessonStatus } from "../../../contracts/types";

export type SetLessonStatusCommand = { id: string; status: LessonStatus; actorId: string };
export type SetLessonStatusInput = Omit<SetLessonStatusCommand, "actorId">;
export type SetLessonStatusResult = OperationResult<LessonRecord>;
