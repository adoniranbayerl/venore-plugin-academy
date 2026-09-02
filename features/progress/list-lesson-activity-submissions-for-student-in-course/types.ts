import type { OperationResult } from "@venore/plugin-sdk";
import type { LessonActivitySubmissionRecord } from "../../../contracts/types";

export type ListLessonActivitySubmissionsForStudentInCourseQuery = { courseId: string; studentActorId: string };

// Entrega + contexto de aula/atividade (nome do actor não entra aqui — quem chama já sabe de
// qual aluno se trata, mesmo critério que dispensou um segundo listUsers()). Ordenado por
// posição da aula e depois da atividade dentro dela (ver store.ts).
export type StudentCourseActivitySubmissionView = LessonActivitySubmissionRecord & {
  lessonId: string;
  lessonTitle: string;
  lessonPosition: number;
  activityTitle: string;
  activityPosition: number;
};

export type ListLessonActivitySubmissionsForStudentInCourseResult = OperationResult<StudentCourseActivitySubmissionView[]>;
