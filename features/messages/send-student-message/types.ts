import type { OperationResult } from "@venore/plugin-sdk";
import type { LessonMessageRecord, LessonMessageThreadType } from "../../../contracts/types";

export type SendStudentMessageInput = { lessonId: string; stepKey: string; type: LessonMessageThreadType; body: string };
export type SendStudentMessageCommand = SendStudentMessageInput & { actorId: string };
export type SendStudentMessageResult = OperationResult<{ threadId: string; message: LessonMessageRecord }>;
