import type { OperationResult } from "@venore/plugin-sdk";
import type { LessonSectionRecord } from "../../../../contracts/types";

export type ReorderLessonSectionsCommand = { lessonId: string; sectionIds: string[]; actorId: string };
export type ReorderLessonSectionsInput = Omit<ReorderLessonSectionsCommand, "actorId">;
export type ReorderLessonSectionsResult = OperationResult<LessonSectionRecord[]>;
