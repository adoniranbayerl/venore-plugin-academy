import { getCurrentUser } from "@venore/plugin-sdk/auth";
import { isEnrolled } from "./service";
import type { IsEnrolledInput, IsEnrolledResult } from "./types";

// Uso da sessão do próprio ator (ex: composição em platform/) — checagens internas entre features
// do plugin (mark-text-read, get-course-progress, etc.) importam shared/enrollment.ts direto, sem
// passar por este handler, pra não re-resolver getCurrentUser à toa.
export async function isEnrolledHandler(input: IsEnrolledInput): Promise<IsEnrolledResult> {
  if (input.courseId.trim().length === 0) {
    return { success: false, error: { code: "academy.enrollments.invalid_course_id", message: "courseId não pode ser vazio." } };
  }

  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return {
      success: false,
      error: { code: "academy.enrollments.unauthenticated", message: "É necessário estar autenticado para executar esta ação." },
    };
  }

  return isEnrolled({ ...input, actorId: currentUser.data.id });
}
