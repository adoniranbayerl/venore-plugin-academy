import type { OperationResult } from "@venore/plugin-sdk";
import type { LessonActivityRecord, LessonActivitySubmissionRecord } from "../../../contracts/types";

export type ListLessonActivitiesForStudentQuery = { lessonId: string };
export type ListLessonActivitiesForStudentCommand = ListLessonActivitiesForStudentQuery & { actorId: string };

// submission: entrega do próprio ator pra esta atividade (null se ainda não entregou) — a tela de
// aluno precisa saber o que já foi enviado e o status de revisão sem uma segunda chamada
// (list-lesson-activity-submissions-for-activity é professor-only, authorizeActor).
export type StudentLessonActivityRecord = LessonActivityRecord & { submission: LessonActivitySubmissionRecord | null };

export type ListLessonActivitiesForStudentResult = OperationResult<StudentLessonActivityRecord[]>;
