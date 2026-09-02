import type { OperationResult } from "@venore/plugin-sdk";
import type { LessonMessageThreadWithContext } from "../../../shared/lesson-messages-store";

export type ListAllMessageThreadsResult = OperationResult<LessonMessageThreadWithContext[]>;
