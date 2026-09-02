import { getCurrentUser } from "@venore/plugin-sdk/auth";
import { enrollSelf } from "./service";
import type { EnrollSelfInput, EnrollSelfResult } from "./types";

export async function enrollSelfHandler(input: EnrollSelfInput): Promise<EnrollSelfResult> {
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

  return enrollSelf({ ...input, actorId: currentUser.data.id });
}
