import type { OperationResult } from "@venore/plugin-sdk";
import type { LessonSectionRecord } from "../../../../contracts/types";

export type UpdateLessonSectionCommand = {
  id: string;
  title?: string;
  cmsEntryId?: string;
  videoUrl?: string;
  actorId: string;
};
export type UpdateLessonSectionInput = Omit<UpdateLessonSectionCommand, "actorId">;
export type UpdateLessonSectionResult = OperationResult<LessonSectionRecord>;
