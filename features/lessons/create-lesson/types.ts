import type { OperationResult } from "@venore/plugin-sdk";
import type { LessonRecord } from "../../../contracts/types";

export type CreateLessonCommand = {
  courseId: string;
  title: string;
  body?: string;
  videoUrl?: string;
  coverMediaId?: string;
  actorId: string;
};
export type CreateLessonInput = Omit<CreateLessonCommand, "actorId">;
export type CreateLessonResult = OperationResult<LessonRecord>;
