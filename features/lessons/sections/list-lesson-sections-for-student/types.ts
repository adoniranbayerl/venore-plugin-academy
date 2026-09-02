import type { OperationResult } from "@venore/plugin-sdk";
import type { LessonSectionRecord } from "../../../../contracts/types";

// completed: progresso granular do ator nesta seção (pedido desta sessão — acordion com "marcar
// como lida" por seção) — ver lessonSectionCompletions em database/schema/index.ts.
export type StudentLessonSectionRecord = LessonSectionRecord & { completed: boolean };

export type ListLessonSectionsForStudentQuery = { lessonId: string };
export type ListLessonSectionsForStudentCommand = ListLessonSectionsForStudentQuery & { actorId: string };
export type ListLessonSectionsForStudentResult = OperationResult<StudentLessonSectionRecord[]>;
