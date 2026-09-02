import { beforeEach, describe, expect, it, vi } from "vitest";

const isEnrolled = vi.fn();
vi.mock("../../../shared/enrollment", () => ({
  isEnrolled: (...args: unknown[]) => isEnrolled(...args),
}));

describe("isEnrolled (use case)", () => {
  beforeEach(() => {
    isEnrolled.mockReset();
  });

  it("delegates to the shared enrollment check", async () => {
    isEnrolled.mockResolvedValue(true);

    const { isEnrolled: isEnrolledService } = await import("./service");
    const result = await isEnrolledService({ courseId: "course-1", actorId: "actor-1" });

    expect(result).toEqual({ success: true, data: true });
    expect(isEnrolled).toHaveBeenCalledWith("course-1", "actor-1");
  });
});
