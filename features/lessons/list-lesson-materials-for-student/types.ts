import type { OperationResult } from "@venore/plugin-sdk";
import type { LessonMaterialRecord } from "../../../contracts/types";

// completed: progresso granular do ator neste material (pedido desta sessão) — ver
// lessonMaterialCompletions em database/schema/index.ts.
export type StudentLessonMaterialRecord = LessonMaterialRecord & { completed: boolean };

export type ListLessonMaterialsForStudentQuery = { lessonId: string };
export type ListLessonMaterialsForStudentCommand = ListLessonMaterialsForStudentQuery & { actorId: string };
export type ListLessonMaterialsForStudentResult = OperationResult<StudentLessonMaterialRecord[]>;
