import { getCurrentUser } from "@venore/plugin-sdk/auth";
import { getCourseProgress } from "./service";
import type { GetCourseProgressInput, GetCourseProgressResult } from "./types";

export async function getCourseProgressHandler(input: GetCourseProgressInput): Promise<GetCourseProgressResult> {
  if (input.courseId.trim().length === 0) {
    return { success: false, error: { code: "academy.courses.invalid_id", message: "courseId não pode ser vazio." } };
  }

  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return {
      success: false,
      error: { code: "academy.progress.unauthenticated", message: "É necessário estar autenticado para executar esta ação." },
    };
  }

  return getCourseProgress({ ...input, actorId: currentUser.data.id });
}
