import { beforeEach, describe, expect, it, vi } from "vitest";

const listUsers = vi.fn();
vi.mock("@venore/plugin-sdk/auth", () => ({
  listUsers: (...args: unknown[]) => listUsers(...args),
}));

const findSubmissionsByActivity = vi.fn();
vi.mock("./store", () => ({
  findSubmissionsByActivity: (...args: unknown[]) => findSubmissionsByActivity(...args),
}));

describe("listLessonActivitySubmissionsForActivity", () => {
  beforeEach(() => {
    listUsers.mockReset();
    findSubmissionsByActivity.mockReset();
  });

  it("resolves actor name/email from the user directory", async () => {
    findSubmissionsByActivity.mockResolvedValue([
      { id: "submission-1", activityId: "activity-1", actorId: "actor-1", reviewStatus: "pending" },
    ]);
    listUsers.mockResolvedValue({ success: true, data: [{ id: "actor-1", name: "Maria", email: "maria@example.test" }] });

    const { listLessonActivitySubmissionsForActivity } = await import("./service");
    const result = await listLessonActivitySubmissionsForActivity({ activityId: "activity-1" });

    expect(result).toEqual({
      success: true,
      data: [
        {
          id: "submission-1",
          activityId: "activity-1",
          actorId: "actor-1",
          reviewStatus: "pending",
          actorName: "Maria",
          actorEmail: "maria@example.test",
        },
      ],
    });
  });

  it("falls back to null name/email when the user directory lookup fails", async () => {
    findSubmissionsByActivity.mockResolvedValue([
      { id: "submission-1", activityId: "activity-1", actorId: "actor-1", reviewStatus: "pending" },
    ]);
    listUsers.mockResolvedValue({ success: false, error: { code: "auth.users.error", message: "boom" } });

    const { listLessonActivitySubmissionsForActivity } = await import("./service");
    const result = await listLessonActivitySubmissionsForActivity({ activityId: "activity-1" });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data[0]).toMatchObject({ actorName: null, actorEmail: null });
  });
});
