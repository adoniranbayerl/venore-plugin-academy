import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@venore/plugin-sdk/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const getMediaAsset = vi.fn();
vi.mock("@venore/plugin-sdk/media", () => ({
  getMediaAsset: (...args: unknown[]) => getMediaAsset(...args),
  MEDIA_ALLOWED_TYPES: {
    "image/png": { category: "image", maxSizeBytes: 8 * 1024 * 1024 },
    "application/pdf": { category: "document", maxSizeBytes: 20 * 1024 * 1024 },
    "audio/mpeg": { category: "audio", maxSizeBytes: 20 * 1024 * 1024 },
  },
}));

const isEnrolled = vi.fn();
vi.mock("../../../shared/enrollment", () => ({
  isEnrolled: (...args: unknown[]) => isEnrolled(...args),
}));

vi.mock("../../../shared/progress-hooks", () => ({ onProgressAdvanced: vi.fn() }));

const findLessonRequirements = vi.fn();
const isLessonAccessible = vi.fn();
vi.mock("../../../shared/lesson-progress", () => ({
  findLessonRequirements: (...args: unknown[]) => findLessonRequirements(...args),
  isLessonAccessible: (...args: unknown[]) => isLessonAccessible(...args),
}));

const findLessonActivityById = vi.fn();
const findLessonById = vi.fn();
const upsertLessonActivitySubmission = vi.fn();

vi.mock("./store", () => ({
  findLessonActivityById: (...args: unknown[]) => findLessonActivityById(...args),
  findLessonById: (...args: unknown[]) => findLessonById(...args),
  upsertLessonActivitySubmission: (...args: unknown[]) => upsertLessonActivitySubmission(...args),
}));

function setupHappyPath(overrides: { deliverableFormat: string }) {
  findLessonActivityById.mockResolvedValue({ id: "activity-1", lessonId: "lesson-1", deliverableFormat: overrides.deliverableFormat });
  findLessonById.mockResolvedValue({ id: "lesson-1", courseId: "course-1" });
  isEnrolled.mockResolvedValue(true);
  isLessonAccessible.mockResolvedValue(true);
  findLessonRequirements.mockResolvedValue({ activityEnabled: true });
}

describe("submitLessonActivity", () => {
  beforeEach(() => {
    getMediaAsset.mockReset();
    isEnrolled.mockReset();
    findLessonRequirements.mockReset();
    isLessonAccessible.mockReset();
    findLessonActivityById.mockReset();
    findLessonById.mockReset();
    upsertLessonActivitySubmission.mockReset();
  });

  it("fails when the activity does not exist", async () => {
    findLessonActivityById.mockResolvedValue(null);

    const { submitLessonActivity } = await import("./service");
    const result = await submitLessonActivity({ activityId: "missing", contentText: "ok", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.lesson_activities.not_found", message: expect.any(String) },
    });
  });

  it("fails when the actor is not enrolled", async () => {
    setupHappyPath({ deliverableFormat: "text" });
    isEnrolled.mockResolvedValue(false);

    const { submitLessonActivity } = await import("./service");
    const result = await submitLessonActivity({ activityId: "activity-1", contentText: "ok", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.enrollments.not_enrolled", message: expect.any(String) },
    });
  });

  it("fails when the activity requirement is not enabled", async () => {
    setupHappyPath({ deliverableFormat: "text" });
    findLessonRequirements.mockResolvedValue({ activityEnabled: false });

    const { submitLessonActivity } = await import("./service");
    const result = await submitLessonActivity({ activityId: "activity-1", contentText: "ok", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.lesson_activities.not_enabled", message: expect.any(String) },
    });
  });

  it("fails when a text activity is submitted without contentText", async () => {
    setupHappyPath({ deliverableFormat: "text" });

    const { submitLessonActivity } = await import("./service");
    const result = await submitLessonActivity({ activityId: "activity-1", mediaId: "media-1", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.lesson_activities.invalid_submission_content", message: expect.any(String) },
    });
  });

  it("fails when a media activity references a media id that does not exist", async () => {
    setupHappyPath({ deliverableFormat: "audio" });
    getMediaAsset.mockResolvedValue({ success: true, data: null });

    const { submitLessonActivity } = await import("./service");
    const result = await submitLessonActivity({ activityId: "activity-1", mediaId: "missing-media", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.lesson_activities.invalid_media", message: expect.any(String) },
    });
  });

  it("fails when the uploaded media type doesn't match the activity's deliverableFormat", async () => {
    setupHappyPath({ deliverableFormat: "audio" });
    getMediaAsset.mockResolvedValue({ success: true, data: { id: "media-1", contentType: "image/png" } });

    const { submitLessonActivity } = await import("./service");
    const result = await submitLessonActivity({ activityId: "activity-1", mediaId: "media-1", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.lesson_activities.media_type_mismatch", message: expect.any(String) },
    });
    expect(upsertLessonActivitySubmission).not.toHaveBeenCalled();
  });

  it("upserts the submission for a media activity when the uploaded type matches", async () => {
    setupHappyPath({ deliverableFormat: "audio" });
    getMediaAsset.mockResolvedValue({ success: true, data: { id: "media-1", contentType: "audio/mpeg" } });
    upsertLessonActivitySubmission.mockResolvedValue({ id: "submission-1", activityId: "activity-1", actorId: "actor-1" });

    const { submitLessonActivity } = await import("./service");
    const result = await submitLessonActivity({ activityId: "activity-1", mediaId: "media-1", actorId: "actor-1" });

    expect(result.success).toBe(true);
    expect(upsertLessonActivitySubmission).toHaveBeenCalledWith({
      activityId: "activity-1",
      actorId: "actor-1",
      contentText: null,
      mediaId: "media-1",
      initialReviewStatus: "pending",
    });
  });

  it("upserts the submission when everything checks out", async () => {
    setupHappyPath({ deliverableFormat: "text" });
    upsertLessonActivitySubmission.mockResolvedValue({ id: "submission-1", activityId: "activity-1", actorId: "actor-1" });

    const { submitLessonActivity } = await import("./service");
    const result = await submitLessonActivity({ activityId: "activity-1", contentText: "Minha entrega", actorId: "actor-1" });

    expect(result.success).toBe(true);
    expect(upsertLessonActivitySubmission).toHaveBeenCalledWith({
      activityId: "activity-1",
      actorId: "actor-1",
      contentText: "Minha entrega",
      mediaId: null,
      initialReviewStatus: "pending",
    });
  });

  it("accepts a bare completion (no contentText/mediaId) when deliverableFormat is 'none', auto-approved", async () => {
    setupHappyPath({ deliverableFormat: "none" });
    upsertLessonActivitySubmission.mockResolvedValue({ id: "submission-1", activityId: "activity-1", actorId: "actor-1" });

    const { submitLessonActivity } = await import("./service");
    const result = await submitLessonActivity({ activityId: "activity-1", actorId: "actor-1" });

    expect(result.success).toBe(true);
    expect(getMediaAsset).not.toHaveBeenCalled();
    expect(upsertLessonActivitySubmission).toHaveBeenCalledWith({
      activityId: "activity-1",
      actorId: "actor-1",
      contentText: null,
      mediaId: null,
      initialReviewStatus: "approved",
    });
  });
});
