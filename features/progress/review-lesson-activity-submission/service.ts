import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import { findSubmissionById, updateSubmissionReview } from "./store";
import type { ReviewLessonActivitySubmissionCommand, ReviewLessonActivitySubmissionResult } from "./types";

export async function reviewLessonActivitySubmission(
  command: ReviewLessonActivitySubmissionCommand,
): Promise<ReviewLessonActivitySubmissionResult> {
  const handle = beginOperation({
    useCase: "academy.review-lesson-activity-submission",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const submission = await findSubmissionById(command.id);
  if (!submission) {
    const error = { code: "academy.lesson_activity_submissions.not_found", message: `Entrega "${command.id}" não encontrada.` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const updated = await updateSubmissionReview(command.id, {
    reviewStatus: command.reviewStatus,
    reviewFeedback: command.reviewFeedback ?? null,
    reviewScore: command.reviewScore ?? null,
    reviewedBy: command.actorId,
  });

  endOperation(handle, { success: true });
  return { success: true, data: updated };
}
