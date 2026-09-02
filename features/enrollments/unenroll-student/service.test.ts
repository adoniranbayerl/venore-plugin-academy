import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@venore/plugin-sdk/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const findEnrollment = vi.fn();
const deleteEnrollmentById = vi.fn();

vi.mock("./store", () => ({
  findEnrollment: (...args: unknown[]) => findEnrollment(...args),
  deleteEnrollmentById: (...args: unknown[]) => deleteEnrollmentById(...args),
}));

describe("unenrollStudent", () => {
  beforeEach(() => {
    findEnrollment.mockReset();
    deleteEnrollmentById.mockReset();
  });

  it("fails when the student is not enrolled in the course", async () => {
    findEnrollment.mockResolvedValue(null);

    const { unenrollStudent } = await import("./service");
    const result = await unenrollStudent({ courseId: "course-1", studentActorId: "student-1", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.enrollments.not_found", message: expect.any(String) },
    });
    expect(deleteEnrollmentById).not.toHaveBeenCalled();
  });

  it("removes the enrollment without touching progress history", async () => {
    const enrollment = {
      id: "enrollment-1",
      courseId: "course-1",
      actorId: "student-1",
      enrolledAt: new Date(),
      enrolledBy: "actor-1",
    };
    findEnrollment.mockResolvedValue(enrollment);
    deleteEnrollmentById.mockResolvedValue(undefined);

    const { unenrollStudent } = await import("./service");
    const result = await unenrollStudent({ courseId: "course-1", studentActorId: "student-1", actorId: "actor-1" });

    expect(result).toEqual({ success: true, data: enrollment });
    expect(deleteEnrollmentById).toHaveBeenCalledWith("enrollment-1");
  });
});
