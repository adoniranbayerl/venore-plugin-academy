import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { reviewLessonActivitySubmission } from "./service";
import type { ReviewLessonActivitySubmissionInput, ReviewLessonActivitySubmissionResult } from "./types";

export async function reviewLessonActivitySubmissionHandler(
  input: ReviewLessonActivitySubmissionInput,
): Promise<ReviewLessonActivitySubmissionResult> {
  if (input.id.trim().length === 0) {
    return {
      success: false,
      error: { code: "academy.lesson_activity_submissions.invalid_id", message: "id não pode ser vazio." },
    };
  }

  if (input.reviewStatus !== "approved" && input.reviewStatus !== "needs_revision" && input.reviewStatus !== "rejected") {
    return {
      success: false,
      error: {
        code: "academy.lesson_activity_submissions.invalid_review_status",
        message: 'reviewStatus precisa ser "approved", "needs_revision" ou "rejected".',
      },
    };
  }

  // reviewFeedback deixou de ser obrigatório em needs_revision/rejected (era exigido aqui antes)
  // — a página nova por aluno (admin/academy/courses/[id]/enrolled/[studentActorId]) corrige com
  // nota+status e conversa de verdade (features/messages/), não mais um campo de texto livre
  // sobrescrito a cada revisão. O painel antigo por atividade (activity-submissions-panel.tsx)
  // continua exigindo preenchimento, só que client-side (disabled do botão) — nada quebra lá.

  if (input.reviewScore !== undefined && (!Number.isInteger(input.reviewScore) || input.reviewScore < 0 || input.reviewScore > 10)) {
    return {
      success: false,
      error: {
        code: "academy.lesson_activity_submissions.invalid_review_score",
        message: "reviewScore precisa ser um número inteiro entre 0 e 10.",
      },
    };
  }

  const authz = await authorizeActor("academy.courses.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return reviewLessonActivitySubmission({ ...input, actorId: authz.actorId });
}
