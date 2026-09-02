import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { resetQuizAttempts } from "./service";
import type { ResetQuizAttemptsInput, ResetQuizAttemptsResult } from "./types";

export async function resetQuizAttemptsHandler(input: ResetQuizAttemptsInput): Promise<ResetQuizAttemptsResult> {
  if (input.lessonId.trim().length === 0) {
    return { success: false, error: { code: "academy.lessons.invalid_id", message: "lessonId não pode ser vazio." } };
  }

  if (input.studentActorId.trim().length === 0) {
    return {
      success: false,
      error: { code: "academy.reset_quiz_attempts.invalid_student_id", message: "studentActorId não pode ser vazio." },
    };
  }

  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return resetQuizAttempts({ ...input, actorId: authz.actorId });
}
