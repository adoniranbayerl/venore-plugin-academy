import { beforeEach, describe, expect, it, vi } from "vitest";

const authorizeActor = vi.fn();
vi.mock("@venore/plugin-sdk/rbac", () => ({
  authorizeActor: (...args: unknown[]) => authorizeActor(...args),
}));

const reviewLessonActivitySubmission = vi.fn();
vi.mock("./service", () => ({
  reviewLessonActivitySubmission: (...args: unknown[]) => reviewLessonActivitySubmission(...args),
}));

describe("reviewLessonActivitySubmissionHandler", () => {
  beforeEach(() => {
    authorizeActor.mockReset();
    reviewLessonActivitySubmission.mockReset();
  });

  it("fails on an invalid reviewStatus", async () => {
    const { reviewLessonActivitySubmissionHandler } = await import("./handler");
    const result = await reviewLessonActivitySubmissionHandler({
      id: "submission-1",
      // @ts-expect-error testando valor inválido de propósito
      reviewStatus: "archived",
    });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.lesson_activity_submissions.invalid_review_status", message: expect.any(String) },
    });
    expect(authorizeActor).not.toHaveBeenCalled();
  });

  // reviewFeedback deixou de ser obrigatório em needs_revision/rejected (sessão que adicionou o
  // sistema de mensagens, features/messages/) — a página nova por aluno corrige com nota+status e
  // conversa de verdade, não mais um campo de texto sobrescrito a cada revisão. O painel antigo
  // por atividade continua exigindo preenchimento, só que client-side.
  it("rejects a submission without feedback once authorized", async () => {
    authorizeActor.mockResolvedValue({ authorized: true, actorId: "actor-1" });
    reviewLessonActivitySubmission.mockResolvedValue({ success: true, data: { id: "submission-1", reviewStatus: "rejected" } });

    const { reviewLessonActivitySubmissionHandler } = await import("./handler");
    const result = await reviewLessonActivitySubmissionHandler({ id: "submission-1", reviewStatus: "rejected" });

    expect(result).toEqual({ success: true, data: { id: "submission-1", reviewStatus: "rejected" } });
    expect(reviewLessonActivitySubmission).toHaveBeenCalledWith(
      expect.objectContaining({ reviewStatus: "rejected", actorId: "actor-1" }),
    );
  });

  it("rejects a submission once authorized, with feedback", async () => {
    authorizeActor.mockResolvedValue({ authorized: true, actorId: "actor-1" });
    reviewLessonActivitySubmission.mockResolvedValue({ success: true, data: { id: "submission-1", reviewStatus: "rejected" } });

    const { reviewLessonActivitySubmissionHandler } = await import("./handler");
    const result = await reviewLessonActivitySubmissionHandler({
      id: "submission-1",
      reviewStatus: "rejected",
      reviewFeedback: "Ficou fora do tom combinado.",
    });

    expect(result).toEqual({ success: true, data: { id: "submission-1", reviewStatus: "rejected" } });
    expect(reviewLessonActivitySubmission).toHaveBeenCalledWith(
      expect.objectContaining({ reviewStatus: "rejected", reviewFeedback: "Ficou fora do tom combinado.", actorId: "actor-1" }),
    );
  });

  it("allows re-reviewing (no guard against changing an already-reviewed submission)", async () => {
    authorizeActor.mockResolvedValue({ authorized: true, actorId: "actor-1" });
    reviewLessonActivitySubmission.mockResolvedValue({ success: true, data: { id: "submission-1", reviewStatus: "approved" } });

    const { reviewLessonActivitySubmissionHandler } = await import("./handler");
    const result = await reviewLessonActivitySubmissionHandler({ id: "submission-1", reviewStatus: "approved", reviewScore: 9 });

    expect(result.success).toBe(true);
    expect(reviewLessonActivitySubmission).toHaveBeenCalledWith(
      expect.objectContaining({ reviewStatus: "approved", reviewScore: 9, actorId: "actor-1" }),
    );
  });
});
