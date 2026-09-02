import type { OperationResult } from "@venore/plugin-sdk";
import type { LessonSectionRecord } from "../../../../contracts/types";

export type CreateLessonTextSectionCommand = { lessonId: string; title: string; actorId: string };
export type CreateLessonTextSectionInput = Omit<CreateLessonTextSectionCommand, "actorId">;
export type CreateLessonTextSectionResult = OperationResult<LessonSectionRecord>;
