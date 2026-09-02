import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@venore/plugin-sdk/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const findCourseById = vi.fn();
const findEnrollment = vi.fn();
const insertEnrollment = vi.fn();

vi.mock("./store", () => ({
  findCourseById: (...args: unknown[]) => findCourseById(...args),
  findEnrollment: (...args: unknown[]) => findEnrollment(...args),
  insertEnrollment: (...args: unknown[]) => insertEnrollment(...args),
}));

describe("enrollStudent", () => {
  beforeEach(() => {
    findCourseById.mockReset();
    findEnrollment.mockReset();
    insertEnrollment.mockReset();
  });

  it("enrolls a student even when the course is restricted (self-enrollment disabled)", async () => {
    findCourseById.mockResolvedValue({ id: "course-1", status: "restricted" });
    findEnrollment.mockResolvedValue(null);
    insertEnrollment.mockResolvedValue({ id: "enrollment-1", courseId: "course-1", actorId: "student-1", enrolledBy: "teacher-1" });

    const { enrollStudent } = await import("./service");
    const result = await enrollStudent({ courseId: "course-1", studentActorId: "student-1", actorId: "teacher-1" });

    expect(result).toEqual({
      success: true,
      data: { id: "enrollment-1", courseId: "course-1", actorId: "student-1", enrolledBy: "teacher-1" },
    });
    expect(insertEnrollment).toHaveBeenCalledWith({ courseId: "course-1", actorId: "student-1", enrolledBy: "teacher-1" });
  });

  it("fails when the course does not exist", async () => {
    findCourseById.mockResolvedValue(null);

    const { enrollStudent } = await import("./service");
    const result = await enrollStudent({ courseId: "missing", studentActorId: "student-1", actorId: "teacher-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.enrollments.course_not_found", message: expect.any(String) },
    });
    expect(insertEnrollment).not.toHaveBeenCalled();
  });

  it("fails when the student is already enrolled", async () => {
    findCourseById.mockResolvedValue({ id: "course-1", status: "public" });
    findEnrollment.mockResolvedValue({ id: "enrollment-1", courseId: "course-1", actorId: "student-1" });

    const { enrollStudent } = await import("./service");
    const result = await enrollStudent({ courseId: "course-1", studentActorId: "student-1", actorId: "teacher-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.enrollments.already_enrolled", message: expect.any(String) },
    });
    expect(insertEnrollment).not.toHaveBeenCalled();
  });
});
