import type { OperationResult } from "@venore/plugin-sdk";
import type { LessonExampleRecord } from "../../../contracts/types";

export type AddLessonExampleCommand = {
  lessonId: string;
  title: string;
  audioMediaId?: string;
  sheetMediaId?: string;
  notationData?: string;
  captionText: string;
  actorId: string;
};
export type AddLessonExampleInput = Omit<AddLessonExampleCommand, "actorId">;
export type AddLessonExampleResult = OperationResult<LessonExampleRecord>;
