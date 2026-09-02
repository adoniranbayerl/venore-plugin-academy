import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import { getUserContext } from "@venore/plugin-sdk/rbac";
import { invalidateAttempts } from "../../../shared/quiz-attempts";
import { findCourseById, findLessonById } from "./store";
import type { ResetQuizAttemptsCommand, ResetQuizAttemptsResult } from "./types";

// Reset é escrita sobre progresso de OUTRA pessoa (o aluno), mais sensível que as demais ações
// admin do curso (que só mexem no próprio curso) — por isso, além da permission já checada no
// handler, exige também ser quem criou o curso (ou superadmin), mesmo critério de canPreview em
// src/platform/academy-student/get-academy-course-access.ts (plano da sessão de reset de
// tentativas de quiz).
export async function resetQuizAttempts(command: ResetQuizAttemptsCommand): Promise<ResetQuizAttemptsResult> {
  const handle = beginOperation({
    useCase: "academy.reset-quiz-attempts",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const lesson = await findLessonById(command.lessonId);
  if (!lesson) {
    const error = { code: "academy.lessons.not_found", message: `Lesson "${command.lessonId}" não encontrada.` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const course = await findCourseById(lesson.courseId);
  const rbacContext = await getUserContext({ userId: command.actorId });
  const isSuperadmin = rbacContext.success && rbacContext.data.isSuperadmin;
  const isOwner = course?.createdBy === command.actorId;
  if (!isSuperadmin && !isOwner) {
    const error = {
      code: "academy.reset_quiz_attempts.forbidden",
      message: "Só quem criou o curso pode resetar tentativas de quiz de um aluno.",
    };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const invalidatedCount = await invalidateAttempts(command.lessonId, command.studentActorId);

  endOperation(handle, { success: true });
  return { success: true, data: { invalidatedCount } };
}
