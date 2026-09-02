import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { getCourseProgress } from "../get-course-progress/service";
import type { GetCourseProgressForStudentInput, GetCourseProgressForStudentResult } from "./types";

// Mesmo service de get-course-progress (já recebe {courseId, actorId} sem depender de sessão —
// só o handler self-only fixa getCurrentUser()), reaproveitado direto: a checagem de matrícula
// que o service já faz cobre "esse aluno está mesmo matriculado nesse curso" de graça. Sem
// service.ts/store.ts próprios — nada aqui além de trocar quem autoriza a chamada.
export async function getCourseProgressForStudentHandler(
  input: GetCourseProgressForStudentInput,
): Promise<GetCourseProgressForStudentResult> {
  if (input.courseId.trim().length === 0) {
    return { success: false, error: { code: "academy.courses.invalid_id", message: "courseId não pode ser vazio." } };
  }
  if (input.studentActorId.trim().length === 0) {
    return {
      success: false,
      error: { code: "academy.progress.invalid_student_id", message: "studentActorId não pode ser vazio." },
    };
  }

  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return getCourseProgress({ courseId: input.courseId, actorId: input.studentActorId });
}
