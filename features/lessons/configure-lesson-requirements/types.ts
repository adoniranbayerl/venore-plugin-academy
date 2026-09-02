import type { OperationResult } from "@venore/plugin-sdk";
import type { LessonRequirementsRecord } from "../../../contracts/types";

export type ConfigureLessonRequirementsCommand = {
  lessonId: string;
  readTextEnabled: boolean;
  watchVideoEnabled: boolean;
  quizEnabled: boolean;
  quizPassThresholdPercent?: number;
  quizMaxAttempts?: number;
  activityEnabled: boolean;
  actorId: string;
};
export type ConfigureLessonRequirementsInput = Omit<ConfigureLessonRequirementsCommand, "actorId">;
export type ConfigureLessonRequirementsResult = OperationResult<LessonRequirementsRecord>;
