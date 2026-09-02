import type { OperationResult } from "@venore/plugin-sdk";
import type { LessonExampleRecord } from "../../../contracts/types";

export type ListLessonExamplesForStudentQuery = { lessonId: string };
export type ListLessonExamplesForStudentCommand = ListLessonExamplesForStudentQuery & { actorId: string };
export type ListLessonExamplesForStudentResult = OperationResult<LessonExampleRecord[]>;
