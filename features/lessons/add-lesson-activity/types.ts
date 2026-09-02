import type { OperationResult } from "@venore/plugin-sdk";
import type { DeliverableFormat, LessonActivityRecord } from "../../../contracts/types";

export type AddLessonActivityCommand = {
  lessonId: string;
  title: string;
  instructionsText: string;
  deliverableFormat: DeliverableFormat;
  actorId: string;
};
export type AddLessonActivityInput = Omit<AddLessonActivityCommand, "actorId">;
export type AddLessonActivityResult = OperationResult<LessonActivityRecord>;
