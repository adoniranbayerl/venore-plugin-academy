import { beforeEach, describe, expect, it, vi } from "vitest";

const markSubmissionReviewSeen = vi.fn();

vi.mock("../../../shared/activity-review-store", () => ({
  markSubmissionReviewSeen: (...args: unknown[]) => markSubmissionReviewSeen(...args),
}));

import { markActivityReviewSeen } from "./service";

describe("markActivityReviewSeen", () => {
  beforeEach(() => {
    markSubmissionReviewSeen.mockReset();
  });

  it("marca a entrega do próprio ator como vista", async () => {
    markSubmissionReviewSeen.mockResolvedValue(undefined);

    const result = await markActivityReviewSeen({ activityId: "activity-1", actorId: "student-1" });

    expect(result).toEqual({ success: true, data: { activityId: "activity-1" } });
    expect(markSubmissionReviewSeen).toHaveBeenCalledWith("activity-1", "student-1");
  });
});
