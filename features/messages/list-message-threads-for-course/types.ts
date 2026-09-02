import type { OperationResult } from "@venore/plugin-sdk";
import type { LessonMessageThreadWithContext } from "../../../shared/lesson-messages-store";

export type ListMessageThreadsForCourseQuery = { courseId: string; studentActorId: string };
export type ListMessageThreadsForCourseResult = OperationResult<LessonMessageThreadWithContext[]>;
