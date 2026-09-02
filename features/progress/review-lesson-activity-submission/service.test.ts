import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@venore/plugin-sdk/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const findSubmissionById = vi.fn();
const updateSubmissionReview = vi.fn();

vi.mock("./store", () => ({
  findSubmissionById: (...args: unknown[]) => findSubmissionById(...args),
  updateSubmissionReview: (...args: unknown[]) => updateSubmissionReview(...args),
}));

describe("reviewLessonActivitySubmission", () => {
  beforeEach(() => {
    findSubmissionById.mockReset();
    updateSubmissionReview.mockReset();
  });

  it("fails when the submission does not exist", async () => {
    findSubmissionById.mockResolvedValue(null);

    const { reviewLessonActivitySubmission } = await import("./service");
    const result = await reviewLessonActivitySubmission({ id: "missing", reviewStatus: "approved", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.lesson_activity_submissions.not_found", message: expect.any(String) },
    });
    expect(updateSubmissionReview).not.toHaveBeenCalled();
  });

  it("approves the submission and records the reviewer", async () => {
    findSubmissionById.mockResolvedValue({ id: "submission-1" });
    updateSubmissionReview.mockResolvedValue({ id: "submission-1", reviewStatus: "approved" });

    const { reviewLessonActivitySubmission } = await import("./service");
    const result = await reviewLessonActivitySubmission({ id: "submission-1", reviewStatus: "approved", actorId: "actor-1" });

    expect(result.success).toBe(true);
    expect(updateSubmissionReview).toHaveBeenCalledWith("submission-1", {
      reviewStatus: "approved",
      reviewFeedback: null,
      reviewScore: null,
      reviewedBy: "actor-1",
    });
  });

  it("records a grade alongside the review when reviewScore is provided", async () => {
    findSubmissionById.mockResolvedValue({ id: "submission-1" });
    updateSubmissionReview.mockResolvedValue({ id: "submission-1", reviewStatus: "approved", reviewScore: 8 });

    const { reviewLessonActivitySubmission } = await import("./service");
    const result = await reviewLessonActivitySubmission({
      id: "submission-1",
      reviewStatus: "approved",
      reviewScore: 8,
      actorId: "actor-1",
    });

    expect(result.success).toBe(true);
    expect(updateSubmissionReview).toHaveBeenCalledWith("submission-1", {
      reviewStatus: "approved",
      reviewFeedback: null,
      reviewScore: 8,
      reviewedBy: "actor-1",
    });
  });
});
