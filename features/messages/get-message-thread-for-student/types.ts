import type { OperationResult } from "@venore/plugin-sdk";
import type { LessonMessageRecord, LessonMessageThreadRecord } from "../../../contracts/types";

export type GetMessageThreadForStudentInput = { threadId: string };
export type GetMessageThreadForStudentResult = OperationResult<{ thread: LessonMessageThreadRecord; messages: LessonMessageRecord[] }>;
