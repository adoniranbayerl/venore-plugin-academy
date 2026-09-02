import { beforeEach, describe, expect, it, vi } from "vitest";

const findEnrollment = vi.fn();

vi.mock("./enrollment-store", () => ({
  findEnrollment: (...args: unknown[]) => findEnrollment(...args),
  findEnrollmentsByActor: vi.fn(),
  findEnrollmentsByCourse: vi.fn(),
  insertEnrollment: vi.fn(),
}));

describe("isEnrolled", () => {
  beforeEach(() => {
    findEnrollment.mockReset();
  });

  it("is true when an enrollment row exists for the course/actor pair", async () => {
    findEnrollment.mockResolvedValue({ id: "enrollment-1", courseId: "course-1", actorId: "actor-1" });

    const { isEnrolled } = await import("./enrollment");
    expect(await isEnrolled("course-1", "actor-1")).toBe(true);
  });

  it("is false when no enrollment row exists", async () => {
    findEnrollment.mockResolvedValue(null);

    const { isEnrolled } = await import("./enrollment");
    expect(await isEnrolled("course-1", "actor-1")).toBe(false);
  });
});
