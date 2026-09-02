import type { OperationResult } from "@venore/plugin-sdk";
import type { LessonMaterialRecord } from "../../../contracts/types";

export type AddLessonMaterialCommand = {
  lessonId: string;
  mediaId: string;
  label: string;
  actorId: string;
};
export type AddLessonMaterialInput = Omit<AddLessonMaterialCommand, "actorId">;
export type AddLessonMaterialResult = OperationResult<LessonMaterialRecord>;
