import { getCurrentUser } from "@venore/plugin-sdk/auth";
import { markActivityReviewSeen } from "./service";
import type { MarkActivityReviewSeenInput, MarkActivityReviewSeenResult } from "./types";

export async function markActivityReviewSeenHandler(input: MarkActivityReviewSeenInput): Promise<MarkActivityReviewSeenResult> {
  if (input.activityId.trim().length === 0) {
    return { success: false, error: { code: "academy.lesson_activities.invalid_id", message: "activityId não pode ser vazio." } };
  }

  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return {
      success: false,
      error: { code: "academy.progress.unauthenticated", message: "É necessário estar autenticado para executar esta ação." },
    };
  }

  return markActivityReviewSeen({ ...input, actorId: currentUser.data.id });
}
